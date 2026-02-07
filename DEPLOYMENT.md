# PRODUCTION DEPLOYMENT GUIDE

## BUILD ORDER (CRITICAL)

Follow this exact sequence to avoid dependency issues:

### Phase 1: Infrastructure Setup (Day 1-2)
1. **Provision AWS Resources**
   ```bash
   cd terraform
   terraform init
   terraform plan -var="db_password=SECURE_PASSWORD"
   terraform apply -var="db_password=SECURE_PASSWORD"
   ```
   - Creates RDS PostgreSQL, ElastiCache Redis, S3 buckets
   - Note down RDS endpoint and Redis endpoint from outputs

2. **Initialize Database Schema**
   ```bash
   # Connect to RDS
   psql -h <RDS_ENDPOINT> -U ontrip_user -d ontrip
   # Run schema
   \i backend/sql/init.sql
   ```

3. **Configure Secrets in AWS Secrets Manager**
   ```bash
   aws secretsmanager create-secret --name ontrip/prod/db \
     --secret-string '{"username":"ontrip_user","password":"SECURE_PASSWORD"}'
   
   aws secretsmanager create-secret --name ontrip/prod/jwt \
     --secret-string '{"secret":"GENERATE_RANDOM_256BIT_KEY"}'
   
   aws secretsmanager create-secret --name ontrip/prod/api-keys \
     --secret-string '{"viator":"KEY","getyourguide":"KEY"}'
   ```

### Phase 2: Backend Deployment (Day 3-5)
1. **Build Backend Docker Image**
   ```bash
   cd backend
   docker build -t ontrip-backend:v1 .
   ```

2. **Push to ECR**
   ```bash
   aws ecr create-repository --repository-name ontrip-backend
   docker tag ontrip-backend:v1 <AWS_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/ontrip-backend:v1
   docker push <AWS_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/ontrip-backend:v1
   ```

3. **Create ECS Task Definition**
   ```bash
   aws ecs register-task-definition --cli-input-json file://ecs-backend-task.json
   ```

4. **Deploy ECS Service**
   ```bash
   aws ecs create-service --cluster ontrip-cluster \
     --service-name ontrip-backend \
     --task-definition ontrip-backend:1 \
     --desired-count 2 \
     --launch-type FARGATE
   ```

5. **Verify Health**
   ```bash
   curl https://<ALB_DNS>/api/v1/health
   # Expected: {"status":"ok","database":"connected","redis":"connected"}
   ```

### Phase 3: Tier-1 Data Ingestion (Day 6-10)
1. **Manual Seed Data**
   ```bash
   # Insert destinations
   psql -h <RDS_ENDPOINT> -U ontrip_user -d ontrip -c \
     "INSERT INTO destinations (name, name_slug, country_code) VALUES 
      ('Paris', 'paris', 'FR'), 
      ('London', 'london', 'GB'),
      ('Tokyo', 'tokyo', 'JP');"
   ```

2. **Deploy Python Workers**
   ```bash
   cd workers
   docker build -t ontrip-workers:v1 .
   docker push <AWS_ACCOUNT>.dkr.ecr.us-east-1.amazonaws.com/ontrip-workers:v1
   
   aws ecs create-service --cluster ontrip-cluster \
     --service-name ontrip-workers \
     --task-definition ontrip-workers:1 \
     --desired-count 2
   ```

3. **Trigger First Ingestion**
   ```bash
   curl -X POST https://<ALB_DNS>/api/v1/admin/ingestion/trigger \
     -H "Authorization: Bearer <ADMIN_JWT>" \
     -H "Content-Type: application/json" \
     -d '{"tier": 2, "source_name": "viator"}'
   ```

4. **Monitor Ingestion**
   ```bash
   curl https://<ALB_DNS>/api/v1/admin/ingestion/status \
     -H "Authorization: Bearer <ADMIN_JWT>"
   ```

### Phase 4: Scoring Engine (Day 11-15)
1. **Verify Packages Ingested**
   ```bash
   psql -h <RDS_ENDPOINT> -U ontrip_user -d ontrip -c \
     "SELECT COUNT(*), source_tier FROM tour_packages GROUP BY source_tier;"
   ```

2. **Trigger Score Calculation**
   ```bash
   curl -X POST https://<ALB_DNS>/api/v1/admin/packages/recalculate-scores \
     -H "Authorization: Bearer <ADMIN_JWT>" \
     -d '{"package_ids": ["all"]}'
   ```

3. **Validate Scores**
   ```bash
   psql -h <RDS_ENDPOINT> -U ontrip_user -d ontrip -c \
     "SELECT id, name, value_score, trust_score, transparency_score, risk_score, overall_score 
      FROM tour_packages LIMIT 10;"
   ```

### Phase 5: Frontend Deployment (Day 16-20)
1. **Deploy to Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

2. **Configure Environment Variables in Vercel**
   - `NEXT_PUBLIC_API_URL`: https://<ALB_DNS>/api/v1
   - `NEXT_PUBLIC_SENTRY_DSN`: <SENTRY_DSN>

3. **Test Search Flow**
   - Visit https://<VERCEL_URL>/search?destination=paris
   - Verify packages load
   - Click package detail page
   - Verify scores display

### Phase 6: Additional Tiers (Day 21-30)
1. **Add GetYourGuide Integration**
   - Update API keys in Secrets Manager
   - Trigger ingestion for tier 2

2. **Add Tier 4 (Destination Specialists)**
   - Implement robots.txt compliance
   - Add scraping logic in workers
   - Test with 1-2 operators

3. **Monitor Data Quality**
   ```bash
   curl https://<ALB_DNS>/api/v1/admin/analytics \
     -H "Authorization: Bearer <ADMIN_JWT>"
   ```

### Phase 7: Hardening (Day 31-60)
1. **Enable CloudFront CDN**
   - Create CloudFront distribution
   - Point to ALB
   - Configure SSL certificate

2. **Setup Monitoring**
   - Enable CloudWatch alarms
   - Configure Sentry error tracking
   - Setup uptime monitoring (Pingdom/UptimeRobot)

3. **Load Testing**
   ```bash
   # Install k6
   k6 run load-test.js
   ```

4. **Security Audit**
   - Run OWASP ZAP scan
   - Review IAM permissions
   - Enable AWS GuardDuty

5. **Backup Strategy**
   - Verify RDS automated backups
   - Test restore procedure
   - Document recovery time objective (RTO)

## ENVIRONMENT SEPARATION

### Development
- Local Docker Compose
- SQLite or local PostgreSQL
- No real API keys
- Mock data

### Staging
- AWS RDS (db.t3.small)
- Limited API rate limits
- Subset of production data
- Same infrastructure as prod

### Production
- AWS RDS (db.t3.medium, Multi-AZ)
- Full API keys
- Rate limiting enabled
- CloudFront CDN
- Auto-scaling enabled

## SECRETS MANAGEMENT

**Never commit these to Git:**
- Database passwords
- JWT secrets
- API keys (Viator, GetYourGuide, etc.)
- AWS credentials
- Sentry DSN

**Storage locations:**
- AWS Secrets Manager (production)
- .env files (local development, gitignored)
- GitHub Secrets (CI/CD)

## MONITORING CHECKLIST

- [ ] CloudWatch dashboard created
- [ ] Alarms for 5xx errors (threshold: >10/min)
- [ ] Alarms for database CPU (threshold: >80%)
- [ ] Alarms for Redis memory (threshold: >90%)
- [ ] Sentry error tracking configured
- [ ] Log aggregation setup (CloudWatch Logs)
- [ ] Uptime monitoring (external service)
- [ ] Cost alerts configured

## SCALING STRATEGY

### Horizontal Scaling
- **Backend**: ECS auto-scaling based on CPU (target: 70%)
- **Workers**: Scale Celery workers based on queue depth
- **Database**: Read replicas for search queries

### Vertical Scaling
- **Database**: Upgrade to db.r5.large when >1M packages
- **Redis**: Upgrade to cache.r5.large when >10GB data

### Caching Strategy
- **Redis TTL**: 
  - Search results: 5 minutes
  - Package details: 1 hour
  - Operator info: 24 hours
- **CloudFront TTL**:
  - Static assets: 1 year
  - API responses: 0 (no cache)

## LEGAL COMPLIANCE CHECKLIST

- [ ] robots.txt compliance implemented
- [ ] Rate limiting on all scraped sources
- [ ] Attribution displayed on every package
- [ ] Affiliate links clearly marked
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Data usage disclaimers on comparison pages
- [ ] "No guarantee" disclaimer on all prices
- [ ] GDPR compliance (if EU users)
- [ ] CCPA compliance (if CA users)

## WHAT NOT TO BUILD IN MVP

**Do NOT build these until post-launch:**
- User accounts/authentication
- Saved searches
- Email notifications
- Mobile app
- Payment processing
- Direct booking
- Review submission
- Operator dashboard
- Multi-language support
- Currency conversion
- Social sharing
- Chatbot/AI assistant

**Focus on core comparison engine only.**

## DEPLOYMENT COMMANDS REFERENCE

### Start Production Stack
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### View Logs
```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f workers
```

### Database Backup
```bash
pg_dump -h <RDS_ENDPOINT> -U ontrip_user ontrip > backup_$(date +%Y%m%d).sql
```

### Database Restore
```bash
psql -h <RDS_ENDPOINT> -U ontrip_user ontrip < backup_20240101.sql
```

### Rollback Deployment
```bash
aws ecs update-service --cluster ontrip-cluster \
  --service ontrip-backend \
  --task-definition ontrip-backend:PREVIOUS_VERSION
```

## COST ESTIMATES (AWS us-east-1)

### MVP (Month 1-3)
- RDS db.t3.medium: $70/month
- ElastiCache cache.t3.medium: $50/month
- ECS Fargate (2 tasks): $60/month
- ALB: $20/month
- Data transfer: $10/month
- **Total: ~$210/month**

### Scale (10K daily users)
- RDS db.r5.large: $300/month
- ElastiCache cache.r5.large: $150/month
- ECS Fargate (5 tasks): $150/month
- CloudFront: $50/month
- **Total: ~$650/month**

## SUPPORT CONTACTS

- AWS Support: Enterprise plan required for production
- Sentry: Team plan for error tracking
- Vercel: Pro plan for frontend hosting

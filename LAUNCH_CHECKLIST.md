# PRODUCTION LAUNCH CHECKLIST

## PRE-LAUNCH (Complete ALL before going live)

### Infrastructure
- [ ] AWS account created with billing alerts
- [ ] Terraform applied successfully (RDS, Redis, S3)
- [ ] Database schema initialized (init.sql executed)
- [ ] Secrets stored in AWS Secrets Manager
- [ ] ECS cluster created with task definitions
- [ ] ALB configured with health checks
- [ ] CloudFront distribution created (optional for MVP)
- [ ] SSL certificate provisioned (ACM or Let's Encrypt)
- [ ] DNS configured (Route 53 or external)

### Backend
- [ ] Docker image built and pushed to ECR
- [ ] Environment variables configured in ECS
- [ ] Health endpoint returns 200 OK
- [ ] Database connection verified
- [ ] Redis connection verified
- [ ] API endpoints tested (Postman/curl)
- [ ] Rate limiting tested (should block after threshold)
- [ ] CORS configured for frontend domain only
- [ ] Sentry error tracking configured
- [ ] CloudWatch logs streaming

### Workers
- [ ] Python dependencies installed (requirements.txt)
- [ ] Celery worker Docker image built
- [ ] Celery beat scheduler running
- [ ] Redis connection verified
- [ ] Test ingestion job completed successfully
- [ ] Robots.txt compliance verified
- [ ] Rate limiting tested (2+ second delays)
- [ ] Error handling tested (retry logic works)

### Database
- [ ] All tables created (20+ tables from init.sql)
- [ ] Indexes created (check with \di in psql)
- [ ] Seed data inserted (destinations, operators)
- [ ] Automated backups enabled (7-day retention)
- [ ] Manual snapshot taken before launch
- [ ] Connection pooling configured (max 10 connections)
- [ ] Query performance tested (all queries < 100ms)

### Frontend
- [ ] Deployed to Vercel (or alternative)
- [ ] Environment variables configured (NEXT_PUBLIC_API_URL)
- [ ] API connection tested (search works)
- [ ] Package detail pages load correctly
- [ ] Scores display correctly
- [ ] Source attribution visible on all packages
- [ ] Affiliate links marked clearly
- [ ] Mobile responsive (test on iPhone/Android)
- [ ] SEO meta tags present (title, description, OG tags)
- [ ] Analytics configured (Google Analytics/Plausible)

### Legal & Compliance
- [ ] Privacy policy published at /privacy
- [ ] Terms of service published at /terms
- [ ] Disclaimer on all package pages ("prices not guaranteed")
- [ ] Attribution on all packages ("Data from [Source]")
- [ ] Affiliate disclosure ("We earn commission from bookings")
- [ ] robots.txt published at /robots.txt
- [ ] Contact page with email/form at /contact
- [ ] GDPR cookie consent (if EU traffic expected)

### Security
- [ ] All secrets in Secrets Manager (not in code)
- [ ] Database password is strong (20+ characters)
- [ ] JWT secret is random (256-bit)
- [ ] Admin API key is random (256-bit)
- [ ] SQL injection tested (parameterized queries only)
- [ ] XSS tested (all inputs sanitized)
- [ ] HTTPS enforced (HTTP redirects to HTTPS)
- [ ] Security headers configured (helmet.js)
- [ ] Rate limiting enabled (100 req/min per IP)
- [ ] Admin endpoints require authentication

### Monitoring
- [ ] CloudWatch dashboard created
- [ ] Alarms configured (5xx errors, CPU, memory)
- [ ] Sentry project created and DSN configured
- [ ] Uptime monitoring configured (Pingdom/UptimeRobot)
- [ ] Log aggregation working (CloudWatch Logs)
- [ ] Error notifications configured (email/Slack)
- [ ] Cost alerts configured ($100, $500, $1000 thresholds)

### Testing
- [ ] Unit tests pass (npm test in backend)
- [ ] Integration tests pass (API endpoints)
- [ ] Load test completed (k6 or Apache Bench)
- [ ] Search tested with 10+ destinations
- [ ] Package detail tested with 50+ packages
- [ ] Comparison tested with 3+ packages
- [ ] Edge cases tested (no results, invalid IDs)
- [ ] Error pages tested (404, 500)

### Data Quality
- [ ] At least 100 packages ingested
- [ ] At least 5 destinations covered
- [ ] All packages have scores calculated
- [ ] No packages with 0 confidence
- [ ] No packages with missing required fields
- [ ] Deduplication tested (no obvious duplicates)
- [ ] Manual review queue tested (approve/flag works)

### Performance
- [ ] API response time < 200ms (p95)
- [ ] Search response time < 500ms (p95)
- [ ] Package detail load time < 1s
- [ ] Database queries < 100ms (check with EXPLAIN)
- [ ] Redis cache hit rate > 80%
- [ ] Frontend Lighthouse score > 90
- [ ] Images optimized (WebP format, lazy loading)

## LAUNCH DAY

### Hour 0: Deploy
- [ ] Final code review completed
- [ ] Git tag created (v1.0.0)
- [ ] Backend deployed to ECS
- [ ] Workers deployed to ECS
- [ ] Frontend deployed to Vercel
- [ ] DNS updated (if needed)
- [ ] SSL certificate verified (green padlock)

### Hour 1: Smoke Tests
- [ ] Homepage loads
- [ ] Search works for 3 destinations
- [ ] Package detail pages load
- [ ] Scores display correctly
- [ ] Links to sources work
- [ ] No console errors in browser
- [ ] No 5xx errors in CloudWatch

### Hour 2-4: Monitor
- [ ] Check CloudWatch metrics every 30 minutes
- [ ] Check Sentry for errors
- [ ] Check uptime monitor status
- [ ] Test from different locations (VPN)
- [ ] Test on mobile devices

### Hour 4-24: Stabilize
- [ ] Monitor error rate (should be < 0.1%)
- [ ] Monitor response times (should be < 500ms)
- [ ] Check database CPU (should be < 50%)
- [ ] Check Redis memory (should be < 50%)
- [ ] Review user feedback (if any)

## POST-LAUNCH (First 7 Days)

### Daily Tasks
- [ ] Check CloudWatch dashboard
- [ ] Review Sentry errors
- [ ] Check ingestion logs (packages added)
- [ ] Review search analytics (popular destinations)
- [ ] Monitor costs (AWS billing dashboard)
- [ ] Respond to user feedback

### Week 1 Review
- [ ] Total users: _____
- [ ] Total searches: _____
- [ ] Total packages: _____
- [ ] Average response time: _____
- [ ] Error rate: _____
- [ ] AWS costs: $_____
- [ ] User feedback summary: _____

## ROLLBACK PLAN

If critical issues occur, execute in order:

### Step 1: Assess Severity
- **P0 (Critical)**: Site down, data loss, security breach → Rollback immediately
- **P1 (High)**: Major feature broken, high error rate → Rollback within 1 hour
- **P2 (Medium)**: Minor feature broken, low error rate → Fix forward
- **P3 (Low)**: Cosmetic issues → Fix in next release

### Step 2: Rollback Backend
```bash
aws ecs update-service --cluster ontrip-cluster \
  --service ontrip-backend \
  --task-definition ontrip-backend:PREVIOUS_VERSION
```

### Step 3: Rollback Frontend
```bash
cd frontend
vercel rollback
```

### Step 4: Rollback Database (if needed)
```bash
# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier ontrip-postgres-restored \
  --db-snapshot-identifier ontrip-snapshot-YYYYMMDD
```

### Step 5: Verify Rollback
- [ ] Health endpoint returns 200
- [ ] Search works
- [ ] No errors in Sentry
- [ ] Response times normal

### Step 6: Post-Mortem
- Document what went wrong
- Identify root cause
- Create fix plan
- Add tests to prevent recurrence

## SCALING TRIGGERS

### When to scale UP (vertical):
- Database CPU > 70% for 1 hour → Upgrade to db.r5.large
- Redis memory > 80% → Upgrade to cache.r5.large
- API latency p95 > 500ms → Upgrade ECS task size

### When to scale OUT (horizontal):
- Traffic > 1000 req/min → Add ECS tasks (auto-scaling)
- Worker queue depth > 1000 → Add worker tasks
- Database connections > 80% of max → Add read replica

### When to optimize:
- Cache hit rate < 70% → Review cache strategy
- Database slow queries → Add indexes
- High bandwidth costs → Enable CloudFront

## MAINTENANCE WINDOWS

### Weekly (Sunday 2-4 AM UTC)
- Database maintenance (AWS handles automatically)
- Clear old logs (> 30 days)
- Review and archive old package versions

### Monthly
- Review and update dependencies (npm audit, pip-audit)
- Review AWS costs and optimize
- Review Sentry errors and fix top 10
- Database vacuum and analyze

### Quarterly
- Security audit (OWASP ZAP scan)
- Load testing (simulate 10x traffic)
- Disaster recovery drill (test backup restore)
- Review and update documentation

## SUPPORT CONTACTS

### On-Call Rotation
- Primary: _____
- Secondary: _____
- Escalation: _____

### Vendor Support
- AWS Support: https://console.aws.amazon.com/support
- Vercel Support: support@vercel.com
- Sentry Support: support@sentry.io

### Emergency Procedures
1. Check #incidents Slack channel
2. Page on-call engineer
3. Create incident in PagerDuty/Opsgenie
4. Update status page
5. Communicate with users (Twitter/email)

## SUCCESS METRICS (30 Days)

- [ ] Uptime > 99.9% (< 45 minutes downtime)
- [ ] Error rate < 0.1%
- [ ] API response time p95 < 500ms
- [ ] Search response time p95 < 1s
- [ ] User satisfaction > 4/5 stars
- [ ] AWS costs < $500/month
- [ ] 1000+ packages ingested
- [ ] 10+ destinations covered
- [ ] 100+ daily active users

## WHAT NOT TO DO

**DO NOT**:
- Deploy on Friday (no weekend support)
- Deploy without testing
- Deploy without rollback plan
- Ignore error alerts
- Skip backups
- Commit secrets to Git
- Disable monitoring "temporarily"
- Scale prematurely (wait for data)
- Add features before fixing bugs
- Ignore user feedback

**REMEMBER**: It's better to launch with fewer features that work perfectly than many features that are buggy.

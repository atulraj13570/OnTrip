# ONTRIP PLATFORM - DOCUMENTATION INDEX

## START HERE

**New to the project?** Read in this order:

1. **[EXECUTIVE_SUMMARY.md](./EXECUTIVE_SUMMARY.md)** (5 min read)
   - What was built and why
   - Technology stack overview
   - Key architectural decisions
   - Cost estimates

2. **[ARCHITECTURE_DIAGRAM.md](./ARCHITECTURE_DIAGRAM.md)** (10 min read)
   - Visual system architecture
   - Data flow diagrams
   - Component interactions
   - Scaling strategy

3. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** (15 min read)
   - Complete file structure
   - Implementation order (Phase 1-5)
   - Environment setup
   - Docker commands

4. **[README.md](./README.md)** (5 min read)
   - Quick start guide
   - Core features
   - Project structure
   - Technology stack

---

## ARCHITECTURE & DESIGN

### Core Architecture
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** (50+ pages)
  - Complete system design document
  - Data model and tier system
  - Database schema
  - Scoring algorithms
  - Legal compliance
  - 30/60/90-day roadmap

- **[ARCHITECTURE_DECISIONS.md](./ARCHITECTURE_DECISIONS.md)** (30 min read)
  - Why PostgreSQL over MongoDB
  - Why ECS over EKS
  - Why Python workers instead of Node.js
  - Why NOT microservices
  - Why NOT real-time pricing
  - Scoring algorithm details
  - Deduplication logic
  - Caching strategy

### API Documentation
- **[API_SPECIFICATION.md](./API_SPECIFICATION.md)** (20 min read)
  - All endpoints with examples
  - Request/response formats
  - Authentication methods
  - Rate limiting rules
  - Error codes
  - Webhooks (future)

---

## DEPLOYMENT & OPERATIONS

### Deployment
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** (45 min read)
  - Build order (Phase 1-7)
  - AWS infrastructure setup (Terraform)
  - Database initialization
  - Backend deployment (ECS)
  - Workers deployment (Celery)
  - Frontend deployment (Vercel)
  - Environment separation (dev/staging/prod)
  - Secrets management
  - Monitoring setup
  - Cost estimates

### Launch Preparation
- **[LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md)** (30 min read)
  - Pre-launch checklist (100+ items)
  - Infrastructure verification
  - Security checklist
  - Legal compliance checklist
  - Testing checklist
  - Launch day procedures
  - Rollback plan
  - Post-launch monitoring

---

## DEVELOPMENT GUIDES

### Backend (Node.js/Express)
**Location**: `backend/`

**Key Files**:
- `src/index.ts` - Express app entry point
- `src/routes/` - API endpoints
  - `search.ts` - Search packages
  - `packages.ts` - Package CRUD
  - `operators.ts` - Operator info
  - `admin.ts` - Admin endpoints (NEW)
  - `ingestion.ts` - Worker submission (NEW)
- `src/services/ScoringEngine.ts` - Scoring algorithms
- `sql/init.sql` - Database schema (20+ tables)

**Setup**:
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Workers (Python/Celery)
**Location**: `workers/`

**Key Files**:
- `src/tasks.py` - Celery task definitions
- `src/ingestion/base_worker.py` - Base ingestion class
- `src/ingestion/robots_compliance.py` - Robots.txt checker
- `src/normalization/deduplication.py` - Duplicate detection
- `src/validation/validator.py` - Data quality checks

**Setup**:
```bash
cd workers
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
celery -A src.tasks worker --loglevel=info
```

### Frontend (Next.js/React)
**Location**: `frontend/`

**Key Files**:
- `src/app/page.tsx` - Homepage
- `src/app/search/` - Search results
- `src/app/packages/` - Package detail
- `src/app/methodology/` - Scoring explanation

**Setup**:
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

---

## INFRASTRUCTURE

### Docker
- **[docker-compose.yml](./docker-compose.yml)** - Local development
- **[docker-compose.prod.yml](./docker-compose.prod.yml)** - Production stack
- **[backend/Dockerfile](./backend/Dockerfile)** - Backend container
- **[workers/Dockerfile](./workers/Dockerfile)** - Workers container

### Terraform
- **[terraform/main.tf](./terraform/main.tf)** - AWS infrastructure
  - RDS PostgreSQL (Multi-AZ)
  - ElastiCache Redis
  - S3 buckets
  - ECS cluster
  - ALB

### NGINX
- **[nginx/nginx.conf](./nginx/nginx.conf)** - Reverse proxy config
  - Rate limiting
  - SSL/TLS
  - Security headers
  - Gzip compression

### CI/CD
- **[.github/workflows/deploy.yml](./.github/workflows/deploy.yml)** - GitHub Actions
  - Run tests
  - Build Docker images
  - Push to ECR
  - Deploy to ECS

---

## DATABASE

### Schema
**File**: `backend/sql/init.sql`

**Tables** (20+):
- `destinations` - Tour destinations
- `tour_operators` - Tour company info
- `tour_packages` - Main package data
- `tour_package_versions` - Price history
- `package_nights` - Detailed itinerary
- `package_activities` - Activities included
- `cancellation_policies` - Cancellation terms
- `ingestion_log` - Data ingestion tracking
- `search_queries` - User search analytics
- `manual_reviews` - Quality control
- `package_comparisons` - User comparisons
- `warnings` - Risk warnings

**Indexes**:
- `destination_id`, `operator_id`
- `overall_score DESC`
- `source_tier`
- Full-text search (GIN)

---

## CONFIGURATION

### Backend Environment
**File**: `backend/.env.example`

**Required**:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection
- `JWT_SECRET` - Authentication secret
- `VIATOR_API_KEY` - Viator API key
- `GETYOURGUIDE_API_KEY` - GetYourGuide API key

### Workers Environment
**File**: `workers/.env.example`

**Required**:
- `DATABASE_URL` - PostgreSQL connection
- `REDIS_URL` - Redis connection (Celery broker)
- `VIATOR_API_KEY` - Viator API key
- `RESPECT_ROBOTS_TXT` - Compliance flag (true)
- `MIN_REQUEST_DELAY_SECONDS` - Rate limit (2)

### Frontend Environment
**File**: `frontend/.env.example`

**Required**:
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

---

## MONITORING & DEBUGGING

### Health Checks
```bash
# Backend health
curl http://localhost:3001/api/v1/health

# Database connection
psql -h localhost -U ontrip_user -d ontrip -c "SELECT COUNT(*) FROM tour_packages;"

# Redis connection
redis-cli ping
```

### Logs
```bash
# Backend logs
docker-compose logs -f backend

# Worker logs
docker-compose logs -f workers

# Database logs
docker-compose logs -f postgres
```

### Monitoring
- **CloudWatch**: Metrics, logs, alarms
- **Sentry**: Error tracking
- **Uptime Monitor**: Health check monitoring

---

## TESTING

### Backend Tests
```bash
cd backend
npm test
```

### Worker Tests
```bash
cd workers
pytest
```

### Load Testing
```bash
k6 run load-test.js
```

---

## TROUBLESHOOTING

### Common Issues

**Backend won't start**:
- Check `DATABASE_URL` is correct
- Check `REDIS_URL` is correct
- Check port 3001 is not in use
- Check logs: `docker-compose logs backend`

**Workers not ingesting**:
- Check Celery worker is running
- Check Celery beat is running
- Check Redis connection
- Check API keys are valid
- Check logs: `docker-compose logs workers`

**Frontend can't connect to API**:
- Check `NEXT_PUBLIC_API_URL` is correct
- Check CORS is configured
- Check backend is running
- Check network connectivity

**Database connection errors**:
- Check PostgreSQL is running
- Check credentials are correct
- Check connection pool settings
- Check firewall rules

---

## LEGAL & COMPLIANCE

### Required Pages
- Privacy Policy: `/privacy`
- Terms of Service: `/terms`
- Contact: `/contact`
- Methodology: `/methodology`

### Disclaimers
- "Prices not guaranteed" on all packages
- "Data from [Source]" attribution
- "We earn commission" affiliate disclosure
- "Check source for latest price" on booking

### Compliance
- Respects robots.txt (enforced in code)
- Rate limiting (2+ seconds between requests)
- User-Agent identifies as bot
- No false claims ("best price", "guaranteed")

---

## COST ESTIMATES

### MVP (First 3 months)
- RDS db.t3.medium: $70/month
- ElastiCache cache.t3.medium: $50/month
- ECS Fargate (2 tasks): $60/month
- ALB: $20/month
- Vercel Pro: $20/month
- **Total**: ~$220/month

### Scale (10K daily users)
- RDS db.r5.large: $300/month
- ElastiCache cache.r5.large: $150/month
- ECS Fargate (5 tasks): $150/month
- CloudFront: $50/month
- **Total**: ~$650/month

---

## SUPPORT & CONTACT

### Documentation
- All docs in this repository
- API spec: [API_SPECIFICATION.md](./API_SPECIFICATION.md)
- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)

### Issues
- GitHub Issues for bugs
- GitHub Discussions for questions

### Community
- Slack: #ontrip-dev (if exists)
- Email: support@ontrip.com (replace with actual)

---

## QUICK COMMANDS

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Production Deployment
```bash
# Deploy infrastructure
cd terraform && terraform apply

# Deploy backend
cd backend && docker build -t ontrip-backend . && docker push ...

# Deploy workers
cd workers && docker build -t ontrip-workers . && docker push ...

# Deploy frontend
cd frontend && vercel --prod
```

### Database Operations
```bash
# Backup
pg_dump -h localhost -U ontrip_user ontrip > backup.sql

# Restore
psql -h localhost -U ontrip_user ontrip < backup.sql

# Check package count
psql -U ontrip_user -d ontrip -c "SELECT source_tier, COUNT(*) FROM tour_packages GROUP BY source_tier;"
```

---

## ROADMAP

### Phase 1 (Days 1-30): MVP
- ✅ PostgreSQL schema
- ✅ Backend API
- ✅ Python workers
- ✅ Scoring engine
- ✅ Frontend
- ⏳ Viator integration
- ⏳ Basic testing

### Phase 2 (Days 31-60): Expansion
- ⏳ GetYourGuide integration
- ⏳ Klook integration
- ⏳ Review aggregation
- ⏳ Comparison UI
- ⏳ Beta testing (5 users)

### Phase 3 (Days 61-90): Polish
- ⏳ Tier 1 partnership
- ⏳ Landing page & blog
- ⏳ Load testing
- ⏳ Security audit
- ⏳ Public launch

---

## WHAT'S NOT INCLUDED (Post-MVP)

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

---

**Built with engineering discipline. Designed for trust.**

**Last Updated**: 2024-01-01
**Version**: 1.0.0
**Status**: Production-Ready

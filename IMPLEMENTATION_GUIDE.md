# ONTRIP - COMPLETE IMPLEMENTATION GUIDE

## PROJECT STRUCTURE

```
ontrip/
├── .github/
│   └── workflows/
│       └── deploy.yml                 # CI/CD pipeline (GitHub Actions)
│
├── backend/                           # Node.js/Express API
│   ├── src/
│   │   ├── database/
│   │   │   └── db.ts                  # PostgreSQL connection pool
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts       # Global error handler
│   │   │   └── requestLogger.ts      # Request logging
│   │   ├── routes/
│   │   │   ├── health.ts             # Health check endpoint
│   │   │   ├── search.ts             # Search packages
│   │   │   ├── packages.ts           # Package CRUD
│   │   │   ├── operators.ts          # Operator info
│   │   │   ├── admin.ts              # Admin endpoints (NEW)
│   │   │   └── ingestion.ts          # Worker ingestion endpoint (NEW)
│   │   ├── services/
│   │   │   ├── PackageService.ts     # Business logic
│   │   │   └── ScoringEngine.ts      # Scoring algorithms
│   │   ├── types/
│   │   │   ├── express.d.ts          # Express type extensions
│   │   │   └── index.ts              # Shared types
│   │   ├── validation/
│   │   │   └── schemas.ts            # Zod validation schemas
│   │   └── index.ts                  # Express app entry
│   ├── sql/
│   │   └── init.sql                  # Database schema (20+ tables)
│   ├── .env.example                  # Environment template (NEW)
│   ├── Dockerfile                    # Backend container
│   ├── package.json
│   └── tsconfig.json
│
├── workers/                           # Python data ingestion (NEW)
│   ├── src/
│   │   ├── ingestion/
│   │   │   ├── base_worker.py        # Base ingestion class
│   │   │   └── robots_compliance.py  # Robots.txt checker
│   │   ├── normalization/
│   │   │   └── deduplication.py      # Duplicate detection
│   │   ├── validation/
│   │   │   └── validator.py          # Data quality checks
│   │   └── tasks.py                  # Celery task definitions
│   ├── .env.example                  # Worker environment (NEW)
│   ├── Dockerfile                    # Worker container (NEW)
│   └── requirements.txt              # Python dependencies (NEW)
│
├── frontend/                          # Next.js/React app
│   ├── src/
│   │   ├── app/
│   │   │   ├── methodology/          # Scoring explanation
│   │   │   ├── packages/             # Package detail pages
│   │   │   ├── search/               # Search results
│   │   │   ├── layout.tsx            # Root layout
│   │   │   └── page.tsx              # Homepage
│   │   ├── components/               # React components
│   │   ├── lib/                      # Utilities & API client
│   │   ├── hooks/                    # Custom React hooks
│   │   └── types/                    # TypeScript types
│   ├── public/                       # Static assets
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── terraform/                         # Infrastructure as Code (NEW)
│   └── main.tf                       # AWS resources (RDS, Redis, S3)
│
├── nginx/                             # Reverse proxy config (NEW)
│   └── nginx.conf                    # Rate limiting, SSL, routing
│
├── docker-compose.yml                # Local development
├── docker-compose.prod.yml           # Production stack (NEW)
│
├── ARCHITECTURE.md                   # System design (50+ pages)
├── ARCHITECTURE_DECISIONS.md         # Design rationale (NEW)
├── DEPLOYMENT.md                     # Deployment guide (NEW)
├── LAUNCH_CHECKLIST.md               # Pre-launch checklist (NEW)
├── README.md                         # Quick start guide
│
└── package.json                      # Monorepo scripts
```

## IMPLEMENTATION ORDER

### Phase 1: Foundation (Days 1-5)
1. **Database Setup**
   ```bash
   cd backend/sql
   psql -U postgres -f init.sql
   ```
   - Creates 20+ tables
   - Sets up indexes and constraints
   - Enables extensions (uuid-ossp, pg_trgm)

2. **Backend API**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with database credentials
   npm run dev
   ```
   - Express server on port 3001
   - Health check at /api/v1/health
   - Search, packages, operators endpoints

3. **Test Backend**
   ```bash
   curl http://localhost:3001/api/v1/health
   # Expected: {"status":"ok","database":"connected"}
   ```

### Phase 2: Data Ingestion (Days 6-15)
1. **Python Workers Setup**
   ```bash
   cd workers
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with API keys
   ```

2. **Start Celery Worker**
   ```bash
   celery -A src.tasks worker --loglevel=info
   ```

3. **Start Celery Beat (Scheduler)**
   ```bash
   celery -A src.tasks beat --loglevel=info
   ```

4. **Trigger Manual Ingestion**
   ```bash
   curl -X POST http://localhost:3001/api/v1/admin/ingestion/trigger \
     -H "Content-Type: application/json" \
     -d '{"tier": 2, "source_name": "viator"}'
   ```

5. **Verify Ingestion**
   ```bash
   psql -U postgres -d ontrip -c "SELECT COUNT(*), source_tier FROM tour_packages GROUP BY source_tier;"
   ```

### Phase 3: Scoring Engine (Days 16-20)
1. **Calculate Scores**
   - Automatically triggered after ingestion
   - Or manually: POST /api/v1/admin/packages/recalculate-scores

2. **Verify Scores**
   ```bash
   psql -U postgres -d ontrip -c \
     "SELECT name, value_score, trust_score, transparency_score, risk_score, overall_score 
      FROM tour_packages LIMIT 10;"
   ```

### Phase 4: Frontend (Days 21-30)
1. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env.local
   # Edit NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
   npm run dev
   ```

2. **Test Search Flow**
   - Visit http://localhost:3000
   - Search for "Paris"
   - Click package detail
   - Verify scores display

### Phase 5: Production Deployment (Days 31-45)
1. **Provision AWS Infrastructure**
   ```bash
   cd terraform
   terraform init
   terraform apply -var="db_password=SECURE_PASSWORD"
   ```

2. **Deploy Backend to ECS**
   ```bash
   cd backend
   docker build -t ontrip-backend .
   # Push to ECR and deploy (see DEPLOYMENT.md)
   ```

3. **Deploy Workers to ECS**
   ```bash
   cd workers
   docker build -t ontrip-workers .
   # Push to ECR and deploy
   ```

4. **Deploy Frontend to Vercel**
   ```bash
   cd frontend
   vercel --prod
   ```

5. **Configure DNS**
   - Point domain to ALB (backend) or Vercel (frontend)
   - Enable SSL certificate

## KEY ENDPOINTS

### Public API
```
GET  /api/v1/health                              # Health check
GET  /api/v1/search?destination=paris            # Search packages
GET  /api/v1/packages/:id                        # Package details
GET  /api/v1/packages/:id/comparison?with_ids=   # Compare packages
GET  /api/v1/operators/:id                       # Operator info
```

### Admin API (Requires JWT)
```
POST /api/v1/admin/ingestion/trigger             # Trigger ingestion
GET  /api/v1/admin/ingestion/status              # Ingestion logs
POST /api/v1/admin/packages/manual-review        # Approve/flag package
GET  /api/v1/admin/analytics                     # Platform stats
POST /api/v1/admin/packages/recalculate-scores   # Recalculate scores
```

### Internal API (Workers only)
```
POST /api/v1/ingestion/packages                  # Submit normalized packages
POST /api/v1/ingestion/destinations              # Bulk insert destinations
```

## ENVIRONMENT VARIABLES

### Backend (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/ontrip
REDIS_URL=redis://host:6379/0
NODE_ENV=production
API_PORT=3001
JWT_SECRET=RANDOM_256BIT_KEY
VIATOR_API_KEY=your_key
GETYOURGUIDE_API_KEY=your_key
SENTRY_DSN=your_dsn
```

### Workers (.env)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/ontrip
REDIS_URL=redis://host:6379/0
VIATOR_API_KEY=your_key
GETYOURGUIDE_API_KEY=your_key
RESPECT_ROBOTS_TXT=true
MIN_REQUEST_DELAY_SECONDS=2
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.ontrip.com/api/v1
NEXT_PUBLIC_SENTRY_DSN=your_dsn
```

## DOCKER COMMANDS

### Local Development
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

### Production
```bash
# Start production stack
docker-compose -f docker-compose.prod.yml up -d

# Scale workers
docker-compose -f docker-compose.prod.yml up -d --scale workers=4

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

## DATABASE COMMANDS

### Backup
```bash
pg_dump -h localhost -U ontrip_user ontrip > backup_$(date +%Y%m%d).sql
```

### Restore
```bash
psql -h localhost -U ontrip_user ontrip < backup_20240101.sql
```

### Check Package Count
```bash
psql -U ontrip_user -d ontrip -c \
  "SELECT source_tier, COUNT(*) FROM tour_packages GROUP BY source_tier;"
```

### Check Stale Packages
```bash
psql -U ontrip_user -d ontrip -c \
  "SELECT COUNT(*) FROM tour_packages WHERE is_stale = true;"
```

## MONITORING

### Health Check
```bash
curl https://api.ontrip.com/api/v1/health
```

### Check Ingestion Status
```bash
curl https://api.ontrip.com/api/v1/admin/ingestion/status \
  -H "Authorization: Bearer YOUR_JWT"
```

### Check Analytics
```bash
curl https://api.ontrip.com/api/v1/admin/analytics \
  -H "Authorization: Bearer YOUR_JWT"
```

## TROUBLESHOOTING

### Backend won't start
- Check DATABASE_URL is correct
- Check REDIS_URL is correct
- Check port 3001 is not in use
- Check logs: `docker-compose logs backend`

### Workers not ingesting
- Check Celery worker is running
- Check Celery beat is running
- Check Redis connection
- Check API keys are valid
- Check logs: `docker-compose logs workers`

### Frontend can't connect to API
- Check NEXT_PUBLIC_API_URL is correct
- Check CORS is configured for frontend domain
- Check backend is running
- Check network connectivity

### Database connection errors
- Check PostgreSQL is running
- Check credentials are correct
- Check connection pool settings
- Check firewall rules (AWS security groups)

## COST ESTIMATES

### Development (Local)
- **Cost**: $0 (Docker Compose on laptop)

### Staging (AWS)
- RDS db.t3.small: $35/month
- ElastiCache cache.t3.small: $25/month
- ECS Fargate (1 task): $30/month
- **Total**: ~$90/month

### Production (AWS)
- RDS db.t3.medium: $70/month
- ElastiCache cache.t3.medium: $50/month
- ECS Fargate (2 tasks): $60/month
- ALB: $20/month
- Data transfer: $10/month
- **Total**: ~$210/month

### Scale (10K daily users)
- RDS db.r5.large: $300/month
- ElastiCache cache.r5.large: $150/month
- ECS Fargate (5 tasks): $150/month
- CloudFront: $50/month
- **Total**: ~$650/month

## NEXT STEPS

1. **Read ARCHITECTURE.md** - Understand system design
2. **Read ARCHITECTURE_DECISIONS.md** - Understand trade-offs
3. **Read DEPLOYMENT.md** - Understand deployment process
4. **Read LAUNCH_CHECKLIST.md** - Pre-launch tasks
5. **Start coding** - Follow implementation order above

## SUPPORT

- **Documentation**: See ARCHITECTURE.md
- **Issues**: GitHub Issues
- **Email**: support@ontrip.com (replace with actual)
- **Slack**: #ontrip-dev (if team channel exists)

---

**Built with engineering discipline. Designed for trust.**

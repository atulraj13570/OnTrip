# SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           ONTRIP PLATFORM ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 14 (Vercel)                                │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐    │  │
│  │  │  Homepage  │  │   Search   │  │  Package   │  │Methodology │    │  │
│  │  │            │  │   Results  │  │   Detail   │  │   Page     │    │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘    │  │
│  │                                                                       │  │
│  │  - TailwindCSS styling                                               │  │
│  │  - React Query for API calls                                         │  │
│  │  - SEO optimized (meta tags, sitemap)                                │  │
│  │  - Mobile responsive                                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ HTTPS                                   │
│                                    ▼                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           LOAD BALANCER LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    AWS Application Load Balancer                      │  │
│  │                                                                        │  │
│  │  - SSL/TLS termination                                                │  │
│  │  - Health checks (/api/v1/health)                                     │  │
│  │  - Target group: ECS tasks                                            │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           REVERSE PROXY LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         NGINX (Optional)                              │  │
│  │                                                                        │  │
│  │  - Rate limiting (100 req/min per IP)                                 │  │
│  │  - Request routing                                                     │  │
│  │  - Security headers                                                    │  │
│  │  - Gzip compression                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    ▼                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            BACKEND API LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │              Node.js/Express API (ECS Fargate)                        │  │
│  │                                                                        │  │
│  │  PUBLIC ENDPOINTS:                                                     │  │
│  │  ├─ GET  /api/v1/health                                               │  │
│  │  ├─ GET  /api/v1/search                                               │  │
│  │  ├─ GET  /api/v1/packages/:id                                         │  │
│  │  ├─ GET  /api/v1/packages/:id/comparison                              │  │
│  │  └─ GET  /api/v1/operators/:id                                        │  │
│  │                                                                        │  │
│  │  ADMIN ENDPOINTS (JWT):                                                │  │
│  │  ├─ POST /api/v1/admin/ingestion/trigger                              │  │
│  │  ├─ GET  /api/v1/admin/ingestion/status                               │  │
│  │  ├─ POST /api/v1/admin/packages/manual-review                         │  │
│  │  ├─ GET  /api/v1/admin/analytics                                      │  │
│  │  └─ POST /api/v1/admin/packages/recalculate-scores                    │  │
│  │                                                                        │  │
│  │  INTERNAL ENDPOINTS (API Key):                                         │  │
│  │  ├─ POST /api/v1/ingestion/packages                                   │  │
│  │  └─ POST /api/v1/ingestion/destinations                               │  │
│  │                                                                        │  │
│  │  SERVICES:                                                             │  │
│  │  ├─ ScoringEngine (value, trust, transparency, risk)                  │  │
│  │  ├─ PackageService (CRUD, search, comparison)                         │  │
│  │  └─ DeduplicationEngine (duplicate detection)                         │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                          │                        │                          │
│                          ▼                        ▼                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA INGESTION LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │           Python Workers (Celery + ECS Fargate)                       │  │
│  │                                                                        │  │
│  │  CELERY BEAT (Scheduler):                                             │  │
│  │  ├─ Tier 1: Every 2 hours                                             │  │
│  │  ├─ Tier 2: Daily                                                      │  │
│  │  ├─ Tier 4: Every 3 days                                              │  │
│  │  └─ Cleanup: Daily                                                     │  │
│  │                                                                        │  │
│  │  CELERY WORKERS:                                                       │  │
│  │  ├─ ViatorIngestionWorker (Tier 2)                                    │  │
│  │  ├─ GetYourGuideWorker (Tier 2)                                       │  │
│  │  ├─ SpecialistScraperWorker (Tier 4)                                  │  │
│  │  └─ ScoreRecalculationWorker                                          │  │
│  │                                                                        │  │
│  │  COMPLIANCE:                                                           │  │
│  │  ├─ RobotsChecker (robots.txt parser)                                 │  │
│  │  ├─ Rate limiter (min 2 sec between requests)                         │  │
│  │  └─ User-Agent: OnTripBot/1.0                                         │  │
│  │                                                                        │  │
│  │  VALIDATION:                                                           │  │
│  │  ├─ Pydantic schema validation                                        │  │
│  │  ├─ Data quality checks                                               │  │
│  │  ├─ Deduplication logic                                               │  │
│  │  └─ Legal compliance checks                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│                                    │ POST /api/v1/ingestion/packages         │
│                                    ▼                                         │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA STORAGE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │  PostgreSQL 15 (RDS Multi-AZ)   │  │   Redis 7 (ElastiCache)         │  │
│  │                                  │  │                                  │  │
│  │  TABLES (20+):                   │  │  CACHE KEYS:                     │  │
│  │  ├─ destinations                 │  │  ├─ search:{dest}:{filters}     │  │
│  │  ├─ tour_operators               │  │  ├─ package:{id}                │  │
│  │  ├─ tour_packages                │  │  ├─ operator:{id}               │  │
│  │  ├─ tour_package_versions        │  │  └─ destination:{slug}          │  │
│  │  ├─ package_nights               │  │                                  │  │
│  │  ├─ package_activities           │  │  QUEUE:                          │  │
│  │  ├─ cancellation_policies        │  │  └─ celery (task queue)         │  │
│  │  ├─ ingestion_log                │  │                                  │  │
│  │  ├─ search_queries               │  │  TTL:                            │  │
│  │  ├─ manual_reviews               │  │  ├─ Search: 5 minutes           │  │
│  │  ├─ package_comparisons          │  │  ├─ Package: 1 hour             │  │
│  │  └─ warnings                     │  │  └─ Operator: 24 hours          │  │
│  │                                  │  │                                  │  │
│  │  INDEXES:                        │  │                                  │  │
│  │  ├─ destination_id               │  │                                  │  │
│  │  ├─ overall_score DESC           │  │                                  │  │
│  │  ├─ source_tier                  │  │                                  │  │
│  │  └─ full-text search (GIN)       │  │                                  │  │
│  │                                  │  │                                  │  │
│  │  BACKUP:                         │  │  PERSISTENCE:                    │  │
│  │  └─ Daily automated (7-day)      │  │  └─ AOF (1-second fsync)        │  │
│  └─────────────────────────────────┘  └─────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL DATA SOURCES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Tier 1  │  │  Tier 2  │  │  Tier 3  │  │  Tier 4  │  │  Tier 7  │    │
│  │ Partner  │  │Marketplace│  │   OTA    │  │Specialist│  │ Open Web │    │
│  │   APIs   │  │   APIs   │  │(Reference)│  │ Websites │  │ Listings │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│       │              │              │              │              │          │
│       │              │              │              │              │          │
│       ▼              ▼              ▼              ▼              ▼          │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                     Python Workers (Celery)                         │    │
│  │  - Fetch data (API or scrape)                                       │    │
│  │  - Normalize to canonical schema                                    │    │
│  │  - Validate with Pydantic                                           │    │
│  │  - Check robots.txt compliance                                      │    │
│  │  - Enforce rate limits                                              │    │
│  │  - Submit to backend API                                            │    │
│  └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                        MONITORING & OBSERVABILITY                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐            │
│  │   CloudWatch    │  │     Sentry      │  │  Uptime Monitor │            │
│  │                 │  │                 │  │                 │            │
│  │  - Metrics      │  │  - Errors       │  │  - Health check │            │
│  │  - Logs         │  │  - Performance  │  │  - Alerts       │            │
│  │  - Alarms       │  │  - Breadcrumbs  │  │  - Status page  │            │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘            │
│                                                                              │
│  ALARMS:                                                                     │
│  ├─ Backend 5xx errors >10/min → Page on-call                               │
│  ├─ Database CPU >80% → Scale up                                            │
│  ├─ Redis memory >90% → Flush cache                                         │
│  └─ ECS task failures >3 → Rollback deployment                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA FLOW                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Celery Beat triggers ingestion task (scheduled)                          │
│  2. Python Worker fetches data from source (API or scrape)                   │
│  3. Worker normalizes data to canonical schema                               │
│  4. Worker validates data with Pydantic                                      │
│  5. Worker POSTs to /api/v1/ingestion/packages                               │
│  6. Backend checks for duplicates (deduplication engine)                     │
│  7. Backend calculates scores (scoring engine)                               │
│  8. Backend inserts/updates PostgreSQL                                       │
│  9. Backend invalidates Redis cache                                          │
│  10. Frontend fetches from /api/v1/search (cached in Redis)                  │
│  11. User clicks package → Frontend fetches /api/v1/packages/:id             │
│  12. User clicks "Book Now" → Redirects to source (affiliate link)           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEPLOYMENT PIPELINE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  GitHub Push (main branch)                                                   │
│       │                                                                       │
│       ▼                                                                       │
│  GitHub Actions                                                              │
│       ├─ Run tests (npm test, pytest)                                        │
│       ├─ Build Docker images                                                 │
│       ├─ Push to AWS ECR                                                     │
│       ├─ Update ECS task definitions                                         │
│       └─ Deploy to ECS (rolling update)                                      │
│                                                                              │
│  Vercel (Frontend)                                                           │
│       ├─ Auto-deploy on push                                                 │
│       ├─ Build Next.js                                                       │
│       ├─ Deploy to edge network                                              │
│       └─ Invalidate CDN cache                                                │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

LEGEND:
  ┌─┐  Component/Service
  │    Data flow
  ▼    Direction
  ├─   List item
  └─   Last item
```

## KEY METRICS

- **Latency**: <500ms (p95) for search, <200ms for package detail
- **Throughput**: 100 req/min per IP (rate limited)
- **Availability**: 99.9% uptime target
- **Data Freshness**: Tier 1 (2h), Tier 2 (24h), Tier 4 (72h)
- **Cache Hit Rate**: >80% for search results
- **Error Rate**: <0.1% of requests

## SCALING STRATEGY

- **Horizontal**: Auto-scale ECS tasks based on CPU (target: 70%)
- **Vertical**: Upgrade RDS/Redis instance class when >80% utilization
- **Caching**: Redis for search results (5min TTL), package details (1h TTL)
- **CDN**: CloudFront for static assets (optional)
- **Read Replicas**: Add when database read load >70%

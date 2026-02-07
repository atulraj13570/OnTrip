# PRODUCTION ARCHITECTURE DECISIONS

## CRITICAL DESIGN CHOICES

### 1. Why Separate Python Workers Instead of Node.js?

**Decision**: Use Python (FastAPI + Celery) for data ingestion, not Node.js

**Rationale**:
- **BeautifulSoup/lxml**: Best-in-class HTML parsing (better than Cheerio)
- **Scrapy ecosystem**: Mature scraping libraries with robots.txt built-in
- **Data science libraries**: NumPy/Pandas for price normalization
- **Celery**: Production-proven task queue with cron scheduling
- **Separation of concerns**: Backend serves API, workers ingest data

**Trade-off**: Additional language in stack, but worth it for scraping quality

### 2. Why PostgreSQL Over MongoDB?

**Decision**: PostgreSQL 15 with JSONB, not MongoDB

**Rationale**:
- **Structured + flexible**: Relational schema with JSONB for raw data
- **ACID compliance**: Critical for pricing data integrity
- **Full-text search**: Built-in with tsvector (no Elasticsearch needed)
- **Joins**: Essential for package-operator-destination relationships
- **Mature tooling**: pgAdmin, pg_dump, replication

**Trade-off**: Slightly more complex schema design, but better data integrity

### 3. Why Redis Over RabbitMQ?

**Decision**: Redis for both caching AND task queue

**Rationale**:
- **Dual purpose**: Cache + Celery broker in one service
- **Simpler ops**: One less service to manage
- **Performance**: In-memory speed for search results
- **Persistence**: AOF mode for task queue durability

**Trade-off**: Less robust than RabbitMQ for queues, but sufficient for MVP

### 4. Why ECS Over EKS?

**Decision**: AWS ECS Fargate, not Kubernetes (EKS)

**Rationale**:
- **Simplicity**: No cluster management, no node scaling
- **Cost**: No EC2 instances to pay for when idle
- **AWS integration**: Native CloudWatch, Secrets Manager, ALB
- **Faster deployment**: No Helm charts, no kubectl complexity

**Trade-off**: Less portable than Kubernetes, but 80% cheaper to operate

### 5. Why Vercel for Frontend Instead of S3+CloudFront?

**Decision**: Vercel for Next.js, not self-hosted

**Rationale**:
- **Zero config**: Automatic builds, CDN, SSL
- **Edge functions**: API routes at edge for low latency
- **Preview deployments**: Every PR gets a URL
- **Cost**: Free tier covers MVP, $20/month for production

**Trade-off**: Vendor lock-in, but saves 40+ hours of DevOps work

### 6. Why NOT Use Microservices?

**Decision**: Monolithic backend API, not microservices

**Rationale**:
- **Team size**: 1-3 developers don't need microservices
- **Deployment complexity**: One service = one deployment
- **Latency**: No inter-service network calls
- **Debugging**: Single codebase, single log stream

**When to split**: Only when backend exceeds 50K lines or 10+ developers

### 7. Why Tier-Based Data Model?

**Decision**: 7-tier source hierarchy with confidence scores

**Rationale**:
- **Transparency**: Users see data quality explicitly
- **Legal protection**: Clear attribution prevents liability
- **Prioritization**: Tier 1 data always wins in deduplication
- **Scalability**: Add sources without schema changes

**Implementation**: `source_tier` column + `pricing_confidence` score

### 8. Why NOT Real-Time Pricing?

**Decision**: Cached pricing with freshness indicators, not real-time

**Rationale**:
- **Legal risk**: Can't guarantee real-time accuracy
- **API costs**: Real-time calls = $1000s/month in API fees
- **Rate limits**: Would hit API limits in hours
- **User expectation**: "Check source for latest price" disclaimer

**Refresh schedule**:
- Tier 1: Every 2 hours
- Tier 2: Daily
- Tier 4+: Weekly

### 9. Why NOT Build Direct Booking?

**Decision**: Redirect to source, never process payments

**Rationale**:
- **Liability**: Don't want to handle booking failures
- **Licensing**: Would need tour operator license in each country
- **Complexity**: Payment processing, refunds, customer service
- **Revenue model**: Affiliate commissions sufficient

**Monetization**: Affiliate links + sponsored placements

### 10. Why Manual Review Queue?

**Decision**: Human review for flagged packages, not full automation

**Rationale**:
- **Quality control**: Catch misleading descriptions
- **Legal compliance**: Verify attribution is correct
- **Trust building**: Manually approved = higher trust score
- **Edge cases**: Automation can't catch everything

**Trigger conditions**:
- Pricing confidence < 30%
- Suspicious language detected
- New operator (first 5 packages)
- User reports

## DATA FLOW ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA INGESTION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. Celery Beat (scheduler)
   └─> Triggers ingestion task every N hours

2. Python Worker (Celery)
   ├─> Checks robots.txt compliance
   ├─> Fetches data from source (API or scrape)
   ├─> Normalizes to canonical schema
   ├─> Validates with Pydantic
   └─> Sends to backend API

3. Backend API (Node.js)
   ├─> Receives normalized package
   ├─> Checks for duplicates (deduplication engine)
   ├─> Calculates scores (scoring engine)
   ├─> Inserts/updates PostgreSQL
   └─> Invalidates Redis cache

4. PostgreSQL
   ├─> Stores canonical package
   ├─> Stores raw data in JSONB
   ├─> Updates last_seen timestamp
   └─> Triggers is_stale recalculation

5. Redis
   └─> Caches search results for 5 minutes
```

## SCORING ALGORITHM DETAILS

### Value Score (0-100)
```
Base: 50
+ Cost per night vs market: -15 to +20
+ Hotel rating: -10 to +15
+ Meals included: 0 to +10
+ Activity value: 0 to +15
= Final: 0 to 100
```

### Transparency Score (0-100)
```
Base: 50
+ Complete itinerary: +15
+ Meal clarity: +10
+ Activity details: +10
+ Cancellation policy: +15
- Suspicious language: -20
+ Exclusions listed: +5
= Final: 0 to 100
```

### Trust Score (0-100)
```
Base: 50
+ Operator rating: -20 to +20
+ License verified: +15
+ Years in business: 0 to +10
+ Review count: 0 to +10
- Complaints: -30
= Final: 0 to 100
```

### Risk Score (0-100, lower is better)
```
Base: 0
+ Destination risk: 0 to +30
+ Non-refundable: +25
+ Data staleness: 0 to +10
+ Source tier: 0 to +10
+ No insurance: +15
= Final: 0 to 100
```

### Overall Score (0-100)
```
Overall = (Value × 0.25) + (Transparency × 0.25) + (Trust × 0.35) - (Risk × 0.15)
```

## DEDUPLICATION LOGIC

**Duplicate if ALL conditions met**:
1. Name similarity > 85% (Levenshtein distance)
2. Same destination
3. Duration within ±1 day
4. Price within ±20%

**Conflict resolution**:
- Keep package with lowest source_tier (Tier 1 > Tier 2 > ...)
- If same tier, keep highest pricing_confidence
- Store losing package in `tour_package_versions` table

## CACHING STRATEGY

### Redis Keys
```
search:{destination}:{filters_hash} → TTL: 5 minutes
package:{id} → TTL: 1 hour
operator:{id} → TTL: 24 hours
destination:{slug} → TTL: 7 days
```

### Cache Invalidation
- Package updated → Invalidate `package:{id}` and all `search:*` keys
- Operator updated → Invalidate `operator:{id}` and related packages
- Manual flush → Admin endpoint `/api/v1/admin/cache/flush`

## SECURITY MEASURES

### API Security
- Rate limiting: 100 req/min per IP (search: 10 req/min)
- JWT authentication for admin endpoints
- CORS: Whitelist frontend domain only
- SQL injection: Parameterized queries only
- XSS: Sanitize all user inputs

### Data Security
- Database: Encrypted at rest (AWS RDS encryption)
- Secrets: AWS Secrets Manager (never in code)
- SSL/TLS: Enforced on all connections
- Backups: Daily automated, 7-day retention

### Scraping Ethics
- Respect robots.txt (enforced in code)
- Rate limiting: Min 2 seconds between requests
- User agent: Identifies as bot with contact URL
- Cache: Store scraped data, don't re-scrape

## MONITORING & ALERTS

### CloudWatch Alarms
- Backend 5xx errors > 10/min → Page on-call
- Database CPU > 80% → Scale up
- Redis memory > 90% → Flush cache
- ECS task failures > 3 → Rollback deployment

### Sentry Error Tracking
- All uncaught exceptions
- Failed API calls
- Database connection errors
- Worker task failures

### Custom Metrics
- Packages ingested per hour
- Average scoring time
- Cache hit rate
- Search query latency (p95, p99)

## COST OPTIMIZATION

### Development
- Use Docker Compose locally (free)
- SQLite for unit tests (no RDS cost)
- Mock API responses (no API call costs)

### Staging
- db.t3.small (1/4 size of prod)
- Single ECS task (no auto-scaling)
- No CloudFront (direct ALB)
- Cost: ~$80/month

### Production
- Reserved instances for RDS (40% savings)
- Fargate Spot for workers (70% savings)
- CloudFront for static assets (reduce bandwidth)
- S3 Intelligent-Tiering (auto-archive old data)
- Target: <$500/month for 100K users

## DISASTER RECOVERY

### RTO (Recovery Time Objective): 4 hours
### RPO (Recovery Point Objective): 1 hour

**Backup Strategy**:
- RDS automated backups: Daily, 7-day retention
- Manual snapshots: Before each deployment
- Redis: AOF persistence (1-second fsync)
- Code: Git (GitHub as source of truth)

**Recovery Procedure**:
1. Restore RDS from latest snapshot (30 minutes)
2. Redeploy ECS tasks from last known good image (10 minutes)
3. Flush Redis cache (instant)
4. Run smoke tests (15 minutes)
5. Update DNS if needed (TTL: 5 minutes)

## SCALING THRESHOLDS

### When to scale UP:
- Database CPU > 70% sustained → Upgrade instance class
- Redis memory > 80% → Upgrade instance class
- API latency p95 > 500ms → Add ECS tasks
- Worker queue depth > 1000 → Add worker tasks

### When to scale OUT:
- Traffic > 10K req/min → Add ALB + multi-region
- Database writes > 5K/sec → Add read replicas
- Search queries > 100K/day → Add Elasticsearch

### When to refactor:
- Codebase > 50K lines → Split into services
- Team > 10 developers → Microservices
- Data > 10M packages → Partition database

# OnTrip Execution Roadmap & Development Guide

**Quick Reference for Developers**

## What to Build First (Priority Order)

### Week 1: Foundation
1. ✅ Database schema (PostgreSQL) - Already defined
2. ✅ Backend API scaffold - Express server running
3. ✅ TypeScript types - Complete interfaces defined
4. ✅ Validation schemas - Zod validation ready
5. ✅ Frontend scaffold - Next.js app structure ready

### Week 2: Core Search
1. **Backend**: Implement search endpoint with filters
   - Query builder for destination + price filters
   - Sorting (value_score, price, trust_score)
   - Pagination

2. **Frontend**: Build search UI
   - Destination input with autocomplete
   - Date pickers
   - Filter sidebar
   - Results grid with score cards

3. **Database**: Seed with test data
   - 10 sample destinations
   - 50-100 sample packages
   - 5-10 sample operators

### Week 3: Package Details & Scoring
1. **Backend**: Package detail endpoint
   - Fetch all related data (nights, activities, policies)
   - Calculate all 4 scores (use ScoringEngine)
   - Format response with scoring explanation

2. **Frontend**: Package detail page
   - Display all package information
   - Show itinerary breakdown
   - Display cancellation policy
   - Trust badges and data freshness

3. **Scoring**: Implement ScoringEngine
   - Value score calculation (market comparison)
   - Transparency score (information completeness)
   - Trust score (operator reputation)
   - Risk score (safety and policy)

### Week 4: Integration & Polish
1. **Backend**: Connect frontend to API
   - Verify CORS setup
   - Test all endpoints
   - Add error handling

2. **Frontend**: End-to-end testing
   - Search → Results → Detail flow
   - Mobile responsiveness
   - Loading states and error handling

3. **Ingestion**: First data source
   - Implement Viator API integration
   - Normalize and insert packages
   - Handle duplicate detection

---

## Implementation Checklist (MVP)

### Backend Tasks
- [ ] PostgreSQL schema validated and tested
- [ ] Express server running on port 3001
- [ ] Database connection pool working
- [ ] `/api/v1/health` endpoint responding
- [ ] Search endpoint returning paginated results
- [ ] Package detail endpoint with all related data
- [ ] Comparison endpoint for side-by-side view
- [ ] Zod validation on all inputs
- [ ] Error handling middleware
- [ ] Request logging

### Frontend Tasks
- [ ] Home page with search form
- [ ] Search results page with filters
- [ ] Package detail page with full breakdown
- [ ] Comparison modal (2-4 packages)
- [ ] Trust badges on all packages
- [ ] Data freshness indicators
- [ ] Mobile responsive design
- [ ] Error boundary with fallback UI
- [ ] Loading states on all pages
- [ ] Source attribution links

### Data Tasks
- [ ] PostgreSQL running in Docker
- [ ] Redis running in Docker
- [ ] Seed database with 100+ test packages
- [ ] Create 10-15 test operators
- [ ] Populate 5-10 test destinations
- [ ] Viator API integration (Tier 2)
- [ ] Data validation and normalization
- [ ] Duplicate detection working

### Testing Tasks
- [ ] Backend API tests (Jest)
- [ ] Frontend component tests
- [ ] End-to-end flow: search → detail
- [ ] Database connection tests
- [ ] Scoring algorithm validation
- [ ] Error handling for all paths

---

## Key Files to Implement

### Backend (Priority)
1. `src/routes/search.ts` - Search endpoint (PARTIAL)
2. `src/routes/packages.ts` - Detail endpoint (PARTIAL)
3. `src/services/PackageService.ts` - DB queries (PARTIAL)
4. `src/services/ScoringEngine.ts` - Scoring logic (PARTIAL)
5. `src/services/IngestionService.ts` - Data import (TODO)
6. `src/middleware/auth.ts` - JWT validation (TODO)

### Frontend (Priority)
1. `src/app/page.tsx` - Home search (DONE)
2. `src/app/search/page.tsx` - Results (PARTIAL)
3. `src/app/packages/[id]/page.tsx` - Detail (PARTIAL)
4. `src/app/methodology/page.tsx` - Trust explanation (DONE)
5. `src/components/TrustBadge.tsx` - Trust display (TODO)
6. `src/lib/api.ts` - API client (TODO)

---

## Data Requirements for MVP

### Minimum Viable Data
- **Destinations**: Paris, Rome, Bali, Thailand, Egypt, Machu Picchu, Iceland
- **Packages per destination**: 10-15
- **Operators per package**: 2-5
- **Days in package**: 5-14 days
- **Price range**: $1,000-$5,000 per person

### Sample Data Structure
```sql
-- Destinations
INSERT INTO destinations (name, name_slug, country_code)
VALUES 
  ('Paris', 'paris', 'FR'),
  ('Rome', 'rome', 'IT'),
  ('Bali', 'bali', 'ID');

-- Operators
INSERT INTO tour_operators (name, slug, website_url, avg_rating, trust_score)
VALUES
  ('Viator', 'viator', 'https://viator.com', 4.5, 85),
  ('GetYourGuide', 'getyourguide', 'https://getyourguide.com', 4.4, 82);

-- Packages (minimal example)
INSERT INTO tour_packages (
  external_id, source_tier, source_name, destination_id, operator_id,
  name, total_days, total_nights, price_per_person_total, currency
) VALUES
  ('viator_123', 2, 'Viator', destination_id, operator_id,
   '5-Day Paris Highlights Tour', 5, 4, 1200, 'USD');
```

---

## Common Development Issues & Solutions

### Issue: Database connection fails
**Solution**: 
```bash
# Check PostgreSQL is running
docker-compose ps

# Check credentials in backend/.env
# Default: postgresql://ontrip_user:ontrip_dev_password@localhost:5432/ontrip

# Restart services
docker-compose restart postgres
```

### Issue: API returns 404
**Solution**: 
- Check endpoint path matches exactly
- Verify service is running: `curl http://localhost:3001/api/v1/health`
- Check backend logs: `docker-compose logs backend`

### Issue: Frontend won't load data
**Solution**:
- Check `NEXT_PUBLIC_API_URL` in frontend env
- Open browser DevTools → Network tab
- Look for failed API calls and error messages

### Issue: Scores are all 50 (default)
**Solution**:
- ScoringEngine needs market baseline data
- Query database to verify packages have prices
- Check marketBaseline calculation in PackageService

---

## Performance Targets (MVP)

- **Search load time**: < 2 seconds
- **Package detail load**: < 1 second
- **Database queries**: < 100ms per query
- **API response size**: < 500KB
- **Frontend bundle size**: < 200KB (compressed)

---

## Security Checklist (MVP)

- [ ] No hardcoded secrets in code
- [ ] All `.env` files in `.gitignore`
- [ ] JWT validation on admin endpoints
- [ ] CORS configured to specific origin (not wildcard)
- [ ] Input validation with Zod on every endpoint
- [ ] SQL injection prevention via parameterized queries
- [ ] Error messages don't leak internal details
- [ ] Rate limiting on search (prevent abuse)
- [ ] HTTPS in production (configured in deployment)

---

## Testing Strategy (MVP)

### Unit Tests (10 min execution)
```bash
cd backend && npm test
# Test: ScoringEngine calculations
# Test: Zod validation schemas
# Test: PackageService queries (mocked)

cd frontend && npm test
# Test: Search form validation
# Test: Result card rendering
# Test: Score display formatting
```

### Integration Tests (5 min execution)
```bash
# Start services
docker-compose up -d

# Test: Search endpoint with real database
# Test: Package detail endpoint
# Test: Comparison endpoint

# Stop services
docker-compose down
```

### End-to-End Tests (manual)
1. Search for destination
2. View results with filters
3. Click on package
4. See full details with scores
5. Verify source link works
6. Check comparison feature

---

## Debugging Tips

### Backend Debugging
```typescript
// Add detailed logging
console.log(`[${new Date().toISOString()}] query:`, sql, params);

// Check database directly
docker exec ontrip-postgres psql -U ontrip_user -d ontrip \
  -c "SELECT COUNT(*) FROM tour_packages;"

// Test API manually
curl -s "http://localhost:3001/api/v1/search?destination=paris" | jq
```

### Frontend Debugging
```typescript
// React DevTools browser extension
// Next.js DevTools in terminal

// Manual testing
localStorage.setItem('debug', '*');
// Rerun and check console for detailed logs

// Test API client
fetch('/api/v1/search?destination=paris')
  .then(r => r.json())
  .then(console.log)
```

---

## Deployment Checklist

### Before Going to Staging
- [ ] All tests passing
- [ ] No hardcoded secrets
- [ ] Environment variables documented
- [ ] Database backups working
- [ ] Error tracking (Sentry) configured
- [ ] Logging aggregated
- [ ] HTTPS enabled

### Before Going to Production
- [ ] Load test with 1000 concurrent users
- [ ] Database replication verified
- [ ] Disaster recovery tested
- [ ] Security audit completed
- [ ] Legal/compliance review done
- [ ] Monitoring dashboards set up
- [ ] Support runbooks written

---

## Next Steps After MVP

### Phase 2 (Days 31-60): Expansion
1. Add GetYourGuide & Klook APIs
2. Implement review aggregation
3. Add comparison UI
4. Launch beta program
5. Gather user feedback

### Phase 3 (Days 61-90): Polish
1. Secure first Tier 1 partnership
2. Build admin dashboard
3. Implement analytics
4. Prepare for public launch
5. Refine UX based on feedback

See ARCHITECTURE.md Part 12 for detailed roadmap.

---

**Remember**: Build to learn. Iterate fast. Launch imperfect but real.

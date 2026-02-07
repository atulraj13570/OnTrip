# OnTrip Quick Reference Card

**Print this or keep it in your terminal.**

## 🚀 Start Services

```bash
# Start everything
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Stop everything
docker-compose down
```

## 🔌 Test Endpoints

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Search packages
curl "http://localhost:3001/api/v1/search?destination=paris"

# Get package details (replace ID)
curl http://localhost:3001/api/v1/packages/{id}

# Test frontend
open http://localhost:3000
```

## 🗄️ Database Commands

```bash
# Connect to PostgreSQL
docker exec -it ontrip-postgres psql -U ontrip_user -d ontrip

# Useful queries
SELECT COUNT(*) FROM tour_packages;
SELECT * FROM destinations;
SELECT COUNT(*) FROM tour_packages WHERE source_tier = 1;

# Exit
\q
```

## 📝 Environment Setup

**Backend** (`backend/.env`)
```
DATABASE_URL=postgresql://ontrip_user:ontrip_dev_password@postgres:5432/ontrip
REDIS_URL=redis://redis:6379
NODE_ENV=development
API_PORT=3001
```

**Frontend** (`frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## 🐛 Debugging

```bash
# Backend logs with tail
docker-compose logs -f backend | grep ERROR

# Frontend browser console
# Open DevTools → Console (F12)

# React DevTools
# Install Chrome extension: React Developer Tools

# Test API manually
node
> fetch('http://localhost:3001/api/v1/health').then(r => r.json()).then(console.log)
```

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# All tests
npm test
```

## 📊 Key Files

| File | Purpose | Status |
|------|---------|--------|
| ARCHITECTURE.md | Complete system design | ✅ Done |
| DEVELOPMENT_GUIDE.md | Week-by-week plan | ✅ Done |
| backend/src/index.ts | Express server | ✅ Ready |
| backend/sql/init.sql | PostgreSQL schema | ✅ Ready |
| backend/src/types/index.ts | TypeScript types | ✅ Complete |
| backend/src/services/ScoringEngine.ts | Scoring logic | ✅ Ready |
| frontend/src/app/page.tsx | Home search | ✅ Done |
| frontend/src/app/search/page.tsx | Results page | ✅ Done |
| frontend/src/app/packages/[id]/page.tsx | Package detail | ✅ Done |

## 🔄 Development Workflow

1. **Make a change**
   ```bash
   # Backend
   vim backend/src/routes/search.ts
   
   # Frontend
   vim frontend/src/app/page.tsx
   ```

2. **Service auto-reloads** (no restart needed)
   - Backend: `npm run dev` watches for changes
   - Frontend: Next.js dev server watches automatically

3. **Test the change**
   ```bash
   curl http://localhost:3001/api/v1/search?destination=paris
   open http://localhost:3000/search?destination=paris
   ```

4. **View logs if error**
   ```bash
   docker-compose logs backend | tail -20
   ```

## 📈 Performance Checks

```bash
# API response time
time curl -s http://localhost:3001/api/v1/search?destination=paris > /dev/null

# Database connection pool status
docker exec ontrip-postgres psql -U ontrip_user -d ontrip \
  -c "SELECT count(*) FROM pg_stat_activity;"

# Redis status
docker exec ontrip-redis redis-cli ping
```

## 🚨 Common Errors

| Error | Solution |
|-------|----------|
| `ECONNREFUSED localhost:5432` | PostgreSQL not running: `docker-compose up postgres` |
| `ECONNREFUSED localhost:3001` | Backend not running: `docker-compose up backend` |
| `404 Not Found` | Wrong endpoint path: check spelling exactly |
| `CORS error` | Frontend URL mismatch: verify `NEXT_PUBLIC_API_URL` |
| `Error: relation tour_packages does not exist` | Schema not loaded: run migrations |

## 📚 Architecture Overview

```
User Search
    ↓
Frontend (Next.js)
    ↓
API (Express)
    ↓
Search Service
    ↓
PostgreSQL (normalized data)
    ↓
Return packages with scores
    ↓
Frontend displays with trust badges
```

## 🎯 Next Milestone (Week 1)

- [ ] Seed database with 100 test packages
- [ ] Verify search endpoint works
- [ ] Check scoring engine calculations
- [ ] Test frontend search → detail flow
- [ ] Implement Viator API integration

## 💬 Decision Framework

When unsure, ask:

1. **Does it build trust?** → Include it
2. **Does it mislead users?** → Remove it
3. **Can we guarantee it?** → If no, add disclaimer
4. **Is it in MVP scope?** → ARCHITECTURE.md Part 12
5. **Can it wait 30 days?** → Yes? Add to Phase 2

---

**Everything you need is in this workspace. Start with ARCHITECTURE.md. Follow DEVELOPMENT_GUIDE.md. Build imperfectly but really. Ship fast. Iterate based on users.**

Good luck! 🚀

# OnTrip - Tour Package Comparison Platform

A transparent, honest tour package comparison engine built with modern, production-grade technology.

## 🚀 Quick Start (3 Steps)

1. **Run setup**: `setup-and-start.bat`
2. **Open browser**: http://localhost:3000
3. **Push to GitHub**: `setup-git.bat`

**See [GET_STARTED.md](./GET_STARTED.md) for detailed instructions.**

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running without Docker)
- Redis (if running without Docker)

### Local Development (Recommended)

**Step 1: Install dependencies**
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**Step 2: Start services**
```bash
# From project root
start-local.bat

# Or manually:
docker-compose up -d postgres redis
cd backend && npm run dev
cd ../frontend && npm run dev
```

**Step 3: Access the platform**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api/v1/health
- From phone (same WiFi): http://YOUR_IP:3000

**See [QUICKSTART.md](./QUICKSTART.md) for detailed instructions.**

## Project Structure

```
ontrip/
├── ARCHITECTURE.md          # Complete system design document
├── docker-compose.yml       # Docker services configuration
├── package.json             # Monorepo scripts
│
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── index.ts         # Express server entry
│   │   ├── middleware/      # Auth, error handling, logging
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── database/        # DB connections
│   │   ├── validation/      # Zod schemas
│   │   └── types/           # TypeScript interfaces
│   ├── sql/
│   │   └── init.sql         # PostgreSQL schema
│   └── package.json
│
└── frontend/                # Next.js/React app
    ├── src/
    │   ├── app/             # App Router pages
    │   ├── components/      # React components
    │   ├── lib/             # Utilities & API client
    │   ├── hooks/           # Custom React hooks
    │   └── types/           # TypeScript types
    ├── public/              # Static assets
    └── package.json
```

## Core Features (MVP)

- ✅ Tour package search with filters
- ✅ Package detail pages with scoring explanation
- ✅ Transparent scoring: value, trust, transparency, risk
- ✅ Data freshness indicators
- ✅ Source attribution with affiliate links
- ✅ Responsive design
- ✅ PostgreSQL database with full schema
- ✅ RESTful API with validation

## API Endpoints

### Public Endpoints (No Auth)
- `GET /api/v1/health` - Health check
- `GET /api/v1/search?destination=...` - Search packages
- `GET /api/v1/packages/:id` - Package details
- `GET /api/v1/packages/:id/comparison?with_ids=...` - Compare packages
- `GET /api/v1/operators/:id` - Operator details

### Admin Endpoints (JWT Required)
- `POST /api/v1/admin/packages/manual-review` - Approve/flag packages
- `GET /api/v1/admin/ingestion-status` - Check data ingestion jobs
- `GET /api/v1/admin/analytics` - View search analytics

## Technology Stack

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **Caching**: Redis
- **Validation**: Zod
- **Testing**: Jest
- **Deployment**: Docker

### Frontend
- **Framework**: Next.js 14
- **UI Library**: React 18
- **Styling**: TailwindCSS
- **State**: Zustand + React Query
- **Forms**: Native HTML
- **Deployment**: Vercel (optional)

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/ontrip
REDIS_URL=redis://localhost:6379
NODE_ENV=development
API_PORT=3001
JWT_SECRET=your-secret-key
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
```

## Database Schema

Key tables:
- `destinations` - Tour destinations
- `tour_operators` - Tour company info
- `tour_packages` - Main package data
- `package_nights` - Detailed itinerary
- `package_activities` - Activities included
- `cancellation_policies` - Cancellation terms
- `ingestion_log` - Data ingestion tracking
- `search_queries` - User search analytics
- `manual_reviews` - Quality control

See [ARCHITECTURE.md](./ARCHITECTURE.md) Part 6 for complete schema.

## Data Ingestion

The platform supports 7 tiers of data sources:

1. **Tier 1**: Owned/partnered agencies (API feeds)
2. **Tier 2**: Tour marketplaces (Viator, GetYourGuide, etc.)
3. **Tier 3**: Online travel agencies (Expedia, Booking - reference only)
4. **Tier 4**: Destination specialists (local operators)
5. **Tier 5**: Activity platforms (for value decomposition)
6. **Tier 6**: Review platforms (for trust scoring)
7. **Tier 7**: Open web (for market context)

Data freshness and confidence scores are automatically calculated based on tier.

## Scoring Engine

Every package gets 4 independent scores (0-100):

- **Value Score**: Cost vs market average + hotel quality + meals + activities
- **Transparency Score**: Clarity of terms, completeness of itinerary, no hidden fees
- **Trust Score**: Operator reviews, license status, years in business
- **Risk Score**: Destination safety, cancellation policy, data freshness

Overall ranking combines these with weights: value (25%), transparency (25%), trust (35%), risk (15%).

See [ARCHITECTURE.md](./ARCHITECTURE.md) Part 9 for detailed formulas.

## Legal & Compliance

- Respects `robots.txt` and Terms of Service
- Attribution required on every package listing
- Affiliate links clearly marked
- Privacy policy included
- Data usage disclaimers on every comparison
- No guarantee of package quality
- No guaranty of real-time data

See [ARCHITECTURE.md](./ARCHITECTURE.md) Part 11 for full compliance guidelines.

## Execution Roadmap

### Phase 1 (Days 1-30): MVP
- PostgreSQL schema ✓
- Viator API integration
- Basic scoring
- Search and detail pages

### Phase 2 (Days 31-60): Expansion
- Add GetYourGuide, Klook APIs
- Review aggregation
- Comparison UI
- Beta testing (5 users)

### Phase 3 (Days 61-90): Polish
- Secure Tier 1 partnership
- Landing page & blog
- Load testing
- Public launch

See [ARCHITECTURE.md](./ARCHITECTURE.md) Part 12 for detailed roadmap.

## Testing

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# All
npm test
```

## Deployment

### Docker
```bash
# Build images
docker-compose build

# Run containers
docker-compose up -d

# View logs
docker-compose logs -f
```

### AWS (ECS + RDS + Vercel)
See deployment docs (coming soon).

## Monitoring & Observability

- **Logs**: Winston logger in backend, browser console in frontend
- **Errors**: Sentry integration (configure in `.env`)
- **Metrics**: Prometheus endpoints (configure in backend)
- **Uptime**: Health check endpoint `/api/v1/health`

## Contributing

This is a reference implementation. See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Complete system design
- API specifications
- Database schema
- Scoring algorithms
- Compliance guidelines
- 30/60/90-day roadmap

## License

MIT

## Architecture Documentation

**Start here**: [ARCHITECTURE.md](./ARCHITECTURE.md)

This 50+ page document covers:
1. Product definition and problem statement
2. Data model and tier system
3. Tech stack justification
4. System architecture with data flows
5. Complete PostgreSQL schema
6. Backend API structure and validation
7. Data ingestion for all 7 tiers
8. Comparison and scoring engine (with formulas)
9. React/Next.js frontend design
10. UX rules preventing misleading claims
11. Legal and compliance considerations
12. Realistic 30/60/90-day execution roadmap

---

**Built with engineering discipline. Designed for trust.**

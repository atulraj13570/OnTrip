# OnTrip: Tour Package Comparison Platform
## Complete System Architecture & Design Document

**Project Status:** Architecture Phase  
**Version:** 1.0  
**Date:** February 7, 2026  
**Author:** Principal Software Architect  

---

## PART 1: PRODUCT DEFINITION

### 1.1 Problem Statement

The global tour package market is fragmented across thousands of agencies, tour operators, marketplaces, and booking platforms. Today's travelers face three core problems:

1. **Information Fragmentation**: There is no single, honest source of truth for tour package comparisons. Each marketplace optimizes for its own conversion, not for user clarity.

2. **Hidden Complexity**: Tour packages are marketed with attractive headlines but bury actual value in 50 pages of fine print. Price is the only visible signal, creating a "race to the bottom."

3. **Trust Deficit**: Users cannot distinguish between genuinely better packages and better marketing. Cancellation policies, meal quality, activity value, and hidden costs are opaque.

### 1.2 Solution: OnTrip

OnTrip is a **decision and comparison engine**, not a booking platform. It does NOT book trips, does NOT take commission, and does NOT replace travel agencies. Instead, it:

- **Collects** tour package data from verified sources (partners, marketplaces, APIs)
- **Standardizes** all packages into a single canonical schema
- **Compares** packages at the component level (nights, meals, activities, cancellation)
- **Scores** packages on value, transparency, trust, and risk
- **Displays** results with verifiable sources, data freshness, and confidence metrics
- **Directs** users to the source platform to book (affiliate or partnership model)

### 1.3 Target Users

**Primary:** Travelers aged 25-65, planning group tours, adventure tours, or cultural tours. Budget-conscious but willing to pay for quality when justified. Skeptical of marketing claims.

**Secondary:** Travel agents and tour operators who want to benchmark their own packages and understand market positioning.

**Tertiary:** Travel blogs and content creators who want to reference OnTrip data in their recommendations.

### 1.4 Value Proposition

**For Users:**
- Compare 50-500 packages for the same destination in minutes instead of days
- Understand what each extra dollar actually buys (hotel upgrade, meal quality, activity, etc.)
- See data freshness, source tier, and confidence level—no black boxes
- Identify packages offering the best risk-adjusted value, not just the cheapest
- Build trust through component-level transparency

**For the Business:**
- Affiliate revenue from booking redirects
- Partnership revenue from Tier 1 agencies providing guaranteed data feeds
- B2B licensing to travel agencies and corporate travel platforms
- Advertising from activity providers and complementary services (travel insurance, luggage, etc.)

### 1.5 What This Is NOT

- Not a booking site. Users exit to book on source platforms.
- Not a traditional travel agency. No commission from travel providers.
- Not real-time inventory. Many sources update daily or weekly, not second-by-second.
- Not a replacement for human travel advisors. Useful for self-directed research.
- Not guaranteed to have universal coverage. Some agencies will never partner or be scrapable.
- Not a guarantor of package quality. Scores are based on stated terms, not lived experience.

---

## PART 2: DATA MODEL & TIER SYSTEM

### 2.1 The 7-Tier Data Hierarchy

All data sources are classified into tiers based on recency, reliability, and access method:

**Tier 1: Owned, Partnered, Franchised**  
- Our own agencies or franchise partners providing direct data feeds
- API connections with near-live updates (hourly or better)
- SLA agreements on data accuracy and availability
- Examples: OnTrip-owned offices, franchised agents, acquisition targets
- Data freshness: 0-2 hours old
- Confidence: 95%+
- Coverage: 10-50 packages per partner

**Tier 2: Tour Marketplaces**  
- Multi-seller platforms that aggregate tours from many operators (GetYourGuide, Viator, etc.)
- API access (often with rate limits) or structured web scraping
- No guarantee of real-time pricing; updates may be daily to weekly
- Platform provides some curation and review moderation
- Examples: Viator, GetYourGuide, Klook, Airbnb Experiences
- Data freshness: 6-48 hours old
- Confidence: 80-90%
- Coverage: 100-10,000 packages per platform

**Tier 3: Online Travel Agencies (OTA Benchmarking)**  
- Major OTAs with holiday pages (Expedia, Booking.com, ToursByLocals, etc.)
- Scraping only from public pages; no API access
- Used for reference and market benchmarking, not primary ranking
- Highly marked as "reference tier" in UI
- Examples: Expedia, Booking.com, Agoda
- Data freshness: 1-3 days old
- Confidence: 70-75%
- Coverage: 100-1,000 packages per OTA

**Tier 4: Destination Specialists**  
- Local tour operators specialized in specific destinations (Peru trekking experts, Egypt Nile cruise specialists, etc.)
- Mix of API (if available) and web scraping
- Provide ground truth for itinerary realism and authentic local experiences
- May have low online presence but high local credibility
- Examples: Local DMCs, destination-specific agencies
- Data freshness: 1-7 days old
- Confidence: 85%+
- Coverage: 10-100 packages per specialist

**Tier 5: Activity & Experience Components**  
- Platforms that break down tour value into components (Airbnb, Civitatis, Withlocals, etc.)
- Used to decompose packages into activities, meals, and experiences
- Help calculate true value by comparing component-level pricing
- Examples: Airbnb Experiences, Civitatis, Activity.com, Restaurant platforms
- Data freshness: 1-3 days old
- Confidence: 75-80%
- Coverage: Millions of individual activities

**Tier 6: Reviews & Reputation**  
- Review platforms and reputation aggregators (Trustpilot, Google Reviews, TripAdvisor, etc.)
- API access where available, otherwise direct scraping
- Used to calculate trust score and flag problematic operators
- Warn about cancellation disputes, quality issues, customer complaints
- Examples: TripAdvisor, Trustpilot, Google Reviews, Feefo
- Data freshness: 0-7 days old
- Confidence: Variable (based on review count and verification)
- Coverage: Reviews for most major tour operators

**Tier 7: Open Web & SEO Context**  
- General web crawl, blog mentions, news articles, SEO pages
- Used only for market context, not for primary comparison
- Helps identify emerging packages and market trends
- No direct data extraction; contextual only
- Examples: Google News, travel blogs, tour operator websites
- Data freshness: 1-30 days old
- Confidence: 40-60%
- Coverage: Broad but unstructured

### 2.2 Data Versioning Strategy

Every piece of data carries metadata:

```json
{
  "id": "package_123_v5",
  "source_tier": 2,
  "source_name": "Viator",
  "source_url": "https://viator.com/tours/123",
  "data_version": 5,
  "first_seen": "2026-01-15T08:00:00Z",
  "last_updated": "2026-02-07T14:30:00Z",
  "next_refresh": "2026-02-08T14:30:00Z",
  "data_freshness_days": 0,
  "confidence_score": 0.88,
  "is_verified": false,
  "is_stale": false,
  "stale_after_days": 7,
  "changed_fields": ["price", "available_seats"],
  "previous_version": "package_123_v4"
}
```

---

## PART 3: CANONICAL DATA MODEL

Every tour package, regardless of source, is converted into this canonical schema:

### 3.1 Core Package Structure

```typescript
interface TourPackage {
  // Identity
  id: string;                          // Unique hash: md5(destination_name|tour_name|source_id)
  external_id: string;                 // Source's original ID
  name: string;                        // Standardized package name
  description: string;                 // Marketing description (max 500 chars)
  
  // Temporal & Versioning
  data_version: number;
  created_at: timestamp;
  updated_at: timestamp;
  next_refresh_at: timestamp;
  data_freshness_days: number;
  
  // Source Information
  source_tier: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  source_name: string;                 // "Viator", "GetYourGuide", etc.
  source_id: string;                   // Tour operator's ID
  source_url: string;                  // Original listing URL
  operator_id: string;                 // Foreign key to TourOperator
  
  // Destination & Duration
  destination: string;                 // Standardized destination name
  destination_code: string;            // ISO 3166-2 or custom code
  start_cities: string[];              // Where tour departs from
  end_cities: string[];                // Where tour ends
  total_nights: number;
  total_days: number;
  
  // Structure: Nights, Hotels, Meals, Activities
  nights: Night[];                     // Array of detailed night breakdowns
  accommodation: Accommodation;        // Aggregated hotel data
  meals: Meal[];                       // Each meal included
  activities: Activity[];              // Each activity included
  transport: Transport;                // Flights, buses, local transport
  
  // Pricing & Availability
  pricing: Pricing;
  availability: Availability;
  
  // Cancellation & Risk
  cancellation_policy: CancellationPolicy;
  inclusions: string[];                // What's included
  exclusions: string[];                // What's NOT included
  requirements: string[];              // Visas, vaccinations, fitness, etc.
  warnings: Warning[];                 // Risk flags
  
  // Scoring & Trust
  value_score: number;                 // 0-100, component value
  transparency_score: number;          // 0-100, clarity of terms
  trust_score: number;                 // 0-100, based on reviews & reputation
  risk_score: number;                  // 0-100, higher = riskier
  overall_rank: number;                // Composite ranking
  rank_percentile: number;             // Where this package ranks vs similar
  
  // Metadata
  group_size_min: number;
  group_size_max: number;
  age_restrictions: string;
  difficulty_level: string;            // Easy, Moderate, Strenuous
  travel_style: string[];              // ["Cultural", "Adventure", "Luxury"]
  
  // Quality Assurance
  confidence_score: number;            // Data quality 0-100
  is_verified: boolean;                // Manually verified?
  is_stale: boolean;                   // Data exceeds freshness threshold?
  manual_review_status: string;        // "pending", "approved", "flagged"
}
```

### 3.2 Nested Structures

#### Night
```typescript
interface Night {
  night_number: number;
  date: string;                        // YYYY-MM-DD
  city: string;
  hotel: {
    name: string;
    rating?: number;                   // 1-5 or 0-10
    room_type: string;                 // "Double", "Suite", etc.
    amenities: string[];
    coordinates?: {lat: number; lng: number}
  };
  meals: {
    breakfast?: string;                // "Included", "Available", "Not Included"
    lunch?: string;
    dinner?: string;
  };
  activity_summary?: string;
}
```

#### Accommodation (aggregated)
```typescript
interface Accommodation {
  total_nights: number;
  average_rating: number;
  hotel_types: string[];               // Mix of 3-star, 4-star, etc.
  room_types: string[];                // Mix of standards
  shared_vs_private: {
    percentage_shared: number;         // For group tours
    percentage_private: number;
  };
}
```

#### Meal
```typescript
interface Meal {
  sequence_number: number;
  meal_type: "breakfast" | "lunch" | "dinner";
  location: string;                    // City or hotel
  description: string;
  included: boolean;
  dietary_options: string[];           // Vegan, gluten-free, etc.
}
```

#### Activity
```typescript
interface Activity {
  sequence_number: number;
  name: string;
  type: string;                        // "Guided Tour", "Hiking", "Cultural", etc.
  duration_hours: number;
  location: string;
  description: string;
  included: boolean;
  difficulty: string;                  // Easy, Moderate, Strenuous
  estimated_market_value: number;      // Standalone cost if available
}
```

#### Transport
```typescript
interface Transport {
  domestic_flights?: {
    included: boolean;
    count: number;
    class: string;                     // Economy, Business, etc.
  };
  international_flights?: {
    included: boolean;
    count: number;
    class: string;
  };
  ground_transport: {
    type: string[];                    // "Bus", "Train", "Car", "Boat"
    total_hours: number;
    comfort_level: string;             // Economy, Standard, Premium
  };
  airport_transfers: boolean;
}
```

#### Pricing
```typescript
interface Pricing {
  currency: string;                    // ISO 4217
  per_person_base: number;             // Core package cost
  single_supplement?: number;          // Extra for single room
  taxes_fees: number;                  // All taxes & fees
  total_per_person: number;            // Base + taxes
  group_discounts?: {
    tier_size: number;
    discount_percentage: number;
  }[];
  child_discount?: number;             // If applicable
  price_date: timestamp;               // When price was captured
  price_type: "fixed" | "estimated";   // Guaranteed or subject to change
  payment_schedule: {
    deposit_amount: number;
    deposit_percentage: number;
    balance_due_days_before: number;
  };
  inclusions_value_breakdown?: {       // For trust: what costs what
    accommodation: number;
    meals: number;
    activities: number;
    transport: number;
    markup: number;
  };
}
```

#### Availability
```typescript
interface Availability {
  dates: {
    departure_date: string;            // YYYY-MM-DD
    next_departure_date?: string;
    departure_frequency: string;       // "Monthly", "Weekly", etc.
  }[];
  max_availability_days: number;       // How far ahead bookings open
  currently_available: boolean;
  available_seats: number;             // If known, else null
  group_size_min: number;
  group_size_max: number;
  lead_time_days_min: number;          // How far in advance to book
}
```

#### CancellationPolicy
```typescript
interface CancellationPolicy {
  is_refundable: boolean;
  policy_text: string;                 // Full terms
  cancellation_windows: {
    days_before_departure: number;
    refund_percentage: number;
  }[];
  free_cancellation_until: string;     // YYYY-MM-DD or "flexible"
  change_penalty: number;              // Cost to change dates/names
  risk_level: "low" | "medium" | "high"; // Extracted from policy
  insurance_required: boolean;
}
```

#### Warning
```typescript
interface Warning {
  type: string;                        // "health_risk", "legal_risk", "quality_issue", etc.
  severity: "low" | "medium" | "high";
  text: string;
  source: string;                      // From reviews, news, etc.
  date: timestamp;
}
```

### 3.3 Why This Schema

- **Decomposition**: Breaks packages into comparable components (nights, meals, activities)
- **Provenance**: Every field carries source tier, freshness, and confidence
- **Truthfulness**: Prices include all taxes; inclusions are explicit; risks are flagged
- **Versionability**: Multiple snapshots can be stored and compared
- **Scorability**: All fields are normalized for calculation
- **Extensibility**: New fields can be added without breaking existing data

---

## PART 4: TECH STACK JUSTIFICATION

### 4.1 Overall Architecture

```
Frontend Layer:
  - React 18 + Next.js 14 (App Router)
  - TailwindCSS + Shadcn/ui components
  - TypeScript for type safety
  - React Query for server state management
  - Zustand for client state

Backend Layer:
  - Node.js + Express.js (REST API)
  - TypeScript for consistency
  - Passport.js for authentication
  - Bull/BullMQ for job queues

Data Layer:
  - PostgreSQL 15+ (primary database)
  - Redis (caching, job queue, session store)
  - Elasticsearch (full-text search on packages)

Data Ingestion:
  - Puppeteer (headless browser scraping)
  - Axios + retry logic (API calls)
  - jsdom (lightweight HTML parsing)
  - Joi/Zod (validation)

Deployment:
  - Docker containers
  - Docker Compose for local development
  - AWS ECS for production
  - Vercel for frontend (optional alternative)
  - AWS RDS for PostgreSQL
  - AWS ElastiCache for Redis

Monitoring:
  - Prometheus + Grafana (metrics)
  - ELK Stack or CloudWatch (logs)
  - Sentry (error tracking)
```

### 4.2 Why These Choices

**Frontend: Next.js + React**
- Server-side rendering (SSR) for SEO (critical for comparison sites)
- App Router for modern file-based routing
- API Routes for backend integration during deployment
- Built-in image optimization
- Vercel deployment with auto-scaling
- TypeScript for frontend/backend consistency

**Backend: Node.js + Express**
- Single language across frontend and backend (TypeScript)
- Lightweight, fast, excellent for I/O-bound operations (scraping, API calls)
- Rich ecosystem for web scraping (Puppeteer, cheerio, jsdom)
- Excellent for async job processing (Bull/BullMQ)
- Easy deployment to Docker and AWS

**Database: PostgreSQL**
- JSONB columns for flexible package data structure
- Full-text search for tour descriptions and operator names
- Versioning support with table inheritance or temporal tables
- ACID compliance for data integrity
- Excellent for complex queries (comparison logic)
- Free and battle-tested at scale
- Time-series data support for price trends

**Caching: Redis**
- In-memory speed for frequent queries
- Session storage for authentication
- Job queue (BullMQ) for data ingestion
- Pub/Sub for real-time updates
- Automatic expiration (TTL) for stale data cleanup

**Search: Elasticsearch**
- Full-text search on destination, operator, activity descriptions
- Aggregation for filtering (by price range, trip duration, travel style)
- Real-time indexing as packages are added
- Scaled independently from primary database
- Critical for UX performance (sub-100ms search)

### 4.3 Why NOT Other Choices

**Why not NoSQL (MongoDB)?**
- Tours have deep relational structure (nights → hotels → meals → activities)
- Need complex joins for comparison and filtering
- Data consistency is critical (cancellations, pricing updates)
- SQL is more natural for this domain

**Why not GraphQL?**
- REST is sufficient for this use case
- REST caching (HTTP caching, CDN) is simpler
- Simpler to monitor and debug
- Can add GraphQL later if needed

**Why not Flask/Django?**
- Node.js is faster for this I/O-heavy workload
- JavaScript across frontend and backend reduces context switching
- Smaller team can move faster

**Why not Vue/Svelte?**
- React ecosystem is largest and most mature
- More developers available
- Shadcn/ui components are React-only

---

## PART 5: SYSTEM ARCHITECTURE

### 5.1 Data Flow (End-to-End)

```
1. DATA INGESTION LAYER (Runs on schedule, hourly to weekly)
   ├─ Tier 1 API Polling
   │  └─ Direct API calls to partner agencies
   │     └─ Validate with JSON schema
   │     └─ Store raw data in PostgreSQL
   │
   ├─ Tier 2 Marketplace APIs
   │  └─ Viator, GetYourGuide, Klook API calls
   │     └─ Rate-limited with exponential backoff
   │     └─ Store raw data
   │
   ├─ Tier 3 OTA Web Scraping
   │  └─ Puppeteer headless browser
   │     └─ Scrape Expedia, Booking.com holiday pages
   │     └─ Parse with cheerio (CSS selectors)
   │     └─ Store raw data
   │
   ├─ Tier 4-7 Scraping & APIs (as available)
   │  └─ Review platforms, activity platforms
   │     └─ Parse and aggregate
   │
   └─ Job Queue (BullMQ + Redis)
      └─ Schedule all ingestion tasks
      └─ Retry failed jobs with exponential backoff
      └─ Track job status in PostgreSQL

2. DATA NORMALIZATION LAYER
   ├─ Receive raw package data
   ├─ Validate against schema (Zod)
   ├─ Extract key fields
   ├─ Standardize destination names (fuzzy match against known destinations)
   ├─ Standardize currencies (store in USD equivalent)
   ├─ Parse natural language cancellation policies
   ├─ Extract package components (nights, meals, activities)
   ├─ Detect duplicates
   │  └─ Hash-based: name + destination + dates + price range
   │  └─ Fuzzy match for similar packages from same operator
   ├─ Enrich with Tier 6 data (reviews, reputation)
   ├─ Flag quality warnings
   └─ Insert into canonical schema in PostgreSQL

3. COMPARISON & SCORING LAYER
   ├─ Value Score
   │  └─ Cost per night / cost per activity / cost per meal
   │  └─ Compare against market median for similar packages
   │  └─ Adjust for comfort level and included amenities
   │
   ├─ Transparency Score
   │  └─ Check for hidden fees, conditions, exclusions
   │  └─ Verify clarity of cancellation policy
   │  └─ Check completeness of itinerary
   │
   ├─ Trust Score
   │  └─ Aggregate reviews from Tier 6 sources
   │  └─ Flag operator complaints, disputes
   │  └─ Company age, license status
   │
   ├─ Risk Score
   │  └─ Destination safety warnings
   │  └─ Operator cancellation history
   │  └─ Health/visa requirements
   │  └─ Political/environmental risks
   │
   └─ Overall Ranking
      └─ Weighted combination of above scores
      └─ Percentile ranking within similar packages

4. CACHE LAYER
   ├─ Redis cache for popular searches
   ├─ TTL: 6-24 hours depending on data tier
   ├─ Invalidate on new package added in that destination
   └─ Pre-compute rankings for top 100 destinations daily

5. SEARCH & API LAYER
   ├─ Elasticsearch indexes all packages
   ├─ Search by destination, dates, price range, travel style
   ├─ REST APIs serve frontend
   ├─ Filters: price, duration, difficulty, operator rating, etc.
   └─ Sort: value score, trust score, popularity, newest first

6. FRONTEND LAYER
   ├─ Server-side rendered with Next.js
   ├─ Search page (destination + dates → results)
   ├─ Results listing (paginated, filtered, sorted)
   ├─ Package detail page (full breakdown, scoring explanation, source info)
   ├─ Comparison modal (side-by-side 2-4 packages)
   ├─ Trust badges and disclaimers
   └─ Redirect to source booking platform

7. USER INTERACTIONS
   ├─ Search logs stored for analytics
   ├─ Click-through tracking (which packages users visit)
   ├─ Conversion tracking (affiliate links)
   └─ Feedback/reporting system
```

### 5.2 Communication Patterns

**Frontend → Backend:**
- REST endpoints for search, filtering, package details
- Server-side pagination for performance
- Compressed JSON responses with only necessary fields

**Backend → Data Sources:**
- HTTP/1.1 with persistent connections for efficiency
- Rate limiting respect (honor X-RateLimit headers)
- User-Agent headers identifying as bot (when allowed)
- Timeout: 30s for API calls, 60s for web scraping

**Backend → Cache:**
- Check Redis before querying database
- Cache hit probability > 60% for popular destinations
- TTL varies by data tier (Tier 1: 2 hours, Tier 2-3: 6-12 hours, Tier 4-7: 24 hours)

**Backend → Database:**
- Connection pooling (max 20 connections)
- Read replicas for high-traffic queries
- Batch writes for ingestion (insert 1000 packages at a time)

**Job Queue:**
- BullMQ workers process scraping/API tasks
- 10-20 concurrent workers to avoid overwhelming sources
- Exponential backoff on failure (5s, 15s, 60s, 5min, 30min, 3h)
- Dead-letter queue for permanently failed jobs

---

## PART 6: DATABASE SCHEMA (PostgreSQL)

### 6.1 Core Tables

```sql
-- Destinations (reference data)
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  name_slug VARCHAR(255) NOT NULL UNIQUE,
  country_code CHAR(2),
  region VARCHAR(100),
  coordinates POINT,
  description TEXT,
  popularity_rank INT,
  monthly_search_volume INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_name_slug (name_slug)
);

-- Tour Operators
CREATE TABLE tour_operators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  website_url VARCHAR(500),
  email VARCHAR(255),
  phone VARCHAR(50),
  country_code CHAR(2),
  company_registration VARCHAR(255),
  founded_year INT,
  employee_count INT,
  license_status VARCHAR(50), -- "verified", "unverified", "suspended"
  license_expiry TIMESTAMP,
  insurance_provider VARCHAR(255),
  insurance_amount DECIMAL(12, 2),
  avg_rating DECIMAL(3, 2),
  total_reviews INT,
  trust_score INT,  -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB, -- Custom fields
  INDEX idx_slug (slug),
  INDEX idx_rating (avg_rating)
);

-- Tour Packages (main entity)
CREATE TABLE tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(500) NOT NULL,
  source_tier SMALLINT NOT NULL, -- 1-7
  source_name VARCHAR(100) NOT NULL, -- "Viator", "GetYourGuide", etc.
  source_url VARCHAR(1000) NOT NULL,
  operator_id UUID REFERENCES tour_operators(id) ON DELETE SET NULL,
  destination_id UUID NOT NULL REFERENCES destinations(id),
  
  -- Basic Info
  name VARCHAR(500) NOT NULL,
  description TEXT,
  slug VARCHAR(500),
  travel_styles VARCHAR(255)[] DEFAULT '{}', -- Array: ["Adventure", "Cultural"]
  difficulty_level VARCHAR(50),
  
  -- Duration & Dates
  total_days INT NOT NULL,
  total_nights INT NOT NULL,
  min_departure_date DATE,
  max_departure_date DATE,
  departure_frequency VARCHAR(100),
  lead_time_min_days INT,
  
  -- Group Size
  group_size_min INT DEFAULT 1,
  group_size_max INT DEFAULT 200,
  
  -- Pricing
  currency VARCHAR(3) DEFAULT 'USD',
  price_per_person_base DECIMAL(10, 2) NOT NULL,
  price_per_person_total DECIMAL(10, 2) NOT NULL,
  single_supplement DECIMAL(10, 2),
  pricing_confidence DECIMAL(3, 2), -- 0.0-1.0
  inclusions_value_usd JSONB, -- {accommodation: 500, meals: 200, ...}
  
  -- Scores
  value_score INT, -- 0-100
  transparency_score INT, -- 0-100
  trust_score INT, -- 0-100
  risk_score INT, -- 0-100
  overall_score INT, -- 0-100
  rank_percentile INT, -- 1-100
  
  -- Data Quality
  data_version INT DEFAULT 1,
  data_tier_confidence INT, -- 0-100
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  manual_review_status VARCHAR(50), -- "pending", "approved", "flagged"
  manual_review_notes TEXT,
  
  -- Temporal
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_refresh_at TIMESTAMP,
  data_freshness_days INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - last_seen)
  ) STORED,
  is_stale BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - last_seen) > 7
  ) STORED,
  
  -- Raw & Canonical Data
  raw_data JSONB, -- Original from source
  canonical_data JSONB NOT NULL, -- Normalized according to schema
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  
  -- Indexes for performance
  INDEX idx_destination_id (destination_id),
  INDEX idx_operator_id (operator_id),
  INDEX idx_source_tier (source_tier),
  INDEX idx_overall_score (overall_score DESC),
  INDEX idx_last_seen (last_seen DESC),
  UNIQUE (source_name, external_id, min_departure_date)
);

-- Tour Package Versions (for tracking changes over time)
CREATE TABLE tour_package_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  price_per_person DECIMAL(10, 2),
  available_seats INT,
  cancellation_policy JSONB,
  inclusions_data JSONB,
  scores_at_version JSONB, -- {value: 75, transparency: 82, ...}
  snapshot_data JSONB, -- Full package state at this version
  changed_fields VARCHAR(255)[],
  change_reason VARCHAR(255),
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_id (package_id),
  INDEX idx_captured_at (captured_at DESC)
);

-- Package Nights (detail breakdown)
CREATE TABLE package_nights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  night_number INT NOT NULL,
  date DATE,
  city VARCHAR(255),
  hotel_name VARCHAR(500),
  hotel_rating DECIMAL(3, 2),
  room_type VARCHAR(100),
  amenities TEXT[],
  breakfast_included BOOLEAN,
  lunch_included BOOLEAN,
  dinner_included BOOLEAN,
  activity_summary TEXT,
  coordinates POINT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_id (package_id),
  UNIQUE (package_id, night_number)
);

-- Package Activities (what's included)
CREATE TABLE package_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  activity_number INT,
  name VARCHAR(500) NOT NULL,
  activity_type VARCHAR(100),
  city VARCHAR(255),
  duration_hours DECIMAL(4, 2),
  description TEXT,
  included BOOLEAN DEFAULT true,
  difficulty VARCHAR(50),
  market_value_usd DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_id (package_id)
);

-- Cancellation Policies (for versioning)
CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  is_refundable BOOLEAN,
  free_cancellation_until DATE,
  policy_text TEXT,
  cancellation_windows JSONB, -- [{days_before: 60, refund: 100}, ...]
  risk_level VARCHAR(50), -- "low", "medium", "high"
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_id (package_id)
);

-- Data Source Ingestion Log (for tracking what we've scraped)
CREATE TABLE ingestion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tier SMALLINT,
  source_name VARCHAR(100),
  ingestion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50), -- "success", "partial", "failed"
  packages_found INT,
  packages_inserted INT,
  packages_updated INT,
  packages_skipped INT,
  error_message TEXT,
  execution_time_seconds INT,
  raw_response_size_mb DECIMAL(10, 2),
  INDEX idx_source_date (source_name, ingestion_date DESC)
);

-- Search Analytics
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100), -- Anonymous user session ID
  query_destination VARCHAR(255),
  query_start_date DATE,
  query_end_date DATE,
  query_filters JSONB,
  results_returned INT,
  user_selected_package_id UUID REFERENCES tour_packages(id),
  user_clicked_source_url BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_destination_date (query_destination, created_at DESC)
);

-- Audit Trail for manual reviews
CREATE TABLE manual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  reviewer_id VARCHAR(100) NOT NULL,
  status VARCHAR(50), -- "approved", "flagged", "needs_edit"
  notes TEXT,
  issues_found JSONB, -- {pricing: "unclear", operator: "no_website", ...}
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_package_date (package_id, created_at DESC)
);

-- Package Comparisons (user-created)
CREATE TABLE package_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(100),
  package_ids UUID[] NOT NULL, -- Array of 2-4 packages
  comparison_name VARCHAR(255),
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  share_url VARCHAR(500) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 6.2 Indexes Strategy

**Most Critical (Query Performance):**
- `idx_destination_id` on tour_packages (filtering by destination)
- `idx_overall_score DESC` (sorting results)
- `idx_last_seen DESC` (finding fresh data)
- Full-text search index on description + name (PostgreSQL GIN index)

**Secondary:**
- `idx_source_tier` (data quality filtering)
- `idx_operator_id` (operator reputation queries)
- `idx_price_per_person_total` (price filtering)

**Analytical:**
- `idx_destination_date` on search_queries (understanding demand)
- `idx_source_date` on ingestion_log (monitoring data freshness)

### 6.3 Partitioning Strategy (Optional, at scale)

Once tour_packages table exceeds 10M rows, partition by destination_id:

```sql
CREATE TABLE tour_packages_partition_europe
  PARTITION OF tour_packages
  WHERE destination_id IN (SELECT id FROM destinations WHERE region = 'Europe');
```

---

## PART 7: BACKEND API STRUCTURE

### 7.1 Core REST Endpoints

```
PUBLIC ENDPOINTS (No Auth Required)
======================================

GET /api/v1/search
  Query Params:
    - destination (required): "Paris" or destination_id
    - start_date (optional): "2026-06-01"
    - end_date (optional): "2026-06-15"
    - duration_days (optional): 7
    - price_min (optional): 500
    - price_max (optional): 3000
    - travel_styles (optional): "Cultural,Adventure"
    - difficulty (optional): "Moderate"
    - sort (optional): "value_score", "trust_score", "price"
    - page: 1
    - limit: 20
  
  Response: {
    total_results: 847,
    page: 1,
    packages: [
      {
        id, name, destination, days, nights, price_per_person,
        value_score, trust_score, overall_score,
        source_tier, data_freshness_days,
        operator_name, operator_rating,
        quick_itinerary: "Rome 2 nights → Florence 3 nights → Venice 2 nights"
      }
    ],
    filters_available: {
      price_ranges: [{min: 500, max: 1000, count: 123}, ...],
      durations: [{days: 5, count: 45}, ...],
      travel_styles: [{name: "Cultural", count: 234}, ...]
    }
  }

GET /api/v1/packages/:id
  Response: {
    Full TourPackage object (canonical schema)
    Including:
      - All nights with hotel details
      - All activities with market values
      - Detailed pricing breakdown
      - Full cancellation policy
      - Scoring methodology
      - Source information with tier explanation
      - Data freshness with next refresh time
      - Operator details and reviews
      - Warnings and risk flags
  }

GET /api/v1/packages/:id/history
  Returns version history of price and availability changes
  Used to show price trends

GET /api/v1/packages/:id/comparison
  Query Params: with_ids=id1,id2,id3
  Returns side-by-side comparison of 2-4 packages

GET /api/v1/destinations
  Returns list of popular destinations with search volume

GET /api/v1/operators/:id
  Returns operator details: licenses, reviews, history

GET /api/v1/source-tiers
  Documentation endpoint explaining what each tier means

POST /api/v1/package-feedback
  User reports issues with a package (misleading price, etc.)
  Body: { package_id, issue_type, description }

POST /api/v1/search-favorites
  Anonymous user saves comparison for later
  Body: { package_ids: [...] }
  Returns: share_url


AUTHENTICATED ENDPOINTS (Admin/Partner)
========================================

POST /api/v1/admin/packages/manual-review
  Manually review and approve/flag packages
  Auth: Admin token

POST /api/v1/admin/tier1-data
  Tier 1 partner uploads new package data
  Auth: Partner API key
  Body: { packages: [...] }

GET /api/v1/admin/ingestion-status
  View status of data ingestion jobs
  Auth: Admin token

GET /api/v1/admin/analytics
  View search analytics, conversion rates, etc.
  Auth: Admin token
```

### 7.2 Data Validation (Zod Schemas)

```typescript
// Example validation for incoming package data
const TourPackageInputSchema = z.object({
  external_id: z.string().min(1),
  source_tier: z.number().min(1).max(7),
  source_name: z.string().min(1),
  source_url: z.string().url(),
  operator_id: z.string().uuid().optional(),
  
  name: z.string().min(5).max(500),
  destination: z.string().min(2),
  total_days: z.number().min(1).max(365),
  total_nights: z.number().min(0).max(365),
  
  price_per_person: z.number().positive(),
  currency: z.string().length(3),
  
  departure_dates: z.array(z.string().date()),
  
  cancellation_policy: z.object({
    is_refundable: z.boolean(),
    free_cancellation_until: z.string().date(),
  }),
  
  // Nested validation
  nights: z.array(z.object({
    night_number: z.number(),
    city: z.string(),
    hotel_name: z.string(),
    meals: z.object({
      breakfast: z.boolean(),
      lunch: z.boolean(),
      dinner: z.boolean(),
    }),
  })),
});
```

### 7.3 Authentication & Authorization

**Strategy:** JWT tokens + API keys for partners

```typescript
// Authentication flow
1. Users: Anonymous (session cookie + UUID)
   - Tracks search history and favorites
   - No login required
   
2. Admins: Email + password → JWT token (24h expiry)
   - Can approve/flag packages
   - View analytics
   
3. Tier 1 Partners: API key in header
   - Can upload package data
   - Rate limited (10 requests/minute)
   - IP whitelisting

// Middleware
app.use(authMiddleware);

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  const apiKey = req.headers["x-api-key"];
  
  if (token) {
    // Verify JWT
    const user = verifyJWT(token);
    req.user = user;
  } else if (apiKey) {
    // Verify API key
    const partner = findPartnerByApiKey(apiKey);
    req.partner = partner;
  } else {
    // Anonymous user
    req.sessionId = generateOrGetSessionId(req);
  }
  
  next();
}
```

### 7.4 Error Handling

```typescript
// Global error handler
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.errors,
    });
  }
  
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: "Package not found" });
  }
  
  if (err instanceof RateLimitError) {
    return res.status(429).json({ error: "Rate limit exceeded" });
  }
  
  // Log to Sentry
  captureException(err);
  
  return res.status(500).json({
    error: "Internal server error",
    request_id: req.id, // For tracking
  });
});
```

### 7.5 Caching Strategy

```typescript
// Redis caching for expensive queries
const searchPackages = async (destination, dates, filters) => {
  const cacheKey = `search:${destination}:${dates}:${hashFilters(filters)}`;
  
  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Query database
  const results = await db.query(buildSearchSQL(destination, dates, filters));
  
  // Cache for 6 hours (for Tier 2-3 data) or 2 hours (Tier 1)
  const ttl = destination_tier <= 1 ? 2 * 3600 : 6 * 3600;
  await redis.setex(cacheKey, ttl, JSON.stringify(results));
  
  return results;
};
```

### 7.6 Background Jobs (Bull/BullMQ)

```typescript
// Job queue for data ingestion
const ingestionQueue = new Queue("ingestion", {
  connection: redis,
});

// Schedule jobs
ingestionQueue.add(
  "tier1-polling",
  { partner_id: "partner123" },
  { repeat: { pattern: "0 * * * *" } } // Hourly
);

ingestionQueue.add(
  "tier2-scraping",
  { marketplace: "viator" },
  { repeat: { pattern: "0 */6 * * *" } } // Every 6 hours
);

// Process jobs
ingestionQueue.process("tier1-polling", async (job) => {
  try {
    const newPackages = await fetchFromTier1API(job.data.partner_id);
    await normalizeAndInsert(newPackages);
  } catch (error) {
    // Retry with exponential backoff
    throw error;
  }
});

ingestionQueue.on("failed", (job, err) => {
  logger.error(`Job ${job.id} failed: ${err.message}`);
  alerting.notify(`Data ingestion failed for ${job.data.marketplace}`);
});
```

---

## PART 8: DATA INGESTION (DETAILED)

### 8.1 Tier 1: Owned/Partnered Agencies

**When to Use:** Every 1-2 hours during business hours, daily overnight

**How it Works:**
1. Receive API credentials from partner
2. Make authenticated API call to partner endpoint
3. Validate response against Zod schema
4. Check for duplicates against existing packages
5. Normalize dates and prices
6. Insert into `tour_packages` table with `source_tier=1`

**Example Implementation:**
```typescript
async function ingestTier1(partnerId: string) {
  const partner = await db.query(
    "SELECT * FROM tier1_partners WHERE id = ?",
    [partnerId]
  );
  
  const apiUrl = partner.api_endpoint;
  const apiKey = partner.api_key;
  
  try {
    const response = await axios.get(apiUrl, {
      headers: { "X-API-Key": apiKey },
      timeout: 30000,
    });
    
    // Validate
    const validPackages = [];
    for (const rawPackage of response.data.packages) {
      const validated = TourPackageInputSchema.safeParse(rawPackage);
      if (validated.success) {
        validPackages.push(validated.data);
      } else {
        logger.warn(`Validation failed for ${rawPackage.id}`, validated.error);
      }
    }
    
    // Duplicate detection
    const deduplicated = await deduplicatePackages(validPackages);
    
    // Normalize and insert
    const normalized = deduplicated.map(normalizePackage);
    await db.insertBatch("tour_packages", normalized);
    
    // Log success
    await recordIngestionLog({
      source_tier: 1,
      source_name: partner.name,
      status: "success",
      packages_found: response.data.packages.length,
      packages_inserted: normalized.length,
    });
  } catch (error) {
    await recordIngestionLog({
      source_tier: 1,
      source_name: partner.name,
      status: "failed",
      error_message: error.message,
    });
    throw error;
  }
}
```

### 8.2 Tier 2: Marketplace APIs (Viator, GetYourGuide, Klook)

**When to Use:** Every 6 hours

**Rate Limits:** Respect X-RateLimit headers, use exponential backoff

**How it Works:**
1. Query marketplace API for tours by destination
2. Handle pagination
3. Extract pricing, dates, operator info
4. Validate and normalize
5. Enrich with operator name and slug
6. Insert with `source_tier=2`

**Example: Viator Integration**
```typescript
async function ingestViator() {
  const destinations = await getTopDestinations();
  
  for (const destination of destinations) {
    try {
      const tours = await viatorAPI.searchTours({
        destination_code: destination.viator_code,
        page_size: 1000,
      });
      
      for (const tour of tours) {
        const normalized = {
          source_tier: 2,
          source_name: "Viator",
          external_id: tour.tour_id,
          source_url: `https://viator.com/tours/${tour.tour_id}`,
          
          name: tour.title,
          destination: destination.name,
          total_days: tour.duration.days,
          total_nights: tour.duration.nights,
          price_per_person: tour.from_price,
          currency: tour.currency_code,
          
          departure_dates: tour.available_dates,
          cancellation_policy: parseViatorCancellation(tour.cancellation),
          
          operator_id: await findOrCreateOperator(tour.supplier_name),
          
          canonical_data: {
            nights: parseViatorItinerary(tour.itinerary),
            activities: parseViatorActivities(tour.highlights),
            transport: parseViatorTransport(tour.details),
          },
        };
        
        await db.insert("tour_packages", normalized);
      }
    } catch (error) {
      logger.error(`Viator ingestion failed for ${destination.name}`, error);
    }
  }
}
```

### 8.3 Tier 3: OTA Web Scraping (Expedia, Booking)

**When to Use:** Daily at 3 AM UTC

**Respect robots.txt:** Check and follow rules

**How it Works:**
1. Launch Puppeteer headless browser
2. Navigate to Expedia holiday pages
3. Wait for JavaScript to render
4. Parse with Cheerio (CSS selectors)
5. Extract tour names, prices, durations
6. Note: Less complete data than Tier 1-2
7. Mark as reference/benchmarking tier

**Example: Expedia Scraping**
```typescript
async function ingestExpedia() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Respect robots.txt
  const robotsAllowed = await checkRobotsAllowed("expedia.com", "/packages");
  if (!robotsAllowed) {
    logger.warn("Expedia robots.txt blocks scraping");
    return;
  }
  
  const destinations = ["paris", "rome", "bali"];
  
  for (const dest of destinations) {
    try {
      await page.goto(
        `https://www.expedia.com/Vacations-${dest}.d6.Vacation-Packages.html`,
        { waitUntil: "networkidle2", timeout: 30000 }
      );
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      const packages = [];
      $("div.package-item").each((i, el) => {
        const package_data = {
          name: $(el).find("h3.package-name").text().trim(),
          destination: dest,
          price: parseInt($(el).find("span.price").text().replace("$", "")),
          days: extractDays($(el).find("span.duration").text()),
          url: $(el).find("a.package-link").attr("href"),
        };
        
        packages.push(package_data);
      });
      
      // Insert with lower confidence score
      for (const pkg of packages) {
        const normalized = {
          source_tier: 3,
          source_name: "Expedia",
          external_id: generateHash(pkg.url),
          source_url: pkg.url,
          data_tier_confidence: 75,
          
          name: pkg.name,
          destination: dest,
          total_days: pkg.days,
          price_per_person: pkg.price,
          
          // Note: Limited detail from scraping
          canonical_data: {
            nights: [], // Would need to click and scrape individual pages
            activities: [],
          },
        };
        
        await db.insert("tour_packages", normalized);
      }
    } catch (error) {
      logger.error(`Expedia scraping failed for ${dest}`, error);
    }
  }
  
  await browser.close();
}
```

### 8.4 Tier 4-5: Specialists & Components

**Destination Specialists (Tier 4):**
- Manually discovered local operators
- Mix of API (if available) and targeted scraping
- Focus on authenticity, not coverage

**Activity Components (Tier 5):**
- Scrape Airbnb Experiences, Civitatis, Activity.com
- Use to compare package activities against standalone pricing
- Build pricing model: activity_market_value = standalone price
- Used to calculate value_score

```typescript
async function enrichPackageActivities(tourPackage) {
  // For each activity in package, find comparable standalone pricing
  
  for (const activity of tourPackage.activities) {
    // Search Civitatis API
    const civitatisTours = await civitatis.search({
      location: activity.location,
      keyword: activity.name,
      duration_hours: activity.duration_hours,
    });
    
    if (civitatisTours.length > 0) {
      // Take median price as market value
      const prices = civitatisTours.map((t) => t.price_per_person);
      activity.estimated_market_value = median(prices);
    }
  }
  
  // Recalculate value_score based on activity component values
  tourPackage.value_score = calculateValueScore(tourPackage);
}
```

### 8.5 Tier 6: Reviews & Reputation

**Sources:** TripAdvisor, Google Reviews, Trustpilot

**How it Works:**
1. Link each operator to review platforms
2. Scrape or API-fetch reviews
3. Calculate trust_score from review sentiment
4. Flag operators with high complaint rates
5. Store warnings (cancellation disputes, safety issues)

```typescript
async function ingestOperatorReviews(operatorId) {
  const operator = await db.query(
    "SELECT * FROM tour_operators WHERE id = ?",
    [operatorId]
  );
  
  // Get reviews from multiple platforms
  const tripAdvisorReviews = await tripAdvisor.getCompanyReviews(
    operator.trip_advisor_id
  );
  const trustpilotReviews = await trustpilot.getCompanyReviews(
    operator.trustpilot_url
  );
  const googleReviews = await googlePlaces.getReviews(operator.google_place_id);
  
  // Aggregate
  const allReviews = [
    ...tripAdvisorReviews.map((r) => ({ source: "tripadvisor", ...r })),
    ...trustpilotReviews.map((r) => ({ source: "trustpilot", ...r })),
    ...googleReviews.map((r) => ({ source: "google", ...r })),
  ];
  
  // Calculate trust_score
  const ratings = allReviews.map((r) => r.rating);
  const avg_rating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const trust_score = Math.round(avg_rating * 20); // Convert 0-5 to 0-100
  
  // Detect flags
  const complaints = allReviews.filter((r) => {
    return (
      r.rating <= 2 &&
      (r.text.includes("cancel") ||
        r.text.includes("refund") ||
        r.text.includes("safety"))
    );
  });
  
  // Store
  await db.update(
    "tour_operators",
    {
      avg_rating: avg_rating,
      total_reviews: allReviews.length,
      trust_score: trust_score,
      updated_at: new Date(),
    },
    { id: operatorId }
  );
  
  // Add warnings to packages from this operator
  for (const complaint of complaints) {
    await db.insert("warnings", {
      operator_id: operatorId,
      type: "customer_complaint",
      severity: complaint.rating < 2 ? "high" : "medium",
      text: complaint.text,
      source: complaint.source,
    });
  }
}
```

### 8.6 Duplicate Detection

**Algorithm:**
1. Hash-based: Create fingerprint from (destination, name, price_range, dates)
2. Fuzzy matching: If same operator and destination, check name similarity
3. URL deduplication: If exact same source URL, definitely duplicate

```typescript
async function detectDuplicates(newPackages) {
  const deduplicated = [];
  
  for (const newPkg of newPackages) {
    // Hash-based dedup
    const fingerprint = md5(
      `${newPkg.destination}|${newPkg.name}|${Math.round(
        newPkg.price_per_person / 100
      )}|${newPkg.total_days}`
    );
    
    const existing = await db.query(
      `SELECT id FROM tour_packages 
       WHERE source_name = ? 
       AND external_id = ?`,
      [newPkg.source_name, newPkg.external_id]
    );
    
    if (existing.length > 0) {
      // Same source, same ID = update
      await updatePackage(existing[0].id, newPkg);
      deduplicated.push(null);
    } else {
      // Check fuzzy match with same operator
      const fuzzyMatch = await db.query(
        `SELECT id FROM tour_packages 
         WHERE operator_id = ? 
         AND destination = ? 
         AND total_days = ?
         AND similarity(name, ?) > 0.85`,
        [
          newPkg.operator_id,
          newPkg.destination,
          newPkg.total_days,
          newPkg.name,
        ]
      );
      
      if (fuzzyMatch.length > 0) {
        // Likely duplicate from same operator, skip
        logger.info(`Skipping probable duplicate: ${newPkg.name}`);
      } else {
        // New package
        deduplicated.push(newPkg);
      }
    }
  }
  
  return deduplicated.filter((p) => p !== null);
}
```

### 8.7 Data Expiration

```typescript
// Daily job: Mark stale packages
async function expireStaleData() {
  // Tier 1: Stale after 2 hours
  await db.query(
    `UPDATE tour_packages 
     SET is_stale = true 
     WHERE source_tier = 1 
     AND last_seen < NOW() - INTERVAL 2 HOURS`
  );
  
  // Tier 2: Stale after 24 hours
  await db.query(
    `UPDATE tour_packages 
     SET is_stale = true 
     WHERE source_tier = 2 
     AND last_seen < NOW() - INTERVAL 24 HOURS`
  );
  
  // Tier 3-7: Stale after 7 days
  await db.query(
    `UPDATE tour_packages 
     SET is_stale = true 
     WHERE source_tier >= 3 
     AND last_seen < NOW() - INTERVAL 7 DAYS`
  );
}
```

---

## PART 9: COMPARISON & SCORING ENGINE

### 9.1 Value Score (0-100)

Measures cost-per-unit-of-value compared to market median.

```typescript
function calculateValueScore(tourPackage: TourPackage): number {
  const { destination, total_days, total_nights, price_per_person, nights, activities } = tourPackage;
  
  // Market baseline: median price for same destination/duration
  const marketBaseline = await getMarketBaseline(destination, total_days);
  
  // Cost per night
  const costPerNight = price_per_person / total_nights;
  const marketCostPerNight = marketBaseline.avg_cost_per_night;
  
  // Cost per activity
  const activityCount = activities.filter((a) => a.included).length;
  const costPerActivity = activityCount > 0 ? price_per_person / activityCount : 0;
  const marketCostPerActivity = marketBaseline.avg_cost_per_activity;
  
  // Value score: how much below median (positive) or above (negative)
  let valueScore = 50; // Neutral baseline
  
  // Adjust for cost per night
  if (costPerNight < marketCostPerNight * 0.85) {
    valueScore += 20; // Well below market
  } else if (costPerNight < marketCostPerNight) {
    valueScore += 10; // Below market
  } else if (costPerNight > marketCostPerNight * 1.2) {
    valueScore -= 15; // Above market
  }
  
  // Adjust for hotel rating
  const avgHotelRating = calculateAverageHotelRating(nights);
  if (avgHotelRating >= 4.5) {
    valueScore += 15; // High-quality accommodations
  } else if (avgHotelRating < 3.0) {
    valueScore -= 10; // Low-quality accommodations
  }
  
  // Adjust for meals included
  const mealsIncluded = nights.filter((n) => n.meals.breakfast || n.meals.lunch || n.meals.dinner).length;
  const mealsProportion = mealsIncluded / total_nights;
  valueScore += mealsProportion * 10; // More meals = better value
  
  // Adjust for activity market value
  const activityMarketValue = activities.reduce((sum, a) => sum + (a.estimated_market_value || 0), 0);
  if (activityMarketValue > price_per_person * 0.5) {
    valueScore += 15; // Activities worth significant portion of price
  }
  
  return Math.max(0, Math.min(100, valueScore));
}

async function getMarketBaseline(destination: string, days: number) {
  return await db.query(
    `SELECT 
      AVG(price_per_person / total_nights) as avg_cost_per_night,
      AVG(price_per_person / 
        NULLIF(ARRAY_LENGTH(activities, 1), 0)) as avg_cost_per_activity
     FROM tour_packages
     WHERE destination = ? 
       AND total_days BETWEEN ? AND ?
       AND source_tier <= 2
       AND last_seen > NOW() - INTERVAL 30 DAYS`,
    [destination, days - 2, days + 2]
  );
}
```

### 9.2 Transparency Score (0-100)

Measures clarity of terms, completeness of itinerary, and absence of hidden fees.

```typescript
function calculateTransparencyScore(tourPackage: TourPackage): number {
  let score = 50; // Baseline
  
  const {
    description,
    nights,
    activities,
    cancellation_policy,
    pricing,
    inclusions,
    exclusions,
    requirements,
  } = tourPackage;
  
  // Check for detailed itinerary
  if (nights && nights.length === tourPackage.total_nights) {
    score += 15; // Full night-by-night breakdown
  } else if (nights && nights.length > 0) {
    score += 5; // Partial breakdown
  }
  
  // Check for meal clarity
  const mealsSpecified = nights.filter((n) => n.meals.breakfast || n.meals.lunch || n.meals.dinner).length;
  if (mealsSpecified === nights.length) {
    score += 10; // Every meal specified
  }
  
  // Check for activity detail
  if (activities && activities.length > 0) {
    const activitiesWithDetails = activities.filter(
      (a) => a.description && a.description.length > 20
    ).length;
    
    if (activitiesWithDetails === activities.length) {
      score += 10; // All activities described
    }
  }
  
  // Check cancellation policy clarity
  if (cancellation_policy && cancellation_policy.policy_text && cancellation_policy.policy_text.length > 100) {
    score += 15; // Detailed cancellation terms
  } else if (cancellation_policy && cancellation_policy.free_cancellation_until) {
    score += 5; // Some cancellation info
  }
  
  // Check pricing breakdown
  if (pricing.inclusions_value_breakdown && pricing.inclusions_value_breakdown.accommodation) {
    score += 10; // Transparent component pricing
  }
  
  // Check exclusions (honesty about what's not included)
  if (exclusions && exclusions.length > 3) {
    score += 5; // Clearly lists exclusions
  }
  
  // Check requirements disclosure
  if (requirements && requirements.length > 0) {
    score += 5; // Lists visa/health requirements
  }
  
  // Check for hidden fees in fine print
  if (hasSuspiciousLanguage(description)) {
    score -= 20; // Phrases like "subject to change", "may incur extra fees"
  }
  
  return Math.max(0, Math.min(100, score));
}

function hasSuspiciousLanguage(text: string): boolean {
  const redFlags = [
    /subject to (change|availability)/i,
    /may (vary|change|incur)/i,
    /additional (charges|fees|costs) (?!listed|detailed|shown)/i,
    /not responsible for/i,
  ];
  
  return redFlags.some((flag) => flag.test(text));
}
```

### 9.3 Trust Score (0-100)

Based on operator reviews, complaint history, and verified credentials.

```typescript
function calculateTrustScore(tourPackage: TourPackage): number {
  const operator = tourPackage.operator;
  let score = 50; // Baseline
  
  // Review score (up to 25 points)
  if (operator.avg_rating >= 4.5) {
    score += 25;
  } else if (operator.avg_rating >= 4.0) {
    score += 20;
  } else if (operator.avg_rating >= 3.5) {
    score += 10;
  } else if (operator.avg_rating < 3.0) {
    score -= 15;
  }
  
  // Review count (verified by many users)
  if (operator.total_reviews > 500) {
    score += 15; // Large sample size
  } else if (operator.total_reviews > 100) {
    score += 5;
  }
  
  // License verification
  if (operator.license_status === "verified") {
    score += 15;
  }
  
  // Insurance verification
  if (operator.insurance_provider && operator.insurance_amount > 0) {
    score += 10;
  }
  
  // Company age (stability)
  const yearsInBusiness = new Date().getFullYear() - operator.founded_year;
  if (yearsInBusiness > 10) {
    score += 10;
  } else if (yearsInBusiness > 5) {
    score += 5;
  } else if (yearsInBusiness < 2) {
    score -= 10;
  }
  
  // Data source tier (Tier 1 data more trustworthy)
  if (tourPackage.source_tier === 1) {
    score += 10;
  }
  
  // Complaints about cancellations
  const cancellationComplaints = operator.warnings.filter((w) =>
    w.text.toLowerCase().includes("cancel")
  ).length;
  
  if (cancellationComplaints > 5) {
    score -= 15;
  } else if (cancellationComplaints > 0) {
    score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}
```

### 9.4 Risk Score (0-100)

Higher score = riskier package. Considers destination safety, operator history, and policy flexibility.

```typescript
function calculateRiskScore(tourPackage: TourPackage): number {
  let riskScore = 0; // Lower is better
  
  // Destination risk
  const destinationRisk = getDestinationRisk(tourPackage.destination);
  riskScore += destinationRisk * 0.3; // Weight: 30%
  
  // Cancellation policy risk
  const { cancellation_policy } = tourPackage;
  if (!cancellation_policy.is_refundable) {
    riskScore += 25; // Non-refundable is high risk
  } else if (!cancellation_policy.free_cancellation_until) {
    riskScore += 15; // Limited cancellation window
  } else {
    const daysUntilFree = daysBetween(
      new Date(),
      new Date(cancellation_policy.free_cancellation_until)
    );
    if (daysUntilFree < 14) {
      riskScore += 10; // Short cancellation window
    }
  }
  
  // Operator cancellation history
  const operatorCancellationRate = getOperatorCancellationRate(tourPackage.operator_id);
  riskScore += operatorCancellationRate * 30; // Up to 30 points
  
  // Price volatility (if data shows price fluctuation)
  const priceVolatility = calculatePriceVolatility(tourPackage.id);
  if (priceVolatility > 20) {
    riskScore += 10; // Price varies wildly
  }
  
  // Data freshness risk
  if (tourPackage.data_freshness_days > 7) {
    riskScore += 10; // Old data = higher uncertainty
  }
  
  // Health/visa requirements
  const requirements = tourPackage.requirements;
  if (requirements && requirements.some((r) => r.toLowerCase().includes("visa"))) {
    riskScore += 5; // Visa required adds complexity
  }
  if (requirements && requirements.some((r) => r.toLowerCase().includes("vaccine"))) {
    riskScore += 5; // Vaccine requirement
  }
  
  return Math.max(0, Math.min(100, riskScore));
}

function getDestinationRisk(destination: string): number {
  // Fetch from Global Peace Index, US State Dept travel advisories
  // Simple version: 0-100 scale
  const riskData = {
    "Egypt": 45,
    "Thailand": 20,
    "Paris": 15,
    "Bali": 25,
    "Syria": 95,
    // ... comprehensive list
  };
  
  return riskData[destination] || 30; // Default mid-range
}
```

### 9.5 Overall Ranking

```typescript
function calculateOverallScore(tourPackage: TourPackage): number {
  const {
    value_score,
    transparency_score,
    trust_score,
    risk_score,
  } = tourPackage;
  
  // Weights based on product priority
  const weights = {
    value: 0.25,          // 25%
    transparency: 0.25,   // 25%
    trust: 0.35,          // 35%
    risk: 0.15,           // 15% (subtracted)
  };
  
  const overall =
    value_score * weights.value +
    transparency_score * weights.transparency +
    trust_score * weights.trust -
    risk_score * weights.risk;
  
  // Normalize to 0-100
  return Math.max(0, Math.min(100, overall));
}

// Percentile ranking within similar packages
async function calculatePercentileRank(tourPackage: TourPackage): Promise<number> {
  const similarity = {
    destination: tourPackage.destination,
    total_days: tourPackage.total_days,
    price_range: [tourPackage.price_per_person * 0.8, tourPackage.price_per_person * 1.2],
  };
  
  const similarPackages = await db.query(
    `SELECT overall_score FROM tour_packages
     WHERE destination = ?
       AND total_days BETWEEN ? AND ?
       AND price_per_person BETWEEN ? AND ?
       AND last_seen > NOW() - INTERVAL 30 DAYS`,
    [
      similarity.destination,
      similarity.total_days - 1,
      similarity.total_days + 1,
      similarity.price_range[0],
      similarity.price_range[1],
    ]
  );
  
  const betterPackages = similarPackages.filter(
    (p) => p.overall_score > tourPackage.overall_score
  ).length;
  
  return Math.round((betterPackages / similarPackages.length) * 100);
}
```

---

## PART 10: FRONTEND ARCHITECTURE (React + Next.js)

### 10.1 Project Structure

```
app/
├── layout.tsx                    # Root layout
├── page.tsx                      # Home/search page
├── search/
│   ├── layout.tsx
│   └── [query]/page.tsx          # Search results
├── packages/
│   ├── layout.tsx
│   └── [id]/
│       ├── page.tsx              # Package detail
│       └── compare/page.tsx       # Comparison modal
├── about/page.tsx
├── methodology/page.tsx          # Trust & scoring explanation
├── blog/
│   └── [slug]/page.tsx
└── api/
    ├── search/route.ts
    ├── packages/[id]/route.ts
    └── ...

components/
├── search/
│   ├── SearchForm.tsx
│   ├── DestinationInput.tsx
│   ├── DatePicker.tsx
│   ├── FilterPanel.tsx
│   └── SortOptions.tsx
├── packages/
│   ├── PackageCard.tsx
│   ├── PackageList.tsx
│   ├── PackageDetail.tsx
│   ├── PricingBreakdown.tsx
│   ├── ItineraryDisplay.tsx
│   ├── ActivityList.tsx
│   └── CancellationPolicyDisplay.tsx
├── comparison/
│   ├── ComparisonTable.tsx
│   ├── ScoreComparison.tsx
│   └── FeatureDiff.tsx
├── trust/
│   ├── TrustBadge.tsx
│   ├── DataFreshnessIndicator.tsx
│   ├── SourceTierBadge.tsx
│   └── ConfidenceScore.tsx
├── common/
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── Disclaimer.tsx
│   ├── LoadingSpinner.tsx
│   └── ErrorBoundary.tsx
└── ui/
    └── (shadcn/ui components)

lib/
├── api.ts                        # API client
├── search.ts                     # Search logic
├── types.ts                      # TypeScript types
├── constants.ts
├── utils.ts
└── hooks/
    ├── useSearch.ts
    ├── usePackage.ts
    └── useComparison.ts

styles/
├── globals.css
└── variables.css                 # Design tokens

public/
├── images/
├── icons/
└── trust-badges/

tests/
├── search.test.tsx
├── comparison.test.tsx
└── ...
```

### 10.2 Key Pages

**Home Page (`/`)**
- Search form with destination autocomplete
- Featured destinations carousel
- Trust statement: "Honest comparison. No bookings. No commissions."

**Search Results (`/search/[query]`)**
- Filter panel (price, duration, difficulty, travel style)
- Sort options (value score, trust, price, newest)
- Package cards in grid (show: name, destination, price, value_score, trust_score, source tier badge)
- Pagination
- Map view option

**Package Detail (`/packages/[id]`)**
- Package name and headline
- Pricing summary
- Night-by-night itinerary with hotel ratings
- Meals breakdown (breakfast, lunch, dinner per night)
- Activities list with market value comparison
- Cancellation policy in plain language
- Scoring explanation (why value_score is 75, etc.)
- Source information (Tier 2, last updated 2 hours ago, data confidence 88%)
- Operator details with link to reviews
- Risk warnings (if any)
- "Book on Viator" button (affiliate link)

**Comparison Modal (`/packages/[id]/compare?with=[id2],[id3]`)**
- Side-by-side 2-4 packages
- Price comparison with total cost
- Value score comparison
- Night hotel comparison
- Activities diff (what's included in each)
- Cancellation policy comparison
- Trust score comparison

**Methodology Page (`/methodology`)**
- Explain 7-tier data system
- Scoring formulas (simple version)
- How trust score is calculated
- How we ensure data freshness
- How comparison works

### 10.3 Component Examples

#### SearchForm.tsx
```typescript
export default function SearchForm() {
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filters, setFilters] = useState({});
  const router = useRouter();
  
  const handleSearch = async (e) => {
    e.preventDefault();
    
    const query = new URLSearchParams({
      destination,
      start_date: startDate,
      end_date: endDate,
      ...filters,
    });
    
    router.push(`/search/${destination}?${query}`);
  };
  
  return (
    <form onSubmit={handleSearch} className="search-form">
      <input
        type="text"
        placeholder="Where are you going?"
        value={destination}
        onChange={(e) => setDestination(e.target.value)}
      />
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <button type="submit">Search Packages</button>
    </form>
  );
}
```

#### TrustBadge.tsx
```typescript
export function TrustBadge({ package: pkg }) {
  return (
    <div className="trust-section">
      <div className="trust-row">
        <span>Data Tier</span>
        <SourceTierBadge tier={pkg.source_tier} />
        <span className="tooltip">
          Tier {pkg.source_tier}: {getTierDescription(pkg.source_tier)}
        </span>
      </div>
      
      <div className="trust-row">
        <span>Data Freshness</span>
        <span className={`freshness ${pkg.data_freshness_days < 1 ? 'fresh' : 'old'}`}>
          {pkg.data_freshness_days < 1 ? 'Updated today' : `${pkg.data_freshness_days} days old`}
        </span>
      </div>
      
      <div className="trust-row">
        <span>Confidence Score</span>
        <ConfidenceBar score={pkg.confidence_score} />
        <span>{pkg.confidence_score}%</span>
      </div>
      
      <div className="trust-row">
        <span>Source</span>
        <a href={pkg.source_url} target="_blank">
          {pkg.source_name} ↗
        </a>
      </div>
    </div>
  );
}
```

#### PackageDetail.tsx
```typescript
export default function PackageDetail({ id }) {
  const { package: pkg, loading, error } = usePackage(id);
  
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="package-detail">
      <header>
        <h1>{pkg.name}</h1>
        <div className="meta">
          <span>{pkg.destination}</span>
          <span>{pkg.total_days} days</span>
          <span className="price">${pkg.price_per_person}</span>
        </div>
      </header>
      
      <section className="scoring">
        <ScoreCard title="Value Score" score={pkg.value_score}>
          Compared to market median, this package costs ${calculateCostPerNight(pkg)}/night.
          Market average is ${getMarketAverage(pkg)}/night.
        </ScoreCard>
        
        <ScoreCard title="Trust Score" score={pkg.trust_score}>
          Operator: {pkg.operator.name} ({pkg.operator.avg_rating}/5 from {pkg.operator.total_reviews} reviews)
        </ScoreCard>
        
        <ScoreCard title="Transparency" score={pkg.transparency_score}>
          Complete itinerary, clear cancellation policy, all inclusions listed.
        </ScoreCard>
        
        <ScoreCard title="Risk Level" score={100 - pkg.risk_score}>
          Moderate risk. Non-refundable. Destination safety: {getDestinationSafety(pkg.destination)}.
        </ScoreCard>
      </section>
      
      <section className="itinerary">
        <h2>Itinerary</h2>
        <ItineraryDisplay nights={pkg.canonical_data.nights} />
      </section>
      
      <section className="activities">
        <h2>Activities & Experiences</h2>
        <ActivityList
          activities={pkg.canonical_data.activities}
          totalPrice={pkg.price_per_person}
        />
      </section>
      
      <section className="pricing">
        <h2>Pricing Breakdown</h2>
        <PricingBreakdown
          base={pkg.price_per_person_base}
          taxes={pkg.pricing.taxes_fees}
          breakdown={pkg.pricing.inclusions_value_breakdown}
        />
      </section>
      
      <section className="cancellation">
        <h2>Cancellation Policy</h2>
        <CancellationPolicyDisplay policy={pkg.cancellation_policy} />
      </section>
      
      <section className="trust-info">
        <TrustBadge package={pkg} />
      </section>
      
      <footer>
        <a href={pkg.source_url} target="_blank" className="btn-book">
          Book on {pkg.source_name}
        </a>
        <button className="btn-compare">Compare with other packages</button>
      </footer>
    </div>
  );
}
```

### 10.4 Trust Design (UX Rules)

**What We CAN Say:**
- "This package offers better value than the market average for similar tours"
- "This operator has a 4.2/5 rating from 324 verified reviews on TripAdvisor"
- "This package includes all meals and activities; average package includes only 60%"
- "Based on component pricing, the activities alone are worth ~$400 standalone"
- "This data was last updated 4 hours ago from the Viator API"
- "We can't guarantee real-time availability; check source before booking"

**What We MUST NEVER Say:**
- "This is the best tour in Rome" (subjective, can't be verified)
- "Save 50% compared to booking directly" (depends on date, can change)
- "Risk-free booking" (cancellation policies vary)
- "Guaranteed 5-star experience" (experience is subjective)
- "Lowest price guarantee" (we're not booking, prices change)
- "All reviews shown below are from verified customers" (we aggregate, not verify individually)

**Design Patterns:**
- Disclaimers on every comparison ("prices accurate as of [date]")
- Source attribution on all data ("last updated from Viator")
- Confidence badges on scores ("based on 47 similar packages")
- Risk flags in red ("non-refundable", "destination advisory")
- Data freshness in prominent place ("updated 3 hours ago")

---

## PART 11: LEGAL & COMPLIANCE

### 11.1 Data Scraping Safety

**Tier 2-3 Web Scraping:**
- Check robots.txt before scraping any domain
- Respect X-Robots-Tag HTTP header
- Add request delays (minimum 1 second between requests)
- Identify bot with User-Agent: "OnTrip-ComparisonBot/1.0 (+https://ontrip.com/bot)"
- Honor rate limit headers (X-RateLimit-Remaining, X-RateLimit-Reset)
- Stop immediately if 429 (Too Many Requests) received
- Monitor 403 (Forbidden) responses and back off

**Example Implementation:**
```typescript
async function scrapeRespectfully(url) {
  // Check robots.txt
  const robotsTxt = await fetch("https://domain.com/robots.txt");
  if (!isAllowed(robotsTxt, "/packages")) {
    logger.warn(`Scraping blocked for ${url}`);
    return null;
  }
  
  // Identify as bot
  const response = await fetch(url, {
    headers: {
      "User-Agent": "OnTrip-ComparisonBot/1.0 (+https://ontrip.com/bot)",
    },
  });
  
  // Respect rate limits
  const rateLimit = response.headers.get("X-RateLimit-Remaining");
  if (rateLimit && parseInt(rateLimit) < 10) {
    const resetTime = parseInt(
      response.headers.get("X-RateLimit-Reset")
    );
    const delay = resetTime - Date.now();
    await sleep(delay);
  }
  
  // Stop on 403/429
  if (response.status === 403 || response.status === 429) {
    logger.error(`Access denied for ${url}`);
    return null;
  }
  
  return response;
}
```

### 11.2 Attribution & Linking

**Required on every package listing:**
1. Source name linked to original listing
2. Data freshness timestamp
3. Note: "Prices and availability verified from [Source] on [Date]"

**When user clicks to book:**
1. Redirect to source platform
2. Use affiliate link if available (with disclosure)
3. Show: "You are leaving OnTrip to complete booking on [SourceName]"

### 11.3 User Data Privacy

**What We Collect:**
- Search queries (destination, dates, filters)
- Package views (which packages user researches)
- Clicks to source (which packages they click to book)
- Anonymous session ID (not personally identifiable)

**What We DON'T Collect:**
- Passwords or login credentials
- Payment information
- Personal travel details beyond search
- User identity without explicit login

**Privacy Policy Must Include:**
- We don't sell user data to third parties
- We use cookies for anonymous session tracking (can be disabled)
- We share affiliate data with booking platforms (anonymized)
- Users can request data deletion at privacy@ontrip.com
- GDPR compliant (if EU users) with data processing agreement

### 11.4 Affiliate & Partnership Agreements

**Tier 1 Partner Agreement Outline:**
- Partner agrees to provide near-live data via API
- OnTrip agrees to display attribution and source link
- Booking redirects include affiliate parameter
- Data sharing: OnTrip agrees not to share raw data with competitors
- Pricing: Affiliate commission structure (typically 3-8% per booking)
- Term: 1-year renewable agreement

**Marketplace Agreements (Tier 2):**
- Respect API terms of service
- Don't cache pricing > [agreed period]
- Don't modify package descriptions
- Include attribution as per API docs
- Follow rate limiting requirements

### 11.5 Risk Disclaimers

**Required on Every Package Display:**

```html
<div class="disclaimer">
  <strong>Important:</strong> OnTrip is a comparison platform, not a booking service.
  Prices and availability shown are verified at the time of data collection and may
  change. Please confirm all details and pricing on the source website before booking.
  We are not responsible for operator cancellations, policy changes, or unfulfilled
  bookings. Always verify visa, health, and travel insurance requirements with
  official sources.
</div>
```

---

## PART 12: EXECUTION ROADMAP (30/60/90 Days)

### PHASE 1: MVP (Days 1-30)

**Goals:**
- Working search with 2-3 destinations
- Tier 2 marketplace data (Viator)
- Basic scoring
- Minimal but complete UI
- Not production-ready; internal testing only

**Deliverables:**

Week 1:
- [ ] PostgreSQL schema created and tested
- [ ] API skeleton (search, package detail endpoints)
- [ ] Zod validation schemas
- [ ] Data models (TypeScript types)

Week 2:
- [ ] Viator API integration (read-only scraping)
- [ ] Data normalization pipeline
- [ ] Duplicate detection
- [ ] Basic value_score calculation

Week 3:
- [ ] Next.js app scaffolding
- [ ] Search form component
- [ ] Package card component
- [ ] Package detail page (read from database)
- [ ] TailwindCSS + basic styling

Week 4:
- [ ] Redis caching layer
- [ ] Elasticsearch indexing
- [ ] Search page filters
- [ ] End-to-end test: search → results → detail
- [ ] Deploy to staging (AWS or local)

**What NOT to Build:**
- Authentication/user accounts
- Tier 1 partner integrations
- Review aggregation
- Price history tracking
- User favoriting/comparison saving
- Mobile app
- Production monitoring
- Full operator database

**Success Criteria:**
- Search returns 50-200 packages per destination
- Load time < 2 seconds for search results
- Package details display correctly
- No major bugs in happy path
- Data updates work without manual intervention

---

### PHASE 2: Stability & Expansion (Days 31-60)

**Goals:**
- Add 5 more destinations
- Integrate 2 more marketplaces (GetYourGuide, Klook)
- Build trust scoring
- Prepare for initial beta users

**Deliverables:**

Week 5:
- [ ] GetYourGuide API integration
- [ ] Klook API integration
- [ ] Expand operator database (50-100 operators)
- [ ] Review aggregation (TripAdvisor, Google)
- [ ] Implement trust_score calculation

Week 6:
- [ ] Transparency_score implementation
- [ ] Risk_score implementation
- [ ] Price volatility tracking
- [ ] Package version history table
- [ ] Implement data freshness indicators

Week 7:
- [ ] Comparison UI (side-by-side 2-4 packages)
- [ ] Methodology explanation page
- [ ] Trust badges on package cards
- [ ] Data freshness badges
- [ ] Test with 5 beta users (internal team)

Week 8:
- [ ] Bug fixes from beta testing
- [ ] Performance optimization (Elasticsearch queries)
- [ ] Redis caching tuning
- [ ] Monitoring setup (basic metrics)
- [ ] Documentation for team

**What NOT to Build:**
- Tier 1 integrations (still waiting for partnerships)
- Mobile app
- User accounts
- Advanced analytics
- Real-time price alerts
- Recommendation engine

**Success Criteria:**
- 5 destinations with 500+ packages each
- All scoring functions working
- Beta users can complete search → detail → comparison flow
- Comparison feature working
- Ingestion jobs running on schedule
- No data inconsistencies

---

### PHASE 3: Polish & Launch (Days 61-90)

**Goals:**
- Prepare for public beta launch
- Establish 1-2 Tier 1 partnerships
- Refine UX based on testing
- Set up monitoring and support infrastructure

**Deliverables:**

Week 9:
- [ ] Secure 1 Tier 1 partner (direct API feed)
- [ ] Implement Tier 1 ingestion pipeline
- [ ] Set up partner admin dashboard
- [ ] Establish SLA with partner
- [ ] Legal review of partner agreement

Week 10:
- [ ] Landing page redesign
- [ ] Blog post: "How OnTrip is Different"
- [ ] Methodology detailed explanation
- [ ] FAQ page
- [ ] Customer support email setup
- [ ] Legal disclaimers finalized and reviewed

Week 11:
- [ ] Beta signup page
- [ ] Email notifications (data freshness alerts)
- [ ] User feedback form on package detail
- [ ] Sentry error tracking integration
- [ ] Prometheus metrics export
- [ ] Google Analytics setup

Week 12:
- [ ] Security audit (scraping, data handling)
- [ ] Load testing (1000 concurrent users)
- [ ] Database backup strategy
- [ ] Disaster recovery plan
- [ ] Production deployment checklist
- [ ] Soft launch (200 beta users)
- [ ] Monitor for 1 week; fix critical bugs
- [ ] Public launch announcement

**What NOT to Build:**
- Mobile app (future phase)
- User accounts (can add in phase 2)
- Advanced recommendation engine
- AI-powered chatbot
- Advanced search filters
- Social features

**Success Criteria:**
- 10 destinations with 1000+ packages each
- Tier 1 partner integration live
- 200+ beta users (no major issues reported)
- < 500ms average page load time
- 99.5% uptime over 1 week
- Positive feedback on comparison experience
- Legal/compliance sign-off
- No critical bugs in production

---

### POST-LAUNCH: MONTH 2-3 (Scaling Phase)

**Phase 3 Extensions (if resources allow):**

- [ ] Add 10 more destinations (focus on high-search-volume)
- [ ] Integrate 2 more Tier 2 marketplaces
- [ ] Implement Tier 3 OTA scraping (Expedia, Booking)
- [ ] Add price history/trend charts
- [ ] Implement user accounts (optional favoriting)
- [ ] Advanced filters (difficulty, travel style, group size)
- [ ] Operator detail pages
- [ ] Destination guides with top packages
- [ ] SEO optimization for destination pages
- [ ] Establish 2-3 more Tier 1 partnerships

---

## PART 13: TECHNOLOGY CHECKLIST

**Must Have (MVP):**
```
✓ PostgreSQL 15
✓ Node.js 18+ with Express
✓ Next.js 14
✓ React 18
✓ Redis
✓ Puppeteer (or Cheerio)
✓ Axios
✓ Zod (validation)
✓ TailwindCSS
✓ TypeScript
✓ Docker + Docker Compose
```

**Should Have (Phase 2):**
```
✓ Elasticsearch
✓ Bull/BullMQ
✓ React Query
✓ Zustand
✓ Shadcn/ui
✓ Passport.js
✓ JWT (jsonwebtoken)
✓ Sentry
✓ Prometheus
```

**Nice to Have (Phase 3+):**
```
- Mobile app (React Native)
- GraphQL
- Kafka (for event streaming)
- Machine learning (recommendation engine)
- A/B testing framework
- Advanced monitoring (Datadog, New Relic)
```

---

## PART 14: CRITICAL SUCCESS FACTORS

1. **Data Quality Over Speed:** Don't rush to add 1000 packages if they're not normalized correctly. 200 high-quality packages beat 10,000 low-quality ones.

2. **Trust First, Features Second:** Every feature should enhance trust, not obscure it. A confusing comparison feature hurts more than it helps.

3. **Respect Source ToS:** Never violate APIs, robots.txt, or scraping terms. One legal cease-and-desist kills the business.

4. **Automate Ingestion:** Manual data entry doesn't scale. Invest in robust API integrations and scraping pipelines from day 1.

5. **Version All Data:** Always store versions of packages. Tomorrow's comparison requires understanding what changed.

6. **Monitor Freshness:** Stale data is worse than no data. Set aggressive expiration and refresh schedules.

7. **Be Transparent About Limitations:** Tell users when data is uncertain or stale. Hiding limitations breaks trust.

8. **Operator Relationships Matter:** Tier 1 partnerships are the long-term moat. Invest in building real relationships with travel operators.

---

**END OF ARCHITECTURE DOCUMENT**

Now I'll generate the actual codebase.

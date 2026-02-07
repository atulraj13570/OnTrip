-- OnTrip Platform Database Schema
-- PostgreSQL 15+

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- for fuzzy string matching

-- Destinations (reference table)
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  name_slug VARCHAR(255) NOT NULL UNIQUE,
  country_code CHAR(2),
  region VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  description TEXT,
  popularity_rank INT,
  monthly_search_volume INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_destinations_name_slug ON destinations(name_slug);
CREATE INDEX idx_destinations_country ON destinations(country_code);

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
  license_status VARCHAR(50) DEFAULT 'unverified', -- verified, unverified, suspended
  license_expiry TIMESTAMP,
  insurance_provider VARCHAR(255),
  insurance_amount DECIMAL(12, 2),
  avg_rating DECIMAL(3, 2),
  total_reviews INT DEFAULT 0,
  trust_score INT, -- 0-100
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_operators_slug ON tour_operators(slug);
CREATE INDEX idx_operators_rating ON tour_operators(avg_rating DESC);

-- Tour Packages (main table)
CREATE TABLE tour_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(500) NOT NULL,
  source_tier SMALLINT NOT NULL CHECK (source_tier >= 1 AND source_tier <= 7),
  source_name VARCHAR(100) NOT NULL,
  source_url VARCHAR(1000) NOT NULL,
  operator_id UUID REFERENCES tour_operators(id) ON DELETE SET NULL,
  destination_id UUID NOT NULL REFERENCES destinations(id),
  
  -- Basic Info
  name VARCHAR(500) NOT NULL,
  description TEXT,
  slug VARCHAR(500),
  travel_styles VARCHAR(255)[] DEFAULT '{}',
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
  pricing_confidence DECIMAL(3, 2),
  inclusions_value_usd JSONB,
  
  -- Scores (0-100)
  value_score INT,
  transparency_score INT,
  trust_score INT,
  risk_score INT,
  overall_score INT,
  rank_percentile INT,
  
  -- Data Quality
  data_version INT DEFAULT 1,
  data_tier_confidence INT,
  is_verified BOOLEAN DEFAULT false,
  verification_date TIMESTAMP,
  manual_review_status VARCHAR(50), -- pending, approved, flagged
  manual_review_notes TEXT,
  
  -- Temporal
  first_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_seen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  next_refresh_at TIMESTAMP,
  data_freshness_days INT GENERATED ALWAYS AS (
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - last_seen)::INT
  ) STORED,
  is_stale BOOLEAN GENERATED ALWAYS AS (
    EXTRACT(DAY FROM CURRENT_TIMESTAMP - last_seen) > 
    CASE 
      WHEN source_tier = 1 THEN 2
      WHEN source_tier IN (2, 3) THEN 7
      ELSE 30
    END
  ) STORED,
  
  -- Raw & Canonical Data
  raw_data JSONB,
  canonical_data JSONB NOT NULL,
  
  -- Audit
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_by VARCHAR(100),
  
  UNIQUE (source_name, external_id, COALESCE(min_departure_date, '1900-01-01'::DATE))
);

CREATE INDEX idx_packages_destination ON tour_packages(destination_id);
CREATE INDEX idx_packages_operator ON tour_packages(operator_id);
CREATE INDEX idx_packages_source_tier ON tour_packages(source_tier);
CREATE INDEX idx_packages_overall_score ON tour_packages(overall_score DESC);
CREATE INDEX idx_packages_last_seen ON tour_packages(last_seen DESC);
CREATE INDEX idx_packages_created ON tour_packages(created_at DESC);
CREATE INDEX idx_packages_search ON tour_packages USING GIN (
  to_tsvector('english', name || ' ' || description)
);

-- Package Versions (for tracking changes)
CREATE TABLE tour_package_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  price_per_person DECIMAL(10, 2),
  available_seats INT,
  cancellation_policy JSONB,
  inclusions_data JSONB,
  scores_at_version JSONB,
  snapshot_data JSONB,
  changed_fields VARCHAR(255)[],
  change_reason VARCHAR(255),
  captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (package_id, version_number)
);

CREATE INDEX idx_versions_package ON tour_package_versions(package_id);
CREATE INDEX idx_versions_captured ON tour_package_versions(captured_at DESC);

-- Package Nights (detailed breakdown)
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
  breakfast_included BOOLEAN DEFAULT false,
  lunch_included BOOLEAN DEFAULT false,
  dinner_included BOOLEAN DEFAULT false,
  activity_summary TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (package_id, night_number)
);

CREATE INDEX idx_nights_package ON package_nights(package_id);

-- Package Activities
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_package ON package_activities(package_id);

-- Cancellation Policies
CREATE TABLE cancellation_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  is_refundable BOOLEAN,
  free_cancellation_until DATE,
  policy_text TEXT,
  cancellation_windows JSONB,
  risk_level VARCHAR(50), -- low, medium, high
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (package_id)
);

CREATE INDEX idx_cancellation_package ON cancellation_policies(package_id);

-- Ingestion Log
CREATE TABLE ingestion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_tier SMALLINT,
  source_name VARCHAR(100),
  ingestion_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50), -- success, partial, failed
  packages_found INT,
  packages_inserted INT,
  packages_updated INT,
  packages_skipped INT,
  error_message TEXT,
  execution_time_seconds INT,
  raw_response_size_mb DECIMAL(10, 2)
);

CREATE INDEX idx_ingestion_source_date ON ingestion_log(source_name, ingestion_date DESC);

-- Search Queries (analytics)
CREATE TABLE search_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR(100),
  query_destination VARCHAR(255),
  query_start_date DATE,
  query_end_date DATE,
  query_filters JSONB,
  results_returned INT,
  user_selected_package_id UUID REFERENCES tour_packages(id),
  user_clicked_source_url BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_search_destination_date ON search_queries(query_destination, created_at DESC);

-- Manual Reviews
CREATE TABLE manual_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES tour_packages(id) ON DELETE CASCADE,
  reviewer_id VARCHAR(100) NOT NULL,
  status VARCHAR(50), -- approved, flagged, needs_edit
  notes TEXT,
  issues_found JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_package_date ON manual_reviews(package_id, created_at DESC);

-- Package Comparisons (user-created)
CREATE TABLE package_comparisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session_id VARCHAR(100),
  package_ids UUID[] NOT NULL,
  comparison_name VARCHAR(255),
  notes TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  share_url VARCHAR(500) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warnings
CREATE TABLE warnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID REFERENCES tour_packages(id) ON DELETE CASCADE,
  operator_id UUID REFERENCES tour_operators(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL, -- health_risk, legal_risk, quality_issue, etc.
  severity VARCHAR(50) NOT NULL, -- low, medium, high
  text TEXT NOT NULL,
  source VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_warnings_package ON warnings(package_id);
CREATE INDEX idx_warnings_operator ON warnings(operator_id);

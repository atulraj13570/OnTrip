// Backend TypeScript types for OnTrip platform

export interface TourPackage {
  id: string;
  external_id: string;
  name: string;
  description: string;

  source_tier: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  source_name: string;
  source_url: string;
  operator_id: string;

  destination: string;
  destination_code?: string;
  start_cities: string[];
  end_cities: string[];

  total_days: number;
  total_nights: number;
  min_departure_date?: Date;
  max_departure_date?: Date;

  nights: Night[];
  accommodation: Accommodation;
  meals: Meal[];
  activities: Activity[];
  transport: Transport;

  pricing: Pricing;
  availability: Availability;
  cancellation_policy: CancellationPolicy;

  inclusions: string[];
  exclusions: string[];
  requirements: string[];
  warnings: Warning[];

  value_score: number;
  transparency_score: number;
  trust_score: number;
  risk_score: number;
  overall_rank: number;
  rank_percentile: number;

  group_size_min: number;
  group_size_max: number;
  age_restrictions?: string;
  difficulty_level?: string;
  travel_styles: string[];

  confidence_score: number;
  is_verified: boolean;
  is_stale: boolean;

  data_version: number;
  first_seen: Date;
  last_seen: Date;
  next_refresh_at: Date;
  data_freshness_days: number;

  raw_data: Record<string, unknown>;
  canonical_data: Record<string, unknown>;

  created_at: Date;
  updated_at: Date;
}

export interface Night {
  night_number: number;
  date?: string;
  city: string;
  hotel: {
    name: string;
    rating?: number;
    room_type: string;
    amenities: string[];
    coordinates?: { lat: number; lng: number };
  };
  meals: {
    breakfast?: boolean;
    lunch?: boolean;
    dinner?: boolean;
  };
  activity_summary?: string;
}

export interface Accommodation {
  total_nights: number;
  average_rating: number;
  hotel_types: string[];
  room_types: string[];
  shared_vs_private: {
    percentage_shared: number;
    percentage_private: number;
  };
}

export interface Meal {
  sequence_number: number;
  meal_type: "breakfast" | "lunch" | "dinner";
  location: string;
  description: string;
  included: boolean;
  dietary_options: string[];
}

export interface Activity {
  sequence_number: number;
  name: string;
  type: string;
  duration_hours: number;
  location: string;
  description: string;
  included: boolean;
  difficulty: string;
  estimated_market_value?: number;
}

export interface Transport {
  domestic_flights?: {
    included: boolean;
    count: number;
    class: string;
  };
  international_flights?: {
    included: boolean;
    count: number;
    class: string;
  };
  ground_transport: {
    type: string[];
    total_hours: number;
    comfort_level: string;
  };
  airport_transfers: boolean;
}

export interface Pricing {
  currency: string;
  per_person_base: number;
  single_supplement?: number;
  taxes_fees: number;
  total_per_person: number;
  group_discounts?: Array<{
    tier_size: number;
    discount_percentage: number;
  }>;
  child_discount?: number;
  price_date: Date;
  price_type: "fixed" | "estimated";
  payment_schedule: {
    deposit_amount: number;
    deposit_percentage: number;
    balance_due_days_before: number;
  };
  inclusions_value_breakdown?: {
    accommodation: number;
    meals: number;
    activities: number;
    transport: number;
    markup: number;
  };
}

export interface Availability {
  dates: Array<{
    departure_date: string;
    next_departure_date?: string;
    departure_frequency: string;
  }>;
  max_availability_days: number;
  currently_available: boolean;
  available_seats?: number;
  group_size_min: number;
  group_size_max: number;
  lead_time_days_min: number;
}

export interface CancellationPolicy {
  is_refundable: boolean;
  policy_text: string;
  cancellation_windows: Array<{
    days_before_departure: number;
    refund_percentage: number;
  }>;
  free_cancellation_until?: string;
  change_penalty: number;
  risk_level: "low" | "medium" | "high";
  insurance_required: boolean;
}

export interface Warning {
  type: string;
  severity: "low" | "medium" | "high";
  text: string;
  source: string;
  date: Date;
}

export interface TourOperator {
  id: string;
  name: string;
  slug: string;
  website_url?: string;
  email?: string;
  phone?: string;
  country_code?: string;
  company_registration?: string;
  founded_year?: number;
  employee_count?: number;
  license_status: "verified" | "unverified" | "suspended";
  license_expiry?: Date;
  insurance_provider?: string;
  insurance_amount?: number;
  avg_rating: number;
  total_reviews: number;
  trust_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface Destination {
  id: string;
  name: string;
  name_slug: string;
  country_code: string;
  region: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
  popularity_rank?: number;
  monthly_search_volume?: number;
}

export interface SearchQuery {
  destination: string;
  start_date?: string;
  end_date?: string;
  duration_days?: number;
  price_min?: number;
  price_max?: number;
  travel_styles?: string[];
  difficulty?: string;
  sort?: "value_score" | "trust_score" | "price" | "newest";
  page?: number;
  limit?: number;
}

export interface SearchResult {
  total_results: number;
  page: number;
  packages: TourPackage[];
  filters_available: {
    price_ranges: Array<{
      min: number;
      max: number;
      count: number;
    }>;
    durations: Array<{
      days: number;
      count: number;
    }>;
    travel_styles: Array<{
      name: string;
      count: number;
    }>;
  };
}

export interface IngestionLog {
  id: string;
  source_tier: number;
  source_name: string;
  ingestion_date: Date;
  status: "success" | "partial" | "failed";
  packages_found: number;
  packages_inserted: number;
  packages_updated: number;
  packages_skipped: number;
  error_message?: string;
  execution_time_seconds: number;
  raw_response_size_mb?: number;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
  request_id: string;
}

export interface JwtPayload {
  sub: string;
  type: "admin" | "partner" | "user";
  iat: number;
  exp: number;
}

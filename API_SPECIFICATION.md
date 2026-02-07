# API SPECIFICATION v1.0

Base URL: `https://api.ontrip.com/api/v1`

## Authentication

### Public Endpoints
No authentication required for search and package viewing.

### Admin Endpoints
Require JWT token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Internal Endpoints
Require API key in header:
```
X-API-Key: <INTERNAL_API_KEY>
```

## Rate Limiting

- **Public endpoints**: 100 requests/minute per IP
- **Search endpoint**: 10 requests/minute per IP
- **Admin endpoints**: 1000 requests/minute per token
- **Internal endpoints**: No limit

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "statusCode": 400
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "request_id": "uuid-here"
}
```

Common error codes:
- `BAD_REQUEST` (400): Invalid request parameters
- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

---

## PUBLIC ENDPOINTS

### GET /health
Health check endpoint.

**Response 200:**
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /search
Search for tour packages.

**Query Parameters:**
- `destination` (required): Destination name or slug
- `start_date` (optional): ISO date (YYYY-MM-DD)
- `end_date` (optional): ISO date (YYYY-MM-DD)
- `min_days` (optional): Minimum duration
- `max_days` (optional): Maximum duration
- `min_price` (optional): Minimum price in USD
- `max_price` (optional): Maximum price in USD
- `sort` (optional): `price_asc`, `price_desc`, `score_desc`, `duration_asc`
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20, max: 100)

**Example Request:**
```
GET /search?destination=paris&min_days=5&max_days=7&sort=score_desc&limit=20
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "uuid",
        "name": "Paris Highlights 6-Day Tour",
        "slug": "paris-highlights-6-day-tour",
        "destination": {
          "id": "uuid",
          "name": "Paris",
          "slug": "paris",
          "country_code": "FR"
        },
        "operator": {
          "id": "uuid",
          "name": "Paris Tours Co",
          "slug": "paris-tours-co",
          "avg_rating": 4.5
        },
        "duration": {
          "days": 6,
          "nights": 5
        },
        "pricing": {
          "currency": "USD",
          "base_per_person": 1200.00,
          "total_per_person": 1450.00,
          "confidence": 0.85
        },
        "scores": {
          "value": 78,
          "transparency": 85,
          "trust": 90,
          "risk": 15,
          "overall": 82
        },
        "source": {
          "tier": 2,
          "name": "viator",
          "url": "https://viator.com/...",
          "last_verified": "2024-01-01T00:00:00.000Z"
        },
        "data_freshness_days": 1,
        "is_stale": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "total_pages": 3
    },
    "filters_applied": {
      "destination": "paris",
      "min_days": 5,
      "max_days": 7
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /packages/:id
Get detailed package information.

**Path Parameters:**
- `id`: Package UUID

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Paris Highlights 6-Day Tour",
    "description": "Experience the best of Paris...",
    "slug": "paris-highlights-6-day-tour",
    "destination": {
      "id": "uuid",
      "name": "Paris",
      "slug": "paris",
      "country_code": "FR",
      "region": "Île-de-France"
    },
    "operator": {
      "id": "uuid",
      "name": "Paris Tours Co",
      "slug": "paris-tours-co",
      "website": "https://paristours.com",
      "avg_rating": 4.5,
      "total_reviews": 1250,
      "trust_score": 90,
      "license_status": "verified"
    },
    "duration": {
      "days": 6,
      "nights": 5,
      "departure_frequency": "Daily"
    },
    "group_size": {
      "min": 2,
      "max": 15
    },
    "pricing": {
      "currency": "USD",
      "base_per_person": 1200.00,
      "total_per_person": 1450.00,
      "single_supplement": 300.00,
      "confidence": 0.85,
      "confidence_label": "High"
    },
    "scores": {
      "value": 78,
      "transparency": 85,
      "trust": 90,
      "risk": 15,
      "overall": 82,
      "percentile": 85
    },
    "itinerary": {
      "nights": [
        {
          "night_number": 1,
          "city": "Paris",
          "hotel": {
            "name": "Hotel Le Marais",
            "rating": 4.0,
            "room_type": "Standard Double"
          },
          "meals": {
            "breakfast": true,
            "lunch": false,
            "dinner": true
          },
          "activities": "Eiffel Tower visit, Seine river cruise"
        }
      ]
    },
    "activities": [
      {
        "name": "Eiffel Tower Skip-the-Line",
        "type": "Sightseeing",
        "duration_hours": 2.5,
        "included": true,
        "market_value_usd": 45.00
      }
    ],
    "inclusions": [
      "5 nights accommodation",
      "Daily breakfast",
      "3 dinners",
      "All entrance fees",
      "Professional guide"
    ],
    "exclusions": [
      "International flights",
      "Travel insurance",
      "Personal expenses"
    ],
    "cancellation_policy": {
      "is_refundable": true,
      "free_cancellation_until": "2024-06-01",
      "policy_text": "Free cancellation up to 7 days before...",
      "risk_level": "low"
    },
    "source": {
      "tier": 2,
      "name": "viator",
      "url": "https://viator.com/tours/...",
      "affiliate_link": "https://viator.com/tours/...?ref=ontrip",
      "last_verified": "2024-01-01T00:00:00.000Z"
    },
    "data_quality": {
      "freshness_days": 1,
      "is_stale": false,
      "completeness_score": 0.92,
      "manual_review_status": "approved"
    },
    "warnings": [
      {
        "type": "health_advisory",
        "severity": "low",
        "text": "Check travel advisories before booking"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /packages/:id/comparison
Compare multiple packages.

**Path Parameters:**
- `id`: Primary package UUID

**Query Parameters:**
- `with_ids`: Comma-separated package UUIDs (max 3)

**Example Request:**
```
GET /packages/uuid1/comparison?with_ids=uuid2,uuid3
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "packages": [
      {
        "id": "uuid1",
        "name": "Package A",
        "pricing": { "total_per_person": 1450.00 },
        "scores": { "overall": 82 },
        "duration": { "days": 6, "nights": 5 }
      },
      {
        "id": "uuid2",
        "name": "Package B",
        "pricing": { "total_per_person": 1200.00 },
        "scores": { "overall": 75 },
        "duration": { "days": 5, "nights": 4 }
      }
    ],
    "comparison": {
      "price_difference": {
        "cheapest": "uuid2",
        "most_expensive": "uuid1",
        "difference_usd": 250.00,
        "difference_percent": 17.2
      },
      "score_difference": {
        "highest": "uuid1",
        "lowest": "uuid2",
        "difference": 7
      },
      "duration_difference": {
        "longest": "uuid1",
        "shortest": "uuid2",
        "difference_days": 1
      },
      "value_analysis": {
        "best_value": "uuid1",
        "reason": "Higher score justifies 17% price premium"
      }
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### GET /operators/:id
Get operator information.

**Path Parameters:**
- `id`: Operator UUID

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Paris Tours Co",
    "slug": "paris-tours-co",
    "website": "https://paristours.com",
    "email": "info@paristours.com",
    "phone": "+33 1 23 45 67 89",
    "country_code": "FR",
    "founded_year": 2010,
    "license_status": "verified",
    "license_expiry": "2025-12-31",
    "insurance_provider": "Allianz",
    "avg_rating": 4.5,
    "total_reviews": 1250,
    "trust_score": 90,
    "packages_count": 45,
    "destinations_covered": ["Paris", "Lyon", "Nice"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## ADMIN ENDPOINTS

### POST /admin/ingestion/trigger
Manually trigger data ingestion.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "tier": 2,
  "source_name": "viator"
}
```

**Response 200:**
```json
{
  "message": "Ingestion triggered for tier 2",
  "tier": 2,
  "source_name": "viator",
  "status": "queued"
}
```

---

### GET /admin/ingestion/status
Get recent ingestion job status.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200:**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "source_tier": 2,
      "source_name": "viator",
      "ingestion_date": "2024-01-01T00:00:00.000Z",
      "status": "success",
      "packages_found": 150,
      "packages_inserted": 45,
      "packages_updated": 105,
      "packages_skipped": 0,
      "execution_time_seconds": 120
    }
  ],
  "total": 50
}
```

---

### POST /admin/packages/manual-review
Approve or flag a package after manual review.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "package_id": "uuid",
  "status": "approved",
  "notes": "Verified pricing and itinerary",
  "reviewer_id": "admin_user_123"
}
```

**Response 200:**
```json
{
  "message": "Review recorded",
  "package_id": "uuid",
  "status": "approved"
}
```

---

### GET /admin/analytics
Get platform analytics.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response 200:**
```json
{
  "overview": {
    "total_packages": 5420,
    "fresh_packages": 4980,
    "destinations_covered": 45,
    "operators_tracked": 120,
    "searches_last_7d": 1250,
    "avg_results_per_search": 18.5
  },
  "tier_breakdown": [
    { "source_tier": 1, "count": 0 },
    { "source_tier": 2, "count": 4500 },
    { "source_tier": 4, "count": 480 }
  ]
}
```

---

### POST /admin/packages/recalculate-scores
Recalculate scores for packages.

**Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Request Body:**
```json
{
  "package_ids": ["uuid1", "uuid2", "uuid3"]
}
```

**Response 200:**
```json
{
  "message": "Score recalculation queued",
  "package_count": 3
}
```

---

## INTERNAL ENDPOINTS

### POST /ingestion/packages
Submit normalized packages from workers.

**Headers:**
```
X-API-Key: <INTERNAL_API_KEY>
```

**Request Body:**
```json
{
  "source_tier": 2,
  "source_name": "viator",
  "packages": [
    {
      "external_id": "viator_12345",
      "source_tier": 2,
      "source_name": "viator",
      "source_url": "https://viator.com/...",
      "name": "Paris Highlights Tour",
      "description": "...",
      "total_days": 6,
      "total_nights": 5,
      "currency": "USD",
      "price_per_person_base": 1200.00,
      "price_per_person_total": 1450.00,
      "pricing_confidence": 0.85,
      "canonical_data": {
        "inclusions": [],
        "exclusions": [],
        "itinerary": {}
      },
      "raw_data": {},
      "last_seen": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Response 200:**
```json
{
  "status": "success",
  "results": {
    "inserted": 45,
    "updated": 105,
    "skipped": 0,
    "errors": []
  }
}
```

---

### POST /ingestion/destinations
Bulk insert/update destinations.

**Headers:**
```
X-API-Key: <INTERNAL_API_KEY>
```

**Request Body:**
```json
{
  "destinations": [
    {
      "name": "Paris",
      "slug": "paris",
      "country_code": "FR",
      "latitude": 48.8566,
      "longitude": 2.3522
    }
  ]
}
```

**Response 200:**
```json
{
  "status": "success",
  "inserted": 1,
  "updated": 0
}
```

---

## WEBHOOKS (Future)

### Package Price Change
Triggered when package price changes by >10%.

**Payload:**
```json
{
  "event": "package.price_changed",
  "package_id": "uuid",
  "old_price": 1450.00,
  "new_price": 1200.00,
  "change_percent": -17.2,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## CHANGELOG

### v1.0 (2024-01-01)
- Initial API release
- Public search and package endpoints
- Admin ingestion and review endpoints
- Internal worker ingestion endpoints

import { z } from "zod";

// Zod validation schemas for request validation

export const SearchQuerySchema = z.object({
  destination: z.string().min(2).max(255),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  duration_days: z.number().min(1).max(365).optional(),
  price_min: z.number().min(0).optional(),
  price_max: z.number().min(0).optional(),
  travel_styles: z.string().array().optional(),
  difficulty: z.enum(["Easy", "Moderate", "Strenuous"]).optional(),
  sort: z
    .enum(["overall_score", "value_score", "trust_score", "price", "newest"])
    .optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const TourPackageInputSchema = z.object({
  external_id: z.string().min(1),
  source_tier: z.number().min(1).max(7),
  source_name: z.string().min(1),
  source_url: z.string().url(),
  operator_id: z.string().uuid().optional(),

  name: z.string().min(5).max(500),
  description: z.string().max(2000).optional(),
  destination: z.string().min(2),
  total_days: z.number().min(1).max(365),
  total_nights: z.number().min(0).max(365),

  price_per_person: z.number().positive(),
  currency: z.string().length(3),

  departure_dates: z.string().array(),

  cancellation_policy: z.object({
    is_refundable: z.boolean(),
    free_cancellation_until: z.string().date().optional(),
    policy_text: z.string(),
  }),

  nights: z
    .array(
      z.object({
        night_number: z.number(),
        city: z.string(),
        hotel_name: z.string(),
        meals: z.object({
          breakfast: z.boolean(),
          lunch: z.boolean(),
          dinner: z.boolean(),
        }),
      })
    )
    .optional(),

  activities: z
    .array(
      z.object({
        name: z.string(),
        city: z.string().optional(),
        duration_hours: z.number().optional(),
        included: z.boolean(),
      })
    )
    .optional(),
});

export const OperatorInputSchema = z.object({
  name: z.string().min(2).max(255),
  website_url: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  country_code: z.string().length(2).optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()),
  license_status: z.enum(["verified", "unverified", "suspended"]),
});

export const ManualReviewSchema = z.object({
  package_id: z.string().uuid(),
  status: z.enum(["approved", "flagged", "needs_edit"]),
  notes: z.string().optional(),
  issues_found: z.record(z.string()).optional(),
});

export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type TourPackageInput = z.infer<typeof TourPackageInputSchema>;
export type OperatorInput = z.infer<typeof OperatorInputSchema>;
export type ManualReview = z.infer<typeof ManualReviewSchema>;

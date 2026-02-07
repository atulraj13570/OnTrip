import { Router, Request, Response } from "express";
import { PackageService } from "../services/PackageService";
import { ScoringEngine } from "../services/ScoringEngine";
import { SearchQuerySchema } from "../validation/schemas";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

/**
 * GET /api/v1/search
 * Search for tour packages
 */
router.get("/", async (req: Request, res: Response) => {
  const validated = SearchQuerySchema.safeParse({
    destination: req.query.destination,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
    duration_days: req.query.duration_days
      ? parseInt(req.query.duration_days as string)
      : undefined,
    price_min: req.query.price_min
      ? parseInt(req.query.price_min as string)
      : undefined,
    price_max: req.query.price_max
      ? parseInt(req.query.price_max as string)
      : undefined,
    travel_styles: req.query.travel_styles
      ? (req.query.travel_styles as string).split(",")
      : undefined,
    difficulty: req.query.difficulty,
    sort: req.query.sort || "overall_score",
    page: req.query.page ? parseInt(req.query.page as string) : 1,
    limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
  });

  if (!validated.success) {
    throw validated.error;
  }

  const { destination, price_min, price_max, sort, page, limit } =
    validated.data;

  // Search packages
  const { packages, total } = await PackageService.searchPackages(
    destination,
    price_min,
    price_max,
    sort || "overall_score",
    page,
    limit
  );

  res.json({
    success: true,
    data: {
      total_results: total,
      page,
      limit,
      packages: packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        destination: pkg.destination,
        days: pkg.total_days,
        nights: pkg.total_nights,
        price_per_person: pkg.pricing.total_per_person,
        currency: pkg.pricing.currency,
        value_score: pkg.value_score,
        trust_score: pkg.trust_score,
        overall_score: pkg.overall_score,
        source_tier: pkg.source_tier,
        source_name: pkg.source_name,
        operator: pkg.operator_id,
        data_freshness_days: pkg.data_freshness_days,
      })),
      filters_available: {
        price_ranges: [],
        durations: [],
        travel_styles: [],
      },
    },
    timestamp: new Date().toISOString(),
    request_id: req.id,
  });
});

export default router;

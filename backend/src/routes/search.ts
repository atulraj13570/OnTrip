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

  try {
    // Search packages
    const { packages, total } = await PackageService.searchPackages(
      destination,
      price_min,
      price_max,
      sort || "overall_score",
      page,
      limit
    );

    // Map to API response format
    const results = packages.map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      description: pkg.description,
      price_per_person: pkg.pricing?.total_per_person || 0,
      currency: pkg.pricing?.currency || "INR",
      days: pkg.total_days,
      nights: pkg.total_nights,
      destination: destination, // Use searched destination
      source_name: pkg.source_name,
      source_url: pkg.source_url,
      overall_score: pkg.overall_score || 0,
      value_score: pkg.value_score || 0,
      transparency_score: pkg.transparency_score || 0,
      trust_score: pkg.trust_score || 0,
      risk_score: pkg.risk_score || 0,
      operator: pkg.operator_data || {
        name: pkg.source_name,
        avg_rating: 4.5
      }
    }));

    res.json({
      success: true,
      data: {
        packages: results,
        total,
        page,
        limit,
      },
    });
  } catch (error: any) {
    console.error("SEARCH_ROUTE_ERROR_DETAILED:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      aggregate: error.errors // In case of AggregateError
    });
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred",
        statusCode: 500,
      },
    });
  }
});

export default router;

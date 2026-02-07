import { Router, Request, Response } from "express";
import { PackageService } from "../services/PackageService";
import { ApiError } from "../middleware/errorHandler";

const router = Router();

/**
 * GET /api/v1/packages/:id
 * Get detailed package information
 */
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  const pkg = await PackageService.getPackageById(id);

  if (!pkg) {
    throw new ApiError("PACKAGE_NOT_FOUND", "Package not found", 404);
  }

  res.json({
    success: true,
    data: {
      ...pkg,
      // Add display information
      source_info: {
        tier: pkg.source_tier,
        name: pkg.source_name,
        url: pkg.source_url,
        freshness_days: pkg.data_freshness_days,
        confidence: pkg.confidence_score,
        last_updated: pkg.last_seen,
      },
      scoring_explanation: {
        value_score: {
          score: pkg.value_score,
          explanation: "Based on cost per night vs market average",
        },
        transparency_score: {
          score: pkg.transparency_score,
          explanation: "Based on clarity of terms and completeness of info",
        },
        trust_score: {
          score: pkg.trust_score,
          explanation: "Based on operator reviews and reputation",
        },
        risk_score: {
          score: pkg.risk_score,
          explanation: "Based on cancellation policy and destination safety",
        },
      },
    },
    timestamp: new Date().toISOString(),
    request_id: req.id,
  });
});

/**
 * GET /api/v1/packages/:id/comparison
 * Compare packages side-by-side
 */
router.get("/:id/comparison", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { with_ids } = req.query;

  if (!with_ids) {
    throw new ApiError(
      "INVALID_REQUEST",
      "with_ids query parameter required",
      400
    );
  }

  const ids = (with_ids as string).split(",");
  ids.push(id);

  // Fetch all packages
  const packages = await Promise.all(
    ids.map((pkgId) => PackageService.getPackageById(pkgId))
  );

  const validPackages = packages.filter(
    (pkg): pkg is typeof packages[0] => pkg !== null
  );

  res.json({
    success: true,
    data: {
      packages: validPackages,
      comparison: {
        prices: validPackages.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.pricing.total_per_person,
          currency: p.pricing.currency,
        })),
        scores: validPackages.map((p) => ({
          id: p.id,
          name: p.name,
          value: p.value_score,
          transparency: p.transparency_score,
          trust: p.trust_score,
          overall: p.overall_score,
        })),
      },
    },
    timestamp: new Date().toISOString(),
    request_id: req.id,
  });
});

export default router;

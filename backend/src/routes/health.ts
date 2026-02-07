import { Router, Request, Response } from "express";

const router = Router();

/**
 * GET /api/v1/health
 * Health check endpoint
 */
router.get("/", async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
    request_id: req.id,
  });
});

export default router;

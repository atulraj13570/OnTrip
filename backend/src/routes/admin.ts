import { Router, Request, Response } from 'express';
import { db } from '../database/db';

const router = Router();

/**
 * POST /api/v1/admin/ingestion/trigger
 * Manually trigger data ingestion for specific tier
 */
router.post('/ingestion/trigger', async (req: Request, res: Response) => {
  const { tier, source_name } = req.body;

  if (!tier || tier < 1 || tier > 7) {
    return res.status(400).json({ error: 'Invalid tier (1-7 required)' });
  }

  try {
    // TODO: Trigger Celery task via Redis
    // For now, log the request
    await db.query(
      `INSERT INTO ingestion_log (source_tier, source_name, status, packages_found)
       VALUES ($1, $2, 'triggered', 0)`,
      [tier, source_name || `tier_${tier}`]
    );

    res.json({
      message: `Ingestion triggered for tier ${tier}`,
      tier,
      source_name,
      status: 'queued'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trigger ingestion' });
  }
});

/**
 * GET /api/v1/admin/ingestion/status
 * Get recent ingestion job status
 */
router.get('/ingestion/status', async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT 
        id, source_tier, source_name, ingestion_date, status,
        packages_found, packages_inserted, packages_updated,
        error_message, execution_time_seconds
       FROM ingestion_log
       ORDER BY ingestion_date DESC
       LIMIT 50`
    );

    res.json({
      jobs: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ingestion status' });
  }
});

/**
 * POST /api/v1/admin/packages/manual-review
 * Approve or flag a package after manual review
 */
router.post('/packages/manual-review', async (req: Request, res: Response) => {
  const { package_id, status, notes, reviewer_id } = req.body;

  if (!package_id || !status || !reviewer_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!['approved', 'flagged', 'needs_edit'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    // Insert review record
    await db.query(
      `INSERT INTO manual_reviews (package_id, reviewer_id, status, notes)
       VALUES ($1, $2, $3, $4)`,
      [package_id, reviewer_id, status, notes || null]
    );

    // Update package status
    await db.query(
      `UPDATE tour_packages
       SET manual_review_status = $1, manual_review_notes = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [status, notes, package_id]
    );

    res.json({
      message: 'Review recorded',
      package_id,
      status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record review' });
  }
});

/**
 * GET /api/v1/admin/analytics
 * Get platform analytics
 */
router.get('/analytics', async (req: Request, res: Response) => {
  try {
    const stats = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM tour_packages) as total_packages,
        (SELECT COUNT(*) FROM tour_packages WHERE is_stale = false) as fresh_packages,
        (SELECT COUNT(DISTINCT destination_id) FROM tour_packages) as destinations_covered,
        (SELECT COUNT(*) FROM tour_operators) as operators_tracked,
        (SELECT COUNT(*) FROM search_queries WHERE created_at > NOW() - INTERVAL '7 days') as searches_last_7d,
        (SELECT AVG(results_returned) FROM search_queries WHERE created_at > NOW() - INTERVAL '7 days') as avg_results_per_search
    `);

    const tierBreakdown = await db.query(`
      SELECT source_tier, COUNT(*) as count
      FROM tour_packages
      WHERE is_stale = false
      GROUP BY source_tier
      ORDER BY source_tier
    `);

    res.json({
      overview: stats.rows[0],
      tier_breakdown: tierBreakdown.rows
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * POST /api/v1/admin/packages/recalculate-scores
 * Recalculate scores for stale packages
 */
router.post('/packages/recalculate-scores', async (req: Request, res: Response) => {
  const { package_ids } = req.body;

  if (!package_ids || !Array.isArray(package_ids)) {
    return res.status(400).json({ error: 'package_ids array required' });
  }

  try {
    // TODO: Trigger scoring recalculation via worker
    res.json({
      message: 'Score recalculation queued',
      package_count: package_ids.length
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to queue recalculation' });
  }
});

export default router;

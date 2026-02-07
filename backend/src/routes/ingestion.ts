import { Router, Request, Response } from 'express';
import { db } from '../database/db';
import { ScoringEngine } from '../services/ScoringEngine';

const router = Router();

/**
 * POST /api/v1/ingestion/packages
 * Receive normalized packages from Python workers
 * Internal endpoint - should be protected by API key
 */
router.post('/packages', async (req: Request, res: Response) => {
  const { packages, source_tier, source_name } = req.body;

  if (!packages || !Array.isArray(packages)) {
    return res.status(400).json({ error: 'packages array required' });
  }

  if (!source_tier || source_tier < 1 || source_tier > 7) {
    return res.status(400).json({ error: 'valid source_tier (1-7) required' });
  }

  const results = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    for (const pkg of packages) {
      try {
        // Check if package already exists
        const existing = await db.query(
          `SELECT id, data_version, price_per_person_total, last_seen
           FROM tour_packages
           WHERE source_name = $1 AND external_id = $2
           LIMIT 1`,
          [pkg.source_name, pkg.external_id]
        );

        if (existing.rows.length > 0) {
          // Update existing package
          const existingPkg = existing.rows[0];
          
          // Check if price changed significantly (>5%)
          const priceChange = Math.abs(
            (pkg.price_per_person_total - existingPkg.price_per_person_total) / 
            existingPkg.price_per_person_total
          );

          if (priceChange > 0.05) {
            // Create version snapshot
            await db.query(
              `INSERT INTO tour_package_versions 
               (package_id, version_number, price_per_person, snapshot_data, changed_fields)
               VALUES ($1, $2, $3, $4, $5)`,
              [
                existingPkg.id,
                existingPkg.data_version + 1,
                pkg.price_per_person_total,
                JSON.stringify(pkg),
                ['price_per_person_total']
              ]
            );
          }

          // Update package
          await db.query(
            `UPDATE tour_packages
             SET 
               name = $1,
               description = $2,
               total_days = $3,
               total_nights = $4,
               price_per_person_base = $5,
               price_per_person_total = $6,
               pricing_confidence = $7,
               canonical_data = $8,
               raw_data = $9,
               last_seen = CURRENT_TIMESTAMP,
               data_version = data_version + 1,
               updated_at = CURRENT_TIMESTAMP
             WHERE id = $10`,
            [
              pkg.name,
              pkg.description,
              pkg.total_days,
              pkg.total_nights,
              pkg.price_per_person_base,
              pkg.price_per_person_total,
              pkg.pricing_confidence,
              JSON.stringify(pkg.canonical_data),
              JSON.stringify(pkg.raw_data),
              existingPkg.id
            ]
          );

          results.updated++;
        } else {
          // Insert new package
          const insertResult = await db.query(
            `INSERT INTO tour_packages (
              external_id, source_tier, source_name, source_url,
              destination_id, operator_id,
              name, description, slug,
              total_days, total_nights,
              currency, price_per_person_base, price_per_person_total,
              pricing_confidence,
              canonical_data, raw_data,
              first_seen, last_seen
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
              CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING id`,
            [
              pkg.external_id,
              pkg.source_tier,
              pkg.source_name,
              pkg.source_url,
              pkg.destination_id || null,
              pkg.operator_id || null,
              pkg.name,
              pkg.description || '',
              pkg.slug || pkg.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              pkg.total_days,
              pkg.total_nights,
              pkg.currency,
              pkg.price_per_person_base,
              pkg.price_per_person_total,
              pkg.pricing_confidence,
              JSON.stringify(pkg.canonical_data),
              JSON.stringify(pkg.raw_data)
            ]
          );

          const packageId = insertResult.rows[0].id;

          // Calculate scores (async, don't block response)
          calculateScoresAsync(packageId).catch(err => {
            console.error(`Failed to calculate scores for ${packageId}:`, err);
          });

          results.inserted++;
        }
      } catch (pkgError: any) {
        results.errors.push(`${pkg.external_id}: ${pkgError.message}`);
        results.skipped++;
      }
    }

    // Log ingestion
    await db.query(
      `INSERT INTO ingestion_log (
        source_tier, source_name, status,
        packages_found, packages_inserted, packages_updated, packages_skipped
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        source_tier,
        source_name,
        results.errors.length > 0 ? 'partial' : 'success',
        packages.length,
        results.inserted,
        results.updated,
        results.skipped
      ]
    );

    res.json({
      status: 'success',
      results
    });
  } catch (error: any) {
    console.error('Ingestion error:', error);
    
    // Log failure
    await db.query(
      `INSERT INTO ingestion_log (
        source_tier, source_name, status, error_message
      ) VALUES ($1, $2, 'failed', $3)`,
      [source_tier, source_name, error.message]
    );

    res.status(500).json({ error: 'Ingestion failed', details: error.message });
  }
});

/**
 * Calculate scores asynchronously
 */
async function calculateScoresAsync(packageId: string) {
  try {
    // Fetch package data
    const result = await db.query(
      `SELECT * FROM tour_packages WHERE id = $1`,
      [packageId]
    );

    if (result.rows.length === 0) return;

    const pkg = result.rows[0];

    // Calculate market baseline (simplified - should query similar packages)
    const marketBaseline = {
      avg_cost_per_night: 150,
      avg_cost_per_activity: 50
    };

    // Calculate scores
    const valueScore = ScoringEngine.calculateValueScore(pkg, marketBaseline);
    const transparencyScore = ScoringEngine.calculateTransparencyScore(pkg);
    const trustScore = ScoringEngine.calculateTrustScore(pkg);
    const riskScore = ScoringEngine.calculateRiskScore(pkg);
    const overallScore = ScoringEngine.calculateOverallScore({
      ...pkg,
      value_score: valueScore,
      transparency_score: transparencyScore,
      trust_score: trustScore,
      risk_score: riskScore
    });

    // Update scores
    await db.query(
      `UPDATE tour_packages
       SET 
         value_score = $1,
         transparency_score = $2,
         trust_score = $3,
         risk_score = $4,
         overall_score = $5,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6`,
      [valueScore, transparencyScore, trustScore, riskScore, overallScore, packageId]
    );
  } catch (error) {
    console.error(`Score calculation failed for ${packageId}:`, error);
  }
}

/**
 * POST /api/v1/ingestion/destinations
 * Bulk insert/update destinations
 */
router.post('/destinations', async (req: Request, res: Response) => {
  const { destinations } = req.body;

  if (!destinations || !Array.isArray(destinations)) {
    return res.status(400).json({ error: 'destinations array required' });
  }

  try {
    let inserted = 0;
    let updated = 0;

    for (const dest of destinations) {
      const result = await db.query(
        `INSERT INTO destinations (name, name_slug, country_code, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (name_slug) DO UPDATE
         SET name = EXCLUDED.name,
             country_code = EXCLUDED.country_code,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude,
             updated_at = CURRENT_TIMESTAMP
         RETURNING (xmax = 0) AS inserted`,
        [dest.name, dest.slug, dest.country_code, dest.latitude, dest.longitude]
      );

      if (result.rows[0].inserted) {
        inserted++;
      } else {
        updated++;
      }
    }

    res.json({
      status: 'success',
      inserted,
      updated
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to insert destinations', details: error.message });
  }
});

export default router;

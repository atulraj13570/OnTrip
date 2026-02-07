import { query } from "../database/db";
import { TourPackage, Destination } from "../types";

export class PackageService {
  /**
   * Search for tour packages with filters
   */
  static async searchPackages(
    destination: string,
    priceMin?: number,
    priceMax?: number,
    sortBy: string = "overall_score",
    page: number = 1,
    limit: number = 20
  ): Promise<{ packages: TourPackage[]; total: number }> {
    const offset = (page - 1) * limit;

    // Find destination
    const destResult = await query(
      "SELECT id FROM destinations WHERE name_slug = $1",
      [destination.toLowerCase().replace(/\s+/g, "-")]
    );

    if (destResult.rows.length === 0) {
      return { packages: [], total: 0 };
    }

    const destinationId = destResult.rows[0].id;

    // Build query
    let sql = `
      SELECT tp.*, 
             JSON_BUILD_OBJECT(
               'name', to.name,
               'slug', to.slug,
               'avg_rating', to.avg_rating,
               'trust_score', to.trust_score
             ) as operator
      FROM tour_packages tp
      LEFT JOIN tour_operators to ON tp.operator_id = to.id
      WHERE tp.destination_id = $1
        AND tp.is_stale = false
        AND tp.last_seen > NOW() - INTERVAL '30 days'
    `;

    const params: unknown[] = [destinationId];
    let paramIndex = 2;

    if (priceMin !== undefined) {
      sql += ` AND tp.price_per_person_total >= $${paramIndex}`;
      params.push(priceMin);
      paramIndex++;
    }

    if (priceMax !== undefined) {
      sql += ` AND tp.price_per_person_total <= $${paramIndex}`;
      params.push(priceMax);
      paramIndex++;
    }

    // Sorting
    const validSortFields = ["overall_score", "price_per_person_total", "trust_score", "created_at"];
    const sortField = validSortFields.includes(sortBy) ? sortBy : "overall_score";
    const sortOrder = sortBy === "price_per_person_total" ? "ASC" : "DESC";

    sql += ` ORDER BY tp.${sortField} ${sortOrder}`;

    // Count total
    const countResult = await query(
      `SELECT COUNT(*) FROM tour_packages WHERE destination_id = $1 AND is_stale = false`,
      [destinationId]
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Pagination
    sql += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await query(sql, params);

    return {
      packages: result.rows as TourPackage[],
      total,
    };
  }

  /**
   * Get a single package by ID
   */
  static async getPackageById(id: string): Promise<TourPackage | null> {
    const result = await query(
      `SELECT tp.*, 
              JSON_BUILD_OBJECT(
                'name', to.name,
                'slug', to.slug,
                'avg_rating', to.avg_rating,
                'trust_score', to.trust_score,
                'total_reviews', to.total_reviews,
                'founded_year', to.founded_year,
                'website_url', to.website_url
              ) as operator
       FROM tour_packages tp
       LEFT JOIN tour_operators to ON tp.operator_id = to.id
       WHERE tp.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return null;
    }

    // Fetch related data
    const pkg = result.rows[0] as TourPackage;

    // Get nights
    const nightsResult = await query(
      "SELECT * FROM package_nights WHERE package_id = $1 ORDER BY night_number ASC",
      [id]
    );
    pkg.nights = nightsResult.rows;

    // Get activities
    const activitiesResult = await query(
      "SELECT * FROM package_activities WHERE package_id = $1 ORDER BY activity_number ASC",
      [id]
    );
    pkg.activities = activitiesResult.rows;

    // Get cancellation policy
    const cancellationResult = await query(
      "SELECT * FROM cancellation_policies WHERE package_id = $1",
      [id]
    );
    if (cancellationResult.rows.length > 0) {
      pkg.cancellation_policy = cancellationResult.rows[0];
    }

    // Get warnings
    const warningsResult = await query(
      "SELECT * FROM warnings WHERE package_id = $1",
      [id]
    );
    pkg.warnings = warningsResult.rows;

    return pkg;
  }

  /**
   * Insert or update a package
   */
  static async upsertPackage(pkg: Partial<TourPackage>): Promise<TourPackage> {
    // This is simplified; in production use proper upsert logic
    const result = await query(
      `INSERT INTO tour_packages (
        external_id, source_tier, source_name, source_url,
        operator_id, destination_id, name, description,
        total_days, total_nights, price_per_person_base,
        price_per_person_total, currency,
        data_version, last_seen, canonical_data, raw_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      ON CONFLICT (source_name, external_id)
      DO UPDATE SET 
        last_seen = CURRENT_TIMESTAMP,
        data_version = data_version + 1,
        canonical_data = EXCLUDED.canonical_data,
        raw_data = EXCLUDED.raw_data
      RETURNING *`,
      [
        pkg.external_id,
        pkg.source_tier,
        pkg.source_name,
        pkg.source_url,
        pkg.operator_id,
        pkg.destination_id,
        pkg.name,
        pkg.description,
        pkg.total_days,
        pkg.total_nights,
        pkg.pricing?.per_person_base,
        pkg.pricing?.total_per_person,
        pkg.pricing?.currency,
        pkg.data_version || 1,
        new Date(),
        pkg.canonical_data,
        pkg.raw_data,
      ]
    );

    return result.rows[0];
  }

  /**
   * Get market baseline for comparison
   */
  static async getMarketBaseline(
    destinationId: string,
    days: number
  ): Promise<{
    avg_cost_per_night: number;
    avg_cost_per_activity: number;
  }> {
    const result = await query(
      `SELECT 
        AVG(price_per_person_total / NULLIF(total_nights, 0)) as avg_cost_per_night,
        AVG(price_per_person_total / 
          NULLIF(ARRAY_LENGTH(canonical_data->'activities', 1), 0)
        ) as avg_cost_per_activity
       FROM tour_packages
       WHERE destination_id = $1 
         AND total_days BETWEEN $2 AND $3
         AND source_tier <= 2
         AND last_seen > NOW() - INTERVAL '30 days'`,
      [destinationId, days - 2, days + 2]
    );

    return {
      avg_cost_per_night: result.rows[0]?.avg_cost_per_night || 100,
      avg_cost_per_activity: result.rows[0]?.avg_cost_per_activity || 50,
    };
  }
}

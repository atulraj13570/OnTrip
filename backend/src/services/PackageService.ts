import { query } from "../database/db";
import { TourPackage, Destination } from "../types";

export class PackageService {
  private static memoryDb = new Map<string, TourPackage>();
  private static memoriesByDest = new Map<string, Set<string>>();

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
    const slug = destination.toLowerCase().replace(/\s+/g, "-");
    const offset = (page - 1) * limit;

    try {
      // Find destination
      const destResult = await query(
        "SELECT id FROM destinations WHERE name_slug = $1",
        [slug]
      );

      if (destResult.rows.length === 0) {
        return this.searchMemory(slug, priceMin, priceMax, sortBy, page, limit);
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
               ) as operator_data
        FROM tour_packages tp
        LEFT JOIN tour_operators to ON tp.operator_id = to.id
        WHERE tp.destination_id = $1
          AND tp.is_stale = false
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
      const packages = result.rows.map(row => this.mapRowToPackage(row));

      return {
        packages,
        total,
      };
    } catch (e: any) {
      console.warn("SEARCH_FALLBACK_TO_MEMORY:", e.message);
      return this.searchMemory(slug, priceMin, priceMax, sortBy, page, limit);
    }
  }

  private static searchMemory(
    slug: string,
    priceMin?: number,
    priceMax?: number,
    sortBy: string = "overall_score",
    page: number = 1,
    limit: number = 20
  ): { packages: TourPackage[]; total: number } {
    const ids = this.memoriesByDest.get(slug) || new Set();
    let packages = Array.from(ids).map(id => this.memoryDb.get(id)!).filter(p => !!p);
    
    if (priceMin) packages = packages.filter(p => (p.pricing?.total_per_person || 0) >= priceMin);
    if (priceMax) packages = packages.filter(p => (p.pricing?.total_per_person || 0) <= priceMax);
    
    // Sort
    packages.sort((a,b) => (b.overall_score || 0) - (a.overall_score || 0));

    const total = packages.length;
    const start = (page - 1) * limit;
    return {
      packages: packages.slice(start, start + limit),
      total
    };
  }

  /**
   * Insert or update a package
   */
  static async upsertPackage(pkgData: any): Promise<TourPackage> {
    const slug = pkgData.destination_id || 'global';
    
    try {
      const result = await query(
        `INSERT INTO tour_packages (
          external_id, source_tier, source_name, source_url,
          operator_id, destination_id, name, description,
          total_days, total_nights, price_per_person_base,
          price_per_person_total, currency,
          data_version, last_seen, canonical_data, raw_data,
          overall_score, value_score, transparency_score, trust_score, risk_score,
          image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
        ON CONFLICT (source_name, external_id, COALESCE(min_departure_date, '1900-01-01'::DATE))
        DO UPDATE SET 
          last_seen = CURRENT_TIMESTAMP,
          data_version = tour_packages.data_version + 1,
          canonical_data = EXCLUDED.canonical_data,
          raw_data = EXCLUDED.raw_data,
          price_per_person_base = EXCLUDED.price_per_person_base,
          price_per_person_total = EXCLUDED.price_per_person_total,
          overall_score = EXCLUDED.overall_score,
          value_score = EXCLUDED.value_score,
          transparency_score = EXCLUDED.transparency_score,
          trust_score = EXCLUDED.trust_score,
          risk_score = EXCLUDED.risk_score,
          image_url = EXCLUDED.image_url
        RETURNING *`,
        [
          pkgData.external_id,
          pkgData.source_tier,
          pkgData.source_name,
          pkgData.source_url,
          pkgData.operator_id,
          pkgData.destination_id,
          pkgData.name,
          pkgData.description,
          pkgData.total_days,
          pkgData.total_nights,
          pkgData.pricing?.per_person_base || 0,
          pkgData.pricing?.total_per_person || 0,
          pkgData.pricing?.currency || 'INR',
          pkgData.data_version || 1,
          new Date(),
          pkgData.canonical_data || {},
          pkgData.raw_data || {},
          pkgData.overall_score || 0,
          pkgData.value_score || 0,
          pkgData.transparency_score || 0,
          pkgData.trust_score || 0,
          pkgData.risk_score || 0,
          pkgData.image_url
        ]
      );

      const savedPkg = this.mapRowToPackage(result.rows[0]);
      this.syncToMemory(savedPkg);
      return savedPkg;
    } catch (e: any) {
      console.warn("UPSERT_FALLBACK_TO_MEMORY:", e.message);
      const id = pkgData.id || pkgData.external_id || Math.random().toString();
      const pkgFull = { ...pkgData, id } as TourPackage;
      this.syncToMemory(pkgFull);
      return pkgFull;
    }
  }

  private static syncToMemory(pkg: TourPackage) {
    this.memoryDb.set(pkg.id, pkg);
    const destId = pkg.destination_id || 'global';
    if (!this.memoriesByDest.has(destId)) this.memoriesByDest.set(destId, new Set());
    this.memoriesByDest.get(destId)!.add(pkg.id);
  }

  /**
   * Helper to map a database row to the TourPackage interface
   */
  private static mapRowToPackage(row: any): TourPackage {
    return {
      ...row,
      pricing: {
        currency: row.currency as string,
        per_person_base: parseFloat(row.price_per_person_base as string),
        total_per_person: parseFloat(row.price_per_person_total as string),
        price_date: row.last_seen as Date,
        price_type: "fixed",
        taxes_fees: 0,
        payment_schedule: {
          deposit_amount: 0,
          deposit_percentage: 0,
          balance_due_days_before: 0
        }
      },
      overall_score: parseFloat(row.overall_score as string) || 0,
      value_score: parseFloat(row.value_score as string) || 0,
      transparency_score: parseFloat(row.transparency_score as string) || 0,
      trust_score: parseFloat(row.trust_score as string) || 0,
      risk_score: parseFloat(row.risk_score as string) || 0,
    } as TourPackage;
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
    try {
      const result = await query(
        `SELECT 
          AVG(price_per_person_total / NULLIF(total_nights, 0)) as avg_cost_per_night,
          AVG(price_per_person_total / 
            NULLIF(
              CASE 
                WHEN JSONB_TYPEOF(canonical_data->'activities') = 'array' 
                THEN JSONB_ARRAY_LENGTH(canonical_data->'activities') 
                ELSE 0 
              END, 0)
          ) as avg_cost_per_activity
         FROM tour_packages
         WHERE destination_id = $1 
           AND total_days BETWEEN $2 AND $3`,
        [destinationId, days - 2, days + 2]
      );

      const row = result.rows[0];
      return {
        avg_cost_per_night: parseFloat(row?.avg_cost_per_night) || 2000,
        avg_cost_per_activity: parseFloat(row?.avg_cost_per_activity) || 1000,
      };
    } catch (e) {
      return {
        avg_cost_per_night: 2200,
        avg_cost_per_activity: 1200,
      };
    }
  }
}

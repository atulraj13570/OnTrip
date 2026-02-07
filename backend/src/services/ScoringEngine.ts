import { TourPackage } from "../types";

/**
 * Scoring Engine - Calculates value, trust, transparency, risk, and overall scores
 */

export class ScoringEngine {
  /**
   * Calculate value score (0-100)
   * Measures cost-per-unit-of-value compared to market median
   */
  static calculateValueScore(
    pkg: TourPackage,
    marketBaseline: { avg_cost_per_night: number; avg_cost_per_activity: number }
  ): number {
    let score = 50; // Neutral baseline

    const costPerNight = pkg.pricing.total_per_person / pkg.total_nights;
    const marketCostPerNight = marketBaseline.avg_cost_per_night;

    // Adjust for cost per night
    if (costPerNight < marketCostPerNight * 0.85) {
      score += 20; // Well below market
    } else if (costPerNight < marketCostPerNight) {
      score += 10; // Below market
    } else if (costPerNight > marketCostPerNight * 1.2) {
      score -= 15; // Above market
    }

    // Adjust for hotel rating
    const avgHotelRating =
      pkg.nights.reduce((sum, n) => sum + (n.hotel.rating || 0), 0) /
      pkg.nights.length;
    if (avgHotelRating >= 4.5) {
      score += 15;
    } else if (avgHotelRating < 3.0) {
      score -= 10;
    }

    // Adjust for meals
    const mealsIncluded = pkg.nights.filter(
      (n) => n.meals.breakfast || n.meals.lunch || n.meals.dinner
    ).length;
    const mealsProportion = mealsIncluded / pkg.total_nights;
    score += mealsProportion * 10;

    // Adjust for activity value
    const activityMarketValue = pkg.activities
      .filter((a) => a.included)
      .reduce((sum, a) => sum + (a.estimated_market_value || 0), 0);

    if (activityMarketValue > pkg.pricing.total_per_person * 0.5) {
      score += 15;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate transparency score (0-100)
   * Measures clarity of terms, completeness of itinerary, absence of hidden fees
   */
  static calculateTransparencyScore(pkg: TourPackage): number {
    let score = 50;

    // Check for detailed itinerary
    if (pkg.nights && pkg.nights.length === pkg.total_nights) {
      score += 15;
    } else if (pkg.nights && pkg.nights.length > 0) {
      score += 5;
    }

    // Check for meal clarity
    const mealsSpecified = pkg.nights.filter(
      (n) => n.meals.breakfast || n.meals.lunch || n.meals.dinner
    ).length;
    if (mealsSpecified === pkg.nights.length) {
      score += 10;
    }

    // Check for activity detail
    if (pkg.activities && pkg.activities.length > 0) {
      const activitiesWithDetails = pkg.activities.filter(
        (a) => a.description && a.description.length > 20
      ).length;
      if (activitiesWithDetails === pkg.activities.length) {
        score += 10;
      }
    }

    // Check cancellation policy clarity
    if (
      pkg.cancellation_policy &&
      pkg.cancellation_policy.policy_text &&
      pkg.cancellation_policy.policy_text.length > 100
    ) {
      score += 15;
    }

    // Check for suspicious language
    if (this.hasSuspiciousLanguage(pkg.description)) {
      score -= 20;
    }

    // Check exclusions
    if (pkg.exclusions && pkg.exclusions.length > 2) {
      score += 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate trust score (0-100)
   * Based on operator reviews, complaints, verified credentials
   */
  static calculateTrustScore(pkg: TourPackage): number {
    let score = 50;

    const operator = pkg.operator_id;
    if (!operator) {
      return score;
    }

    // This would fetch operator data in real implementation
    // For now, return baseline
    return score;
  }

  /**
   * Calculate risk score (0-100)
   * Higher score = riskier package
   */
  static calculateRiskScore(
    pkg: TourPackage,
    destinationRisk: number = 20
  ): number {
    let riskScore = 0;

    // Destination risk
    riskScore += destinationRisk * 0.3;

    // Cancellation policy risk
    if (!pkg.cancellation_policy.is_refundable) {
      riskScore += 25;
    } else if (!pkg.cancellation_policy.free_cancellation_until) {
      riskScore += 15;
    }

    // Data freshness risk
    if (pkg.data_freshness_days > 7) {
      riskScore += 10;
    }

    // Source tier risk (higher tier = less risky)
    if (pkg.source_tier >= 4) {
      riskScore += 10;
    }

    return Math.max(0, Math.min(100, riskScore));
  }

  /**
   * Calculate overall score (weighted combination)
   */
  static calculateOverallScore(pkg: TourPackage): number {
    const weights = {
      value: 0.25,
      transparency: 0.25,
      trust: 0.35,
      risk: 0.15,
    };

    const overall =
      (pkg.value_score || 50) * weights.value +
      (pkg.transparency_score || 50) * weights.transparency +
      (pkg.trust_score || 50) * weights.trust -
      (pkg.risk_score || 50) * weights.risk;

    return Math.max(0, Math.min(100, overall));
  }

  /**
   * Calculate percentile rank within similar packages
   */
  static async calculatePercentileRank(
    pkg: TourPackage,
    similarPackagesCount: number,
    betterPackagesCount: number
  ): Promise<number> {
    return Math.round((betterPackagesCount / similarPackagesCount) * 100);
  }

  /**
   * Detect suspicious language in description
   */
  private static hasSuspiciousLanguage(text?: string): boolean {
    if (!text) return false;

    const redFlags = [
      /subject to (change|availability)/i,
      /may (vary|change|incur)/i,
      /additional (charges|fees|costs) (?!listed|detailed|shown)/i,
      /not responsible for/i,
    ];

    return redFlags.some((flag) => flag.test(text));
  }
}

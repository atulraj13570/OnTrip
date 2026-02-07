"""
Tier-based data ingestion worker
Handles API calls, web scraping, and data normalization
"""
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import httpx
from bs4 import BeautifulSoup
from tenacity import retry, stop_after_attempt, wait_exponential
import logging

logger = logging.getLogger(__name__)

class TierConfig:
    """Configuration for each data tier"""
    TIER_1_REFRESH_HOURS = 2
    TIER_2_REFRESH_HOURS = 24
    TIER_3_REFRESH_HOURS = 168  # 7 days
    TIER_4_REFRESH_HOURS = 72
    TIER_5_REFRESH_HOURS = 168
    TIER_6_REFRESH_HOURS = 168
    TIER_7_REFRESH_HOURS = 720  # 30 days

class BaseIngestionWorker:
    def __init__(self, source_tier: int, source_name: str):
        self.source_tier = source_tier
        self.source_name = source_name
        self.client = httpx.AsyncClient(timeout=30.0)
    
    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def fetch_data(self, url: str, headers: Optional[Dict] = None) -> Dict:
        """Fetch data with retry logic"""
        response = await self.client.get(url, headers=headers or {})
        response.raise_for_status()
        return response.json()
    
    def calculate_confidence(self, tier: int, data_completeness: float) -> float:
        """Calculate pricing confidence based on tier and data quality"""
        tier_confidence = {
            1: 0.95, 2: 0.85, 3: 0.60, 4: 0.90, 5: 0.70, 6: 0.50, 7: 0.40
        }
        return tier_confidence.get(tier, 0.5) * data_completeness
    
    def normalize_package(self, raw_data: Dict) -> Dict:
        """Convert source-specific format to canonical schema"""
        raise NotImplementedError("Subclass must implement normalize_package")

class ViatorIngestionWorker(BaseIngestionWorker):
    """Tier 2: Viator API integration"""
    
    def __init__(self, api_key: str):
        super().__init__(source_tier=2, source_name="viator")
        self.api_key = api_key
        self.base_url = "https://api.viator.com/partner"
    
    async def search_destination(self, destination_id: str) -> List[Dict]:
        """Search Viator for packages in destination"""
        url = f"{self.base_url}/products/search"
        headers = {"exp-api-key": self.api_key}
        params = {"destId": destination_id, "topX": "1-50"}
        
        response = await self.fetch_data(url, headers)
        return [self.normalize_package(pkg) for pkg in response.get("data", [])]
    
    def normalize_package(self, raw: Dict) -> Dict:
        """Normalize Viator format to canonical schema"""
        return {
            "external_id": raw["productCode"],
            "source_tier": 2,
            "source_name": "viator",
            "source_url": raw["productUrl"],
            "name": raw["title"],
            "description": raw.get("description", ""),
            "total_days": raw.get("duration", {}).get("fixedDurationInMinutes", 0) // 1440 or 1,
            "total_nights": max(0, (raw.get("duration", {}).get("fixedDurationInMinutes", 0) // 1440) - 1),
            "price_per_person_base": raw["pricing"]["summary"]["fromPrice"],
            "price_per_person_total": raw["pricing"]["summary"]["fromPrice"],
            "currency": raw["pricing"]["currency"],
            "pricing_confidence": self.calculate_confidence(2, 0.85),
            "canonical_data": {
                "inclusions": raw.get("inclusions", []),
                "exclusions": raw.get("exclusions", []),
                "itinerary": raw.get("itinerary", {}),
                "cancellation_policy": raw.get("cancellationPolicy", {})
            },
            "raw_data": raw,
            "last_seen": datetime.utcnow().isoformat()
        }

class GetYourGuideWorker(BaseIngestionWorker):
    """Tier 2: GetYourGuide integration"""
    
    def __init__(self, api_key: str):
        super().__init__(source_tier=2, source_name="getyourguide")
        self.api_key = api_key
        self.base_url = "https://api.getyourguide.com/1"
    
    async def search_destination(self, location_id: int) -> List[Dict]:
        url = f"{self.base_url}/activities"
        headers = {"X-ACCESS-TOKEN": self.api_key}
        params = {"location_id": location_id, "limit": 50}
        
        response = await self.fetch_data(url, headers)
        return [self.normalize_package(pkg) for pkg in response.get("activities", [])]
    
    def normalize_package(self, raw: Dict) -> Dict:
        return {
            "external_id": str(raw["activity_id"]),
            "source_tier": 2,
            "source_name": "getyourguide",
            "source_url": raw["url"],
            "name": raw["title"],
            "description": raw.get("abstract", ""),
            "total_days": raw.get("duration", {}).get("duration", 1),
            "total_nights": max(0, raw.get("duration", {}).get("duration", 1) - 1),
            "price_per_person_base": raw["retail_price"]["amount"],
            "price_per_person_total": raw["retail_price"]["amount"],
            "currency": raw["retail_price"]["currency"],
            "pricing_confidence": self.calculate_confidence(2, 0.80),
            "canonical_data": {
                "highlights": raw.get("highlights", []),
                "included": raw.get("included_services", []),
                "excluded": raw.get("excluded_services", [])
            },
            "raw_data": raw,
            "last_seen": datetime.utcnow().isoformat()
        }

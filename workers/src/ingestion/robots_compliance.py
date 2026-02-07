"""
Robots.txt compliance checker
Ensures all web scraping respects robots.txt and rate limits
"""
import httpx
from urllib.parse import urlparse, urljoin
from urllib.robotparser import RobotFileParser
from typing import Dict, Optional
import time
import logging

logger = logging.getLogger(__name__)

class RobotsChecker:
    """Checks and enforces robots.txt compliance"""
    
    def __init__(self):
        self.parsers: Dict[str, RobotFileParser] = {}
        self.last_request_time: Dict[str, float] = {}
        self.min_delay_seconds = 2  # Minimum 2 seconds between requests
    
    def get_robots_parser(self, url: str) -> Optional[RobotFileParser]:
        """Get or create robots.txt parser for domain"""
        parsed = urlparse(url)
        domain = f"{parsed.scheme}://{parsed.netloc}"
        
        if domain in self.parsers:
            return self.parsers[domain]
        
        try:
            robots_url = urljoin(domain, '/robots.txt')
            parser = RobotFileParser()
            parser.set_url(robots_url)
            parser.read()
            self.parsers[domain] = parser
            logger.info(f"Loaded robots.txt for {domain}")
            return parser
        except Exception as e:
            logger.warning(f"Failed to load robots.txt for {domain}: {e}")
            # If robots.txt fails to load, assume disallowed (conservative)
            return None
    
    def can_fetch(self, url: str, user_agent: str = "OnTripBot/1.0") -> bool:
        """Check if URL can be fetched according to robots.txt"""
        parser = self.get_robots_parser(url)
        
        if parser is None:
            # Conservative: if we can't read robots.txt, don't scrape
            logger.warning(f"Cannot verify robots.txt for {url}, denying access")
            return False
        
        can_fetch = parser.can_fetch(user_agent, url)
        
        if not can_fetch:
            logger.info(f"robots.txt disallows fetching {url}")
        
        return can_fetch
    
    def get_crawl_delay(self, url: str, user_agent: str = "OnTripBot/1.0") -> float:
        """Get crawl delay from robots.txt"""
        parser = self.get_robots_parser(url)
        
        if parser is None:
            return self.min_delay_seconds
        
        delay = parser.crawl_delay(user_agent)
        
        if delay is None:
            return self.min_delay_seconds
        
        return max(delay, self.min_delay_seconds)
    
    def enforce_rate_limit(self, url: str):
        """Enforce rate limiting before making request"""
        parsed = urlparse(url)
        domain = f"{parsed.scheme}://{parsed.netloc}"
        
        current_time = time.time()
        last_request = self.last_request_time.get(domain, 0)
        
        delay = self.get_crawl_delay(url)
        time_since_last = current_time - last_request
        
        if time_since_last < delay:
            sleep_time = delay - time_since_last
            logger.info(f"Rate limiting: sleeping {sleep_time:.2f}s for {domain}")
            time.sleep(sleep_time)
        
        self.last_request_time[domain] = time.time()
    
    async def fetch_with_compliance(self, url: str, headers: Optional[Dict] = None) -> Optional[str]:
        """Fetch URL with full robots.txt compliance"""
        
        # Check if allowed
        if not self.can_fetch(url):
            logger.warning(f"Skipping {url} - disallowed by robots.txt")
            return None
        
        # Enforce rate limit
        self.enforce_rate_limit(url)
        
        # Make request with proper user agent
        default_headers = {
            "User-Agent": "OnTripBot/1.0 (+https://ontrip.com/bot)",
            "Accept": "text/html,application/json",
            "Accept-Language": "en-US,en;q=0.9"
        }
        
        if headers:
            default_headers.update(headers)
        
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=default_headers, follow_redirects=True)
                response.raise_for_status()
                return response.text
        except Exception as e:
            logger.error(f"Failed to fetch {url}: {e}")
            return None

# Tier-specific compliance rules
TIER_COMPLIANCE_RULES = {
    1: {  # Partner APIs
        "requires_robots_check": False,
        "requires_rate_limit": True,
        "max_requests_per_hour": 1000,
        "cache_ttl_hours": 2
    },
    2: {  # Marketplace APIs
        "requires_robots_check": False,
        "requires_rate_limit": True,
        "max_requests_per_hour": 500,
        "cache_ttl_hours": 24
    },
    3: {  # OTA reference (no direct scraping)
        "requires_robots_check": True,
        "requires_rate_limit": True,
        "max_requests_per_hour": 50,
        "cache_ttl_hours": 168,  # 7 days
        "scraping_allowed": False  # Reference only
    },
    4: {  # Destination specialists
        "requires_robots_check": True,
        "requires_rate_limit": True,
        "max_requests_per_hour": 100,
        "cache_ttl_hours": 72
    },
    5: {  # Activity platforms
        "requires_robots_check": True,
        "requires_rate_limit": True,
        "max_requests_per_hour": 200,
        "cache_ttl_hours": 168
    },
    6: {  # Review platforms
        "requires_robots_check": True,
        "requires_rate_limit": True,
        "max_requests_per_hour": 100,
        "cache_ttl_hours": 168
    },
    7: {  # Open web
        "requires_robots_check": True,
        "requires_rate_limit": True,
        "max_requests_per_hour": 50,
        "cache_ttl_hours": 720  # 30 days
    }
}

def get_compliance_rules(tier: int) -> Dict:
    """Get compliance rules for specific tier"""
    return TIER_COMPLIANCE_RULES.get(tier, TIER_COMPLIANCE_RULES[7])

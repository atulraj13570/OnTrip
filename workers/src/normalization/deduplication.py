"""
Package deduplication logic
Identifies and merges duplicate packages from different sources
"""
from typing import List, Dict, Tuple
from difflib import SequenceMatcher
import re

class DeduplicationEngine:
    """Identifies duplicate packages across sources"""
    
    SIMILARITY_THRESHOLD = 0.85
    
    @staticmethod
    def normalize_text(text: str) -> str:
        """Normalize text for comparison"""
        text = text.lower()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text
    
    @staticmethod
    def calculate_similarity(text1: str, text2: str) -> float:
        """Calculate text similarity (0-1)"""
        norm1 = DeduplicationEngine.normalize_text(text1)
        norm2 = DeduplicationEngine.normalize_text(text2)
        return SequenceMatcher(None, norm1, norm2).ratio()
    
    @staticmethod
    def is_duplicate(pkg1: Dict, pkg2: Dict) -> bool:
        """Check if two packages are duplicates"""
        # Same source = not duplicate (version update)
        if pkg1["source_name"] == pkg2["source_name"] and pkg1["external_id"] == pkg2["external_id"]:
            return False
        
        # Check name similarity
        name_sim = DeduplicationEngine.calculate_similarity(pkg1["name"], pkg2["name"])
        if name_sim < DeduplicationEngine.SIMILARITY_THRESHOLD:
            return False
        
        # Check destination match
        if pkg1.get("destination_id") != pkg2.get("destination_id"):
            return False
        
        # Check duration match (±1 day tolerance)
        days_diff = abs(pkg1["total_days"] - pkg2["total_days"])
        if days_diff > 1:
            return False
        
        # Check price similarity (±20% tolerance)
        price1 = pkg1["price_per_person_total"]
        price2 = pkg2["price_per_person_total"]
        price_diff_pct = abs(price1 - price2) / max(price1, price2)
        if price_diff_pct > 0.20:
            return False
        
        return True
    
    @staticmethod
    def merge_duplicates(packages: List[Dict]) -> List[Dict]:
        """Merge duplicate packages, keeping highest tier"""
        unique_packages = []
        seen_groups = []
        
        for pkg in packages:
            is_dup = False
            for group in seen_groups:
                if DeduplicationEngine.is_duplicate(pkg, group[0]):
                    group.append(pkg)
                    is_dup = True
                    break
            
            if not is_dup:
                seen_groups.append([pkg])
        
        # For each group, keep the highest tier (lowest tier number)
        for group in seen_groups:
            best_pkg = min(group, key=lambda p: (p["source_tier"], -p["pricing_confidence"]))
            unique_packages.append(best_pkg)
        
        return unique_packages
    
    @staticmethod
    def create_canonical_id(pkg: Dict) -> str:
        """Generate stable ID for deduplication"""
        components = [
            DeduplicationEngine.normalize_text(pkg["name"]),
            str(pkg.get("destination_id", "")),
            str(pkg["total_days"])
        ]
        return "_".join(components)

"""
Data validation and quality checks
Ensures all ingested data meets canonical schema requirements
"""
from typing import Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator
from enum import Enum

class SourceTier(int, Enum):
    TIER_1_PARTNER = 1
    TIER_2_MARKETPLACE = 2
    TIER_3_OTA = 3
    TIER_4_SPECIALIST = 4
    TIER_5_ACTIVITY = 5
    TIER_6_REVIEW = 6
    TIER_7_OPEN_WEB = 7

class CanonicalPackage(BaseModel):
    """Canonical tour package schema - all sources must normalize to this"""
    
    # Source metadata
    external_id: str = Field(..., min_length=1, max_length=500)
    source_tier: SourceTier
    source_name: str = Field(..., min_length=1, max_length=100)
    source_url: str = Field(..., min_length=1, max_length=1000)
    
    # Basic info
    name: str = Field(..., min_length=5, max_length=500)
    description: Optional[str] = Field(None, max_length=10000)
    destination_id: Optional[str] = None
    operator_id: Optional[str] = None
    
    # Duration
    total_days: int = Field(..., ge=1, le=365)
    total_nights: int = Field(..., ge=0, le=364)
    
    # Pricing
    currency: str = Field(..., min_length=3, max_length=3)
    price_per_person_base: float = Field(..., gt=0)
    price_per_person_total: float = Field(..., gt=0)
    pricing_confidence: float = Field(..., ge=0.0, le=1.0)
    
    # Data quality
    canonical_data: Dict
    raw_data: Dict
    last_seen: str
    
    @validator('total_nights')
    def validate_nights(cls, v, values):
        """Nights must be less than days"""
        if 'total_days' in values and v >= values['total_days']:
            raise ValueError('total_nights must be less than total_days')
        return v
    
    @validator('price_per_person_total')
    def validate_total_price(cls, v, values):
        """Total price must be >= base price"""
        if 'price_per_person_base' in values and v < values['price_per_person_base']:
            raise ValueError('total price cannot be less than base price')
        return v
    
    @validator('currency')
    def validate_currency(cls, v):
        """Currency must be valid ISO 4217 code"""
        valid_currencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR']
        if v not in valid_currencies:
            raise ValueError(f'Invalid currency: {v}')
        return v

class DataQualityChecker:
    """Validates data quality and completeness"""
    
    @staticmethod
    def calculate_completeness_score(package: Dict) -> float:
        """Calculate data completeness (0-1)"""
        required_fields = [
            'name', 'description', 'total_days', 'total_nights',
            'price_per_person_total', 'source_url'
        ]
        optional_fields = [
            'destination_id', 'operator_id', 'canonical_data.inclusions',
            'canonical_data.exclusions', 'canonical_data.itinerary',
            'canonical_data.cancellation_policy'
        ]
        
        score = 0.0
        
        # Required fields (60% weight)
        required_present = sum(1 for f in required_fields if package.get(f))
        score += (required_present / len(required_fields)) * 0.6
        
        # Optional fields (40% weight)
        optional_present = 0
        for field in optional_fields:
            if '.' in field:
                parent, child = field.split('.')
                if package.get(parent, {}).get(child):
                    optional_present += 1
            elif package.get(field):
                optional_present += 1
        
        score += (optional_present / len(optional_fields)) * 0.4
        
        return round(score, 2)
    
    @staticmethod
    def validate_price_reasonableness(package: Dict) -> bool:
        """Check if price is within reasonable bounds"""
        price = package.get('price_per_person_total', 0)
        days = package.get('total_days', 1)
        
        # Price per day should be between $10 and $5000
        price_per_day = price / days
        if price_per_day < 10 or price_per_day > 5000:
            return False
        
        return True
    
    @staticmethod
    def detect_duplicate_content(package: Dict, existing_packages: List[Dict]) -> Optional[str]:
        """Detect if package is duplicate of existing package"""
        from normalization.deduplication import DeduplicationEngine
        
        for existing in existing_packages:
            if DeduplicationEngine.is_duplicate(package, existing):
                return existing['id']
        
        return None
    
    @staticmethod
    def validate_itinerary_consistency(package: Dict) -> List[str]:
        """Check if itinerary matches declared duration"""
        warnings = []
        
        nights_data = package.get('canonical_data', {}).get('nights', [])
        if nights_data:
            if len(nights_data) != package['total_nights']:
                warnings.append(
                    f"Itinerary has {len(nights_data)} nights but package declares {package['total_nights']}"
                )
        
        activities = package.get('canonical_data', {}).get('activities', [])
        if not activities:
            warnings.append("No activities listed in itinerary")
        
        return warnings
    
    @staticmethod
    def check_legal_compliance(package: Dict) -> List[str]:
        """Check for legal compliance issues"""
        issues = []
        
        # Must have source attribution
        if not package.get('source_url'):
            issues.append("Missing source URL for attribution")
        
        # Must have confidence score
        if package.get('pricing_confidence', 0) < 0.3:
            issues.append("Pricing confidence too low (<30%)")
        
        # Check for prohibited claims
        description = package.get('description', '').lower()
        prohibited_terms = ['guaranteed', 'best price', 'lowest price', 'real-time']
        for term in prohibited_terms:
            if term in description:
                issues.append(f"Prohibited claim detected: '{term}'")
        
        return issues

class ValidationResult(BaseModel):
    """Result of validation process"""
    is_valid: bool
    completeness_score: float
    warnings: List[str] = []
    errors: List[str] = []
    legal_issues: List[str] = []

def validate_package(package_data: Dict) -> ValidationResult:
    """Main validation function"""
    warnings = []
    errors = []
    legal_issues = []
    
    try:
        # Schema validation
        canonical = CanonicalPackage(**package_data)
        
        # Completeness check
        completeness = DataQualityChecker.calculate_completeness_score(package_data)
        
        # Price reasonableness
        if not DataQualityChecker.validate_price_reasonableness(package_data):
            warnings.append("Price appears unreasonable for duration")
        
        # Itinerary consistency
        itinerary_warnings = DataQualityChecker.validate_itinerary_consistency(package_data)
        warnings.extend(itinerary_warnings)
        
        # Legal compliance
        legal_issues = DataQualityChecker.check_legal_compliance(package_data)
        
        is_valid = len(errors) == 0 and len(legal_issues) == 0
        
        return ValidationResult(
            is_valid=is_valid,
            completeness_score=completeness,
            warnings=warnings,
            errors=errors,
            legal_issues=legal_issues
        )
        
    except Exception as e:
        errors.append(str(e))
        return ValidationResult(
            is_valid=False,
            completeness_score=0.0,
            warnings=warnings,
            errors=errors,
            legal_issues=legal_issues
        )

"""
Celery tasks for scheduled data ingestion
Runs tier-based ingestion on schedule
"""
from celery import Celery
from celery.schedules import crontab
from datetime import datetime
import os
from ingestion.base_worker import ViatorIngestionWorker, GetYourGuideWorker
from normalization.deduplication import DeduplicationEngine
import asyncio
import logging

logger = logging.getLogger(__name__)

# Initialize Celery
celery_app = Celery(
    'ontrip_workers',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0')
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour max
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50
)

# Schedule configuration
celery_app.conf.beat_schedule = {
    'ingest-tier1-every-2-hours': {
        'task': 'tasks.ingest_tier1',
        'schedule': crontab(minute=0, hour='*/2'),
    },
    'ingest-tier2-daily': {
        'task': 'tasks.ingest_tier2',
        'schedule': crontab(minute=0, hour=2),
    },
    'ingest-tier4-every-3-days': {
        'task': 'tasks.ingest_tier4',
        'schedule': crontab(minute=0, hour=3, day_of_week='*/3'),
    },
    'cleanup-stale-packages-daily': {
        'task': 'tasks.cleanup_stale_packages',
        'schedule': crontab(minute=0, hour=4),
    }
}

@celery_app.task(name='tasks.ingest_tier1', bind=True, max_retries=3)
def ingest_tier1(self):
    """Ingest Tier 1 (partner API) data"""
    try:
        logger.info("Starting Tier 1 ingestion")
        # TODO: Implement partner API integration
        return {"status": "success", "tier": 1, "packages": 0}
    except Exception as e:
        logger.error(f"Tier 1 ingestion failed: {e}")
        raise self.retry(exc=e, countdown=300)

@celery_app.task(name='tasks.ingest_tier2', bind=True, max_retries=3)
def ingest_tier2(self):
    """Ingest Tier 2 (Viator, GetYourGuide) data"""
    try:
        logger.info("Starting Tier 2 ingestion")
        
        async def run_ingestion():
            packages = []
            
            # Viator
            viator_key = os.getenv('VIATOR_API_KEY')
            if viator_key:
                viator = ViatorIngestionWorker(viator_key)
                destinations = ["684", "187"]  # Example: Paris, London
                for dest in destinations:
                    pkgs = await viator.search_destination(dest)
                    packages.extend(pkgs)
            
            # GetYourGuide
            gyg_key = os.getenv('GETYOURGUIDE_API_KEY')
            if gyg_key:
                gyg = GetYourGuideWorker(gyg_key)
                locations = [189, 186]  # Example location IDs
                for loc in locations:
                    pkgs = await gyg.search_destination(loc)
                    packages.extend(pkgs)
            
            # Deduplicate
            unique_packages = DeduplicationEngine.merge_duplicates(packages)
            
            # TODO: Save to PostgreSQL via backend API
            return unique_packages
        
        packages = asyncio.run(run_ingestion())
        
        return {
            "status": "success",
            "tier": 2,
            "packages_found": len(packages),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Tier 2 ingestion failed: {e}")
        raise self.retry(exc=e, countdown=600)

@celery_app.task(name='tasks.ingest_tier4')
def ingest_tier4(self):
    """Ingest Tier 4 (destination specialists) data"""
    logger.info("Starting Tier 4 ingestion")
    # TODO: Implement specialist scraping with robots.txt compliance
    return {"status": "success", "tier": 4, "packages": 0}

@celery_app.task(name='tasks.cleanup_stale_packages')
def cleanup_stale_packages(self):
    """Mark packages as stale if not refreshed within tier threshold"""
    logger.info("Cleaning up stale packages")
    # TODO: Update is_stale flag in database
    return {"status": "success", "cleaned": 0}

@celery_app.task(name='tasks.recalculate_scores')
def recalculate_scores(package_ids: list):
    """Recalculate scores for specific packages"""
    logger.info(f"Recalculating scores for {len(package_ids)} packages")
    # TODO: Call scoring engine via backend API
    return {"status": "success", "recalculated": len(package_ids)}

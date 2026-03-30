import { Router, Request, Response } from 'express';
import { ScraperManager } from '../services/ScraperService';

const router = Router();
const scraperManager = new ScraperManager();

/**
 * GET /api/v1/scraper/run?destination=Bali
 * Trigger a scrape for a specific destination and return the results directly
 */
router.get('/run', async (req: Request, res: Response) => {
  const { destination } = req.query;
  
  if (!destination || typeof destination !== 'string') {
    return res.status(400).json({ error: 'destination is required' });
  }

  try {
    console.log(`Starting Truth Scan for: ${destination}`);
    const result = await scraperManager.scrapeAll(destination as string);
    
    // Background sync (don't block the UI response if it's too slow)
    // but for now we wait a bit to ensure some data is ready
    scraperManager.syncToDb(result).catch(err => {
      console.error("SYNC_ERROR_IN_ROUTE:", err);
    });

    res.json({ 
      success: true, 
      message: `Truth Scan complete for ${destination}. Found ${result.length} packages.`,
      data: result 
    });
  } catch (error: any) {
    console.error("SCRAPER_ROUTE_ERROR:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SCRAPE_FAILED",
        message: error.message
      }
    });
  }
});

export default router;

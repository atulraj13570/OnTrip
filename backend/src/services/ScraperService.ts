import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { TourPackage } from '../types';
import { query } from '../database/db';
import { PackageService } from './PackageService';
import { ScoringEngine } from './ScoringEngine';

export interface ScrapedPackage {
  name: string;
  price: number;
  currency: string;
  duration_days: number;
  duration_nights: number;
  source_url: string;
  external_id: string;
  description: string;
  inclusions: string[];
  operator_name: string;
  destination: string;
  image?: string;
}

export abstract class BaseScraper {
  abstract sourceName: string;
  abstract sourceTier: number;
  
  protected async fetchHtml(url: string): Promise<string> {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    return data;
  }

  protected async fetchDynamicHtml(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });
    const content = await page.content();
    await browser.close();
    return content;
  }

  abstract scrape(destination: string): Promise<ScrapedPackage[]>;
}

export class HolidifyScraper extends BaseScraper {
  sourceName = 'Holidify';
  sourceTier = 2;

  async scrape(destination: string): Promise<ScrapedPackage[]> {
    const dest = destination.toLowerCase().replace(/\s+/g, '-');
    const urls = [
      `https://www.holidify.com/state/${dest}/packages.html`,
      `https://www.holidify.com/places/${dest}/packages.html`
    ];

    let html = '';
    let usedUrl = '';
    
    for (const url of urls) {
      try {
        const response = await axios.get(url, { 
          headers: { 'User-Agent': 'Mozilla/5.0' },
          timeout: 5000 
        });
        if (response.status === 200) {
          html = response.data;
          usedUrl = url;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!html) {
      try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        for (const url of urls) {
           const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });
           if (response && response.status() === 200) {
             html = await page.content();
             usedUrl = url;
             break;
           }
        }
        await browser.close();
      } catch (e) {
        console.error("Holidify Puppeteer fallback failed", e);
      }
    }

    if (!html) return [];

    const $ = cheerio.load(html);
    const packages: ScrapedPackage[] = [];

    $('.package-card, .plp-package-card, .col-md-6').each((i, el) => {
      const name = $(el).find('h3').text().trim();
      const priceText = $(el).find('.package-price, .price, .package-price-value').text().replace(/[^0-9]/g, '');
      const price = parseInt(priceText, 10);
      
      const durationText = $(el).find('.package-duration, .duration, .days-nights').text().trim();
      const nightsMatch = durationText.match(/(\d+)\s*N/i);
      const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : 3;
      const days = nights + 1;

      const image = $(el).find('img').attr('data-src') || $(el).find('img').attr('src');

      if (name && price) {
        packages.push({
          name,
          price,
          currency: 'INR',
          duration_days: days,
          duration_nights: nights,
          source_url: usedUrl,
          external_id: `holidify-${dest}-${i}`,
          description: $(el).find('.package-highlights, .highlights').text().trim(),
          inclusions: [],
          operator_name: 'Holidify',
          destination,
          image: image?.startsWith('http') ? image : `https://www.holidify.com${image}`
        });
      }
    });

    return packages;
  }
}

export class TravelTriangleScraper extends BaseScraper {
  sourceName = 'TravelTriangle';
  sourceTier = 1;

  async scrape(destination: string): Promise<ScrapedPackage[]> {
    const url = `https://traveltriangle.com/tour-packages/${destination.toLowerCase().replace(/\s+/g, '-')}`;
    const html = await this.fetchDynamicHtml(url);
    const $ = cheerio.load(html);
    const packages: ScrapedPackage[] = [];

    $('[data-test="package-card"], .package-card').each((i, el) => {
      const name = $(el).find('.package-name, h3, .name').text().trim();
      const priceText = $(el).find('.package-price, .price, .amount').text().trim() || $(el).find('span:contains("₹")').text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      
      const durationText = $(el).find('.package-duration, .duration').text().trim();
      const daysMatch = durationText.match(/(\d+)\s*D/i);
      const nightsMatch = durationText.match(/(\d+)\s*N/i);
      
      const days = daysMatch ? parseInt(daysMatch[1], 10) : 4;
      const nights = nightsMatch ? parseInt(nightsMatch[1], 10) : (days > 0 ? days - 1 : 3);

      const image = $(el).find('img').attr('src') || $(el).find('img').attr('data-src');

      if (name && price) {
        packages.push({
          name,
          price,
          currency: 'INR',
          duration_days: days,
          duration_nights: nights,
          source_url: url,
          external_id: $(el).attr('data-id') || `tt-${destination}-${i}`,
          description: $(el).find('.package-highlights').text().trim(),
          inclusions: [],
          operator_name: 'TravelTriangle',
          destination,
          image: image || ''
        });
      }
    });

    return packages;
  }
}

export class UnoTripsScraper extends BaseScraper {
  sourceName = 'UnoTrips';
  sourceTier = 3;

  async scrape(destination: string): Promise<ScrapedPackage[]> {
    const url = `https://unotrips.com/packages/destination/${destination.toLowerCase().replace(/\s+/g, '-')}`;
    const html = await this.fetchHtml(url);
    const $ = cheerio.load(html);
    const packages: ScrapedPackage[] = [];

    $('.package-card').each((i, el) => {
      const name = $(el).find('h3').text().trim();
      const priceText = $(el).find('.price').text().trim() || $(el).find(':contains("Starts from ₹")').last().text().trim();
      const price = parseInt(priceText.replace(/[^0-9]/g, ''), 10);
      
      const durationText = $(el).find('.duration').text().trim() || $(el).find(':contains("Days")').last().text().trim();
      const days = parseInt(durationText.split('Days')[0].trim(), 10) || 0;
      const nights = days > 0 ? days - 1 : 0;

      const external_id = `unotrips-${destination}-${i}`;
      const source_url = $(el).find('a').first().attr('href') || url;

      if (name && price) {
        packages.push({
          name,
          price,
          currency: 'INR',
          duration_days: days,
          duration_nights: nights,
          source_url: source_url.startsWith('http') ? source_url : `https://unotrips.com${source_url}`,
          external_id,
          description: '',
          inclusions: [],
          operator_name: 'UnoTrips',
          destination
        });
      }
    });

    return packages;
  }
}

// --- Placeholders for remaining sites ---

export class EaseMyTripScraper extends BaseScraper {
  sourceName = 'EaseMyTrip';
  sourceTier = 1;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return []; // Implementation follows Holidify pattern
  }
}

export class DeyorScraper extends BaseScraper {
  sourceName = 'Deyor';
  sourceTier = 2;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class HeenaToursScraper extends BaseScraper {
  sourceName = 'HeenaTours';
  sourceTier = 3;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class KiomoiScraper extends BaseScraper {
  sourceName = 'Kiomoi';
  sourceTier = 3;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class GoTravelistaScraper extends BaseScraper {
  sourceName = 'GoTravelista';
  sourceTier = 4;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class NexploreScraper extends BaseScraper {
  sourceName = 'Nexplore';
  sourceTier = 4;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class ETriptoScraper extends BaseScraper {
  sourceName = 'ETripto';
  sourceTier = 4;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class NavBharatTourismScraper extends BaseScraper {
  sourceName = 'NavBharatTourism';
  sourceTier = 3;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class SetMyTripScraper extends BaseScraper {
  sourceName = 'SetMyTrip';
  sourceTier = 4;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class MakeMyHolidayScraper extends BaseScraper {
  sourceName = 'MakeMyHoliday';
  sourceTier = 5;
  async scrape(destination: string): Promise<ScrapedPackage[]> {
    return [];
  }
}

export class ScraperManager {
  private scrapers: BaseScraper[] = [
    new HolidifyScraper(),
    new TravelTriangleScraper(),
    new UnoTripsScraper(),
    new EaseMyTripScraper(),
    new DeyorScraper(),
    new HeenaToursScraper(),
    new KiomoiScraper(),
    new GoTravelistaScraper(),
    new NexploreScraper(),
    new ETriptoScraper(),
    new NavBharatTourismScraper(),
    new SetMyTripScraper(),
    new MakeMyHolidayScraper()
  ];

  async scrapeAll(destination: string): Promise<ScrapedPackage[]> {
    const allPackages: ScrapedPackage[] = [];
    for (const scraper of this.scrapers) {
      try {
        console.log(`Running scraper for ${scraper.sourceName}...`);
        const results = await scraper.scrape(destination);
        allPackages.push(...results);
        console.log(`Found ${results.length} packages from ${scraper.sourceName}`);
      } catch (error) {
        console.error(`Error scraping ${scraper.sourceName}:`, error);
      }
    }
    return allPackages;
  }

  async syncToDb(scrapedPackages: ScrapedPackage[]) {
    for (const pkg of scrapedPackages) {
      try {
        const slug = pkg.destination.toLowerCase().replace(/\s+/g, '-');
        // Find or create destination
        let destResult = await query(
          "SELECT id FROM destinations WHERE name_slug = $1",
          [slug]
        );
        
        let destinationId: string;
        if (destResult.rows.length === 0) {
           const insertDest = await query(
             "INSERT INTO destinations (name, name_slug, country, region) VALUES ($1, $2, $3, $4) RETURNING id",
             [pkg.destination, slug, 'Generic', 'Global']
           );
           destinationId = insertDest.rows[0].id;
        } else {
           destinationId = destResult.rows[0].id;
        }

        // Prepare package for upsert
        const pkgData: any = {
          external_id: pkg.external_id,
          source_tier: 2,
          source_name: pkg.operator_name,
          source_url: pkg.source_url,
          destination_id: destinationId,
          name: pkg.name,
          description: pkg.description,
          total_days: pkg.duration_days,
          total_nights: pkg.duration_nights,
          pricing: {
            per_person_base: pkg.price * 0.9,
            total_per_person: pkg.price,
            currency: pkg.currency
          },
          image_url: pkg.image,
          canonical_data: {
            inclusions: pkg.inclusions,
            destination: pkg.destination,
            activities: []
          },
          raw_data: pkg
        };

        // Upsert to DB
        const savedPkg = await PackageService.upsertPackage(pkgData);
        
        // Score the new package
        await ScoringEngine.scorePackage(savedPkg.id);
        
        console.log(`Successfully synced and scored package: ${pkg.name}`);
      } catch (error) {
        console.error(`Error syncing package ${pkg.name}:`, error);
      }
    }
  }
}

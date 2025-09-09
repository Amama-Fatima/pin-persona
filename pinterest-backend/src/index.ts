import express from "express";
import cors from "cors";
import { PinterestScrapper } from "./pinterest-scraper";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

let globalScraper: PinterestScrapper | null = null;
let browserInitTime: number = 0;

async function getScraper(): Promise<PinterestScrapper> {
  const now = Date.now();

  if (!globalScraper || now - browserInitTime > 10 * 60 * 1000) {
    console.log("Initializing new browser instance...");

    if (globalScraper) {
      await globalScraper.close();
    }

    globalScraper = new PinterestScrapper();
    await globalScraper.initialize();
    browserInitTime = now;
    console.log("Browser initialized successfully");
  }

  return globalScraper;
}

async function gracefulShutdown() {
  console.log("Shutting down...");
  if (globalScraper) {
    await globalScraper.close();
    globalScraper = null;
  }
  process.exit(0);
}

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

app.get("/", (req, res) => {
  res.send("Pinterest Scraper API is running");
});

app.get("/browser-status", async (req, res) => {
  try {
    const scraper = await getScraper();
    const uptime = globalScraper
      ? Math.floor((Date.now() - browserInitTime) / 1000)
      : 0;
    res.json({
      status: "Browser ready",
      uptime: `${uptime}s`,
      initialized: !!globalScraper,
    });
  } catch (error) {
    res.status(500).json({ error: "Browser initialization failed" });
  }
});

app.post("/scrape", async (req, res) => {
  const startTime = Date.now();
  const { keyword, limit = 5 } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  try {
    console.log(`Starting scrape for keyword: ${keyword}, limit: ${limit}`);

    const scraper = await getScraper();

    const initTime = Date.now() - startTime;
    console.log(`Browser ready in ${initTime}ms`);

    const result = await scraper.scrapeImages(keyword, limit);

    const totalTime = Date.now() - startTime;
    console.log(`Scraping completed in ${totalTime}ms`);

    const response = {
      ...result,
      performance: {
        totalTime: `${totalTime}ms`,
        browserInitTime: `${initTime}ms`,
        scrapingTime: `${totalTime - initTime}ms`,
      },
    };

    res.status(200).json(response);
  } catch (err: unknown) {
    const totalTime = Date.now() - startTime;
    console.error(`Scrape failed after ${totalTime}ms:`, err);

    if (globalScraper) {
      try {
        await globalScraper.close();
      } catch (closeError) {
        console.error("Error closing browser:", closeError);
      }
      globalScraper = null;
    }

    if (err instanceof Error) {
      res.status(500).json({
        error: err.message,
        performance: {
          failedAfter: `${totalTime}ms`,
        },
      });
    } else {
      res.status(500).json({
        error: "Scraping failed",
        performance: {
          failedAfter: `${totalTime}ms`,
        },
      });
    }
  }
});

// Health check endpoint
app.get("/health", async (req, res) => {
  try {
    // Quick health check without initializing browser
    const browserStatus = globalScraper ? "ready" : "not-initialized";
    res.json({
      status: "healthy",
      browser: browserStatus,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    });
  } catch (error) {
    res
      .status(500)
      .json({
        status: "unhealthy",
        error: error instanceof Error ? error.message : "Unknown error",
      });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log("Browser will be initialized on first request");
});

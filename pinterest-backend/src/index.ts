import express from "express";
import cors from "cors";
import { PinterestScrapper } from "./pinterest-scraper";

const app = express();
const port = process.env.PORT || 4000;

let globalScraper: PinterestScrapper | null = null;
let isInitializing = false;

async function getOrCreateScraper(): Promise<PinterestScrapper> {
  if (globalScraper) {
    return globalScraper;
  }

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (globalScraper) return globalScraper;
  }

  isInitializing = true;
  try {
    globalScraper = new PinterestScrapper();
    await globalScraper.initialize();
    console.log("Global scraper initialized");
    return globalScraper;
  } finally {
    isInitializing = false;
  }
}

process.on("SIGTERM", async () => {
  console.log("Received SIGTERM, closing browser...");
  if (globalScraper) {
    await globalScraper.close();
  }
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Received SIGINT, closing browser...");
  if (globalScraper) {
    await globalScraper.close();
  }
  process.exit(0);
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  res.setTimeout(60000, () => {
    res.status(408).json({ error: "Request timeout" });
  });
  next();
});

app.get("/", (req, res) => {
  res.send("Pinterest Scraper API is running");
});

app.post("/scrape", async (req, res) => {
  const { keyword, limit = 5 } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  if (limit > 5) {
    return res.status(400).json({ error: "Limit cannot exceed 5" });
  }

  const startTime = Date.now();

  try {
    const scraper = await getOrCreateScraper();
    const result = await scraper.scrapeImages(keyword, limit);

    const duration = Date.now() - startTime;
    console.log(`Scraping completed in ${duration}ms for keyword: ${keyword}`);

    res.status(200).json({
      ...result,
      metadata: {
        duration: duration,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    console.error("Scrape failed:", err);

    // If scraper fails, reset it
    if (globalScraper) {
      try {
        await globalScraper.close();
      } catch (closeErr) {
        console.error("Error closing scraper:", closeErr);
      }
      globalScraper = null;
    }

    const duration = Date.now() - startTime;
    if (err instanceof Error) {
      res.status(500).json({
        error: err.message,
        metadata: {
          duration: duration,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      res.status(500).json({
        error: "Scraping failed",
        metadata: {
          duration: duration,
          timestamp: new Date().toISOString(),
        },
      });
    }
  }
});

app.get("/test", async (req, res) => {
  try {
    const scraper = await getOrCreateScraper();
    res.json({
      success: true,
      message: "Browser works!",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Browser test failed:", error);
    res.status(500).json({
      error: "Browser failed to start",
      timestamp: new Date().toISOString(),
    });
  }
});

app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
  });
});

app.post("/reset", async (req, res) => {
  try {
    if (globalScraper) {
      await globalScraper.close();
      globalScraper = null;
    }
    res.json({ message: "Scraper reset successfully" });
  } catch (error) {
    console.error("Reset failed:", error);
    res.status(500).json({ error: "Reset failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);

  // Pre-initialize the scraper
  getOrCreateScraper().catch((err) => {
    console.error("Failed to pre-initialize scraper:", err);
  });
});

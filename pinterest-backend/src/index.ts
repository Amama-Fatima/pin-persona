// src/index.ts
import express from "express";
import cors from "cors";
import { PinterestScrapper } from "./pinterest-scraper";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pinterest Scraper API is running");
});

app.post("/scrape", async (req, res) => {
  const { keyword, limit = 5 } = req.body;

  if (!keyword) {
    return res.status(400).json({ error: "Keyword is required" });
  }

  const scraper = new PinterestScrapper();

  try {
    await scraper.initialize();
    const result = await scraper.scrapeImages(keyword, limit);
    await scraper.close();
    res.status(200).json(result);
  } catch (err: unknown) {
    console.error("Scrape failed:", err);
    await scraper.close();
    if (err instanceof Error) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(500).json({ error: "Scraping failed" });
    }
  }
});

app.get("/test", async (req, res) => {
  const scraper = new PinterestScrapper();
  try {
    await scraper.initialize();
    await scraper.close();
    res.json({ success: true, message: "Browser works!" });
  } catch (error) {
    console.error("Browser test failed:", error);
    await scraper.close();
    res.status(500).json({ error: "Browser failed to start" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

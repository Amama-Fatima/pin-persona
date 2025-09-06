/* eslint-disable @typescript-eslint/no-require-imports */
import puppeteer from "puppeteer";
import type { PinterestImage, ScrapingResult } from "./types";
type Browser = import("puppeteer").Browser;
type Page = import("puppeteer").Page;

export class PinterestScrapper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    try {
      // Try to get Chrome executable path
      let executablePath: string | undefined;

      // Check if we're in a production environment (like Render)
      if (process.env.NODE_ENV === "production") {
        // Try common Chrome paths on Linux systems
        const possiblePaths = [
          "/opt/render/.cache/puppeteer/chrome/linux-130.0.6723.69/chrome-linux64/chrome",
          "/opt/render/.cache/puppeteer/chrome/linux-131.0.6778.69/chrome-linux64/chrome",
          "/opt/render/.cache/puppeteer/chrome/linux-140.0.7339.80/chrome-linux64/chrome",
          "/usr/bin/google-chrome",
          "/usr/bin/google-chrome-stable",
          "/usr/bin/chromium-browser",
        ];

        // Try to find Chrome executable
        const fs = require("fs");
        for (const path of possiblePaths) {
          try {
            if (fs.existsSync(path)) {
              executablePath = path;
              console.log(`Found Chrome at: ${path}`);
              break;
            }
          } catch (e) {
            console.error(`Error checking path ${path}:`, e);
            // Continue to next path
          }
        }
      }

      this.browser = await puppeteer.launch({
        headless: true,
        executablePath,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--no-first-run",
          "--no-zygote",
          "--disable-gpu",
          "--disable-web-security", // Allow cross-origin requests
          "--disable-features=VizDisplayCompositor",
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--single-process", // Important for cloud platforms
          "--no-default-browser-check",
          "--disable-extensions",
          "--disable-plugins",
          "--disable-default-apps",
        ],
      });

      this.page = await this.browser.newPage();

      // Set a more realistic user agent
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Set additional headers to appear more legitimate
      await this.page.setExtraHTTPHeaders({
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      });

      await this.page.setViewport({ width: 1280, height: 800 });
    } catch (error) {
      console.error("Failed to initialize browser:", error);
      throw new Error(`Browser initialization failed: ${error}`);
    }
  }

  // Enhanced image extraction with multiple fallback URLs
  private async extractImageData(maxImages: number): Promise<PinterestImage[]> {
    if (!this.page) return [];

    return await this.page.evaluate((maxImages: number) => {
      const pins = document.querySelectorAll('[data-test-id="pin"]');
      const imageData: PinterestImage[] = [];

      for (let i = 0; i < Math.min(pins.length, maxImages); i++) {
        const pin = pins[i];
        if (!pin) continue;
        const imgElement = pin.querySelector("img");
        const linkElement = pin.querySelector("a");

        if (imgElement && imgElement.src) {
          const originalUrl = imgElement.src;
          const fallbackUrls: string[] = [originalUrl];

          // Generate multiple fallback URLs
          if (originalUrl.includes("/236x/")) {
            fallbackUrls.push(originalUrl.replace("/236x/", "/474x/"));
            fallbackUrls.push(originalUrl.replace("/236x/", "/564x/"));
            fallbackUrls.push(originalUrl.replace("/236x/", "/originals/"));
          } else if (originalUrl.includes("/474x/")) {
            fallbackUrls.push(originalUrl.replace("/474x/", "/236x/"));
            fallbackUrls.push(originalUrl.replace("/474x/", "/564x/"));
            fallbackUrls.push(originalUrl.replace("/474x/", "/originals/"));
          }

          // Try to get higher resolution URL
          let primaryUrl = originalUrl;
          if (originalUrl.includes("/236x/")) {
            primaryUrl = originalUrl.replace("/236x/", "/originals/");
          } else if (originalUrl.includes("/474x/")) {
            primaryUrl = originalUrl.replace("/474x/", "/originals/");
          }

          const imageObj: PinterestImage = {
            id: `pin_${i}_${Date.now()}`,
            url: primaryUrl,
            fallbackUrls: [...new Set(fallbackUrls)], // Remove duplicates
            title: imgElement.alt || `Pinterest image ${i + 1}`,
            description:
              pin.querySelector('[data-test-id="pin-description"]')
                ?.textContent ||
              pin.querySelector('[data-test-id="pin-title"]')?.textContent ||
              "",
            sourceUrl: linkElement?.href || "",
          };
          if (typeof imgElement.naturalWidth === "number") {
            imageObj.width = imgElement.naturalWidth;
          }
          if (typeof imgElement.naturalHeight === "number") {
            imageObj.height = imgElement.naturalHeight;
          }
          imageData.push(imageObj);
        }
      }

      return imageData;
    }, maxImages);
  }

  // Scrolls the page to load more images up to the specified limit
  private async autoScroll(targetImages: number): Promise<void> {
    if (!this.page) return;

    let lastHeight = 0;
    let scrollAttempts = 0;
    const maxScrollAttempts = 15; // Increased attempts
    let stableCount = 0;

    while (scrollAttempts < maxScrollAttempts && stableCount < 3) {
      // Check current number of loaded images
      const currentImages = await this.page.$$eval(
        '[data-test-id="pin"]',
        (pins) => pins.length
      );

      console.log(`Loaded ${currentImages} images, target: ${targetImages}`);

      if (currentImages >= targetImages) {
        break;
      }

      // Scroll down gradually
      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight);
      });

      // Wait for new content to load with longer timeout
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const newHeight = await this.page.evaluate(
        () => document.body.scrollHeight
      );

      if (newHeight === lastHeight) {
        scrollAttempts++;
        stableCount++;
      } else {
        scrollAttempts = 0;
        stableCount = 0;
      }

      lastHeight = newHeight;

      // Add random delay to seem more human-like
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 1000 + 1000)
      );
    }
  }

  async scrapeImages(
    keyword: string,
    limit: number = 5
  ): Promise<ScrapingResult> {
    if (!this.page) {
      throw new Error("Scraper not initialized. Call initialize() first.");
    }

    try {
      const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(
        keyword
      )}`;

      console.log(`Navigating to: ${searchUrl}`);

      // Add some delay to seem more human-like
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      await this.page.goto(searchUrl, {
        waitUntil: "networkidle0",
        timeout: 60000,
      });

      // Wait a bit more after page load
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Wait for Pinterest to load and check if we need to handle any overlays
      try {
        await this.page.waitForSelector('[data-test-id="pin"]', {
          timeout: 20000,
        });
      } catch {
        // Check if we hit a rate limit or access denied page
        const pageContent = await this.page.content();
        if (
          pageContent.includes("Access denied") ||
          pageContent.includes("rate limit")
        ) {
          throw new Error("Pinterest is blocking requests - try again later");
        }

        // Try to handle potential cookie banners or login prompts
        const closeButtons = await this.page.$$(
          '[data-test-id="closeModal"], [aria-label="Close"], .close-button, [data-test-id="dismiss-button"]'
        );
        if (closeButtons && closeButtons.length > 0) {
          for (const button of closeButtons) {
            try {
              await button.click();
              await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch {}
          }
        }

        // Try waiting for pins again
        await this.page.waitForSelector('[data-test-id="pin"]', {
          timeout: 15000,
        });
      }

      await this.autoScroll(limit);

      const pins = await this.page.$$('[data-test-id="pin"]');
      console.log(`Found ${pins.length} pins`);

      const images = await this.extractImageData(limit);

      return {
        images,
        totalFound: images.length,
        keyword,
      };
    } catch (error) {
      console.error("Error scraping Pinterest:", error);
      throw new Error(`Failed to scrape Pinterest: ${error}`);
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

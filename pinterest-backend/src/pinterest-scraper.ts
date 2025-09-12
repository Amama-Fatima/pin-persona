import puppeteer from "puppeteer";
import type { PinterestImage, ScrapingResult } from "./types";
type Browser = import("puppeteer").Browser;
type Page = import("puppeteer").Page;

export class PinterestScrapper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--single-process",
        "--no-crash-upload",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-extensions",
        // Speed optimizations
        "--memory-pressure-off",
        "--disable-features=TranslateUI,BlinkGenPropertyTrees",
        "--disable-background-networking",
        "--disable-sync",
        "--disable-default-apps",
        "--aggressive-cache-discard",
      ],
    });

    this.page = await this.browser.newPage();

    this.page.setDefaultNavigationTimeout(45000);
    this.page.setDefaultTimeout(30000);

    // Blocking heavy resources for speed
    await this.page.setRequestInterception(true);
    this.page.on("request", (req) => {
      const resourceType = req.resourceType();
      const url = req.url();

      if (
        resourceType === "stylesheet" ||
        resourceType === "font" ||
        resourceType === "media" ||
        url.includes("google-analytics") ||
        url.includes("googletagmanager") ||
        url.includes("facebook.net") ||
        url.includes("doubleclick") ||
        url.includes("ads")
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });

    await this.page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    );

    await this.page.setExtraHTTPHeaders({
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      DNT: "1",
      Connection: "keep-alive",
    });

    await this.page.setViewport({ width: 1024, height: 768 });
  }

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

          let primaryUrl = originalUrl;
          if (originalUrl.includes("/236x/")) {
            primaryUrl = originalUrl.replace("/236x/", "/474x/");
          }

          const imageObj: PinterestImage = {
            id: `pin_${i}_${Date.now()}`,
            url: primaryUrl,
            fallbackUrls: [originalUrl, primaryUrl],
            title: imgElement.alt || `Pinterest image ${i + 1}`,
            description:
              pin.querySelector('[data-test-id="pin-description"]')
                ?.textContent || "",
            sourceUrl: linkElement?.href || "",
            width: imgElement.naturalWidth || 0,
            height: imgElement.naturalHeight || 0,
          };

          imageData.push(imageObj);
        }
      }

      return imageData;
    }, maxImages);
  }

  private async fastScroll(targetImages: number): Promise<void> {
    if (!this.page) return;

    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      const currentImages = await this.page.$$eval(
        '[data-test-id="pin"]',
        (pins) => pins.length
      );

      console.log(`Loaded ${currentImages} images, target: ${targetImages}`);

      if (currentImages >= targetImages) {
        break;
      }

      // Fast, aggressive scrolling
      await this.page.evaluate(() => {
        window.scrollBy(0, window.innerHeight * 2);
      });

      // Shorter wait time
      await new Promise((resolve) => setTimeout(resolve, 1000));

      attempts++;
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

      // Fast navigation
      await this.page.goto(searchUrl, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });

      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Quick pin detection with fallback
      let pinsFound = false;
      try {
        await this.page.waitForSelector('[data-test-id="pin"]', {
          timeout: 10000,
        });
        pinsFound = true;
      } catch {
        console.log("Pins not found quickly, checking for modals...");

        const modalSelectors =
          '[data-test-id="closeModal"], [aria-label="Close"], .close-button';
        const closeButton = await this.page.$(modalSelectors);
        if (closeButton) {
          await closeButton.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        // One more quick attempt
        try {
          await this.page.waitForSelector('[data-test-id="pin"]', {
            timeout: 5000,
          });
          pinsFound = true;
        } catch {
          const anyContent = await this.page.$("img");
          if (!anyContent) {
            throw new Error(
              "No content loaded - Pinterest might be blocking requests"
            );
          }
        }
      }
      // Check if enough pins before scrolling
      const initialPins = await this.page.$$('[data-test-id="pin"]');
      console.log(`Initially loaded ${initialPins.length} pins, need ${limit}`);

      if (initialPins.length < limit) {
        console.log("Need more pins - scrolling...");
        await this.fastScroll(limit);
      }

      const pins = await this.page.$$('[data-test-id="pin"]');
      console.log(`Found ${pins.length} pins total`);

      const images = await this.extractImageData(limit);

      if (images.length === 0) {
        throw new Error(
          "No images extracted - Pinterest layout might have changed"
        );
      }

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

import puppeteer, { Browser, Page } from "puppeteer";
import { ScrapingResult } from "./types";

export class PinterestScrapper {
    private browser: Browser | null = null;
    private page: Page | null = null;

    async initialize(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        this.page = await this.browser.newPage();

        await this.page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        );

        await this.page.setViewport({ width: 1280, height: 800 });

    }

    // Scrolls the page to load more images up to the specified limit
    private async autoScroll(targetImages: number): Promise<void> {
        if (!this.page) return;

        let lastHeight = 0;
        let scrollAttempts = 0;
        const maxScrollAttempts = 10;

        while (scrollAttempts < maxScrollAttempts) {
            // Check current number of loaded images
            const currentImages = await this.page.$$eval('[data-test-id="pin"]', pins => pins.length);

            if (currentImages >= targetImages) {
                break;
            }

            // Scroll down
            await this.page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            // Wait for new content to load
            await new Promise(resolve => setTimeout(resolve, 2000));

            const newHeight = await this.page.evaluate(() => document.body.scrollHeight);

            if (newHeight === lastHeight) {
                scrollAttempts++;
            } else {
                scrollAttempts = 0;
            }

            lastHeight = newHeight;
        }
    }


    async scrapeImages(keyword: string, limit: number = 20): Promise<ScrapingResult> {
        if (!this.page) {
            throw new Error('Scraper not initialized. Call initialize() first.');
        }

        try {
            const searchUrl = `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(keyword)}`;
            await this.page.goto(searchUrl, { waitUntil: 'networkidle2' });
            // wait for images to load
            await this.page.waitForSelector('[data-test-id="pin"]', { timeout: 10000 });
            await this.autoScroll(limit);

            const images = await this.page.evaluate((maxImages: number) => {
                const pins = document.querySelectorAll('[data-test-id="pin"]');
                type ImageData = {
                    id: string;
                    url: string;
                    title: string;
                    description: string;
                    width?: number;
                    height?: number;
                    sourceUrl: string;
                };
                const imageData: ImageData[] = [];

                for (let i = 0; i < Math.min(pins.length, maxImages); i++) {
                    const pin = pins[i];
                    const imgElement = pin.querySelector('img');
                    const linkElement = pin.querySelector('a');

                    if (imgElement && imgElement.src) {
                        // Get high-resolution image URL
                        let imageUrl = imgElement.src;

                        // Pinterest often uses different URL patterns, try to get original size
                        if (imageUrl.includes('/236x/')) {
                            imageUrl = imageUrl.replace('/236x/', '/originals/');
                        } else if (imageUrl.includes('/474x/')) {
                            imageUrl = imageUrl.replace('/474x/', '/originals/');
                        }

                        imageData.push({
                            id: `pin_${i}_${Date.now()}`,
                            url: imageUrl,
                            title: imgElement.alt || `Pinterest image ${i + 1}`,
                            description: pin.querySelector('[data-test-id="pin-description"]')?.textContent || '',
                            width: imgElement.naturalWidth || undefined,
                            height: imgElement.naturalHeight || undefined,
                            sourceUrl: linkElement?.href || ''
                        });
                    }
                }

                return imageData;
            }, limit);

            return {
                images,
                totalFound: images.length,
                keyword
            };

        } catch (error) {
            console.error('Error scraping Pinterest:', error);
            throw new Error(`Failed to scrape Pinterest: ${error}`);
        }

    }
}

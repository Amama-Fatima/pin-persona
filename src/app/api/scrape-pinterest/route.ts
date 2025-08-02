import { PinterestScrapper } from "@/lib/pinterest-scraper";

export async function POST(req: Request) {
  try {
    const { keyword, limit = 20 } = await req.json();

    if (!keyword) {
      return new Response(
        JSON.stringify({ error: 'Keyword is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const scraper = new PinterestScrapper();
    await scraper.initialize();
    const result = await scraper.scrapeImages(keyword, limit);
    await scraper.close();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Scraping error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to scrape Pinterest images',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

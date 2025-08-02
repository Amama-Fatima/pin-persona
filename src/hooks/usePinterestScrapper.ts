import { ScrapingResult } from '@/lib/types';
import { useState } from 'react';

export const usePinterestScraper = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ScrapingResult | null>(null);

  const scrapeImages = async (keyword: string, limit: number = 20) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape-pinterest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, limit }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ScrapingResult = await response.json();
      setResults(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to scrape images';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    scrapeImages,
    loading,
    error,
    results,
    clearResults: () => setResults(null),
    clearError: () => setError(null)
  };
};
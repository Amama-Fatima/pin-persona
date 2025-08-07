import { useState, useCallback } from "react";
import { KeywordResponse, PinterestImage } from "../lib/types";
import { getKeywordsForPersonality } from "../lib/personalityKeywords";

export interface KeywordResults {
  keyword: string;
  images: PinterestImage[];
  loading: boolean;
  error: string | null;
  completed: boolean;
}

export interface PersonalityScrapingState {
  personalityName: string;
  personalityInfo: KeywordResponse | null;
  keywordResults: KeywordResults[];
  totalImages: number;
  isGeneratingKeywords: boolean;
  keywordGenerationError: string | null;
}

export const usePersonalityScraper = () => {
  const [state, setState] = useState<PersonalityScrapingState>({
    personalityName: "",
    personalityInfo: null,
    keywordResults: [],
    totalImages: 0,
    isGeneratingKeywords: false,
    keywordGenerationError: null,
  });

  // Function to scrape images for a specific keyword
  const scrapeImagesForKeyword = useCallback(
    async (keyword: string, keywordIndex: number) => {
      try {
        // Update loading state for this keyword
        setState((prev) => ({
          ...prev,
          keywordResults: prev.keywordResults.map((result, index) =>
            index === keywordIndex
              ? { ...result, loading: true, error: null }
              : result
          ),
        }));

        const response = await fetch("http://localhost:4000/scrape", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            keyword: keyword.trim(),
            limit: 10,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to scrape images for keyword: ${keyword}`);
        }

        const data = await response.json();

        // Update the results for this keyword
        setState((prev) => ({
          ...prev,
          keywordResults: prev.keywordResults.map((result, index) =>
            index === keywordIndex
              ? {
                  ...result,
                  images: data.images || [],
                  loading: false,
                  completed: true,
                  error: null,
                }
              : result
          ),
          totalImages: prev.totalImages + (data.images?.length || 0),
        }));
      } catch (error) {
        console.error(`Error scraping images for keyword "${keyword}":`, error);

        setState((prev) => ({
          ...prev,
          keywordResults: prev.keywordResults.map((result, index) =>
            index === keywordIndex
              ? {
                  ...result,
                  loading: false,
                  completed: true,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Failed to scrape images",
                }
              : result
          ),
        }));
      }
    },
    []
  );

  // Main function to start the personality-based scraping
  const scrapePersonalityImages = useCallback(
    async (personalityName: string) => {
      try {
        setState((prev) => ({
          ...prev,
          personalityName,
          isGeneratingKeywords: true,
          keywordGenerationError: null,
          keywordResults: [],
          totalImages: 0,
          personalityInfo: null,
        }));

        // Step 1: Generate keywords for the personality
        const keywordResponse = await getKeywordsForPersonality(
          personalityName
        );

        if (!keywordResponse.success) {
          throw new Error("Failed to generate keywords for personality");
        }

        // Parse keywords
        const keywords = keywordResponse.keywords
          .split(",")
          .map((k) => k.trim())
          .filter((k) => k.length > 0);

        const initialKeywordResults: KeywordResults[] = keywords.map(
          (keyword) => ({
            keyword,
            images: [],
            loading: false,
            error: null,
            completed: false,
          })
        );

        setState((prev) => ({
          ...prev,
          personalityInfo: keywordResponse,
          keywordResults: initialKeywordResults,
          isGeneratingKeywords: false,
        }));

        // Step 2: Start scraping images for each keyword (one by one)
        for (let i = 0; i < keywords.length; i++) {
          await scrapeImagesForKeyword(keywords[i], i);
          // Small delay between keyword scraping to avoid overwhelming the API
          if (i < keywords.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error("Error in personality scraping:", error);
        setState((prev) => ({
          ...prev,
          isGeneratingKeywords: false,
          keywordGenerationError:
            error instanceof Error
              ? error.message
              : "Failed to generate keywords",
        }));
      }
    },
    [scrapeImagesForKeyword]
  );

  const clearResults = useCallback(() => {
    setState({
      personalityName: "",
      personalityInfo: null,
      keywordResults: [],
      totalImages: 0,
      isGeneratingKeywords: false,
      keywordGenerationError: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      keywordGenerationError: null,
    }));
  }, []);

  return {
    ...state,
    scrapePersonalityImages,
    clearResults,
    clearError,
    isLoading:
      state.isGeneratingKeywords || state.keywordResults.some((r) => r.loading),
  };
};

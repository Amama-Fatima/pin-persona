"use client";

import React, { useState } from "react";
import { PinterestImage } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  // CardDescription,
  // CardHeader,
  // CardTitle,
} from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import {
  Search,
  Loader2,
  AlertCircle,
  Trash2,
  User,
  Sparkles,
} from "lucide-react";
import PersonalityInfoCard from "./PersonalityInfoCard";
import UnifiedImageFeed from "./UnifiedImageFeed"; // Import the new component
import { usePersonalityScraper } from "../hooks/usePersonalityScrapper";

// Pinterest Logo Component
const PinterestLogo = ({ className = "w-8 h-8" }) => (
  <svg className={className} viewBox="0 0 384 512" fill="currentColor">
    <path d="M204 6.5C101.4 6.5 0 74.9 0 185.6 0 256 39.6 296 63.6 296c9.9 0 15.6-27.6 15.6-35.4 0-9.3-23.7-29.1-23.7-67.8 0-80.4 61.2-137.4 140.4-137.4 68.1 0 118.5 38.7 118.5 109.8 0 53.1-21.3 152.7-90.3 152.7-24.9 0-46.2-18-46.2-43.8 0-37.8 26.4-74.4 26.4-113.4 0-66.2-93.9-54.2-93.9 25.8 0 16.8 2.1 35.4 9.6 50.7-13.8 59.4-42 147.9-42 209.1 0 18.9 2.7 37.5 4.5 56.4 3.4 3.8 1.7 3.4 6.9 1.5 50.4-69 48.6-82.5 71.4-172.8 12.3 23.4 44.1 36 69.3 36 106.2 0 153.9-103.5 153.9-196.8C384 71.3 298.2 6.5 204 6.5z" />
  </svg>
);

const PersonalityScraper = () => {
  const [personalityName, setPersonalityName] = useState("");
  const {
    personalityInfo,
    keywordResults,
    totalImages,
    isGeneratingKeywords,
    keywordGenerationError,
    isLoading,
    scrapePersonalityImages,
    clearResults,
    clearError,
  } = usePersonalityScraper();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personalityName.trim()) return;

    clearError();
    try {
      await scrapePersonalityImages(personalityName.trim());
    } catch (err) {
      console.error("Personality scraping failed:", err);
    }
  };

  const downloadImage = async (image: PinterestImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${image.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image");
    }
  };

  const completedKeywords = keywordResults.filter((r) => r.completed).length;
  const hasResults = personalityInfo && keywordResults.length > 0;
  const hasImages = keywordResults.some((result) => result.images.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero Section with Pinterest Aesthetic */}
        <div className="relative overflow-hidden bg-gradient-to-br from-red-50 via-white to-red-50 dark:from-red-950/20 dark:via-background dark:to-red-950/20">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(239,68,68,0.1)_1px,transparent_0)] [background-size:24px_24px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(239,68,68,0.2)_1px,transparent_0)]"></div>

          {/* Main Content */}
          <div className="relative px-6 py-16 sm:py-24">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="p-3 rounded-full bg-red-500 text-white shadow-lg">
                  <PinterestLogo className="w-10 h-10" />
                </div>
                {/* <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                  <Sparkles className="w-10 h-10" />
                </div> */}
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-red-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Personality
                <span className="block">Pinterest Scraper</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Generate Pinterest keywords for historical and fictional
                personalities.
              </p>
            </div>

            {/* Search Form */}
            <div className="max-w-4xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur opacity-25"></div>
                  <div className="relative bg-white dark:bg-background rounded-xl shadow-xl p-8 border border-red-100 dark:border-red-900/20">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                      <div className="lg:col-span-3 space-y-3">
                        <Label
                          htmlFor="personality"
                          className="text-lg font-semibold text-foreground flex items-center gap-2"
                        >
                          <User className="w-5 h-5 text-red-500" />
                          Personality Name
                        </Label>
                        <Input
                          id="personality"
                          type="text"
                          value={personalityName}
                          onChange={(e) => setPersonalityName(e.target.value)}
                          placeholder="Enter a personality name (e.g., 'Vincent van Gogh', 'Marie Curie', 'Leonardo da Vinci')"
                          className="h-14 text-lg border-2 border-red-100 focus:border-red-300 dark:border-red-900/30 dark:focus:border-red-700 rounded-lg"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="flex items-end">
                        <Button
                          type="submit"
                          disabled={isLoading || !personalityName.trim()}
                          className="w-full h-14 text-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg"
                        >
                          {isGeneratingKeywords ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Generating
                            </>
                          ) : isLoading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin mr-2" />
                              Scraping
                            </>
                          ) : (
                            <>
                              <Search className="h-5 w-5 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clear Results Button */}
                {hasResults && (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={clearResults}
                      className="flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20 px-6 py-3 rounded-lg shadow-sm"
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear Results
                    </Button>
                  </div>
                )}
              </form>

              {/* Error Alert */}
              {keywordGenerationError && (
                <div className="mt-8">
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error generating keywords</AlertTitle>
                    <AlertDescription>
                      {keywordGenerationError}
                    </AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rest of the content remains the same */}
        <div className="px-6">
          {/* Keyword Generation Loading State */}
          {isGeneratingKeywords && (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="flex items-center gap-3 mb-4">
                  {/* <User className="h-8 w-8 text-primary" /> */}
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  {/* <Sparkles className="h-8 w-8 text-primary" /> */}
                </div>
                <p className="text-lg font-medium mb-2">
                  Analyzing {personalityName}...
                </p>
                <p className="text-muted-foreground text-center max-w-md">
                  Gathering information about this personality and generating
                  relevant Pinterest keywords. This might take a few seconds.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Personality Info Card */}
          {personalityInfo && (
            <PersonalityInfoCard
              personalityInfo={personalityInfo}
              totalImages={totalImages}
              completedKeywords={completedKeywords}
              totalKeywords={keywordResults.length}
            />
          )}

          {/* Unified Image Feed*/}
          {hasResults && (
            <UnifiedImageFeed
              keywordResults={keywordResults}
              onDownload={downloadImage}
              isLoading={isLoading}
            />
          )}

          {/* Summary */}
          {hasResults &&
            completedKeywords === keywordResults.length &&
            completedKeywords > 0 &&
            hasImages && (
              <Card className="border-border bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <CardContent className="flex items-center justify-between py-6">
                  <div>
                    <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
                      Discovery Complete!
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Found {totalImages} images across {keywordResults.length}{" "}
                      personality-related keywords
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalImages}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Images
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
};

export default PersonalityScraper;

"use client";

import React, { useState } from "react";
import { PinterestImage } from "../lib/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Personality Pinterest Scraper
            </CardTitle>
            <CardDescription>
              Enter a historical personality name to generate Pinterest keywords
              and discover related images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="personality" className="text-sm font-medium">
                    Personality Name
                  </Label>
                  <Input
                    id="personality"
                    type="text"
                    value={personalityName}
                    onChange={(e) => setPersonalityName(e.target.value)}
                    placeholder="Enter a personality name (e.g., 'Vincent van Gogh', 'Marie Curie', 'Leonardo da Vinci')"
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="submit"
                    disabled={isLoading || !personalityName.trim()}
                    className="w-full flex items-center gap-2"
                  >
                    {isGeneratingKeywords ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating Keywords...
                      </>
                    ) : isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Scraping Images...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Start Discovery
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {hasResults && (
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearResults}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Results
                  </Button>
                </div>
              )}
            </form>

            {keywordGenerationError && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error generating keywords</AlertTitle>
                <AlertDescription>{keywordGenerationError}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Keyword Generation Loading State */}
        {isGeneratingKeywords && (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="flex items-center gap-3 mb-4">
                <User className="h-8 w-8 text-primary" />
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-2">
                Analyzing {personalityName}...
              </p>
              <p className="text-muted-foreground text-center max-w-md">
                We&apos;re gathering information about this personality and
                generating relevant Pinterest keywords
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
  );
};

export default PersonalityScraper;

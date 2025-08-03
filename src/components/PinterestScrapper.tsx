"use client";

import { usePinterestScraper } from "../hooks/usePinterestScrapper";
import { PinterestImage } from "../lib/types";
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { Search, Loader2, AlertCircle, Trash2 } from "lucide-react";
import ImageCard from "./ImageCard";

const PinterestScrapper = () => {
  const [keyword, setKeyword] = useState("");
  const [imageLimit, setImageLimit] = useState(20);
  const { scrapeImages, loading, error, results, clearResults, clearError } =
    usePinterestScraper();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    clearError();
    try {
      await scrapeImages(keyword.trim(), imageLimit);
    } catch (err) {
      console.error("Scraping failed:", err);
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header Card */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <Search className="h-8 w-8 text-primary" />
              Pinterest Image Scraper
            </CardTitle>
            <CardDescription>
              Search and download high-quality images from Pinterest
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-3">
                  <Label htmlFor="keyword" className="text-sm font-medium">
                    Search Keywords
                  </Label>
                  <Input
                    id="keyword"
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Enter keywords (e.g., 'modern kitchen design')"
                    className="mt-1"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label htmlFor="limit" className="text-sm font-medium">
                    Image Limit
                  </Label>
                  <Select
                    value={imageLimit.toString()}
                    onValueChange={(value) => setImageLimit(Number(value))}
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="30">30</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || !keyword.trim()}
                  className="flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Scraping...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Search Images
                    </>
                  )}
                </Button>

                {results && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearResults}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear Results
                  </Button>
                )}
              </div>
            </form>

            {error && (
              <Alert variant="destructive" className="mt-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error occurred</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <Card className="border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">
                Scraping Pinterest images...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {results && (
          <Card className="border-border">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">
                    Results for &quot;{results.keyword}&quot;
                  </CardTitle>
                  <CardDescription className="mt-1">
                    Found {results.totalFound} images
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {results.images.length} loaded
                </Badge>
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {results.images.map((image) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onDownload={downloadImage}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PinterestScrapper;

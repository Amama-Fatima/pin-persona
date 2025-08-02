/* eslint-disable @next/next/no-img-element */
"use client";

import { usePinterestScraper } from "@/hooks/usePinterestScrapper";
import { PinterestImage } from "@/lib/types";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Download,
  ExternalLink,
  Search,
  Loader2,
  AlertCircle,
  Trash2,
} from "lucide-react";

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
                  <Card
                    key={image.id}
                    className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-primary/20"
                  >
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/api/placeholder/300/300";
                        }}
                      />
                    </div>

                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2">
                        <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                          {image.title}
                        </h3>

                        {image.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {image.description}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => downloadImage(image)}
                          className="flex-1 flex items-center gap-1"
                          variant="default"
                        >
                          <Download className="h-3 w-3" />
                          Download
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="flex-1 flex items-center gap-1"
                        >
                          <a
                            href={image.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
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

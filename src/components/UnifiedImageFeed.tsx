import React from "react";
import { PinterestImage } from "../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, Grid3X3, Images } from "lucide-react";
import MasonryImageCard from "./MasonryImageCard";
import { KeywordResults } from "../hooks/usePersonalityScrapper";

interface UnifiedImageFeedProps {
  keywordResults: KeywordResults[];
  onDownload: (image: PinterestImage) => void;
  isLoading?: boolean;
}

const UnifiedImageFeed: React.FC<UnifiedImageFeedProps> = ({
  keywordResults,
  onDownload,
  isLoading = false,
}) => {
  const allImages = keywordResults
    .filter((result) => result.completed && result.images.length > 0)
    .flatMap((result) =>
      result.images.map((image) => ({
        ...image,
        keyword: result.keyword,
      }))
    );

  const loadingKeywords = keywordResults
    .filter((result) => result.loading)
    .map((result) => result.keyword);

  const totalImages = allImages.length;
  const completedKeywords = keywordResults.filter(
    (result) => result.completed
  ).length;
  const totalKeywords = keywordResults.length;

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <Grid3X3 className="h-5 w-5" />
              Image Feed
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-2">
                <Images className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {totalImages} images found
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {completedKeywords}/{totalKeywords} keywords complete
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loadingKeywords.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Loading images...
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {loadingKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {allImages.length > 0 ? (
          <div className="masonry-container">
            {allImages.map((image) => (
              <div
                key={`${image.keyword}-${image.id}`}
                className="break-inside-avoid mb-4"
              >
                <MasonryImageCard image={image} onDownload={onDownload} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Images className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              {isLoading ? "Loading images..." : "No images found yet"}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              {isLoading
                ? "Please wait while we search for images related to your personality keywords."
                : "Images will appear here as keywords are processed."}
            </p>
          </div>
        )}
      </CardContent>

      <style jsx>{`
        .masonry-container {
          column-count: 3;
          column-gap: 1.5rem;
        }

        @media (max-width: 1024px) {
          .masonry-container {
            column-count: 2;
          }
        }

        @media (max-width: 640px) {
          .masonry-container {
            column-count: 1;
          }
        }

        .break-inside-avoid {
          break-inside: avoid;
        }
      `}</style>
    </Card>
  );
};

export default UnifiedImageFeed;

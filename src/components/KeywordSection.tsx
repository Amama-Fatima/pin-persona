import React from "react";
import { PinterestImage } from "../lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "./ui/alert";
import ImageCard from "./ImageCard";
import { KeywordResults } from "../hooks/usePersonalityScrapper";

interface KeywordSectionProps {
  keywordResult: KeywordResults;
  onDownload: (image: PinterestImage) => void;
}

const KeywordSection: React.FC<KeywordSectionProps> = ({
  keywordResult,
  onDownload,
}) => {
  const getStatusIcon = () => {
    if (keywordResult.loading) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (keywordResult.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    if (keywordResult.completed) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (keywordResult.loading) return "Scraping...";
    if (keywordResult.error) return "Failed";
    if (keywordResult.completed) return "Completed";
    return "Pending";
  };

  const getStatusVariant = (): "default" | "secondary" | "destructive" => {
    if (keywordResult.loading) return "secondary";
    if (keywordResult.error) return "destructive";
    if (keywordResult.completed) return "default";
    return "secondary";
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg capitalize">
              {keywordResult.keyword}
            </CardTitle>
            <CardDescription className="mt-1">
              {keywordResult.completed && keywordResult.images.length > 0
                ? `Found ${keywordResult.images.length} images`
                : keywordResult.loading
                ? "Searching for images..."
                : keywordResult.error
                ? "Failed to load images"
                : "Waiting to start..."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant()} className="text-xs">
              {getStatusText()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {keywordResult.error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{keywordResult.error}</AlertDescription>
          </Alert>
        )}

        {keywordResult.loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">
              Scraping images for &quot;{keywordResult.keyword}&quot;...
            </p>
          </div>
        )}

        {keywordResult.completed && keywordResult.images.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {keywordResult.images.map((image) => (
              <ImageCard key={image.id} image={image} onDownload={onDownload} />
            ))}
          </div>
        )}

        {keywordResult.completed &&
          keywordResult.images.length === 0 &&
          !keywordResult.error && (
            <div className="text-center py-8">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No images found for &quot;{keywordResult.keyword}&quot;
              </p>
            </div>
          )}
      </CardContent>
    </Card>
  );
};

export default KeywordSection;

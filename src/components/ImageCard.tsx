/* eslint-disable @next/next/no-img-element */
import React from "react";
import { PinterestImage } from "../lib/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { ExternalLink } from "lucide-react";

interface ImageCardProps {
  image: PinterestImage;
  onDownload: (image: PinterestImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onDownload }) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-lg transition-all duration-300 hover:border-primary/20">
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
        </div>

        <div className="flex gap-2">
          {/* <Button
            size="sm"
            onClick={() => onDownload(image)}
            className="flex-1 flex items-center gap-1"
            variant="default"
          >
            <Download className="h-3 w-3" />
            Download
          </Button> */}

          <Button
            size="sm"
            variant="outline"
            asChild
            className="flex-1 flex items-center gap-1"
          >
            <a href={image.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              View
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageCard;

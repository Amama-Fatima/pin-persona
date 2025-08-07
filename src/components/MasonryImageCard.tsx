/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect, useRef } from "react";
import { PinterestImage } from "../lib/types";
import { Button } from "./ui/button";
import { ExternalLink, Download, Heart, Tag } from "lucide-react";

interface EnhancedPinterestImage extends PinterestImage {
  keyword?: string;
}

interface MasonryImageCardProps {
  image: EnhancedPinterestImage;
  onDownload: (image: PinterestImage) => void;
  onImageError?: (imageId: string, error: string) => void;
}

const MasonryImageCard: React.FC<MasonryImageCardProps> = ({
  image,
  onDownload,
  onImageError,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [gridRowEnd, setGridRowEnd] = useState<number | undefined>(undefined);

  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const allUrls = [image.url, ...(image.fallbackUrls || [])].filter(Boolean);

  const calculateGridRowEnd = () => {
    if (imgRef.current && containerRef.current) {
      const imageHeight = imgRef.current.offsetHeight;
      const gap = 16; // 1rem gap
      const rowHeight = 10; // grid-auto-rows: 10px
      const rowSpan = Math.ceil((imageHeight + gap) / rowHeight);
      setGridRowEnd(rowSpan);
    }
  };

  const handleImageError = () => {
    console.log(`Image failed to load: ${allUrls[currentUrlIndex]}`);

    if (currentUrlIndex < allUrls.length - 1) {
      console.log(
        `Trying fallback URL ${currentUrlIndex + 1}/${allUrls.length}`
      );
      setCurrentUrlIndex((prev) => prev + 1);
      setIsLoading(true);
    } else {
      const errorMessage = `All ${
        allUrls.length
      } URLs failed to load for image: ${image.title || image.id}`;
      console.error(errorMessage);
      setImageError(errorMessage);
      setIsLoading(false);
      onImageError?.(image.id, errorMessage);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(null);
    if (currentUrlIndex > 0) {
      console.log(
        `Successfully loaded fallback URL ${currentUrlIndex + 1} for image: ${
          image.title || image.id
        }`
      );
    }
    // Calculate grid position after image loads
    setTimeout(calculateGridRowEnd, 50);
  };

  useEffect(() => {
    setCurrentUrlIndex(0);
    setImageError(null);
    setIsLoading(true);
    setGridRowEnd(undefined);
  }, [image.id]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isLoading && !imageError) {
        calculateGridRowEnd();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isLoading, imageError]);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (image.keyword) {
      setTimeout(() => setShowTooltip(true), 500);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setShowTooltip(false);
  };

  // Error fallback UI
  if (imageError) {
    return (
      <div
        ref={containerRef}
        className="group relative cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ gridRowEnd: `span 20` }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-out">
          <div className="w-full h-48 flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500">
            <div className="text-4xl mb-2">🖼️</div>
            <div className="text-sm font-medium text-center px-4">
              Image Unavailable
            </div>
            <div className="text-xs text-gray-400 text-center px-4 mt-1 line-clamp-2">
              {image.title || "Pinterest image"}
            </div>
          </div>

          <div
            className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="absolute top-3 right-3 flex gap-2">
              <Button
                size="sm"
                className="h-8 w-8 p-0 rounded-full bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
                variant="secondary"
                asChild
                onClick={(e) => e.stopPropagation()}
              >
                <a
                  href={image.sourceUrl || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>

            {showTooltip && image.keyword && (
              <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm shadow-lg border border-white/20">
                <div className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{image.keyword}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="group relative cursor-pointer"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ gridRowEnd: gridRowEnd ? `span ${gridRowEnd}` : undefined }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-out">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mb-2"></div>
              <div className="text-xs text-gray-500">Loading...</div>
            </div>
          </div>
        )}

        <img
          ref={imgRef}
          src={allUrls[currentUrlIndex]}
          alt={image.title || "Pinterest image"}
          className={`w-full h-auto object-cover transition-all duration-300 ease-out group-hover:scale-[1.02] ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{
            minHeight: isLoading ? "200px" : "auto",
          }}
        />

        {process.env.NODE_ENV === "development" && !isLoading && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
            URL {currentUrlIndex + 1}/{allUrls.length}
            {gridRowEnd && ` | Span: ${gridRowEnd}`}
          </div>
        )}

        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
            isHovered && !isLoading ? "opacity-100" : "opacity-0"
          }`}
        >
          {showTooltip && image.keyword && (
            <div className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-2 rounded-full backdrop-blur-sm shadow-lg border border-white/20 transition-opacity duration-200">
              <div className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                <span className="capitalize">{image.keyword}</span>
              </div>
            </div>
          )}

          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                const updatedImage = {
                  ...image,
                  url: allUrls[currentUrlIndex],
                };
                onDownload(updatedImage);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-white hover:bg-gray-100 text-gray-700 shadow-lg"
              variant="secondary"
              asChild
              onClick={(e) => e.stopPropagation()}
            >
              <a
                href={allUrls[currentUrlIndex]}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          <div className="absolute bottom-3 left-3">
            <Button
              size="sm"
              className={`h-8 w-8 p-0 rounded-full shadow-lg transition-colors ${
                isLiked
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : "bg-white hover:bg-gray-100 text-gray-700"
              }`}
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
            </Button>
          </div>

          <div className="absolute bottom-3 right-3">
            <Button
              size="sm"
              className="px-4 py-2 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                const updatedImage = {
                  ...image,
                  url: allUrls[currentUrlIndex],
                };
                onDownload(updatedImage);
              }}
            >
              Save
            </Button>
          </div>
        </div>

        {image.title && !isLoading && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
            <h3 className="text-white text-sm font-medium truncate">
              {image.title}
            </h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasonryImageCard;

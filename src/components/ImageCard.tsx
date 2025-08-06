/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import { PinterestImage } from "../lib/types";
import { Button } from "./ui/button";
import { ExternalLink, Download, Heart } from "lucide-react";

interface ImageCardProps {
  image: PinterestImage;
  onDownload: (image: PinterestImage) => void;
}

const ImageCard: React.FC<ImageCardProps> = ({ image, onDownload }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div
      className="group relative cursor-pointer break-inside-avoid mb-4"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image Container */}
      <div className="relative overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 ease-out">
        <img
          src={image.url}
          alt={image.title || "Pinterest image"}
          className="w-full h-auto object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/api/placeholder/300/400";
          }}
        />

        {/* Overlay with actions - appears on hover */}
        <div
          className={`absolute inset-0 bg-black/20 transition-opacity duration-200 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Top right actions */}
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              size="sm"
              className="h-8 w-8 p-0 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(image);
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
              <a href={image.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>

          {/* Bottom left heart icon */}
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

          {/* Bottom save button */}
          <div className="absolute bottom-3 right-3">
            <Button
              size="sm"
              className="px-4 py-2 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium shadow-lg"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(image);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;

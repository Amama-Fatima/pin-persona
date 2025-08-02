/* eslint-disable @next/next/no-img-element */
import { usePinterestScraper } from "@/hooks/usePinterestScrapper";
import { PinterestImage } from "@/lib/types";
import React, { useState } from "react";

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
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Pinterest Image Scraper
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="keyword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Search Keywords
              </label>
              <input
                id="keyword"
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Enter keywords (e.g., 'modern kitchen design')"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <div className="w-full sm:w-32">
              <label
                htmlFor="limit"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Image Limit
              </label>
              <select
                id="limit"
                value={imageLimit}
                onChange={(e) => setImageLimit(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !keyword.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Scraping..." : "Search Images"}
            </button>

            {results && (
              <button
                type="button"
                onClick={clearResults}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Results
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <h3 className="font-medium">Error occurred:</h3>
            <p>{error}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Scraping Pinterest images...</p>
        </div>
      )}

      {results && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Results for &quot;{results.keyword}&quot;
            </h2>
            <span className="text-gray-600">
              {results.totalFound} images found
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.images.map((image) => (
              <div
                key={image.id}
                className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/api/placeholder/300/300";
                    }}
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-2">
                    {image.title}
                  </h3>

                  {image.description && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                      {image.description}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadImage(image)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>

                    <a
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors text-center"
                    >
                      View Original
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PinterestScrapper;

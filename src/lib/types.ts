export interface PinterestImage {
    id: string;
    url: string;
    title: string;
    description?: string;
    width?: number;
    height?: number;
    sourceUrl?: string;
}

export interface ScrapingResult {
  images: PinterestImage[];
  totalFound: number;
  keyword: string;
}
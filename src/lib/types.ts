export interface PinterestImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  width?: number;
  height?: number;
  sourceUrl?: string;
  fallbackUrls?: string[];
}

export interface ScrapingResult {
  images: PinterestImage[];
  totalFound: number;
  keyword: string;
}

export interface PersonalityData {
  personality_name: string;
  culture_region: string;
  role: string;
  time_period: string;
  bio: string;
}
export interface KeywordResponse {
  keywords: string;
  personality: string;
  prompt_used: string;
  success: boolean;
}

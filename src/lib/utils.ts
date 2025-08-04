import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function generateKeywords(personalityData: {
  personality_name: string;
  culture?: string;
  role?: string;
  period?: string;
  bio?: string;
}) {
  const response = await fetch(
    "https://Amama02-pinterest-persona-api.hf.space/generate",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(personalityData),
    }
  );

  const data = await response.json();
  return data;
}

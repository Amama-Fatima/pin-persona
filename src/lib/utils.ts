/* eslint-disable @typescript-eslint/no-explicit-any */
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

export async function getPersonalityData(): Promise<any> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  try {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemma-3-4b-it:free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
                Who was Seneca? Return a JSON object with the following keys:
                personality_name, culture, role, period, bio.
                The bio should be at most 300 characters long. It should be a brief description of the person, their achievements, ideologies, and their significance in history.
                Example:
                {
                  "personality_name": "Cleopatra",
                  "culture_region": "Egypt",
                  "role": "Queen",
                  "time_period": "Classical Antiquity",
                  "bio": "The last active ruler of the Ptolemaic Kingdom, Cleopatra was a brilliant strategist, diplomat, and linguist who forged political alliances with Julius Caesar and Mark Antony while preserving Egypt’s independence and legacy."
                }
                `,
              },
            ],
          },
        ],
      }),
    });
    const data = await resp.json();
    console.log("Gemini response:", data);
    return data;
  } catch (error) {
    console.error("Error fetching Gemini response:", error);
    throw error;
  }
}

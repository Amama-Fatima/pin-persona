import { KeywordResponse, PersonalityData } from "./types";

export async function getKeywordsForPersonality(
  personalityName: string
): Promise<KeywordResponse> {
  const API_KEY = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  try {
    // Step 1: Fetch personality data from OpenRouter
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
          Generate detailed information about ${personalityName}. Return ONLY a valid JSON object with these exact keys:
          personality_name, culture_region, role, time_period, bio

          REQUIREMENTS:
          - personality_name: Use the exact name provided
          - culture_region: Be specific (e.g., "French", "Ancient Greek", "Japanese", "British")
          - role: Include 2-3 specific roles separated by commas (e.g., "Physicist, Chemist", "Roman Emperor, Stoic Philosopher")
          - time_period: Include both era and century (e.g., "Renaissance, 15th-16th Century", "Islamic Golden Age, 11th Century", "World War II")
          - bio: 400 characters. Must include specific achievements, major works, historical significance, and key contributions. Keep sentences in bio short.

          HISTORICAL FIGURE EXAMPLE:
          {
            "personality_name": "Albert Einstein",
            "culture_region": "German-American",
            "role": "Theoretical Physicist, Nobel Laureate",
            "time_period": "Modern Physics Era, 20th Century",
            "bio": "Albert Einstein revolutionized physics with his theories of relativity, fundamentally changing our understanding of space, time, and gravity. His mass-energy equation E=mc² enabled nuclear physics. Winner of the Nobel Prize in Physics for photoelectric effect work, he became a symbol of scientific genius and humanitarian values."
          }

          FICTIONAL CHARACTER EXAMPLE:
          {
            "personality_name": "Sherlock Holmes",
            "culture_region": "British",
            "role": "Detective (Fictional Character)",
            "time_period": "Victorian Era, Late 19th Century",
            "bio": "Sherlock Holmes is a fictional detective created by Arthur Conan Doyle, renowned for his extraordinary deductive reasoning and forensic skills. Operating from 221B Baker Street with Dr. Watson, he solved complex mysteries using scientific methods and logical analysis, becoming literature's most famous detective."
          }

          Generate information for: ${personalityName}
          Return ONLY the JSON object, no additional text.
          `,
              },
            ],
          },
        ],
      }),
    });

    const openRouterData = await resp.json();

    const rawContent = openRouterData.choices?.[0]?.message?.content;
    const jsonString = rawContent?.replace(/```json|```/g, "").trim();
    console.log("JSON String:", jsonString);
    const personalityData: PersonalityData = JSON.parse(jsonString);
    console.log("PERSONALITY DATA ", personalityData);
    // Step 2: Generate Pinterest keywords
    const keywordResp = await fetch(
      "https://Amama02-pin-persona-25-august.hf.space/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personalityData),
      }
    );
    console.log("keyword resp: in api", keywordResp);
    const keywordData: KeywordResponse = await keywordResp.json();
    console.log("keyword Data: in api", keywordData);
    // console.log("Keywords Data: in api", keywordData.prompt_used);
    return keywordData;
  } catch (error) {
    console.error("Error generating keywords:", error);
    throw error;
  }
}

// https://Amama02-pinterest-keyword-generator.hf.space/generate

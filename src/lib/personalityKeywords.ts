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
                Who was ${personalityName}? Return a JSON object with the following keys:
                personality_name, culture_region, role, time_period, bio.
                The bio should be at most 300 characters long. It should be a brief description of the person, their achievements, ideologies, and their significance in history.
                Example:
                {
                  "personality_name": "Cleopatra",
                  "culture_region": "Egypt",
                  "role": "Queen",
                  "time_period": "Classical Antiquity",
                  "bio": "The last active ruler of the Ptolemaic Kingdom, Cleopatra was a brilliant strategist, diplomat, and linguist who forged political alliances with Julius Caesar and Mark Antony while preserving Egypt's independence and legacy."
                }
                `,
              },
            ],
          },
        ],
      }),
    });

    const openRouterData = await resp.json();

    // Parse the model output (assuming it returns JSON text inside choices[0].message.content)
    const rawContent = openRouterData.choices?.[0]?.message?.content;
    const jsonString = rawContent?.replace(/```json|```/g, "").trim();
    const personalityData: PersonalityData = JSON.parse(jsonString);

    // Step 2: Generate Pinterest keywords
    const keywordResp = await fetch(
      "https://Amama02-pinterest-persona-api.hf.space/generate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(personalityData),
      }
    );

    const keywordData: KeywordResponse = await keywordResp.json();
    console.log("Personality Data: in api", personalityData);
    console.log("Keywords Data: in api", keywordData.prompt_used);
    return keywordData;
  } catch (error) {
    console.error("Error generating keywords:", error);
    throw error;
  }
}

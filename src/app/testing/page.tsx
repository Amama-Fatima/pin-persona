"use client";

import React, { useEffect } from "react";
import { getPersonalityData } from "../../lib/utils";

const TestingPage = () => {
  const [result, setResult] = React.useState(null);

  useEffect(() => {
    // const handleGenerate = async () => {
    //   const result = await generateKeywords({
    //     personality_name: "Cleopatra",
    //     culture: "Egypt",
    //     role: "Queen",
    //     period: "Classical Antiquity",
    //     bio: "The last active ruler of the Ptolemaic Kingdom of Egypt. Known for her beauty, intelligence, and political alliances.",
    //   });

    //   console.log(result.keywords);
    //   setResult(result.keywords);
    // };
    // handleGenerate();
    getPersonalityData().then((raw) => {
      const rawContent = raw.choices?.[0]?.message?.content;

      // Remove the ```json ... ``` wrapping if present
      const jsonString = rawContent?.replace(/```json|```/g, "").trim();

      // Parse it to a JavaScript object
      const personalityData = JSON.parse(jsonString);
      console.log("Parsed Personality Data:", personalityData);
      setResult(personalityData);
    });
  }, []);

  return (
    <div>
      TestingPage
      <div>
        {result ? <div>{JSON.stringify(result)}</div> : "no result yet"}
      </div>
    </div>
  );
};

export default TestingPage;

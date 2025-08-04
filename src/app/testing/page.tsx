"use client";

import React, { useEffect } from "react";
import { generateKeywords } from "../../lib/utils";

const TestingPage = () => {
  const [result, setResult] = React.useState(null);

  useEffect(() => {
    const handleGenerate = async () => {
      const result = await generateKeywords({
        personality_name: "Cleopatra",
        culture: "Egypt",
        role: "Queen",
        period: "Classical Antiquity",
        bio: "The last active ruler of the Ptolemaic Kingdom of Egypt. Known for her beauty, intelligence, and political alliances.",
      });

      console.log(result.keywords);
      setResult(result.keywords);
    };
    handleGenerate();
  }, []);

  return (
    <div>
      TestingPage
      <div>{result ? result : "no result yet"}</div>
    </div>
  );
};

export default TestingPage;

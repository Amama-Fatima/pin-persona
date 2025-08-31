import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Briefcase } from "lucide-react";
import { KeywordResponse } from "../lib/types";

interface PersonalityInfoCardProps {
  personalityInfo: KeywordResponse;
  totalImages: number;
  completedKeywords: number;
  totalKeywords: number;
}

const PersonalityInfoCard: React.FC<PersonalityInfoCardProps> = ({
  personalityInfo,
  totalImages,
  completedKeywords,
  totalKeywords,
}) => {
  const getPersonalityDataFromPrompt = () => {
    try {
      const match = personalityInfo.prompt_used.match(
        /Role:\s*(.+?)\s*\|\s*Period:.*?\|\s*Bio:\s*(.+?)(?:- Generate|$)/
      );
      if (match) {
        return {
          name: personalityInfo.personality,
          role: match[1].trim(),
          bio: match[2].trim(),
        };
      }
    } catch (error) {
      console.error("Error parsing personality data from prompt:", error);
    }

    return {
      name: personalityInfo.personality,
      role: "Unknown Role",
      bio: "A notable personality from history.",
    };
  };

  const personalityData = getPersonalityDataFromPrompt();
  const keywords = personalityInfo.keywords.split(",").map((k) => k.trim());

  return (
    <Card className="border-border bg-gradient-to-br from-background to-muted/30 m-3">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              {personalityData.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                {personalityData.role}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {completedKeywords}/{totalKeywords} keywords completed
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Biography
          </h4>
          <p className="text-sm leading-relaxed">{personalityData.bio}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">
            Generated Keywords ({keywords.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            Total Images Found
          </div>
          <Badge variant="default" className="font-semibold">
            {totalImages}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalityInfoCard;

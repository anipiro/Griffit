import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Sun, Moon } from "lucide-react";

interface GriffitCompanionProps {
  childName: string;
}

const companionPhrases = [
  "You're doing amazing! 🌟",
  "I'm so proud of you! 💙",
  "Take your time, I'm here with you 🤗",
  "You make me happy! ✨",
  "What a wonderful choice! 🎉",
  "You're so creative! 🎨",
  "Let's take a deep breath together 🌬️",
  "You're safe here 💚",
];

const GriffitCompanion = ({ childName }: GriffitCompanionProps) => {
  const [currentPhrase, setCurrentPhrase] = useState(companionPhrases[0]);
  const [mood, setMood] = useState<"happy" | "calm" | "thinking">("happy");

  const getNewPhrase = () => {
    const randomPhrase = companionPhrases[Math.floor(Math.random() * companionPhrases.length)];
    setCurrentPhrase(randomPhrase);

    // Randomly change mood
    const moods: ("happy" | "calm" | "thinking")[] = ["happy", "calm", "thinking"];
    setMood(moods[Math.floor(Math.random() * moods.length)]);
  };

  const getMoodEmoji = () => {
    switch (mood) {
      case "happy":
        return "😊";
      case "calm":
        return "😌";
      case "thinking":
        return "🤔";
      default:
        return "😊";
    }
  };

  const getMoodColor = () => {
    switch (mood) {
      case "happy":
        return "from-yellow-300 to-orange-300";
      case "calm":
        return "from-blue-300 to-purple-300";
      case "thinking":
        return "from-green-300 to-teal-300";
      default:
        return "from-yellow-300 to-orange-300";
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up relative overflow-hidden">
      {/* Floating sparkles */}
      <div className="absolute top-4 right-4">
        <Sparkles className="w-6 h-6 text-primary animate-gentle-bounce" />
      </div>

      <div className="text-center space-y-6">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-primary mb-2">
            Your Griffit Friend
          </h2>
          <p className="text-muted-foreground">
            I'm always here for you, {childName}! 💙
          </p>
        </div>

        {/* Companion Avatar */}
        <div className="relative inline-block">
          <div
            className={`w-40 h-40 rounded-full bg-gradient-to-br ${getMoodColor()} flex items-center justify-center shadow-xl animate-gentle-bounce`}
          >
            <span className="text-7xl">{getMoodEmoji()}</span>
          </div>

          {/* Mood Indicator */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white px-4 py-1 rounded-full shadow-md">
            <span className="text-sm font-semibold capitalize">{mood}</span>
          </div>
        </div>

        {/* Companion Message */}
        <div className="p-6 bg-primary/10 rounded-2xl">
          <p className="text-xl font-medium text-primary">{currentPhrase}</p>
        </div>

        {/* Interaction Button */}
        <Button
          onClick={getNewPhrase}
          className="rounded-full h-14 px-8 bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          <Heart className="w-5 h-5 mr-2" />
          Talk to me!
        </Button>

        {/* Time of Day Greeting */}
        <div className="pt-4 border-t-2 border-dashed border-primary/20">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {new Date().getHours() < 18 ? (
              <>
                <Sun className="w-5 h-5 text-yellow-500" />
                <span>Have a wonderful day!</span>
              </>
            ) : (
              <>
                <Moon className="w-5 h-5 text-blue-500" />
                <span>Have a peaceful evening!</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GriffitCompanion;

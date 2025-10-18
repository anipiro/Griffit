import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, Heart, Zap } from "lucide-react";

interface EmotionPlaygroundProps {
  childId: string;
}

const emotions = [
  { type: "happy", icon: Smile, color: "bg-yellow-300", label: "Happy", hsl: "48 96% 53%" },
  { type: "calm", icon: Heart, color: "bg-blue-300", label: "Calm", hsl: "200 60% 75%" },
  { type: "excited", icon: Zap, color: "bg-pink-300", label: "Excited", hsl: "330 60% 75%" },
  { type: "neutral", icon: Meh, color: "bg-gray-300", label: "Okay", hsl: "0 0% 75%" },
  { type: "sad", icon: Frown, color: "bg-purple-300", label: "Sad", hsl: "270 60% 75%" },
];

const EmotionPlayground = ({ childId }: EmotionPlaygroundProps) => {
  const { toast } = useToast();
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const handleEmotionSelect = async (emotion: typeof emotions[0]) => {
    setSelectedEmotion(emotion.type);

    try {
      await supabase.from("emotion_logs").insert({
        child_id: childId,
        emotion_type: emotion.type,
        color_choice: emotion.hsl,
        intensity: 3,
      });

      // Log progress
      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: "emotion_shared",
      });

      toast({
        title: `You're feeling ${emotion.label}!`,
        description: "Thank you for sharing how you feel 💙",
      });
    } catch (error) {
      console.error("Error logging emotion:", error);
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          😊 How are you feeling?
        </h2>
        <p className="text-muted-foreground text-lg">
          Pick the feeling that matches how you feel right now
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {emotions.map((emotion) => {
          const Icon = emotion.icon;
          const isSelected = selectedEmotion === emotion.type;

          return (
            <Button
              key={emotion.type}
              onClick={() => handleEmotionSelect(emotion)}
              className={`h-32 rounded-2xl flex flex-col items-center justify-center gap-3 transition-all duration-300 ${
                isSelected
                  ? "scale-105 ring-4 ring-primary shadow-xl"
                  : "hover:scale-105"
              } ${emotion.color} text-gray-800 hover:shadow-lg`}
              variant="ghost"
            >
              <Icon className="w-12 h-12" />
              <span className="text-xl font-semibold">{emotion.label}</span>
            </Button>
          );
        })}
      </div>

      {selectedEmotion && (
        <div className="mt-6 p-4 bg-primary/10 rounded-xl text-center animate-fade-in-up">
          <p className="text-lg font-medium text-primary">
            Great job sharing your feelings! 🌟
          </p>
        </div>
      )}
    </Card>
  );
};

export default EmotionPlayground;

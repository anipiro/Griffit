import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { CloudRain, Star, Trees, Wind } from "lucide-react";

interface CalmCornerProps {
  childId: string;
}

const calmOptions = [
  { type: "rain", icon: CloudRain, label: "Rain Sounds", color: "bg-blue-200" },
  { type: "stars", icon: Star, label: "Starry Night", color: "bg-indigo-200" },
  { type: "forest", icon: Trees, label: "Forest Walk", color: "bg-green-200" },
  { type: "wind", icon: Wind, label: "Gentle Wind", color: "bg-sky-200" },
];

const CalmCorner = ({ childId }: CalmCornerProps) => {
  const { toast } = useToast();
  const [activeCalm, setActiveCalm] = useState<string | null>(null);
  const [breathCount, setBreathCount] = useState(0);

  const handleCalmSelect = async (calm: typeof calmOptions[0]) => {
    setActiveCalm(calm.type);

    try {
      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: "calm_corner_visit",
      });

      toast({
        title: `${calm.label} activated 🌙`,
        description: "Take some deep breaths and relax",
      });
    } catch (error) {
      console.error("Error logging calm activity:", error);
    }
  };

  const handleBreath = async () => {
    const newCount = breathCount + 1;
    setBreathCount(newCount);

    if (newCount === 3) {
      toast({
        title: "Amazing! 🌟",
        description: "You completed 3 deep breaths!",
      });

      try {
        await supabase.from("progress_entries").insert({
          child_id: childId,
          activity_type: "breathing_exercise",
        });
      } catch (error) {
        console.error("Error logging breathing exercise:", error);
      }
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-secondary mb-2">
          🧘 Calm Corner
        </h2>
        <p className="text-muted-foreground text-lg">
          A peaceful place to relax and breathe
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {calmOptions.map((calm) => {
            const Icon = calm.icon;
            const isActive = activeCalm === calm.type;

            return (
              <Button
                key={calm.type}
                onClick={() => handleCalmSelect(calm)}
                className={`h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  isActive
                    ? "scale-105 ring-4 ring-secondary shadow-xl"
                    : "hover:scale-105"
                } ${calm.color} text-gray-800 hover:shadow-lg`}
                variant="ghost"
              >
                <Icon className="w-8 h-8" />
                <span className="font-semibold">{calm.label}</span>
              </Button>
            );
          })}
        </div>

        <div className="p-6 bg-secondary/20 rounded-2xl text-center space-y-4">
          <h3 className="text-2xl font-bold text-secondary">Breathing Circle</h3>
          <p className="text-muted-foreground">
            Click the circle and take a deep breath
          </p>

          <button
            onClick={handleBreath}
            className="w-32 h-32 rounded-full bg-gradient-to-br from-secondary to-accent mx-auto block transition-transform duration-300 hover:scale-110 active:scale-95 shadow-xl"
          >
            <span className="text-2xl font-bold text-white">{breathCount}</span>
          </button>

          {breathCount > 0 && (
            <p className="text-lg font-medium text-secondary animate-fade-in-up">
              {breathCount === 1 && "Great start! Keep breathing..."}
              {breathCount === 2 && "One more! You're doing great!"}
              {breathCount >= 3 && "Perfect! You're so calm now 💙"}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CalmCorner;

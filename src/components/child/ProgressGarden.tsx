import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Flower2, Sparkles, Trophy } from "lucide-react";

interface ProgressGardenProps {
  childId: string;
}

const ProgressGarden = ({ childId }: ProgressGardenProps) => {
  const [progressCount, setProgressCount] = useState(0);

  useEffect(() => {
    fetchProgress();
  }, [childId]);

  const fetchProgress = async () => {
    const { data, error } = await supabase
      .from("progress_entries")
      .select("*")
      .eq("child_id", childId);

    if (!error && data) {
      setProgressCount(data.length);
    }
  };

  const flowers = Array.from({ length: Math.min(progressCount, 20) }, (_, i) => i);

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-accent mb-2">
          🌱 Your Progress Garden
        </h2>
        <p className="text-muted-foreground text-lg">
          Every activity you do makes a flower grow!
        </p>
      </div>

      <div className="mb-6 p-4 bg-accent/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Trophy className="w-8 h-8 text-accent" />
          <div>
            <p className="text-sm text-muted-foreground">Total Activities</p>
            <p className="text-3xl font-bold text-accent">{progressCount}</p>
          </div>
        </div>
        <Sparkles className="w-12 h-12 text-accent animate-gentle-bounce" />
      </div>

      <div className="min-h-[200px] p-6 bg-gradient-to-b from-sky-100 to-green-100 rounded-2xl relative overflow-hidden">
        {progressCount === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-2">
              Your garden is waiting to grow!
            </p>
            <p className="text-muted-foreground">
              Complete activities to plant your first flower 🌸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-5 md:grid-cols-10 gap-4">
            {flowers.map((i) => (
              <div
                key={i}
                className="flex items-center justify-center animate-gentle-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <Flower2
                  className="w-10 h-10 md:w-12 md:h-12"
                  style={{
                    color: [
                      "#F59E0B",
                      "#EC4899",
                      "#8B5CF6",
                      "#06B6D4",
                      "#10B981",
                    ][i % 5],
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {progressCount >= 20 && (
          <div className="mt-6 p-4 bg-white/80 rounded-xl text-center animate-fade-in-up">
            <p className="text-xl font-bold text-accent">
              🎉 Your garden is full and beautiful! 🎉
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProgressGarden;

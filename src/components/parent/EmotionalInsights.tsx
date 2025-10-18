import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";

interface EmotionalInsightsProps {
  childId: string;
}

const EmotionalInsights = ({ childId }: EmotionalInsightsProps) => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [childId]);

  const fetchInsights = async () => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("emotion_logs")
      .select("*")
      .eq("child_id", childId)
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Count emotions
      const emotionCounts: { [key: string]: number } = {};
      data.forEach((log) => {
        emotionCounts[log.emotion_type] = (emotionCounts[log.emotion_type] || 0) + 1;
      });

      const insightArray = Object.entries(emotionCounts)
        .map(([emotion, count]) => ({ emotion, count }))
        .sort((a, b) => b.count - a.count);

      setInsights(insightArray);
    }
    setLoading(false);
  };

  const getEmotionColor = (emotion: string) => {
    const colors: { [key: string]: string } = {
      happy: "bg-yellow-300",
      calm: "bg-blue-300",
      excited: "bg-pink-300",
      neutral: "bg-gray-300",
      sad: "bg-purple-300",
    };
    return colors[emotion] || "bg-gray-300";
  };

  const getEmotionEmoji = (emotion: string) => {
    const emojis: { [key: string]: string } = {
      happy: "😊",
      calm: "💙",
      excited: "⚡",
      neutral: "😐",
      sad: "😢",
    };
    return emojis[emotion] || "😊";
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
          <TrendingUp className="w-8 h-8" />
          Emotional Insights
        </h2>
        <p className="text-muted-foreground text-lg">
          Past 7 days emotion patterns
        </p>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading insights...</p>
      ) : insights.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            No emotion data available yet. Check back soon!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div
              key={insight.emotion}
              className="p-4 rounded-xl border-2 flex items-center justify-between animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">{getEmotionEmoji(insight.emotion)}</span>
                <div>
                  <p className="font-bold text-lg capitalize">{insight.emotion}</p>
                  <p className="text-sm text-muted-foreground">
                    Logged {insight.count} time{insight.count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div
                className={`w-16 h-16 rounded-full ${getEmotionColor(
                  insight.emotion
                )} flex items-center justify-center text-2xl font-bold text-gray-800`}
              >
                {insight.count}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default EmotionalInsights;

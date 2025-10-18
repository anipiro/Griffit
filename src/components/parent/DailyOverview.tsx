import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Heart, Activity, Sparkles } from "lucide-react";

interface DailyOverviewProps {
  childId: string;
  childName: string;
}

const DailyOverview = ({ childId, childName }: DailyOverviewProps) => {
  const [todayStats, setTodayStats] = useState({
    emotions: 0,
    calmVisits: 0,
    totalActivities: 0,
  });

  useEffect(() => {
    fetchTodayStats();
  }, [childId]);

  const fetchTodayStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get emotions logged today
    const { data: emotions } = await supabase
      .from("emotion_logs")
      .select("*")
      .eq("child_id", childId)
      .gte("created_at", today.toISOString());

    // Get progress entries today
    const { data: progress } = await supabase
      .from("progress_entries")
      .select("*")
      .eq("child_id", childId)
      .gte("created_at", today.toISOString());

    const calmVisits = progress?.filter(
      (p) => p.activity_type === "calm_corner_visit"
    ).length || 0;

    setTodayStats({
      emotions: emotions?.length || 0,
      calmVisits,
      totalActivities: progress?.length || 0,
    });
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          📊 Today's Summary
        </h2>
        <p className="text-muted-foreground text-lg">
          {childName}'s activity for today
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-primary/10 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Emotions Shared</p>
              <p className="text-2xl font-bold text-primary">{todayStats.emotions}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-secondary/10 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-secondary" />
            <div>
              <p className="text-sm text-muted-foreground">Calm Corner Visits</p>
              <p className="text-2xl font-bold text-secondary">{todayStats.calmVisits}</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/10 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" />
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-2xl font-bold text-accent">{todayStats.totalActivities}</p>
            </div>
          </div>
        </div>
      </div>

      {todayStats.totalActivities === 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-xl text-center">
          <p className="text-muted-foreground">
            No activity recorded today yet
          </p>
        </div>
      )}
    </Card>
  );
};

export default DailyOverview;

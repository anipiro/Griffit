import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Award, Heart, Star, Sparkles, Trophy, Zap } from "lucide-react";

interface ParentBadgesProps {
  childId: string;
  childName: string;
}

const badgeTypes = [
  { type: "star", icon: Star, label: "Star", color: "bg-yellow-300" },
  { type: "heart", icon: Heart, label: "Love", color: "bg-pink-300" },
  { type: "trophy", icon: Trophy, label: "Achievement", color: "bg-amber-300" },
  { type: "sparkles", icon: Sparkles, label: "Amazing", color: "bg-purple-300" },
  { type: "zap", icon: Zap, label: "Energy", color: "bg-blue-300" },
  { type: "award", icon: Award, label: "Award", color: "bg-green-300" },
];

const ParentBadges = ({ childId, childName }: ParentBadgesProps) => {
  const { toast } = useToast();
  const [selectedBadge, setSelectedBadge] = useState(badgeTypes[0]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const sendBadge = async () => {
    if (!message.trim()) {
      toast({
        title: "Add a message",
        description: "Write something encouraging for your child!",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      // Log as a special progress entry that appears in child's garden
      await supabase.from("progress_entries").insert({
        child_id: childId,
        activity_type: `parent_badge_${selectedBadge.type}`,
      });

      // Could also create a separate badges table in the future
      // For now, this adds to their progress garden

      toast({
        title: "Badge sent! 🎉",
        description: `${childName} will see your encouragement in their Progress Garden!`,
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending badge:", error);
      toast({
        title: "Error",
        description: "Couldn't send badge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2">
          💌 Send Encouragement
        </h2>
        <p className="text-muted-foreground text-lg">
          Send {childName} a special badge of encouragement
        </p>
      </div>

      <div className="space-y-6">
        {/* Badge Selection */}
        <div>
          <Label className="text-lg font-semibold mb-3 block">Choose a badge:</Label>
          <div className="grid grid-cols-3 gap-3">
            {badgeTypes.map((badge) => {
              const Icon = badge.icon;
              const isSelected = selectedBadge.type === badge.type;

              return (
                <Button
                  key={badge.type}
                  onClick={() => setSelectedBadge(badge)}
                  className={`h-24 rounded-xl flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                    isSelected
                      ? "scale-105 ring-4 ring-primary shadow-xl"
                      : "hover:scale-105"
                  } ${badge.color} text-gray-800 hover:shadow-lg`}
                  variant="ghost"
                >
                  <Icon className="w-8 h-8" />
                  <span className="text-sm font-semibold">{badge.label}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Message Input */}
        <div>
          <Label htmlFor="badge-message" className="text-lg font-semibold mb-3 block">
            Your message:
          </Label>
          <Input
            id="badge-message"
            placeholder="e.g., 'So proud of you today!'"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="h-14 text-lg rounded-xl"
            maxLength={100}
          />
          <p className="text-sm text-muted-foreground mt-2">
            {message.length}/100 characters
          </p>
        </div>

        {/* Preview */}
        <div className="p-6 bg-accent/10 rounded-2xl text-center">
          <p className="text-sm text-muted-foreground mb-3">Preview:</p>
          <div className="inline-flex flex-col items-center gap-3">
            <div className={`w-20 h-20 rounded-full ${selectedBadge.color} flex items-center justify-center shadow-lg`}>
              {(() => {
                const Icon = selectedBadge.icon;
                return <Icon className="w-10 h-10 text-gray-800" />;
              })()}
            </div>
            <p className="text-lg font-medium text-foreground">
              {message || "Your message here..."}
            </p>
          </div>
        </div>

        {/* Send Button */}
        <Button
          onClick={sendBadge}
          disabled={sending || !message.trim()}
          className="w-full h-14 text-lg rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
        >
          {sending ? "Sending..." : "Send Badge 💝"}
        </Button>
      </div>
    </Card>
  );
};

export default ParentBadges;

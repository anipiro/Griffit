import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Heart } from "lucide-react";

interface EncouragementInboxProps {
  childId: string;
}

interface EncouragementMessage {
  id: string;
  badge_type: string;
  message: string;
  created_at: string;
}

const EncouragementInbox = ({ childId }: EncouragementInboxProps) => {
  const [messages, setMessages] = useState<EncouragementMessage[]>([]);

  useEffect(() => {
    fetchMessages();
  }, [childId]);

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("encouragement_messages")
      .select("id, badge_type, message, created_at")
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMessages(data);
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-secondary mb-2 flex items-center gap-2">
          <Mail className="w-8 h-8" />
          Encouragement Inbox
        </h2>
        <p className="text-muted-foreground text-lg">
          Messages from your parent show up here.
        </p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-10 bg-muted/40 rounded-2xl">
          <Heart className="w-12 h-12 text-secondary mx-auto mb-3" />
          <p className="text-lg font-medium text-foreground mb-1">No encouragement yet</p>
          <p className="text-muted-foreground">Your parent messages will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="p-4 rounded-2xl border-2 border-secondary/20 bg-secondary/5">
              <p className="text-sm uppercase tracking-wide text-secondary font-semibold mb-2">
                {message.badge_type.replace(/_/g, " ")}
              </p>
              <p className="text-lg text-foreground leading-relaxed">{message.message}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default EncouragementInbox;

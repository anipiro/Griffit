import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Link2, Mail } from "lucide-react";

type LinkMode = "parent" | "child";

interface LinkByEmailCardProps {
  mode: LinkMode;
  onLinked?: () => void;
}

const LinkByEmailCard = ({ mode, onLinked }: LinkByEmailCardProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isParentMode = mode === "parent";
  const title = isParentMode ? "Link a Child" : "Link a Parent";
  const description = isParentMode
    ? "Enter your child's email to connect their account to yours."
    : "Enter your parent's email to connect your account to theirs.";
  const placeholder = isParentMode ? "child@email.com" : "parent@email.com";
  const functionName = isParentMode
    ? "link_child_to_parent_by_email"
    : "link_parent_to_child_by_email";
  const buttonLabel = isParentMode ? "Link Child" : "Link Parent";

  const handleLink = async () => {
    if (!email.trim()) {
      toast({
        title: "Enter an email",
        description: "Please type the email address you want to link.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.rpc(functionName, isParentMode
        ? { target_child_email: email.trim() }
        : { target_parent_email: email.trim() }
      );

      if (error) throw error;

      toast({
        title: "Connection confirmed",
        description: isParentMode
          ? "The child is now confirmed and linked to your parent account."
          : "Your account is now confirmed and linked to your parent.",
      });

      setEmail("");
      onLinked?.();
    } catch (error: any) {
      toast({
        title: "Link failed",
        description: error.message || "Could not link by email.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 glass-effect shadow-[var(--shadow-float)] border-2 animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-primary mb-2 flex items-center gap-2">
          <Link2 className="w-8 h-8" />
          {title}
        </h2>
        <p className="text-muted-foreground text-lg">{description}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lg font-medium">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder={placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 text-lg rounded-xl border-2 pl-11"
            />
          </div>
        </div>

        <Button
          type="button"
          onClick={handleLink}
          disabled={loading}
          className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90"
        >
          {loading ? "Linking..." : buttonLabel}
        </Button>
      </div>
    </Card>
  );
};

export default LinkByEmailCard;

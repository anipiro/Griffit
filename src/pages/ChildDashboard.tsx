import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, Sparkles } from "lucide-react";
import EmotionPlayground from "@/components/child/EmotionPlayground";
import CalmCorner from "@/components/child/CalmCorner";
import ProgressGarden from "@/components/child/ProgressGarden";
import ChoiceExplorer from "@/components/child/ChoiceExplorer";
import CreativeHub from "@/components/child/CreativeHub";
import GriffitCompanion from "@/components/child/GriffitCompanion";
import type { User } from "@supabase/supabase-js";

const ChildDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [childData, setChildData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate("/");
      return;
    }

    setUser(user);

    // Get child profile
    const { data: child, error } = await supabase
      .from("children")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !child) {
      toast({
        title: "Access Denied",
        description: "This dashboard is for children only.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setChildData(child);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "See you soon!",
      description: "You've been logged out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--calm-lavender)_/_0.2)] via-[hsl(var(--gentle-cream))] to-[hsl(var(--soft-mint)_/_0.2)]">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Loading your world...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--calm-lavender)_/_0.2)] via-[hsl(var(--gentle-cream))] to-[hsl(var(--soft-mint)_/_0.2)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2">
              Hi, {childData?.child_name}! 👋
            </h1>
            <p className="text-xl text-muted-foreground">
              Welcome to your Griffit World
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="rounded-full h-12 px-6"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Logout
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Row 1 */}
          <EmotionPlayground childId={childData?.id} />
          <GriffitCompanion childName={childData?.child_name} />
          
          {/* Row 2 */}
          <ChoiceExplorer childId={childData?.id} />
          <CalmCorner childId={childData?.id} />
          
          {/* Row 3 - Full Width */}
          <div className="lg:col-span-2">
            <CreativeHub childId={childData?.id} />
          </div>
          
          {/* Row 4 - Full Width */}
          <div className="lg:col-span-2">
            <ProgressGarden childId={childData?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildDashboard;

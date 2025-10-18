import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut, TrendingUp } from "lucide-react";
import DailyOverview from "@/components/parent/DailyOverview";
import EmotionalInsights from "@/components/parent/EmotionalInsights";
import ParentBadges from "@/components/parent/ParentBadges";
import type { User } from "@supabase/supabase-js";

const ParentDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [parentData, setParentData] = useState<any>(null);
  const [children, setChildren] = useState<any[]>([]);
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

    // Get parent profile
    const { data: parent, error } = await supabase
      .from("parents")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !parent) {
      toast({
        title: "Access Denied",
        description: "This dashboard is for parents only.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setParentData(parent);

    // Get children
    const { data: childrenData } = await supabase
      .from("children")
      .select("*")
      .eq("parent_id", parent.id);

    setChildren(childrenData || []);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast({
      title: "Goodbye!",
      description: "You've been logged out successfully.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[hsl(var(--calm-lavender)_/_0.2)] via-[hsl(var(--gentle-cream))] to-[hsl(var(--soft-mint)_/_0.2)]">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-xl font-medium text-muted-foreground">Loading insights...</p>
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
              Welcome, {parentData?.full_name}
            </h1>
            <p className="text-xl text-muted-foreground">
              Your Insight Hub
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
        {children.length > 0 ? (
          <div className="space-y-6">
            {children.map((child) => (
              <div key={child.id} className="space-y-6">
                <h2 className="text-3xl font-bold text-foreground">
                  {child.child_name}'s Journey
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <DailyOverview childId={child.id} childName={child.child_name} />
                  <EmotionalInsights childId={child.id} />
                  <ParentBadges childId={child.id} childName={child.child_name} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">
              No children linked to this account yet
            </p>
            <p className="text-muted-foreground">
              Children can link their accounts by providing your parent ID
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentDashboard;

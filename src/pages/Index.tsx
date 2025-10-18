import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      // Check if parent or child
      const { data: parentData } = await supabase
        .from("parents")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (parentData) {
        navigate("/parent-dashboard");
      } else {
        navigate("/child-dashboard");
      }
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[hsl(var(--calm-lavender)_/_0.2)] via-[hsl(var(--gentle-cream))] to-[hsl(var(--soft-mint)_/_0.2)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
        <p className="text-xl text-muted-foreground">Loading Griffit...</p>
      </div>
    </div>
  );
};

export default Index;

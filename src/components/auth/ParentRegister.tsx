import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, UserPlus } from "lucide-react";

const ParentRegister = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !email || !password) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Weak Password",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("User creation failed");
      }

      // Create parent profile
      const { error: profileError } = await supabase
        .from("parents")
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          email: email,
        });

      if (profileError) throw profileError;

      toast({
        title: "Welcome to Griffit!",
        description: "Your parent account has been created successfully.",
      });

      navigate("/parent-dashboard");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="parent-name" className="text-lg font-medium">Full Name</Label>
          <Input
            id="parent-name"
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-12 text-lg rounded-xl border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-email" className="text-lg font-medium">Email</Label>
          <Input
            id="parent-email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-lg rounded-xl border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent-password" className="text-lg font-medium">Password</Label>
          <div className="relative">
            <Input
              id="parent-password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-lg rounded-xl border-2 pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 text-lg rounded-xl bg-primary hover:bg-primary/90"
      >
        {loading ? (
          "Creating account..."
        ) : (
          <>
            <UserPlus className="w-5 h-5 mr-2" />
            Create Parent Account
          </>
        )}
      </Button>
    </form>
  );
};

export default ParentRegister;

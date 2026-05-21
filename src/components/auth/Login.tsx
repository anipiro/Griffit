import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { signInWithEmailPassword } from "@/lib/supabase-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, LogIn } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<"parent" | "child">("child");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await signInWithEmailPassword(email, password);

      if (error) throw error;
      if (!data.user) throw new Error("Login did not return a user. Please try again.");

      if (accountType === "parent") {
        const { data: parentData, error: parentLookupError } = await supabase
          .from("parents")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (parentLookupError || !parentData) {
          throw new Error("This account does not have a parent profile yet. Please create the parent profile or sign in as a child.");
        }

        navigate("/parent-dashboard");
      } else {
        const { data: childData, error: childLookupError } = await supabase
          .from("children")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (childLookupError || !childData) {
          throw new Error("This account does not have a child profile yet. Please create the child profile or sign in as a parent.");
        }

        navigate("/child-dashboard");
      }

      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-lg font-medium">I am signing in as</Label>
          <RadioGroup
            value={accountType}
            onValueChange={(value) => setAccountType(value as "parent" | "child")}
            className="grid grid-cols-2 gap-3"
          >
            <label className="flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer has-[:checked]:border-primary">
              <RadioGroupItem value="parent" id="login-parent" />
              <span>Parent</span>
            </label>
            <label className="flex items-center gap-3 rounded-xl border-2 p-3 cursor-pointer has-[:checked]:border-secondary">
              <RadioGroupItem value="child" id="login-child" />
              <span>Child</span>
            </label>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-lg font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 text-lg rounded-xl border-2"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-lg font-medium">Password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 text-lg rounded-xl border-2 pr-12"
              required
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
        className="w-full h-12 text-lg rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
      >
        {loading ? (
          "Logging in..."
        ) : (
          <>
            <LogIn className="w-5 h-5 mr-2" />
            Login
          </>
        )}
      </Button>
    </form>
  );
};

export default Login;

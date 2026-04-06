import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 

export default function AgencyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        toast.success("Successfully logged in!");
        navigate("/"); 
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Subtle background glow behind the login box to make it look premium */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 glass-card p-8 rounded-xl border border-border/50 shadow-2xl relative z-10 bg-card/80 backdrop-blur-xl">
        <div className="text-center flex flex-col items-center">
          {/* Brand Logo */}
          <img src="/bx-logo.png" alt="BodhiX Logo" className="h-16 w-16 mb-4 drop-shadow-md" />
          <h2 className="text-2xl font-bold tracking-tight">BodhiX HQ</h2>
          <p className="text-sm text-muted-foreground mt-2">
            Secure access to agency operations
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6 mt-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@bodhix.dev"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50"
            />
          </div>

          <Button type="submit" className="w-full font-medium" disabled={loading}>
            {loading ? "Authenticating..." : "Sign in to BodhiX"}
          </Button>
        </form>
      </div>
    </div>
  );
}
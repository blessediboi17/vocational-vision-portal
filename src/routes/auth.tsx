import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Admin sign in — Redeem Vocational Training Center" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(8, "Min 8 characters").max(200),
});

const emailSchema = z.string().trim().email().max(255);

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" as any });
    });
    const saved = localStorage.getItem("rvtc_remember_email");
    if (saved) {
      const el = document.getElementById("email") as HTMLInputElement | null;
      if (el) el.value = saved;
    }
  }, [navigate]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");

    if (mode === "forgot") {
      const parsed = emailSchema.safeParse(email);
      if (!parsed.success) return toast.error("Enter a valid email");
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Password reset email sent. Check your inbox.");
      setMode("signin");
      return;
    }

    const parsed = schema.safeParse({ email, password: fd.get("password") });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check inputs");
      return;
    }
    setLoading(true);
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created! You're signed in.");
      navigate({ to: "/admin" as any });
    } else {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      setLoading(false);
      if (error) return toast.error(error.message);
      if (remember) localStorage.setItem("rvtc_remember_email", parsed.data.email);
      else localStorage.removeItem("rvtc_remember_email");
      navigate({ to: "/admin" as any });
    }
  }

  const title =
    mode === "signin" ? "Admin sign in" : mode === "signup" ? "Create admin account" : "Reset your password";
  const subtitle =
    mode === "signin"
      ? "Sign in to manage content."
      : mode === "signup"
      ? "The first account becomes the admin."
      : "Enter your email and we'll send a reset link.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back to site
        </Link>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-soft)]">
          <div className="size-12 rounded-full bg-[image:var(--gradient-leaf)] flex items-center justify-center mb-4">
            <ShieldCheck className="size-6 text-leaf-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1">{title}</h1>
          <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            {mode !== "forgot" && (
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
            )}
            {mode === "signin" && (
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Remember me
              </label>
            )}
            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : mode === "signin" ? (
                "Sign in"
              ) : mode === "signup" ? (
                "Create account"
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center space-y-2">
            {mode === "forgot" ? (
              <button onClick={() => setMode("signin")} className="text-muted-foreground hover:text-foreground">
                Back to sign in
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="text-muted-foreground hover:text-foreground w-full"
              >
                {mode === "signin" ? "Need an account? Create one" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

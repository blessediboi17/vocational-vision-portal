import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Redeem Vocational Training Center" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

const schema = z
  .object({
    password: z.string().min(8, "Min 8 characters").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords don't match", path: ["confirm"] });

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Supabase auto-parses the recovery token from the URL hash on load.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Check inputs");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're signed in.");
    navigate({ to: "/admin" as any });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Link to="/auth" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> Back to sign in
        </Link>
        <div className="bg-card border border-border rounded-2xl p-8 shadow-[var(--shadow-soft)]">
          <div className="size-12 rounded-full bg-[image:var(--gradient-leaf)] flex items-center justify-center mb-4">
            <KeyRound className="size-6 text-leaf-foreground" />
          </div>
          <h1 className="font-display text-2xl font-semibold mb-1">Set a new password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {ready ? "Enter and confirm your new password." : "Open this page from the password-reset email link."}
          </p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <div>
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" />
            </div>
            <Button
              type="submit"
              disabled={loading || !ready}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

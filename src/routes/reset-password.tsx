import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, ArrowLeft, KeyRound, AlertTriangle } from "lucide-react";

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

type Status = "checking" | "ready" | "invalid";

function parseHash(): { error?: string; description?: string; hasToken: boolean } {
  if (typeof window === "undefined") return { hasToken: false };
  const h = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  const p = new URLSearchParams(h);
  const qp = new URLSearchParams(window.location.search);
  return {
    error: p.get("error") || p.get("error_code") || qp.get("error") || undefined,
    description: p.get("error_description") || qp.get("error_description") || undefined,
    hasToken: !!(p.get("access_token") || p.get("token") || p.get("type") === "recovery"),
  };
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const { error, description, hasToken } = parseHash();
    if (error) {
      const friendly = /expired/i.test(description || error)
        ? "This password reset link has expired. Please request a new one."
        : /invalid|otp/i.test(description || error)
        ? "This reset link is invalid or has already been used."
        : description || "We couldn't verify this reset link.";
      setErrorMsg(friendly);
      setStatus("invalid");
      return;
    }

    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setStatus("ready");
        setErrorMsg(null);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setStatus("ready");
      } else if (!hasToken) {
        // Give Supabase a moment to process a token if present, then fail.
        setTimeout(() => {
          setStatus((s) => {
            if (s === "checking") {
              setErrorMsg("Open this page from the password-reset link in your email.");
              return "invalid";
            }
            return s;
          });
        }, 1500);
      }
    });

    return () => sub.data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Check inputs");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    setLoading(false);
    if (error) {
      const msg = /session|jwt|expired|auth/i.test(error.message)
        ? "Your reset session has expired. Request a new reset link."
        : error.message;
      toast.error(msg);
      if (/session|jwt|expired|auth/i.test(error.message)) {
        setErrorMsg("Your reset session has expired. Request a new reset link.");
        setStatus("invalid");
      }
      return;
    }
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
            {status === "invalid" ? (
              <AlertTriangle className="size-6 text-leaf-foreground" />
            ) : (
              <KeyRound className="size-6 text-leaf-foreground" />
            )}
          </div>

          {status === "invalid" ? (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Reset link problem</h1>
              <p className="text-sm text-muted-foreground mb-6">
                {errorMsg ?? "We couldn't verify this reset link."}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate({ to: "/auth" as any })}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Request a new reset link
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate({ to: "/auth" as any })}
                  className="w-full"
                >
                  Back to sign in
                </Button>
              </div>
            </>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold mb-1">Set a new password</h1>
              <p className="text-sm text-muted-foreground mb-6">
                {status === "ready"
                  ? "Enter and confirm your new password."
                  : "Verifying your reset link…"}
              </p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input id="password" name="password" type="password" required minLength={8} autoComplete="new-password" disabled={status !== "ready"} />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input id="confirm" name="confirm" type="password" required minLength={8} autoComplete="new-password" disabled={status !== "ready"} />
                </div>
                <Button
                  type="submit"
                  disabled={loading || status !== "ready"}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {loading || status === "checking" ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

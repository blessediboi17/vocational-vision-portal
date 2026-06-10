import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Send, Loader2 } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name is required").max(100),
  email: z.string().trim().email("Valid email required").max(255),
  phone: z.string().trim().max(30).optional(),
  interest: z.string().trim().max(100).optional(),
  message: z.string().trim().min(5, "Tell us a bit more").max(2000),
});

export function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      full_name: fd.get("full_name"),
      email: fd.get("email"),
      phone: fd.get("phone") || undefined,
      interest: fd.get("interest") || undefined,
      message: fd.get("message"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Check your inputs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("contact_submissions").insert(parsed.data);
    setLoading(false);
    if (error) {
      toast.error("Could not send. Try calling us directly.");
      return;
    }
    setDone(true);
    toast.success("Thank you — we'll be in touch soon!");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 p-6 rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)]">
      <h3 className="font-display text-2xl font-semibold">Request information</h3>
      <p className="text-sm text-muted-foreground -mt-2">Register interest for classes, events, or rentals. We reply within 24 hours.</p>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" name="full_name" required maxLength={100} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required maxLength={255} />
        </div>
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" maxLength={30} />
        </div>
        <div>
          <Label htmlFor="interest">I'm interested in</Label>
          <select
            id="interest" name="interest"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
            defaultValue=""
          >
            <option value="" disabled>Select…</option>
            <option>Culinary Classes</option>
            <option>Baking & Pastry</option>
            <option>Cake Design</option>
            <option>Wedding Cakes</option>
            <option>Event Planning</option>
            <option>Interior Decoration</option>
            <option>Catering Equipment Rental</option>
            <option>Other</option>
          </select>
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required maxLength={2000} rows={4} placeholder="Tell us about your event, group size, or what you'd like to learn…" />
      </div>
      <Button type="submit" disabled={loading || done} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {done ? "Submitted" : "Send message"}
      </Button>
    </form>
  );
}

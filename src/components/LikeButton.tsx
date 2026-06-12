import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getFingerprint } from "@/lib/posts";
import { cn } from "@/lib/utils";

export function LikeButton({ postId, className }: { postId: string; className?: string }) {
  const [count, setCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);
  const fp = typeof window !== "undefined" ? getFingerprint() : "";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { count: c } = await (supabase.from("post_likes" as any) as any)
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (!cancelled) setCount(c || 0);
      const { data } = await (supabase.from("post_likes" as any) as any)
        .select("id")
        .eq("post_id", postId)
        .eq("liker_fingerprint", fp)
        .maybeSingle();
      if (!cancelled) setLiked(!!data);
    })();
    return () => { cancelled = true; };
  }, [postId, fp]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    if (liked) {
      await (supabase.from("post_likes" as any) as any)
        .delete()
        .eq("post_id", postId)
        .eq("liker_fingerprint", fp);
      setLiked(false);
      setCount((c) => Math.max(0, c - 1));
    } else {
      const { error } = await (supabase.from("post_likes" as any) as any)
        .insert({ post_id: postId, liker_fingerprint: fp });
      if (!error) {
        setLiked(true);
        setCount((c) => c + 1);
      }
    }
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={liked}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-accent transition text-sm font-medium",
        liked && "text-primary border-primary/30 bg-primary/5",
        className
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} />
      <span>{count}</span>
    </button>
  );
}

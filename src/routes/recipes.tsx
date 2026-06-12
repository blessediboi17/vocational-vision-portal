import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "./blog";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/recipes")({
  head: () => ({
    meta: [
      { title: "Recipes — Redeem Vocational Training Center" },
      { name: "description", content: "Recipes from our culinary classes — cakes, pastries, and Liberian favorites." },
      { property: "og:title", content: "Recipes — Redeem" },
      { property: "og:description", content: "Recipes from our culinary instructors." },
    ],
  }),
  component: RecipesIndex,
});

function RecipesIndex() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-recipes"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("posts" as any) as any)
        .select("*")
        .eq("kind", "recipe")
        .eq("published", true)
        .order("published_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-5xl mx-auto px-5 py-5 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back to home
          </Link>
          <h1 className="font-display text-lg font-semibold">Recipes</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-3">From our kitchen</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">Step-by-step recipes from the Redeem culinary program — try them at home.</p>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No recipes yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p: any) => <PostCard key={p.id} post={p} basePath="/recipes" />)}
          </div>
        )}
      </main>
    </div>
  );
}

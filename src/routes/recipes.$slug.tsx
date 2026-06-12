import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { LikeButton } from "@/components/LikeButton";
import { SocialShare } from "@/components/SocialShare";
import { ArrowLeft, Clock, ChefHat } from "lucide-react";

export const Route = createFileRoute("/recipes/$slug")({
  loader: async ({ params }) => {
    const { data, error } = await (supabase.from("posts" as any) as any)
      .select("*")
      .eq("slug", params.slug)
      .eq("published", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw notFound();
    return data as any;
  },
  head: ({ loaderData }) => {
    const p: any = loaderData;
    if (!p) return { meta: [] };
    return {
      meta: [
        { title: `${p.title} — Recipe` },
        { name: "description", content: p.excerpt || p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt || "" },
        ...(p.cover_image_url ? [{ property: "og:image", content: p.cover_image_url }] : []),
      ],
    };
  },
  component: RecipeView,
  errorComponent: () => <div className="p-10 text-center">Couldn't load this recipe.</div>,
  notFoundComponent: () => <div className="p-10 text-center">Recipe not found.</div>,
});

function RecipeView() {
  const r: any = Route.useLoaderData();
  return (
    <article className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Link to="/recipes" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> All recipes
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">{r.title}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
          {r.prep_time_minutes && <span className="inline-flex items-center gap-1.5"><Clock className="size-4" /> {r.prep_time_minutes} min</span>}
          {r.difficulty && <span className="inline-flex items-center gap-1.5"><ChefHat className="size-4" /> {r.difficulty}</span>}
        </div>
        {r.cover_image_url && <img src={r.cover_image_url} alt={r.title} className="rounded-2xl mb-8 w-full" />}
        {r.excerpt && <p className="text-lg text-muted-foreground mb-6">{r.excerpt}</p>}
        <div className="grid md:grid-cols-3 gap-8">
          <aside className="md:col-span-1">
            <h2 className="font-display text-xl font-semibold mb-3">Ingredients</h2>
            <div className="whitespace-pre-wrap text-sm text-muted-foreground">{r.ingredients || "—"}</div>
          </aside>
          <div className="md:col-span-2">
            <h2 className="font-display text-xl font-semibold mb-3">Instructions</h2>
            <div className="whitespace-pre-wrap leading-relaxed">{r.instructions || r.body_markdown || "—"}</div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border">
          <LikeButton postId={r.id} />
          <SocialShare title={r.title} />
        </div>
      </div>
    </article>
  );
}

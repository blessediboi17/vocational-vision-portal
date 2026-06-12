import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LikeButton } from "@/components/LikeButton";
import { SocialShare } from "@/components/SocialShare";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog/$slug")({
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
        { title: `${p.title} — Redeem Blog` },
        { name: "description", content: p.excerpt || p.title },
        { property: "og:title", content: p.title },
        { property: "og:description", content: p.excerpt || "" },
        ...(p.cover_image_url ? [{ property: "og:image", content: p.cover_image_url }] : []),
      ],
    };
  },
  component: BlogPost,
  errorComponent: () => <div className="p-10 text-center">Couldn't load this post.</div>,
  notFoundComponent: () => <div className="p-10 text-center">Post not found.</div>,
});

function BlogPost() {
  const post: any = Route.useLoaderData();
  return (
    <article className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-5 py-8">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4" /> All posts
        </Link>
        <h1 className="font-display text-4xl md:text-5xl font-semibold mb-3">{post.title}</h1>
        {post.published_at && (
          <div className="text-sm text-muted-foreground mb-6">{new Date(post.published_at).toLocaleDateString()}</div>
        )}
        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="rounded-2xl mb-8 w-full" />
        )}
        {post.excerpt && <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>}
        {post.body_markdown && (
          <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-base leading-relaxed">{post.body_markdown}</div>
        )}
        <div className="flex items-center gap-3 mt-10 pt-6 border-t border-border">
          <LikeButton postId={post.id} />
          <SocialShare title={post.title} />
        </div>
      </div>
    </article>
  );
}

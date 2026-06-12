import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LikeButton } from "@/components/LikeButton";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Redeem Vocational Training Center" },
      { name: "description", content: "Stories, tips, and updates from Redeem Vocational Training Center in Liberia." },
      { property: "og:title", content: "Blog — Redeem Vocational Training Center" },
      { property: "og:description", content: "Stories, tips, and updates from our culinary and vocational programs." },
    ],
  }),
  component: BlogIndex,
});

function BlogIndex() {
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["public-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase.from("posts" as any) as any)
        .select("*")
        .eq("kind", "post")
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
          <h1 className="font-display text-lg font-semibold">Blog</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-5 py-12">
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-3">Stories & updates</h2>
        <p className="text-muted-foreground mb-10 max-w-2xl">News from our classes, student wins, and behind-the-scenes from Redeem.</p>
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No posts yet — check back soon.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p: any) => (
              <PostCard key={p.id} post={p} basePath="/blog" />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export function PostCard({ post, basePath }: { post: any; basePath: string }) {
  return (
    <article className="rounded-2xl overflow-hidden border border-border bg-card hover:shadow-[var(--shadow-soft)] transition group">
      <Link to={`${basePath}/$slug` as any} params={{ slug: post.slug } as any} className="block">
        <div className="aspect-[16/10] bg-muted overflow-hidden">
          {post.cover_image_url ? (
            <img src={post.cover_image_url} alt={post.title} className="size-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
          ) : (
            <div className="size-full bg-[image:var(--gradient-leaf)]" />
          )}
        </div>
        <div className="p-5">
          <h3 className="font-display text-xl font-semibold mb-2 line-clamp-2">{post.title}</h3>
          {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{post.excerpt}</p>}
          {post.published_at && (
            <div className="text-xs text-muted-foreground">{new Date(post.published_at).toLocaleDateString()}</div>
          )}
        </div>
      </Link>
      <div className="px-5 pb-5 flex justify-end">
        <LikeButton postId={post.id} />
      </div>
    </article>
  );
}

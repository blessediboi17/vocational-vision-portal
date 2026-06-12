import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Edit3, Eye, EyeOff, X, Upload } from "lucide-react";
import { slugify } from "@/lib/posts";

export function PostsManager({ kind }: { kind: "post" | "recipe" }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-posts", kind],
    queryFn: async () => {
      const { data, error } = await (supabase.from("posts" as any) as any)
        .select("*")
        .eq("kind", kind)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    const { error } = await (supabase.from("posts" as any) as any).delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-posts", kind] });
  }

  async function togglePublish(p: any) {
    const next = !p.published;
    const { error } = await (supabase.from("posts" as any) as any)
      .update({ published: next, published_at: next ? new Date().toISOString() : null })
      .eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["admin-posts", kind] });
  }

  const label = kind === "post" ? "Post" : "Recipe";

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{label}s</h2>
          <p className="text-sm text-muted-foreground">Manage your {kind === "post" ? "blog posts" : "recipes"}.</p>
        </div>
        <Button onClick={() => { setEditing(null); setCreating(true); }}>
          <Plus className="size-4" /> New {label.toLowerCase()}
        </Button>
      </div>

      {(creating || editing) && (
        <PostEditor
          kind={kind}
          initial={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); qc.invalidateQueries({ queryKey: ["admin-posts", kind] }); }}
        />
      )}

      {isLoading ? <Loader2 className="size-6 animate-spin" /> : items.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground">No {label.toLowerCase()}s yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((p: any) => (
            <div key={p.id} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-4">
              <div className="size-16 rounded-lg bg-muted overflow-hidden shrink-0">
                {p.cover_image_url && <img src={p.cover_image_url} alt="" className="size-full object-cover" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{p.title}</div>
                <div className="text-xs text-muted-foreground truncate">/{kind === "post" ? "blog" : "recipes"}/{p.slug}</div>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" onClick={() => togglePublish(p)}>
                  {p.published ? <><Eye className="size-4" /> Published</> : <><EyeOff className="size-4" /> Draft</>}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setCreating(false); setEditing(p); }}><Edit3 className="size-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remove(p.id)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostEditor({ kind, initial, onClose, onSaved }: { kind: "post" | "recipe"; initial: any | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [body, setBody] = useState(initial?.body_markdown || "");
  const [cover, setCover] = useState(initial?.cover_image_url || "");
  const [ingredients, setIngredients] = useState(initial?.ingredients || "");
  const [instructions, setInstructions] = useState(initial?.instructions || "");
  const [prep, setPrep] = useState<string>(initial?.prep_time_minutes?.toString() || "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty || "");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!initial && title && !slug) setSlug(slugify(title));
  }, [title]);

  async function uploadCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { data: u } = await supabase.auth.getUser();
    const ext = file.name.split(".").pop();
    const path = `${u.user!.id}/posts/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("gallery").upload(path, file);
    if (upErr) { toast.error(upErr.message); setUploading(false); return; }
    const { data: signed } = await supabase.storage.from("gallery").createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (signed?.signedUrl) setCover(signed.signedUrl);
    setUploading(false);
    e.target.value = "";
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const payload: any = {
      kind,
      title: title.trim(),
      slug: slug.trim() || slugify(title),
      excerpt: excerpt.trim() || null,
      body_markdown: body || null,
      cover_image_url: cover || null,
      ingredients: kind === "recipe" ? (ingredients || null) : null,
      instructions: kind === "recipe" ? (instructions || null) : null,
      prep_time_minutes: kind === "recipe" && prep ? parseInt(prep, 10) : null,
      difficulty: kind === "recipe" ? (difficulty || null) : null,
      author_id: u.user!.id,
    };
    const op = initial
      ? (supabase.from("posts" as any) as any).update(payload).eq("id", initial.id)
      : (supabase.from("posts" as any) as any).insert(payload);
    const { error } = await op;
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    onSaved();
  }

  return (
    <div className="mb-8 p-6 rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold">{initial ? "Edit" : "New"} {kind}</h3>
        <Button size="sm" variant="ghost" onClick={onClose}><X className="size-4" /></Button>
      </div>
      <form onSubmit={save} className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={150} />
          </div>
          <div>
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} required />
          </div>
        </div>
        <div>
          <Label>Excerpt</Label>
          <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} maxLength={300} />
        </div>
        <div>
          <Label>Cover image</Label>
          <div className="flex items-center gap-3">
            {cover && <img src={cover} alt="" className="size-16 rounded-lg object-cover border border-border" />}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background hover:bg-accent cursor-pointer text-sm">
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload
              <input type="file" accept="image/*" className="sr-only" onChange={uploadCover} disabled={uploading} />
            </label>
            {cover && <Button type="button" size="sm" variant="ghost" onClick={() => setCover("")}>Remove</Button>}
          </div>
        </div>
        {kind === "recipe" ? (
          <>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <Label>Prep time (min)</Label>
                <Input type="number" min="0" value={prep} onChange={(e) => setPrep(e.target.value)} />
              </div>
              <div>
                <Label>Difficulty</Label>
                <Input value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="Easy / Medium / Hard" />
              </div>
            </div>
            <div>
              <Label>Ingredients</Label>
              <Textarea value={ingredients} onChange={(e) => setIngredients(e.target.value)} rows={5} placeholder="One per line" />
            </div>
            <div>
              <Label>Instructions</Label>
              <Textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={8} />
            </div>
          </>
        ) : (
          <div>
            <Label>Body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12} />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving && <Loader2 className="size-4 animate-spin" />} Save</Button>
        </div>
      </form>
    </div>
  );
}

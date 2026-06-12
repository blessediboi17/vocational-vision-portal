import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, LogOut, Upload, Trash2, Image as ImageIcon, MessageSquare, Settings, Loader2, ShieldAlert, Mail, Phone, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin · Redeem" }, { name: "robots", content: "noindex" }] }),
  component: AdminDashboard,
});

type Tab = "gallery" | "submissions" | "settings";

function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("gallery");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      setEmail(u.user?.email ?? "");
      if (!u.user) return;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id);
      setIsAdmin(!!roles?.some((r: any) => r.role === "admin"));
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  if (isAdmin === null) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="size-6 animate-spin" /></div>;
  }
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <ShieldAlert className="size-12 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-semibold mb-2">Not authorized</h1>
          <p className="text-muted-foreground mb-6">Your account ({email}) doesn't have admin access.</p>
          <Button onClick={signOut} variant="outline"><LogOut className="size-4" /> Sign out</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="size-9 rounded-full border border-border flex items-center justify-center hover:bg-accent" aria-label="Home"><ArrowLeft className="size-4" /></Link>
            <div>
              <div className="font-display font-semibold">Admin</div>
              <div className="text-xs text-muted-foreground">{email}</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
        </div>
        <nav className="max-w-6xl mx-auto px-5 flex gap-1 border-t border-border">
          {([
            { k: "gallery", l: "Gallery", I: ImageIcon },
            { k: "submissions", l: "Submissions", I: MessageSquare },
            { k: "settings", l: "Settings", I: Settings },
          ] as { k: Tab; l: string; I: any }[]).map(({ k, l, I }) => (
            <button key={k} onClick={() => setTab(k)} className={`px-4 py-3 text-sm font-medium border-b-2 transition flex items-center gap-2 ${tab === k ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              <I className="size-4" /> {l}
            </button>
          ))}
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-8">
        {tab === "gallery" && <GalleryManager />}
        {tab === "submissions" && <SubmissionsManager />}
        {tab === "settings" && <SettingsManager />}
      </main>
    </div>
  );
}

function GalleryManager() {
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const { data: images = [], isLoading } = useQuery({
    queryKey: ["admin-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    const { data: u } = await supabase.auth.getUser();
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${u.user!.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("gallery").upload(path, file, { upsert: false });
      if (upErr) { toast.error(`Upload failed: ${upErr.message}`); continue; }
      const { data: pub } = supabase.storage.from("gallery").getPublicUrl(path);
      const { error: insErr } = await supabase.from("gallery_images").insert({
        image_url: pub.publicUrl,
        title: file.name.replace(/\.[^.]+$/, ""),
        category: "general",
        uploaded_by: u.user!.id,
      });
      if (insErr) toast.error(`Save failed: ${insErr.message}`);
    }
    setUploading(false);
    toast.success("Uploaded");
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
    e.target.value = "";
  }

  async function remove(id: string, url: string) {
    if (!confirm("Delete this image?")) return;
    const pathMatch = url.match(/\/gallery\/(.+)$/);
    if (pathMatch) await supabase.storage.from("gallery").remove([pathMatch[1]]);
    const { error } = await supabase.from("gallery_images").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from("gallery_images").update({ is_active: !current }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-gallery"] });
    qc.invalidateQueries({ queryKey: ["gallery"] });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Gallery</h2>
          <p className="text-sm text-muted-foreground">Upload photos of classes, cakes, and events. Shown on the homepage.</p>
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-sm font-medium">
          {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />} Upload images
          <input type="file" accept="image/*" multiple className="sr-only" onChange={onUpload} disabled={uploading} />
        </label>
      </div>
      {isLoading ? <Loader2 className="size-6 animate-spin" /> : images.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <ImageIcon className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No images yet. Upload your first photos above.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img: any) => (
            <AdminGalleryItem
              key={img.id}
              img={img}
              onRemove={() => remove(img.id, img.image_url)}
              onToggle={() => toggleActive(img.id, img.is_active)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminGalleryItem({ img, onRemove, onToggle }: { img: any; onRemove: () => void; onToggle: () => void }) {
  const [url, setUrl] = useState<string>("");
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const m = img.image_url.match(/\/gallery\/(.+)$/);
      if (!m) { setUrl(img.image_url); return; }
      const { data } = await supabase.storage.from("gallery").createSignedUrl(decodeURIComponent(m[1]), 3600);
      if (!cancelled) setUrl(data?.signedUrl || img.image_url);
    })();
    return () => { cancelled = true; };
  }, [img.image_url]);
  return (
    <div className="rounded-2xl overflow-hidden border border-border bg-card">
      <div className="relative aspect-square bg-muted">
        {url ? <img src={url} alt={img.title || ""} className="size-full object-cover" /> : <div className="size-full flex items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}
        {!img.is_active && <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-xs uppercase tracking-widest">Hidden</div>}
      </div>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="text-xs truncate">{img.title || "Untitled"}</div>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={onToggle}>{img.is_active ? "Hide" : "Show"}</Button>
          <Button size="sm" variant="ghost" onClick={onRemove}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      </div>
    </div>
  );
}

function SubmissionsManager() {
  const qc = useQueryClient();
  const { data: subs = [], isLoading } = useQuery({
    queryKey: ["admin-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_submissions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  async function remove(id: string) {
    if (!confirm("Delete this submission?")) return;
    await supabase.from("contact_submissions").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-submissions"] });
  }
  async function setStatus(id: string, status: string) {
    await supabase.from("contact_submissions").update({ status }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-submissions"] });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-2">Contact submissions</h2>
      <p className="text-sm text-muted-foreground mb-6">Leads & registration requests from the website contact form.</p>
      {isLoading ? <Loader2 className="size-6 animate-spin" /> : subs.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
          <MessageSquare className="size-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No submissions yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((s: any) => (
            <div key={s.id} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <div className="font-semibold">{s.full_name} {s.interest && <span className="text-xs font-normal text-muted-foreground ml-2">· {s.interest}</span>}</div>
                  <div className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select value={s.status} onChange={(e) => setStatus(s.id, e.target.value)} className="text-xs rounded-md border border-input bg-background px-2 py-1">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                  <Button size="sm" variant="ghost" onClick={() => remove(s.id)}><Trash2 className="size-4 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-sm mb-3 whitespace-pre-wrap">{s.message}</p>
              <div className="flex flex-wrap gap-3 text-xs">
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Mail className="size-3.5" /> {s.email}</a>
                {s.phone && <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline"><Phone className="size-3.5" /> {s.phone}</a>}
                <a href={`https://wa.me/${(s.phone || "").replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="size-3.5" /> WhatsApp</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsManager() {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const { data: s } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const { error } = await supabase.from("site_settings").update({
      admin_email: String(fd.get("admin_email") || ""),
      business_phone: String(fd.get("business_phone") || ""),
      business_address: String(fd.get("business_address") || ""),
    }).eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    qc.invalidateQueries({ queryKey: ["site-settings"] });
  }

  if (!s) return <Loader2 className="size-6 animate-spin" />;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-2xl font-semibold mb-2">Site settings</h2>
      <p className="text-sm text-muted-foreground mb-6">Update contact info and the admin notification email.</p>
      <form onSubmit={onSave} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
        <div>
          <Label htmlFor="admin_email">Admin notification email</Label>
          <Input id="admin_email" name="admin_email" type="email" defaultValue={s.admin_email || ""} placeholder="admin@example.com" />
          <p className="text-xs text-muted-foreground mt-1">New submissions will be linked to this email once email sending is configured.</p>
        </div>
        <div>
          <Label htmlFor="business_phone">Business phone</Label>
          <Input id="business_phone" name="business_phone" defaultValue={s.business_phone || ""} />
        </div>
        <div>
          <Label htmlFor="business_address">Business address</Label>
          <Textarea id="business_address" name="business_address" defaultValue={s.business_address || ""} rows={2} />
        </div>
        <Button type="submit" disabled={saving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {saving && <Loader2 className="size-4 animate-spin" />} Save
        </Button>
      </form>
    </div>
  );
}

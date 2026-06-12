import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Lock, Unlock, ShieldCheck, Users } from "lucide-react";

export function AdminsManager() {
  const qc = useQueryClient();
  const [me, setMe] = useState<string>("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id || "")); }, []);

  const { data: settings } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: async () => {
      const { data } = await (supabase.from("admin_settings" as any) as any).select("*").eq("id", 1).maybeSingle();
      return data;
    },
  });

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admin-list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("admin_list_admins");
      if (error) throw error;
      return data || [];
    },
  });

  async function setBlocked(userId: string, blocked: boolean) {
    if (!confirm(blocked ? "Lock this admin's access?" : "Unlock this admin?")) return;
    const { error } = await (supabase as any).rpc("admin_set_blocked", { _target_user_id: userId, _blocked: blocked });
    if (error) return toast.error(error.message);
    toast.success(blocked ? "Admin locked" : "Admin unlocked");
    qc.invalidateQueries({ queryKey: ["admin-list"] });
  }

  async function setMax(n: number) {
    const { error } = await (supabase as any).rpc("admin_set_max", { _n: n });
    if (error) return toast.error(error.message);
    toast.success(`Max admins set to ${n}`);
    qc.invalidateQueries({ queryKey: ["admin-settings"] });
  }

  return (
    <div>
      <h2 className="font-display text-2xl font-semibold mb-2">Admin access</h2>
      <p className="text-sm text-muted-foreground mb-6">Control who can administer this site. Locking an admin instantly removes their access.</p>

      <div className="p-5 rounded-2xl border border-border bg-card mb-6">
        <div className="flex items-center gap-2 mb-3"><Users className="size-4" /> <span className="font-medium">Maximum admins</span></div>
        <p className="text-xs text-muted-foreground mb-3">After this many active admins exist, new sign-ups become regular users.</p>
        <div className="flex gap-2">
          {[1, 2].map((n) => (
            <Button key={n} size="sm" variant={settings?.max_admins === n ? "default" : "outline"} onClick={() => setMax(n)}>{n} admin{n > 1 ? "s" : ""}</Button>
          ))}
        </div>
      </div>

      {isLoading ? <Loader2 className="size-6 animate-spin" /> : (
        <div className="space-y-3">
          {admins.map((a: any) => (
            <div key={a.user_id} className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3 flex-wrap">
              <div className="size-10 rounded-full bg-[image:var(--gradient-leaf)] flex items-center justify-center text-leaf-foreground"><ShieldCheck className="size-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{a.full_name || a.email}</div>
                <div className="text-xs text-muted-foreground truncate">{a.email} {a.user_id === me && <span className="ml-2 text-primary">(you)</span>}</div>
                {a.is_blocked && <div className="text-xs text-destructive mt-1">Locked {a.blocked_at ? `· ${new Date(a.blocked_at).toLocaleString()}` : ""}</div>}
              </div>
              {a.user_id !== me && (
                a.is_blocked ? (
                  <Button size="sm" variant="outline" onClick={() => setBlocked(a.user_id, false)}><Unlock className="size-4" /> Unlock</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setBlocked(a.user_id, true)}><Lock className="size-4" /> Lock</Button>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

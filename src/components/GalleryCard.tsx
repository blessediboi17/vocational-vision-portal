import { useEffect, useRef, useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  image: { id: string; image_url: string; title?: string | null; caption?: string | null };
}

function extractPath(url: string): string | null {
  const m = url.match(/\/gallery\/(.+)$/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function GalleryCard({ image }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  // Resolve signed URL (bucket is private)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const path = extractPath(image.image_url);
      if (!path) { setSrc(image.image_url); return; }
      const { data, error } = await supabase.storage.from("gallery").createSignedUrl(path, 3600);
      if (!cancelled) setSrc(error ? image.image_url : data.signedUrl);
    })();
    return () => { cancelled = true; };
  }, [image.image_url]);

  // 3D tilt on mouse move
  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -16;
    const ry = (px - 0.5) * 18;
    el.style.setProperty("--rx", `${rx}deg`);
    el.style.setProperty("--ry", `${ry}deg`);
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function onLeave() {
    const el = cardRef.current;
    if (!el) return;
    el.style.setProperty("--rx", `0deg`);
    el.style.setProperty("--ry", `0deg`);
  }

  async function download() {
    if (!src) return;
    setDownloading(true);
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      const bmp = await createImageBitmap(blob);
      const canvas = document.createElement("canvas");
      canvas.width = bmp.width;
      canvas.height = bmp.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);

      // Watermark bar
      const text = "Redeemed Vocational Training Center";
      const fontSize = Math.max(18, Math.round(bmp.width * 0.028));
      const padY = Math.round(fontSize * 1.6);
      const grad = ctx.createLinearGradient(0, bmp.height - padY * 2, 0, bmp.height);
      grad.addColorStop(0, "rgba(0,0,0,0)");
      grad.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, bmp.height - padY * 2, bmp.width, padY * 2);

      ctx.font = `600 ${fontSize}px Inter, system-ui, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "rgba(255,255,255,0.55)";
      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 8;
      ctx.fillText(text, bmp.width / 2, bmp.height - padY / 1.2);

      const out = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!out) throw new Error("Encode failed");
      const a = document.createElement("a");
      const safe = (image.title || "redeem-gallery").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
      a.href = URL.createObjectURL(out);
      a.download = `${safe}.jpg`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Downloaded");
    } catch (e: any) {
      toast.error(e?.message || "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="[perspective:1200px]">
      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card shadow-[var(--shadow-soft)] transition-transform duration-300 ease-out will-change-transform hover:shadow-[var(--shadow-elegant)]"
        style={{
          transform: "rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          transformStyle: "preserve-3d",
        }}
      >
        {src ? (
          <img
            src={src}
            alt={image.title || image.caption || "Gallery image"}
            loading="lazy"
            className="size-full object-cover transition duration-700 group-hover:scale-110"
            style={{ transform: "translateZ(40px)" }}
          />
        ) : (
          <div className="size-full flex items-center justify-center bg-muted">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Glare */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(circle at var(--mx,50%) var(--my,50%), rgba(255,255,255,0.35), transparent 45%)",
            mixBlendMode: "overlay",
          }}
        />

        {/* Download button */}
        <button
          onClick={download}
          disabled={downloading || !src}
          aria-label="Download image"
          className="absolute top-3 right-3 size-10 rounded-full bg-background/85 backdrop-blur border border-border flex items-center justify-center text-foreground opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-primary hover:text-primary-foreground hover:scale-110 disabled:opacity-60"
          style={{ transform: "translateZ(70px)" }}
        >
          {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
        </button>

        {(image.title || image.caption) && (
          <div
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white"
            style={{ transform: "translateZ(50px)" }}
          >
            {image.title && <div className="font-display font-semibold text-sm">{image.title}</div>}
            {image.caption && <div className="text-xs text-white/80">{image.caption}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

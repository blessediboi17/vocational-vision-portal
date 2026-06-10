import { Facebook, Twitter, Linkedin, MessageCircle, Link2, Check } from "lucide-react";
import { useState } from "react";

export function SocialShare({ url, title }: { url?: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
  const shareTitle = title || "Redeem Vocational Training Center";
  const enc = encodeURIComponent;

  const links = [
    { Icon: Facebook, label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` },
    { Icon: Twitter, label: "X / Twitter", href: `https://twitter.com/intent/tweet?url=${enc(shareUrl)}&text=${enc(shareTitle)}` },
    { Icon: MessageCircle, label: "WhatsApp", href: `https://wa.me/?text=${enc(`${shareTitle} ${shareUrl}`)}` },
    { Icon: Linkedin, label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
  ];

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs uppercase tracking-widest text-muted-foreground mr-1">Share</span>
      {links.map(({ Icon, label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${label}`}
          className="size-9 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition"
        >
          <Icon className="size-4" />
        </a>
      ))}
      <button
        onClick={onCopy}
        aria-label="Copy link"
        className="size-9 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center transition"
      >
        {copied ? <Check className="size-4 text-leaf" /> : <Link2 className="size-4" />}
      </button>
    </div>
  );
}

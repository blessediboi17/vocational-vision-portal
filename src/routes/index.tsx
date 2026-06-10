import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Phone, MapPin, Star, Clock, ChevronRight, Sparkles, Menu, X, ShieldCheck } from "lucide-react";
import * as Icons from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ParallaxBackground } from "@/components/ParallaxBackground";
import { SocialShare } from "@/components/SocialShare";
import { ContactForm } from "@/components/ContactForm";
import { supabase } from "@/integrations/supabase/client";
import heroImg from "@/assets/hero-catering.jpg";
import equipmentImg from "@/assets/equipment.jpg";
import trainingImg from "@/assets/training.jpg";
import eventImg from "@/assets/event.jpg";

const PHONE = "+231 77 560 5016";
const ADDRESS = "Kpelle Town Junction, Liberia";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Redeem Vocational Training Center — Culinary, Events & Catering in Liberia" },
      { name: "description", content: "Culinary classes, cake design, wedding cakes, event planning, interior decor, and catering equipment rental — Kpelle Town Junction, Liberia." },
    ],
    links: [{ rel: "canonical", href: "https://vocational-vision-portal.lovable.app/" }],
  }),
  component: Home,
});

const iconMap: Record<string, any> = Icons;
function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const key = name.split("-").map((p, i) => i === 0 ? p[0].toUpperCase() + p.slice(1) : p[0].toUpperCase() + p.slice(1)).join("");
  const C = iconMap[key] || Icons.Sparkles;
  return <C className={className} />;
}

function Home() {
  return (
    <div className="relative min-h-screen text-foreground">
      <ParallaxBackground />
      <div className="relative z-10">
        <Header />
        <Hero />
        <Stats />
        <Services />
        <About />
        <Gallery />
        <Equipment />
        <Training />
        <Testimonials />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#services", label: "Services" },
    { href: "#about", label: "About" },
    { href: "#gallery", label: "Gallery" },
    { href: "#training", label: "Training" },
    { href: "#contact", label: "Contact" },
  ];
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-[image:var(--gradient-leaf)] flex items-center justify-center text-leaf-foreground font-display font-bold shadow-[var(--shadow-soft)]">R</div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm">Redeem</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vocational Center</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-primary transition">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Link to="/auth" className="hidden md:inline-flex size-10 items-center justify-center rounded-full border border-border bg-card hover:bg-accent" aria-label="Admin">
            <ShieldCheck className="size-4" />
          </Link>
          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="hidden sm:block">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
              <Phone className="size-3.5" /> Call
            </Button>
          </a>
          <button className="md:hidden size-10 rounded-full border border-border flex items-center justify-center" onClick={() => setOpen(!open)} aria-label="Menu">
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur">
          <nav className="px-5 py-4 flex flex-col gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="py-2 text-sm font-medium">{l.label}</a>
            ))}
            <div className="flex items-center gap-3 pt-2">
              <ThemeToggle />
              <Link to="/auth" className="text-sm font-medium">Admin</Link>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="ml-auto">
                <Button size="sm" className="bg-primary text-primary-foreground rounded-full"><Phone className="size-3.5" /> Call</Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <img src={heroImg} alt="Elegant catering setup" className="absolute inset-0 size-full object-cover opacity-60 dark:opacity-30" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/80" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-32 w-full">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card/80 border border-leaf/30 backdrop-blur text-xs uppercase tracking-widest mb-6">
            <Sparkles className="size-3.5 text-leaf" /> Liberia · Kpelle Town Junction
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] mb-6">
            Where culinary craft meets <span className="italic text-leaf">unforgettable events</span>.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed">
            Hands-on culinary & cake classes, wedding & event planning, interior decoration, and premium catering equipment rental — trusted across Liberia.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href="#contact"><Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">Get a quote <ChevronRight className="size-4" /></Button></a>
            <a href="#services"><Button size="lg" variant="outline" className="rounded-full px-6 border-border bg-card/60 backdrop-blur">Explore services</Button></a>
          </div>
          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="flex">{[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-leaf text-leaf" />)}</div>
              <span className="text-sm text-muted-foreground">5.0 · Trusted by hosts across Liberia</span>
            </div>
            <SocialShare title="Redeem Vocational Training Center" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "10+", l: "Years of service" },
    { v: "500+", l: "Events catered" },
    { v: "200+", l: "Trainees graduated" },
    { v: "5.0", l: "Customer rating" },
  ];
  return (
    <section className="border-y border-border/60 bg-card/60 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.l} className="text-center md:text-left">
            <div className="font-display text-4xl md:text-5xl font-semibold text-primary">{s.v}</div>
            <div className="text-sm text-muted-foreground mt-1">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Services() {
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("is_active", true).order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  return (
    <section id="services" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">What we do</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Culinary, cake design, events, and catering — all under one roof.
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s: any) => (
            <div key={s.id} className="group p-7 rounded-2xl border border-border bg-card/80 backdrop-blur hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-[image:var(--gradient-leaf)] flex items-center justify-center mb-5 text-leaf-foreground">
                <ServiceIcon name={s.icon} className="size-5" />
              </div>
              <div className="text-[10px] uppercase tracking-widest text-leaf/80 mb-1">{s.category}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-card/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="relative">
          <img src={eventImg} alt="Event setup" className="rounded-2xl shadow-[var(--shadow-elegant)] w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          <div className="absolute -bottom-6 -right-6 hidden md:flex flex-col bg-card p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
            <div className="flex gap-0.5 mb-2">{[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-leaf text-leaf" />)}</div>
            <div className="font-display text-3xl font-semibold text-primary">5.0</div>
            <div className="text-xs text-muted-foreground">Google rated</div>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">About us</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Tradition, craft, and Liberian <span className="italic">excellence</span>.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Redeem Vocational Training Center is a dual-purpose institution proudly based in Kpelle Town Junction. We train the next generation of culinary, baking, and hospitality professionals while equipping and styling celebrations across the country.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            From your wedding cake to the chairs your guests sit on, from cooking class to corporate banquet — we bring discipline, beauty, and service.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {["Locally rooted", "Internationally inspired", "Certified trainers", "Full-service setup"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm"><div className="size-1.5 rounded-full bg-leaf" /> {t}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Gallery() {
  const { data: images = [] } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data, error } = await supabase.from("gallery_images").select("*").eq("is_active", true).order("sort_order").limit(9);
      if (error) throw error;
      return data;
    },
  });

  if (!images.length) return null;

  return (
    <section id="gallery" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-12">
          <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">Our work</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">From our classes & events.</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((img: any) => (
            <figure key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border bg-card">
              <img src={img.image_url} alt={img.title || img.caption || "Gallery image"} loading="lazy" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              {(img.title || img.caption) && (
                <figcaption className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                  {img.title && <div className="font-display font-semibold text-sm">{img.title}</div>}
                  {img.caption && <div className="text-xs text-white/80">{img.caption}</div>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Equipment() {
  const items = ["Chafing dishes & serving trays", "Porcelain plate sets", "Crystal glassware", "Linens & table skirting", "Chiavari & banquet chairs", "Round & rectangular tables", "Cutlery & gold chargers", "Beverage dispensers"];
  return (
    <section id="equipment" className="py-24 md:py-32 bg-card/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="order-2 md:order-1">
          <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">Inventory</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">A full kit for every occasion.</h2>
          <p className="text-muted-foreground leading-relaxed mb-8">From intimate gatherings of 20 to grand weddings of 500+, our inventory scales. Delivery, setup, and pickup included.</p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border/60"><ChevronRight className="size-4 text-leaf" /> {i}</li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <img src={equipmentImg} alt="Catering equipment" className="rounded-2xl shadow-[var(--shadow-elegant)] w-full aspect-[4/3] object-cover" loading="lazy" width={1280} height={960} />
        </div>
      </div>
    </section>
  );
}

function Training() {
  return (
    <section id="training" className="py-24 md:py-32 bg-[image:var(--gradient-hero)] text-primary-foreground relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center relative z-10">
        <img src={trainingImg} alt="Training class" className="rounded-2xl w-full aspect-[4/3] object-cover shadow-2xl" loading="lazy" width={1280} height={960} />
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">Vocational programs</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6 text-white">Building Liberia's next generation of hospitality leaders.</h2>
          <p className="text-white/75 leading-relaxed mb-8">Certified courses combine real-world experience with professional service training. Open enrollment for culinary, baking, cake design, and hospitality.</p>
          <div className="space-y-4">
            {[
              { t: "Culinary Fundamentals", d: "12 weeks · kitchen safety, plating, service" },
              { t: "Baking & Pastry", d: "10 weeks · breads, pastries, desserts" },
              { t: "Cake Design & Decoration", d: "8 weeks · buttercream, fondant, sculpting" },
              { t: "Event Service Pro", d: "8 weeks · banquet & wedding service" },
            ].map((c) => (
              <div key={c.t} className="flex items-start justify-between gap-4 p-5 rounded-xl border border-white/15 bg-white/5 backdrop-blur">
                <div>
                  <div className="font-display text-lg font-semibold text-white">{c.t}</div>
                  <div className="text-sm text-white/65 mt-1">{c.d}</div>
                </div>
                <ChevronRight className="size-5 text-leaf shrink-0 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-3xl mx-auto px-5 md:px-8 text-center">
        <div className="flex justify-center gap-1 mb-6">{[...Array(5)].map((_, i) => <Star key={i} className="size-6 fill-leaf text-leaf" />)}</div>
        <blockquote className="font-display text-2xl md:text-4xl font-medium leading-snug italic">
          "Beautifully set, perfectly delivered, and on time. Redeem made our wedding reception feel world-class."
        </blockquote>
        <div className="mt-8 text-sm text-muted-foreground">Verified customer · Google review · 5.0 / 5</div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-card/40 backdrop-blur">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-leaf mb-3">Get in touch</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">Let's plan your next moment.</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">Call, message, or fill the form — we'll get back within 24 hours.</p>
            <div className="space-y-4 mb-8">
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-[var(--shadow-soft)] transition">
                <div className="size-11 rounded-full bg-leaf/15 flex items-center justify-center text-leaf"><Phone className="size-5" /></div>
                <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div><div className="font-medium">{PHONE}</div></div>
              </a>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="size-11 rounded-full bg-leaf/15 flex items-center justify-center text-leaf"><MapPin className="size-5" /></div>
                <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Location</div><div className="font-medium">{ADDRESS}</div></div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="size-11 rounded-full bg-leaf/15 flex items-center justify-center text-leaf"><Clock className="size-5" /></div>
                <div><div className="text-xs uppercase tracking-wider text-muted-foreground">Hours</div><div className="font-medium">Mon – Sat · 8 AM – 6 PM</div></div>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-border h-64">
              <iframe title="Map" src="https://www.google.com/maps?q=Kpelle+Town+Junction,+Liberia&output=embed" className="w-full h-full border-0" loading="lazy" />
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-[image:var(--gradient-hero)] text-primary-foreground py-12 relative z-10">
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-[image:var(--gradient-leaf)] flex items-center justify-center text-leaf-foreground font-display font-bold">R</div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-white">Redeem Vocational Training Center</div>
            <div className="text-xs text-white/60">Culinary · Events · Catering · Liberia</div>
          </div>
        </div>
        <SocialShare />
        <div className="text-xs text-white/60 text-center md:text-right">
          © {new Date().getFullYear()} Redeem Vocational Training Center<div className="mt-1">{ADDRESS} · {PHONE}</div>
        </div>
      </div>
    </footer>
  );
}

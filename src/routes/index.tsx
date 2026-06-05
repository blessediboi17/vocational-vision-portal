import { createFileRoute } from "@tanstack/react-router";
import { Phone, MapPin, Star, Mail, Clock, Award, Utensils, GraduationCap, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-catering.jpg";
import equipmentImg from "@/assets/equipment.jpg";
import trainingImg from "@/assets/training.jpg";
import eventImg from "@/assets/event.jpg";

const PHONE = "+231 77 560 5016";
const ADDRESS = "Kpelle Town Junction, Liberia";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Redeem Vocational Training Center — Catering Equipment Rental in Liberia" },
      { name: "description", content: "Premium catering equipment rental and vocational training in Kpelle Town Junction, Liberia. Weddings, conferences, events. Call +231 77 560 5016." },
      { property: "og:title", content: "Redeem Vocational Training Center" },
      { property: "og:description", content: "Catering equipment rental & vocational training in Liberia. Rated 5.0 stars." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@500;600;700&display=swap" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Stats />
      <Services />
      <About />
      <Equipment />
      <Training />
      <Testimonials />
      <Contact />
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2">
          <div className="size-9 rounded-full bg-gradient-to-br from-[oklch(0.78_0.13_80)] to-[oklch(0.55_0.12_50)] flex items-center justify-center text-gold-foreground font-display font-bold">R</div>
          <div className="leading-tight">
            <div className="font-display font-semibold text-sm">Redeem</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Vocational Center</div>
          </div>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#services" className="hover:text-gold transition">Services</a>
          <a href="#about" className="hover:text-gold transition">About</a>
          <a href="#equipment" className="hover:text-gold transition">Equipment</a>
          <a href="#training" className="hover:text-gold transition">Training</a>
          <a href="#contact" className="hover:text-gold transition">Contact</a>
        </nav>
        <a href={`tel:${PHONE.replace(/\s/g, "")}`}>
          <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
            <Phone className="size-3.5" /> Call
          </Button>
        </a>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] flex items-center pt-16 overflow-hidden">
      <img src={heroImg} alt="Elegant catering setup" className="absolute inset-0 size-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
      <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-20 md:py-32 w-full">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm text-xs uppercase tracking-widest mb-6">
            <Sparkles className="size-3.5 text-gold" /> Liberia · Kpelle Town Junction
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-semibold leading-[1.05] mb-6">
            Catering Equipment, <span className="italic text-gold">Crafted</span> for Unforgettable Events.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-xl mb-8 leading-relaxed">
            Premium rentals and hands-on vocational training from the team trusted across Liberia. Weddings, banquets, conferences — we set the table.
          </p>
          <div className="flex flex-wrap gap-3">
            <a href={`tel:${PHONE.replace(/\s/g, "")}`}>
              <Button size="lg" className="bg-gold hover:bg-gold/90 text-gold-foreground rounded-full px-6">
                <Phone className="size-4" /> Book a Consultation
              </Button>
            </a>
            <a href="#services">
              <Button size="lg" variant="outline" className="rounded-full px-6 bg-transparent border-white/40 text-white hover:bg-white hover:text-foreground">
                Explore Services <ChevronRight className="size-4" />
              </Button>
            </a>
          </div>
          <div className="mt-10 flex items-center gap-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="size-4 fill-gold text-gold" />
              ))}
            </div>
            <div className="text-sm text-white/80">5.0 rating · Trusted by event hosts in Liberia</div>
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
    <section className="border-y border-border bg-secondary/40">
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
  const services = [
    { icon: Utensils, title: "Full Catering Rental", desc: "Chafing dishes, plateware, glassware, linens, and serving tools for any size event." },
    { icon: Sparkles, title: "Event Styling", desc: "Chiavari chairs, table draping, centerpieces, and tablescape design for weddings & banquets." },
    { icon: GraduationCap, title: "Vocational Training", desc: "Hands-on hospitality, catering, and event service courses for the next generation." },
    { icon: Award, title: "Corporate Events", desc: "Conferences, seminars, and corporate galas with professional setup and breakdown." },
  ];
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mb-16">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">What we do</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
            Equipment, expertise, and elegance — all under one roof.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s) => (
            <div key={s.title} className="group p-7 rounded-2xl border border-border bg-card hover:shadow-[var(--shadow-elegant)] transition-all duration-500 hover:-translate-y-1">
              <div className="size-12 rounded-xl bg-gradient-to-br from-[oklch(0.78_0.13_80)] to-[oklch(0.55_0.12_50)] flex items-center justify-center mb-5 text-gold-foreground">
                <s.icon className="size-5" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="py-24 md:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="relative">
          <img src={eventImg} alt="Beautiful event setup" className="rounded-2xl shadow-[var(--shadow-elegant)] w-full aspect-[4/5] object-cover" loading="lazy" width={1280} height={960} />
          <div className="absolute -bottom-6 -right-6 hidden md:flex flex-col bg-card p-6 rounded-2xl shadow-[var(--shadow-soft)] border border-border">
            <div className="flex gap-0.5 mb-2">
              {[...Array(5)].map((_, i) => <Star key={i} className="size-4 fill-gold text-gold" />)}
            </div>
            <div className="font-display text-3xl font-semibold text-primary">5.0</div>
            <div className="text-xs text-muted-foreground">Google rated</div>
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">About us</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Where tradition meets <span className="italic">elegance</span>.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            Redeem Vocational Training Center is a dual-purpose institution proudly based in Kpelle Town Junction, Liberia. We rent premium catering equipment for weddings, conferences, and community celebrations while training the next generation of Liberian hospitality professionals.
          </p>
          <p className="text-muted-foreground leading-relaxed mb-8">
            Every event we equip and every student we train carries our standard: discipline, beauty, and service that honors the moment.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {["Locally rooted", "Internationally inspired", "Certified trainers", "Full-service setup"].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm">
                <div className="size-1.5 rounded-full bg-gold" /> {t}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Equipment() {
  const items = [
    "Chafing dishes & serving trays",
    "Porcelain plate sets",
    "Crystal glassware & flutes",
    "Linens & table skirting",
    "Chiavari & banquet chairs",
    "Round & rectangular tables",
    "Cutlery & gold chargers",
    "Beverage dispensers & urns",
  ];
  return (
    <section id="equipment" className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="order-2 md:order-1">
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Inventory</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            A full kit for every occasion.
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            From intimate gatherings of 20 to grand weddings of 500+, our inventory scales with your celebration. Delivery, setup, and pickup included.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {items.map((i) => (
              <li key={i} className="flex items-center gap-3 text-sm py-2 border-b border-border/60">
                <ChevronRight className="size-4 text-gold" /> {i}
              </li>
            ))}
          </ul>
        </div>
        <div className="order-1 md:order-2">
          <img src={equipmentImg} alt="Premium catering equipment" className="rounded-2xl shadow-[var(--shadow-elegant)] w-full aspect-[4/3] object-cover" loading="lazy" width={1280} height={960} />
        </div>
      </div>
    </section>
  );
}

function Training() {
  return (
    <section id="training" className="py-24 md:py-32 bg-gradient-to-br from-primary to-[oklch(0.22_0.05_30)] text-primary-foreground">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-16 items-center">
        <img src={trainingImg} alt="Vocational training class" className="rounded-2xl w-full aspect-[4/3] object-cover shadow-2xl" loading="lazy" width={1280} height={960} />
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Vocational programs</div>
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
            Building Liberia's next generation of hospitality leaders.
          </h2>
          <p className="text-white/75 leading-relaxed mb-8">
            Our certified courses combine real-world catering experience with professional service training. Open enrollment for catering, event service, and hospitality management.
          </p>
          <div className="space-y-4">
            {[
              { t: "Catering Fundamentals", d: "12-week program · kitchen safety, plating, service" },
              { t: "Event Service Pro", d: "8-week program · banquet protocol, table service" },
              { t: "Hospitality Management", d: "6-month diploma · operations & leadership" },
            ].map((c) => (
              <div key={c.t} className="flex items-start justify-between gap-4 p-5 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm">
                <div>
                  <div className="font-display text-lg font-semibold">{c.t}</div>
                  <div className="text-sm text-white/65 mt-1">{c.d}</div>
                </div>
                <ChevronRight className="size-5 text-gold shrink-0 mt-1" />
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
        <div className="flex justify-center gap-1 mb-6">
          {[...Array(5)].map((_, i) => <Star key={i} className="size-6 fill-gold text-gold" />)}
        </div>
        <blockquote className="font-display text-2xl md:text-4xl font-medium leading-snug text-foreground italic">
          "Beautifully set, perfectly delivered, and on time. Redeem made our wedding reception feel world-class."
        </blockquote>
        <div className="mt-8 text-sm text-muted-foreground">
          Verified customer · Google review · 5.0 / 5
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32 bg-secondary/40">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-gold mb-3">Get in touch</div>
            <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight mb-6">
              Let's set the table for your next celebration.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Call us to discuss your event, request a quote, or learn about enrollment in our vocational programs.
            </p>
            <div className="space-y-5">
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border hover:shadow-[var(--shadow-soft)] transition">
                <div className="size-11 rounded-full bg-gold/15 flex items-center justify-center text-gold"><Phone className="size-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Phone</div>
                  <div className="font-medium">{PHONE}</div>
                </div>
              </a>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="size-11 rounded-full bg-gold/15 flex items-center justify-center text-gold"><MapPin className="size-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Location</div>
                  <div className="font-medium">{ADDRESS}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-5 rounded-xl bg-card border border-border">
                <div className="size-11 rounded-full bg-gold/15 flex items-center justify-center text-gold"><Clock className="size-5" /></div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">Hours</div>
                  <div className="font-medium">Mon – Sat · 8:00 AM – 6:00 PM</div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-border shadow-[var(--shadow-soft)] aspect-square md:aspect-auto md:h-full min-h-[400px]">
            <iframe
              title="Map of Redeem Vocational Training Center"
              src="https://www.google.com/maps?q=Kpelle+Town+Junction,+Liberia&output=embed"
              className="w-full h-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="max-w-7xl mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-gradient-to-br from-[oklch(0.78_0.13_80)] to-[oklch(0.55_0.12_50)] flex items-center justify-center text-gold-foreground font-display font-bold">R</div>
          <div className="leading-tight">
            <div className="font-display font-semibold">Redeem Vocational Training Center</div>
            <div className="text-xs text-white/60">Catering equipment rental · Liberia</div>
          </div>
        </div>
        <div className="text-xs text-white/60 text-center md:text-right">
          © {new Date().getFullYear()} Redeem Vocational Training Center. All rights reserved.
          <div className="mt-1">{ADDRESS} · {PHONE}</div>
        </div>
      </div>
    </footer>
  );
}

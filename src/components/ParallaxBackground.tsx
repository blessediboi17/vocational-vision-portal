import { useEffect, useRef } from "react";
import { Cake, IceCreamCone, Croissant, Cookie, CakeSlice, UtensilsCrossed, Flower2, Coffee } from "lucide-react";

const SHAPES = [
  { Icon: Cake, top: "8%", left: "6%", size: 72, speed: 0.25, anim: "animate-float-slow", rotate: -8 },
  { Icon: CakeSlice, top: "22%", left: "88%", size: 56, speed: 0.45, anim: "animate-float-medium", rotate: 12 },
  { Icon: Croissant, top: "55%", left: "4%", size: 60, speed: 0.35, anim: "animate-float-medium", rotate: 15 },
  { Icon: Cookie, top: "70%", left: "92%", size: 48, speed: 0.6, anim: "animate-float-slow", rotate: -20 },
  { Icon: IceCreamCone, top: "120%", left: "10%", size: 80, speed: 0.5, anim: "animate-float-slow", rotate: 6 },
  { Icon: Flower2, top: "150%", left: "85%", size: 64, speed: 0.4, anim: "animate-float-medium", rotate: -10 },
  { Icon: UtensilsCrossed, top: "200%", left: "8%", size: 52, speed: 0.55, anim: "animate-float-slow", rotate: 18 },
  { Icon: Coffee, top: "240%", left: "90%", size: 56, speed: 0.3, anim: "animate-float-medium", rotate: -14 },
  { Icon: Cake, top: "290%", left: "12%", size: 70, speed: 0.5, anim: "animate-float-slow", rotate: 5 },
  { Icon: CakeSlice, top: "340%", left: "82%", size: 60, speed: 0.4, anim: "animate-float-medium", rotate: -8 },
];

export function ParallaxBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const el = ref.current;
        if (!el) return;
        el.querySelectorAll<HTMLElement>("[data-speed]").forEach((node) => {
          const s = parseFloat(node.dataset.speed || "0.3");
          node.style.transform = `translate3d(0, ${-y * s}px, 0) rotate(${node.dataset.rotate}deg)`;
        });
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { window.removeEventListener("scroll", onScroll); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      {/* Soft gradient backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/40 dark:to-leaf/5" />
      {/* Decorative blurred blobs */}
      <div className="absolute -top-40 -left-40 size-[28rem] rounded-full bg-leaf/20 blur-3xl animate-spin-slow" />
      <div className="absolute top-[40%] -right-40 size-[32rem] rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute bottom-[10%] left-1/3 size-[24rem] rounded-full bg-leaf/10 blur-3xl" />

      {/* Floating 3D-feeling icons */}
      {SHAPES.map(({ Icon, top, left, size, speed, anim, rotate }, i) => (
        <div
          key={i}
          data-speed={speed}
          data-rotate={rotate}
          className="absolute will-change-transform"
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        >
          <div className={anim}>
            <Icon
              style={{ width: size, height: size }}
              className="text-leaf/30 dark:text-leaf/40 drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

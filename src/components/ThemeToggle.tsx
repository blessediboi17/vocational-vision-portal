import { Lightbulb, LightbulbOff } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Lights on" : "Lights off"}
      className={`relative inline-flex items-center justify-center size-10 rounded-full border border-border bg-card hover:bg-accent transition-all ${className}`}
    >
      {isDark ? (
        <Lightbulb className="size-5 bulb-glow" />
      ) : (
        <LightbulbOff className="size-5 text-muted-foreground" />
      )}
    </button>
  );
}

import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type LandingHomeSurfaceProps = {
  children: ReactNode;
  className?: string;
};

export function LandingHomeSurface({ children, className }: LandingHomeSurfaceProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;

    const setGlowPx = (clientX: number, clientY: number) => {
      const rect = root.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      root.style.setProperty("--landing-glow-x", `${Math.round(x)}px`);
      root.style.setProperty("--landing-glow-y", `${Math.round(y)}px`);
    };

    const setGlowCenter = () => {
      root.style.setProperty("--landing-glow-x", "50%");
      root.style.setProperty("--landing-glow-y", "22%");
    };

    const onPointerMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setGlowPx(e.clientX, e.clientY));
    };

    const onPointerLeave = () => {
      cancelAnimationFrame(raf);
      setGlowCenter();
    };

    const rect = root.getBoundingClientRect();
    setGlowPx(rect.left + rect.width * 0.5, rect.top + rect.height * 0.22);

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", onPointerLeave);

    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative flex flex-col [--landing-glow-x:50%] [--landing-glow-y:22%]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className={cn(
            "absolute inset-0 opacity-[0.4] dark:opacity-[0.22]",
            "bg-[linear-gradient(to_right,hsl(var(--border)/0.45)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.38)_1px,transparent_1px)]",
            "bg-[length:52px_52px]",
            "[mask-image:radial-gradient(ellipse_80%_65%_at_50%_18%,black,transparent)]",
          )}
        />
        <div className="absolute inset-0 bg-[radial-gradient(520px_circle_at_var(--landing-glow-x)_var(--landing-glow-y),hsl(var(--primary)_/_0.14),transparent_62%)] dark:bg-[radial-gradient(520px_circle_at_var(--landing-glow-x)_var(--landing-glow-y),hsl(var(--primary)_/_0.18),transparent_60%)]" />
        <div
          className="absolute -left-[18%] top-[6%] h-[min(42vw,420px)] w-[min(42vw,420px)] rounded-full bg-primary/14 blur-[100px] motion-reduce:animate-none motion-safe:animate-pulse dark:bg-primary/18"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute -right-[14%] top-[26%] h-[min(38vw,380px)] w-[min(38vw,380px)] rounded-full bg-secondary/12 blur-[92px] motion-reduce:animate-none motion-safe:animate-pulse dark:bg-secondary/16"
          style={{ animationDuration: "9s", animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-[-12%] left-[22%] h-[min(40vw,400px)] w-[min(40vw,400px)] rounded-full bg-accent/10 blur-[96px] motion-reduce:animate-none motion-safe:animate-pulse dark:bg-accent/14"
          style={{ animationDuration: "8.5s", animationDelay: "2s" }}
        />
      </div>
      <div className="relative z-10 flex flex-col">{children}</div>
    </div>
  );
}

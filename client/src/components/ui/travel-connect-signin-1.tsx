import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { SpecialtyId } from "@shared/specialties";
import { getSpecialty } from "@shared/specialties";

type RoutePoint = {
  x: number;
  y: number;
  delay: number;
};

function hslFill(token: string, alpha: number) {
  const [h, s, l] = token.split(" ");
  return `hsla(${h}, ${s}, ${l}, ${alpha})`;
}

function DotMap({ specialtyId }: { specialtyId: SpecialtyId }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const tokens = getSpecialty(specialtyId).theme.light;
  const routeColor = hslFill(tokens.primary, 1);

  const routes: { start: RoutePoint; end: RoutePoint; color: string }[] = [
    { start: { x: 100, y: 150, delay: 0 }, end: { x: 200, y: 80, delay: 2 }, color: routeColor },
    { start: { x: 200, y: 80, delay: 2 }, end: { x: 260, y: 120, delay: 4 }, color: routeColor },
    { start: { x: 50, y: 50, delay: 1 }, end: { x: 150, y: 180, delay: 3 }, color: routeColor },
    { start: { x: 280, y: 60, delay: 0.5 }, end: { x: 180, y: 180, delay: 2.5 }, color: routeColor },
  ];

  const generateDots = (width: number, height: number) => {
    const dots: { x: number; y: number; radius: number; opacity: number }[] = [];
    const gap = 12;
    const dotRadius = 1;

    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const isInMapShape =
          (x < width * 0.25 && x > width * 0.05 && y < height * 0.4 && y > height * 0.1) ||
          (x < width * 0.25 && x > width * 0.15 && y < height * 0.8 && y > height * 0.4) ||
          (x < width * 0.45 && x > width * 0.3 && y < height * 0.35 && y > height * 0.15) ||
          (x < width * 0.5 && x > width * 0.35 && y < height * 0.65 && y > height * 0.35) ||
          (x < width * 0.7 && x > width * 0.45 && y < height * 0.5 && y > height * 0.1) ||
          (x < width * 0.8 && x > width * 0.65 && y < height * 0.8 && y > height * 0.6);

        if (isInMapShape && Math.random() > 0.3) {
          dots.push({
            x,
            y,
            radius: dotRadius,
            opacity: Math.random() * 0.5 + 0.2,
          });
        }
      }
    }
    return dots;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas?.parentElement) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
      canvas.width = width;
      canvas.height = height;
    });

    resizeObserver.observe(canvas.parentElement);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!dimensions.width || !dimensions.height) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = generateDots(dimensions.width, dimensions.height);
    let animationFrameId: number;
    let startTime = Date.now();

    function drawDots() {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      dots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
        ctx.fillStyle = hslFill(tokens.primary, dot.opacity);
        ctx.fill();
      });
    }

    function drawRoutes() {
      const currentTime = (Date.now() - startTime) / 1000;

      routes.forEach((route) => {
        const elapsed = currentTime - route.start.delay;
        if (elapsed <= 0) return;

        const duration = 3;
        const progress = Math.min(elapsed / duration, 1);
        const x = route.start.x + (route.end.x - route.start.x) * progress;
        const y = route.start.y + (route.end.y - route.start.y) * progress;

        ctx.beginPath();
        ctx.moveTo(route.start.x, route.start.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = route.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(route.start.x, route.start.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = route.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${tokens.secondary})`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fillStyle = hslFill(tokens.primary, 0.4);
        ctx.fill();

        if (progress === 1) {
          ctx.beginPath();
          ctx.arc(route.end.x, route.end.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = route.color;
          ctx.fill();
        }
      });
    }

    function animate() {
      drawDots();
      drawRoutes();
      const currentTime = (Date.now() - startTime) / 1000;
      if (currentTime > 15) {
        startTime = Date.now();
      }
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [dimensions, specialtyId, tokens.primary, tokens.secondary]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export function AuthSplitShell({
  specialtyId,
  isSignUp = false,
  children,
  className,
}: {
  specialtyId: SpecialtyId;
  isSignUp?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const specialty = getSpecialty(specialtyId);
  const isOrtho = specialtyId === "ortho";

  return (
    <div className={cn("flex h-full w-full items-center justify-center", className)}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-card"
      >
        <div className="relative hidden h-auto min-h-[560px] w-1/2 overflow-hidden border-r border-gray-100 dark:border-border md:block">
          <div
            className={cn(
              "absolute inset-0",
              isOrtho
                ? "bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/40 dark:to-stone-900"
                : "bg-gradient-to-br from-sky-50 to-cyan-100 dark:from-sky-950/50 dark:to-slate-900",
            )}
          >
            <DotMap specialtyId={specialtyId} />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mb-6"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/30">
                  <ArrowRight className="h-6 w-6 text-primary-foreground" />
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                className="mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-center text-3xl font-bold text-transparent"
              >
                {isSignUp ? "Start Studying" : "Continue Studying"}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="max-w-xs text-center text-sm text-muted-foreground"
              >
                {isSignUp
                  ? `Create an account to begin your ${specialty.specialtyName} question bank, explanations, and structured review paths.`
                  : `Sign in to pick up your ${specialty.specialtyName} question bank, explanations, and structured review paths.`}
              </motion.p>
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col justify-center bg-white p-8 dark:bg-card md:w-1/2 md:p-10">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

export function GoogleMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fillOpacity=".54"
      />
      <path
        fill="#4285F4"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#34A853"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
      <path fill="#EA4335" d="M1 1h22v22H1z" fillOpacity="0" />
    </svg>
  );
}

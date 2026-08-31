"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PARTICLE_CONFIGS = [
  { width: 4, height: 5, radius: 18, scale: 0.95, duration: 0.62, angle: 0 },
  { width: 5, height: 4, radius: 22, scale: 1.05, duration: 0.68, angle: 1.26 },
  { width: 4, height: 4, radius: 20, scale: 0.88, duration: 0.64, angle: 2.51 },
  { width: 5, height: 5, radius: 24, scale: 1.1, duration: 0.7, angle: 3.77 },
  { width: 4, height: 5, radius: 19, scale: 0.92, duration: 0.66, angle: 5.03 },
] as const;

const iconAnimations = {
  tapActive: { scale: 0.85, rotate: -10 },
  tapCompleted: { scale: 1, rotate: 0 },
};

const burstAnimation = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: [0, 1.4, 1], opacity: [0, 0.4, 0] },
  transition: { duration: 0.7, ease: "easeOut" as const },
};

export interface BookmarkAnimatedIconProps {
  isSaved: boolean;
  size?: number;
  className?: string;
}

/** Animated bookmark glyph — embed inside another button when needed. */
export function BookmarkAnimatedIcon({
  isSaved,
  size = 16,
  className,
}: BookmarkAnimatedIconProps) {
  return (
    <motion.div
      initial={{ scale: 1 }}
      animate={{ scale: isSaved ? 1.1 : 1 }}
      whileTap={isSaved ? iconAnimations.tapCompleted : iconAnimations.tapActive}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className={cn("relative flex items-center justify-center", className)}
    >
      <Bookmark className="opacity-60" size={size} aria-hidden="true" />

      <Bookmark
        className="absolute inset-0 text-primary fill-primary transition-all duration-300"
        size={size}
        aria-hidden="true"
        style={{ opacity: isSaved ? 1 : 0 }}
      />

      <AnimatePresence>
        {isSaved && (
          <motion.div
            key="bookmark-burst"
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle, hsl(var(--primary) / 0.4) 0%, hsl(var(--primary) / 0) 80%)",
            }}
            initial={burstAnimation.initial}
            animate={burstAnimation.animate}
            transition={burstAnimation.transition}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSaved && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {PARTICLE_CONFIGS.map((particle, index) => {
              const x = Math.cos(particle.angle) * particle.radius;
              const y = Math.sin(particle.angle) * particle.radius * 0.75;
              return (
                <motion.div
                  key={`bookmark-particle-${index}`}
                  className="absolute rounded-full bg-primary"
                  style={{
                    width: `${particle.width}px`,
                    height: `${particle.height}px`,
                    filter: "blur(1px)",
                    transform: "translate(-50%, -50%)",
                  }}
                  initial={{ scale: 0, opacity: 0.3, x: 0, y: 0 }}
                  animate={{
                    scale: [0, particle.scale, 0],
                    opacity: [0.3, 0.8, 0],
                    x: [0, x],
                    y: [0, y],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: index * 0.04,
                    ease: "easeOut",
                  }}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export interface BookmarkIconButtonProps
  extends Omit<React.ComponentProps<typeof Button>, "onClick"> {
  isSaved: boolean;
  onClick?: () => void;
  iconSize?: number;
}

export function BookmarkIconButton({
  isSaved,
  onClick,
  disabled,
  iconSize = 20,
  className,
  title = "Bookmark",
  "data-testid": dataTestId,
  variant = "ghost",
  size = "icon",
  ...buttonProps
}: BookmarkIconButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      <Button
        variant={variant}
        size={size}
        onClick={onClick}
        disabled={disabled}
        aria-pressed={isSaved}
        title={title}
        data-testid={dataTestId}
        className={cn("flex-shrink-0", className)}
        {...buttonProps}
      >
        <BookmarkAnimatedIcon isSaved={isSaved} size={iconSize} />
      </Button>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { GraduationCap, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const INSTAGRAM_URL =
  "https://www.instagram.com/prs_atlas?igsh=bDk1dmtld2Uzdnpt";

type InstitutionalPricingCalloutProps = {
  className?: string;
};

export function InstitutionalPricingCallout({ className }: InstitutionalPricingCalloutProps) {
  return (
    <section
      aria-labelledby="institutional-pricing-heading"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.12] via-background/90 to-secondary/[0.08] p-6 shadow-md ring-1 ring-black/[0.05] dark:from-primary/[0.16] dark:to-secondary/[0.12] dark:ring-white/[0.07]",
        "motion-safe:before:pointer-events-none motion-safe:before:absolute motion-safe:before:inset-0 motion-safe:before:bg-[radial-gradient(420px_circle_at_18%_0%,hsl(var(--primary)/0.22),transparent_55%)] motion-safe:before:opacity-90",
        className,
      )}
    >
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25"
          aria-hidden
        >
          <GraduationCap className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Residency & fellowship programs
            </p>
            <h2
              id="institutional-pricing-heading"
              className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Institutional Pricing? No Problem!
            </h2>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            We partner with plastic and reconstructive surgery residency and fellowship programs across the
            country and internationally to offer bulk pricing for full access to the Atlas Review platform.
            Send us an email at{" "}
            <a href="mailto:hello@prsatlas.com" className="font-medium text-primary underline-offset-4 hover:underline">
              hello@prsatlas.com
            </a>
            , or reach out to us on Instagram and we will get back to you within 24 hours on how to provide
            access to all of your residents and fellows.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="lg" className="glow-primary transition-glow" asChild>
              <a href="mailto:hello@prsatlas.com?subject=Institutional%20pricing%20inquiry">
                <Mail className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                Email Us
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary/30 bg-background/60 backdrop-blur-sm"
              asChild
            >
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                Message Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

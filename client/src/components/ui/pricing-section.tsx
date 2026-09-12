import * as React from "react";
import { CircleCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type SectionProps = { children: React.ReactNode; className?: string; id?: string };
type ContainerProps = { children: React.ReactNode; className?: string; id?: string };

const Section = ({ children, className, id }: SectionProps) => (
  <section className={cn("py-8 md:py-12", className)} id={id}>
    {children}
  </section>
);

const Container = ({ children, className, id }: ContainerProps) => (
  <div className={cn("mx-auto w-full max-w-6xl", className)} id={id}>
    {children}
  </div>
);

export type PricingCardData = {
  id?: string;
  title: string;
  price: React.ReactNode;
  description?: React.ReactNode;
  features: React.ReactNode[];
  featured?: boolean;
  featuredLabel?: string;
  pills?: string[];
  cta: React.ReactNode;
  /** When "start", keep the CTA under the body instead of pinning it to the card footer. */
  ctaPlacement?: "end" | "start";
  children?: React.ReactNode;
  className?: string;
};

export type PricingSectionProps = {
  heading?: React.ReactNode;
  subheading?: React.ReactNode;
  plans: PricingCardData[];
  className?: string;
  containerClassName?: string;
  gridClassName?: string;
  align?: "center" | "start";
  compact?: boolean;
  animate?: boolean;
  id?: string;
};

export function PricingSection({
  heading,
  subheading,
  plans,
  className,
  containerClassName,
  gridClassName,
  align = "center",
  compact = false,
  animate = true,
  id,
}: PricingSectionProps) {
  const gridClass = cn(
    "not-prose grid w-full grid-cols-1 gap-6 sm:grid-cols-2 min-[1100px]:grid-cols-4",
    compact ? "mt-4 gap-4" : "mt-4",
    gridClassName,
  );

  const cards = plans.map((plan, index) => (
    <PricingCard key={plan.id ?? plan.title} plan={plan} compact={compact} animate={animate} index={index} />
  ));

  return (
    <Section className={cn(compact && "py-0 md:py-0", className)} id={id}>
      <Container
        className={cn(
          "flex w-full flex-col",
          align === "center" ? "items-center gap-4 text-center" : "items-stretch gap-3 text-left",
          containerClassName,
        )}
      >
        {heading}
        {subheading}
        <div className={gridClass}>{cards}</div>
      </Container>
    </Section>
  );
}

export function PricingCard({
  plan,
  compact = false,
  animate = false,
  index = 0,
}: {
  plan: PricingCardData;
  compact?: boolean;
  animate?: boolean;
  index?: number;
}) {
  return (
    <div
      id={plan.id}
      className={cn(
        "flex h-full flex-col rounded-lg border border-border bg-card p-6 text-left text-card-foreground shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-md",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        animate &&
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:fill-mode-both",
        plan.featured &&
          "border-primary shadow-sm ring-1 ring-primary/10 hover:shadow-lg hover:ring-primary/20",
        compact && "p-5",
        plan.className,
      )}
      style={animate ? { animationDelay: `${index * 90}ms` } : undefined}
      aria-label={plan.title}
    >
      <div className="text-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2">
          <Badge variant={plan.featured ? "default" : "secondary"}>{plan.title}</Badge>
          {plan.featured && plan.featuredLabel ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              {plan.featuredLabel}
            </span>
          ) : null}
          {plan.pills?.map((pill) => (
            <span
              key={pill}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {pill}
            </span>
          ))}
        </div>
        <div className="mb-2 mt-4 text-2xl font-semibold tracking-tight text-primary">{plan.price}</div>
        {plan.description ? (
          <div className="text-sm text-muted-foreground">{plan.description}</div>
        ) : null}
      </div>

      <div className="my-4 border-t border-border" />

      {plan.features.length > 0 ? (
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li
              key={typeof feature === "string" ? feature : index}
              className="flex items-start text-sm text-muted-foreground"
            >
              <CircleCheck className="mr-2 mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {plan.children}

      <div
        className={cn(
          "flex flex-col gap-2",
          plan.ctaPlacement === "start" ? "mt-4" : "mt-auto pt-6",
        )}
      >
        {plan.cta}
      </div>
    </div>
  );
}

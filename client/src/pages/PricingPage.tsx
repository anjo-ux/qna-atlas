import type { SVGProps } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { InstitutionalPricingCallout } from "@/components/marketing/InstitutionalPricingCallout";
import { usePageSeo } from "@/lib/usePageSeo";
import { PRICING_MARKETING_FAQ } from "@shared/marketingFaqs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import {
  FALLBACK_PLANS,
  getPlanDisplay,
  getSubscriptionIncludedFeatures,
} from "@/data/subscriptionPlanDisplay";
import { PricingSection, type PricingCardData } from "@/components/ui/pricing-section";
import { CircleCheck, Building2 } from "lucide-react";
import { Link } from "wouter";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { Skeleton } from "@/components/ui/skeleton";

/** Checklist card — reads as included features, not a decorative sparkle. */
function SubscriptionIncludesIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <rect x="3.5" y="2.75" width="17" height="18.5" rx="2.25" />
      <path d="m7 8.35 1.15 1.2 2.35-2.55" />
      <path d="M13 8.75h4" />
      <path d="m7 12.6 1.15 1.2 2.35-2.55" />
      <path d="M13 13h4" />
      <path d="m7 16.85 1.15 1.2 2.35-2.55" />
      <path d="M13 17.25h3" />
    </svg>
  );
}

export default function PricingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const specialty = useHostSpecialty();

  usePageSeo("/pricing");

  const includedFeatures = getSubscriptionIncludedFeatures({
    specialtyName: specialty.specialtyName,
    includeOralCoach: specialty.id !== "ortho",
  });

  const checkoutHref = isAuthenticated ? "/subscribe" : "/signup";
  const checkoutLabel = isAuthenticated ? "Go To Checkout" : "Create Account & Subscribe";

  const paidPlanCards: PricingCardData[] = FALLBACK_PLANS.map((plan) => {
    const d = getPlanDisplay(plan);
    const featured = Boolean(d.sale || d.bestDeal || plan.name === "1-year");
    return {
      id: `pricing-${plan.name}`,
      title: d.title,
      featured,
      featuredLabel: d.sale ? "Best Value" : d.bestDeal ? "Best Deal" : undefined,
      pills: d.discount ? [d.discount] : undefined,
      price: (
        <div className="flex flex-col items-center gap-1">
          {d.originalPrice ? (
            <span className="text-lg font-normal text-muted-foreground line-through">{d.originalPrice}</span>
          ) : null}
          <span>{d.price}</span>
        </div>
      ),
      description: (
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide">{d.billing}</p>
          <p>{d.description}</p>
        </div>
      ),
      features: includedFeatures,
      cta: isLoading ? (
        <Skeleton className="h-9 w-full" />
      ) : (
        <Button asChild size="sm" className="w-full" variant={featured ? "default" : "secondary"}>
          <Link href={checkoutHref}>{checkoutLabel}</Link>
        </Button>
      ),
    };
  });

  const institutionalCard: PricingCardData = {
    id: "pricing-institutional",
    title: "Institutional",
    price: (
      <span className="inline-flex items-center gap-2 text-xl">
        <Building2 className="h-5 w-5" aria-hidden />
        Program-Provisioned Access
      </span>
    ),
    description:
      "Residency and fellowship programs can partner with Atlas Review so trainees activate access with a code, with no shared passwords and no guesswork.",
    features: [
      "Directors and coordinators can contact us to learn about cohort onboarding and institutional billing.",
    ],
    cta: isLoading ? (
      <Skeleton className="h-9 w-full" />
    ) : (
      <>
        <Button asChild size="sm" className="w-full" variant="secondary">
          <Link href={checkoutHref}>Enter Code After Sign-In</Link>
        </Button>
        <Button asChild variant="link" className="h-auto p-0 text-sm text-muted-foreground">
          <Link href="/contact">Ask About Partnerships</Link>
        </Button>
      </>
    ),
  };

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-2 text-sm font-medium tracking-tight text-muted-foreground">
              Simple Plans, Serious Prep
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              Pricing
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Choose the commitment that matches your timeline, whether you are sprinting toward an
              in-service window, mapping a full board season, or joining through your institution.
              Every personal plan unlocks the same deep question bank
              {specialty.id === "ortho"
                ? ", testing tools, and progress analytics."
                : ", testing tools, and oral practice environment."}
            </p>
          </header>

          <PricingSection
            className="py-0 md:py-0"
            plans={[...paidPlanCards, institutionalCard]}
            animate
          />

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-muted-foreground">
            Displayed prices reflect our current public rate card. Your checkout screen (Stripe) is
            the final source of truth for tax, currency, and any limited-time promotions at the moment
            you purchase.
          </p>

          <InstitutionalPricingCallout className="mx-auto mt-12 max-w-4xl" />

          <section className="mx-auto mt-16 max-w-4xl" aria-labelledby="included-heading">
            <div className="mb-8 text-center">
              <h2 id="included-heading" className="mb-2 flex items-center justify-center gap-2 text-2xl font-semibold sm:text-3xl">
                <SubscriptionIncludesIcon className="h-8 w-8 text-primary" />
                What Your Subscription Includes
              </h2>
              <p className="text-muted-foreground">
                Atlas Review is built as one premium product, not a stripped-down “basic” tier. When
                you subscribe, you invest in the full {specialty.specialtyName.toLowerCase()} study
                ecosystem with recall, testing, and oral rehearsal in one subscription.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                {includedFeatures.map((line) => (
                  <div key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span>{line}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="mb-6 text-center text-2xl font-semibold">
              Pricing Questions
            </h2>
            <div className="space-y-4">
              {PRICING_MARKETING_FAQ.map(({ q, a }) => (
                <Card key={q} variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">{q}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">
                    {a}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            className="mx-auto mt-16 max-w-2xl rounded-2xl border border-primary/25 bg-primary/5 p-8 text-center"
            aria-labelledby="cta-pricing"
          >
            <h2 id="cta-pricing" className="mb-3 text-xl font-semibold">
              Ready To Study With The Full Atlas Stack?
            </h2>
            <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
              Create your account, pick the term that fits, and start with structured questions,
              mock exams, and oral board practice the same day.
            </p>
            {isLoading ? (
              <div className="mx-auto h-11 w-48 animate-pulse rounded-md bg-muted" />
            ) : (
              <Button asChild size="lg" className="glow-primary transition-glow">
                <Link href={checkoutHref}>{checkoutLabel}</Link>
              </Button>
            )}
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { FALLBACK_PLANS, getPlanDisplay } from "@/data/subscriptionPlanDisplay";
import { Check, Building2, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "wouter";

const INCLUDED_FEATURES = [
  "Full Plastic Surgery Question Bank With Thousands Of Curated Items",
  "Detailed Explanations And Reference-Friendly Study Flows",
  "Timed Mock Exams And Custom Test Builder",
  "Spaced Repetition And Bookmarking Across Devices",
  "Oral Board-Style Coach For Verbal Practice",
  "Progress Tracking By Section And Sub-Topic",
] as const;

const PRICING_FAQ = [
  {
    q: "Do All Paid Plans Include The Same Features?",
    a: "Yes. Monthly, 6-month, and annual access all unlock the same Atlas Review experience. The difference is how long you commit and the savings on longer terms.",
  },
  {
    q: "Is There A Free Trial?",
    a: "Eligible new accounts can start with a free trial when subscribing through checkout. If you already used a trial on your email, checkout will show paid terms clearly before you confirm.",
  },
  {
    q: "What Is Institutional Access?",
    a: "Programs can provision access with a code from your administrator. If your residency or fellowship partners with Atlas Review, enter your code after sign-up on the subscribe page.",
  },
  {
    q: "Can I Switch Plans Later?",
    a: "You can choose a new term when you renew or upgrade from your account flow. For billing questions, email hello@prs-atlas.com with the email on your account.",
  },
] as const;

export default function PricingPage() {
  const { isAuthenticated, isLoading } = useAuth();

  usePageSeo({
    title: "Pricing & Plans | Plastic Surgery Atlas Review",
    description:
      "Atlas Review pricing includes flexible monthly ($50), 6-month ($270), and annual plans with promotional savings plus institutional codes. Compare plans and unlock the full plastic surgery Q&A bank, mock exams, spaced repetition, and oral board practice.",
  });

  const checkoutHref = isAuthenticated ? "/subscribe" : "/signup";
  const checkoutLabel = isAuthenticated ? "Go To Checkout" : "Create Account & Subscribe";

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-2 text-sm font-medium tracking-tight text-muted-foreground">
              Simple Plans, Serious Prep
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight gradient-text sm:text-5xl">
              Pricing
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Choose the commitment that matches your timeline, whether you are sprinting toward an
              in-service window, mapping a full board season, or joining through your institution.
              Every personal plan unlocks the same deep question bank, testing tools, and oral
              practice environment.
            </p>
          </header>

          <div className="mx-auto mb-6 max-w-2xl rounded-2xl border-2 border-rose-500/60 bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-rose-600/15 px-4 py-4 text-center shadow-md ring-1 ring-rose-400/25 dark:border-rose-400/50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40">
            <span className="inline-block rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1 text-xs font-bold tracking-wide text-white shadow-sm">
              Post-In-Service Sale
            </span>
            <p className="mt-2 text-base font-semibold text-foreground sm:text-lg">
              <span className="text-muted-foreground line-through decoration-2 decoration-rose-500/70">
                $450
              </span>
              <span className="mx-2 text-muted-foreground">→</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 sm:text-3xl">
                $270
              </span>
              <span className="ml-2 text-sm font-semibold text-rose-900 dark:text-rose-100">
                First Year
              </span>
            </p>
            <p className="text-sm font-medium text-rose-900 dark:text-rose-100">
              Limited-Time Annual Pricing · See Yearly Plan Below
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FALLBACK_PLANS.map((plan) => {
              const d = getPlanDisplay(plan);
              const isSale = Boolean(d.sale);
              return (
                <Card
                  key={plan.name}
                  variant="glass"
                  className={
                    isSale
                      ? "relative flex flex-col border-2 border-rose-500/70 bg-gradient-to-b from-rose-500/10 to-transparent shadow-lg ring-2 ring-rose-400/20 dark:border-rose-400/50"
                      : "flex flex-col border-primary/15 glow-primary transition-glow"
                  }
                >
                  {isSale ? (
                    <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white shadow-md sm:text-xs">
                      Best Value
                    </div>
                  ) : null}
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg gradient-text sm:text-xl">{d.title}</CardTitle>
                    <CardDescription className="text-xs font-medium tracking-wide text-muted-foreground">
                      {d.billing}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-2">
                    <div className="flex flex-wrap items-baseline gap-2">
                      {d.originalPrice ? (
                        <span className="text-lg text-muted-foreground line-through">{d.originalPrice}</span>
                      ) : null}
                      <span className="text-3xl font-bold tracking-tight text-foreground">{d.price}</span>
                    </div>
                    {d.discount ? (
                      <p
                        className={
                          d.sale
                            ? "text-sm font-semibold text-rose-700 dark:text-rose-300"
                            : "text-sm font-semibold text-secondary"
                        }
                      >
                        {d.discount}
                      </p>
                    ) : null}
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {plan.durationMonths === 1
                        ? "Lowest Upfront Cost. Ideal When You Want Maximum Flexibility Between Rotations Or Exams."
                        : plan.durationMonths === 6
                          ? "Balanced Savings For A Dedicated Six-Month Study Arc. Popular For Structured Board Prep Blocks."
                          : "Maximum Savings For The Surgeon Who Wants Atlas As A Year-Round Companion Through Peak Prep."}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isLoading ? (
                      <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                    ) : (
                      <Button asChild className="w-full glow-primary transition-glow" variant={isSale ? "default" : "outline"}>
                        <Link href={checkoutHref}>{checkoutLabel}</Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}

            <Card variant="glass" className="flex flex-col border-secondary/30 bg-secondary/5">
              <CardHeader className="pb-2">
                <div className="mb-1 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" aria-hidden />
                  <CardTitle className="text-lg gradient-text sm:text-xl">Institutional</CardTitle>
                </div>
                <CardDescription className="text-xs font-medium tracking-wide text-muted-foreground">
                  Program-Provisioned Access
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm leading-relaxed text-muted-foreground">
                <p>
                  Residency and fellowship programs can partner with Atlas Review so trainees activate
                  access with a code, with no shared passwords and no guesswork.
                </p>
                <p className="flex items-start gap-2">
                  <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                  Directors and coordinators can contact us to learn about cohort onboarding and
                  institutional billing.
                </p>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 pt-0">
                {isLoading ? (
                  <div className="h-10 w-full animate-pulse rounded-md bg-muted" />
                ) : (
                  <Button asChild variant="secondary" className="w-full">
                    <Link href={checkoutHref}>Enter Code After Sign-In</Link>
                  </Button>
                )}
                <Button asChild variant="link" className="h-auto p-0 text-sm text-muted-foreground">
                  <Link href="/contact">Ask About Partnerships</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <p className="mx-auto mt-6 max-w-3xl text-center text-xs text-muted-foreground">
            Displayed prices reflect our current public rate card. Your checkout screen (Stripe) is
            the final source of truth for tax, currency, and any limited-time promotions at the moment
            you purchase.
          </p>

          <section className="mx-auto mt-16 max-w-4xl" aria-labelledby="included-heading">
            <div className="mb-8 text-center">
              <h2 id="included-heading" className="mb-2 flex items-center justify-center gap-2 text-2xl font-semibold sm:text-3xl">
                <Sparkles className="h-8 w-8 text-primary" aria-hidden />
                What Your Subscription Includes
              </h2>
              <p className="text-muted-foreground">
                Atlas Review is built as one premium product, not a stripped-down “basic” tier. When
                you subscribe, you invest in the full plastic surgery study ecosystem with recall,
                testing, and oral rehearsal in one subscription.
              </p>
            </div>
            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
                {INCLUDED_FEATURES.map((line) => (
                  <div key={line} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <Check className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden />
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
              {PRICING_FAQ.map(({ q, a }) => (
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

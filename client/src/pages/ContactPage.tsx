import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock, KeyRound, CreditCard, BookOpenCheck, LifeBuoy } from "lucide-react";
import { Link } from "wouter";

const CONTACT_EMAIL = "hello@prs-atlas.com";
const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=Atlas%20Review%20inquiry`;

export default function ContactPage() {
  usePageSeo("/contact");

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mb-10 text-center sm:text-left">
            <p className="mb-2 text-sm font-medium tracking-tight text-muted-foreground">
              We Are Here To Help
            </p>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight gradient-text sm:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:mx-0">
              Whether you are onboarding your first study block or troubleshooting access, start
              with the tips below, then reach out if you still need us. We read every message and
              route it to the right person on our small team.
            </p>
          </header>

          <Card className="mb-10 border-primary/25 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-6 w-6 text-primary" aria-hidden />
                Email Us
              </CardTitle>
              <CardDescription>
                For General Questions, Partnerships, Feedback, Or Anything That Does Not Fit The
                Categories Below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={mailtoHref}
                className="break-all text-lg font-semibold text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <Button asChild size="lg" className="glow-primary shrink-0 transition-glow">
                <a href={mailtoHref}>Open In Email App</a>
              </Button>
            </CardContent>
          </Card>

          <section className="mb-6" aria-labelledby="tips-heading">
            <h2 id="tips-heading" className="mb-6 flex items-center gap-2 text-2xl font-semibold">
              <LifeBuoy className="h-7 w-7 text-primary" aria-hidden />
              Helpful Tips Before You Write
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KeyRound className="h-5 w-5 text-secondary" aria-hidden />
                    Account & Sign-In
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Try a password reset from the login page if you cannot sign in. Use the same email
                  you registered with, and check spam for messages from our auth provider. If you
                  changed institutions, mention your old and new email so we can find your account.
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-secondary" aria-hidden />
                    Billing & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Include the email on the subscription and any charge date or receipt text. If
                  access looks wrong after payment, say whether you are on web or mobile and what
                  you see on the home screen. We resolve most billing mismatches quickly with that
                  context. For current list prices and plan lengths, see our{" "}
                  <Link href="/pricing" className="font-medium text-primary hover:underline">
                    Pricing
                  </Link>{" "}
                  page.
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenCheck className="h-5 w-5 text-secondary" aria-hidden />
                    Study Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Tell us your goal (in-service, boards, or maintenance of knowledge) and how many
                  weeks you have. We are happy to suggest how to mix the question bank, mock exams,
                  spaced repetition, and oral practice in{" "}
                  <Link href="/the-atlas-way" className="font-medium text-primary hover:underline">
                    The Atlas Way
                  </Link>
                  .
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-secondary" aria-hidden />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  We typically reply within one to two business days, often faster. Peak board season
                  can add a little delay. For urgent access issues, put &quot;urgent access&quot; in the
                  subject line so we can triage.
                </CardContent>
              </Card>
            </div>
          </section>

          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Learn more about our product philosophy on the{" "}
            <Link href="/about" className="font-medium text-primary hover:underline">
              About Us
            </Link>{" "}
            page.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}

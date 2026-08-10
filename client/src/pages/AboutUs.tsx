import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { Check, Target, Layers, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { useHostSpecialty } from "@/hooks/useSpecialty";

export default function AboutUs() {
  usePageSeo("/about");
  const specialty = useHostSpecialty();
  const specialtyLower = specialty.specialtyName.toLowerCase();

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <article className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mb-10 space-y-4">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              {specialty.specialtyName} Education
            </p>
            <h1 className="text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              About Atlas Review
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Atlas Review is a dedicated study companion for {specialty.specialtyName} trainees and surgeons who want
              depth, structure, and accountability, not scattered PDFs and endless browser tabs. We
              combine a large, organized question bank with active recall tools, mock testing, and
              {specialty.id === "ortho"
                ? " spaced repetition so you can study the way high-stakes exams actually reward."
                : " oral board-style practice so you can study the way high-stakes exams actually reward."}
            </p>
          </header>

          <section className="mb-12 space-y-4" aria-labelledby="mission-heading">
            <h2 id="mission-heading" className="flex items-center gap-2 text-2xl font-semibold">
              <Target className="h-7 w-7 text-primary" aria-hidden />
              Our Mission
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              We believe {specialtyLower} training deserves the same rigor in study design as it does
              in the operating room. Our mission is to make comprehensive, subspecialty-spanning
              knowledge easier to build, retain, and stress-test, whether you are preparing for
              in-service exams, consolidating clinical knowledge between rotations, or sharpening
              {specialty.id === "ortho" ? " board-style judgment under timed conditions." : " judgment before oral boards."}
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Every feature we ship is aimed at one outcome. Helping you close gaps you did not know
              you had, faster than passive reading alone ever could.
            </p>
          </section>

          <section className="mb-12 space-y-4" aria-labelledby="how-heading">
            <h2 id="how-heading" className="flex items-center gap-2 text-2xl font-semibold">
              <BookOpen className="h-7 w-7 text-primary" aria-hidden />
              How The App Works
            </h2>
            <ol className="list-decimal space-y-3 pl-5 leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
              <li>
                <strong className="text-foreground">Choose Your Focus.</strong> Browse by section and
                sub-topic, from {specialty.marketing.subspecialtyExamples}, so study time maps to
                your real weak areas.
              </li>
              <li>
                <strong className="text-foreground">Answer Under Pressure.</strong> Work questions
                in study mode or assemble timed mock exams that mirror the cognitive load of test
                day.
              </li>
              <li>
                <strong className="text-foreground">Read The Why.</strong> Each item is paired with
                explanations that connect facts to clinical reasoning, not just isolated buzzwords.
              </li>
              <li>
                <strong className="text-foreground">Lock It In.</strong> Spaced repetition and
                bookmarks help you revisit high-yield material on a schedule that fights forgetting.
              </li>
              {specialty.id !== "ortho" && (
                <li>
                  <strong className="text-foreground">Practice Out Loud.</strong> The{" "}
                  <Link href="/oral-boards-coach" className="font-medium text-primary underline-offset-4 hover:underline">
                    Oral Boards Coach
                  </Link>{" "}
                  simulates the verbal, scenario-driven style of oral examinations so you can rehearse
                  structure, pacing, and depth, not only multiple-choice mechanics.
                </li>
              )}
            </ol>
          </section>

          <section className="mb-12 space-y-6" aria-labelledby="bank-heading">
            <h2 id="bank-heading" className="flex items-center gap-2 text-2xl font-semibold">
              <Layers className="h-7 w-7 text-primary" aria-hidden />
              Why Our Question Databank Is Built To Be Strong
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              A question bank is only as good as its coverage, consistency, and explanations. Atlas
              Review is organized around a comprehensive {specialtyLower} curriculum, not a loose grab
              bag of trivia, so you can trust that time in the app maps to the breadth the field
              demands.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="glass" className="border-primary/15">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">Scale With Structure</CardTitle>
                  <CardDescription>
                    Items Curated Across Major Domains, Aligned To How {specialty.specialtyName} Is
                    Taught And Examined, Not Random One-Offs.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    Topic taxonomy that mirrors comprehensive study plans
                  </div>
                  <div className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    Detailed explanations to reinforce concepts, not just keys
                  </div>
                </CardContent>
              </Card>
              <Card variant="glass" className="border-secondary/20">
                <CardHeader>
                  <CardTitle className="text-lg gradient-text">Built For Retention</CardTitle>
                  <CardDescription>
                    The Bank Pairs With Spaced Repetition, Custom Tests, And Progress Views So
                    Volume Turns Into Durable Mastery.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    Mock exams and review flows to simulate real exam pressure
                  </div>
                  <div className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                    Notes and references to personalize your path through the material
                  </div>
                </CardContent>
              </Card>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              We continuously refine content and platform experience based on how surgeons actually
              study. Compare plans anytime on{" "}
              <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
                Pricing
              </Link>
              . If you have ideas or need help, visit our{" "}
              <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
                Contact Us
              </Link>{" "}
              page, and we read every message.
            </p>
          </section>

          <section
            className="rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center"
            aria-labelledby="cta-heading"
          >
            <h2 id="cta-heading" className="mb-3 text-xl font-semibold text-foreground">
              Ready To Study With Intention?
            </h2>
            <p className="mb-6 text-muted-foreground">
              Create an account to unlock the full Atlas experience, including progress tracking, custom exams,
              spaced repetition, and more.
            </p>
            <Button asChild size="lg" className="glow-primary transition-glow">
              <Link href="/signup">Get Started</Link>
            </Button>
          </section>
        </article>
      </main>
    </MarketingShell>
  );
}

import { MarketingShell } from "@/components/marketing/MarketingShell";
import { OralBoardSetupInteractiveDemo } from "@/components/marketing/OralBoardSetupInteractiveDemo";
import { usePageSeo } from "@/lib/usePageSeo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Mic2,
  SlidersHorizontal,
  History,
  Sparkles,
  BookOpen,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { ORAL_BOARDS_MARKETING_FAQ } from "@shared/marketingFaqs";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { Link } from "wouter";

const SESSION_CONTROLS = [
  {
    title: "Specialty Focus",
    body: "Anchor sessions in plastic surgery, hand surgery, or burn surgery so vignettes stay aligned with how you will be examined.",
  },
  {
    title: "Training Level",
    body: "Calibrate tone and depth for MS4 through fellow, so prompts feel appropriate whether you are early in residency or consolidating fellowship judgment.",
  },
  {
    title: "Session Mode",
    body: "Choose oral boards style dialogue, written-boards style density, or a guided case walkthrough depending on what you need that week.",
  },
  {
    title: "Focus Areas",
    body: "Emphasize procedures, complications, ethics, biostatistics, or sweep everything together when you want a mixed oral.",
  },
  {
    title: "Difficulty Curve",
    body: "Run steady difficulty, a deliberate ramp, or an adaptive curve that pushes you as you stabilize earlier cases.",
  },
  {
    title: "Case Count",
    body: "Plan shorter sprints (for example three cases) or longer marathons (up to fifteen) when you are building stamina for a full examination day.",
  },
  {
    title: "Scoring",
    body: "Turn structured scoring on when you want feedback pressure, or switch it off for pure fluency and brainstorming.",
  },
  {
    title: "Hinting",
    body: "Practice with hints completely off, minimal nudges, or tiered support when you are still learning how to verbalize an algorithm safely.",
  },
] as const;

export default function OralBoardsCoachPage() {
  usePageSeo("/oral-boards-coach");
  const specialty = useHostSpecialty();
  const specialtyLower = specialty.specialtyName.toLowerCase();

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <article className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:max-w-4xl lg:px-8 lg:py-16">
          <header className="mb-12 space-y-5">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              Interactive Oral Exam Preparation
            </p>
            <h1 className="text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              Oral Boards Coach · The Power Of Interactive Oral Prep
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              The{" "}
              <strong className="font-semibold text-foreground">Oral Boards Coach</strong> inside
              Atlas Review is built for the part of certification that multiple-choice banks cannot
              simulate. <strong className="font-semibold text-foreground">spoken judgment</strong>,{" "}
              <strong className="font-semibold text-foreground">follow-up questions</strong>, and{" "}
              <strong className="font-semibold text-foreground">structured explanations under pressure</strong>.
              You configure each session (specialty, level, mode, focus, difficulty, case count,
              scoring, and hinting), then practice in a conversational workspace with{" "}
              <strong className="font-semibold text-foreground">streaming assistant responses</strong>{" "}
              that read like a live exchange rather than a static PDF answer key.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Whether you are preparing for{" "}
              <strong className="font-semibold text-foreground">
                {specialtyLower} oral boards
              </strong>
              ,{" "}
              sharpening skills before an{" "}
              <strong className="font-semibold text-foreground">in-service oral component</strong>, or
              maintaining verbal fluency between cases, this guide explains how the coach works, why{" "}
              <strong className="font-semibold text-foreground">scenario-based oral practice</strong> and{" "}
              <strong className="font-semibold text-foreground">session-based learning</strong> belong in
              the same stack as your question bank, and how it fits the rest of Atlas Review. For the
              three-pillar overview, see{" "}
              <Link href="/the-atlas-way" className="font-medium text-primary underline-offset-4 hover:underline">
                The Atlas Way
              </Link>
              .
            </p>
          </header>

          <section className="mb-14 space-y-4" aria-labelledby="why-verbal-heading">
            <h2 id="why-verbal-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <Mic2 className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              Why Oral Boards Demand More Than Multiple-Choice Repetition
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              Oral examinations reward a different skill stack. You must hear a stem, decide what
              matters first, say it out loud in a sensible order, and survive polite (or pointed)
              redirection. Silently clicking the best letter does not exercise the same cognitive
              loop. The Oral Boards Coach is Atlas Review’s answer, an{" "}
              <strong className="font-semibold text-foreground">interactive oral boards preparation</strong>{" "}
              surface where you type what you would say, receive examiner-style follow-up, and iterate
              until your answers feel tight, safe, and complete.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Used alongside our{" "}
              <strong className="font-semibold text-foreground">question bank</strong> and{" "}
              <strong className="font-semibold text-foreground">timed mock exams</strong>, the coach
              closes the loop from “I knew it” to “I can explain it clearly in sixty seconds.” That
              combination is what we mean by{" "}
              <strong className="font-semibold text-foreground">
                comprehensive {specialtyLower} exam prep
              </strong>{" "}
              inside one subscription.
            </p>
          </section>

          <section className="mb-14 space-y-6" aria-labelledby="how-it-works-heading">
            <h2 id="how-it-works-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <MessageSquare className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              How The Oral Boards Coach Works
            </h2>
            <ol className="list-decimal space-y-4 pl-5 leading-relaxed text-muted-foreground marker:font-semibold marker:text-foreground">
              <li>
                <strong className="text-foreground">Open A Session.</strong> Create a new conversation
                from the coach sidebar. Think of it as a dedicated oral exam room you can reset whenever
                you want a clean slate.
              </li>
              <li>
                <strong className="text-foreground">Configure The Run.</strong> Pick specialty,
                training level, mode (oral boards, written boards density, or case walkthrough),
                focus areas, difficulty curve, number of cases, scoring, and hinting. Those knobs
                exist so one tool can support a quick ethics drill, a full multi-case oral, or a
                slower teaching pass.
              </li>
              <li>
                <strong className="text-foreground">Start The Session.</strong> The assistant opens
                with a structured prompt aligned to your settings. You respond in natural language,
                the same way you would verbalize to an examiner.
              </li>
              <li>
                <strong className="text-foreground">Iterate In Chat.</strong> Follow-up questions,
                clarifications, and teaching moments arrive in a streaming transcript so you can
                read in real time, correct course, and try again without flipping pages.
              </li>
              <li>
                <strong className="text-foreground">Use History Deliberately.</strong> Prior sessions
                stay listed so you can revisit a strong run or delete noise. Spaced repetition in
                the bank handles facts. The coach archive handles how you argued those facts last
                Tuesday.
              </li>
            </ol>
          </section>

          <OralBoardSetupInteractiveDemo />

          <section className="mb-14" aria-labelledby="controls-heading">
            <h2 id="controls-heading" className="mb-6 flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <SlidersHorizontal className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              Every Dial We Expose, And Why It Exists
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {SESSION_CONTROLS.map(({ title, body }) => (
                <Card key={title} variant="glass" className="border-primary/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base gradient-text">{title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">{body}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="mb-14 space-y-4" aria-labelledby="trust-heading">
            <h2 id="trust-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <ShieldCheck className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              Ethics, Expectations, And How We Talk About This Publicly
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              The Oral Boards Coach is a <strong className="font-semibold text-foreground">study and rehearsal tool</strong>, not a
              leak of confidential examination content. We describe it with the same transparency
              you would expect from a faculty coach, with scenario-style practice, configurable rigor,
              and optional scoring or hints, not “backdoor” access to proprietary items.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              If your program has policies around AI-assisted study, use the coach the way you would
              any supervised resource, critically with primary sources at hand, and in line with
              your institution’s guidance.
            </p>
          </section>

          <section className="mb-14 space-y-6" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
              <BookOpen className="h-8 w-8 shrink-0 text-primary" aria-hidden />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {ORAL_BOARDS_MARKETING_FAQ.map(({ q, a }) => (
                <Card key={q} variant="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-foreground">{q}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 text-sm leading-relaxed text-muted-foreground">{a}</CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section
            className="mb-14 rounded-2xl border border-secondary/25 bg-secondary/5 p-6 sm:p-8"
            aria-labelledby="fit-heading"
          >
            <h2 id="fit-heading" className="mb-3 flex items-center gap-2 text-xl font-semibold">
              <History className="h-7 w-7 text-primary" aria-hidden />
              Where The Coach Sits In Your Atlas Workflow
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Start with{" "}
              <Link href="/about" className="font-medium text-primary underline-offset-4 hover:underline">
                About Atlas Review
              </Link>{" "}
              for mission and bank philosophy. Use{" "}
              <Link href="/the-atlas-way" className="font-medium text-primary underline-offset-4 hover:underline">
                The Atlas Way
              </Link>{" "}
              for the infographic view of bank → testing → oral. When you are ready to compare
              access lengths, visit{" "}
              <Link href="/pricing" className="font-medium text-primary underline-offset-4 hover:underline">
                Pricing
              </Link>
              . Questions about institutional rollout?{" "}
              <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
                Contact Us
              </Link>{" "}
              at {specialty.contactEmail}.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild className="glow-primary transition-glow">
                <Link href="/signup">
                  Get Started
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/the-atlas-way">Explore The Atlas Way</Link>
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6 text-center" aria-label="Summary">
            <div className="mx-auto flex max-w-2xl flex-col items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" aria-hidden />
              <p className="text-sm font-medium tracking-tight text-muted-foreground">
                At A Glance
              </p>
              <p className="text-base leading-relaxed text-muted-foreground">
                <strong className="text-foreground">Atlas Review Oral Boards Coach</strong> offers
                configurable, conversational{" "}
                <strong className="text-foreground">{specialtyLower} oral board practice</strong> with
                streaming dialogue, session history, scoring and hinting controls, and modes that
                span oral boards, written-boards density, and case walkthroughs, designed to
                complement your clinical training and multiple-choice mastery without replacing them.
              </p>
            </div>
          </section>
        </article>
      </main>
    </MarketingShell>
  );
}

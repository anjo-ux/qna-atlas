import { useState, useEffect, useMemo, type ComponentType, type KeyboardEvent, type SVGProps } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookMarked,
  Brain,
  ClipboardCheck,
  Lightbulb,
  MessageSquareText,
  Route,
} from "lucide-react";
import { AtlasWayTestModeDemo } from "@/components/marketing/AtlasWayTestModeDemo";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type PillarConfig = {
  step: number;
  title: string;
  description: string;
  Icon: IconType;
  BulletIcon: IconType;
  bullets: string[];
  cardClass: string;
  footerLink?: { href: string; label: string };
};

const SHARED_PILLARS: PillarConfig[] = [
  {
    step: 1,
    title: "Question Bank",
    description:
      "The Foundation. Comprehensive Coverage, Clear Organization, And Explanations That Teach, Not Just Confirm.",
    Icon: BookMarked,
    BulletIcon: Lightbulb,
    bullets: [
      "Topics grouped the way the specialty is learned and tested, so you always know where you are in the map.",
      "Rich answer discussions to connect principles, pitfalls, and decision forks.",
      "A single home for bookmarks, notes, and return visits, with no lost sticky notes.",
    ],
    cardClass: "glow-primary border-primary/20 transition-glow",
  },
  {
    step: 2,
    title: "Testing Environment",
    description:
      "Turn Knowledge Into Performance. Timed Sessions, Mock Exams, And Review Cycles That Respect How Memory Actually Works.",
    Icon: ClipboardCheck,
    BulletIcon: Brain,
    bullets: [
      "Simulate exam pressure with configurable tests, because speed and accuracy matter when the clock is real.",
      "Resume and revisit completed work to turn mistakes into permanent upgrades.",
      "Pair with spaced repetition so weak spots surface again before the exam does.",
    ],
    cardClass: "glow-accent border-secondary/25 transition-glow",
  },
];

const PRS_PILLAR_3: PillarConfig = {
  step: 3,
  title: "Oral Boards Coach",
  description:
    "Practice The Skill Oral Exams Measure. Structured Verbal Reasoning Under Uncertainty, Without Giving Away Proprietary Exam Content.",
  Icon: MessageSquareText,
  BulletIcon: Route,
  bullets: [
    "Scenario-style prompts designed to mirror how examiners probe depth, breadth, and judgment.",
    "A dedicated space to rehearse pacing, headings, and safe algorithms out loud.",
    "Marketing promise only. We help you build the habit of thinking like an oral examiner expects, ethically and transparently.",
  ],
  cardClass: "border-primary/15 transition-glow",
  footerLink: {
    href: "/oral-boards-coach",
    label: "Oral Boards Coach · Interactive Prep Guide",
  },
};

const ORTHO_PILLAR_3: PillarConfig = {
  step: 3,
  title: "Spaced Repetition",
  description:
    "Keep High-Yield Orthopaedics Durable. A Review Queue That Surfaces Misses And Weak Spots On A Schedule Built For Long-Term Retention.",
  Icon: Lightbulb,
  BulletIcon: Brain,
  bullets: [
    "Incorrect and hard items return on an evidence-aligned schedule so forgetting curves work for you, not against you.",
    "Pair daily bank work with targeted review so OITE and boards prep compounds instead of resetting every week.",
    "Bookmarks and due cards live beside the question bank, so retention stays part of the same study loop.",
  ],
  cardClass: "border-primary/15 transition-glow",
};

export default function AtlasWay() {
  const [activePillar, setActivePillar] = useState(0);
  const specialty = useHostSpecialty();
  const isOrtho = specialty.id === "ortho";

  const pillars = useMemo(
    () => [...SHARED_PILLARS, isOrtho ? ORTHO_PILLAR_3 : PRS_PILLAR_3],
    [isOrtho],
  );

  usePageSeo("/the-atlas-way");

  const onPillarKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setActivePillar(index);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;
    const intervalMs = 4500;
    const id = window.setInterval(() => {
      setActivePillar((p) => (p + 1) % pillars.length);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [pillars.length]);

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium tracking-tight text-muted-foreground">
              One System, Three Pillars
            </p>
            <h1 className="mb-6 text-4xl font-bold leading-snug tracking-tight gradient-text sm:mb-8 sm:text-5xl">
              The Atlas Way
            </h1>
            <p className="text-lg leading-relaxed text-muted-foreground">
              {isOrtho ? (
                <>
                  Atlas Review is designed as a closed loop: learn from a deep orthopaedic question bank,
                  pressure-test yourself in a realistic testing environment, then lock gains in with spaced
                  repetition. Below is how those pieces fit together, at a glance.
                </>
              ) : (
                <>
                  Atlas Review is designed as a closed loop: learn from a deep question bank, pressure-test
                  yourself in a realistic testing environment, then rehearse the verbal judgment skills
                  oral boards demand. Below is how those pieces fit together, at a glance.
                </>
              )}
            </p>
          </header>

          <div
            className="relative mx-auto max-w-6xl"
            role="region"
            aria-label="Three pillars of the Atlas Way. The highlighted pillar rotates automatically."
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-0 hidden h-14 md:block"
              aria-hidden
            >
              <div className="absolute left-[calc((100%-3rem)/6)] right-[calc((100%-3rem)/6)] top-1/2 h-0.5 -translate-y-1/2 overflow-visible rounded-full bg-primary/20">
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-primary via-secondary to-primary transition-[width] duration-700 ease-in-out motion-reduce:transition-none"
                  style={{
                    width: `${pillars.length > 1 ? (activePillar / (pillars.length - 1)) * 100 : 0}%`,
                  }}
                />
                <div
                  className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.8)] transition-[left] duration-700 ease-in-out motion-reduce:transition-none"
                  style={{
                    left: `${pillars.length > 1 ? (activePillar / (pillars.length - 1)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div className="relative z-10 grid gap-8 md:grid-cols-3 md:gap-6">
              {pillars.map((pillar, index) => {
                const isActive = activePillar === index;
                const Icon = pillar.Icon;
                const BulletIcon = pillar.BulletIcon;
                return (
                  <div
                    key={pillar.step}
                    role="button"
                    tabIndex={0}
                    aria-pressed={isActive}
                    aria-label={`${pillar.title}, pillar ${pillar.step} of 3. ${isActive ? "Highlighted." : "Not highlighted. Press Enter or Space to focus."}`}
                    onClick={() => setActivePillar(index)}
                    onKeyDown={(e) => onPillarKeyDown(index, e)}
                    className={cn(
                      "relative flex cursor-pointer flex-col rounded-2xl outline-none transition-all duration-300",
                      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      isActive
                        ? "scale-[1.01] md:scale-[1.02]"
                        : "opacity-[0.92] hover:opacity-100",
                    )}
                  >
                    <div className="relative z-10 mb-[-1.75rem] flex justify-center">
                      <div
                        className={cn(
                          "flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg ring-4 ring-background transition-transform duration-300",
                          isActive && "scale-105",
                        )}
                      >
                        <span className="text-xl font-bold">{pillar.step}</span>
                      </div>
                    </div>
                    <Card
                      variant="glass"
                      className={cn(
                        "flex-1 pt-10",
                        pillar.cardClass,
                        isActive
                          ? "border-primary/35 shadow-lg ring-2 ring-primary/40"
                          : "hover:ring-1 hover:ring-primary/15",
                      )}
                    >
                      <CardHeader>
                        <div className="mb-2 flex items-center gap-2">
                          <Icon className="h-6 w-6 text-primary" aria-hidden />
                          <CardTitle className="gradient-text text-xl">{pillar.title}</CardTitle>
                        </div>
                        <CardDescription className="text-base leading-relaxed">
                          {pillar.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
                          {pillar.bullets.map((line, bi) => (
                            <li key={`${pillar.step}-${bi}`} className="flex gap-2">
                              <BulletIcon className="mt-0.5 h-4 w-4 shrink-0 text-secondary" aria-hidden />
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                        {pillar.footerLink ? (
                          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Read The Full Story{" "}
                            <Link
                              href={pillar.footerLink.href}
                              className="font-medium text-primary underline-offset-4 hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {pillar.footerLink.label}
                            </Link>
                            .
                          </p>
                        ) : null}
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>

          <section
            className="mx-auto mt-20 max-w-5xl scroll-mt-24"
            aria-labelledby="test-ui-demo-heading"
          >
            <h2 id="test-ui-demo-heading" className="mb-3 text-center text-2xl font-bold tracking-tight gradient-text sm:text-3xl">
              Test Mode · See The Interface Before You Subscribe
            </h2>
            <p className="mx-auto mb-4 max-w-3xl text-center text-base leading-relaxed text-muted-foreground">
              Our{" "}
              <strong className="font-semibold text-foreground">
                {specialty.specialtyName.toLowerCase()} mock exam
              </strong>{" "}
              experience is built around the same rhythm you will use on test day with a dedicated{" "}
              <strong className="font-semibold text-foreground">question navigator</strong>,{" "}
              <strong className="font-semibold text-foreground">flagging</strong> for review, clear{" "}
              <strong className="font-semibold text-foreground">multiple-choice</strong> rows, and
              immediate <strong className="font-semibold text-foreground">explanations</strong> after
              you commit to an answer. The interactive frame below is a{" "}
              <strong className="font-semibold text-foreground">static marketing demo</strong>, sample
              stems only, so you can preview layout and controls without logging in.
            </p>
            <p className="mx-auto mb-8 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
              In production, timed sessions pull from your selected sections and bookmarks. You can{" "}
              <strong className="font-semibold text-foreground">save and exit</strong>, resume later,
              and finish with a detailed breakdown. Search engines can index this page to surface how
              Atlas Review approaches <strong className="font-semibold text-foreground">in-service</strong>,{" "}
              <strong className="font-semibold text-foreground">board-style</strong>, and{" "}
              <strong className="font-semibold text-foreground">maintenance-of-certification</strong>{" "}
              study workflows, not just a feature list.
            </p>
            <AtlasWayTestModeDemo />
            <p className="mt-6 text-center text-xs text-muted-foreground">
              Demo questions are original illustrative vignettes for this marketing page only. They are
              not copied from scored examinations and do not replace your program’s curriculum.
            </p>
          </section>

          <section
            className="mx-auto mt-16 max-w-3xl rounded-2xl border bg-muted/40 p-8 text-center"
            aria-label="How the three pillars connect"
          >
            <h2 className="mb-3 text-lg font-semibold text-foreground">How It Flows In Practice</h2>
            <p className="leading-relaxed text-muted-foreground">
              {isOrtho ? (
                <>
                  Most learners rotate through the bank for depth, schedule regular mock exams for
                  stamina, and clear their spaced-repetition queue so weak topics keep resurfacing until
                  they stick. You can emphasize any pillar week to week. Atlas is built so all three
                  reinforce each other instead of fighting for attention.
                </>
              ) : (
                <>
                  Most learners rotate through the bank for depth, schedule regular mock exams for
                  stamina, and use the oral board coach when it is time to translate what they know into
                  how they speak. You can emphasize any pillar week to week. Atlas is built so all three
                  reinforce each other instead of fighting for attention.
                </>
              )}
            </p>
          </section>
        </div>
      </main>
    </MarketingShell>
  );
}

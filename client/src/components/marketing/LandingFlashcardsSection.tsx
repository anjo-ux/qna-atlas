import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, FlipVertical2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { cn } from "@/lib/utils";
import { parseQuestionForReview } from "@/utils/parseQuestionForReview";
import type { Question } from "@/types/question";
import type { SpecialtyId } from "@shared/specialties";
import type { SVGProps } from "react";

function MissToDeckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <rect x="4" y="8" width="16" height="18" rx="3" className="stroke-current" strokeWidth="1.75" />
      <rect x="10" y="5" width="16" height="18" rx="3" className="fill-current/10 stroke-current" strokeWidth="1.75" />
      <path d="M15 12.5v7M11.5 16h7" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function FlipRateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <path
        d="M8 10.5c0-1.4 1.1-2.5 2.5-2.5H18"
        className="stroke-current"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M15.5 5.5 18.5 8 15.5 10.5" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="6" y="12" width="14" height="14" rx="3" className="stroke-current" strokeWidth="1.75" />
      <path d="M24 21.5c0 1.4-1.1 2.5-2.5 2.5H14" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M16.5 26.5 13.5 24 16.5 21.5" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="13" cy="19" r="1.4" className="fill-current" />
      <circle cx="17" cy="19" r="1.4" className="fill-current opacity-50" />
    </svg>
  );
}

function DueTodayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <rect x="5" y="7" width="22" height="20" rx="3.5" className="stroke-current" strokeWidth="1.75" />
      <path d="M5 13h22" className="stroke-current" strokeWidth="1.75" />
      <path d="M11 5v4M21 5v4" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M11.5 20.5 14.2 23l6.3-7" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TopicMapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <circle cx="8" cy="8" r="3" className="stroke-current" strokeWidth="1.75" />
      <circle cx="24" cy="8" r="3" className="stroke-current" strokeWidth="1.75" />
      <circle cx="16" cy="24" r="3.5" className="fill-current/10 stroke-current" strokeWidth="1.75" />
      <path d="M10.6 10.2 14.2 21.2M21.4 10.2 17.8 21.2M11 8h10" className="stroke-current" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** Stable “random” pick from the 20-question preview set, one per specialty. */
const PREVIEW_CARD_INDEX: Record<SpecialtyId, number> = {
  prs: 8,
  ortho: 3,
};

function clip(text: string, max: number) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max).replace(/\s+\S*$/, "")}…`;
}

function FlashcardPreviewDemo() {
  const specialty = useHostSpecialty();
  const [flipped, setFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);

  const { data: questions = [], isLoading, isError } = useQuery<Question[]>({
    queryKey: ["/api/preview/questions", specialty.id, "flashcard-demo"],
    queryFn: async () => {
      const res = await fetch(`/api/preview/questions?specialtyId=${specialty.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to load preview questions.");
      return res.json();
    },
    staleTime: 60_000,
  });

  const question = useMemo(() => {
    if (!questions.length) return null;
    const idx = PREVIEW_CARD_INDEX[specialty.id] ?? 0;
    return questions[idx % questions.length];
  }, [questions, specialty.id]);

  const parsed = useMemo(() => (question ? parseQuestionForReview(question) : null), [question]);

  const resetDemo = () => {
    setFlipped(false);
    setSelectedAnswer(null);
    setConfidence(null);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[14rem] flex-1 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError || !question || !parsed) {
    return (
      <div className="flex min-h-[14rem] flex-1 items-center justify-center rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 text-center text-xs text-muted-foreground">
        Preview card unavailable. Open the sample test to try flashcards in the app.
      </div>
    );
  }

  const choices = parsed.choices.slice(0, 4);
  const hasChoices = choices.length > 0;
  const explanation = clip(question.answer.replace(/^\s*[A-F]\)\s*/, ""), 220);
  const isCorrect =
    hasChoices && selectedAnswer && parsed.correctAnswer
      ? selectedAnswer.toUpperCase() === parsed.correctAnswer
      : null;
  const canReveal = hasChoices ? !!selectedAnswer : true;

  return (
    <div className="flex min-h-[14rem] flex-1 flex-col rounded-xl border border-border/70 bg-background/90 p-3 shadow-inner">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {question.category}
          {question.subcategory ? ` · ${question.subcategory}` : ""}
        </p>
        <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary">
          Live Preview
        </span>
      </div>

      {!flipped ? (
        <>
          <p className="text-left text-xs font-medium leading-snug text-foreground sm:text-[13px]">
            {clip(parsed.text, 200)}
          </p>
          {hasChoices ? (
            <ul className="mt-2 space-y-1">
              {choices.map((choice) => {
                const selected = selectedAnswer === choice.letter;
                return (
                  <li key={choice.letter}>
                    <button
                      type="button"
                      onClick={() => setSelectedAnswer(choice.letter)}
                      className={cn(
                        "flex w-full items-start gap-1.5 rounded-lg border px-2 py-1.5 text-left text-[11px] leading-snug transition-colors",
                        selected
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border/60 bg-card/80 text-muted-foreground hover:bg-muted/60",
                      )}
                    >
                      <span
                        className={cn(
                          "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                          selected
                            ? "bg-primary text-primary-foreground"
                            : "border border-muted-foreground/25 text-foreground",
                        )}
                      >
                        {choice.letter}
                      </span>
                      <span className="line-clamp-1">{choice.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-left text-[11px] text-muted-foreground">
              Flip to see the explanation.
            </p>
          )}
          <Button
            type="button"
            size="sm"
            className="mt-auto h-8 w-full text-xs"
            disabled={!canReveal}
            onClick={() => setFlipped(true)}
          >
            <FlipVertical2 className="mr-1.5 h-3.5 w-3.5" />
            Show Answer
          </Button>
        </>
      ) : (
        <>
          <div
            className={cn(
              "flex items-center gap-1.5",
              isCorrect === false
                ? "text-red-700 dark:text-red-400"
                : "text-green-700 dark:text-green-400",
            )}
          >
            {isCorrect === false ? (
              <XCircle className="h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            )}
            <span className="text-xs font-semibold">
              {isCorrect === false
                ? `Incorrect — Correct: ${parsed.correctAnswer ?? "—"}`
                : parsed.correctAnswer
                  ? `Correct: ${parsed.correctAnswer}`
                  : "Answer"}
            </span>
          </div>
          <p className="mt-2 line-clamp-4 text-left text-xs leading-relaxed text-muted-foreground">
            {explanation}
          </p>
          <p className="mt-3 text-left text-[10px] font-medium text-foreground">How Confident Were You?</p>
          <div className="mt-1.5 grid grid-cols-6 gap-1">
            {[0, 1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setConfidence(value)}
                className={cn(
                  "h-7 rounded-md border text-[11px] font-medium transition-colors",
                  confidence === value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:bg-muted",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <p className="mt-1 text-left text-[10px] text-muted-foreground">1 = No Idea, 5 = Perfect</p>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 self-start text-[11px] text-muted-foreground hover:text-foreground"
            onClick={resetDemo}
          >
            <RotateCcw className="h-3 w-3" />
            Flip Back
          </button>
        </>
      )}
    </div>
  );
}

const SIDE_FEATURES = [
  {
    title: "Flip, Rate, Reschedule",
    body: "Stem on one side, explanation on the other. Confidence tells Atlas when that card should come back.",
    Icon: FlipRateIcon,
    className: "lg:col-span-2",
  },
  {
    title: "Work What Is Due Today",
    body: "A due queue surfaces cards that are ready now, so you are not rereading what you already own.",
    Icon: DueTodayIcon,
    className: "",
  },
  {
    title: "Stay On The Atlas Map",
    body: "Search and review by section and subsection, the same topic map as the question bank.",
    Icon: TopicMapIcon,
    className: "",
  },
] as const;

type LandingFlashcardsSectionProps = {
  onStart: () => void;
};

export function LandingFlashcardsSection({ onStart }: LandingFlashcardsSectionProps) {
  return (
    <section className="py-6 sm:py-8" aria-labelledby="flashcards-heading">
      <div className="mb-6 max-w-xl sm:mb-8">
        <h2
          id="flashcards-heading"
          className="text-2xl font-bold leading-snug tracking-tight gradient-text sm:text-3xl"
        >
          Flashcard Style Spaced Repetition Included
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Atlas Turns Missed Questions Into A Built-In Review Loop. Same Dashboard, Same Topic
          Map, Scheduled So Weak Items Return Before The Exam Does.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-4 lg:auto-rows-fr">
        <Card
          variant="glass"
          className="flex h-full flex-col gap-3 rounded-2xl border-primary/15 p-5 glow-sm transition-glow hover:glow-primary lg:col-span-2 lg:row-span-2"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <MissToDeckIcon className="h-6 w-6" />
          </div>
          <FlashcardPreviewDemo />
          <div>
            <h3 className="text-base font-semibold leading-snug text-foreground">Misses Feed Your Deck</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Incorrect items move into review on their own. No export, no second pile to maintain.
            </p>
          </div>
        </Card>

        {SIDE_FEATURES.map(({ title, body, Icon, className }) => {
          const isCtaTile = title === "Flip, Rate, Reschedule";
          return (
            <Card
              key={title}
              variant="glass"
            className={cn(
              "hidden h-full flex-col justify-between gap-4 rounded-2xl border-primary/15 p-5 glow-sm transition-glow hover:glow-primary lg:flex",
              className,
            )}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Icon className="h-7 w-7" />
              </div>
              <div className="mt-auto">
                <h3 className="text-base font-semibold leading-snug text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
                {isCtaTile ? (
                  <Button onClick={onStart} className="mt-4 w-fit glow-primary transition-glow">
                    Start Learning
                  </Button>
                ) : null}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

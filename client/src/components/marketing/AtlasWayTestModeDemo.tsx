import { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  MonitorSmartphone,
} from "lucide-react";
import { Link } from "wouter";

type Choice = { letter: string; text: string };

type DemoQuestion = {
  id: string;
  topic: string;
  stem: string;
  choices: Choice[];
  correct: string;
  /** Shown after locking answer. Generic teaching copy, not live bank material */
  explanation: string;
};

const DEMO_QUESTIONS: DemoQuestion[] = [
  {
    id: "demo-1",
    topic: "Breast / Reconstruction (Sample)",
    stem:
      "A 52-year-old patient with BMI 32 and macromastia reports shoulder grooving, intertrigo under the breasts, and chronic neck pain despite physical therapy. She is medically cleared and motivated for reduction mammaplasty. Which principle best guides initial operative planning?",
    choices: [
      { letter: "A", text: "Anchor pattern selection based only on cup size requested by the patient." },
      { letter: "B", text: "Pedicle choice and skin pattern designed around vascular safety, resection weight, and nipple-areola perfusion." },
      { letter: "C", text: "Liposuction alone as first-line treatment for symptomatic macromastia in all cases." },
      { letter: "D", text: "Avoiding any vertical scar component to maximize cosmesis regardless of resection volume." },
    ],
    correct: "B",
    explanation:
      "Symptomatic macromastia planning balances symptom relief with NAC viability and scar pattern. Pedicle geometry, estimated resection weight, and skin-envelope management drive safe, durable outcomes, not cup size alone. Atlas test mode lets you rehearse this style of trade-off thinking under time pressure.",
  },
  {
    id: "demo-2",
    topic: "Hand / Acute Injury (Sample)",
    stem:
      "Twenty-four hours after a sharp glass laceration at the wrist, an awake patient cannot extend the metacarpophalangeal joints of digits 2 through 5 but has intact wrist extension. Which structure is most likely injured at the zone in question?",
    choices: [
      { letter: "A", text: "Median nerve at the carpal tunnel." },
      { letter: "B", text: "Ulnar nerve in Guyon's canal." },
      { letter: "C", text: "Radial nerve deep motor branch in the proximal forearm / posterior interosseous territory." },
      { letter: "D", text: "Extensor indicis proprius tendon only, with all other extensors intact." },
    ],
    correct: "C",
    explanation:
      "Selective loss of digital MCP extension with preserved wrist extension fits a posterior interosseous pattern motor deficit from proximal forearm injury. In Atlas mock exams, stems are written to reward precise anatomic localization, not buzzword matching.",
  },
  {
    id: "demo-3",
    topic: "Ethics / Consent (Sample)",
    stem:
      "A trainee photographs a de-identified operative field for a personal study album without discussing it with the attending or hospital media policy. Which statement most accurately reflects best practice?",
    choices: [
      { letter: "A", text: "De-identification alone always satisfies institutional and ethical requirements." },
      { letter: "B", text: "Photography for any purpose in the OR should follow institutional policy, consent norms, and supervision, even for education." },
      { letter: "C", text: "Educational use exempts trainees from hospital photography policies." },
      { letter: "D", text: "Only photographs that include the face require consent." },
    ],
    correct: "B",
    explanation:
      "Professionalism items appear across sections. Atlas groups them with other high-yield topics so you see how ethics questions read alongside clinical stems in the same testing chrome you will use for in-service and board prep.",
  },
  {
    id: "demo-4",
    topic: "Craniofacial (Sample)",
    stem:
      "During secondary cleft rhinoplasty planning, which pair best describes common goals for nasal deformity correction in the unilateral cleft patient?",
    choices: [
      { letter: "A", text: "Tip projection only, without addressing septal deviation." },
      { letter: "B", text: "Maxillary advancement alone, ignoring nasal valve." },
      { letter: "C", text: "Straightening the dorsal line, rebuilding tip support, and addressing airway / valve issues tied to asymmetric anatomy." },
      { letter: "D", text: "Rhinoplasty should be deferred until adulthood in every case regardless of breathing." },
    ],
    correct: "C",
    explanation:
      "Cleft rhinoplasty balances airway, symmetry, and staged timing. In live Atlas tests, your answer grid, navigator, and flagging behave exactly like this preview. Only the item bank and scoring are tied to your real subscription.",
  },
  {
    id: "demo-5",
    topic: "Lower Extremity / Wound (Sample)",
    stem:
      "A patient with a chronic distal leg ulcer after venous stasis changes is evaluated for flap coverage. Which factor is most critical when deciding between local fasciocutaneous options and free tissue transfer?",
    choices: [
      { letter: "A", text: "Availability of a split-thickness skin graft alone." },
      { letter: "B", text: "Recipient vessel quality, zone of injury, infection burden, and defect geometry." },
      { letter: "C", text: "Patient preference for inpatient versus outpatient surgery only." },
      { letter: "D", text: "Using the smallest flap possible without regard to dead space or dead muscle in the zone." },
    ],
    correct: "B",
    explanation:
      "Lower-extremity reconstruction questions often test algorithm flow with wound biology, infection control, and vascular inflow/outflow before flap taxonomy. Atlas timed tests train you to allocate minutes per item so marathon sessions feel familiar.",
  },
];

type PerQuestion = { selected: string | null; locked: boolean };

function statusFor(q: DemoQuestion, pq: PerQuestion | undefined): "unanswered" | "correct" | "incorrect" {
  if (!pq?.locked) return "unanswered";
  return pq.selected === q.correct ? "correct" : "incorrect";
}

type AtlasWayTestModeDemoProps = {
  /** Tighter layout and no checkout links (for embedding on the home page). */
  compact?: boolean;
};

/**
 * Static marketing preview of Test Mode chrome (not connected to the real question bank or API).
 */
export function AtlasWayTestModeDemo({ compact = false }: AtlasWayTestModeDemoProps) {
  const [index, setIndex] = useState(0);
  const [perQuestion, setPerQuestion] = useState<Record<number, PerQuestion>>({});
  const [flagged, setFlagged] = useState<Set<number>>(() => new Set());

  const q = DEMO_QUESTIONS[index];
  const pq = perQuestion[index] ?? { selected: null, locked: false };
  const answeredCount = useMemo(
    () => DEMO_QUESTIONS.filter((_, i) => perQuestion[i]?.locked).length,
    [perQuestion],
  );

  const setChoice = useCallback((letter: string) => {
    setPerQuestion((prev) => {
      const cur = prev[index] ?? { selected: null, locked: false };
      if (cur.locked) return prev;
      return { ...prev, [index]: { selected: letter, locked: false } };
    });
  }, [index]);

  const lockAnswer = useCallback(() => {
    setPerQuestion((prev) => {
      const cur = prev[index] ?? { selected: null, locked: false };
      if (!cur.selected || cur.locked) return prev;
      return { ...prev, [index]: { selected: cur.selected, locked: true } };
    });
  }, [index]);

  const toggleFlag = useCallback(() => {
    setFlagged((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }, [index]);

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => setIndex((i) => Math.min(DEMO_QUESTIONS.length - 1, i + 1));

  const showResult = pq.locked;

  return (
    <div
      className={cn(
        "mx-auto overflow-hidden rounded-2xl border-2 border-border bg-background ring-1 ring-black/5 dark:ring-white/10",
        compact ? "max-w-none shadow-md" : "max-w-5xl shadow-xl",
      )}
      role="region"
      aria-label="Interactive demonstration of Atlas Review test mode user interface"
    >
      <div className="flex items-center justify-between gap-2 border-b border-primary/20 bg-primary/10 px-3 py-2 sm:px-4">
        <div className="flex items-center gap-2 text-xs font-medium text-primary sm:text-sm">
          <MonitorSmartphone className="h-4 w-4 shrink-0" aria-hidden />
          <span>Sample Test UI · Illustrative Only. Not Your Personal Session Or Score</span>
        </div>
        <div
          className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-background/90 px-2.5 py-1 font-mono text-xs tabular-nums text-muted-foreground sm:flex"
          aria-hidden
        >
          <Clock className="h-3.5 w-3.5" />
          47:12
        </div>
      </div>

      <div
        className={cn(
          "flex flex-col md:flex-row",
          compact
            ? "min-h-[min(17rem,42vh)] md:min-h-[300px]"
            : "min-h-[min(28rem,70vh)] md:min-h-[420px]",
        )}
      >
        {/* Question navigator mirrors Test Mode sidebar */}
        <aside className="flex w-full flex-shrink-0 flex-col border-b border-border bg-muted/30 md:w-36 md:border-b-0 md:border-r">
          <div className="border-b border-border p-3">
            <h3 className="text-sm font-semibold text-foreground">Questions</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {answeredCount} / {DEMO_QUESTIONS.length} Answered (Demo)
            </p>
          </div>
          <div className="grid grid-cols-5 gap-1.5 p-2 md:grid-cols-2">
            {DEMO_QUESTIONS.map((item, i) => {
              const st = statusFor(item, perQuestion[i]);
              const isCurrent = i === index;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn(
                    "relative flex h-9 items-center justify-center rounded text-xs font-semibold transition-all md:h-10",
                    isCurrent && "ring-2 ring-primary ring-offset-1 ring-offset-background md:ring-offset-2",
                    st === "unanswered" && "bg-muted text-muted-foreground hover:bg-muted/80",
                    st === "correct" && "bg-green-500/20 text-green-800 dark:text-green-400",
                    st === "incorrect" && "bg-red-500/20 text-red-800 dark:text-red-400",
                  )}
                >
                  {i + 1}
                  {flagged.has(i) ? (
                    <Flag className="absolute right-0.5 top-0.5 h-2.5 w-2.5 fill-red-500 text-red-500" aria-hidden />
                  ) : null}
                </button>
              );
            })}
          </div>
          <div className="hidden space-y-2 border-t border-border p-3 text-xs md:block">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded bg-green-500/20" aria-hidden />
              <span className="text-muted-foreground">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded bg-red-500/20" aria-hidden />
              <span className="text-muted-foreground">Incorrect</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 rounded bg-muted" aria-hidden />
              <span className="text-muted-foreground">Unanswered</span>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex-shrink-0 border-b border-border bg-accent/5 px-3 py-3 md:px-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold md:text-xl">Test Mode</h3>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Question {index + 1} / {DEMO_QUESTIONS.length} · {q.topic}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 md:gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className={cn(flagged.has(index) && "text-red-500")}
                  onClick={toggleFlag}
                  aria-pressed={flagged.has(index)}
                  title={flagged.has(index) ? "Unflag (Demo)" : "Flag For Review (Demo)"}
                >
                  <Flag className={cn("h-4 w-4", flagged.has(index) && "fill-red-500")} />
                </Button>
                <Button type="button" variant="outline" size="sm" disabled className="hidden sm:inline-flex">
                  Save &amp; Exit
                </Button>
                <Button type="button" size="sm" disabled className="hidden sm:inline-flex">
                  Finish Test
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 md:p-6">
            <Card className="border-border/80 p-4 shadow-sm md:p-6">
              <p className="mb-6 text-sm leading-relaxed text-foreground md:text-base">{q.stem}</p>

              <RadioGroup
                value={pq.selected ?? ""}
                onValueChange={setChoice}
                className="space-y-2.5"
                disabled={pq.locked}
              >
                {q.choices.map((choice) => {
                  const isSelected = pq.selected === choice.letter;
                  const isCorrectChoice = choice.letter === q.correct;
                  const showRed = showResult && isSelected && !isCorrectChoice;
                  const showGreen = showResult && isCorrectChoice;

                  return (
                    <div
                      key={choice.letter}
                      className={cn(
                        "w-full rounded-xl border-2 transition-colors",
                        !showResult && !isSelected && "border-border bg-background hover:bg-accent/[0.04]",
                        !showResult && isSelected && "border-primary bg-primary/5 shadow-sm",
                        showRed && "border-red-500 bg-red-50 dark:border-red-500 dark:bg-red-950/35",
                        showGreen && "border-green-600 bg-green-50 dark:border-green-600 dark:bg-green-950/30",
                        showResult && !showRed && !showGreen && "border-border bg-background",
                      )}
                    >
                      <Label
                        htmlFor={`atlas-demo-${q.id}-${choice.letter}`}
                        className="flex cursor-pointer items-start gap-3 p-3 md:p-4"
                      >
                        <RadioGroupItem
                          value={choice.letter}
                          id={`atlas-demo-${q.id}-${choice.letter}`}
                          className="mt-1"
                        />
                        <span className="text-sm leading-relaxed text-foreground md:text-base">
                          <span className="font-semibold tabular-nums">{choice.letter}.</span>{" "}
                          {choice.text}
                        </span>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>

              {!pq.locked ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    onClick={lockAnswer}
                    disabled={!pq.selected}
                    className="glow-primary sm:w-auto"
                  >
                    Lock In Answer (Demo)
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    In a real session, responses save to your test history. Here nothing is stored.
                  </p>
                </div>
              ) : (
                <div
                  className="mt-6 rounded-xl border border-border bg-muted/40 p-4 text-sm leading-relaxed text-foreground"
                  role="status"
                >
                  <p className="font-semibold text-foreground">Explanation (Sample)</p>
                  <p className="mt-2 text-muted-foreground">{q.explanation}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="flex-shrink-0 border-t border-border bg-accent/5 px-3 py-3 md:px-4">
            <div className="flex items-center justify-between gap-2">
              <Button type="button" variant="outline" size="sm" className="gap-1" onClick={goPrev} disabled={index === 0}>
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              <span className="text-center text-xs text-muted-foreground sm:text-sm">
                Plastic Surgery Mock Exam Interface · Timed Sessions · Question Navigator
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={goNext}
                disabled={index === DEMO_QUESTIONS.length - 1}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {!compact ? (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Ready For The Real Thing?{" "}
                <Link href="/signup" className="font-medium text-primary underline-offset-2 hover:underline">
                  Create Account Now!
                </Link>{" "}
                <Link href="/pricing" className="font-medium text-primary underline-offset-2 hover:underline">
                  (See Pricing)
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

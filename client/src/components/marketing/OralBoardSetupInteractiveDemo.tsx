import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Plus } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

type SessionSetup = {
  specialty: string;
  level: string;
  mode: string;
  focusAreas: string;
  difficultyCurve: string;
  numCases: number;
  scoring: boolean;
  hinting: string;
};

const MOCK_SESSIONS = [
  { id: "demo-1", title: "Ethics Sprint - Sample" },
  { id: "demo-2", title: "6-Case Oral Rehearsal" },
  { id: "demo-3", title: "Hand Fellowship Review" },
] as const;

const DEFAULT_SETUP: SessionSetup = {
  specialty: "Plastic Surgery",
  level: "Fellow",
  mode: "Oral Boards",
  focusAreas: "All",
  difficultyCurve: "Adaptive",
  numCases: 6,
  scoring: true,
  hinting: "Off",
};

type OralBoardSetupInteractiveDemoProps = {
  /** Omits page heading and tightens chrome for embedding on the home page. */
  embedded?: boolean;
};

export function OralBoardSetupInteractiveDemo({ embedded = false }: OralBoardSetupInteractiveDemoProps) {
  const [activeId, setActiveId] = useState<string>(MOCK_SESSIONS[0].id);
  const [sessionSetup, setSessionSetup] = useState<SessionSetup>(DEFAULT_SETUP);

  const demoSurface = (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-purple-50/90 via-background to-pink-50/60",
        "shadow-sm dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-700/60",
        embedded && "max-h-[min(26rem,58vh)] overflow-y-auto rounded-xl sm:max-h-[28rem]",
      )}
    >
      <div
        className={cn(
          "flex flex-col lg:flex-row",
          embedded ? "min-h-0 lg:min-h-[18rem]" : "min-h-[min(28rem,70svh)]",
        )}
      >
          {/* Sidebar mirrors in-app session list */}
          <aside
            className="flex shrink-0 flex-col border-b border-border/50 bg-white/40 dark:bg-slate-900/40 lg:w-56 lg:border-b-0 lg:border-r"
            aria-label="Demo Session List"
          >
            <div className="border-b border-border/40 p-3 dark:border-slate-700/50">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full gap-2"
                disabled
                title="In The Full App, This Starts A New Saved Session"
              >
                <Plus className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                New Session
              </Button>
            </div>
            <div className="flex gap-1 overflow-x-auto p-2 lg:flex-col lg:overflow-x-visible">
              {MOCK_SESSIONS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveId(s.id)}
                  className={cn(
                    "flex min-w-[10rem] shrink-0 rounded-md px-3 py-2.5 text-left text-sm transition-colors lg:min-w-0",
                    activeId === s.id
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-accent/50"
                  )}
                >
                  <span className="block truncate">{s.title}</span>
                </button>
              ))}
            </div>
          </aside>

          {/* Main configure panel */}
          <div className="flex min-h-0 flex-1 flex-col justify-center p-3 sm:p-4 lg:p-5">
            <div className="mx-auto w-full max-w-xl">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-border/40 pb-3 dark:border-slate-700/50">
                <div className="min-w-0">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground">
                    Oral Boards Coach
                  </p>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {MOCK_SESSIONS.find((s) => s.id === activeId)?.title ?? "Untitled Session"}
                  </p>
                </div>
                <span className="rounded-full border border-primary/25 bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Demo Only
                </span>
              </div>

              <Card className="border-white/30 bg-white/55 p-4 backdrop-blur-sm dark:border-slate-700/40 dark:bg-slate-800/55">
                <h3 className="mb-4 text-lg font-semibold text-foreground">
                  Configure Your Session
                </h3>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Specialty/Subspecialty</label>
                  <div className="flex flex-wrap gap-1">
                    {(["Plastic Surgery", "Hand Surgery", "Burn Surgery"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.specialty === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, specialty: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.specialty === opt ? (
                          <Check className="h-3 w-3" aria-hidden />
                        ) : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Level</label>
                  <div className="flex flex-wrap gap-1">
                    {(["MS4", "PGY-1", "PGY-2", "Fellow"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.level === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, level: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.level === opt ? <Check className="h-3 w-3" aria-hidden /> : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Mode</label>
                  <div className="flex flex-wrap gap-1">
                    {(["Oral Boards", "Written Boards", "Case Walkthrough"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.mode === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, mode: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.mode === opt ? <Check className="h-3 w-3" aria-hidden /> : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Focus Areas</label>
                  <div className="flex flex-wrap gap-1">
                    {(["All", "Procedures", "Complications", "Ethics", "Statistics"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.focusAreas === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, focusAreas: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.focusAreas === opt ? (
                          <Check className="h-3 w-3" aria-hidden />
                        ) : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Difficulty Curve</label>
                  <div className="flex flex-wrap gap-1">
                    {(["Steady", "Ramping", "Adaptive"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.difficultyCurve === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, difficultyCurve: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.difficultyCurve === opt ? (
                          <Check className="h-3 w-3" aria-hidden />
                        ) : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Number Of Cases</label>
                  <div className="flex flex-wrap gap-1">
                    {([3, 6, 10, 15] as const).map((num) => (
                      <Button
                        key={num}
                        type="button"
                        variant={sessionSetup.numCases === num ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, numCases: num }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.numCases === num ? <Check className="h-3 w-3" aria-hidden /> : null}
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="mb-1 block text-xs font-medium">Scoring</label>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant={sessionSetup.scoring ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionSetup((p) => ({ ...p, scoring: true }))}
                      className="gap-1 text-xs"
                    >
                      {sessionSetup.scoring ? <Check className="h-3 w-3" aria-hidden /> : null}
                      On
                    </Button>
                    <Button
                      type="button"
                      variant={!sessionSetup.scoring ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSessionSetup((p) => ({ ...p, scoring: false }))}
                      className="gap-1 text-xs"
                    >
                      {!sessionSetup.scoring ? <Check className="h-3 w-3" aria-hidden /> : null}
                      Off
                    </Button>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="mb-1 block text-xs font-medium">Hinting</label>
                  <div className="flex flex-wrap gap-1">
                    {(["Off", "Minimal", "Tiered"] as const).map((opt) => (
                      <Button
                        key={opt}
                        type="button"
                        variant={sessionSetup.hinting === opt ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSessionSetup((p) => ({ ...p, hinting: opt }))}
                        className="gap-1 text-xs"
                      >
                        {sessionSetup.hinting === opt ? <Check className="h-3 w-3" aria-hidden /> : null}
                        {opt}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button asChild className="w-full glow-primary transition-glow" size="default">
                  <Link href="/signup">Create Account Now</Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
  );

  if (embedded) {
    return demoSurface;
  }

  return (
    <section className="mb-14 scroll-mt-24" aria-labelledby="oral-demo-heading">
      <div className="mb-6 space-y-2">
        <h2
          id="oral-demo-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          Interactive Setup Preview
        </h2>
        <p className="max-w-2xl text-sm font-medium leading-relaxed text-muted-foreground sm:text-base">
          Explore The Same Session Controls You Will See Inside Atlas Review. This Preview Runs
          Entirely In Your Browser With No Sign-In, No Coach Connection, And No AI Calls.
        </p>
      </div>
      {demoSurface}
    </section>
  );
}

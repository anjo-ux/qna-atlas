import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { InstitutionalPricingCallout } from "@/components/marketing/InstitutionalPricingCallout";
import { LandingFlashcardsSection } from "@/components/marketing/LandingFlashcardsSection";
import { LandingHomeSurface } from "@/components/marketing/LandingHomeSurface";
import { LandingTopicStudyPreview } from "@/components/marketing/LandingTopicStudyPreview";
import { AtlasWayTestModeDemo } from "@/components/marketing/AtlasWayTestModeDemo";
import { OralBoardSetupInteractiveDemo } from "@/components/marketing/OralBoardSetupInteractiveDemo";
import { SpecialtySubheaderDropdown } from "@/components/SpecialtySubheaderDropdown";
import { HeroSection } from "@/components/ui/hero-section-1";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BookOpen, Check, Mic, Repeat, Timer } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ReactNode, type SVGProps } from "react";
import { Link } from "wouter";
import { PreviewWizard } from "@/components/PreviewWizard";
import { useTheme } from "@/hooks/useTheme";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import atlasLogo from "@assets/atlas_1764093111680.png";
import atlasLogoLight from "@assets/logo_light_1774918799268.png";
import { usePageSeo } from "@/lib/usePageSeo";
import { cn } from "@/lib/utils";

/** Panel + tabs + pointer — reads as a clickable product preview, not a decoration. */
function InteractiveOverviewIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
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
      <rect x="2.5" y="3.5" width="15" height="12.5" rx="2" />
      <path d="M5.5 7h3.25M10.25 7h3.25M15 7h1" />
      <path d="M5.5 10.25h9" />
      <path d="M5.5 13h6.5" />
      <path d="M14.2 14.2 21 21" />
      <path d="m14.2 14.2 2.15 5.35 1.35-1.9 1.9-1.35z" />
    </svg>
  );
}

function handleSignUp() {
  window.location.href = "/signup";
}

const bentoContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const bentoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 10,
    },
  },
};

function getScrollParent(el: HTMLElement | null): Element | null {
  let parent = el?.parentElement ?? null;
  while (parent) {
    const { overflowY } = getComputedStyle(parent);
    if (
      (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") &&
      parent.scrollHeight > parent.clientHeight + 1
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return null;
}

function BentoRevealSection({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    const root = getScrollParent(node);
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { root, threshold: 0.01, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={bentoContainerVariants}
      initial="hidden"
      animate={shown ? "visible" : "hidden"}
    >
      {children}
    </motion.div>
  );
}

export default function Landing() {
  const [showPreviewWizard, setShowPreviewWizard] = useState(false);
  const { resolvedTheme } = useTheme();
  const specialty = useHostSpecialty();
  const isOrtho = specialty.id === "ortho";

  const exploreLinks = useMemo(
    () =>
      [
        { href: "/the-atlas-way", label: "The Atlas Way" },
        { href: "/pricing", label: "Plans & Pricing" },
        ...(!isOrtho ? [{ href: "/oral-boards-coach", label: "Oral Boards Coach" } as const] : []),
        { href: "/about", label: "About Us" },
      ] as const,
    [isOrtho],
  );

  const highlightStats = useMemo(
    () =>
      isOrtho
        ? [
            { icon: BookOpen, value: specialty.marketing.questionCountLabel, label: "Curated Questions" },
            { icon: Timer, value: "Mock Exams", label: "Timed Or Untimed" },
            { icon: Repeat, value: "Spaced Repetition", label: "Retention Built In" },
          ]
        : [
            { icon: BookOpen, value: specialty.marketing.questionCountLabel, label: "Curated Questions" },
            { icon: Timer, value: "Mock Exams", label: "Timed Or Untimed" },
            { icon: Mic, value: "Oral Boards", label: "Coach Ready Practice" },
          ],
    [isOrtho, specialty.marketing.questionCountLabel],
  );

  usePageSeo("/");

  return (
    <MarketingShell hideHeader>
      <PreviewWizard
        open={showPreviewWizard}
        onClose={() => setShowPreviewWizard(false)}
        specialtyOverride={specialty}
        onStart={() => {
          setShowPreviewWizard(false);
          window.location.href = "/preview";
        }}
      />

      <main className="flex min-w-0 flex-col">
        <LandingHomeSurface>
          <HeroSection
            productName={specialty.productName}
            subtitle={specialty.marketing.heroSubtitle}
            logoSrc={resolvedTheme === "dark" ? atlasLogoLight : atlasLogo}
            logoAlt={`${specialty.productName}, ${specialty.specialtyName.toLowerCase()} study platform`}
            onGetStarted={handleSignUp}
            onPreview={() => setShowPreviewWizard(true)}
            specialtyControl={<SpecialtySubheaderDropdown size="hero" align="center" />}
            afterCtas={
              <motion.div
                className="space-y-6"
                variants={bentoContainerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div className="grid gap-3 sm:grid-cols-3" variants={bentoContainerVariants}>
                  {highlightStats.map(({ icon: Icon, value, label }) => (
                    <motion.div
                      key={label}
                      variants={bentoItemVariants}
                      className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-left shadow-sm"
                    >
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight text-foreground">{value}</p>
                        <p className="text-xs leading-snug text-muted-foreground">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                <motion.div variants={bentoItemVariants} className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Explore</p>
                  <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                    {exploreLinks.map(({ href, label }) => (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          "group inline-flex items-center gap-1 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium text-foreground/90 shadow-sm transition-all",
                          "hover:border-primary/35 hover:bg-primary/5 hover:text-primary",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        )}
                      >
                        {label}
                        <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            }
            screenshot={
              <div id="overview" className="relative z-[2] min-w-0 max-w-full">
                <Card variant="glass" className="min-w-0 overflow-hidden border-primary/10">
                  <CardHeader className="space-y-1 px-3 pb-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex items-center gap-2 text-primary">
                      <InteractiveOverviewIcon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                        Interactive Overview
                      </span>
                    </div>
                    <CardTitle className="max-w-full text-balance break-words text-lg font-semibold leading-snug tracking-tight sm:text-2xl">
                      Study The Way Boards Actually Test You
                    </CardTitle>
                    <CardDescription className="text-pretty text-sm leading-relaxed sm:text-base">
                      See How Atlas Supports Your Study Style.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="min-w-0 px-3 pb-4 sm:px-6 sm:pb-6">
                    <Tabs defaultValue="topics" className="w-full min-w-0">
                      <TabsList
                        className={cn(
                          "grid h-auto w-full min-w-0 gap-1 p-1",
                          isOrtho ? "grid-cols-2" : "grid-cols-3",
                        )}
                      >
                        <TabsTrigger
                          value="topics"
                          className="w-full min-w-0 flex-col gap-0.5 whitespace-normal px-1 py-2 text-[10px] leading-tight sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
                        >
                          <BookOpen className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="max-w-full text-balance text-center">Topic Study</span>
                        </TabsTrigger>
                        <TabsTrigger
                          value="exams"
                          className="w-full min-w-0 flex-col gap-0.5 whitespace-normal px-1 py-2 text-[10px] leading-tight sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
                        >
                          <Timer className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                          <span className="max-w-full text-balance text-center">Mock Exams</span>
                        </TabsTrigger>
                        {!isOrtho && (
                          <TabsTrigger
                            value="oral"
                            className="w-full min-w-0 flex-col gap-0.5 whitespace-normal px-1 py-2 text-[10px] leading-tight sm:flex-row sm:gap-2 sm:px-3 sm:py-2.5 sm:text-sm"
                          >
                            <Mic className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                            <span className="max-w-full text-balance text-center">Oral Boards</span>
                          </TabsTrigger>
                        )}
                      </TabsList>
                      <TabsContent
                        value="topics"
                        className="mt-3 min-w-0 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none sm:mt-4 sm:space-y-4 sm:p-4"
                      >
                        <p className="text-pretty">
                          Move Through Sections And Sub-Topics With Immediate Feedback, Deep Explanations, And
                          Bookmarks That Make Weak Areas Impossible To Ignore.
                        </p>
                        <LandingTopicStudyPreview className="mt-1 shadow-sm" />
                        <div className="flex flex-wrap gap-2 pt-1">
                          <Button size="sm" onClick={handleSignUp}>
                            Start Free
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setShowPreviewWizard(true)}>
                            Try Preview
                          </Button>
                        </div>
                      </TabsContent>
                      <TabsContent
                        value="exams"
                        className="mt-3 min-w-0 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none sm:mt-4 sm:space-y-4 sm:p-4"
                      >
                        <p className="text-pretty">
                          Assemble Timed Or Untimed Exams, Simulate Real Pacing, And Revisit Completed Tests
                          Whenever You Want To Close Lingering Gaps.
                        </p>
                        <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 bg-background/80 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
                          <AtlasWayTestModeDemo compact />
                        </div>
                        <div className="pt-1">
                          <Button size="sm" variant="secondary" asChild>
                            <Link href="/pricing">
                              See Plans <ArrowRight className="ml-1 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      </TabsContent>
                      {!isOrtho && (
                        <TabsContent
                          value="oral"
                          className="mt-3 min-w-0 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none sm:mt-4 sm:space-y-4 sm:p-4"
                        >
                          <p className="text-pretty">
                            Practice Judgment Out Loud With Coaching Flows Built For Conversation-Style Exams, Not
                            Just Multiple Choice In Disguise.
                          </p>
                          <div className="min-w-0 overflow-hidden rounded-lg border border-border/70 ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
                            <OralBoardSetupInteractiveDemo embedded />
                          </div>
                          <div className="pt-1">
                            <Button size="sm" variant="secondary" asChild>
                              <Link href="/oral-boards-coach">
                                Explore Oral Coach <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                          </div>
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            }
          />
          <div className="container mx-auto px-4 pb-16 pt-4">
            <BentoRevealSection className="mx-auto max-w-5xl space-y-12">
              <motion.div variants={bentoItemVariants}>
                <LandingFlashcardsSection onStart={handleSignUp} />
              </motion.div>

              <motion.div className="grid gap-6 md:grid-cols-2" variants={bentoContainerVariants}>
                <motion.div className="h-full" variants={bentoItemVariants}>
                  <Card className="h-full rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="gradient-text leading-normal">Comprehensive Learning</CardTitle>
                      <CardDescription className="leading-normal">
                        Organized By Section And Individual Sub-Topics.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          <strong>{specialty.marketing.questionCountBullet}</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          Detailed Explanations For Every Answer.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          Reference Materials And Study Guides With Personalized Notes.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div className="h-full" variants={bentoItemVariants}>
                  <Card className="h-full rounded-2xl shadow-sm">
                    <CardHeader>
                      <CardTitle className="gradient-text leading-normal">Track Your Progress</CardTitle>
                      <CardDescription className="leading-normal">
                        Monitor Mastery Across All Topics And Sections.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          <strong>Spaced Repetition Algorithm To Optimize Learning.</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          Sync Progress Across All Devices.
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-secondary" />
                        <span className="leading-normal text-muted-foreground">
                          Create Mock Exams And Resume Or Review Tests Anytime.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              <motion.div variants={bentoItemVariants}>
                <InstitutionalPricingCallout />
              </motion.div>

              <motion.div variants={bentoItemVariants}>
                <Card className="rounded-2xl shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-primary">Start Your Journey</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="leading-normal text-foreground">
                      Join Surgeons Studying For The {specialty.marketing.examName} And Board Certification.
                      Create An Account To Unlock The Full Learning Experience With Progress Tracking, Custom
                      Tests, And Personalized Recommendations.
                    </p>
                    <Button
                      onClick={handleSignUp}
                      data-testid="button-sign-up"
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create Free Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </BentoRevealSection>
          </div>
        </LandingHomeSurface>
      </main>
    </MarketingShell>
  );
}

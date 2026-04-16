import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { InstitutionalPricingCallout } from "@/components/marketing/InstitutionalPricingCallout";
import { LandingHomeSurface } from "@/components/marketing/LandingHomeSurface";
import { LandingTopicStudyPreview } from "@/components/marketing/LandingTopicStudyPreview";
import { AtlasWayTestModeDemo } from "@/components/marketing/AtlasWayTestModeDemo";
import { OralBoardSetupInteractiveDemo } from "@/components/marketing/OralBoardSetupInteractiveDemo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, BookOpen, Check, Eye, Mic, Sparkles, Timer } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { PreviewWizard } from "@/components/PreviewWizard";
import { useTheme } from "@/hooks/useTheme";
import atlasLogo from "@assets/atlas_1764093111680.png";
import atlasLogoLight from "@assets/logo_light_1774918799268.png";
import { usePageSeo } from "@/lib/usePageSeo";
import { cn } from "@/lib/utils";

function handleLogin() {
  window.location.href = "/login";
}

function handleSignUp() {
  window.location.href = "/signup";
}

const EXPLORE_LINKS = [
  { href: "/the-atlas-way", label: "The Atlas Way" },
  { href: "/pricing", label: "Plans & Pricing" },
  { href: "/oral-boards-coach", label: "Oral Boards Coach" },
  { href: "/about", label: "About Us" },
] as const;

export default function Landing() {
  const [showPreviewWizard, setShowPreviewWizard] = useState(false);
  const { theme } = useTheme();

  usePageSeo({
    title: "Plastic Surgery Atlas Review | Q&A Study Platform",
    description:
      "Master plastic surgery with Atlas Review. 2500+ curated questions, detailed explanations, spaced repetition, mock exams, and oral board-style practice for comprehensive training and board prep.",
  });

  return (
    <MarketingShell>
      <PreviewWizard
        open={showPreviewWizard}
        onClose={() => setShowPreviewWizard(false)}
        onStart={() => {
          setShowPreviewWizard(false);
          window.location.href = "/preview";
        }}
      />

      <main className="flex min-w-0 flex-col">
        <LandingHomeSurface>
          <div className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-4xl space-y-12">
              <div className="space-y-6 text-center">
                <div className="mb-4 flex justify-center">
                  <img
                    src={theme === "dark" ? atlasLogoLight : atlasLogo}
                    alt="Plastic Surgery Atlas"
                    className="h-24 w-24 object-contain drop-shadow-lg transition-transform duration-500 motion-safe:hover:scale-[1.03]"
                  />
                </div>
                <h1 className="text-5xl font-bold leading-tight gradient-text">Plastic Surgery Atlas</h1>
                <p className="text-xl leading-normal text-muted-foreground">
                  Master Comprehensive Plastic Surgery Knowledge Through Interactive Questions, Detailed
                  Explanations, And Structured Learning Paths
                </p>
                <div className="flex justify-center gap-3 pt-4">
                  <Button
                    size="lg"
                    onClick={handleSignUp}
                    data-testid="button-get-started"
                    className="glow-primary transition-glow"
                  >
                    Get Started
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setShowPreviewWizard(true)}
                    data-testid="button-preview"
                    className="transition-glow hover:glow-primary"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { icon: BookOpen, value: "2500+", label: "Curated Questions" },
                  { icon: Timer, value: "Mock Exams", label: "Timed Or Untimed" },
                  { icon: Mic, value: "Oral Boards", label: "Coach Ready Practice" },
                ].map(({ icon: Icon, value, label }) => (
                  <div
                    key={label}
                    className="hover-elevate glass-surface border-glass flex items-center gap-3 rounded-2xl p-4 text-left ring-1 ring-black/[0.04] dark:ring-white/[0.06]"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-primary/15">
                      <Icon className="h-5 w-5" aria-hidden />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold leading-tight text-foreground">{value}</p>
                      <p className="text-xs leading-snug text-muted-foreground">{label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Explore</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {EXPLORE_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "group inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/60 px-3.5 py-1.5 text-sm font-medium text-foreground/90 shadow-sm backdrop-blur-sm transition-all",
                        "hover:border-primary/35 hover:bg-primary/5 hover:text-primary",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                      )}
                    >
                      {label}
                      <ArrowRight className="h-3.5 w-3.5 opacity-60 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  ))}
                </div>
              </div>

              <Card variant="glass" className="overflow-hidden border-primary/10">
                <CardHeader className="space-y-1 pb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Sparkles className="h-5 w-5" aria-hidden />
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Interactive Overview
                    </span>
                  </div>
                  <CardTitle className="text-2xl">Study The Way Boards Actually Test You</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    See How Atlas Supports Your Study Style.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="topics" className="w-full">
                    <TabsList className="grid h-auto w-full grid-cols-1 gap-1 p-1 sm:grid-cols-3">
                      <TabsTrigger value="topics" className="gap-2 py-2.5">
                        <BookOpen className="h-4 w-4 shrink-0" />
                        Topic Study
                      </TabsTrigger>
                      <TabsTrigger value="exams" className="gap-2 py-2.5">
                        <Timer className="h-4 w-4 shrink-0" />
                        Mock Exams
                      </TabsTrigger>
                      <TabsTrigger value="oral" className="gap-2 py-2.5">
                        <Mic className="h-4 w-4 shrink-0" />
                        Oral Boards
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent
                      value="topics"
                      className="mt-4 space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none"
                    >
                      <p>
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
                      className="mt-4 space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none"
                    >
                      <p>
                        Assemble Timed Or Untimed Exams, Simulate Real Pacing, And Revisit Completed Tests
                        Whenever You Want To Close Lingering Gaps.
                      </p>
                      <div className="overflow-hidden rounded-lg border border-border/70 bg-background/80 shadow-inner ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
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
                    <TabsContent
                      value="oral"
                      className="mt-4 space-y-4 rounded-xl border border-border/60 bg-muted/20 p-4 text-left text-sm leading-relaxed text-muted-foreground focus-visible:outline-none"
                    >
                      <p>
                        Practice Judgment Out Loud With Coaching Flows Built For Conversation-Style Exams, Not
                        Just Multiple Choice In Disguise.
                      </p>
                      <div className="overflow-hidden rounded-lg border border-border/70 ring-1 ring-black/[0.04] dark:ring-white/[0.05]">
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
                  </Tabs>
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
              <Card variant="glass" className="glow-primary transition-glow">
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
                      <strong>2500+ Carefully Curated Questions.</strong>
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

              <Card variant="glass" className="glow-accent transition-glow">
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
            </div>

            <InstitutionalPricingCallout />

            <Card className="border-secondary/30 bg-secondary/5">
              <CardHeader>
                <CardTitle className="text-primary">Start Your Journey</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="leading-normal text-foreground">
                  Join Surgeons Studying For In-Service Training Exam And Board Certification. Create
                  An Account To Unlock The Full Learning Experience With Progress Tracking, Custom
                  Tests, And Personalized Recommendations.
                </p>
                <Button onClick={handleSignUp} data-testid="button-sign-up" className="bg-primary hover:bg-primary/90">
                  Create Free Account
                </Button>
              </CardContent>
            </Card>
            </div>
          </div>
        </LandingHomeSurface>
      </main>
    </MarketingShell>
  );
}

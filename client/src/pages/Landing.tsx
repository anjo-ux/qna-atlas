import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Eye } from "lucide-react";
import { useState } from "react";
import { PreviewWizard } from "@/components/PreviewWizard";

function handleLogin() {
  window.location.href = '/login';
}

function handleSignUp() {
  window.location.href = '/signup';
}

export default function Landing() {
  const [showPreviewWizard, setShowPreviewWizard] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <PreviewWizard
        open={showPreviewWizard}
        onClose={() => setShowPreviewWizard(false)}
        onStart={() => {
          setShowPreviewWizard(false);
          window.location.href = '/preview';
        }}
      />

      <header className="sticky top-0 z-50 glass-surface border-glass border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/atlas-logo.png" alt="Plastic Surgery Atlas" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold gradient-text">Atlas Review</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSignUp} data-testid="button-signup-header" variant="outline" className="transition-glow">
              Sign Up
            </Button>
            <Button onClick={handleLogin} data-testid="button-login" className="glow-primary transition-glow">
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-6">
            <div className="flex justify-center mb-4">
              <img src="/atlas-logo.png" alt="Plastic Surgery Atlas" className="w-24 h-24 object-contain drop-shadow-lg" />
            </div>
            <h2 className="text-5xl font-bold gradient-text leading-tight">
              Plastic Surgery Atlas
            </h2>
            <p className="text-xl text-muted-foreground leading-normal">
              Master comprehensive plastic surgery knowledge through interactive questions, detailed explanations, and structured learning paths
            </p>
            <div className="pt-4 flex gap-3 justify-center">
              <Button size="lg" onClick={handleSignUp} data-testid="button-get-started" className="glow-primary transition-glow">
                Get Started
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowPreviewWizard(true)} data-testid="button-preview" className="transition-glow hover:glow-primary">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card variant="glass" className="glow-primary transition-glow">
              <CardHeader>
                <CardTitle className="gradient-text leading-normal">Comprehensive Learning</CardTitle>
                <CardDescription className="leading-normal">
                  Organized by section and individual sub-topics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                    <strong>2500+ carefully curated questions.</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                    Detailed explanations for every answer.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                    Reference materials and study guides with personalized notes.
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass" className="glow-accent transition-glow">
              <CardHeader>
                <CardTitle className="gradient-text leading-normal">Track Your Progress</CardTitle>
                <CardDescription className="leading-normal">
                  Monitor mastery across all topics and sections.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                    <strong>Spaced repetition algorithm to optimize learning.</strong>
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                    Sync progress across all devices.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground leading-normal">
                   Create mock exams and resume or review tests anytime.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-secondary/30 bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-primary">Start Your Journey</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-foreground leading-normal">
                Join surgeons studying for in-service training exam and board certification. Create an account to unlock the full learning experience with progress tracking, custom tests, and personalized recommendations.
              </p>
              <Button onClick={handleSignUp} data-testid="button-sign-up" className="bg-primary hover:bg-primary/90">
                Create Free Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6 bg-muted/30">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          Atlas Review © {new Date().getFullYear()} • Empowering Surgical Education
        </div>
      </footer>
    </div>
  );
}

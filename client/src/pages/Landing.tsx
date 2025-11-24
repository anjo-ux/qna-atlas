import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Check } from "lucide-react";

function handleLogin() {
  window.location.href = '/api/login';
}

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <h1 className="text-xl font-semibold">PSITE Review</h1>
          </div>
          <Button onClick={handleLogin} data-testid="button-login">
            Sign In
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">
              Master Plastic Surgery Knowledge
            </h2>
            <p className="text-xl text-muted-foreground">
              Interactive review platform for the Plastic Surgery In-Training Examination (PSITE)
            </p>
            <div className="pt-4">
              <Button size="lg" onClick={handleLogin} data-testid="button-get-started">
                Get Started
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Track Your Progress</CardTitle>
                <CardDescription>
                  Monitor your performance across all test sessions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    Save your progress across devices
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    View detailed performance analytics
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    Resume tests anytime
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Questions</CardTitle>
                <CardDescription>
                  Comprehensive question bank with detailed explanations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    Filter by sections and subsections
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    Review reference materials
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-5 h-5 text-primary mt-0.5" />
                  <span className="text-muted-foreground">
                    Practice with timed tests
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-primary/5">
            <CardHeader>
              <CardTitle>Why Create an Account?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">
                Sign in to save your test progress, track your performance over time, and access your data from any device. Your progress is automatically saved as you work through questions.
              </p>
              <Button onClick={handleLogin} data-testid="button-sign-up">
                Create Free Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          PSITE Review © {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
}

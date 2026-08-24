import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, BookOpen, Target, TrendingUp, Lock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useSpecialty } from '@/hooks/useSpecialty';
import type { SpecialtyConfig } from '@shared/specialties';

interface PreviewWizardProps {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  /** Landing should pass the host specialty so Ortho home never advertises PRS. */
  specialtyOverride?: SpecialtyConfig;
}

export function PreviewWizard({ open, onClose, onStart, specialtyOverride }: PreviewWizardProps) {
  const [step, setStep] = useState(0);
  const { specialty: activeSpecialty } = useSpecialty();
  const specialty = specialtyOverride ?? activeSpecialty;
  const specialtyLower = specialty.specialtyName.toLowerCase();
  const isOrtho = specialty.id === 'ortho';

  const steps = [
    {
      title: 'Atlas Review Welcome Wizard',
      description: `Your comprehensive ${specialtyLower} knowledge platform.`,
      icon: BookOpen,
      content: (
        <div className="space-y-4">
          <p className="text-foreground">Atlas Review helps you master {specialtyLower} concepts through interactive questions and comprehensive study materials.</p>
          <p className="text-muted-foreground text-sm">This 20-question preview will show you how the platform works.</p>
        </div>
      ),
    },
    {
      title: 'How It Works',
      description: 'Study smarter, not harder',
      icon: Target,
      content: (
        <div className="space-y-3">
          <Card className="rounded-xl p-3 border-l-4 border-l-primary">
            <p className="font-medium text-sm text-foreground">Multiple Choice Questions</p>
            <p className="text-xs text-muted-foreground mt-1">Answer questions to test your knowledge and identify weak areas.</p>
          </Card>
          <Card className="rounded-xl p-3 border-l-4 border-l-chart-1">
            <p className="font-medium text-sm text-foreground">Reference Materials</p>
            <p className="text-xs text-muted-foreground mt-1">Access detailed reference text alongside questions.</p>
          </Card>
          <Card className="rounded-xl p-3 border-l-4 border-l-chart-2">
            <p className="font-medium text-sm text-foreground">Progress Tracking</p>
            <p className="text-xs text-muted-foreground mt-1">Monitor your performance and focus on improvements with spaced repetition, bookmarking, and personlized reviews.</p>
          </Card>
        </div>
      ),
    },
    {
      title: 'Features',
      description: 'Everything you need to succeed.',
      icon: TrendingUp,
      content: (
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Test Mode</p>
              <p className="text-xs text-muted-foreground">Timed and untimed practice tests to simulate exams.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Personalized Repetition</p>
              <p className="text-xs text-muted-foreground">Spaced repetition and bookmark features.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-primary">✓</span>
            </div>
            <div>
              <p className="font-medium text-sm text-foreground">Analytics</p>
              <p className="text-xs text-muted-foreground">Detailed performance analytics by topic.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Start Now?',
      description: 'Try this sample test now.',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <Card className="rounded-xl p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-foreground font-medium">20 Sample Questions</p>
            <p className="text-xs text-muted-foreground mt-2">Experience the full platform with this curated set of questions from all topics.</p>
          </Card>
          <Card className="rounded-xl p-4 bg-accent/5 border-accent/20">
            <p className="text-sm text-foreground font-medium">Sign Up For Full Access</p>
            <p className="text-xs text-muted-foreground mt-2">
              {isOrtho
                ? 'Start your 7-day free trial and access the full Ortho Atlas question bank with mock exams, spaced repetition, and progress tracking. Upgrade to extend your subscription at any time.'
                : 'Start your 7-day free trial and access thousands of questions now, and our unique oral boards review agent. Upgrade to extend your subscription at anytime.'}
            </p>
          </Card>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <DialogTitle>{currentStep.title}</DialogTitle>
          </div>
          <DialogDescription>{currentStep.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {currentStep.content}
        </div>

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1 rounded-xl">
              Back
            </Button>
          )}
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep(step + 1)} className="flex-1 rounded-xl">
              Next <ChevronRight className="ml-2 w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onStart} className="flex-1 rounded-xl">
              Start Preview Test
            </Button>
          )}
        </div>

        <div className="flex gap-1 justify-center mt-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= step ? 'bg-primary w-6' : 'bg-muted w-1.5'
              }`}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

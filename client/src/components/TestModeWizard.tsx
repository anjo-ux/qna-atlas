import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronRight, Play, Zap, BookOpen, BarChart3, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TestModeWizardProps {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
}

export function TestModeWizard({ open, onClose, onContinue }: TestModeWizardProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Test Mode Tutorial',
      description: 'Master the in-service testing experience.',
      icon: Play,
      content: (
        <div className="space-y-4">
          <p className="text-foreground">Test mode helps you practice with realistic exam conditions and track your progress.</p>
          <p className="text-muted-foreground text-sm">Let's walk through the key features to help you get the most out of your study sessions.</p>
        </div>
      ),
    },
    {
      title: 'Navigate Questions',
      description: 'Move through questions easily.',
      icon: ChevronRight,
      content: (
        <div className="space-y-3">
          <Card className="p-3 bg-primary/5 border-primary/20">
            <p className="font-medium text-sm text-foreground">Use Previous/Next Buttons</p>
            <p className="text-xs text-muted-foreground mt-1">Navigate forward and backward through questions at your own pace and save your answers, notes, and highlights.</p>
          </Card>
          <Card className="p-3 bg-accent/5 border-accent/20">
            <p className="font-medium text-sm text-foreground">Question Status Indicators</p>
            <p className="text-xs text-muted-foreground mt-1">Blue Circle = Unanswered, Checkmark = Answered, X = Incorrect</p>
          </Card>
          <Card className="p-3 bg-chart-1/5 border-chart-1/20">
            <p className="font-medium text-sm text-foreground">Navigate</p>
            <p className="text-xs text-muted-foreground mt-1">Click a question number or status indicator to jump directly to it on the left pane.</p>
          </Card>
        </div>
      ),
    },
    {
      title: 'Answering Questions',
      description: 'Mark your response, highlight, and cross-out.',
      icon: Zap,
      content: (
        <div className="space-y-3">
          <Card className="p-3 border-l-4 border-l-primary">
            <p className="font-medium text-sm text-foreground">Cross-Out Answers</p>
            <p className="text-xs text-muted-foreground mt-1">Right click on an answer choice to cross it out.</p>
          </Card>
          <Card className="p-3 border-l-4 border-l-chart-1">
            <p className="font-medium text-sm text-foreground">Submit Your Answer</p>
            <p className="text-xs text-muted-foreground mt-1">Click Submit to record your response, and you'll see if you're correct immediately.</p>
          </Card>
          <Card className="p-3 border-l-4 border-l-chart-2">
            <p className="font-medium text-sm text-foreground">Review Explanations</p>
            <p className="text-xs text-muted-foreground mt-1">After submitting, read the detailed explanation to understand the concept, where you can take notes that persist.</p>
          </Card>
        </div>
      ),
    },
    {
      title: 'Review Results',
      description: 'Track your performance.',
      icon: BarChart3,
      content: (
        <div className="space-y-3">
          <Card className="p-3 bg-success/5 border-success/20">
            <p className="font-medium text-sm text-foreground">View Your Score</p>
            <p className="text-xs text-muted-foreground mt-1">See your total score and accuracy percentage after completing the test with detailed report.</p>
          </Card>
          <Card className="p-3 bg-chart-1/5 border-chart-1/20">
            <p className="font-medium text-sm text-foreground">Review Answers</p>
            <p className="text-xs text-muted-foreground mt-1">Go back through your responses and read explanations for all questions with your notes.</p>
          </Card>
          <Card className="p-3 bg-destructive/5 border-destructive/20">
            <p className="font-medium text-sm text-foreground">Highlighting</p>
            <p className="text-xs text-muted-foreground mt-1">You can highlight in any color and then use the eraser tool to remove highlights one by one as needed, or click clear to remove them all.</p>
          </Card>
        </div>
      ),
    },
    {
      title: 'Resume Anytime',
      description: 'Save your progress and return later.',
      icon: RotateCcw,
      content: (
        <div className="space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/20">
            <p className="text-sm text-foreground font-medium">Tests Auto-Saved</p>
            <p className="text-xs text-muted-foreground mt-2">Your progress is saved automatically, and you can close and come back to resume your test anytime.</p>
          </Card>
          <Card className="p-4 bg-accent/5 border-accent/20">
            <p className="text-sm text-foreground font-medium">Access From Any Device</p>
            <p className="text-xs text-muted-foreground mt-2">Log in from any device and pick up exactly where you left off.</p>
          </Card>
        </div>
      ),
    },
  ];

  const currentStep = steps[step];
  const Icon = currentStep.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleContinue();
    }
  };

  const handleContinue = () => {
    localStorage.setItem('testModeWizardShown', 'true');
    onContinue();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
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
            <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
              Back
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {step < steps.length - 1 ? (
              <>
                Next <ChevronRight className="ml-2 w-4 h-4" />
              </>
            ) : (
              'Start Test'
            )}
          </Button>
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

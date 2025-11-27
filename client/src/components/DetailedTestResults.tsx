import { Section, Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, BarChart3, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionResponse {
  questionId: string;
  sectionId: string;
  subsectionId: string;
  selectedAnswer?: string;
  isCorrect: boolean;
}

interface DetailedTestResultsProps {
  sections: Section[];
  testQuestions: Question[];
  responses: Record<string, QuestionResponse>;
  onBack: () => void;
  onReview: () => void;
}

export function DetailedTestResults({
  sections,
  testQuestions,
  responses,
  onBack,
  onReview,
}: DetailedTestResultsProps) {
  // Calculate section-level statistics
  const sectionStats = new Map<string, { section: Section; correct: number; total: number; questions: Question[] }>();

  // Initialize section stats
  sections.forEach(section => {
    sectionStats.set(section.id, {
      section,
      correct: 0,
      total: 0,
      questions: [],
    });
  });

  // Populate with test questions and responses
  testQuestions.forEach(question => {
    const section = sections.find(s =>
      s.subsections.some(ss => ss.questions.some(q => q.id === question.id))
    );
    if (section) {
      const stats = sectionStats.get(section.id)!;
      stats.questions.push(question);
      stats.total++;

      const response = responses[question.id];
      if (response && response.isCorrect) {
        stats.correct++;
      }
    }
  });

  const totalCorrect = Object.values(responses).filter(r => r.isCorrect).length;
  const totalQuestions = testQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  const filledStats = Array.from(sectionStats.values()).filter(s => s.total > 0);

  return (
    <div className="flex-1 flex flex-col overflow-auto bg-gradient-to-b from-background to-background/50">
      {/* Header */}
      <div className="p-6 border-b border-border bg-accent/5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold mb-2">Test Complete</h1>
              <p className="text-muted-foreground">Detailed performance analysis.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-primary/10 rounded-lg p-4">
            <BarChart3 className="h-6 w-6 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">{percentage}%</p>
              <p className="text-xs text-muted-foreground">{totalCorrect}/{totalQuestions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="p-6 space-y-6 flex-1 overflow-auto">
        <Card variant="glass" className="p-6 border border-primary/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCorrect}</p>
              <p className="text-sm text-muted-foreground mt-1">Correct</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalQuestions - totalCorrect}</p>
              <p className="text-sm text-muted-foreground mt-1">Incorrect</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary">{percentage}%</p>
              <p className="text-sm text-muted-foreground mt-1">Score</p>
            </div>
          </div>
        </Card>

        {/* Section Breakdown */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Individual Section Performance</h2>
          <div className="space-y-3">
            {filledStats.map(({ section, correct, total }) => {
              const sectionPercentage = Math.round((correct / total) * 100);
              return (
                <Card
                  key={section.id}
                  variant="glass"
                  className={cn(
                    'p-4 border transition-colors',
                    sectionPercentage >= 70
                      ? 'border-green-500/20 bg-green-500/5'
                      : sectionPercentage >= 50
                      ? 'border-yellow-500/20 bg-yellow-500/5'
                      : 'border-red-500/20 bg-red-500/5'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{section.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{total} Questions</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-bold">{sectionPercentage}%</p>
                      <p className="text-sm text-muted-foreground">
                        {correct}/{total} Correct
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full transition-all',
                        sectionPercentage >= 70
                          ? 'bg-green-500'
                          : sectionPercentage >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      )}
                      style={{ width: `${sectionPercentage}%` }}
                    />
                  </div>

                  {/* Wrong questions list for this section */}
                  {correct < total && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-semibold text-muted-foreground mb-2">INCORRECT QUESTIONS:</p>
                      <ul className="space-y-2 text-sm">
                        {testQuestions
                          .filter(q => {
                            const response = responses[q.id];
                            return (
                              sections
                                .find(s => s.id === section.id)
                                ?.subsections.some(ss => ss.questions.some(sq => sq.id === q.id)) &&
                              response &&
                              !response.isCorrect
                            );
                          })
                          .map(question => (
                            <li key={question.id} className="flex items-start gap-2 text-muted-foreground">
                              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{question.question.substring(0, 100)}...</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-border bg-accent/5 flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1" data-testid="button-new-test">
          New Test
        </Button>
        <Button onClick={onReview} className="flex-1" data-testid="button-review-test">
          Review Test
        </Button>
      </div>
    </div>
  );
}

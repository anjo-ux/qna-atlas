import { useState, useMemo } from 'react';
import { useSections } from '@/hooks/useSections';
import { Section } from '@/types/question';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { parseQuestionForReview } from '@/utils/parseQuestionForReview';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Lightbulb, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface SpacedRepetitionProps {
  onBack: () => void;
}

type ReviewItem = {
  question: Section['subsections'][0]['questions'][0];
  sectionId: string;
  sectionTitle: string;
  subsectionId: string;
  subsectionTitle: string;
};

export function SpacedRepetitionPage({ onBack }: SpacedRepetitionProps) {
  const { dueQuestions, reviewedQuestionIds, incorrectQuestionIds, isLoading, updateSR, isPending } =
    useSpacedRepetition();
  const { recordResponse } = useQuestionStats();
  const { sections } = useSections();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const dueIds = useMemo(() => new Set((dueQuestions ?? []).map((d) => d.questionId)), [dueQuestions]);
  const reviewedIds = useMemo(
    () => new Set(Array.isArray(reviewedQuestionIds) ? reviewedQuestionIds : []),
    [reviewedQuestionIds]
  );
  const incorrectIds = useMemo(
    () => new Set(Array.isArray(incorrectQuestionIds) ? incorrectQuestionIds : []),
    [incorrectQuestionIds]
  );

  const toReview = useMemo((): ReviewItem[] => {
    if (!sections?.length) return [];

    const pool: ReviewItem[] = [];
    for (const section of sections) {
      const subsections = section?.subsections ?? [];
      for (const subsection of subsections) {
        const questions = subsection?.questions ?? [];
        for (const question of questions) {
          if (!question?.id || !incorrectIds.has(question.id)) continue;
          const isDue = dueIds.has(question.id);
          const neverReviewed = !reviewedIds.has(question.id);
          if (isDue || neverReviewed) {
            pool.push({
              question,
              sectionId: section.id ?? '',
              sectionTitle: section.title ?? '',
              subsectionId: subsection.id ?? '',
              subsectionTitle: subsection.title ?? '',
            });
          }
        }
      }
    }

    const dueOrder = new Map((dueQuestions ?? []).map((d, i) => [d.questionId, i]));
    pool.sort((a, b) => {
      const aDue = dueOrder.get(a.question.id);
      const bDue = dueOrder.get(b.question.id);
      if (aDue !== undefined && bDue !== undefined) return aDue - bDue;
      if (aDue !== undefined) return -1;
      if (bDue !== undefined) return 1;
      return 0;
    });
    return pool;
  }, [sections, dueIds, reviewedIds, incorrectIds, dueQuestions]);

  const filtered = useMemo(() => {
    if (!searchQuery) return toReview;
    const q = searchQuery.toLowerCase();
    return toReview.filter((item) => {
      const questionText = item.question?.question ?? '';
      const answerText = item.question?.answer ?? '';
      return (
        questionText.toLowerCase().includes(q) ||
        answerText.toLowerCase().includes(q) ||
        (item.sectionTitle ?? '').toLowerCase().includes(q) ||
        (item.subsectionTitle ?? '').toLowerCase().includes(q)
      );
    });
  }, [toReview, searchQuery]);

  const current = filtered[currentIndex];
  const parsed = current ? parseQuestionForReview(current.question) : null;
  const hasChoices = (parsed?.choices.length ?? 0) > 0;
  const correctAnswer = parsed?.correctAnswer ?? null;
  const isCorrect =
    hasChoices && selectedAnswer && correctAnswer
      ? selectedAnswer.toUpperCase() === correctAnswer
      : null;

  const canReveal = hasChoices ? !!selectedAnswer : true;

  const handleReveal = () => {
    if (!canReveal || !current) return;
    setFlipped(true);
  };

  const handleConfidence = async (quality: number) => {
    if (!current) return;

    try {
      if (hasChoices && selectedAnswer && correctAnswer) {
        recordResponse({
          questionId: current.question.id,
          sectionId: current.sectionId,
          subsectionId: current.subsectionId,
          selectedAnswer,
          correctAnswer,
          isCorrect: isCorrect ?? false,
        });
      }

      await updateSR(
        current.question.id,
        current.sectionId,
        current.subsectionId,
        quality
      );

      if (currentIndex < filtered.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setFlipped(false);
        setSelectedAnswer(null);
      } else {
        toast.success('Review complete!');
        setCurrentIndex(0);
        setFlipped(false);
        setSelectedAnswer(null);
      }
    } catch (error) {
      toast.error('Failed to save review');
      console.error(error);
    }
  };

  const resetCard = () => {
    setFlipped(false);
    setSelectedAnswer(null);
  };

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-gradient-to-br from-purple-400/20 via-lavender-300/20 to-pink-300/20">
      <div className="p-4 md:p-6 border-b border-border/40 backdrop-blur-sm shrink-0">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              data-testid="button-back-spaced-repetition"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Spaced Repetition</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">To review</p>
            <p className="text-2xl font-bold text-primary">
              {sections.length > 0 ? filtered.length : incorrectIds.size}
            </p>
          </div>
        </div>
        <Input
          type="text"
          placeholder="Search Review Questions"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentIndex(0);
            setFlipped(false);
            setSelectedAnswer(null);
          }}
          className="bg-white/5 border-white/10 backdrop-blur-sm"
          data-testid="input-search-spaced-repetition"
        />
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 flex flex-col">
        {(isLoading || toReview.length === 0 || (filtered.length === 0 && !!searchQuery)) && (
          <div className="flex-1 flex items-center justify-center p-4">
            {isLoading && sections.length === 0 && (
              <div className="text-center space-y-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                <p className="text-muted-foreground">Loading questions...</p>
              </div>
            )}
            {!isLoading && toReview.length === 0 && (
              <Card variant="glass" className="p-8 text-center max-w-2xl">
                <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h2 className="text-xl font-semibold text-foreground mb-2">All Caught Up</h2>
                <p className="text-muted-foreground">
                  {sections.length === 0
                    ? 'Load questions to get started.'
                    : "You haven't missed any questions yet. Answer incorrectly in test or study mode to add them here."}
                </p>
              </Card>
            )}
            {!isLoading && filtered.length === 0 && toReview.length > 0 && searchQuery && (
              <Card variant="glass" className="p-8 text-center max-w-2xl">
                <p className="text-muted-foreground">No questions match your search.</p>
              </Card>
            )}
          </div>
        )}

        {!isLoading && filtered.length > 0 && current && parsed && (
          <div className="max-w-2xl mx-auto w-full flex flex-col flex-1">
            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
              <span>
                {currentIndex + 1} of {filtered.length}
              </span>
              <span>
                {current.sectionTitle} → {current.subsectionTitle}
              </span>
            </div>

            <div className="flex-1 min-h-0 flip-card-root">
              <div className={cn('flip-card-inner', flipped && 'flipped')}>
                {/* Front: question + choices */}
                <div
                  className={cn(
                    'flip-card-face',
                    flipped && 'pointer-events-none'
                  )}
                >
                  <Card variant="glass" className="p-6 h-full flex flex-col">
                    <div className="text-lg font-semibold text-foreground mb-4 flex-1 overflow-auto">
                      <ReactMarkdown
                        skipHtml
                        components={{
                          p: ({ node, ...props }) => <p className="whitespace-pre-wrap mb-2" {...props} />,
                        }}
                      >
                        {parsed.text}
                      </ReactMarkdown>
                    </div>

                    {hasChoices ? (
                      <div className="space-y-2 mt-4">
                        {parsed.choices.map((choice) => (
                          <button
                            key={choice.letter}
                            type="button"
                            onClick={() => setSelectedAnswer(choice.letter)}
                            className={cn(
                              'w-full flex items-start gap-3 p-3 rounded-lg border text-left text-sm transition-colors',
                              selectedAnswer === choice.letter
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:bg-accent/5'
                            )}
                          >
                            <span className="font-semibold shrink-0">{choice.letter}.</span>
                            <ReactMarkdown
                              skipHtml
                              components={{
                                p: ({ node, children, ...props }) => <span {...props}>{children}</span>,
                              }}
                            >
                              {choice.text}
                            </ReactMarkdown>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">No answer choices — reveal to see the answer.</p>
                    )}

                    <div className="mt-6 flex gap-3">
                      {hasChoices && (
                        <Button
                          variant="outline"
                          onClick={handleReveal}
                          disabled={!canReveal}
                          data-testid="button-reveal-answer"
                          className="flex-1"
                        >
                          Reveal answer
                        </Button>
                      )}
                      {!hasChoices && (
                        <Button
                          variant="default"
                          onClick={handleReveal}
                          data-testid="button-reveal-answer"
                          className="flex-1"
                        >
                          Reveal answer
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Back: result + answer + confidence */}
                <div
                  className={cn(
                    'flip-card-face flip-card-back',
                    !flipped && 'pointer-events-none'
                  )}
                >
                  <Card variant="glass" className="p-6 h-full flex flex-col">
                    <div className="flex-1 overflow-auto space-y-4">
                      {hasChoices && isCorrect !== null && (
                        <div
                          className={cn(
                            'p-3 rounded-lg border-l-4 font-semibold',
                            isCorrect
                              ? 'bg-green-500/10 border-green-500 text-green-700 dark:text-green-300'
                              : 'bg-red-500/10 border-red-500 text-red-700 dark:text-red-300'
                          )}
                        >
                          {isCorrect ? (
                            <span className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center gap-2">
                              <XCircle className="h-4 w-4" /> Incorrect
                              {correctAnswer && (
                                <span className="font-normal"> — correct: {correctAnswer}</span>
                              )}
                            </span>
                          )}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-2">Answer</p>
                        <div className="text-foreground text-sm leading-relaxed">
                          <ReactMarkdown
                            skipHtml
                            components={{
                              p: ({ node, ...props }) => <p className="whitespace-pre-wrap my-1" {...props} />,
                            }}
                          >
                            {current.question?.answer ?? ''}
                          </ReactMarkdown>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <p className="text-sm font-medium text-foreground mb-3">How confident were you?</p>
                        <div className="grid grid-cols-3 gap-2">
                          {[0, 1, 2, 3, 4, 5].map((q) => (
                            <Button
                              key={q}
                              variant={q >= 3 ? (q === 5 ? 'default' : 'outline') : q === 0 ? 'destructive' : 'outline'}
                              size="sm"
                              onClick={() => handleConfidence(q)}
                              disabled={isPending}
                              className="h-9"
                              data-testid={`button-confidence-${q}`}
                            >
                              {q}
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          0 = complete blackout, 3 = vague recall, 5 = perfect
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={resetCard}
                      className="mt-4 self-start"
                      data-testid="button-flip-back"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" /> Flip back
                    </Button>
                  </Card>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                  setFlipped(false);
                  setSelectedAnswer(null);
                }}
                disabled={currentIndex === 0}
                data-testid="button-prev"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentIndex(Math.min(filtered.length - 1, currentIndex + 1));
                  setFlipped(false);
                  setSelectedAnswer(null);
                }}
                disabled={currentIndex === filtered.length - 1}
                data-testid="button-next"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

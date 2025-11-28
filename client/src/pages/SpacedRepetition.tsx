import { useState, useEffect, useMemo } from 'react';
import { loadQuestions } from '@/utils/parseQuestions';
import { Section } from '@/types/question';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Brain, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SpacedRepetitionProps {
  onBack: () => void;
}

export function SpacedRepetitionPage({ onBack }: SpacedRepetitionProps) {
  const { dueQuestions, isLoading, updateSR, isPending } = useSpacedRepetition();
  const { recordResponse } = useQuestionStats();
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // Load questions
  useEffect(() => {
    const loadData = async () => {
      try {
        const questionsData = await loadQuestions();
        setSections(questionsData);
      } catch (error) {
        console.error('Error Loading Questions:', error);
      }
    };
    loadData();
  }, []);

  // Build reviewed questions with full details
  const reviewedQuestions = useMemo(() => {
    if (dueQuestions.length === 0 || sections.length === 0) {
      return [];
    }

    const result = [];
    const dueQIds = new Set(dueQuestions.map(d => d.questionId));

    for (const section of sections) {
      for (const subsection of section.subsections) {
        for (const question of subsection.questions) {
          if (dueQIds.has(question.id)) {
            result.push({
              question,
              sectionId: section.id,
              sectionTitle: section.title,
              subsectionId: subsection.id,
              subsectionTitle: subsection.title,
            });
          }
        }
      }
    }

    return result;
  }, [dueQuestions, sections]);

  // Filter by search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return reviewedQuestions;

    return reviewedQuestions.filter(item =>
      item.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subsectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [reviewedQuestions, searchQuery]);

  const handleQualityRating = async (quality: number) => {
    if (currentIndex >= filteredQuestions.length) return;

    const item = filteredQuestions[currentIndex];
    const isCorrect = quality >= 3; // 3-5 is considered correct

    try {
      // Record the response
      recordResponse({
        questionId: item.question.id,
        sectionId: item.sectionId,
        subsectionId: item.subsectionId,
        selectedAnswer: item.question.answer,
        correctAnswer: item.question.answer,
        isCorrect,
      });

      // Update SR data
      await updateSR(
        item.question.id,
        item.sectionId,
        item.subsectionId,
        quality
      );

      toast.success(`Quality rated: ${quality}/5`);

      // Move to next question
      if (currentIndex < filteredQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setShowAnswer(false);
      } else {
        toast.success('All reviews complete! Great work!');
        // Reset to beginning
        setCurrentIndex(0);
        setShowAnswer(false);
      }
    } catch (error) {
      toast.error('Failed to update review data');
      console.error(error);
    }
  };

  const currentQuestion = filteredQuestions[currentIndex];
  const progress = filteredQuestions.length > 0 ? currentIndex + 1 : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-purple-400/20 via-lavender-300/20 to-pink-300/20">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} data-testid="button-back-spaced-repetition">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Spaced Repetition Review</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Due</p>
            <p className="text-2xl font-bold text-primary">{dueQuestions.length}</p>
          </div>
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search questions"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentIndex(0);
            setShowAnswer(false);
          }}
          className="bg-white/5 border-white/10 backdrop-blur-sm"
          data-testid="input-search-spaced-repetition"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6 flex items-center justify-center">
        {isLoading && sections.length === 0 && (
          <div className="text-center space-y-4">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        )}

        {!isLoading && dueQuestions.length === 0 && (
          <Card variant="glass" className="p-8 text-center max-w-2xl">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Questions Due</h2>
            <p className="text-muted-foreground">All your spaced repetition questions are up to date. Keep studying to add more.</p>
          </Card>
        )}

        {!isLoading && filteredQuestions.length === 0 && dueQuestions.length > 0 && searchQuery && (
          <Card variant="glass" className="p-8 text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground">No questions match your search.</p>
          </Card>
        )}

        {!isLoading && filteredQuestions.length > 0 && currentQuestion && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-foreground">Progress</span>
                <span className="text-muted-foreground">
                  {progress} of {filteredQuestions.length}
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(progress / filteredQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Card */}
            <Card variant="glass" className="p-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-3">
                  {currentQuestion.sectionTitle} → {currentQuestion.subsectionTitle}
                </div>
                <div className="text-lg font-semibold text-foreground mb-6">
                  {currentQuestion.question.question}
                </div>

                {/* Answer Section */}
                {showAnswer ? (
                  <div className="bg-accent/10 rounded-lg p-4 space-y-4 border border-accent/30">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-2">Answer:</p>
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-foreground"
                        dangerouslySetInnerHTML={{
                          __html: currentQuestion.question.answer.replace(/\n/g, '<br />'),
                        }}
                      />
                    </div>

                    {/* Quality Rating Buttons */}
                    <div className="space-y-3 pt-4 border-t border-accent/30">
                      <p className="text-sm font-medium text-foreground">How well did you remember?</p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleQualityRating(0)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-0"
                        >
                          <XCircle className="h-4 w-4" />
                          <span className="text-xs">0</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleQualityRating(1)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-1"
                        >
                          <span className="text-xs font-semibold">1</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleQualityRating(2)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-2"
                        >
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-xs">2</span>
                        </Button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleQualityRating(3)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-3"
                        >
                          <span className="text-xs font-semibold">3</span>
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleQualityRating(4)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-4"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs">4</span>
                        </Button>
                        <Button
                          variant="default"
                          onClick={() => handleQualityRating(5)}
                          disabled={isPending}
                          className="flex flex-col items-center gap-1 h-auto py-3"
                          data-testid="button-quality-5"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs">5</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowAnswer(true)}
                    variant="outline"
                    className="w-full"
                    data-testid="button-reveal-answer"
                  >
                    Reveal Answer
                  </Button>
                )}
              </div>
            </Card>

            {/* Navigation */}
            <div className="flex gap-3 justify-between">
              <Button
                onClick={() => {
                  setCurrentIndex(Math.max(0, currentIndex - 1));
                  setShowAnswer(false);
                }}
                disabled={currentIndex === 0}
                variant="outline"
                data-testid="button-previous-question"
              >
                Previous
              </Button>
              <Button
                onClick={() => {
                  setCurrentIndex(Math.min(filteredQuestions.length - 1, currentIndex + 1));
                  setShowAnswer(false);
                }}
                disabled={currentIndex === filteredQuestions.length - 1}
                data-testid="button-next-question"
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

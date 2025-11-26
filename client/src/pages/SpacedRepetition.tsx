import { useState, useEffect } from 'react';
import { loadQuestions } from '@/utils/parseQuestions';
import { Section } from '@/types/question';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Brain } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QuestionCard } from '@/components/QuestionCard';

interface SpacedRepetitionProps {
  onBack: () => void;
}

export function SpacedRepetitionPage({ onBack }: SpacedRepetitionProps) {
  const { dueQuestions, isLoading } = useSpacedRepetition();
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const questionsData = await loadQuestions();
        setSections(questionsData);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };
    loadData();
  }, []);

  // Map due questions to full question objects
  useEffect(() => {
    if (dueQuestions.length === 0 || sections.length === 0) {
      setFilteredQuestions([]);
      return;
    }

    const allQuestions = sections.flatMap(section =>
      section.subsections.flatMap(subsection =>
        subsection.questions.map(q => ({
          ...q,
          sectionId: section.id,
          sectionTitle: section.title,
          subsectionId: subsection.id,
          subsectionTitle: subsection.title,
        }))
      )
    );

    const dueQIds = new Set(dueQuestions.map(d => d.questionId));
    const due = allQuestions.filter(q => dueQIds.has(q.id));

    // Filter by search query
    const filtered = searchQuery
      ? due.filter(q =>
          q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.subsectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : due;

    setFilteredQuestions(filtered);
    setSelectedQuestionIndex(0);
  }, [dueQuestions, sections, searchQuery]);

  const currentQuestion = filteredQuestions[selectedQuestionIndex];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-purple-400/20 via-lavender-300/20 to-pink-300/20">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border/40 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">Spaced Repetition</h1>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Due for Review</p>
            <p className="text-2xl font-bold text-primary">{dueQuestions.length}</p>
          </div>
        </div>

        {/* Search */}
        <Input
          type="text"
          placeholder="Search spaced repetition questions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-white/5 border-white/10 backdrop-blur-sm"
          data-testid="input-search-spaced-repetition"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
              <p className="text-muted-foreground">Loading spaced repetition questions...</p>
            </div>
          </div>
        )}

        {!isLoading && dueQuestions.length === 0 && (
          <Card variant="glass" className="p-8 text-center max-w-2xl mx-auto">
            <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-semibold text-foreground mb-2">No Questions Due</h2>
            <p className="text-muted-foreground">Great job! All your spaced repetition questions are up to date. Keep studying to add more.</p>
          </Card>
        )}

        {!isLoading && filteredQuestions.length > 0 && currentQuestion && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Progress */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{selectedQuestionIndex + 1} of {filteredQuestions.length}</span>
              <div className="w-full max-w-xs bg-secondary rounded-full h-2 mx-4">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{
                    width: `${((selectedQuestionIndex + 1) / filteredQuestions.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Question Card */}
            <div className="space-y-4">
              <Card variant="glass" className="p-6">
                <div className="text-sm text-muted-foreground mb-3">
                  {currentQuestion.sectionTitle} / {currentQuestion.subsectionTitle}
                </div>
                <p className="text-lg font-medium text-foreground mb-6">{currentQuestion.text}</p>
                <div className="space-y-3">
                  {currentQuestion.options.map((option: string, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      data-testid={`button-option-${idx}`}
                    >
                      {String.fromCharCode(65 + idx)}. {option}
                    </Button>
                  ))}
                </div>
              </Card>

              {/* Answer Explanation */}
              {currentQuestion.answerExplanation && (
                <Card variant="glass" className="p-6 border-success/30 bg-success/5">
                  <div className="text-sm font-semibold text-success mb-2">Correct Answer</div>
                  <p className="text-foreground">{currentQuestion.options[currentQuestion.correctAnswer]}</p>
                  {currentQuestion.answerExplanation && (
                    <div className="mt-3 pt-3 border-t border-success/20">
                      <p className="text-xs text-muted-foreground font-semibold mb-2">Explanation</p>
                      <p className="text-sm text-foreground">{currentQuestion.answerExplanation}</p>
                    </div>
                  )}
                </Card>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 justify-between">
              <Button
                onClick={() => setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1))}
                disabled={selectedQuestionIndex === 0}
                variant="outline"
              >
                Previous
              </Button>
              <Button
                onClick={() =>
                  setSelectedQuestionIndex(Math.min(filteredQuestions.length - 1, selectedQuestionIndex + 1))
                }
                disabled={selectedQuestionIndex === filteredQuestions.length - 1}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {!isLoading && searchQuery && filteredQuestions.length === 0 && (
          <Card variant="glass" className="p-8 text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground">No questions match your search.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

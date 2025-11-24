import { useState, useMemo } from 'react';
import { Section, Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { QuestionCard } from '@/components/QuestionCard';
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import { useQuestionStats } from '@/hooks/useQuestionStats';

interface TestModeProps {
  sections: Section[];
  onBack: () => void;
}

type TestState = 'setup' | 'testing' | 'results';

export function TestMode({ sections, onBack }: TestModeProps) {
  const [testState, setTestState] = useState<TestState>('setup');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 40>(10);
  const [selectedSubsections, setSelectedSubsections] = useState<Set<string>>(
    new Set(sections.flatMap(s => s.subsections.map(ss => ss.id)))
  );
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, { answer: string; correct: boolean }>>({});

  const { recordResponse } = useQuestionStats();

  // Get all available questions based on selection
  const availableQuestions = useMemo(() => {
    let questions: Question[] = [];
    
    if (useAllQuestions) {
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          questions.push(...subsection.questions);
        });
      });
    } else {
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          if (selectedSubsections.has(subsection.id)) {
            questions.push(...subsection.questions);
          }
        });
      });
    }
    
    return questions;
  }, [sections, selectedSubsections, useAllQuestions]);

  const handleStartTest = () => {
    if (availableQuestions.length === 0) {
      return;
    }

    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setTestState('testing');
  };

  const handleToggleSubsection = (subsectionId: string) => {
    const newSelected = new Set(selectedSubsections);
    if (newSelected.has(subsectionId)) {
      newSelected.delete(subsectionId);
    } else {
      newSelected.add(subsectionId);
    }
    setSelectedSubsections(newSelected);
  };

  const handleToggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleAnswerSubmit = (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => {
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    setResponses(prev => ({
      ...prev,
      [questionId]: { answer: selectedAnswer, correct: isCorrect }
    }));

    // Find the section and subsection for recording
    for (const section of sections) {
      for (const subsection of section.subsections) {
        if (subsection.questions.some(q => q.id === questionId)) {
          recordResponse({
            questionId,
            sectionId: section.id,
            subsectionId: subsection.id,
            selectedAnswer,
            correctAnswer,
            isCorrect,
          });
          break;
        }
      }
    }

    // Move to next question or finish
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setTestState('results');
    }
  };

  const testResults = useMemo(() => {
    const total = Object.keys(responses).length;
    const correct = Object.values(responses).filter(r => r.correct).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }, [responses]);

  if (testState === 'setup') {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3 mb-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Create Test</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Question Count */}
            <Card className="p-4">
              <h2 className="text-sm font-semibold mb-3">Number of Questions</h2>
              <RadioGroup value={questionCount.toString()} onValueChange={(v) => setQuestionCount(parseInt(v) as any)}>
                <div className="space-y-2">
                  {[10, 20, 30, 40].map(count => (
                    <div key={count} className="flex items-center space-x-2">
                      <RadioGroupItem value={count.toString()} id={`count-${count}`} />
                      <Label htmlFor={`count-${count}`} className="cursor-pointer text-sm">{count} Questions</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </Card>

            {/* Question Source */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold">Select Questions From</h2>
                <div className="flex items-center gap-2">
                  <Label htmlFor="all-select-toggle" className="text-xs font-medium">{useAllQuestions ? 'All' : 'Select'}</Label>
                  <Switch
                    id="all-select-toggle"
                    checked={useAllQuestions}
                    onCheckedChange={setUseAllQuestions}
                  />
                </div>
              </div>

              {useAllQuestions ? (
                <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
                  <p className="font-medium text-foreground text-sm">All Available Questions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Randomly select from all {availableQuestions.length} questions across all sections
                  </p>
                </div>
              ) : (
                <div className="space-y-1 border border-border rounded-lg p-3 bg-muted/30">
                  <div className="space-y-1">
                    {sections.map(section => (
                      <div key={section.id}>
                        <button
                          onClick={() => handleToggleSection(section.id)}
                          className="w-full flex items-center gap-1 p-2 hover:bg-accent/10 rounded transition-colors"
                        >
                          {expandedSections.has(section.id) ? (
                            <ChevronDown className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <ChevronRight className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="font-medium text-xs flex-1 text-left">{section.title}</span>
                          <span className="text-xs text-muted-foreground">
                            {section.subsections.filter(ss => selectedSubsections.has(ss.id)).length} / {section.subsections.length}
                          </span>
                        </button>

                        {expandedSections.has(section.id) && (
                          <div className="ml-3 space-y-1">
                            {section.subsections.map(subsection => (
                              <div key={subsection.id} className="flex items-start space-x-2 p-1">
                                <Checkbox
                                  checked={selectedSubsections.has(subsection.id)}
                                  onCheckedChange={() => handleToggleSubsection(subsection.id)}
                                  id={`subsection-${subsection.id}`}
                                  className="mt-0.5"
                                />
                                <Label htmlFor={`subsection-${subsection.id}`} className="cursor-pointer flex-1 pt-0.5">
                                  <div className="font-medium text-xs">{subsection.title}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {subsection.questions.length} q
                                  </div>
                                </Label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Start Button */}
            <Button
              size="lg"
              onClick={handleStartTest}
              disabled={!useAllQuestions && selectedSubsections.size === 0}
              className="w-full"
            >
              Start Test ({Math.min(questionCount, availableQuestions.length)} questions)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'testing') {
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-4 border-b border-border bg-accent/5">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div>
              <h1 className="text-2xl font-bold">Test Mode</h1>
              <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {testQuestions.length}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">{Math.round((currentQuestionIndex / testQuestions.length) * 100)}%</div>
              <p className="text-xs text-muted-foreground">Progress</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            <QuestionCard
              question={currentQuestion}
              index={currentQuestionIndex}
              sectionId=""
              subsectionId=""
              onAnswerSubmit={handleAnswerSubmit}
            />
          </div>
        </div>
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setTestState('setup')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Test Results</h1>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="text-6xl font-bold text-primary">{testResults.accuracy}%</div>
                <div className="text-2xl font-semibold text-foreground">
                  {testResults.correct} out of {testResults.total} Correct
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Questions</p>
                <p className="text-3xl font-bold">{testResults.total}</p>
              </Card>
              <Card className="p-6 text-center bg-success/10 border-success/20">
                <p className="text-sm text-muted-foreground mb-2">Correct</p>
                <p className="text-3xl font-bold text-success">{testResults.correct}</p>
              </Card>
              <Card className="p-6 text-center bg-destructive/10 border-destructive/20">
                <p className="text-sm text-muted-foreground mb-2">Incorrect</p>
                <p className="text-3xl font-bold text-destructive">{testResults.total - testResults.correct}</p>
              </Card>
            </div>

            <Button onClick={() => setTestState('setup')} className="w-full">
              Create Another Test
            </Button>
            <Button onClick={onBack} variant="outline" className="w-full">
              Back to Study
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

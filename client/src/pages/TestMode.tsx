import { useState, useMemo, useEffect, useRef } from 'react';
import { Section, Question } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { QuestionCard } from '@/components/QuestionCard';
import { TestHistory } from '@/components/TestHistory';
import { TestModeWizard } from '@/components/TestModeWizard';
import { ArrowLeft, ChevronDown, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Check, X, Circle } from 'lucide-react';
import { useQuestionStats, QuestionResponse } from '@/hooks/useQuestionStats';
import { useTestSessions, TestSession } from '@/hooks/useTestSessions';
import { cn } from '@/lib/utils';

interface TestModeProps {
  sections: Section[];
  onBack: () => void;
  resumeSessionId?: string;
  previewQuestions?: Question[];
  isPreview?: boolean;
}

type TestState = 'setup' | 'testing' | 'results';

export function TestMode({ sections, onBack, resumeSessionId, previewQuestions, isPreview }: TestModeProps) {
  const [testState, setTestState] = useState<TestState>('setup');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 40>(10);
  const [selectedSubsections, setSelectedSubsections] = useState<Set<string>>(
    new Set(sections.flatMap(s => s.subsections.map(ss => ss.id)))
  );
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [showTestWizard, setShowTestWizard] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(true);
  const hasResumedRef = useRef(false);

  const { recordResponse } = useQuestionStats();
  const { createSession, updateSession, completeSession, getInProgressSessions, getCompletedSessions, deleteSession, sessions } = useTestSessions();

  // For preview mode, use provided questions directly, skip setup
  useEffect(() => {
    if (isPreview && previewQuestions && previewQuestions.length > 0 && testState === 'setup') {
      setTestQuestions(previewQuestions);
      setTestState('testing');
    }
  }, [isPreview, previewQuestions, testState]);

  // Get all available questions based on selection
  const availableQuestions = useMemo(() => {
    // If in preview mode, use preview questions
    if (isPreview && previewQuestions && previewQuestions.length > 0) {
      return previewQuestions;
    }

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
  }, [sections, selectedSubsections, useAllQuestions, isPreview, previewQuestions]);

  const handleStartTest = async () => {
    if (availableQuestions.length === 0) {
      return;
    }

    // Check if user has seen test mode wizard
    const hasSeenWizard = localStorage.getItem('testModeWizardShown');
    if (!hasSeenWizard && !isPreview) {
      setShowTestWizard(true);
      return;
    }

    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    // Create test session
    const session = await createSession(
      questionCount,
      Array.from(selectedSubsections),
      useAllQuestions,
      selected
    );
    
    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setCurrentSession(session);
    setTestState('testing');
  };

  const handleResumeTest = (session: TestSession) => {
    // Restore test state
    setTestQuestions(session.questions);
    setCurrentQuestionIndex(session.currentQuestionIndex);
    setResponses(session.responses);
    setCurrentSession(session);
    
    // Restore configuration
    setQuestionCount(session.questionCount as 10 | 20 | 30 | 40);
    setUseAllQuestions(session.useAllQuestions);
    setSelectedSubsections(new Set(session.selectedSectionIds));
    
    setTestState('testing');
  };

  // Auto-resume if resumeSessionId is provided
  useEffect(() => {
    // Only auto-resume once and only if sessions have been loaded from localStorage
    if (resumeSessionId && sessions.length >= 0 && !hasResumedRef.current) {
      const session = sessions.find(s => s.id === resumeSessionId);
      if (session && session.status === 'in-progress') {
        hasResumedRef.current = true;
        handleResumeTest(session);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeSessionId, sessions]);

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
    // Find the section and subsection for this question
    for (const section of sections) {
      for (const subsection of section.subsections) {
        if (subsection.questions.some(q => q.id === questionId)) {
          const newResponse: QuestionResponse = {
            questionId,
            sectionId: section.id,
            subsectionId: subsection.id,
            selectedAnswer,
            correctAnswer,
            isCorrect,
            timestamp: Date.now()
          };
          
          // Store the response locally and update session with latest state
          setResponses(prev => {
            const updatedResponses = {
              ...prev,
              [questionId]: newResponse
            };
            
            // Update session with the fresh responses
            if (currentSession) {
              updateSession(currentSession.id, {
                responses: updatedResponses
              });
            }
            
            return updatedResponses;
          });
          
          // Record in global stats
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
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      if (currentSession) {
        updateSession(currentSession.id, { currentQuestionIndex: newIndex });
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      if (currentSession) {
        updateSession(currentSession.id, { currentQuestionIndex: newIndex });
      }
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    if (currentSession) {
      updateSession(currentSession.id, { currentQuestionIndex: index });
    }
  };

  const handleFinishTest = () => {
    if (currentSession) {
      completeSession(currentSession.id);
    }
    setTestState('results');
  };

  const handleSaveAndExit = () => {
    // Progress is already saved via updateSession calls as user answers questions
    // Just return to setup to show the test in "Resume" section
    setTestState('setup');
  };

  const getQuestionStatus = (index: number) => {
    const question = testQuestions[index];
    const response = responses[question.id];
    
    if (!response) return 'unanswered';
    return response.isCorrect ? 'correct' : 'incorrect';
  };

  const testResults = useMemo(() => {
    const total = Object.keys(responses).length;
    const correct = Object.values(responses).filter(r => r.isCorrect).length;
    const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { total, correct, accuracy };
  }, [responses]);

  const handleContinueFromWizard = async () => {
    // Shuffle and select random questions
    const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(questionCount, shuffled.length));
    
    // Create test session
    const session = await createSession(
      questionCount,
      Array.from(selectedSubsections),
      useAllQuestions,
      selected
    );
    
    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setCurrentSession(session);
    setTestState('testing');
  };

  if (testState === 'setup') {
    const inProgressSessions = getInProgressSessions();
    const completedSessions = getCompletedSessions();
    
    return (
      <>
        <TestModeWizard
          open={showTestWizard}
          onClose={() => setShowTestWizard(false)}
          onContinue={handleContinueFromWizard}
        />
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
            {/* In Progress Tests */}
            {inProgressSessions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Resume Test</h2>
                <div className={inProgressSessions.length > 3 ? "max-h-64 overflow-y-auto" : ""}>
                  <TestHistory
                    sessions={inProgressSessions}
                    onResume={handleResumeTest}
                    onDelete={deleteSession}
                    maxItems={3}
                  />
                </div>
              </div>
            )}
            
            {/* Completed Tests */}
            {completedSessions.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-foreground">Completed Tests</h2>
                <TestHistory
                  sessions={completedSessions}
                  onResume={handleResumeTest}
                  onDelete={deleteSession}
                />
              </div>
            )}
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
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3">
                  {sections.map(section => (
                    <div key={section.id}>
                      <button
                        onClick={() => handleToggleSection(section.id)}
                        className="w-full flex items-center gap-2 mb-2 hover:opacity-70 transition-opacity"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronDown className="h-4 w-4 flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        )}
                        <Checkbox
                          checked={section.subsections.every(ss => selectedSubsections.has(ss.id))}
                          onCheckedChange={(checked) => {
                            const newSelected = new Set(selectedSubsections);
                            section.subsections.forEach(ss => {
                              if (checked) {
                                newSelected.add(ss.id);
                              } else {
                                newSelected.delete(ss.id);
                              }
                            });
                            setSelectedSubsections(newSelected);
                          }}
                          className="flex-shrink-0"
                        />
                        <span className="font-medium text-sm">{section.title}</span>
                      </button>

                      {expandedSections.has(section.id) && (
                        <div className="grid grid-cols-2 gap-2 ml-6">
                          {section.subsections.map(subsection => (
                            <div key={subsection.id} className="flex items-center gap-2">
                              <Checkbox
                                checked={selectedSubsections.has(subsection.id)}
                                onCheckedChange={() => handleToggleSubsection(subsection.id)}
                                id={`subsection-${subsection.id}`}
                                className="flex-shrink-0"
                              />
                              <Label htmlFor={`subsection-${subsection.id}`} className="cursor-pointer text-xs flex-1">
                                {subsection.title} <span className="text-muted-foreground">({subsection.questions.length})</span>
                              </Label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
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
      </>
    );
  }

  if (testState === 'testing') {
    const currentQuestion = testQuestions[currentQuestionIndex];
    
    return (
      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border bg-accent/5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">Test Mode</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {testQuestions.length}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                  className="md:hidden"
                  data-testid="button-toggle-questions"
                >
                  {showQuestionPanel ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </Button>
                <Button data-testid="button-save-exit" onClick={handleSaveAndExit} variant="outline" size="sm">
                  Save & Exit
                </Button>
                <Button data-testid="button-finish-test" onClick={handleFinishTest} variant="default" size="sm">
                  Finish Test
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-2xl md:max-w-4xl mx-auto">
              <QuestionCard
                key={`${currentQuestion.id}-${currentQuestionIndex}`}
                question={currentQuestion}
                index={currentQuestionIndex}
                sectionId=""
                subsectionId=""
                savedResponse={responses[currentQuestion.id]}
                onAnswerSubmit={handleAnswerSubmit}
                isTestMode={true}
              />
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-t border-border bg-accent/5">
            <div className="max-w-2xl md:max-w-4xl mx-auto flex items-center justify-between gap-2">
              <Button
                data-testid="button-previous-question"
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>
              
              <div className="text-xs sm:text-sm text-muted-foreground text-center">
                Question {currentQuestionIndex + 1} of {testQuestions.length}
              </div>

              <Button
                data-testid="button-next-question"
                onClick={handleNextQuestion}
                disabled={currentQuestionIndex === testQuestions.length - 1}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Question Tracker (Hidden on mobile by default, visible on md+) */}
        <div className={cn(
          "border-l border-border bg-muted/30 flex flex-col transition-all duration-300",
          "w-0 md:w-64 overflow-hidden md:overflow-visible",
          showQuestionPanel && "w-64 fixed md:relative right-0 md:right-auto top-0 md:top-auto h-screen md:h-auto z-40 md:z-auto"
        )}>
          <div className="p-4 border-b border-border min-h-fit">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <h2 className="font-semibold text-sm">Questions</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {Object.keys(responses).length} / {testQuestions.length}
                </p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowQuestionPanel(false)}
                className="md:hidden"
                data-testid="button-close-questions"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-5 gap-2">
              {testQuestions.map((question, index) => {
                const status = getQuestionStatus(index);
                const isCurrent = index === currentQuestionIndex;
                
                return (
                  <button
                    key={question.id}
                    data-testid={`button-question-${index + 1}`}
                    onClick={() => {
                      handleQuestionNavigation(index);
                      // Auto-close on mobile after selection
                      if (window.innerWidth < 768) {
                        setShowQuestionPanel(false);
                      }
                    }}
                    className={cn(
                      "aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all",
                      isCurrent && "ring-2 ring-primary ring-offset-2",
                      status === 'unanswered' && "bg-muted hover:bg-muted/80 text-muted-foreground",
                      status === 'correct' && "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30",
                      status === 'incorrect' && "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30"
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 border-t border-border space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500/20"></div>
              <span className="text-muted-foreground">Correct</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-500/20"></div>
              <span className="text-muted-foreground">Incorrect</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-muted"></div>
              <span className="text-muted-foreground">Unanswered</span>
            </div>
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

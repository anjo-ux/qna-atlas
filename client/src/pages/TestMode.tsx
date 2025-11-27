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
import { DetailedTestResults } from '@/components/DetailedTestResults';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Check, X, Circle, Maximize2, Minimize2 } from 'lucide-react';
import { useQuestionStats, QuestionResponse } from '@/hooks/useQuestionStats';
import { useTestSessions, TestSession } from '@/hooks/useTestSessions';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface TestModeProps {
  sections: Section[];
  onBack: () => void;
  resumeSessionId?: string;
  previewQuestions?: Question[];
  isPreview?: boolean;
}

type TestState = 'setup' | 'testing' | 'results' | 'review';

export function TestMode({ sections, onBack, resumeSessionId, previewQuestions, isPreview }: TestModeProps) {
  const [testState, setTestState] = useState<TestState>('setup');
  const [questionCount, setQuestionCount] = useState<10 | 20 | 30 | 40>(10);
  const [selectedSubsections, setSelectedSubsections] = useState<Set<string>>(
    new Set(sections.flatMap(s => s.subsections.map(ss => ss.id)))
  );
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [useBookmarkedOnly, setUseBookmarkedOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [showTestWizard, setShowTestWizard] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const hasResumedRef = useRef(false);

  const { recordResponse } = useQuestionStats();
  const { createSession, updateSession, completeSession, getInProgressSessions, getCompletedSessions, deleteSession, sessions } = useTestSessions();
  const { bookmarks } = useBookmarks();
  const { isAuthenticated } = useAuth();

  // Helper function to find section and subsection IDs for a question
  const findSectionAndSubsectionForQuestion = (questionId: string): { sectionId: string; subsectionId: string } => {
    for (const section of sections) {
      for (const subsection of section.subsections) {
        if (subsection.questions.some(q => q.id === questionId)) {
          return { sectionId: section.id, subsectionId: subsection.id };
        }
      }
    }
    return { sectionId: '', subsectionId: '' };
  };

  // For preview mode, use provided questions directly, skip setup
  useEffect(() => {
    if (isPreview && previewQuestions && previewQuestions.length > 0 && testState === 'setup') {
      setTestQuestions(previewQuestions);
      setTestState('testing');
    }
  }, [isPreview, previewQuestions, testState]);

  // Load saved responses when test starts
  useEffect(() => {
    const loadSavedResponses = async () => {
      if (isAuthenticated && currentSession && testState === 'testing' && Object.keys(responses).length === 0) {
        try {
          const res = await fetch(`/api/test-sessions/${currentSession.id}/responses`, {
            credentials: 'include',
          });
          if (res.ok) {
            const savedResponses = await res.json();
            const responsesMap: Record<string, QuestionResponse> = {};
            savedResponses.forEach((r: any) => {
              responsesMap[r.questionId] = {
                questionId: r.questionId,
                sectionId: r.sectionId,
                subsectionId: r.subsectionId,
                selectedAnswer: r.selectedAnswer,
                correctAnswer: r.selectedAnswer, // We'll update this from localStorage
                isCorrect: r.isCorrect,
                timestamp: new Date(r.answeredAt).getTime(),
              };
            });
            setResponses(responsesMap);
          }
        } catch (error) {
          console.error('Error loading saved responses:', error);
        }
      }
    };
    loadSavedResponses();
  }, [isAuthenticated, currentSession, testState]);

  // Get all available questions based on selection
  const availableQuestions = useMemo(() => {
    // If in preview mode, use preview questions
    if (isPreview && previewQuestions && previewQuestions.length > 0) {
      return previewQuestions;
    }

    let questions: Question[] = [];
    
    if (useBookmarkedOnly) {
      // Get bookmarked questions only
      const bookmarkedIds = new Set(bookmarks.map(b => b.questionId));
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          questions.push(...subsection.questions.filter(q => bookmarkedIds.has(q.id)));
        });
      });
    } else if (useAllQuestions) {
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
  }, [sections, selectedSubsections, useAllQuestions, useBookmarkedOnly, bookmarks, isPreview, previewQuestions]);

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
    
    setIsReviewMode(false);
    setTestState('testing');
  };

  const handleReviewTest = (session: TestSession) => {
    // Load completed test in read-only review mode
    setTestQuestions(session.questions);
    setCurrentQuestionIndex(0);
    setResponses(session.responses);
    setCurrentSession(session);
    
    // Restore configuration
    setQuestionCount(session.questionCount as 10 | 20 | 30 | 40);
    setUseAllQuestions(session.useAllQuestions);
    setSelectedSubsections(new Set(session.selectedSectionIds));
    
    setIsReviewMode(true);
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

          // Autosave to database if authenticated
          if (isAuthenticated && currentSession) {
            (async () => {
              try {
                await fetch('/api/question-responses', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    testSessionId: currentSession.id,
                    questionId,
                    sectionId: section.id,
                    subsectionId: subsection.id,
                    selectedAnswer,
                    isCorrect,
                  }),
                });
              } catch (error) {
                console.error('Error saving response:', error);
              }
            })();
          }
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
    if (isPreview && !isAuthenticated) {
      window.location.href = '/api/auth';
      return;
    }
    if (currentSession) {
      completeSession(currentSession.id);
    }
    setTestState('results');
  };

  const handleSaveAndExit = () => {
    if (isPreview && !isAuthenticated) {
      window.location.href = '/api/auth';
      return;
    }
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
                  onReview={handleReviewTest}
                  onDelete={deleteSession}
                />
              </div>
            )}
            {/* Question Count */}
            <Card className="p-4">
              <h2 className="text-sm font-semibold mb-3">Total Questions</h2>
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
              <h2 className="text-sm font-semibold mb-4">Select Questions From</h2>

              <div className="space-y-3">
                {/* Bookmarked Option */}
                {bookmarks.length > 0 && (
                  <div
                    className={cn(
                      "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                      useBookmarkedOnly
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:bg-muted/50"
                    )}
                    onClick={() => {
                      setUseBookmarkedOnly(true);
                      setUseAllQuestions(false);
                    }}
                  >
                    <p className="font-medium text-foreground text-sm">Bookmarked Questions</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Test on all {bookmarks.length} bookmarked questions.{bookmarks.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {/* All Questions Option */}
                <div
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                    useAllQuestions && !useBookmarkedOnly
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setUseAllQuestions(true);
                    setUseBookmarkedOnly(false);
                  }}
                >
                  <p className="font-medium text-foreground text-sm">All Available Questions</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Randomly select from all {availableQuestions.length} questions across all sections.
                  </p>
                </div>

                {/* Selected Sections Option */}
                <div
                  className={cn(
                    "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                    !useAllQuestions && !useBookmarkedOnly
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/30 hover:bg-muted/50"
                  )}
                  onClick={() => {
                    setUseAllQuestions(false);
                    setUseBookmarkedOnly(false);
                  }}
                >
                  <p className="font-medium text-foreground text-sm">Select Sections</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Choose specific topics to test from each section.
                  </p>
                </div>
              </div>

              {!useAllQuestions && !useBookmarkedOnly && (
                <div className="border border-border rounded-lg p-4 bg-muted/30 space-y-3 mt-4">
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
              disabled={(!useAllQuestions && !useBookmarkedOnly && selectedSubsections.size === 0) || availableQuestions.length === 0}
              className="w-full"
              data-testid="button-start-test"
            >
              Start Test ({Math.min(questionCount, availableQuestions.length)} Questions)
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
      <div className="flex flex-col h-screen md:flex-row md:h-screen md:overflow-hidden overflow-hidden">
        {/* Question Panel - Top on mobile, Right on desktop */}
        {!isFullscreen && (
        <div className={cn(
          "md:flex md:flex-col md:w-32 md:border-r md:border-border md:bg-muted/30 md:overflow-visible md:flex-shrink-0 md:h-screen",
          "flex flex-col border-b border-border bg-muted/30 w-full flex-shrink-0",
          !showQuestionPanel && "hidden md:flex",
          showQuestionPanel && "flex"
        )}>
          <div className="p-4 border-b border-border">
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
                className="md:hidden flex-shrink-0"
                data-testid="button-close-questions"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2">
            <div className="grid grid-cols-2 gap-2">
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
        )}

        {/* Main Content */}
        <div className={cn("flex flex-col overflow-hidden", isFullscreen ? "w-full" : "flex-1")}>
          <div className="p-3 md:p-4 border-b border-border bg-accent/5 flex-shrink-0">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-bold truncate">Test Mode</h1>
                <p className="text-xs md:text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {testQuestions.length}</p>
              </div>
              <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  data-testid="button-fullscreen-toggle"
                  title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => setShowQuestionPanel(!showQuestionPanel)}
                  className="md:hidden"
                  data-testid="button-toggle-questions"
                >
                  {showQuestionPanel ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                <Button data-testid="button-save-exit" onClick={handleSaveAndExit} variant="outline" size="sm">
                  <span className="hidden md:inline">Save & Exit</span>
                  <span className="md:hidden">Save</span>
                </Button>
                <Button data-testid="button-finish-test" onClick={handleFinishTest} variant="default" size="sm">
                  <span className="hidden md:inline">Finish Test</span>
                  <span className="md:hidden">Done</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-auto flex flex-col justify-center">
            <div className="w-full flex justify-center p-3 md:p-6">
              {(() => {
                const { sectionId, subsectionId } = findSectionAndSubsectionForQuestion(currentQuestion.id);
                return (
                  <QuestionCard
                    key={`${currentQuestion.id}-${currentQuestionIndex}`}
                    question={currentQuestion}
                    index={currentQuestionIndex}
                    sectionId={sectionId}
                    subsectionId={subsectionId}
                    savedResponse={responses[currentQuestion.id]}
                    onAnswerSubmit={handleAnswerSubmit}
                    isTestMode={true}
                  />
                );
              })()}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="p-3 md:p-4 border-t border-border bg-accent/5 flex-shrink-0">
            <div className="w-full flex items-center justify-between gap-2">
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
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <DetailedTestResults
        sections={sections}
        testQuestions={testQuestions}
        responses={responses}
        onBack={() => {
          setTestState('setup');
          setCurrentQuestionIndex(0);
          setResponses({});
          setCurrentSession(null);
          setTestQuestions([]);
        }}
        onReview={() => setIsReviewMode(true)}
      />
    );
  }

  if (testState === 'results' && isReviewMode) {
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
                  {testResults.correct} / {testResults.total} Correct
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Answered</p>
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
              Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

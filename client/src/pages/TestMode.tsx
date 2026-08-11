import { useState, useMemo, useEffect, useRef } from 'react';
import { Section, Question, Subsection } from '@/types/question';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { QuestionCard } from '@/components/QuestionCard';
import { TestHistory } from '@/components/TestHistory';
import { TestModeWizard } from '@/components/TestModeWizard';
import { DetailedTestResults } from '@/components/DetailedTestResults';
import { ArrowLeft, ChevronDown, ChevronUp, ChevronRight, ChevronLeft, ChevronRight as ChevronRightIcon, Check, X, Circle, ChevronDown as ChevronDownIcon, Flag, Info } from 'lucide-react';
import { useQuestionStats, QuestionResponse } from '@/hooks/useQuestionStats';
import { useTestSessions, TestSession } from '@/hooks/useTestSessions';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** Allotted time per question on timed tests (1 minute 10 seconds). */
const TEST_MODE_SECONDS_PER_QUESTION = 70;

function formatCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

interface TestModeProps {
  sections: Section[];
  onBack: () => void;
  resumeSessionId?: string;
  previewQuestions?: Question[];
  isPreview?: boolean;
}

type TestState = 'setup' | 'testing' | 'results' | 'review';

export function TestMode({ sections, onBack, resumeSessionId, previewQuestions, isPreview }: TestModeProps) {
  const startInPreview = Boolean(isPreview && previewQuestions && previewQuestions.length > 0);
  const [testState, setTestState] = useState<TestState>(() => (startInPreview ? 'testing' : 'setup'));
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionCountInput, setQuestionCountInput] = useState<string>('10');
  const [selectedSubsections, setSelectedSubsections] = useState<Set<string>>(new Set());
  const [useAllQuestions, setUseAllQuestions] = useState(true);
  const [useBookmarkedOnly, setUseBookmarkedOnly] = useState(false);
  const [useIncorrectOnly, setUseIncorrectOnly] = useState(false);
  const [showUnansweredOnly, setShowUnansweredOnly] = useState(true);
  const [showUnansweredOnlyInSections, setShowUnansweredOnlyInSections] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  );
  const [testQuestions, setTestQuestions] = useState<Question[]>(() => (startInPreview && previewQuestions ? previewQuestions : []));
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, QuestionResponse>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [currentSession, setCurrentSession] = useState<TestSession | null>(null);
  const [showTestWizard, setShowTestWizard] = useState(false);
  const [showQuestionPanel, setShowQuestionPanel] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [resumeTestsToShow, setResumeTestsToShow] = useState(2);
  const [completedTestsToShow, setCompletedTestsToShow] = useState(5);
  const [expandedResumeTests, setExpandedResumeTests] = useState(true);
  const [expandedCompletedTests, setExpandedCompletedTests] = useState(true);
  const hasResumedRef = useRef(false);
  const finishTestInFlightRef = useRef(false);
  // Preserve the user's intended count when Bookmarks/Incorrect temporarily lower it
  const preferredQuestionCountRef = useRef(10);
  const [timerEnabledForNewTest, setTimerEnabledForNewTest] = useState(false);
  const [timedTestRemainingSeconds, setTimedTestRemainingSeconds] = useState<number | null>(null);
  const timedTestRemainingRef = useRef<number | null>(null);
  timedTestRemainingRef.current = timedTestRemainingSeconds;

  const { recordResponse, getIncorrectQuestionIds: getGlobalIncorrectIds, responses: globalResponses } = useQuestionStats();
  const { createSession, updateSession, completeSession, getInProgressSessions, getCompletedSessions, deleteSession, sessions, saveResponse, isSavingResponse } = useTestSessions();
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

  // Helper function to get count of unanswered questions in a subsection
  const getUnansweredCountForSubsection = (subsection: Subsection, showAll: boolean = false): number => {
    if (showAll) {
      return subsection.questions.length;
    }
    const answeredIds = new Set(globalResponses.map(r => r.questionId));
    return subsection.questions.filter(q => !answeredIds.has(q.id)).length;
  };

  // For preview mode, use provided questions directly, skip setup
  useEffect(() => {
    if (isPreview && previewQuestions && previewQuestions.length > 0 && testState === 'setup') {
      setTestQuestions(previewQuestions);
      setTestState('testing');
    }
  }, [isPreview, previewQuestions, testState]);

  // Load saved responses and flags when test starts
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
          
          // Load flagged questions from session
          if (currentSession.flaggedQuestionIds && currentSession.flaggedQuestionIds.length > 0) {
            setFlaggedQuestions(new Set(currentSession.flaggedQuestionIds));
          }
        } catch (error) {
          console.error('Error loading saved responses:', error);
        }
      }
    };
    loadSavedResponses();
  }, [isAuthenticated, currentSession, testState]);

  // Trigger recalculation whenever globalResponses changes
  useEffect(() => {
    // This effect ensures that the memos recalculate when globalResponses updates
    // This is important because globalResponses loads asynchronously from localStorage
  }, [globalResponses]);

  // Keyboard navigation with arrow keys
  useEffect(() => {
    if (testState !== 'testing') return;
    
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousQuestion();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testState, currentQuestionIndex, testQuestions.length, currentSession]);

  // Calculate count of all unanswered questions (used for display only)
  const allUnansweredCount = useMemo(() => {
    if (isPreview && previewQuestions && previewQuestions.length > 0) {
      return previewQuestions.length;
    }
    const answeredIds = new Set(globalResponses.map(r => r.questionId));
    let count = 0;
    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        count += subsection.questions.filter(q => !answeredIds.has(q.id)).length;
      });
    });
    return count;
  }, [sections, globalResponses, isPreview, previewQuestions]);

  // Calculate count of all questions regardless of answered state
  const allQuestionsCount = useMemo(() => {
    if (isPreview && previewQuestions && previewQuestions.length > 0) {
      return previewQuestions.length;
    }
    let count = 0;
    sections.forEach(section => {
      section.subsections.forEach(subsection => {
        count += subsection.questions.length;
      });
    });
    return count;
  }, [sections, isPreview, previewQuestions]);

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
    } else if (useIncorrectOnly) {
      // Get incorrect questions only
      const incorrectIds = new Set<string>();
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          const ids = getGlobalIncorrectIds(section.id, subsection.id);
          ids.forEach(id => incorrectIds.add(id));
        });
      });
      sections.forEach(section => {
        section.subsections.forEach(subsection => {
          questions.push(...subsection.questions.filter(q => incorrectIds.has(q.id)));
        });
      });
    } else if (useAllQuestions) {
      // Get all questions, optionally filtered by answered state
      if (showUnansweredOnly) {
        // Filter out answered ones from global dashboard (default)
        const answeredIds = new Set(globalResponses.map(r => r.questionId));
        sections.forEach(section => {
          section.subsections.forEach(subsection => {
            questions.push(...subsection.questions.filter(q => !answeredIds.has(q.id)));
          });
        });
      } else {
        // Include all questions regardless of answered state
        sections.forEach(section => {
          section.subsections.forEach(subsection => {
            questions.push(...subsection.questions);
          });
        });
      }
    } else {
      // Get selected sections, optionally filtered by answered state
      if (showUnansweredOnlyInSections) {
        // Filter out answered ones from global dashboard (default)
        const answeredIds = new Set(globalResponses.map(r => r.questionId));
        sections.forEach(section => {
          section.subsections.forEach(subsection => {
            if (selectedSubsections.has(subsection.id)) {
              questions.push(...subsection.questions.filter(q => !answeredIds.has(q.id)));
            }
          });
        });
      } else {
        // Include all questions regardless of answered state
        sections.forEach(section => {
          section.subsections.forEach(subsection => {
            if (selectedSubsections.has(subsection.id)) {
              questions.push(...subsection.questions);
            }
          });
        });
      }
    }
    
    return questions;
  }, [sections, selectedSubsections, useAllQuestions, useBookmarkedOnly, useIncorrectOnly, bookmarks, getGlobalIncorrectIds, isPreview, previewQuestions, globalResponses, showUnansweredOnly, showUnansweredOnlyInSections]);

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
    const questionCountForTimer = selected.length;
    const timerTotalSeconds = questionCountForTimer * TEST_MODE_SECONDS_PER_QUESTION;

    // Create test session
    const session = await createSession(
      questionCount,
      Array.from(selectedSubsections),
      useAllQuestions,
      selected,
      timerEnabledForNewTest && !isPreview
        ? { enabled: true, totalSeconds: timerTotalSeconds }
        : undefined
    );

    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setTimedTestRemainingSeconds(
      session.timerEnabled && session.timerRemainingSeconds != null
        ? session.timerRemainingSeconds
        : null
    );
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
    const count = session.questionCount as 10 | 20 | 30 | 40;
    setQuestionCount(count);
    setQuestionCountInput(String(count));
    preferredQuestionCountRef.current = count;
    setUseAllQuestions(session.useAllQuestions);
    setSelectedSubsections(new Set(session.selectedSectionIds));

    setTimedTestRemainingSeconds(
      session.timerEnabled && session.timerRemainingSeconds != null
        ? session.timerRemainingSeconds
        : null
    );

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
    const count = session.questionCount as 10 | 20 | 30 | 40;
    setQuestionCount(count);
    setQuestionCountInput(String(count));
    preferredQuestionCountRef.current = count;
    setUseAllQuestions(session.useAllQuestions);
    setSelectedSubsections(new Set(session.selectedSectionIds));

    setTimedTestRemainingSeconds(null);

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
                responses: updatedResponses,
                ...timedSessionPatch(),
              });
            }
            
            return updatedResponses;
          });
          
          // Auto-save to database immediately using the mutation
          if (isAuthenticated && currentSession) {
            saveResponse({
              testSessionId: currentSession.id,
              questionId,
              sectionId: section.id,
              subsectionId: subsection.id,
              selectedAnswer,
              correctAnswer,
              isCorrect,
            });
          }
          break;
        }
      }
    }
  };

  const timedSessionPatch = () => {
    if (!currentSession?.timerEnabled) return {};
    const r = timedTestRemainingRef.current;
    return r != null ? { timerRemainingSeconds: r } : {};
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      const newIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(newIndex);
      if (currentSession) {
        updateSession(currentSession.id, {
          currentQuestionIndex: newIndex,
          ...timedSessionPatch(),
        });
      }
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const newIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(newIndex);
      if (currentSession) {
        updateSession(currentSession.id, {
          currentQuestionIndex: newIndex,
          ...timedSessionPatch(),
        });
      }
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
    if (currentSession) {
      updateSession(currentSession.id, {
        currentQuestionIndex: index,
        ...timedSessionPatch(),
      });
    }
  };

  const handleToggleFlag = (questionId: string) => {
    const newFlagged = new Set(flaggedQuestions);
    if (newFlagged.has(questionId)) {
      newFlagged.delete(questionId);
    } else {
      newFlagged.add(questionId);
    }
    setFlaggedQuestions(newFlagged);
    
    // Auto-save flags to session
    if (currentSession) {
      updateSession(currentSession.id, {
        flaggedQuestionIds: Array.from(newFlagged),
        ...timedSessionPatch(),
      });
    }
  };

  const handleFinishTest = async () => {
    if (finishTestInFlightRef.current) return;
    finishTestInFlightRef.current = true;
    try {
    if (isPreview && !isAuthenticated) {
      window.location.href = '/api/auth';
      return;
    }
    
    // Sync all test responses to the general question pool (overwrites existing answers)
    Object.values(responses).forEach(response => {
      recordResponse({
        questionId: response.questionId,
        sectionId: response.sectionId,
        subsectionId: response.subsectionId,
        selectedAnswer: response.selectedAnswer,
        correctAnswer: response.correctAnswer,
        isCorrect: response.isCorrect,
      });
    });
    
    if (currentSession) {
      // Batch save all responses to database for authenticated users BEFORE completing
      if (isAuthenticated && Object.keys(responses).length > 0) {
        try {
          const promises = Object.values(responses).map(response =>
            fetch('/api/question-responses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({
                testSessionId: currentSession.id,
                questionId: response.questionId,
                sectionId: response.sectionId,
                subsectionId: response.subsectionId,
                selectedAnswer: response.selectedAnswer,
                correctAnswer: response.correctAnswer,
                isCorrect: response.isCorrect,
              }),
            })
          );
          
          await Promise.all(promises);
          
          // Invalidate the responses cache so dashboard updates
          queryClient.invalidateQueries({ queryKey: ['/api/question-responses'] });
        } catch (error) {
          console.error('Error saving test responses to database:', error);
        }
      }
      
      // Save flagged questions and mark session complete
      updateSession(currentSession.id, {
        flaggedQuestionIds: Array.from(flaggedQuestions),
        ...(currentSession.timerEnabled && timedTestRemainingRef.current != null
          ? { timerRemainingSeconds: 0 }
          : {}),
      });
      completeSession(currentSession.id);
    }
    setTimedTestRemainingSeconds(null);
    setTestState('results');
    } finally {
      finishTestInFlightRef.current = false;
    }
  };

  const handleFinishTestRef = useRef(handleFinishTest);
  handleFinishTestRef.current = handleFinishTest;

  const handleSaveAndExit = async () => {
    if (isPreview && !isAuthenticated) {
      window.location.href = '/api/auth';
      return;
    }
    
    // Explicitly save all current responses to database before exiting
    if (isAuthenticated && currentSession && Object.keys(responses).length > 0) {
      try {
        // Batch save all responses that haven't been explicitly saved yet
        const promises = Object.values(responses).map(response =>
          fetch('/api/question-responses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              testSessionId: currentSession.id,
              questionId: response.questionId,
              sectionId: response.sectionId,
              subsectionId: response.subsectionId,
              selectedAnswer: response.selectedAnswer,
              correctAnswer: response.correctAnswer,
              isCorrect: response.isCorrect,
            }),
          })
        );
        
        await Promise.all(promises);
        
        // Invalidate the responses cache so dashboard updates
        queryClient.invalidateQueries({ queryKey: ['/api/question-responses'] });
      } catch (error) {
        console.error('Error saving responses on exit:', error);
        // Still exit even if save fails - user data is in local responses
      }
    }
    
    // Also update the session's current question index and flagged questions
    if (currentSession) {
      updateSession(currentSession.id, {
        currentQuestionIndex,
        flaggedQuestionIds: Array.from(flaggedQuestions),
        ...(currentSession.timerEnabled && timedTestRemainingRef.current != null
          ? { timerRemainingSeconds: timedTestRemainingRef.current }
          : {}),
      });
    }

    setTimedTestRemainingSeconds(null);
    setTestState('setup');
  };

  useEffect(() => {
    if (testState !== 'testing' || isReviewMode || isPreview || !currentSession?.timerEnabled) {
      return;
    }
    const id = window.setInterval(() => {
      setTimedTestRemainingSeconds((prev) => {
        if (prev == null || prev <= 0) return prev;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [testState, isReviewMode, isPreview, currentSession?.timerEnabled, currentSession?.id]);

  useEffect(() => {
    if (testState !== 'testing' || isReviewMode || isPreview || !currentSession?.timerEnabled) {
      return;
    }
    if (timedTestRemainingSeconds !== 0) return;
    void handleFinishTestRef.current();
  }, [
    testState,
    isReviewMode,
    isPreview,
    currentSession?.timerEnabled,
    currentSession?.id,
    timedTestRemainingSeconds,
  ]);

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
    const questionCountForTimer = selected.length;
    const timerTotalSeconds = questionCountForTimer * TEST_MODE_SECONDS_PER_QUESTION;

    // Create test session
    const session = await createSession(
      questionCount,
      Array.from(selectedSubsections),
      useAllQuestions,
      selected,
      timerEnabledForNewTest && !isPreview
        ? { enabled: true, totalSeconds: timerTotalSeconds }
        : undefined
    );

    setTestQuestions(selected);
    setCurrentQuestionIndex(0);
    setResponses({});
    setTimedTestRemainingSeconds(
      session.timerEnabled && session.timerRemainingSeconds != null
        ? session.timerRemainingSeconds
        : null
    );
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
          <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
            {/* Left Column: Resume and Completed Tests */}
            <div className="w-full lg:w-1/3 overflow-y-auto order-2 lg:order-1">
              <div className="space-y-6">
                {/* In Progress Tests */}
                <div className="space-y-3">
                  <button
                    onClick={() => setExpandedResumeTests(!expandedResumeTests)}
                    className="w-full flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    {expandedResumeTests ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <h2 className="text-lg font-semibold text-foreground">Resume Test</h2>
                  </button>
                  {expandedResumeTests && (
                    <>
                      {inProgressSessions.length > 0 ? (
                        <>
                          <TestHistory
                            sessions={inProgressSessions.slice(0, resumeTestsToShow)}
                            onResume={handleResumeTest}
                            onDelete={deleteSession}
                            startIndex={1}
                          />
                          {inProgressSessions.length > resumeTestsToShow && (
                            <Button
                              variant="outline"
                              onClick={() => setResumeTestsToShow(prev => prev + 2)}
                              className="w-full"
                            >
                              Load More Tests
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No Pending Tests</p>
                      )}
                    </>
                  )}
                </div>
                
                {/* Completed Tests */}
                <div className="space-y-3">
                  <button
                    onClick={() => setExpandedCompletedTests(!expandedCompletedTests)}
                    className="w-full flex items-center gap-2 hover:opacity-70 transition-opacity"
                  >
                    {expandedCompletedTests ? (
                      <ChevronDown className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
                    )}
                    <h2 className="text-lg font-semibold text-foreground">Completed Tests</h2>
                  </button>
                  {expandedCompletedTests && (
                    <>
                      {completedSessions.length > 0 ? (
                        <>
                          <TestHistory
                            sessions={completedSessions.slice(0, completedTestsToShow)}
                            onReview={handleReviewTest}
                            onDelete={deleteSession}
                            startIndex={1}
                          />
                          {completedSessions.length > completedTestsToShow && (
                            <Button
                              variant="outline"
                              onClick={() => setCompletedTestsToShow(prev => prev + 5)}
                              className="w-full"
                            >
                              Load More Tests
                            </Button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground py-2">No Completed Tests</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Test Creation */}
            <div className="w-full lg:w-2/3 overflow-y-auto pr-6 order-1 lg:order-2">
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-foreground">Test Creation</h2>
                
                {/* Question Count */}
                {(() => {
                  let maxQuestions = 40;
                  let errorMessage = '';

                  // Calculate max based on selected source
                  if (useBookmarkedOnly) {
                    maxQuestions = bookmarks.length;
                  } else if (useIncorrectOnly) {
                    const incorrectIds = new Set<string>();
                    sections.forEach(section => {
                      section.subsections.forEach(subsection => {
                        const ids = getGlobalIncorrectIds(section.id, subsection.id);
                        ids.forEach(id => incorrectIds.add(id));
                      });
                    });
                    maxQuestions = incorrectIds.size;
                  } else if (!useAllQuestions && selectedSubsections.size > 0) {
                    // Selected sections - only apply limit if sections are actually selected, with 40 question max
                    maxQuestions = Math.min(40, availableQuestions.length);
                  }

                  // Determine error state
                  const hasError = questionCount > maxQuestions && (!(!useAllQuestions && selectedSubsections.size === 0));
                  if (hasError) {
                    if (useBookmarkedOnly) {
                      errorMessage = `Max ${maxQuestions} Bookmarked`;
                    } else if (useIncorrectOnly) {
                      errorMessage = `Max ${maxQuestions} Incorrect`;
                    } else {
                      errorMessage = `Max ${maxQuestions} Questions`;
                    }
                  }

                  return (
                    <Card className="p-4">
                      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Label
                            htmlFor="question-count"
                            className="shrink-0 text-sm font-semibold whitespace-nowrap"
                          >
                            Total Questions
                          </Label>
                          <Input
                            id="question-count"
                            type="number"
                            min="1"
                            value={questionCountInput}
                            onChange={(e) => {
                              const raw = e.target.value;
                              setQuestionCountInput(raw);
                              const parsed = parseInt(raw, 10);
                              if (raw !== '' && !Number.isNaN(parsed) && parsed >= 1) {
                                setQuestionCount(parsed);
                                if (!useBookmarkedOnly && !useIncorrectOnly) {
                                  preferredQuestionCountRef.current = parsed;
                                }
                              }
                            }}
                            onBlur={() => {
                              const parsed = parseInt(questionCountInput, 10);
                              if (questionCountInput === '' || Number.isNaN(parsed) || parsed < 1) {
                                setQuestionCount(1);
                                setQuestionCountInput('1');
                                if (!useBookmarkedOnly && !useIncorrectOnly) {
                                  preferredQuestionCountRef.current = 1;
                                }
                              }
                            }}
                            placeholder="00"
                            className={cn('w-24 shrink-0', hasError && 'border-destructive bg-destructive/10')}
                          />
                        </div>
                        {hasError && (
                          <span className="text-xs font-medium text-destructive break-words sm:shrink-0 sm:whitespace-nowrap">
                            {errorMessage}
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })()}

                {!isPreview && (() => {
                  const n = Math.min(questionCount, availableQuestions.length);
                  const allotted = n * TEST_MODE_SECONDS_PER_QUESTION;
                  return (
                    <Card className="p-4">
                      <div className="space-y-3">
                        <div className="flex min-w-0 items-center justify-between gap-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">Timer</span>
                            <Popover>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full touch-manipulation',
                                    'border border-border/80 bg-muted/50 text-muted-foreground',
                                    'transition-colors hover:bg-muted hover:text-foreground active:bg-muted/80',
                                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
                                  )}
                                  aria-label="About timed tests"
                                >
                                  <Info className="h-4 w-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="max-w-xs text-sm leading-relaxed" align="start" side="bottom">
                                When the timer is on, you have 1 minute 10 seconds per question. Pause saves your
                                progress and stops the clock until you resume.
                              </PopoverContent>
                            </Popover>
                          </div>
                          <Switch
                            checked={timerEnabledForNewTest}
                            onCheckedChange={setTimerEnabledForNewTest}
                            className="shrink-0"
                            aria-label="Enable timed test"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {timerEnabledForNewTest
                            ? `Alloted Time: ${formatCountdown(allotted)} · ${n} Question${n === 1 ? '' : 's'} x 1:10`
                            : 'No time limit. You can leave and resume anytime.'}
                        </p>
                      </div>
                    </Card>
                  );
                })()}

              {/* Calculate validation state */}
              {(() => {
                let maxQuestions = 40;
                let hasError = false;

                if (useBookmarkedOnly) {
                  maxQuestions = bookmarks.length;
                } else if (useIncorrectOnly) {
                  const incorrectIds = new Set<string>();
                  sections.forEach(section => {
                    section.subsections.forEach(subsection => {
                      const ids = getGlobalIncorrectIds(section.id, subsection.id);
                      ids.forEach(id => incorrectIds.add(id));
                    });
                  });
                  maxQuestions = incorrectIds.size;
                } else if (!useAllQuestions && selectedSubsections.size > 0) {
                  maxQuestions = Math.min(40, availableQuestions.length);
                }

                hasError = questionCount > maxQuestions && (!(!useAllQuestions && selectedSubsections.size === 0));

                return (
                  <>
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
                              if (!useBookmarkedOnly && !useIncorrectOnly) {
                                preferredQuestionCountRef.current = questionCount;
                              }
                              setUseBookmarkedOnly(true);
                              setUseAllQuestions(false);
                              setUseIncorrectOnly(false);
                              if (bookmarks.length < questionCount) {
                                setQuestionCount(bookmarks.length);
                                setQuestionCountInput(String(bookmarks.length));
                              }
                            }}
                          >
                            <p className="font-medium text-foreground text-sm">Bookmarked Questions</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Test on all {bookmarks.length} bookmarked questions.{bookmarks.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}

                        {/* Incorrect Questions Option */}
                        {(() => {
                          const incorrectIds = new Set<string>();
                          sections.forEach(section => {
                            section.subsections.forEach(subsection => {
                              const ids = getGlobalIncorrectIds(section.id, subsection.id);
                              ids.forEach(id => incorrectIds.add(id));
                            });
                          });
                          return incorrectIds.size > 0 ? (
                            <div
                              className={cn(
                                "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                                useIncorrectOnly
                                  ? "border-primary bg-primary/10"
                                  : "border-border bg-muted/30 hover:bg-muted/50"
                              )}
                              onClick={() => {
                                const incorrectIds = new Set<string>();
                                sections.forEach(section => {
                                  section.subsections.forEach(subsection => {
                                    const ids = getGlobalIncorrectIds(section.id, subsection.id);
                                    ids.forEach(id => incorrectIds.add(id));
                                  });
                                });
                                if (!useBookmarkedOnly && !useIncorrectOnly) {
                                  preferredQuestionCountRef.current = questionCount;
                                }
                                setUseIncorrectOnly(true);
                                setUseAllQuestions(false);
                                setUseBookmarkedOnly(false);
                                if (incorrectIds.size < questionCount) {
                                  setQuestionCount(incorrectIds.size);
                                  setQuestionCountInput(String(incorrectIds.size));
                                }
                              }}
                            >
                              <p className="font-medium text-foreground text-sm">Incorrect Questions</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Review all {incorrectIds.size} questions you answered incorrectly.
                              </p>
                            </div>
                          ) : null;
                        })()}

                        {/* All Questions Option */}
                        <div
                          className={cn(
                            "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                            useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => {
                            const wasRestricted = useBookmarkedOnly || useIncorrectOnly;
                            setUseAllQuestions(true);
                            setUseBookmarkedOnly(false);
                            setUseIncorrectOnly(false);
                            if (wasRestricted) {
                              setQuestionCount(preferredQuestionCountRef.current);
                              setQuestionCountInput(String(preferredQuestionCountRef.current));
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground text-sm">All Available Questions</p>
                            {useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {showUnansweredOnly ? "Unanswered" : "All"}
                                </span>
                                <Switch
                                  checked={showUnansweredOnly}
                                  onCheckedChange={setShowUnansweredOnly}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Randomly select from all {showUnansweredOnly ? allUnansweredCount : allQuestionsCount} questions across all sections.
                          </p>
                        </div>

                        {/* Selected Sections Option */}
                        <div
                          className={cn(
                            "p-3 rounded-lg border-2 cursor-pointer transition-colors",
                            !useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly
                              ? "border-primary bg-primary/10"
                              : "border-border bg-muted/30 hover:bg-muted/50"
                          )}
                          onClick={() => {
                            const wasRestricted = useBookmarkedOnly || useIncorrectOnly;
                            setUseAllQuestions(false);
                            setUseBookmarkedOnly(false);
                            setUseIncorrectOnly(false);
                            if (wasRestricted) {
                              setQuestionCount(preferredQuestionCountRef.current);
                              setQuestionCountInput(String(preferredQuestionCountRef.current));
                            }
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-medium text-foreground text-sm">Select Sections</p>
                            {!useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {showUnansweredOnlyInSections ? "Unanswered" : "All"}
                                </span>
                                <Switch
                                  checked={showUnansweredOnlyInSections}
                                  onCheckedChange={setShowUnansweredOnlyInSections}
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Choose specific topics to test from each section.
                          </p>
                        </div>
                      </div>

                      {!useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly && (
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
                                        {subsection.title} <span className="text-muted-foreground">({getUnansweredCountForSubsection(subsection, !showUnansweredOnlyInSections)})</span>
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
                      disabled={
                        hasError ||
                        (!useAllQuestions && !useBookmarkedOnly && !useIncorrectOnly && selectedSubsections.size === 0) ||
                        availableQuestions.length === 0
                      }
                      className="w-full"
                      data-testid="button-start-test"
                    >
                      Start Test ({Math.min(questionCount, availableQuestions.length)} Questions)
                    </Button>
                  </>
                );
              })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  if (testState === 'testing') {
    const currentQuestion = testQuestions[currentQuestionIndex];
    const showTimedChrome = Boolean(
      currentSession?.timerEnabled &&
        timedTestRemainingSeconds != null &&
        !isReviewMode &&
        !isPreview
    );

    const renderTimedCountdown = (compact: boolean) => {
      if (!showTimedChrome) return null;
      return (
        <span
          className={cn(
            'inline-flex flex-wrap items-baseline justify-center font-medium',
            compact
              ? 'gap-x-0.5 text-[0.844rem] leading-none'
              : 'gap-x-1 text-lg leading-snug md:text-xl',
            timedTestRemainingSeconds <= 60 ? 'text-destructive' : 'text-primary'
          )}
        >
          <span className="font-sans">Time Remaining:&nbsp;</span>
          <span className="font-mono font-semibold tabular-nums">
            {formatCountdown(timedTestRemainingSeconds)}
          </span>
        </span>
      );
    };

    return (
      <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
        {/* Preview: Create Account banner */}
        {isPreview && (
          <div className="w-full flex-shrink-0 bg-primary text-primary-foreground px-4 py-2 flex items-center justify-center gap-2 text-sm">
            <span className="font-medium">Start your 7-day free trial today.</span>
            <button
              type="button"
              onClick={() => { window.location.href = '/signup'; }}
              className="font-semibold underline underline-offset-2 hover:no-underline focus:outline-none"
            >
              Create Account Now!
            </button>
          </div>
        )}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Question Panel - Top on mobile, Right on desktop */}
        <div className={cn(
          "md:flex md:flex-col md:w-32 md:border-r md:border-border md:bg-muted/30 md:overflow-visible md:flex-shrink-0 md:h-full",
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
          
          <div className="flex-1 overflow-y-auto p-2 max-h-[50vh] md:max-h-none">
            <div className="grid grid-cols-5 md:grid-cols-2 gap-1.5 md:gap-2">
              {testQuestions.map((question, index) => {
                const status = getQuestionStatus(index);
                const isCurrent = index === currentQuestionIndex;
                const isFlagged = flaggedQuestions.has(question.id);
                
                return (
                  <div key={question.id} className="relative">
                    <button
                      data-testid={`button-question-${index + 1}`}
                      onClick={() => {
                        handleQuestionNavigation(index);
                      }}
                      className={cn(
                        "h-8 md:h-10 rounded flex items-center justify-center text-xs font-semibold transition-all w-full",
                        isCurrent && "ring-2 ring-primary ring-offset-1 md:ring-offset-2",
                        status === 'unanswered' && "bg-muted hover:bg-muted/80 text-muted-foreground",
                        status === 'correct' && "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30",
                        status === 'incorrect' && "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30"
                      )}
                    >
                      {index + 1}
                    </button>
                    {isFlagged && (
                      <div className="absolute top-0 right-0 -translate-y-0.5 translate-x-0.5 md:-translate-y-1 md:translate-x-1">
                        <Flag className="h-2.5 w-2.5 md:h-3 md:w-3 fill-red-500 text-red-500" data-testid={`flag-question-${index + 1}`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className={cn("p-3 border-t border-border space-y-2 text-xs", isPreview && "pb-[3.75rem]")}>
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

        {/* Main Content */}
        <div className="flex flex-col overflow-hidden min-w-0 flex-1 flex-grow">
          <div
            className={cn(
              'flex w-full flex-shrink-0 flex-col border-b border-border bg-accent/5',
              showTimedChrome && 'max-md:gap-2',
              'p-3 md:p-4'
            )}
          >
            <div
              className={cn(
                'flex w-full gap-2 md:gap-3',
                showTimedChrome
                  ? 'max-md:items-start max-md:justify-between md:items-center'
                  : 'items-center justify-between'
              )}
            >
              <div className={cn('min-w-0', showTimedChrome ? 'max-md:flex-1 md:flex-1 md:basis-0' : 'flex-1')}>
                <h1 className="text-xl md:text-2xl font-bold truncate">Test Mode</h1>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} / {testQuestions.length}
                </p>
              </div>
              {showTimedChrome && (
                <div
                  role="timer"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Time remaining: ${formatCountdown(timedTestRemainingSeconds)}`}
                  className="hidden shrink-0 px-1 text-center md:block"
                >
                  {renderTimedCountdown(false)}
                </div>
              )}
              <div
                className={cn(
                  'flex min-w-0 items-center justify-end gap-1 md:gap-2',
                  showTimedChrome ? 'max-md:shrink-0 md:flex-1 md:basis-0' : 'shrink-0'
                )}
              >
                <Button 
                  size="icon"
                  variant="ghost"
                  onClick={() => handleToggleFlag(currentQuestion.id)}
                  data-testid="button-flag-question"
                  title={flaggedQuestions.has(currentQuestion.id) ? "Unflag question" : "Flag question"}
                  className={flaggedQuestions.has(currentQuestion.id) ? "text-red-500" : ""}
                >
                  <Flag className={cn("h-4 w-4", flaggedQuestions.has(currentQuestion.id) && "fill-red-500")} />
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
                <Button
                  data-testid={showTimedChrome ? 'button-pause-exit' : 'button-save-exit'}
                  onClick={handleSaveAndExit}
                  variant="outline"
                  size="sm"
                >
                  {showTimedChrome ? (
                    <>
                      <span className="hidden md:inline">Pause & Exit</span>
                      <span className="md:hidden">Pause</span>
                    </>
                  ) : (
                    <>
                      <span className="hidden md:inline">Save & Exit</span>
                      <span className="md:hidden">Save</span>
                    </>
                  )}
                </Button>
                <Button data-testid="button-finish-test" onClick={handleFinishTest} variant="default" size="sm">
                  <span className="hidden md:inline">Finish Test</span>
                  <span className="md:hidden">Done</span>
                </Button>
              </div>
            </div>
            {showTimedChrome && (
              <div
                role="timer"
                aria-live="polite"
                aria-atomic="true"
                aria-label={`Time Remaining: ${formatCountdown(timedTestRemainingSeconds)}`}
                className="flex items-center justify-center bg-primary/[0.07] px-2 py-2 text-center md:hidden dark:bg-primary/10"
              >
                {renderTimedCountdown(true)}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-auto flex flex-col">
            <div className="w-full p-3 md:p-6 min-h-min">
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
          <div className="w-full p-3 md:p-4 border-t border-border bg-accent/5 flex-shrink-0">
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
              
              <button
                type="button"
                className={cn(
                  "text-xs sm:text-sm text-center font-inherit",
                  "max-md:cursor-pointer max-md:touch-manipulation",
                  "max-md:inline-flex max-md:items-center max-md:justify-center max-md:gap-1.5",
                  "max-md:py-2 max-md:pl-4 max-md:pr-3 max-md:min-h-10 max-md:rounded-full",
                  "max-md:border max-md:border-border/80",
                  "max-md:bg-gradient-to-b max-md:from-background max-md:to-muted/45",
                  "md:bg-transparent md:bg-none",
                  "max-md:text-foreground max-md:font-semibold max-md:tabular-nums",
                  /* Raised “bevel”: soft drop shadow + top inner highlight */
                  "max-md:shadow-[0_2px_6px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.92)]",
                  "dark:max-md:shadow-[0_2px_10px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.14)]",
                  "max-md:active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.12),inset_0_-1px_0_0_rgba(255,255,255,0.06)]",
                  "max-md:active:translate-y-px max-md:active:from-muted/50 max-md:active:to-muted/70",
                  "max-md:focus-visible:outline-none max-md:focus-visible:ring-2 max-md:focus-visible:ring-primary/40 max-md:focus-visible:ring-offset-2 max-md:focus-visible:ring-offset-accent/5",
                  showQuestionPanel &&
                    "max-md:border-primary/40 max-md:from-primary/12 max-md:to-primary/6 max-md:shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_0_rgba(255,255,255,0.85)]",
                  showQuestionPanel &&
                    "dark:max-md:shadow-[0_2px_12px_rgba(0,0,0,0.35),inset_0_1px_0_0_rgba(255,255,255,0.12)]",
                  "md:pointer-events-none md:inline md:border-0 md:p-0 md:min-h-0 md:shadow-none md:font-normal md:text-muted-foreground"
                )}
                onClick={() => setShowQuestionPanel((open) => !open)}
                aria-expanded={showQuestionPanel}
                aria-label={showQuestionPanel ? "Hide question list" : "Show all questions"}
                data-testid="button-toggle-questions-from-progress"
              >
                Question {currentQuestionIndex + 1} / {testQuestions.length}
                {showQuestionPanel ? (
                  <ChevronUp className="hidden max-md:block h-4 w-4 shrink-0 opacity-70 text-muted-foreground" aria-hidden />
                ) : (
                  <ChevronDown className="hidden max-md:block h-4 w-4 shrink-0 opacity-70 text-muted-foreground" aria-hidden />
                )}
              </button>

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
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <DetailedTestResults
        sections={sections}
        testQuestions={testQuestions}
        responses={responses}
        onBack={onBack}
        onReview={() => {
          setIsReviewMode(true);
          setTestState('testing');
          setCurrentQuestionIndex(0);
        }}
        onHome={onBack}
      />
    );
  }

  return null;
}

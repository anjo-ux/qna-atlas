import { useState, useEffect, useRef } from 'react';
import { loadQuestions } from '@/utils/parseQuestions';
import { loadReferenceText } from '@/utils/parseReferenceText';
import { Section } from '@/types/question';
import { ReferenceSection } from '@/utils/parseReferenceText';
import { Navigation } from '@/components/Navigation';
import { QuestionCard } from '@/components/QuestionCard';
import { ReferenceTextPanel } from '@/components/ReferenceTextPanel';
import { QuestionStats } from '@/components/QuestionStats';
import { QuestionFilters } from '@/components/QuestionFilters';
import { SearchResults } from '@/components/SearchResults';
import { HomePage } from '@/components/HomePage';
import { Paywall } from '@/components/Paywall';
import { PreviewWizard } from '@/components/PreviewWizard';
import { TestMode } from './TestMode';
import { Settings as SettingsPage } from './Settings';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, BookOpen, FileQuestion, Columns2, Home, Zap, Settings, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Bookmark, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { useHighlights } from '@/hooks/useHighlights';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSpacedRepetition } from '@/hooks/useSpacedRepetition';
import { useLocation } from 'wouter';
import { toast } from 'sonner';

type ViewMode = 'questions' | 'reference' | 'split';
type FilterMode = 'all' | 'incorrect';
type ScreenMode = 'study' | 'test' | 'settings' | 'preview';
type TestModeState = { mode: 'new' } | { mode: 'resume'; sessionId: string };

export default function Index() {
  const [, setLocation] = useLocation();
  const [sections, setSections] = useState<Section[]>([]);
  const [referenceSections, setReferenceSections] = useState<ReferenceSection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [screenMode, setScreenMode] = useState<ScreenMode>('study');
  const [testModeState, setTestModeState] = useState<TestModeState>({ mode: 'new' });
  const searchRef = useRef<HTMLDivElement>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [isCheckingSubscription, setIsCheckingSubscription] = useState(true);
  const [showPreviewWizard, setShowPreviewWizard] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(window.innerWidth < 1024);
  const { bookmarks } = useBookmarks();
  const { dueCount } = useSpacedRepetition();

  const {
    recordResponse,
    getQuestionResponse,
    getSubsectionStats,
    getIncorrectQuestionIds,
    resetSubsection,
    resetAll,
  } = useQuestionStats();

  const { notes } = useHighlights();
  
  // Global search across questions, reference, and notes
  const searchResults = useGlobalSearch(sections, referenceSections, notes, searchQuery);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check subscription status first
        const subRes = await fetch('/api/subscription');
        const subData = await subRes.json();
        setSubscription(subData);

        const [questionsData, referenceData] = await Promise.all([
          loadQuestions(),
          Promise.resolve(loadReferenceText())
        ]);
        setSections(questionsData);
        setReferenceSections(referenceData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
        setIsCheckingSubscription(false);
      }
    };

    fetchData();
  }, []);

  // Handle window resize for responsive mobile layout
  useEffect(() => {
    const handleResize = () => {
      const isSmall = window.innerWidth < 1024;
      setIsMobileLayout(isSmall);
      
      // Auto-close nav and settings on small screens
      if (isSmall) {
        setIsNavOpen(false);
        if (screenMode === 'settings') {
          setScreenMode('study');
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [screenMode]);

  // Auto-switch out of split mode when screen becomes too small
  useEffect(() => {
    if (isMobileLayout && viewMode === 'split') {
      setViewMode('questions');
    }
  }, [isMobileLayout, viewMode]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentSection = sections.find(s => s.id === selectedSection);
  const currentSubsection = currentSection?.subsections.find(ss => ss.id === selectedSubsection);

  // Get stats for current subsection
  const subsectionStats = currentSubsection && selectedSection && selectedSubsection
    ? getSubsectionStats(selectedSection, selectedSubsection, currentSubsection.questions.length)
    : { total: 0, answered: 0, correct: 0, incorrect: 0 };

  // Get incorrect question IDs for filtering
  const incorrectQuestionIds = selectedSection && selectedSubsection
    ? getIncorrectQuestionIds(selectedSection, selectedSubsection)
    : [];

  // Apply search and filter
  let filteredQuestions = currentSubsection?.questions || [];
  
  // Apply incorrect filter
  if (filterMode === 'incorrect') {
    filteredQuestions = filteredQuestions.filter(q => incorrectQuestionIds.includes(q.id));
  }
  
  // Apply search filter only when in a subsection (local search)
  if (searchQuery && selectedSubsection) {
    filteredQuestions = filteredQuestions.filter(q =>
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  const handleAnswerSubmit = (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => {
    if (selectedSection && selectedSubsection) {
      recordResponse({
        questionId,
        sectionId: selectedSection,
        subsectionId: selectedSubsection,
        selectedAnswer,
        correctAnswer,
        isCorrect,
      });
    }
  };

  const handleResetSubsection = () => {
    if (selectedSection && selectedSubsection) {
      resetSubsection(selectedSection, selectedSubsection);
      toast.success('Section progress reset');
    }
  };

  const handleResetAll = () => {
    resetAll();
    toast.success('All progress reset');
  };

  const handleNavigate = (sectionId: string, subsectionId: string) => {
    setSelectedSection(sectionId);
    setSelectedSubsection(subsectionId);
    setSearchQuery('');
    setIsNavOpen(false);
    setFilterMode('all'); // Reset filter when navigating
    setShowSearchResults(false);
  };

  const handleGoHome = () => {
    if (selectedSection === null && selectedSubsection === null) {
      // Already on home screen, refresh the page
      window.location.reload();
    } else {
      // Navigate to home screen
      setSelectedSection(null);
      setSelectedSubsection(null);
      setIsNavOpen(false);
    }
  };

  const handleReviewIncorrect = () => {
    // Find first section/subsection with incorrect answers
    for (const section of sections) {
      for (const subsection of section.subsections) {
        const incorrectIds = getIncorrectQuestionIds(section.id, subsection.id);
        if (incorrectIds.length > 0) {
          setSelectedSection(section.id);
          setSelectedSubsection(subsection.id);
          setFilterMode('incorrect');
          setIsNavOpen(false);
          return;
        }
      }
    }
  };

  const handleSearchResultClick = (
    sectionId: string, 
    subsectionId: string, 
    questionId?: string, 
    noteId?: string
  ) => {
    handleNavigate(sectionId, subsectionId);
    
    // Scroll to specific element after navigation
    setTimeout(() => {
      if (questionId) {
        // Scroll to specific question
        const questionElement = document.querySelector(`[data-question-id="${questionId}"]`);
        if (questionElement) {
          questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          questionElement.classList.add('ring-2', 'ring-primary', 'ring-offset-2');
          setTimeout(() => {
            questionElement.classList.remove('ring-2', 'ring-primary', 'ring-offset-2');
          }, 2000);
        }
      } else if (noteId) {
        // Scroll to specific note
        const noteElement = document.querySelector(`[data-note-id="${noteId}"]`);
        if (noteElement) {
          noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add highlight effect
          noteElement.classList.add('ring-2', 'ring-primary');
          setTimeout(() => {
            noteElement.classList.remove('ring-2', 'ring-primary');
          }, 2000);
        }
      }
    }, 300); // Wait for navigation and render
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim().length >= 2) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const currentReferenceContent = referenceSections
    .find(s => s.id === selectedSection)
    ?.subsections.find(ss => ss.id === selectedSubsection)?.content || '';
  
  const currentReferenceTitle = referenceSections
    .find(s => s.id === selectedSection)
    ?.subsections.find(ss => ss.id === selectedSubsection)?.title || '';

  const handleResumeTest = (sessionId: string) => {
    setTestModeState({ mode: 'resume', sessionId });
    setScreenMode('test');
  };

  const handleStartTest = () => {
    setTestModeState({ mode: 'new' });
    setScreenMode('test');
  };

  // Check if trial is expired
  if (!isCheckingSubscription && subscription?.isLocked) {
    return (
      <Paywall 
        daysRemaining={subscription.daysRemaining}
        onUpgrade={() => {
          toast.info('Upgrade options coming soon');
        }}
        onSettings={() => setScreenMode('settings')}
      />
    );
  }

  if (screenMode === 'test') {
    return (
      <div className="flex h-screen overflow-hidden">
        <TestMode 
          sections={sections} 
          onBack={() => {
            setScreenMode('study');
            setTestModeState({ mode: 'new' });
          }}
          resumeSessionId={testModeState.mode === 'resume' ? testModeState.sessionId : undefined}
        />
      </div>
    );
  }

  if (screenMode === 'settings') {
    return (
      <div className="flex h-screen overflow-hidden">
        <SettingsPage 
          onBack={() => setScreenMode('study')}
          subscription={subscription}
        />
      </div>
    );
  }

  if (screenMode === 'preview') {
    const { getPreviewQuestions } = require('@/utils/previewQuestions');
    const previewQuestions = getPreviewQuestions(sections);
    return (
      <div className="flex h-screen overflow-hidden">
        <TestMode 
          sections={sections}
          previewQuestions={previewQuestions}
          onBack={() => setScreenMode('study')}
          isPreview={true}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <PreviewWizard
        open={showPreviewWizard}
        onClose={() => setShowPreviewWizard(false)}
        onStart={() => {
          setShowPreviewWizard(false);
          setScreenMode('preview');
        }}
      />

      {/* Header - Full Width */}
      <header className="glass-surface border-glass w-full sticky top-0 z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
            {/* Top Row: Home, Title, Actions */}
            <div className="flex items-center gap-4 flex-wrap justify-start">
              
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.preventDefault();
                  handleGoHome();
                  (e.currentTarget as HTMLButtonElement).blur();
                }}
                className="hover:bg-primary/10 flex-shrink-0 outline-none focus-visible:ring-0"
                title="Go to Dashboard"
              >
                <Home className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-2 min-w-0">
                <img 
                  src="/atlas-logo.png" 
                  alt="Atlas Logo" 
                  className="h-8 w-8 object-contain flex-shrink-0"
                />
                <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-primary truncate">
                  Atlas Review
                </h1>
              </div>

              {/* Settings Button */}
              <Button
                onClick={() => setScreenMode('settings')}
                variant="outline"
                size="icon"
                className="lg:hidden flex-shrink-0"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* Bookmarks Button */}
              <Button
                onClick={() => setLocation('/bookmarks')}
                variant="outline"
                className="gap-2 relative"
                data-testid="button-bookmarks"
              >
                <Bookmark className="h-4 w-4" />
                <span className="hidden md:inline">Bookmarks</span>
                {bookmarks.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {bookmarks.length > 99 ? '99+' : bookmarks.length}
                  </span>
                )}
              </Button>

              {/* Spaced Repetition Button */}
              <Button
                onClick={() => setLocation('/spaced-repetition')}
                variant="outline"
                className="gap-2 relative"
                data-testid="button-spaced-repetition"
              >
                <Brain className="h-4 w-4" />
                <span className="hidden md:inline">Review</span>
                {dueCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {dueCount > 99 ? '99+' : dueCount}
                  </span>
                )}
              </Button>

              {/* Test Button */}
              <Button
                onClick={handleStartTest}
                variant="outline"
                className="gap-2"
              >
                <Zap className="h-4 w-4" />
                <span className="hidden md:inline">Test</span>
              </Button>

            </div>
          </div>

          {/* Bottom Row: Search Bar + View Mode Toggle - Always Visible */}
          <div className="border-t border-border/50 glass-surface px-4 sm:px-6 lg:px-8 py-3">
            <div className="w-full max-w-6xl mx-auto flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative z-[9999] flex-1 min-w-0" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search Entire Database"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.trim().length >= 2) {
                      setShowSearchResults(true);
                    }
                  }}
                  className="pl-10 w-full"
                  data-testid="input-search"
                />
                {showSearchResults && searchQuery.trim().length >= 2 && (
                  <SearchResults
                    results={searchResults}
                    query={searchQuery}
                    onResultClick={handleSearchResultClick}
                  />
                )}
              </div>

              {/* Desktop View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-2 bg-accent/5 rounded-lg p-1 w-fit flex-shrink-0">
                <Button
                  variant={viewMode === 'reference' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('reference')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden md:inline">Reference</span>
                </Button>
                {!isMobileLayout && (
                  <Button
                    variant={viewMode === 'split' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('split')}
                    className="gap-2"
                  >
                    <Columns2 className="h-4 w-4" />
                    <span className="hidden md:inline">Split</span>
                  </Button>
                )}
                <Button
                  variant={viewMode === 'questions' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('questions')}
                  className="gap-2"
                >
                  <FileQuestion className="h-4 w-4" />
                  <span className="hidden md:inline">Questions</span>
                </Button>
              </div>

              {/* Mobile View Toggle - No split view on mobile */}
              <div className="flex sm:hidden items-center gap-2 bg-accent/5 rounded-lg p-1 flex-shrink-0">
                <Button
                  onClick={handleStartTest}
                  variant="outline"
                  size="icon"
                >
                  <Zap className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'reference' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('reference')}
                >
                  <BookOpen className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'questions' ? 'default' : 'ghost'}
                  size="icon"
                  onClick={() => setViewMode('questions')}
                >
                  <FileQuestion className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

      {/* Bottom Section - Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Toggle Button */}
        <button
          onClick={() => setIsNavOpen(!isNavOpen)}
          className="flex-shrink-0 rounded-none border-r border-border h-full flex flex-col items-center justify-center gap-0.5 px-1.5 hover:bg-accent/50 transition-colors"
          data-testid="button-toggle-nav"
        >
          {isNavOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 font-bold" style={{ strokeWidth: 3 }} />
          ) : (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 font-bold" style={{ strokeWidth: 3 }} />
          )}
          <span 
            className="text-xs font-semibold text-muted-foreground select-none"
            style={{
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
              letterSpacing: '0.05em'
            }}
          >
             All Content 
          </span>
          {isNavOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0 font-bold" style={{ strokeWidth: 3 }} />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0 font-bold" style={{ strokeWidth: 3 }} />
          )}
        </button>

        {/* Navigation Sidebar - Collapsible (hidden on mobile layout) */}
        {isNavOpen && !isMobileLayout && (
          <div className="w-80 flex-shrink-0 transition-all duration-300 overflow-hidden">
            <Navigation
              sections={sections}
              selectedSection={selectedSection}
              selectedSubsection={selectedSubsection}
              onNavigate={handleNavigate}
              isOpen={isNavOpen}
              onClose={() => setIsNavOpen(false)}
            />
          </div>
        )}
        
        {/* Mobile Navigation Overlay */}
        {isNavOpen && isMobileLayout && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsNavOpen(false)} />
            <div className="absolute left-12 top-16 w-80 glass-surface border-glass rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <Navigation
                sections={sections}
                selectedSection={selectedSection}
                selectedSubsection={selectedSubsection}
                onNavigate={handleNavigate}
                isOpen={isNavOpen}
                onClose={() => setIsNavOpen(false)}
              />
            </div>
          </>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-auto flex-col">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !currentSubsection ? (
            <HomePage 
              sections={sections} 
              onReviewIncorrect={handleReviewIncorrect}
              onStartTest={handleStartTest}
              onResumeTest={handleResumeTest}
              onSettings={() => setScreenMode('settings')}
              onPreview={() => setShowPreviewWizard(true)}
            />
          ) : (
            <div className={cn(
              "flex-1 flex flex-col lg:flex-row",
              viewMode === 'split' ? "divide-y lg:divide-y-0 lg:divide-x divide-border" : ""
            )}>
              {/* Reference Text Panel */}
              {(viewMode === 'reference' || viewMode === 'split') && (
                <div className={cn(
                  "overflow-hidden",
                  viewMode === 'split' ? "lg:w-2/5 2xl:w-1/3 lg:flex-shrink-0" : "flex-1"
                )}>
                  <ReferenceTextPanel 
                    content={currentReferenceContent}
                    subsectionTitle={currentReferenceTitle}
                    sectionId={selectedSection || ''}
                    subsectionId={selectedSubsection || ''}
                    isCompressed={viewMode === 'split'}
                  />
                </div>
              )}

              {/* Questions Panel */}
              {(viewMode === 'questions' || viewMode === 'split') && (
                <div className={cn(
                  "overflow-auto",
                  viewMode === 'split' ? "lg:w-3/5 2xl:w-2/3 lg:flex-1" : "flex-1"
                )}>
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-4">
                      <div className="space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-semibold text-foreground">
                              {currentSubsection.title}
                            </h2>
                            <p className="text-sm text-muted-foreground mt-1">
                              {searchQuery
                                ? `${filteredQuestions.length} ${filteredQuestions.length === 1 ? 'result' : 'results'} found`
                                : filterMode === 'incorrect'
                                ? `${filteredQuestions.length} Incorrect ${filteredQuestions.length === 1 ? 'Question' : 'Questions'}`
                                : `${currentSubsection.questions.length} ${currentSubsection.questions.length === 1 ? 'Question' : 'Questions'}`
                              }
                            </p>
                          </div>
                        </div>

                        {/* Stats and Filters */}
                        <div className="flex flex-col lg:flex-row gap-4">
                          <QuestionStats stats={subsectionStats} className="lg:flex-shrink-0 lg:w-64" />
                          <div className="flex-1">
                            <QuestionFilters
                              filterMode={filterMode}
                              onFilterChange={setFilterMode}
                              onResetSubsection={handleResetSubsection}
                              onResetAll={handleResetAll}
                              incorrectCount={subsectionStats.incorrect}
                            />
                          </div>
                        </div>
                      </div>

                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            {searchQuery 
                              ? 'No questions match your search.' 
                              : filterMode === 'incorrect'
                              ? 'No incorrect answers yet. Start answering questions!'
                              : 'No questions available.'}
                          </p>
                        </div>
                      ) : (
                        filteredQuestions.map((question, index) => {
                          const savedResponse = getQuestionResponse(question.id);
                          return (
                            <QuestionCard
                              key={question.id}
                              question={question}
                              index={index}
                              sectionId={selectedSection || ''}
                              subsectionId={selectedSubsection || ''}
                              savedResponse={savedResponse}
                              onAnswerSubmit={handleAnswerSubmit}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

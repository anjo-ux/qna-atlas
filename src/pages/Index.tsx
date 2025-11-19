import { useState, useEffect } from 'react';
import { loadQuestions } from '@/utils/parseQuestions';
import { loadReferenceText } from '@/utils/parseReferenceText';
import { Section } from '@/types/question';
import { ReferenceSection } from '@/utils/parseReferenceText';
import { Navigation } from '@/components/Navigation';
import { QuestionCard } from '@/components/QuestionCard';
import { ReferenceTextPanel } from '@/components/ReferenceTextPanel';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, BookOpen, FileQuestion, Columns2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ViewMode = 'questions' | 'reference' | 'split';

export default function Index() {
  const [sections, setSections] = useState<Section[]>([]);
  const [referenceSections, setReferenceSections] = useState<ReferenceSection[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedSubsection, setSelectedSubsection] = useState<string | null>(null);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      }
    };

    fetchData();
  }, []);

  const currentSection = sections.find(s => s.id === selectedSection);
  const currentSubsection = currentSection?.subsections.find(ss => ss.id === selectedSubsection);

  const filteredQuestions = currentSubsection?.questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.answer.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const currentReferenceContent = referenceSections
    .find(s => s.id === selectedSection)
    ?.subsections.find(ss => ss.id === selectedSubsection)?.content || '';
  
  const currentReferenceTitle = referenceSections
    .find(s => s.id === selectedSection)
    ?.subsections.find(ss => ss.id === selectedSubsection)?.title || '';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Navigation Sidebar */}
      <Navigation
        sections={sections}
        selectedSection={selectedSection}
        selectedSubsection={selectedSubsection}
        onNavigate={(sectionId, subsectionId) => {
          setSelectedSection(sectionId);
          setSelectedSubsection(subsectionId);
          setSearchQuery('');
          setIsNavOpen(false);
        }}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsNavOpen(!isNavOpen)}
              >
                {isNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  PSITE Review
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentSubsection ? currentSubsection.title : 'Select a section to begin'}
                </p>
              </div>

              {/* View Mode Toggle */}
              <div className="hidden sm:flex items-center gap-2 bg-accent/5 rounded-lg p-1">
                <Button
                  variant={viewMode === 'reference' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('reference')}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden md:inline">Reference</span>
                </Button>
                <Button
                  variant={viewMode === 'split' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('split')}
                  className="gap-2"
                >
                  <Columns2 className="h-4 w-4" />
                  <span className="hidden md:inline">Split</span>
                </Button>
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
            </div>

            {/* Mobile View Toggle */}
            <div className="flex sm:hidden items-center gap-2 mt-4 bg-accent/5 rounded-lg p-1">
              <Button
                variant={viewMode === 'reference' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('reference')}
                className="gap-2 flex-1"
              >
                <BookOpen className="h-4 w-4" />
                Reference
              </Button>
              <Button
                variant={viewMode === 'split' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('split')}
                className="gap-2 flex-1"
              >
                <Columns2 className="h-4 w-4" />
                Split
              </Button>
              <Button
                variant={viewMode === 'questions' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('questions')}
                className="gap-2 flex-1"
              >
                <FileQuestion className="h-4 w-4" />
                Questions
              </Button>
            </div>

            {/* Search Bar */}
            {currentSubsection && viewMode !== 'reference' && (
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !currentSubsection ? (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                Get Started
              </h2>
              <p className="text-muted-foreground max-w-md">
                Select a section from the navigation to view questions and start studying
              </p>
            </div>
          ) : (
            <div className={cn(
              "flex-1 flex flex-col sm:flex-row",
              viewMode === 'split' ? "divide-y sm:divide-y-0 sm:divide-x divide-border" : ""
            )}>
              {/* Reference Text Panel */}
              {(viewMode === 'reference' || viewMode === 'split') && (
                <div className={cn(
                  "overflow-hidden bg-background",
                  viewMode === 'split' ? "h-1/2 sm:h-auto sm:w-1/2" : "flex-1"
                )}>
              <ReferenceTextPanel
                content={currentReferenceContent}
                subsectionTitle={currentReferenceTitle}
                sectionId={selectedSection || ''}
                subsectionId={selectedSubsection || ''}
              />
                </div>
              )}

              {/* Questions Panel */}
              {(viewMode === 'questions' || viewMode === 'split') && (
                <div className={cn(
                  "overflow-auto",
                  viewMode === 'split' ? "h-1/2 sm:h-auto sm:w-1/2" : "flex-1"
                )}>
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            {currentSubsection.title}
                          </h2>
                          <p className="text-sm text-muted-foreground mt-1">
                            {searchQuery
                              ? `${filteredQuestions.length} ${filteredQuestions.length === 1 ? 'result' : 'results'} found`
                              : `${currentSubsection.questions.length} ${currentSubsection.questions.length === 1 ? 'question' : 'questions'}`
                            }
                          </p>
                        </div>
                      </div>

                      {filteredQuestions.length === 0 ? (
                        <div className="text-center py-12">
                          <p className="text-muted-foreground">
                            {searchQuery ? 'No questions match your search.' : 'No questions available.'}
                          </p>
                        </div>
                      ) : (
                        filteredQuestions.map((question, index) => (
                          <QuestionCard
                            key={question.id}
                            question={question}
                            index={index}
                            sectionId={selectedSection || ''}
                            subsectionId={selectedSubsection || ''}
                          />
                        ))
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

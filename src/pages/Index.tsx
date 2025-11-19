import { useEffect, useState, useRef } from 'react';
import { loadQuestions, getSubsectionTitle, updateSubsectionTitle } from '@/utils/parseQuestions';
import { Section } from '@/types/question';
import { Navigation } from '@/components/Navigation';
import { QuestionCard } from '@/components/QuestionCard';
import { SubsectionContent } from '@/components/SubsectionContent';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Index = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('');
  const [activeSubsection, setActiveSubsection] = useState('');
  const subsectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const loadData = async () => {
    try {
      const data = await loadQuestions();
      
      // Apply any custom titles from localStorage
      const updatedData = data.map(section => ({
        ...section,
        subsections: section.subsections.map(subsection => ({
          ...subsection,
          title: getSubsectionTitle(section.id, subsection.id),
        })),
      }));
      
      setSections(updatedData);
      if (updatedData.length > 0 && updatedData[0].subsections.length > 0) {
        setActiveSection(updatedData[0].id);
        setActiveSubsection(updatedData[0].subsections[0].id);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const [sectionId, subsectionId] = entry.target.id.split('::');
            setActiveSection(sectionId);
            setActiveSubsection(subsectionId);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-100px 0px -60% 0px' }
    );

    subsectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [sections]);

  const handleNavigate = (sectionId: string, subsectionId: string) => {
    const element = subsectionRefs.current.get(`${sectionId}::${subsectionId}`);
    if (element) {
      const offset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  const handleSubsectionTitleChange = (sectionId: string, subsectionId: string, newTitle: string) => {
    updateSubsectionTitle(sectionId, subsectionId, newTitle);
    
    // Update local state
    setSections(prevSections =>
      prevSections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              subsections: section.subsections.map(subsection =>
                subsection.id === subsectionId
                  ? { ...subsection, title: newTitle }
                  : subsection
              ),
            }
          : section
      )
    );
    
    toast.success('Subsection title updated');
  };

  const filteredSections = sections.map((section) => ({
    ...section,
    subsections: section.subsections.map((subsection) => ({
      ...subsection,
      questions: subsection.questions.filter(
        (q) =>
          q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    })).filter((subsection) => subsection.questions.length > 0),
  })).filter((section) => section.subsections.length > 0);

  const totalQuestions = sections.reduce(
    (acc, section) => acc + section.subsections.reduce((acc2, sub) => acc2 + sub.questions.length, 0),
    0
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="container flex h-16 items-center justify-between px-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-80" />
          </div>
        </header>
        <div className="container mx-auto px-4 lg:pl-84 py-8">
          <div className="max-w-4xl mx-auto space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 elevated-shadow">
        <div className="container flex h-16 items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Plastic Surgery Q&A</h1>
              <p className="text-xs text-muted-foreground">{totalQuestions} Questions</p>
            </div>
          </div>
          
          <div className="relative w-full max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
      </header>

      {/* Navigation Sidebar */}
      <Navigation
        sections={sections}
        activeSection={activeSection}
        activeSubsection={activeSubsection}
        onNavigate={handleNavigate}
        onSubsectionTitleChange={handleSubsectionTitleChange}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:pl-84 py-8">
        {/* Mobile Search */}
        <div className="relative w-full mb-6 md:hidden">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="max-w-4xl mx-auto space-y-12">
          {filteredSections.map((section) => (
            <div key={section.id} className="space-y-8">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-foreground tracking-tight">
                  {section.title}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-primary to-accent rounded-full" />
              </div>

              {section.subsections.map((subsection) => (
                <div
                  key={subsection.id}
                  id={`${section.id}::${subsection.id}`}
                  ref={(el) => {
                    if (el) subsectionRefs.current.set(`${section.id}::${subsection.id}`, el);
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <h3 className="text-xl font-semibold text-foreground">
                      {subsection.title}
                    </h3>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <div className="space-y-4">
                    <SubsectionContent content={subsection.content} />
                    {subsection.questions.map((question, idx) => (
                      <QuestionCard key={question.id} question={question} index={idx} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}

          {filteredSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No questions found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;

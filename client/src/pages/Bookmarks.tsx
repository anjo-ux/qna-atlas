import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuestionCard } from '@/components/QuestionCard';
import { useBookmarks } from '@/hooks/useBookmarks';
import { loadQuestions } from '@/utils/parseQuestions';
import { Section } from '@/types/question';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { cn } from '@/lib/utils';

interface BookmarksProps {
  onBack: () => void;
}

export function BookmarksPage({ onBack }: BookmarksProps) {
  const { bookmarks } = useBookmarks();
  const [sections, setSections] = useState<Section[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { getQuestionResponse, recordResponse } = useQuestionStats();

  // Load questions to find bookmarked ones
  useEffect(() => {
    const fetchData = async () => {
      try {
        const questionsData = await loadQuestions();
        setSections(questionsData);
      } catch (error) {
        console.error('Error loading questions:', error);
      }
    };

    fetchData();
  }, []);

  // Build bookmarked questions with section/subsection info
  const bookmarkedQuestions = useMemo(() => {
    const result = [];
    
    for (const bookmark of bookmarks) {
      for (const section of sections) {
        for (const subsection of section.subsections) {
          const question = subsection.questions.find(q => q.id === bookmark.questionId);
          if (question) {
            result.push({
              question,
              sectionId: section.id,
              sectionTitle: section.title,
              subsectionId: subsection.id,
              subsectionTitle: subsection.title,
              bookmarkId: bookmark.id,
            });
            break;
          }
        }
      }
    }
    
    return result;
  }, [bookmarks, sections]);

  // Filter by search query
  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return bookmarkedQuestions;
    
    return bookmarkedQuestions.filter(item =>
      item.question.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.question.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sectionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subsectionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [bookmarkedQuestions, searchQuery]);

  const handleAnswerSubmit = (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => {
    const item = bookmarkedQuestions.find(q => q.question.id === questionId);
    if (item) {
      recordResponse({
        questionId,
        sectionId: item.sectionId,
        subsectionId: item.subsectionId,
        selectedAnswer,
        correctAnswer,
        isCorrect,
      });
    }
  };

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-accent/5 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              data-testid="button-back-bookmarks"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Bookmark className="h-6 w-6" />
                Bookmarked Questions
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {filteredQuestions.length} of {bookmarkedQuestions.length} question{bookmarkedQuestions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search bookmarked questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
              data-testid="input-search-bookmarks"
            />
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-lg font-semibold">No bookmarked questions</p>
                <p className="text-sm text-muted-foreground">
                  {bookmarkedQuestions.length === 0
                    ? 'Click the flag icon on any question to bookmark it and review it here.'
                    : 'Try adjusting your search query.'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((item, index) => (
                <div key={`${item.question.id}-${index}`}>
                  {/* Section/Subsection header */}
                  {(index === 0 || filteredQuestions[index - 1].subsectionId !== item.subsectionId) && (
                    <div className="mb-3 mt-4 first:mt-0">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {item.sectionTitle} → {item.subsectionTitle}
                      </p>
                    </div>
                  )}
                  
                  <QuestionCard
                    question={item.question}
                    index={index}
                    sectionId={item.sectionId}
                    subsectionId={item.subsectionId}
                    savedResponse={getQuestionResponse(item.question.id)}
                    onAnswerSubmit={handleAnswerSubmit}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

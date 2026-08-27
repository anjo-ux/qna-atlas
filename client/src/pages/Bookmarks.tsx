import { useState, useMemo, useEffect, useRef } from 'react';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QuestionCard } from '@/components/QuestionCard';
import { useBookmarks } from '@/hooks/useBookmarks';
import { useSections } from '@/hooks/useSections';
import { Section } from '@/types/question';
import { useQuestionStats } from '@/hooks/useQuestionStats';
import { cn } from '@/lib/utils';
import { queryClient } from '@/lib/queryClient';
import { ThemeSwitcher } from '@/components/ui/theme-switcher';

interface BookmarksProps {
  onBack: () => void;
}

export function BookmarksPage({ onBack }: BookmarksProps) {
  const { bookmarks, isLoading } = useBookmarks();
  const { sections } = useSections();
  const [searchQuery, setSearchQuery] = useState('');
  const { getQuestionResponse, recordResponse } = useQuestionStats();
  const previousBookmarkIdsRef = useRef(new Set(bookmarks.map(b => b.id)));

  // Detect when bookmarks are removed and force a refetch
  useEffect(() => {
    const currentBookmarkIds = new Set(bookmarks.map(b => b.id));
    const previousBookmarkIds = previousBookmarkIdsRef.current;
    
    // Check if any bookmarks were removed
    const wasRemoved = Array.from(previousBookmarkIds).some(id => !currentBookmarkIds.has(id));
    
    if (wasRemoved) {
      console.log('[BookmarksPage] Bookmark was removed, forcing UI update');
      // Force component to re-render by updating the ref
      previousBookmarkIdsRef.current = currentBookmarkIds;
    } else {
      previousBookmarkIdsRef.current = currentBookmarkIds;
    }
  }, [bookmarks]);

  // Build bookmarked questions with section/subsection info
  // This useMemo will re-run whenever bookmarks changes, including when items are deleted
  const bookmarkedQuestions = useMemo(() => {
    console.log('[BookmarksPage] Rebuilding bookmarkedQuestions with', bookmarks.length, 'bookmarks');
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
    
    console.log('[BookmarksPage] Rebuilt bookmarkedQuestions with', result.length, 'questions');
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
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-accent/5 p-4 flex-shrink-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              data-testid="button-back-bookmarks"
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
              <Bookmark className="h-5 w-5 shrink-0 sm:h-6 sm:w-6" />
              <h1 className="truncate text-base font-bold leading-tight sm:text-lg md:text-2xl">
                Bookmarked Questions
              </h1>
            </div>
          </div>
          <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-5">
            <ThemeSwitcher />
            <div className="text-right">
              <p className="text-xs text-muted-foreground sm:text-sm">
                {bookmarkedQuestions.length === 1 ? 'Question' : 'Questions'}
              </p>
              <p className="text-xl font-bold text-primary sm:text-2xl">
                {bookmarkedQuestions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
          {/* Search Bar */}
          <div className="mb-6">
            <Input
              placeholder="Search Bookmarked Questions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-white/35 bg-white/35 shadow-sm backdrop-blur-md ring-1 ring-black/5 dark:border-white/20 dark:bg-white/15 dark:ring-white/10"
              data-testid="input-search-bookmarks"
            />
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="space-y-2">
                <Bookmark className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-lg font-semibold">No Bookmarked Questions</p>
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
  );
}

import { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';
import { useHighlights } from '@/hooks/useHighlights';
import { useBookmarks } from '@/hooks/useBookmarks';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { StickyNote } from '@/components/StickyNote';
import { useTextHighlight } from '@/hooks/useTextHighlight';
import { QuestionResponse } from '@/hooks/useQuestionStats';
import { Bookmark, Flag } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import ReactMarkdown from 'react-markdown';

interface QuestionCardProps {
  question: Question;
  index: number;
  sectionId: string;
  subsectionId: string;
  savedResponse?: QuestionResponse;
  onAnswerSubmit: (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => void;
  isTestMode?: boolean;
  isReadOnly?: boolean;
  isFlagged?: boolean;
  onToggleFlag?: (questionId: string) => void;
}

interface ParsedQuestion {
  text: string;
  choices: { letter: string; text: string }[];
}

export function QuestionCard({ 
  question, 
  index, 
  sectionId, 
  subsectionId, 
  savedResponse,
  onAnswerSubmit,
  isTestMode = false,
  isReadOnly = false,
  isFlagged = false,
  onToggleFlag
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(
    savedResponse?.selectedAnswer?.trim().toUpperCase() || null
  );
  const [showExplanation, setShowExplanation] = useState(!!savedResponse);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [crossedOutChoices, setCrossedOutChoices] = useState<Set<string>>(new Set());

  const {
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    batchRemoveHighlights,
    addNote,
    updateNote,
    removeNote,
    updateNotePosition,
    getHighlightsForSection,
    getNotesForSection,
  } = useHighlights();

  const { isBookmarked, toggleBookmark, isPending: isBookmarkPending } = useBookmarks();

  const highlights = getHighlightsForSection(sectionId, subsectionId, 'question', question.id);
  const notes = getNotesForSection(sectionId, subsectionId, 'question', question.id);
  const questionIsBookmarked = isBookmarked(question.id);
  const questionRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo((): ParsedQuestion => {
    let questionText = question.question;
    const choices: { letter: string; text: string }[] = [];

    // Normalize parsed letter to A-E (or A-F) for consistent RadioGroup value
    const toChoiceLetter = (captured: string): string => {
      const upper = captured.toUpperCase();
      if (/[A-F]/.test(upper)) return upper;
      const n = parseInt(captured, 10);
      if (n >= 1 && n <= 6) return String.fromCharCode(64 + n); // 1->A, 2->B, ...
      return upper;
    };

    // Match choice at line start: A), A., (A), a), 1., etc.
    const choiceLineRegex = /^([A-Fa-f1-6])\s*[.)]\s*(.+)$|^\s*\(([A-Fa-f1-6])\)\s*(.+)$/;

    const lines = questionText.split('\n');
    let choicesOnSeparateLines = false;

    for (const line of lines) {
      const m = line.match(choiceLineRegex);
      if (m && (m[2]?.trim() || m[4]?.trim())) {
        choicesOnSeparateLines = true;
        break;
      }
    }

    if (choicesOnSeparateLines) {
      const textLines: string[] = [];
      for (const line of lines) {
        const m = line.match(choiceLineRegex);
        if (m) {
          const letter = toChoiceLetter(m[1] || m[3] || '');
          const text = (m[2] || m[4] || '').trim();
          if (letter && text && /^[A-F]$/.test(letter)) {
            choices.push({ letter, text });
          }
        } else if (line.trim()) {
          textLines.push(line);
        }
      }
      questionText = textLines.join('\n');
    } else {
      const questionMarkers = ['?', ':', '.'];
      let lastMarkerIndex = -1;
      for (const marker of questionMarkers) {
        const index = questionText.lastIndexOf(marker);
        if (index > lastMarkerIndex) lastMarkerIndex = index;
      }

      if (lastMarkerIndex !== -1) {
        const beforeMarker = questionText.substring(0, lastMarkerIndex + 1);
        const afterMarker = questionText.substring(lastMarkerIndex + 1);

        // Allow A-F and 1-6, and both . and )
        const choiceMatches = Array.from(afterMarker.matchAll(/([A-Fa-f1-6])\s*[.)]\s*/g));

        if (choiceMatches.length >= 2 && choiceMatches.length <= 6) {
          const extractedChoices: { letter: string; text: string }[] = [];
          for (let i = 0; i < choiceMatches.length; i++) {
            const letter = toChoiceLetter(choiceMatches[i][1]);
            if (!/^[A-F]$/.test(letter)) continue;
            const startIndex = choiceMatches[i].index! + choiceMatches[i][0].length;
            const endIndex = i < choiceMatches.length - 1 ? choiceMatches[i + 1].index! : afterMarker.length;
            const text = afterMarker.substring(startIndex, endIndex).trim();
            if (text) extractedChoices.push({ letter, text });
          }
          if (extractedChoices.length >= 2 && extractedChoices.length <= 6) {
            choices.push(...extractedChoices);
            questionText = beforeMarker;
          }
        }
      }
    }

    return { text: questionText.trim(), choices };
  }, [question.id, question.question]);

  // Apply highlights to question text
  const questionContent = parsed.text + '\n' + parsed.choices.map(c => `${c.letter}. ${c.text}`).join('\n');
  useTextHighlight(questionRef, highlights, questionContent);

  // Setup global eraser click handler
  useEffect(() => {
    if (!isEraserMode) return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'MARK' && target.hasAttribute('data-highlight-id')) {
        e.preventDefault();
        e.stopPropagation();
        const highlightId = target.getAttribute('data-highlight-id');
        if (highlightId) {
          removeHighlight(highlightId);
        }
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isEraserMode, removeHighlight]);

  const correctAnswer = useMemo(() => {
    // Extract correct answer from the answer text (support A-F)
    const match = question.answer.match(/(?:correct answer is|answer is|correct response is|response is)\s*(?:option\s+)?([A-F])/i);
    if (match) return match[1].toUpperCase();
    // Fallback: answer may start with "A)" or "A.\n" then explanation (e.g. AI-generated or Excel)
    const leading = question.answer.match(/^\s*([A-F])\)/);
    return leading ? leading[1].toUpperCase() : null;
  }, [question.answer]);

  const isCorrect = useMemo(() => {
    if (!selectedAnswer || !correctAnswer) return null;
    return selectedAnswer.toUpperCase() === correctAnswer;
  }, [selectedAnswer, correctAnswer]);

  // Reset state when question changes or when saved response changes
  useEffect(() => {
    if (savedResponse) {
      const normalized = savedResponse.selectedAnswer?.trim().toUpperCase();
      setSelectedAnswer(normalized || null);
      setShowExplanation(true);
    } else {
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  }, [savedResponse, question.id]);

  const handleAnswerClick = () => {
    if (selectedAnswer && !showExplanation && correctAnswer) {
      const correct = selectedAnswer === correctAnswer;
      setShowExplanation(true);
      onAnswerSubmit(question.id, selectedAnswer, correctAnswer, correct);
    }
  };

  // Autosave answer selection to database
  const handleAnswerChange = (value: string) => {
    const normalized = value.trim().toUpperCase();
    if (!normalized) return;
    setSelectedAnswer(normalized);
    // Remove cross-out if this choice was crossed out
    setCrossedOutChoices(prev => {
      const newSet = new Set(prev);
      newSet.delete(normalized);
      return newSet;
    });
    // Also immediately submit if we're in test mode and have a saved response (user is changing their answer)
    if (isTestMode && savedResponse) {
      const correct = normalized === correctAnswer;
      onAnswerSubmit(question.id, normalized, correctAnswer || '', correct);
      setShowExplanation(true);
    }
  };

  // Handle right-click to cross out/uncross out answer choices
  const handleChoiceRightClick = (e: React.MouseEvent<HTMLDivElement>, choiceLetter: string) => {
    e.preventDefault();
    setCrossedOutChoices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(choiceLetter)) {
        newSet.delete(choiceLetter);
      } else {
        newSet.add(choiceLetter);
      }
      return newSet;
    });
  };


  const handleTextSelection = () => {
    // Don't allow highlighting when in eraser mode
    if (isEraserMode) {
      window.getSelection()?.removeAllRanges();
      return;
    }

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const selectedText = selection.toString().trim();
    if (!selectedText || selectedText.length < 2) return;

    // Get the full question text to calculate proper offsets
    const questionText = parsed.text + ' ' + parsed.choices.map(c => c.letter + '. ' + c.text).join(' ');
    const selectedIndex = questionText.indexOf(selectedText);
    
    if (selectedIndex === -1) return;

    addHighlight({
      text: selectedText,
      color: activeColor,
      sectionId,
      subsectionId,
      location: 'question',
      questionId: question.id,
      startOffset: selectedIndex,
      endOffset: selectedIndex + selectedText.length,
    });

    selection.removeAllRanges();
  };

  const handleAddNote = () => {
    addNote({
      content: '',
      sectionId,
      subsectionId,
      location: 'question',
      questionId: question.id,
      position: { x: 100, y: 100 },
    });
  };

  const handleClearHighlights = () => {
    batchRemoveHighlights(highlights.map(h => h.id));
  };

  return (
    <Card 
      data-question-id={question.id}
      className={cn(
        "w-full card-shadow transition-smooth overflow-hidden relative",
        "hover:elevated-shadow hover:border-primary/20"
      )}
    >
      <div className="p-4 md:p-6 space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <HighlightToolbar
            activeColor={activeColor}
            onColorChange={setActiveColor}
            onAddNote={handleAddNote}
            onClearHighlights={handleClearHighlights}
            isEraserMode={isEraserMode}
            onEraserToggle={() => setIsEraserMode(!isEraserMode)}
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              console.log('[QuestionCard] Bookmark button clicked for question:', {
                id: question.id,
                sectionId,
                subsectionId,
              });
              (async () => {
                try {
                  console.log('[QuestionCard] Bookmark button handler: attempting to toggle bookmark');
                  await toggleBookmark(question.id, sectionId, subsectionId);
                  console.log('[QuestionCard] Bookmark toggle completed successfully');
                  // Force a fresh fetch of bookmarks to ensure all views update
                  console.log('[QuestionCard] Force refetching bookmarks...');
                  await queryClient.refetchQueries({ queryKey: ['/api/bookmarks'] });
                  console.log('[QuestionCard] Bookmarks refetch completed');
                } catch (error) {
                  console.error('[QuestionCard] Bookmark toggle error:', error);
                }
              })();
            }}
            disabled={isBookmarkPending}
            data-testid={`button-bookmark-${question.id}`}
            className={cn(
              "flex-shrink-0 transition-colors",
              questionIsBookmarked && "text-accent"
            )}
          >
            <Bookmark className={cn("h-5 w-5", questionIsBookmarked && "fill-accent")} />
          </Button>
        </div>
        
        <div className="flex items-start gap-3 md:gap-4">
          <div className="flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xs md:text-sm font-semibold text-primary">{index + 1}</span>
          </div>
          <div className={cn("flex-1 min-w-0", isEraserMode && "eraser-mode")} ref={questionRef} onMouseUp={handleTextSelection}>
            <div className="text-sm md:text-base leading-relaxed text-foreground mb-3 md:mb-4">
              <ReactMarkdown
                skipHtml
                components={{
                  p: ({ node, ...props }) => <p className="whitespace-pre-wrap" {...props} />,
                }}
              >
                {parsed.text}
              </ReactMarkdown>
            </div>
            
            {parsed.choices.length > 0 && (
              <RadioGroup value={selectedAnswer || ''} onValueChange={handleAnswerChange} className="w-full">
                <div className="w-full space-y-2">
                  {parsed.choices.map((choice) => {
                    const showResult = selectedAnswer && showExplanation;
                    const isThisChoice = choice.letter === selectedAnswer;
                    const isCorrectChoice = choice.letter === correctAnswer;
                    
                    let choiceClassName = "w-full flex items-start space-x-2 md:space-x-3 p-2 md:p-3 rounded-lg border transition-colors text-sm md:text-base";
                    
                    if (showResult && isThisChoice) {
                      // Highlight selected answer
                      if (isCorrect) {
                        choiceClassName += " bg-green-500/20 border-green-500/50";
                      } else {
                        choiceClassName += " bg-red-500/20 border-red-500/50";
                      }
                    } else if (showResult && isCorrectChoice && !isCorrect) {
                      // Also highlight the correct answer when wrong answer is selected
                      choiceClassName += " bg-green-500/10 border-green-500/30";
                    } else if (!showResult) {
                      choiceClassName += " hover:bg-accent/5";
                    }
                    
                    const isCrossedOut = crossedOutChoices.has(choice.letter);
                    const canSelect = !showExplanation;

                    return (
                      <div
                        key={choice.letter}
                        role="button"
                        tabIndex={canSelect ? 0 : undefined}
                        className={cn(
                          choiceClassName,
                          canSelect ? "cursor-pointer" : "cursor-context-menu",
                          isCrossedOut && "opacity-50"
                        )}
                        onClick={canSelect ? () => handleAnswerChange(choice.letter) : undefined}
                        onKeyDown={canSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAnswerChange(choice.letter); } } : undefined}
                        onContextMenu={(e) => handleChoiceRightClick(e, choice.letter)}
                        data-testid={`choice-${question.id}-${choice.letter}`}
                      >
                        <RadioGroupItem 
                          value={choice.letter} 
                          id={`${question.id}-${choice.letter}`}
                          disabled={showExplanation}
                        />
                        <Label
                          htmlFor={`${question.id}-${choice.letter}`}
                          className={cn(
                            "flex-1 cursor-pointer font-normal",
                            showExplanation && "cursor-default",
                            isCrossedOut && "line-through text-muted-foreground"
                          )}
                        >
                          <span className="font-semibold">{choice.letter}.</span>{' '}
                          <ReactMarkdown
                            skipHtml
                            components={{
                              p: ({ node, children, ...props }) => <span {...props}>{children}</span>,
                            }}
                          >
                            {choice.text}
                          </ReactMarkdown>
                          {showResult && isThisChoice && (
                            <span className={cn(
                              "ml-2 text-xs font-semibold",
                              isCorrect ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                            )}>
                              {isCorrect ? "✓ Correct" : "✗ Incorrect"}
                            </span>
                          )}
                          {showResult && isCorrectChoice && !isCorrect && (
                            <span className="ml-2 text-xs font-semibold text-green-600 dark:text-green-400">
                              ✓ Correct Answer
                            </span>
                          )}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            )}
            
            {selectedAnswer && !showExplanation && (
              <Button
                onClick={handleAnswerClick}
                className="mt-4"
                size="sm"
                data-testid="button-show-answer"
              >
                Show Answer
              </Button>
            )}

            {showExplanation && (
              <div className="mt-4 pt-4 border-t border-border animate-in slide-in-from-top-2 duration-300">
                {isCorrect !== null && (
                  <div className={cn(
                    "mb-4 p-3 rounded-lg border-l-4 font-semibold",
                    isCorrect 
                      ? "bg-green-500/10 border-green-500 text-green-700 dark:text-green-300"
                      : "bg-red-500/10 border-red-500 text-red-700 dark:text-red-300"
                  )}>
                    {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
                  </div>
                )}
                <div className="bg-accent/5 border-l-4 border-accent rounded-r-lg p-4">
                  <p className="text-sm font-semibold text-accent mb-2">Answer & Explanation</p>
                  <div className="text-sm leading-relaxed text-foreground/90">
                    <ReactMarkdown
                      skipHtml
                      components={{
                        p: ({ node, ...props }) => <p className="whitespace-pre-wrap my-1" {...props} />,
                      }}
                    >
                      {question.answer}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {notes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          content={note.content}
          position={note.position}
          onUpdate={updateNote}
          onDelete={removeNote}
          onPositionChange={updateNotePosition}
        />
      ))}
    </Card>
  );
}

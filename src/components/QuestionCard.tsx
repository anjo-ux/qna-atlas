import { useState, useMemo, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';
import { useHighlights } from '@/hooks/useHighlights';
import { HighlightToolbar } from '@/components/HighlightToolbar';
import { StickyNote } from '@/components/StickyNote';
import { useTextHighlight } from '@/hooks/useTextHighlight';
import { QuestionResponse } from '@/hooks/useQuestionStats';

interface QuestionCardProps {
  question: Question;
  index: number;
  sectionId: string;
  subsectionId: string;
  savedResponse?: QuestionResponse;
  onAnswerSubmit: (questionId: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean) => void;
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
  onAnswerSubmit 
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(savedResponse?.selectedAnswer || null);
  const [showExplanation, setShowExplanation] = useState(!!savedResponse);

  const {
    activeColor,
    setActiveColor,
    addHighlight,
    removeHighlight,
    addNote,
    updateNote,
    removeNote,
    getHighlightsForSection,
    getNotesForSection,
  } = useHighlights();

  const highlights = getHighlightsForSection(sectionId, subsectionId, 'question', question.id);
  const notes = getNotesForSection(sectionId, subsectionId, 'question', question.id);
  const questionRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo((): ParsedQuestion => {
    const lines = question.question.split('\n');
    const choices: { letter: string; text: string }[] = [];
    const textLines: string[] = [];
    
    for (const line of lines) {
      const match = line.match(/^([A-E])[.)]\s*(.+)$/);
      if (match) {
        choices.push({ letter: match[1], text: match[2].trim() });
      } else if (line.trim()) {
        textLines.push(line);
      }
    }
    
    return { text: textLines.join('\n'), choices };
  }, [question.question]);

  // Apply highlights to question text
  const questionContent = parsed.text + '\n' + parsed.choices.map(c => `${c.letter}. ${c.text}`).join('\n');
  useTextHighlight(questionRef, highlights, questionContent);

  const correctAnswer = useMemo(() => {
    // Extract correct answer from the answer text
    const match = question.answer.match(/(?:correct answer is|answer is|correct response is|response is)\s*(?:option\s+)?([A-E])/i);
    return match ? match[1].toUpperCase() : null;
  }, [question.answer]);

  const isCorrect = useMemo(() => {
    if (!selectedAnswer || !correctAnswer) return null;
    return selectedAnswer.toUpperCase() === correctAnswer;
  }, [selectedAnswer, correctAnswer]);

  // Load saved response
  useEffect(() => {
    if (savedResponse) {
      setSelectedAnswer(savedResponse.selectedAnswer);
      setShowExplanation(true);
    }
  }, [savedResponse]);

  const handleAnswerClick = () => {
    if (selectedAnswer && !showExplanation && correctAnswer) {
      const correct = selectedAnswer.toUpperCase() === correctAnswer;
      setShowExplanation(true);
      onAnswerSubmit(question.id, selectedAnswer, correctAnswer, correct);
    }
  };


  const handleTextSelection = () => {
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
    highlights.forEach(h => removeHighlight(h.id));
  };

  return (
    <Card 
      data-question-id={question.id}
      className={cn(
        "card-shadow transition-smooth overflow-hidden relative",
        "hover:elevated-shadow hover:border-primary/20"
      )}
    >
      <div className="p-6 space-y-4">
        <HighlightToolbar
          activeColor={activeColor}
          onColorChange={setActiveColor}
          onAddNote={handleAddNote}
          onClearHighlights={handleClearHighlights}
        />
        
        <div className="flex items-start gap-4" ref={questionRef} onMouseUp={handleTextSelection}>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">{index + 1}</span>
          </div>
          <div className="flex-1">
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap mb-4">
              {parsed.text}
            </p>
            
            {parsed.choices.length > 0 && (
              <RadioGroup value={selectedAnswer || ''} onValueChange={setSelectedAnswer}>
                <div className="space-y-2">
                  {parsed.choices.map((choice) => {
                    const showResult = selectedAnswer && showExplanation;
                    const isThisChoice = choice.letter === selectedAnswer;
                    const isCorrectChoice = choice.letter === correctAnswer;
                    
                    let choiceClassName = "flex items-start space-x-3 p-3 rounded-lg border transition-colors";
                    
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
                    
                    return (
                      <div
                        key={choice.letter}
                        className={choiceClassName}
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
                            showExplanation && "cursor-default"
                          )}
                        >
                          <span className="font-semibold">{choice.letter}.</span> {choice.text}
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
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {question.answer}
                  </p>
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
        />
      ))}
    </Card>
  );
}

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  index: number;
}

interface ParsedQuestion {
  text: string;
  choices: { letter: string; text: string }[];
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

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

  const correctAnswer = useMemo(() => {
    const match = question.answer.match(/(?:correct answer is|answer is)\s*([A-E])/i);
    return match ? match[1].toUpperCase() : null;
  }, [question.answer]);

  const handleAnswerClick = () => {
    if (selectedAnswer && !showExplanation) {
      setShowExplanation(true);
    }
  };

  return (
    <Card className={cn(
      "card-shadow transition-smooth overflow-hidden",
      "hover:elevated-shadow hover:border-primary/20"
    )}>
      <div className="p-6">
        <div className="flex items-start gap-4">
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
                    
                    return (
                      <div
                        key={choice.letter}
                        className={cn(
                          "flex items-start space-x-3 p-3 rounded-lg border transition-colors",
                          showResult && "bg-primary/10 border-primary/30",
                          !showResult && "hover:bg-accent/5"
                        )}
                      >
                        <RadioGroupItem value={choice.letter} id={`${question.id}-${choice.letter}`} />
                        <Label
                          htmlFor={`${question.id}-${choice.letter}`}
                          className="flex-1 cursor-pointer font-normal"
                        >
                          <span className="font-semibold">{choice.letter}.</span> {choice.text}
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
    </Card>
  );
}

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');

  // Parse question to extract main question and choices
  const parseQuestion = () => {
    const lines = question.question.split('\n');
    const questionText = lines[0];
    const choices: { letter: string; text: string }[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const match = lines[i].match(/^([A-E])\.\s*(.+)$/);
      if (match) {
        choices.push({ letter: match[1], text: match[2] });
      }
    }
    
    return { questionText, choices };
  };

  // Extract correct answer from the answer text
  const getCorrectAnswer = () => {
    const match = question.answer.match(/^([A-E])\./);
    return match ? match[1] : '';
  };

  const { questionText, choices } = parseQuestion();
  const correctAnswer = getCorrectAnswer();

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
            <p className="text-base leading-relaxed text-foreground mb-6">
              {questionText}
            </p>
            
            {choices.length > 0 && (
              <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer} className="space-y-3 mb-6">
                {choices.map((choice) => {
                  const isCorrect = choice.letter === correctAnswer;
                  const isSelected = selectedAnswer === choice.letter;
                  const showFeedback = isOpen && isSelected;
                  
                  return (
                    <div
                      key={choice.letter}
                      className={cn(
                        "flex items-start space-x-3 p-3 rounded-lg border transition-all cursor-pointer",
                        showFeedback && isCorrect && "bg-green-50 dark:bg-green-950/20 border-green-500",
                        showFeedback && !isCorrect && "bg-red-50 dark:bg-red-950/20 border-red-500",
                        !showFeedback && "border-border hover:border-primary/50 hover:bg-accent/5"
                      )}
                    >
                      <RadioGroupItem value={choice.letter} id={`q${index}-${choice.letter}`} className="mt-1" />
                      <Label
                        htmlFor={`q${index}-${choice.letter}`}
                        className="flex-1 cursor-pointer leading-relaxed"
                      >
                        <span className="font-semibold">{choice.letter}.</span> {choice.text}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="mt-4 text-primary hover:text-primary hover:bg-primary/5 gap-2"
            >
              {isOpen ? (
                <>
                  Hide Answer <ChevronUp className="h-4 w-4" />
                </>
              ) : (
                <>
                  Show Answer <ChevronDown className="h-4 w-4" />
                </>
              )}
            </Button>

            {isOpen && (
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

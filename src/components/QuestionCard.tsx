import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Question } from '@/types/question';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: Question;
  index: number;
}

export function QuestionCard({ question, index }: QuestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);

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
            <p className="text-base leading-relaxed text-foreground whitespace-pre-wrap">
              {question.question}
            </p>
            
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

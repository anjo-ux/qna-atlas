import { Card } from '@/components/ui/card';
import { CheckCircle2, XCircle, Circle } from 'lucide-react';
import { SubsectionStats } from '@/hooks/useQuestionStats';
import { cn } from '@/lib/utils';

interface QuestionStatsProps {
  stats: SubsectionStats;
  className?: string;
}

export function QuestionStats({ stats, className }: QuestionStatsProps) {
  const percentage = stats.answered > 0 
    ? Math.round((stats.correct / stats.answered) * 100) 
    : 0;

  return (
    <Card className={cn('p-4 bg-accent/5', className)}>
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Progress</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold text-foreground">{stats.answered}</span>
            </div>
            <span className="text-xs text-muted-foreground">Answered</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="text-lg font-bold text-green-600 dark:text-green-400">{stats.correct}</span>
            </div>
            <span className="text-xs text-muted-foreground">Correct</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <span className="text-lg font-bold text-red-600 dark:text-red-400">{stats.incorrect}</span>
            </div>
            <span className="text-xs text-muted-foreground">Incorrect</span>
          </div>
        </div>

        {stats.answered > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-muted-foreground">Accuracy</span>
              <span className="text-sm font-semibold text-foreground">{percentage}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

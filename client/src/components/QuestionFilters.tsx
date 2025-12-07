import { Button } from '@/components/ui/button';
import { RotateCcw, Filter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface QuestionFiltersProps {
  filterMode: 'all' | 'incorrect' | 'unanswered';
  onFilterChange: (mode: 'all' | 'incorrect' | 'unanswered') => void;
  onResetSubsection: () => void;
  onResetAll: () => void;
  incorrectCount: number;
  unansweredCount: number;
}

export function QuestionFilters({
  filterMode,
  onFilterChange,
  onResetSubsection,
  onResetAll,
  incorrectCount,
  unansweredCount,
}: QuestionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter Toggle */}
      <div className="flex items-center gap-1 bg-accent/5 rounded-lg p-1">
        <Button
          variant={filterMode === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('all')}
          className="h-8"
        >
          All Questions
        </Button>
        <Button
          variant={filterMode === 'incorrect' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('incorrect')}
          className={cn('h-8 gap-2', incorrectCount === 0 && 'opacity-50')}
          disabled={incorrectCount === 0}
        >
          <Filter className="h-3 w-3" />
          Incorrect ({incorrectCount})
        </Button>
        <Button
          variant={filterMode === 'unanswered' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onFilterChange('unanswered')}
          className={cn('h-8', unansweredCount === 0 && 'opacity-50')}
          disabled={unansweredCount === 0}
        >
          Unanswered ({unansweredCount})
        </Button>
      </div>

      {/* Reset Buttons */}
      <div className="flex items-center gap-1">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Section
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset This Section?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your answers for this subsection. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onResetSubsection}>
                Reset Section
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2"
            >
              <X className="h-3 w-3" />
              <span className="hidden sm:inline">Reset All</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reset All Sections?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear all your answers across all sections and subsections. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onResetAll} className="bg-destructive hover:bg-destructive/90">
                Reset All
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

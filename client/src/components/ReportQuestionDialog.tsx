import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { apiRequest } from '@/lib/queryClient';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionId: string;
}

export function ReportQuestionDialog({
  open,
  onOpenChange,
  questionId,
}: ReportQuestionDialogProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) {
      toast.error('Please describe what is wrong with this question.');
      return;
    }
    setIsSubmitting(true);
    try {
      await apiRequest('/api/report-question', {
        method: 'POST',
        body: JSON.stringify({ questionId, message: trimmed }),
      });
      toast.success('Report sent. Thank you for helping us improve.');
      setMessage('');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (!next && !isSubmitting) {
      setMessage('');
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        overlayClassName="max-sm:bg-black/45 max-sm:backdrop-blur-md"
        className={cn(
          'sm:max-w-md',
          // Mobile: iOS-style frosted sheet — large radius, liquid glass, no harsh border
          'max-sm:max-h-[min(88vh,720px)] max-sm:overflow-hidden max-sm:gap-0 max-sm:p-0 max-sm:pb-2',
          /* Avoid 100vw here for same scrollbar gutter / subpixel edge lines */
          'max-sm:w-[calc(100%-1.5rem)] max-sm:max-w-lg max-sm:rounded-[1.375rem]',
          'max-sm:border max-sm:border-white/25 max-sm:shadow-2xl max-sm:shadow-black/25',
          'max-sm:bg-background/55 max-sm:dark:bg-background/45',
          'max-sm:backdrop-blur-2xl max-sm:backdrop-saturate-150',
          'dark:max-sm:border-white/12',
          // Radix close is a direct child of DialogContent
          '[&>button.absolute]:max-sm:right-5 [&>button.absolute]:max-sm:top-4'
        )}
      >
        <div className="max-sm:px-5 max-sm:pt-5 max-sm:pb-1 sm:p-0 sm:contents">
          <DialogHeader className="max-sm:space-y-3 max-sm:text-center sm:text-left">
            <DialogTitle className="max-sm:text-[1.0625rem] max-sm:font-semibold max-sm:tracking-tight">
              Report Question
            </DialogTitle>
            <DialogDescription className="max-sm:text-[0.8125rem] max-sm:leading-relaxed max-sm:text-muted-foreground">
              Describe what is wrong with this question. Your report will be sent to our support team for further review.
            </DialogDescription>
          </DialogHeader>
        </div>
        <form
          className="max-sm:contents sm:block"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
        >
          <div className="grid gap-4 py-4 max-sm:px-5 max-sm:py-4 sm:py-4">
            <div className="grid gap-2">
              <label
                htmlFor="report-message"
                className="text-sm font-medium max-sm:text-center max-sm:text-[0.8125rem] max-sm:font-semibold sm:text-left"
              >
                Tell us what&apos;s wrong. We will do our best to fix it.
              </label>
              <Textarea
                id="report-message"
                placeholder="Typo in the question, wrong answer marked as correct, unclear explanation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className={cn(
                  'resize-none',
                  'max-sm:min-h-[7.5rem] max-sm:rounded-2xl max-sm:border-white/20 max-sm:bg-background/40 max-sm:dark:bg-black/25',
                  'max-sm:backdrop-blur-sm max-sm:text-[0.9375rem] max-sm:leading-relaxed',
                  'focus-visible:max-sm:ring-primary/40'
                )}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Desktop / tablet: default buttons */}
          <DialogFooter className="hidden sm:flex sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={() => handleSubmit()}>
              {isSubmitting ? 'Sending…' : 'Send Report'}
            </Button>
          </DialogFooter>

          {/* Mobile: iOS action-sheet style actions */}
          <div
            className={cn(
              'mt-1 flex flex-col overflow-hidden rounded-2xl sm:hidden',
              'border border-white/20 bg-black/[0.06] dark:border-white/10 dark:bg-white/[0.06]',
              'mx-5 mb-3'
            )}
          >
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
              className={cn(
                'min-h-12 w-full px-4 py-3 text-base font-semibold text-primary',
                'active:bg-black/10 dark:active:bg-white/10',
                'disabled:opacity-50'
              )}
            >
              {isSubmitting ? 'Sending…' : 'Send Report'}
            </button>
            <div
              className="h-px w-full shrink-0 bg-border/60 dark:bg-white/15"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
              className={cn(
                'min-h-12 w-full px-4 py-3 text-base font-normal text-foreground',
                'active:bg-black/10 dark:active:bg-white/10',
                'disabled:opacity-50'
              )}
            >
              Cancel
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

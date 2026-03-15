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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Question</DialogTitle>
          <DialogDescription>
            Describe what is wrong with this question. Your report will be sent to our support team for further review.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
        >
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="report-message" className="text-sm font-medium">
                Tell us what&apos;s wrong. We will do our best to fix it.
              </label>
              <Textarea
                id="report-message"
                placeholder="Typo in the question, wrong answer marked as correct, unclear explanation..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit()}
            >
              {isSubmitting ? 'Sending…' : 'Send Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

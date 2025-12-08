import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { TestSession } from '@/hooks/useTestSessions';
import { Clock, CheckCircle2, Play, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const capitalizeWords = (str: string) => {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
};

interface TestHistoryProps {
  sessions: TestSession[];
  onResume?: (session: TestSession) => void;
  onReview?: (session: TestSession) => void;
  onDelete?: (sessionId: string) => void;
  maxItems?: number;
  startIndex?: number;
}

export function TestHistory({ sessions, onResume, onReview, onDelete, maxItems, startIndex = 1 }: TestHistoryProps) {
  const [sessionsWithResponses, setSessionsWithResponses] = useState<TestSession[]>(sessions);

  // Fetch responses for completed sessions
  useEffect(() => {
    const loadResponses = async () => {
      const updated = await Promise.all(
        sessions.map(async (session) => {
          // Only fetch responses if not already loaded
          if (session.status === 'completed' && Object.keys(session.responses).length === 0) {
            try {
              const res = await fetch(`/api/test-sessions/${session.id}/responses`, {
                credentials: 'include',
              });
              if (res.ok) {
                const responses = await res.json();
                const responsesMap: Record<string, any> = {};
                responses.forEach((r: any) => {
                  responsesMap[r.questionId] = {
                    questionId: r.questionId,
                    isCorrect: r.isCorrect,
                  };
                });
                return { ...session, responses: responsesMap };
              }
            } catch (error) {
              console.error('Error loading responses:', error);
            }
          }
          return session;
        })
      );
      setSessionsWithResponses(updated);
    };

    loadResponses();
  }, [sessions]);

  // Sort by most recent first
  const sortedSessions = [...sessionsWithResponses].sort((a, b) => b.createdAt - a.createdAt);
  const displaySessions = maxItems ? sortedSessions.slice(0, maxItems) : sortedSessions;

  if (sessions.length === 0) {
    return (
      <Card className="p-4 md:p-8 text-center border-dashed">
        <Clock className="h-10 md:h-12 w-10 md:w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-base md:text-lg font-semibold mb-1">No Tests Yet</h3>
        <p className="text-xs md:text-base text-muted-foreground">Create your first test to get started</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {displaySessions.map((session, index) => {
        const totalAnswered = Object.keys(session.responses).length;
        const correctAnswers = Object.values(session.responses).filter(r => r.isCorrect).length;
        const accuracy = totalAnswered > 0 ? Math.round((correctAnswers / totalAnswered) * 100) : 0;
        const isComplete = session.status === 'completed';
        const createdDate = new Date(session.createdAt);

        return (
          <Card
            key={session.id}
            className="p-4 hover:bg-accent/5 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-foreground truncate">
                    #{startIndex + index}
                  </h3>
                  <div className="flex items-center gap-1">
                    {isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                    )}
                    <span className="text-xs font-medium text-muted-foreground">
                      {isComplete ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="text-xs text-muted-foreground">
                    {createdDate.toLocaleString('en-US', { 
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                    <span>{capitalizeWords(formatDistanceToNow(createdDate, { addSuffix: true }))}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>Answered</span>
                    {isComplete && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <span className="text-success font-semibold">
                          {correctAnswers} Correct ({accuracy}%)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!isComplete && onResume && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onResume(session)}
                    className="gap-1"
                    data-testid={`button-resume-test-${session.id}`}
                  >
                    <Play className="h-3 w-3" />
                    <span className="hidden sm:inline">Resume</span>
                  </Button>
                )}

                {isComplete && onReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onReview(session)}
                    className="gap-1"
                    data-testid={`button-review-test-${session.id}`}
                  >
                    <Play className="h-3 w-3" />
                    <span className="hidden sm:inline">Review</span>
                  </Button>
                )}

                {onDelete && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`button-delete-test-${session.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Test?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete this test and all its responses. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDelete(session.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          data-testid="button-confirm-delete"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

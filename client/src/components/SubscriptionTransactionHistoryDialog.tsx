import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SubscriptionTransactionRow = {
  id: string;
  planName: string;
  /** From plan row; used to label recurring monthly charges */
  planDurationMonths?: number | null;
  amountCents: number;
  status: string;
  createdAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  canceledAt: string | null;
  stripeReceiptOrInvoiceUrl: string | null;
  /** True if a Stripe payment intent or invoice id exists on the record */
  hasStripeIds?: boolean;
  /** Synthetic row for institution-code access (from API) */
  isInstitutionalGrant?: boolean;
  /** Current trial window row (7-day free trial) */
  isTrialPeriod?: boolean;
};

type Response = { transactions: SubscriptionTransactionRow[] };

interface SubscriptionTransactionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatShortDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** User-facing status from DB value */
function displayStatus(status: string): string {
  const s = (status || '').toLowerCase();
  if (s === 'canceled' || s === 'cancelled') return 'Cancelled';
  if (s === 'completed') return 'Completed';
  if (s === 'pending') return 'Pending';
  if (s === 'failed') return 'Failed';
  return status;
}

function isCanceledRow(t: SubscriptionTransactionRow): boolean {
  const s = (t.status || '').toLowerCase();
  return s === 'canceled' || s === 'cancelled';
}

export function SubscriptionTransactionHistoryDialog({
  open,
  onOpenChange,
}: SubscriptionTransactionHistoryDialogProps) {
  const { data, isLoading, isError, refetch } = useQuery<Response>({
    queryKey: ['/api/subscription/transactions'],
    enabled: open,
    staleTime: 60 * 1000,
  });

  const txs = data?.transactions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-2 text-left">
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Transaction History
          </DialogTitle>
          <DialogDescription>
            View all your past and current subscription transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1 min-h-0 flex flex-col gap-3">
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Loading…
            </div>
          )}

          {isError && (
            <div className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
              Could not load transactions.{' '}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !isError && txs.length === 0 && (
            <p className="text-sm text-muted-foreground py-6">No transactions found.</p>
          )}

          {!isLoading && !isError && txs.length > 0 && (
            <ul className="space-y-3 overflow-y-auto max-h-[55vh] pr-1 -mr-1">
              {txs.map((t) => {
                const hasUrl = !!t.stripeReceiptOrInvoiceUrl?.trim();
                const canceled = isCanceledRow(t);
                const statusLabel = displayStatus(t.status);
                const periodLine = (() => {
                  if (t.isInstitutionalGrant) return null;
                  if (canceled) {
                    const began = t.periodStart ?? t.createdAt;
                    if (t.periodEnd && t.canceledAt) {
                      const endMs = new Date(t.periodEnd).getTime();
                      const canceledMs = new Date(t.canceledAt).getTime();
                      // Cancel-at-period-end: keep showing access through original period end.
                      if (endMs > canceledMs) {
                        return (
                          <>
                            Access {formatShortDate(began)} – {formatShortDate(t.periodEnd)}
                          </>
                        );
                      }
                    }
                    if (t.canceledAt) {
                      return (
                        <>
                          Access {formatShortDate(began)} – {formatShortDate(t.canceledAt)}
                        </>
                      );
                    }
                    return <>Access {formatShortDate(began)} – Cancelled</>;
                  }
                  const start = t.periodStart ?? t.createdAt;
                  const end = t.periodEnd;
                  if (start && end) {
                    return (
                      <>
                        Access {formatShortDate(start)} – {formatShortDate(end)}
                      </>
                    );
                  }
                  if (t.createdAt && end) {
                    return (
                      <>
                        Access {formatShortDate(t.createdAt)} – {formatShortDate(end)}
                      </>
                    );
                  }
                  return t.createdAt ? formatShortDate(t.createdAt) : '—';
                })();

                const recurringHint =
                  t.isTrialPeriod
                    ? '7-Day Free Trial'
                    : !t.isInstitutionalGrant &&
                        !canceled &&
                        (t.status || '').toLowerCase() === 'completed' &&
                        t.amountCents > 0 &&
                        t.planDurationMonths === 1 &&
                        t.hasStripeIds
                      ? 'Monthly Subscription Charged'
                      : null;

                return (
                  <li
                    key={t.id}
                    className={cn(
                      'rounded-lg border border-border bg-card p-3 text-sm',
                      'flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'
                    )}
                  >
                    <div className="min-w-0 space-y-0.5">
                      {t.isInstitutionalGrant ? (
                        <>
                          <p className={cn('font-semibold', canceled ? 'text-destructive' : 'text-foreground')}>
                            {canceled ? 'Cancelled' : 'Institutional Access'}
                          </p>
                          <p className="text-muted-foreground text-xs">{t.planName}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.periodStart && t.periodEnd
                              ? `Access ${formatShortDate(t.periodStart)} – ${formatShortDate(t.periodEnd)}`
                              : t.periodEnd
                                ? `Access — ${formatShortDate(t.periodEnd)}`
                                : 'Institution Code'}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold text-foreground capitalize">
                            {t.planName.replace(/-/g, ' ')}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatMoney(t.amountCents)}{' '}
                            <span className={cn(canceled && 'text-destructive font-medium')}>
                              - {statusLabel}
                            </span>
                          </p>
                          {periodLine && (
                            <p className="text-xs text-muted-foreground">{periodLine}</p>
                          )}
                          {recurringHint && (
                            <p className="text-xs text-muted-foreground/80">{recurringHint}</p>
                          )}
                        </>
                      )}
                    </div>
                    <div className="shrink-0 flex sm:flex-col gap-2 sm:items-end">
                      {t.isInstitutionalGrant && !canceled ? (
                        <span className="text-xs text-muted-foreground font-medium px-1">
                          Institutional Access
                        </span>
                      ) : t.isInstitutionalGrant ? null : hasUrl ? (
                        <Button variant="outline" size="sm" asChild className="gap-1 font-medium">
                          <a href={t.stripeReceiptOrInvoiceUrl!} target="_blank" rel="noopener noreferrer">
                            View Invoice
                          </a>
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium px-1 text-right">
                          Invoice Unavailable - Contact Support
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

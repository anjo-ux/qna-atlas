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
  amountCents: number;
  status: string;
  createdAt: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  stripeReceiptOrInvoiceUrl: string | null;
  /** True if a Stripe payment intent or invoice id exists on the record */
  hasStripeIds?: boolean;
  /** Synthetic row for institution-code access (from API) */
  isInstitutionalGrant?: boolean;
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
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden sm:rounded-lg">
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
                const hasStripeIds = t.hasStripeIds === true;
                const rightLabel = hasUrl
                  ? null
                  : hasStripeIds
                    ? 'unavailable'
                    : 'code';

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
                        <p className="font-semibold text-foreground">Institutional Access</p>
                        <p className="text-muted-foreground text-xs">{t.planName}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.periodEnd ? `Access Through ${formatShortDate(t.periodEnd)}` : 'Institution Code'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-foreground capitalize">{t.planName.replace(/-/g, ' ')}</p>
                        <p className="text-muted-foreground text-xs">
                          {t.amountCents > 0 ? `${formatMoney(t.amountCents)} · ` : null}
                          {t.status}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.createdAt ? formatShortDate(t.createdAt) : '—'}
                          {t.periodEnd ? ` · through ${formatShortDate(t.periodEnd)}` : null}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="shrink-0 flex sm:flex-col gap-2 sm:items-end">
                    {hasUrl ? (
                      <Button variant="outline" size="sm" asChild className="gap-1 font-medium">
                        <a href={t.stripeReceiptOrInvoiceUrl!} target="_blank" rel="noopener noreferrer">
                          Invoice →
                        </a>
                      </Button>
                    ) : rightLabel === 'unavailable' ? (
                      <span className="text-xs text-muted-foreground px-1">Receipt Unavailable</span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium px-1">Code Redeemed</span>
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

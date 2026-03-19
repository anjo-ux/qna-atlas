import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Check, AlertCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { SubscriptionTransactionHistoryDialog } from '@/components/SubscriptionTransactionHistoryDialog';
import { cn } from '@/lib/utils';

const PAID_PERSONAL_PLANS = ['monthly', '6-month', '1-year'] as const;

interface SubscriptionDetails {
  plan?: string;
  status: string;
  institutionalAffiliation?: string;
  endsAt?: string;
  trialEndsAt?: string;
  daysRemaining: number | null;
  transactionCount: number;
  planPrice?: number;
}

interface MobileSubscriptionWidgetProps {
  hasEmoryAccess?: boolean;
}

export function MobileSubscriptionWidget({ hasEmoryAccess = false }: MobileSubscriptionWidgetProps) {
  const [isChangingPlan, setIsChangingPlan] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);

  const { data: subscription } = useQuery<SubscriptionDetails>({
    queryKey: ['/api/subscription/details'],
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/subscription/cancel', { method: 'POST' });
    },
    onSuccess: async (data: { message?: string; removedInstitutional?: boolean } | null) => {
      toast.success(data?.message ?? 'Subscription canceled.');
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['/api/subscription'] }),
        queryClient.refetchQueries({ queryKey: ['/api/subscription/details'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/subscription/transactions'] }),
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] }),
      ]);
    },
    onError: (error: any) => {
      const msg = error.message || 'Failed to cancel subscription.';
      toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : msg + '.');
    },
  });

  const planDisplayName = (name: string) => {
    const labels: Record<string, string> = { monthly: 'Monthly', '6-month': '6-Month Plan', '1-year': '1-Year Plan' };
    return labels[name] ?? name.charAt(0).toUpperCase() + name.slice(1);
  };

  const institutionalDisplayName = (affiliation: string) => {
    return affiliation?.trim() ?? '';
  };

  const isInstitutional = subscription?.status === 'institutional';
  const isTrial = subscription?.status === 'trial';
  const isActive = subscription?.status === 'active';
  const isCanceled = subscription?.status === 'canceled';
  const hasPaidPlanName =
    !!subscription?.plan && PAID_PERSONAL_PLANS.includes(subscription.plan as (typeof PAID_PERSONAL_PLANS)[number]);
  const isTrialOrExpired =
    isInstitutional ? false : !hasPaidPlanName || subscription?.status === 'expired';
  const showCancelSubscription = !isCanceled && (isInstitutional || hasPaidPlanName);
  const showUnlimitedTime = subscription?.daysRemaining == null;

  const formatDate = (iso?: string) => iso ? new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const formatDateMMDDYYYY = (iso?: string) => iso ? new Date(iso).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit', year: 'numeric' }) : '';

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-chart-1/20 min-w-0 overflow-hidden">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 flex-shrink-0" />
        Subscription
      </h2>

      <div className="space-y-4 min-w-0">
        {/* Grid with Plan and Status - stacks on very small screens */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
            {isInstitutional ? (
              <div className="mt-1 min-w-0">
                <p className="font-semibold text-foreground">Institutional Access</p>
                <p className="text-sm text-muted-foreground truncate" title={institutionalDisplayName(subscription?.institutionalAffiliation ?? '')}>
                  {institutionalDisplayName(subscription?.institutionalAffiliation ?? '')}
                </p>
              </div>
            ) : (
              <p className="font-semibold text-foreground mt-1 truncate">
                {subscription?.plan ? planDisplayName(subscription.plan) : 'Free Trial'}
              </p>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Status</p>
            <p className={`font-semibold mt-1 flex items-center gap-1 min-w-0 ${
              subscription?.status === 'expired' ? 'text-destructive' : 'text-success'
            }`}>
              {subscription?.status === 'expired' ? (
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
              ) : (
                <Check className="h-3 w-3 flex-shrink-0" />
              )}
              <span className="truncate">{subscription?.status === 'expired' ? 'Expired' : isCanceled ? 'Active until end date' : 'Active'}</span>
            </p>
          </div>
        </div>

        {subscription?.planPrice != null && !isInstitutional && (
          <div className="border-t border-border pt-4 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">Plan Price</p>
            <p className="font-semibold text-foreground mt-1">
              ${(subscription.planPrice / 100).toFixed(2)} / {subscription.plan === 'monthly' ? 'month' : subscription.plan === '6-month' ? '6 months' : 'year'}
            </p>
          </div>
        )}

        {/* Time remaining and end date side by side */}
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 min-w-0">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
              <p className="font-semibold text-foreground mt-1 break-words">
                {showUnlimitedTime
                  ? 'Unlimited'
                  : isTrial
                    ? `${subscription?.daysRemaining ?? 0} Trial Days Remaining`
                    : isActive
                      ? `${subscription?.daysRemaining ?? 0} Subscription Days Remaining`
                      : isInstitutional
                        ? `${subscription?.daysRemaining ?? 0} Days Remaining`
                        : subscription?.status === 'expired'
                          ? 'Expired'
                          : `${subscription?.daysRemaining ?? 0} days`}
              </p>
            </div>
            {(isTrial && subscription?.trialEndsAt) || ((isActive || isCanceled || isInstitutional) && subscription?.endsAt) ? (
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">
                  {isTrial ? 'Trial Ends' : isInstitutional ? 'Access Ends' : isCanceled ? 'Subscription Ends' : 'Next Billing Date'}
                </p>
                <p className="font-semibold text-foreground mt-1">
                  {isTrial && subscription?.trialEndsAt
                    ? formatDate(subscription.trialEndsAt)
                    : isCanceled && subscription?.endsAt
                      ? `Subscription Ends - ${formatDateMMDDYYYY(subscription.endsAt)}`
                      : subscription?.endsAt
                        ? formatDateMMDDYYYY(subscription.endsAt)
                        : ''}
                </p>
              </div>
            ) : null}
          </div>
        </div>

        {/* Subscription Details / History */}
        {((subscription?.transactionCount !== undefined && subscription.transactionCount > 0) ||
          subscription?.endsAt ||
          subscription?.trialEndsAt ||
          isInstitutional) && (
          <div
            className={cn(
              'bg-muted/30 rounded-lg p-3 border border-border',
              subscription?.transactionCount !== undefined &&
                subscription.transactionCount > 0 &&
                'cursor-pointer hover:bg-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring'
            )}
            role={subscription?.transactionCount && subscription.transactionCount > 0 ? 'button' : undefined}
            tabIndex={subscription?.transactionCount && subscription.transactionCount > 0 ? 0 : undefined}
            aria-label={
              subscription?.transactionCount
                ? 'View subscription transaction history and Stripe invoices'
                : undefined
            }
            onClick={() => {
              if (subscription?.transactionCount && subscription.transactionCount > 0) {
                setTransactionHistoryOpen(true);
              }
            }}
            onKeyDown={(e) => {
              if (
                (e.key === 'Enter' || e.key === ' ') &&
                subscription?.transactionCount &&
                subscription.transactionCount > 0
              ) {
                e.preventDefault();
                setTransactionHistoryOpen(true);
              }
            }}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm text-muted-foreground">Subscription Details</p>
              {subscription?.transactionCount !== undefined && subscription.transactionCount > 0 && (
                <span className="text-[10px] uppercase tracking-wide text-primary font-medium">Tap to view</span>
              )}
            </div>
            <div className="space-y-2">
              {subscription?.trialEndsAt && isTrial && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Trial Ends</span>
                  <span className="text-muted-foreground">{formatDate(subscription.trialEndsAt)}</span>
                </div>
              )}
              {(subscription?.endsAt && (isActive || isCanceled)) && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">{isCanceled ? 'Subscription Ends' : 'Renewal Date'}</span>
                  <span className="text-muted-foreground">{formatDateMMDDYYYY(subscription.endsAt)}</span>
                </div>
              )}
              {isInstitutional && subscription?.institutionalAffiliation?.trim() && (
                <div className="flex justify-between gap-2 text-xs min-w-0">
                  <span className="text-foreground shrink-0">Institution</span>
                  <span className="text-muted-foreground text-right truncate" title={subscription.institutionalAffiliation.trim()}>
                    {subscription.institutionalAffiliation.trim()}
                  </span>
                </div>
              )}
              {isInstitutional && subscription?.endsAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Access Ends</span>
                  <span className="text-muted-foreground">{formatDateMMDDYYYY(subscription.endsAt)}</span>
                </div>
              )}
              {isInstitutional && !subscription?.endsAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Access</span>
                  <span className="text-muted-foreground">Unlimited</span>
                </div>
              )}
              {subscription?.transactionCount !== undefined && subscription.transactionCount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-foreground">Transactions</span>
                  <span className="text-muted-foreground">{subscription.transactionCount}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2 min-w-0">
          <Dialog open={isChangingPlan} onOpenChange={setIsChangingPlan}>
            <DialogTrigger asChild>
              <Button 
                className="w-full"
                data-testid="button-mobile-upgrade-plan"
              >
                {isTrialOrExpired ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
            </DialogTrigger>
            <DialogContent hideCloseButton className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] p-0 gap-0 border-0 bg-transparent shadow-none overflow-y-auto overflow-x-hidden [&>button]:!hidden">
              <SubscriptionPlans asDialog={false} open={isChangingPlan} onOpenChange={setIsChangingPlan} />
            </DialogContent>
          </Dialog>

          {showCancelSubscription && (
            <>
              <Button
                variant="outline"
                className="w-full text-destructive hover:text-destructive"
                onClick={() => setCancelDialogOpen(true)}
                disabled={cancelSubscriptionMutation.isPending}
                data-testid="button-mobile-cancel"
              >
                {isInstitutional ? 'Remove Access' : 'Cancel Subscription'}
              </Button>
              <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {isInstitutional ? 'Remove institutional access?' : 'Cancel subscription?'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-2">
                      {isInstitutional ? (
                        <>
                          Your institutional access will end immediately. This account cannot redeem another
                          institutional code—you can subscribe for personal access anytime.
                        </>
                      ) : (
                        <>
                          This ends your subscription immediately on Atlas and in Stripe. If you are in a free
                          trial, it ends now and you will <strong>not</strong> be charged.
                        </>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>
                      {isInstitutional ? 'Keep Access' : 'Keep Subscription'}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => {
                        cancelSubscriptionMutation.mutate();
                        setCancelDialogOpen(false);
                      }}
                    >
                      {isInstitutional ? 'Remove Access' : 'Yes, Cancel Now'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      <SubscriptionTransactionHistoryDialog
        open={transactionHistoryOpen}
        onOpenChange={setTransactionHistoryOpen}
      />
    </Card>
  );
}

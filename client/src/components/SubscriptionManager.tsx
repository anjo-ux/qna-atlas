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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  priceUSD: number;
}

interface SubscriptionDetails {
  plan?: string;
  status: string;
  endsAt?: string;
  daysRemaining: number;
  transactionCount: number;
}

export function SubscriptionManager() {
  const [isChangingPlan, setIsChangingPlan] = useState(false);

  const { data: subscription } = useQuery<SubscriptionDetails>({
    queryKey: ['/api/subscription/details'],
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans'],
  });

  const changeSubscriptionMutation = useMutation({
    mutationFn: async (planId: string) => {
      return await apiRequest('/api/subscription/change', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
    },
    onSuccess: () => {
      toast.success('Subscription updated successfully!');
      setIsChangingPlan(false);
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/details'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change subscription');
    },
  });

  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/subscription/cancel', { method: 'POST' });
    },
    onSuccess: () => {
      toast.success('Subscription canceled. Trial access restored.');
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/details'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel subscription');
    },
  });

  const getPlanDetails = (plan: Plan) => {
    const monthlyPrice = plan.priceUSD / 100 / plan.durationMonths;
    return {
      displayName: `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''}`,
      price: `$${(plan.priceUSD / 100).toFixed(2)}`,
      monthlyPrice: `$${monthlyPrice.toFixed(2)}/mo`,
    };
  };

  const isTrialOrExpired = !subscription?.plan || subscription?.status === 'trial' || subscription?.status === 'expired';

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5" />
        Subscription
      </h2>

      <div className="space-y-4">
        {/* Current Plan */}
        <div>
          <p className="text-xs text-muted-foreground font-medium">Current Plan</p>
          <p className="font-semibold text-foreground mt-1">
            {subscription?.plan ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}` : 'Free Trial'}
          </p>
        </div>

        {/* Status */}
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground font-medium">Status</p>
          <p className={`font-semibold mt-1 flex items-center gap-2 ${
            subscription?.status === 'expired' ? 'text-destructive' : 'text-success'
          }`}>
            {subscription?.status === 'expired' ? (
              <>
                <AlertCircle className="h-4 w-4" />
                Expired
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Active
              </>
            )}
          </p>
        </div>

        {/* Time Remaining */}
        {subscription?.daysRemaining !== undefined && !isTrialOrExpired && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground font-medium">Time Remaining</p>
            <p className="font-semibold text-foreground mt-2">{subscription.daysRemaining} days</p>
          </div>
        )}

        {/* Renewal Date */}
        {subscription?.endsAt && !isTrialOrExpired && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground font-medium">Renews</p>
            <p className="font-semibold text-foreground mt-2">
              {new Date(subscription.endsAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="border-t border-border pt-4 space-y-2">
          <Dialog open={isChangingPlan} onOpenChange={setIsChangingPlan}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full"
                data-testid="button-change-plan"
              >
                {isTrialOrExpired ? 'Upgrade Plan' : 'Change Plan'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Choose a Plan</DialogTitle>
                <DialogDescription>
                  {isTrialOrExpired
                    ? 'Upgrade to premium access'
                    : 'Switch to a different subscription plan'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => {
                  const details = getPlanDetails(plan);
                  const isCurrentPlan = subscription?.plan === plan.name;
                  return (
                    <div
                      key={plan.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        isCurrentPlan
                          ? 'border-accent bg-accent/10'
                          : 'border-border hover:border-accent/50'
                      }`}
                      onClick={() => !isCurrentPlan && changeSubscriptionMutation.mutate(plan.id)}
                    >
                      <h4 className="font-semibold mb-2">{details.displayName}</h4>
                      <p className="text-lg font-bold mb-1">{details.price}</p>
                      <p className="text-xs text-muted-foreground mb-3">{details.monthlyPrice}</p>
                      <Button
                        size="sm"
                        className="w-full"
                        disabled={isCurrentPlan || changeSubscriptionMutation.isPending}
                        variant={isCurrentPlan ? 'secondary' : 'default'}
                      >
                        {isCurrentPlan ? 'Current Plan' : 'Select'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {!isTrialOrExpired && (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm('Are you sure you want to cancel your subscription?')) {
                  cancelSubscriptionMutation.mutate();
                }
              }}
              disabled={cancelSubscriptionMutation.isPending}
              data-testid="button-cancel-subscription"
            >
              Cancel Subscription
            </Button>
          )}
        </div>

        {/* Transaction History */}
        {subscription?.transactionCount !== undefined && subscription.transactionCount > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground font-medium">Transactions</p>
            <p className="text-sm text-foreground mt-1">{subscription.transactionCount} transaction{subscription.transactionCount !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

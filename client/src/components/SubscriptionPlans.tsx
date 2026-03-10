import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  priceUSD: number;
}

const PLAN_DISPLAY: Record<string, { title: string; shortLabel: string; price: string; billing: string; discount?: string; bestDeal?: boolean }> = {
  monthly: {
    title: 'Monthly Subscription',
    shortLabel: 'Monthly',
    price: '$50',
    billing: 'Billed Monthly',
  },
  '6-month': {
    title: '6-Month Plan',
    shortLabel: '6 Months',
    price: '$270',
    billing: 'Billed Twice Per Year',
    discount: '10% Discount',
  },
  '1-year': {
    title: '1-Year Plan',
    shortLabel: '1 Year',
    price: '$450',
    billing: 'Billed Yearly',
    discount: '25% Discount',
    bestDeal: true,
  },
};

/** Fallback when API returns no plans so the subscribe page still shows "Choose a plan below" with all options. */
const FALLBACK_PLANS: Plan[] = [
  { id: '', name: 'monthly', durationMonths: 1, priceUSD: 5000 },
  { id: '', name: '6-month', durationMonths: 6, priceUSD: 27000 },
  { id: '', name: '1-year', durationMonths: 12, priceUSD: 45000 },
];

function getPlanDisplay(plan: Plan) {
  const fallback = {
    title: plan.durationMonths === 1 ? 'Monthly' : `${plan.durationMonths}-Month Plan`,
    shortLabel: plan.durationMonths === 12 ? '1 Year' : plan.durationMonths === 6 ? '6 Months' : 'Monthly',
    price: `$${(plan.priceUSD / 100).toFixed(0)}`,
    billing: plan.durationMonths === 12 ? 'Billed Yearly' : plan.durationMonths === 6 ? 'Billed Twice Per Year' : 'Billed Monthly',
    discount: undefined as string | undefined,
    bestDeal: false,
  };
  return PLAN_DISPLAY[plan.name] ?? fallback;
}


interface SubscriptionPlansProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** When false, renders as inline content instead of a dialog (e.g. for a dedicated /upgrade page) */
  asDialog?: boolean;
  /** When true, shown as mandatory overlay for users with no plan: "Start Free Trial! Choose Plan", no close button */
  noPlanOverlay?: boolean;
  /** When true, content is rendered on the page without the grey/opaque Card (for full-page subscribe view) */
  embeddedInPage?: boolean;
  /** Called when user gains access (e.g. institutional code) so parent can refetch subscription */
  onAccessGranted?: () => void;
}

export function SubscriptionPlans({ open = true, onOpenChange, asDialog = true, noPlanOverlay = false, embeddedInPage = false, onAccessGranted }: SubscriptionPlansProps) {
  const { user } = useAuth();
  const { data: plans = [], isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans'],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [institutionalCode, setInstitutionalCode] = useState('');

  // When API fails or returns empty, show fallback so "Choose a plan below" still displays all options
  const displayPlans = plans.length > 0 ? plans : FALLBACK_PLANS;
  const isInstitutional = selectedIndex === 3;
  const selectedPlan = selectedIndex < displayPlans.length ? displayPlans[selectedIndex] : null;
  const selectedPlanForCheckout = selectedIndex < plans.length ? plans[selectedIndex] : null;

  const handleSubscribe = async () => {
    if (isInstitutional) return;
    let planToUse = selectedPlanForCheckout ?? selectedPlan;
    if (!planToUse?.id && (plansError || plans.length === 0)) {
      const { data: refetched } = await refetchPlans();
      const match = refetched?.length && selectedPlan ? refetched.find((p) => p.name === selectedPlan.name) : null;
      if (match) planToUse = match;
    }
    if (!planToUse?.id) {
      if (plansError || plans.length === 0) toast.error('Plans could not be loaded. Please try again.');
      return;
    }
    try {
      const response = await apiRequest('/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId: planToUse.id }),
      });
      if (response.sessionUrl) {
        try {
          sessionStorage.setItem('subscription_pending_plan', planToUse.id);
        } catch (_) {}
        window.location.href = response.sessionUrl;
      }
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed.');
    }
  };

  const institutionalMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('/api/subscription/institutional-code', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() }),
      });
    },
    onSuccess: () => {
      toast.success('Access granted. Welcome!.');
      queryClient.invalidateQueries({ queryKey: ['/api/subscription'] });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription/details'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      onOpenChange?.(false);
      onAccessGranted?.();
    },
    onError: (err: any) => {
      const msg = err?.message ?? 'Invalid code.';
      toast.error(msg.endsWith('.') || msg.endsWith('!') || msg.endsWith('?') ? msg : msg + '.');
    },
  });

  const handleUnlockInstitutional = useCallback(() => {
    const code = institutionalCode.trim();
    if (!code) {
      toast.error('Please enter a code.');
      return;
    }
    institutionalMutation.mutate(code);
  }, [institutionalCode, institutionalMutation]);

  const CARD_MIN_HEIGHT = 500;
  const CONTENT_MIN_HEIGHT = 280;

  const isPage = embeddedInPage;
  const titleClass = isPage ? 'text-foreground' : 'text-white';
  const subtitleClass = isPage ? 'text-muted-foreground' : 'text-slate-400';
  const selectorBgClass = isPage ? 'bg-muted/30 rounded-xl p-1.5 border border-border/60' : 'bg-slate-800/80 border border-slate-600/30';
  // Unselected: high-contrast on light container (page) or muted on dark (dialog)
  const optionClass = isPage
    ? 'text-slate-800 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white'
    : 'text-slate-400 hover:text-slate-300';
  // Selected: always white on blue pill for clear contrast
  const optionSelectedClass = 'text-white';
  const contentBoxClass = isPage ? 'rounded-xl border-0 bg-transparent pt-6 border-t border-border/80' : 'rounded-xl bg-slate-800/60 border border-slate-600/30';
  const contentTitleClass = isPage ? 'text-foreground' : 'text-white';
  const contentMutedClass = isPage ? 'text-muted-foreground' : 'text-slate-400';
  const contentDimClass = isPage ? 'text-muted-foreground' : 'text-slate-200';
  const inputClass = isPage
    ? 'mt-4 bg-background border border-input text-foreground placeholder:text-muted-foreground rounded-lg'
    : 'mt-4 bg-slate-900/80 border-slate-600 text-white placeholder:text-slate-500';
  const skeletonClass = isPage ? 'bg-muted' : 'bg-slate-700/80';

  const innerContent = (
    <>
      {!noPlanOverlay && (
        <DialogClose
          className={cn(
            'absolute right-4 top-4 z-20 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none',
            isPage ? 'text-foreground focus:ring-muted-foreground/30 focus:ring-offset-background' : 'text-white focus:ring-white/30 focus:ring-offset-transparent'
          )}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>
      )}
      <div className={isPage ? '' : 'p-6 pb-6'}>
        <h2 className={cn(
          'font-bold tracking-tight',
          isPage ? 'text-2xl sm:text-3xl mb-2 text-foreground' : 'text-xl mb-1',
          !isPage && titleClass
        )}>
          {noPlanOverlay ? 'Start Free Trial' : 'Choose Your Plan'}
        </h2>
        <p className={cn(
          isPage ? 'text-base text-muted-foreground mb-8 max-w-md' : 'text-sm mb-5',
          subtitleClass
        )}>
          {noPlanOverlay ? 'Choose a plan below or use your institution code to get started.' : 'Unlock full access with a subscription.'}
        </p>

        {(plansError || (plans.length === 0 && !plansLoading)) && (
          <div className={cn('mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200', isPage && 'border-amber-600/40')}>
            <p className="font-medium">Plans couldn&apos;t be loaded.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => refetchPlans()}>
              Retry
            </Button>
          </div>
        )}

        {plansLoading ? (
          <>
            <div className={cn('overflow-x-auto overscroll-x-contain -mx-1 px-1 sm:mx-0 sm:px-0', !isPage && 'pb-1')}>
              <div className={cn('relative grid grid-cols-4 gap-1 rounded-xl p-1.5 mb-5 min-w-[280px] overflow-hidden', selectorBgClass)}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className={cn('h-14 rounded-lg', skeletonClass)} />
                ))}
              </div>
            </div>
            <div style={{ minHeight: CONTENT_MIN_HEIGHT }} className={cn('p-4 space-y-3', contentBoxClass)}>
              <Skeleton className={cn('h-5 w-3/4 rounded', skeletonClass)} />
              <Skeleton className={cn('h-4 w-full rounded', skeletonClass)} />
              <Skeleton className={cn('h-8 w-full rounded', skeletonClass)} />
              <Skeleton className={cn('h-4 w-2/3 rounded', skeletonClass)} />
              <Skeleton className={cn('h-12 w-full rounded-lg mt-4', skeletonClass)} />
            </div>
          </>
        ) : (
          <>
            <div className={cn('overflow-x-auto overscroll-x-contain -mx-1 px-1 sm:mx-0 sm:px-0', !isPage && 'pb-1')}>
              <div className={cn('relative grid grid-cols-4 gap-1 rounded-xl p-1.5 mb-5 min-w-[280px] overflow-hidden', selectorBgClass)}>
                <div
                  aria-hidden
                  className="absolute top-1.5 bottom-1.5 rounded-lg bg-blue-600 transition-[left] duration-300 ease-out pointer-events-none"
                  style={{
                    width: 'calc((100% - 0.75rem - 0.75rem) / 4)',
                    left: `calc(0.375rem + ${selectedIndex} * ((100% - 0.75rem - 0.75rem) / 4 + 0.25rem))`,
                  }}
                />
                {displayPlans.map((plan, idx) => {
                const display = getPlanDisplay(plan);
                const isSelected = selectedIndex === idx;
                return (
                  <button
                    key={plan.id || plan.name}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={cn(
                      'relative z-10 col-span-1 min-w-0 rounded-lg py-3 px-1 flex flex-col items-center justify-center gap-0.5',
                      'text-xs font-medium transition-colors',
                      isSelected ? optionSelectedClass : optionClass
                    )}
                  >
                    <span className="block text-center leading-tight">{display.shortLabel}</span>
                    <span className="block font-bold text-sm">{display.price}</span>
                    {display.bestDeal && (
                      <span className="mt-1 inline-block rounded px-1.5 py-0.5 bg-emerald-500/90 text-[10px] font-semibold text-emerald-950">
                        Best Deal
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setSelectedIndex(3)}
                className={cn(
                  'relative z-10 col-span-1 min-w-0 rounded-lg py-3 px-1 flex flex-col items-center justify-center gap-0.5',
                  'text-xs font-medium transition-colors',
                  selectedIndex === 3 ? optionSelectedClass : optionClass
                )}
              >
                <span className="block text-center leading-tight">Institutional</span>
              </button>
            </div>
            </div>

            <div style={{ minHeight: CONTENT_MIN_HEIGHT }} className="min-w-0">
              {selectedIndex === 3 ? (
                <div className={cn('p-4 pb-6', contentBoxClass)}>
                  <h3 className={cn('font-semibold', contentTitleClass)}>Institutional Plan</h3>
                  {user?.institutionalAccessAffiliation?.trim() ? (
                    <p className={cn('text-sm mt-1', contentMutedClass)}>Current University: <span className="font-medium text-foreground">{user.institutionalAccessAffiliation.trim()}</span></p>
                  ) : (
                    <p className={cn('text-sm mt-1', contentMutedClass)}>Enter your institution code (provided by your program director) to unlock the platform.</p>
                  )}
                  <Input
                    type="text"
                    placeholder="Enter Code"
                    value={institutionalCode}
                    onChange={(e) => setInstitutionalCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlockInstitutional()}
                    className={cn('border', inputClass)}
                    data-testid="input-institutional-code"
                  />
                  <Button
                    onClick={handleUnlockInstitutional}
                    disabled={institutionalMutation.isPending || !institutionalCode.trim()}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                    size="lg"
                    data-testid="button-unlock-institutional"
                  >
                    {institutionalMutation.isPending ? 'Activating…' : 'Activate Subscription'}
                  </Button>
                </div>
              ) : selectedPlan ? (
                <>
                  <div className={cn('p-4', contentBoxClass)}>
                    {(() => {
                      const display = getPlanDisplay(selectedPlan);
                      const billingStarts = new Date();
                      billingStarts.setDate(billingStarts.getDate() + 7);
                      const billingStartsStr = billingStarts.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                      return (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className={cn('font-semibold', contentTitleClass)}>{display.title}</h3>
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Includes 7-Day Free Trial</p>
                            <p className={cn('text-2xl font-bold mt-1', contentTitleClass)}>{display.price}</p>
                            {display.discount && <span className="inline-block mt-1 text-xs text-emerald-600 dark:text-emerald-400">{display.discount}</span>}
                            <p className={cn('text-sm mt-1', contentMutedClass)}>{display.billing}</p>
                            <p className={cn('text-sm mt-0.5', contentMutedClass)}>Billing Begins {billingStartsStr}</p>
                            <p className={cn('text-sm mt-1', contentDimClass)}>Cancel Anytime</p>
                          </div>
                          {display.bestDeal && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500 text-emerald-950 text-xs font-semibold shrink-0 shadow-sm">Best Deal</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md"
                    size="lg"
                    data-testid={`button-subscribe-${selectedPlan.name}`}
                  >
                    Get Started
                  </Button>
                </>
              ) : null}
            </div>
          </>
        )}
      </div>
    </>
  );

  const popupContent = embeddedInPage ? (
    <div className="relative w-full">{innerContent}</div>
  ) : (
    <Card
      className={cn(
        'overflow-y-auto overflow-x-hidden rounded-xl border border-white/10',
        'bg-black/50 dark:bg-black/60',
        'shadow-xl relative w-full max-h-[90vh] min-h-0'
      )}
      style={{ minHeight: undefined }}
    >
      {innerContent}
    </Card>
  );

  if (asDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton
          overlayClassName="bg-transparent"
          className={cn(
            'max-w-lg p-0 gap-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:!hidden',
            'duration-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]'
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{noPlanOverlay ? 'Start Free Trial! Choose Plan' : 'Choose Your Plan Below'}</DialogTitle>
            <DialogDescription>{noPlanOverlay ? 'Choose a plan to start your free trial.' : 'Unlock full access with a subscription or institutional code.'}</DialogDescription>
          </DialogHeader>
          {popupContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="w-full max-w-lg">{popupContent}</div>
    </div>
  );
}

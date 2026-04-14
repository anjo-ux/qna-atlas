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
import { useState, useCallback, useEffect } from 'react';
import { FOCUS_YEARLY_PLAN_EVENT } from '@/components/SalePromoBanner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FALLBACK_PLANS,
  getPlanDisplay,
  type SubscriptionPlanLike,
} from '@/data/subscriptionPlanDisplay';

type Plan = SubscriptionPlanLike;


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
  onAccessGranted?: () => void | Promise<void>;
}

export function SubscriptionPlans({ open = true, onOpenChange, asDialog = true, noPlanOverlay = false, embeddedInPage = false, onAccessGranted }: SubscriptionPlansProps) {
  const { user } = useAuth();
  /** false only when server says they used trial / had a prior personal subscription checkout */
  const introTrialEligible = user?.introTrialAvailable !== false;
  const { data: plans = [], isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans'],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [institutionalCode, setInstitutionalCode] = useState('');

  useEffect(() => {
    if (!embeddedInPage) return;
    const onFocusYearly = () => setSelectedIndex(2);
    window.addEventListener(FOCUS_YEARLY_PLAN_EVENT, onFocusYearly);
    if (typeof window !== 'undefined' && window.location.hash === '#yearly') {
      setSelectedIndex(2);
      window.requestAnimationFrame(() => {
        document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
    return () => window.removeEventListener(FOCUS_YEARLY_PLAN_EVENT, onFocusYearly);
  }, [embeddedInPage]);

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
    onSuccess: async () => {
      toast.success('Access granted. Welcome!');
      await queryClient.refetchQueries({ queryKey: ['/api/subscription'] });
      await queryClient.refetchQueries({ queryKey: ['/api/subscription/details'] });
      await queryClient.refetchQueries({ queryKey: ['/api/auth/user'] });
      onOpenChange?.(false);
      await Promise.resolve(onAccessGranted?.());
      // Full navigation: works from /subscribe, paywall at /, and nested upgrade dialogs (wouter alone often no-ops on /).
      if (typeof window !== 'undefined') {
        window.location.replace('/');
      }
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
          {noPlanOverlay
            ? introTrialEligible
              ? 'Start Free Trial'
              : 'Subscribe'
            : 'Choose Your Plan'}
        </h2>
        <p className={cn(
          isPage ? 'text-base text-muted-foreground mb-8 max-w-md' : 'text-sm mb-5',
          subtitleClass
        )}>
          {noPlanOverlay
            ? introTrialEligible
              ? 'Choose a plan below or use your institution code to get started.'
              : 'Choose a plan below. Your free trial was already used on this account, and you will be charged when you subscribe. You can also use an institution code.'
            : 'Unlock full access with a subscription.'}
        </p>

        {isPage && (
          <div
            className={cn(
              'mb-6 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-rose-500/70',
              'bg-gradient-to-r from-rose-500/20 via-amber-500/15 to-rose-600/20 px-4 py-4 shadow-lg',
              'ring-2 ring-rose-400/30 dark:border-rose-400/60 dark:from-rose-950/50 dark:via-amber-950/40 dark:to-rose-950/50 dark:ring-rose-500/25'
            )}
          >
            <span className="max-w-[min(100%,20rem)] text-center rounded-full bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-[11px] font-bold leading-tight tracking-tight text-white shadow-md sm:px-4 sm:text-sm sm:leading-snug">
              Post-In-Service Sale
            </span>
            <p className="text-center text-base font-bold text-foreground sm:text-lg">
              <span className="text-muted-foreground line-through decoration-2 decoration-rose-500/70">$450</span>
              <span className="mx-2 text-muted-foreground font-semibold">→</span>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400 sm:text-3xl">$270</span>
              <span className="ml-2 text-sm font-semibold text-rose-800 dark:text-rose-200">First Year</span>
            </p>
            <p className="text-center text-sm font-semibold text-rose-900 dark:text-rose-100">Limited-Time 40% Discount</p>
          </div>
        )}

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
            <div
              className={cn(
                'overflow-x-auto overscroll-x-contain overscroll-y-auto [touch-action:pan-x_pan-y] -mx-1 px-1 sm:mx-0 sm:px-0',
                !isPage && 'pb-1'
              )}
            >
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
            <div
              className={cn(
                'overflow-x-auto overscroll-x-contain overscroll-y-auto [touch-action:pan-x_pan-y] -mx-1 px-1 sm:mx-0 sm:px-0',
                !isPage && 'pb-1'
              )}
            >
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
                      isSelected ? optionSelectedClass : optionClass,
                      display.sale && isPage && 'ring-2 ring-rose-400 ring-offset-2 ring-offset-background dark:ring-offset-background'
                    )}
                  >
                    <span className="block text-center leading-tight">{display.shortLabel}</span>
                    <span className="block font-bold text-sm">{display.price}</span>
                    {display.sale && (
                      <span
                        className={cn(
                          'mt-1 inline-block font-bold uppercase text-white shadow-md',
                          isPage
                            ? 'rounded-md bg-gradient-to-r from-rose-600 to-red-600 px-2 py-1 text-[10px] tracking-wider ring-2 ring-rose-300/90 sm:text-[11px]'
                            : 'rounded px-1.5 py-0.5 bg-amber-500/90 text-[10px] font-semibold text-amber-950'
                        )}
                      >
                        Sale
                      </span>
                    )}
                    {display.bestDeal && !display.sale && (
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
                  <h3 className={cn('font-semibold', contentTitleClass)}>Institutional Access</h3>
                  {user?.institutionalAccessAffiliation?.trim() ? (
                    <>
                      <p className={cn('text-sm mt-1', contentMutedClass)}>
                        Current University:{' '}
                        <span className={cn('font-medium', contentTitleClass)}>
                          {user.institutionalAccessAffiliation.trim()}
                        </span>
                      </p>
                      <p
                        className={cn(
                          'text-sm mt-2 rounded-md border px-3 py-2 font-medium',
                          isPage
                            ? 'border-amber-300/90 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100'
                            : 'border-amber-600/50 bg-amber-950/40 text-amber-100 dark:text-amber-50'
                        )}
                        role="note"
                      >
                        The same code can be shared with many people. On your account, each code works only once. You
                        can enter a <strong>different</strong> code if your program issues one.
                      </p>
                    </>
                  ) : (
                      <p className={cn('text-sm mt-1', contentMutedClass)}>
                      Enter your institution code (provided by your program director or administrator) to unlock the platform.
                    </p>
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
                    className={cn(
                      'w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md',
                      isPage && 'mb-14 max-sm:mb-20 sm:mb-16'
                    )}
                    size="lg"
                    data-testid="button-unlock-institutional"
                  >
                    {institutionalMutation.isPending ? 'Activating…' : 'Activate Subscription'}
                  </Button>
                </div>
              ) : selectedPlan ? (
                <>
                  <div
                    className={cn(
                      'p-4',
                      contentBoxClass,
                      getPlanDisplay(selectedPlan).sale &&
                        isPage &&
                        'rounded-2xl border-2 border-rose-500/80 bg-gradient-to-br from-rose-500/[0.12] via-amber-500/[0.08] to-rose-600/[0.12] shadow-lg ring-1 ring-rose-400/35 dark:border-rose-400/55 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40'
                    )}
                  >
                    {(() => {
                      const display = getPlanDisplay(selectedPlan);
                      const billingStarts = new Date();
                      billingStarts.setDate(billingStarts.getDate() + 7);
                      const billingStartsStr = billingStarts.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                      const salePage = Boolean(display.sale && isPage);
                      return (
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className={cn('font-semibold', contentTitleClass, salePage && 'text-lg sm:text-xl')}>{display.title}</h3>
                            {introTrialEligible ? (
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 font-medium">Includes 7-Day Free Trial</p>
                            ) : (
                              <p className={cn('text-xs mt-1 font-medium', isPage ? 'text-amber-900 dark:text-amber-100' : 'text-amber-200')}>
                                No free trial. Your account already used its trial or had a prior subscription.
                              </p>
                            )}
                            <div className={cn('mt-1', salePage && 'mt-2')}>
                              {display.originalPrice && (
                                <p
                                  className={cn(
                                    'line-through opacity-80',
                                    salePage ? 'text-lg font-semibold text-muted-foreground decoration-2 decoration-rose-500/60' : 'text-sm',
                                    !salePage && contentMutedClass
                                  )}
                                >
                                  {display.originalPrice}
                                </p>
                              )}
                              <p
                                className={
                                  salePage
                                    ? 'text-3xl font-bold text-rose-600 dark:text-rose-400 sm:text-4xl'
                                    : cn('text-2xl font-bold', contentTitleClass)
                                }
                              >
                                {display.price}
                              </p>
                            </div>
                            {display.discount && (
                              <span
                                className={cn(
                                  'mt-1 inline-block font-semibold',
                                  display.sale
                                    ? salePage
                                      ? 'rounded-lg bg-gradient-to-r from-rose-600 to-red-600 px-3 py-1.5 text-sm font-black uppercase tracking-wide text-white shadow-md'
                                      : 'text-xs text-amber-700 dark:text-amber-300'
                                    : 'text-xs text-emerald-600 dark:text-emerald-400'
                                )}
                              >
                                {display.discount}
                                {salePage && ' (40% off)'}
                              </span>
                            )}
                            <p className={cn('text-sm mt-1', contentMutedClass)}>{display.billing}</p>
                            {introTrialEligible ? (
                              <p className={cn('text-sm mt-0.5', contentMutedClass)}>Billing Begins {billingStartsStr}</p>
                            ) : (
                              <p className={cn('text-sm mt-0.5', contentMutedClass)}>First charge when you complete checkout.</p>
                            )}
                            <p className={cn('text-sm mt-1', contentDimClass)}>Cancel Anytime</p>
                          </div>
                          {display.sale && (
                            <span
                              className={cn(
                                'inline-flex shrink-0 items-center font-black uppercase tracking-wide text-white shadow-md',
                                salePage
                                  ? 'rounded-xl bg-gradient-to-br from-rose-600 to-red-700 px-3 py-2 text-sm ring-2 ring-rose-300/80 sm:flex-col sm:px-3 sm:py-2.5'
                                  : 'rounded-md bg-amber-500 px-2.5 py-1 text-xs text-amber-950'
                              )}
                            >
                              {salePage ? (
                                <>
                                  <span className="text-[10px] leading-tight opacity-95">Save</span>
                                  <span className="text-base leading-none sm:text-lg">$180</span>
                                </>
                              ) : (
                                'Sale'
                              )}
                            </span>
                          )}
                          {display.bestDeal && !display.sale && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-500 text-emerald-950 text-xs font-semibold shrink-0 shadow-sm">
                              Best Deal
                            </span>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                  <Button
                    onClick={handleSubscribe}
                    className={cn(
                      'w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md',
                      isPage && 'mb-14 max-sm:mb-20 sm:mb-16'
                    )}
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
    <div id="subscription-plans" className="relative w-full scroll-mt-24 sm:scroll-mt-28">
      {innerContent}
    </div>
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
            <DialogTitle>
              {noPlanOverlay
                ? introTrialEligible
                  ? 'Start Free Trial! Choose Plan'
                  : 'Choose Your Plan'
                : 'Choose Your Plan Below'}
            </DialogTitle>
            <DialogDescription>
              {noPlanOverlay
                ? introTrialEligible
                  ? 'Choose a plan to start your free trial.'
                  : 'Subscribe without a trial. You will be charged at checkout. Institution codes still work as before.'
                : 'Unlock full access with a subscription or institutional code.'}
            </DialogDescription>
          </DialogHeader>
          {popupContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col items-center p-4',
        embeddedInPage ? 'justify-start' : 'min-h-[60vh] justify-center'
      )}
    >
      <div className="w-full max-w-lg">{popupContent}</div>
    </div>
  );
}

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
import { useState, useCallback, useEffect, useMemo } from 'react';
import { FOCUS_YEARLY_PLAN_EVENT } from '@/components/SalePromoBanner';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSpecialty } from '@/hooks/useSpecialty';
import { Skeleton } from '@/components/ui/skeleton';
import { PricingSection, type PricingCardData } from '@/components/ui/pricing-section';
import {
  FALLBACK_PLANS,
  getPlanDisplay,
  getSubscriptionIncludedFeatures,
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
  const { specialty, activeSpecialty } = useSpecialty();
  /** false only when server says they used trial / had a prior personal subscription checkout */
  const introTrialEligible = user?.introTrialAvailable !== false;
  const { data: plans = [], isLoading: plansLoading, isError: plansError, refetch: refetchPlans } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans', activeSpecialty],
  });
  const [highlightedPlanName, setHighlightedPlanName] = useState<string | null>(null);
  const [institutionalCode, setInstitutionalCode] = useState('');

  useEffect(() => {
    if (!embeddedInPage) return;
    const onFocusYearly = () => {
      setHighlightedPlanName('1-year');
      window.requestAnimationFrame(() => {
        document.getElementById('plan-1-year')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    };
    window.addEventListener(FOCUS_YEARLY_PLAN_EVENT, onFocusYearly);
    if (typeof window !== 'undefined' && window.location.hash === '#yearly') {
      setHighlightedPlanName('1-year');
      window.requestAnimationFrame(() => {
        document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.getElementById('plan-1-year')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
    return () => window.removeEventListener(FOCUS_YEARLY_PLAN_EVENT, onFocusYearly);
  }, [embeddedInPage]);

  // When API fails or returns empty, show fallback so "Choose a plan below" still displays all options
  const displayPlans = plans.length > 0 ? plans : FALLBACK_PLANS;

  const includedFeatures = useMemo(
    () =>
      getSubscriptionIncludedFeatures({
        specialtyName: specialty.specialtyName,
        includeOralCoach: specialty.id !== 'ortho',
      }),
    [specialty.id, specialty.specialtyName],
  );

  const handleSubscribe = useCallback(async (plan: Plan) => {
    let planToUse: Plan | null = plan.id ? plan : plans.find((p) => p.name === plan.name) ?? null;
    if (!planToUse?.id && (plansError || plans.length === 0)) {
      const { data: refetched } = await refetchPlans();
      const match = refetched?.length ? refetched.find((p) => p.name === plan.name) : null;
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

        // Ortho checkout from prs-atlas.com (or the reverse): hand off the session to the
        // specialty domain first, then continue to Stripe so the success redirect stays logged in.
        if (response.requiresDomainHandoff && response.specialtyId) {
          const handoff = await apiRequest('/api/auth/handoff', {
            method: 'POST',
            body: JSON.stringify({
              targetSpecialtyId: response.specialtyId,
              nextPath: '/',
              continueExternalUrl: response.sessionUrl,
            }),
          });
          if (handoff?.handoffUrl) {
            window.location.assign(handoff.handoffUrl);
            return;
          }
        }

        window.location.href = response.sessionUrl;
      }
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
      toast.error(error instanceof Error ? error.message : 'Checkout failed.');
    }
  }, [plans, plansError, refetchPlans]);

  const institutionalMutation = useMutation({
    mutationFn: async (code: string) => {
      return await apiRequest('/api/subscription/institutional-code', {
        method: 'POST',
        body: JSON.stringify({ code: code.trim() }),
      });
    },
    onSuccess: async (data: { grantKind?: string } | void) => {
      toast.success(data?.grantKind === 'trial' ? '30-day trial started. Welcome!' : 'Access granted. Welcome!');
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

  const isPage = embeddedInPage;
  const billingStarts = new Date();
  billingStarts.setDate(billingStarts.getDate() + 7);
  const billingStartsStr = billingStarts.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  const pricingCards: PricingCardData[] = useMemo(() => {
    const paid = displayPlans.map((plan) => {
      const display = getPlanDisplay(plan);
      const featured = Boolean(display.sale || display.bestDeal || plan.name === '1-year');
      const highlighted = highlightedPlanName === plan.name;
      return {
        id: `plan-${plan.name}`,
        title: display.title,
        featured,
        featuredLabel: display.sale ? 'Best Value' : display.bestDeal ? 'Best Deal' : undefined,
        pills: display.discount
          ? [`${display.discount}${display.sale && isPage ? ' (40% off)' : ''}`]
          : undefined,
        className: cn(highlighted && 'ring-2 ring-primary'),
        price: (
          <div className="flex flex-col items-center gap-1">
            {display.originalPrice ? (
              <span className="text-lg font-normal text-muted-foreground line-through">{display.originalPrice}</span>
            ) : null}
            <span>{display.price}</span>
          </div>
        ),
        description: (
          <div className="space-y-1">
            <p className="text-xs font-medium tracking-wide">{display.billing}</p>
            <p>{display.description}</p>
          </div>
        ),
        features: includedFeatures,
        children: (
          <div className="mt-4 space-y-1 text-sm">
            {introTrialEligible ? (
              <p className="font-medium text-emerald-600 dark:text-emerald-400">Includes 7-Day Free Trial</p>
            ) : (
              <p className="font-medium text-amber-800 dark:text-amber-200">
                No free trial. Your account already used its trial or had a prior subscription.
              </p>
            )}
            {introTrialEligible ? (
              <p className="text-muted-foreground">Billing Begins {billingStartsStr}</p>
            ) : (
              <p className="text-muted-foreground">First charge when you complete checkout.</p>
            )}
            <p className="text-muted-foreground">Cancel Anytime</p>
            {display.sale && isPage ? (
              <p className="pt-1 text-xs font-semibold uppercase tracking-wide text-primary">Save $180</p>
            ) : null}
          </div>
        ),
        cta: (
          <Button
            onClick={() => handleSubscribe(plan)}
            className="w-full"
            size="sm"
            variant={featured ? 'default' : 'secondary'}
            data-testid={`button-subscribe-${plan.name}`}
          >
            Get Started
          </Button>
        ),
      } satisfies PricingCardData;
    });

    const institutional: PricingCardData = {
      id: 'plan-institutional',
      title: 'Institutional',
      price: <span className="text-xl">Institutional Access</span>,
      description: user?.institutionalAccessAffiliation?.trim()
        ? `Current University: ${user.institutionalAccessAffiliation.trim()}`
        : 'Enter your institution or trial code (provided by your program) to unlock the platform.',
      features: user?.institutionalAccessAffiliation?.trim()
        ? []
        : [
            'Trial codes grant 30 days of access and can be used once per account.',
            'They do not replace the 7-day free trial when you first subscribe.',
            'Codes cannot be redeemed after they are deactivated or after 90 days from when they were created.',
          ],
      children: user?.institutionalAccessAffiliation?.trim() ? (
        <p
          className="mt-4 rounded-md border border-amber-300/90 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
          role="note"
        >
          The same code can be shared with many people. On your account, each code works only once. You
          can enter a <strong>different</strong> code if your program issues one.
        </p>
      ) : null,
      ctaPlacement: "start",
      cta: (
        <>
          <Input
            type="text"
            placeholder="Enter Code"
            value={institutionalCode}
            onChange={(e) => setInstitutionalCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUnlockInstitutional()}
            className="bg-background"
            data-testid="input-institutional-code"
          />
          <Button
            onClick={handleUnlockInstitutional}
            disabled={institutionalMutation.isPending || !institutionalCode.trim()}
            className="w-full"
            size="sm"
            variant="secondary"
            data-testid="button-unlock-institutional"
          >
            {institutionalMutation.isPending ? 'Activating…' : 'Activate Subscription'}
          </Button>
        </>
      ),
    };

    return [...paid, institutional];
  }, [
    displayPlans,
    includedFeatures,
    highlightedPlanName,
    introTrialEligible,
    billingStartsStr,
    isPage,
    user?.institutionalAccessAffiliation,
    institutionalCode,
    institutionalMutation.isPending,
    handleUnlockInstitutional,
    handleSubscribe,
  ]);

  const innerContent = (
    <>
      {!noPlanOverlay && (
        <DialogClose
          className="absolute right-4 top-4 z-20 rounded-sm text-foreground opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:pointer-events-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </DialogClose>
      )}
      <div className={isPage ? '' : 'p-6 pb-6'}>
        <h2
          className={cn(
            'font-bold tracking-tight text-foreground',
            isPage ? 'mb-2 text-2xl sm:text-3xl' : 'mb-1 pr-8 text-xl',
          )}
        >
          {noPlanOverlay
            ? introTrialEligible
              ? 'Start Free Trial'
              : 'Subscribe'
            : 'Choose Your Plan'}
        </h2>
        <p className={cn('text-muted-foreground', isPage ? 'mb-8 max-w-2xl text-base' : 'mb-5 text-sm')}>
          {noPlanOverlay
            ? introTrialEligible
              ? `Choose a plan below or use your institution code to unlock the ${specialty.specialtyName} question bank.`
              : `Choose a plan below to unlock the ${specialty.specialtyName} question bank. Your free trial was already used on this account, and you will be charged when you subscribe. You can also use an institution code.`
            : `Unlock full access to the ${specialty.specialtyName} question bank with a subscription.`}
        </p>

        {(plansError || (plans.length === 0 && !plansLoading)) && (
          <div className="mb-4 rounded-lg border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-200">
            <p className="font-medium">Plans couldn&apos;t be loaded.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => refetchPlans()}>
              Retry
            </Button>
          </div>
        )}

        {plansLoading ? (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 min-[1100px]:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col rounded-lg border border-border bg-card p-6">
                <Skeleton className="mx-auto h-6 w-24 rounded-full" />
                <Skeleton className="mx-auto mt-4 h-8 w-20" />
                <Skeleton className="mt-4 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-2/3" />
                <div className="my-4 border-t border-border" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-5/6" />
                <Skeleton className="mt-2 h-4 w-4/5" />
                <Skeleton className="mt-6 h-9 w-full" />
              </div>
            ))}
          </div>
        ) : (
          <PricingSection
            className="py-0 md:py-0"
            align="start"
            compact={!isPage}
            animate
            plans={pricingCards}
          />
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
        'relative min-h-0 w-full max-h-[90vh] overflow-y-auto overflow-x-hidden rounded-xl',
        'border border-border bg-card text-card-foreground shadow-xl',
      )}
    >
      {innerContent}
    </Card>
  );

  if (asDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          hideCloseButton
          overlayClassName="bg-black/50 dark:bg-black/60"
          className={cn(
            'max-w-5xl p-0 gap-0 border-0 bg-transparent shadow-none overflow-visible [&>button]:!hidden',
            'duration-0 data-[state=open]:zoom-in-100 data-[state=closed]:zoom-out-100',
            'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
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
        embeddedInPage ? 'justify-start' : 'min-h-[60vh] justify-center',
      )}
    >
      <div className="w-full max-w-5xl">{popupContent}</div>
    </div>
  );
}

import { cn } from '@/lib/utils';

export const FOCUS_YEARLY_PLAN_EVENT = 'atlas:focus-yearly-plan';

type SalePromoBannerProps = {
  /**
   * `signup` sends logged-out visitors to sign-up.
   * `focus-yearly` scrolls the subscription page to plans and selects the 1-year option.
   */
  claimAction: 'signup' | 'focus-yearly';
  className?: string;
};

export function SalePromoBanner({ claimAction, className }: SalePromoBannerProps) {
  const handleClaim = () => {
    if (claimAction === 'signup') {
      window.location.href = '/signup';
      return;
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(FOCUS_YEARLY_PLAN_EVENT));
      window.requestAnimationFrame(() => {
        document.getElementById('subscription-plans')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }
  };

  return (
    <div
      className={cn(
        'w-full border-b border-rose-700/30 bg-gradient-to-r from-rose-700 via-red-600 to-amber-600',
        'text-white shadow-md',
        className
      )}
      role="region"
      aria-label="Subscription promotion"
    >
      <div className="container mx-auto flex flex-col items-center justify-center gap-1.5 px-3 py-2.5 sm:flex-row sm:gap-3 sm:py-2.5 sm:px-4">
        <p className="text-center text-sm font-semibold leading-snug sm:text-base">
          First Year Subscription Now Discounted 40%!
        </p>
        <button
          type="button"
          onClick={handleClaim}
          className={cn(
            'shrink-0 rounded-lg bg-white px-4 py-1.5 text-sm font-bold text-rose-700',
            'shadow-sm transition hover:bg-amber-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-rose-700'
          )}
        >
          Claim Now!
        </button>
      </div>
    </div>
  );
}

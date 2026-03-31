import { useLocation } from 'wouter';
import { Home, Receipt, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { SubscriptionTransactionHistoryDialog } from '@/components/SubscriptionTransactionHistoryDialog';
import { useTheme } from '@/hooks/useTheme';
import atlasLogo from '@assets/atlas_1764093111680.png';
import atlasLogoLight from '@assets/logo_light_1774918799268.png';

export type SubscriptionPageProps = {
  /**
   * When SubscriptionPage is embedded in Index (paywall at `/`), pass the parent’s
   * subscription refetch so `isLocked` updates immediately after institutional / checkout success.
   */
  onSubscriptionUnlocked?: () => void | Promise<void>;
};

/**
 * Full-page subscription/upgrade page (like ChatGPT or Claude).
 * Shown when the user is logged in with no subscription or trial active.
 * Same 4 options (Monthly, 6-Month, 1-Year, Institutional), slider, and Stripe API.
 */
export default function SubscriptionPage({ onSubscriptionUnlocked }: SubscriptionPageProps) {
  const [, setLocation] = useLocation();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const [transactionHistoryOpen, setTransactionHistoryOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation('/');
  };

  const handleAccessGranted = async () => {
    await onSubscriptionUnlocked?.();
    // Home navigation is handled in SubscriptionPlans via location.replace('/') after this runs.
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Same header as main app (glass-nav) */}
      <header className="glass-nav w-full sticky top-0 z-50 rounded-b-2xl shrink-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation('/')}
                className="hover:bg-primary/10 flex-shrink-0 outline-none focus-visible:ring-0 rounded-xl"
                title="Go to Dashboard"
              >
                <Home className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 min-w-0 px-4 py-1.5 rounded-xl">
                <div className="logo-glass flex items-center justify-center p-1.5 flex-shrink-0 ring-1 ring-black/5 dark:ring-white/10">
                  <img src={theme === 'dark' ? atlasLogoLight : atlasLogo} alt="Atlas Logo" className="h-7 w-7 sm:h-8 sm:w-8 object-contain" />
                </div>
                <div className="hidden sm:flex flex-col min-w-0">
                  <span className="text-base sm:text-lg font-bold tracking-tight gradient-text leading-tight truncate">Atlas</span>
                  <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase truncate">Review</span>
                </div>
              </div>
            </div>
            <div className="flex-1" />
            <Button
              onClick={() => setTransactionHistoryOpen(true)}
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-2"
              title="View transaction history"
              data-testid="button-transaction-history-subscribe"
            >
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Transaction History</span>
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex-shrink-0 gap-2"
              title="Log out and return to home"
              data-testid="button-logout-subscribe"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center overflow-auto p-4 sm:p-6 lg:p-8">
        <SubscriptionPlans
          open={true}
          asDialog={false}
          noPlanOverlay={true}
          embeddedInPage={true}
          onAccessGranted={handleAccessGranted}
        />
      </main>
      <SubscriptionTransactionHistoryDialog
        open={transactionHistoryOpen}
        onOpenChange={setTransactionHistoryOpen}
      />
    </div>
  );
}

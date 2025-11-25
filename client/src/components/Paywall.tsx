import { Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface PaywallProps {
  daysRemaining: number;
  onUpgrade?: () => void;
  onSettings?: () => void;
}

export function Paywall({ daysRemaining, onUpgrade, onSettings }: PaywallProps) {
  const isExpired = daysRemaining === 0;

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-background to-accent/5 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-foreground mb-2">
          {isExpired ? 'Free Trial Expired' : 'Free Trial Active'}
        </h2>

        <p className="text-muted-foreground mb-6">
          {isExpired
            ? 'Your 30-day free trial has ended. Upgrade your account to continue accessing all content.'
            : `Your free trial ends in ${daysRemaining} day${daysRemaining === 1 ? '' : 's'}. Upgrade now to enjoy unlimited access.`}
        </p>

        <div className="space-y-3">
          <Button 
            onClick={onUpgrade}
            size="lg" 
            className="w-full"
            data-testid="button-upgrade-now"
          >
            Upgrade Now <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            onClick={onSettings}
            size="lg"
            className="w-full"
            data-testid="button-view-subscription"
          >
            View Subscription
          </Button>
        </div>

        {!isExpired && (
          <p className="text-xs text-muted-foreground mt-4">
            Keep studying during your trial. Upgrade whenever you're ready.
          </p>
        )}
      </Card>
    </div>
  );
}

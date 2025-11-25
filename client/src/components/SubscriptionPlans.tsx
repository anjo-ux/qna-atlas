import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Plan {
  id: string;
  name: string;
  durationMonths: number;
  priceUSD: number;
}

export function SubscriptionPlans() {
  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ['/api/subscription/plans'],
  });

  const getPlanDetails = (plan: Plan) => {
    const monthlyPrice = plan.priceUSD / 100 / plan.durationMonths;
    return {
      displayName: `${plan.durationMonths} Month${plan.durationMonths > 1 ? 's' : ''}`,
      price: `$${(plan.priceUSD / 100).toFixed(2)}`,
      monthlyPrice: `$${monthlyPrice.toFixed(2)}/mo`,
      popular: plan.durationMonths === 6,
    };
  };

  const handleSubscribe = async (planId: string) => {
    try {
      const response = await apiRequest('/api/subscription/checkout', {
        method: 'POST',
        body: JSON.stringify({ planId }),
      });
      
      if (response.sessionUrl) {
        window.location.href = response.sessionUrl;
      }
    } catch (error) {
      console.error('Failed to initiate checkout:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-2">Upgrade to Premium</h1>
        <p className="text-muted-foreground">Choose a plan and unlock unlimited access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const details = getPlanDetails(plan);
          return (
            <Card
              key={plan.id}
              className={`p-6 glass-card flex flex-col transition-all ${
                details.popular
                  ? 'border-accent glow-accent md:scale-105'
                  : 'hover:glow-primary'
              }`}
            >
              {details.popular && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-accent/20 text-accent text-xs font-semibold rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold mb-2">{details.displayName}</h3>
              <div className="mb-4">
                <div className="text-3xl font-bold">{details.price}</div>
                <div className="text-sm text-muted-foreground">{details.monthlyPrice}</div>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Full access to all questions</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Spaced repetition system</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Topic-based analytics</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>Persistent notes & bookmarks</span>
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-success flex-shrink-0" />
                  <span>{plan.durationMonths} month{plan.durationMonths > 1 ? 's' : ''} of access</span>
                </li>
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                className={`w-full ${details.popular ? '' : 'variant-outline'}`}
                data-testid={`button-subscribe-${plan.name}`}
              >
                Get Started
              </Button>
            </Card>
          );
        })}
      </div>

      <div className="max-w-2xl mx-auto mt-12 space-y-4 text-center">
        <h2 className="text-2xl font-bold">Why upgrade?</h2>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="font-semibold mb-2">Advanced Analytics</div>
            <p className="text-muted-foreground">Track your progress by topic and identify weak areas</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="font-semibold mb-2">Optimized Learning</div>
            <p className="text-muted-foreground">Spaced repetition ensures optimal retention rates</p>
          </div>
          <div className="p-4 rounded-lg bg-muted/30">
            <div className="font-semibold mb-2">Personalized Study</div>
            <p className="text-muted-foreground">Bookmark questions and take persistent notes</p>
          </div>
        </ul>
      </div>
    </div>
  );
}

/**
 * Canonical copy for subscription tiers (subscribe UI + public pricing page).
 * Keep in sync with server `ensureSubscriptionPlansSync` amounts.
 */
export interface SubscriptionPlanLike {
  id: string;
  name: string;
  durationMonths: number;
  priceUSD: number;
}

export const PLAN_DISPLAY: Record<
  string,
  {
    title: string;
    shortLabel: string;
    price: string;
    billing: string;
    discount?: string;
    bestDeal?: boolean;
    originalPrice?: string;
    sale?: boolean;
  }
> = {
  monthly: {
    title: "Monthly Subscription",
    shortLabel: "Monthly",
    price: "$50",
    billing: "Billed Monthly",
  },
  "6-month": {
    title: "6-Month Plan",
    shortLabel: "6 Months",
    price: "$270",
    billing: "Billed Twice Per Year",
    discount: "10% Discount",
  },
  "1-year": {
    title: "1-Year Plan",
    shortLabel: "1 Year",
    price: "$450",
    billing: "Billed Yearly",
    discount: "25% Discount",
  },
};

export const FALLBACK_PLANS: SubscriptionPlanLike[] = [
  { id: "", name: "monthly", durationMonths: 1, priceUSD: 5000 },
  { id: "", name: "6-month", durationMonths: 6, priceUSD: 27000 },
  { id: "", name: "1-year", durationMonths: 12, priceUSD: 45000 },
];

export function getPlanDisplay(plan: SubscriptionPlanLike) {
  const fallback = {
    title: plan.durationMonths === 1 ? "Monthly" : `${plan.durationMonths}-Month Plan`,
    shortLabel:
      plan.durationMonths === 12 ? "1 Year" : plan.durationMonths === 6 ? "6 Months" : "Monthly",
    price: `$${(plan.priceUSD / 100).toFixed(0)}`,
    billing:
      plan.durationMonths === 12
        ? "Billed Yearly"
        : plan.durationMonths === 6
          ? "Billed Twice Per Year"
          : "Billed Monthly",
    discount: undefined as string | undefined,
    bestDeal: false,
    originalPrice: undefined as string | undefined,
    sale: false,
  };
  return PLAN_DISPLAY[plan.name] ?? fallback;
}

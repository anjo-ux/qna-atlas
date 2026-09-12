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
    description: string;
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
    description:
      "Lowest Upfront Cost. Ideal When You Want Maximum Flexibility Between Rotations Or Exams.",
  },
  "6-month": {
    title: "6-Month Plan",
    shortLabel: "6 Months",
    price: "$270",
    billing: "Billed Twice Per Year",
    description:
      "Balanced Savings For A Dedicated Six-Month Study Arc. Popular For Structured Board Prep Blocks.",
    discount: "10% Discount",
  },
  "1-year": {
    title: "1-Year Plan",
    shortLabel: "1 Year",
    price: "$450",
    billing: "Billed Yearly",
    description:
      "Maximum Savings For The Surgeon Who Wants Atlas As A Year-Round Companion Through Peak Prep.",
    discount: "25% Discount",
  },
};

export const FALLBACK_PLANS: SubscriptionPlanLike[] = [
  { id: "", name: "monthly", durationMonths: 1, priceUSD: 5000 },
  { id: "", name: "6-month", durationMonths: 6, priceUSD: 27000 },
  { id: "", name: "1-year", durationMonths: 12, priceUSD: 45000 },
];

export function getPlanDescription(durationMonths: number): string {
  if (durationMonths === 1) {
    return "Lowest Upfront Cost. Ideal When You Want Maximum Flexibility Between Rotations Or Exams.";
  }
  if (durationMonths === 6) {
    return "Balanced Savings For A Dedicated Six-Month Study Arc. Popular For Structured Board Prep Blocks.";
  }
  return "Maximum Savings For The Surgeon Who Wants Atlas As A Year-Round Companion Through Peak Prep.";
}

export function getSubscriptionIncludedFeatures(opts: {
  specialtyName: string;
  includeOralCoach: boolean;
}): string[] {
  return [
    `Full ${opts.specialtyName} Question Bank`,
    "Detailed Explanations & Reference-Friendly Study Flows",
    "Timed Mock Exams & Custom Test Builder",
    "Spaced Repetition & Bookmarking Across Devices",
    ...(opts.includeOralCoach ? ["Oral Board-Style Coach For Verbal Practice"] : []),
    "Progress Tracking By Section & Sub-Topic",
  ];
}

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
    description: getPlanDescription(plan.durationMonths),
    discount: undefined as string | undefined,
    bestDeal: false,
    originalPrice: undefined as string | undefined,
    sale: false,
  };
  return PLAN_DISPLAY[plan.name] ?? fallback;
}

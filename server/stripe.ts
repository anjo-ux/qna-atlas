import Stripe from "stripe";
import { storage } from "./storage";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.VITE_APP_URL || "http://localhost:5000";

export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY)
  : null;

export function isStripeConfigured(): boolean {
  return !!stripe;
}

/**
 * Create a Stripe Checkout Session for a one-time subscription plan purchase.
 * Returns the session URL to redirect the user to Stripe Checkout.
 */
export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string | null;
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}): Promise<{ sessionId: string; url: string } | { error: string }> {
  if (!stripe) {
    return { error: "Stripe is not configured. Set STRIPE_SECRET_KEY." };
  }

  const plans = await storage.getSubscriptionPlans();
  const plan = plans.find((p) => p.id === params.planId);
  if (!plan) {
    return { error: "Plan not found" };
  }

  // Prefer Payment Link URL (with free trial); Stripe redirects to success_url with session_id
  const paymentLinkUrl = (plan as { stripePaymentLinkUrl?: string | null }).stripePaymentLinkUrl?.trim();
  if (paymentLinkUrl) {
    return { sessionId: "", url: paymentLinkUrl };
  }

  // Fallback: create session with product/price (one-time payment)
  const successUrl = params.successUrl ?? `${APP_BASE_URL.replace(/\/$/, "")}/?subscription=success`;
  const cancelUrl = params.cancelUrl ?? `${APP_BASE_URL.replace(/\/$/, "")}/?subscription=cancelled`;

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = plan.stripePriceId
    ? { price: plan.stripePriceId, quantity: 1 }
    : plan.stripeProductId
      ? {
          price_data: {
            currency: "usd",
            unit_amount: plan.priceUSD,
            product: plan.stripeProductId,
          },
          quantity: 1,
        }
      : {
          price_data: {
            currency: "usd",
            unit_amount: plan.priceUSD,
            product_data: {
              name: `${plan.name} subscription`,
              description: `${plan.durationMonths} month(s) access`,
            },
          },
          quantity: 1,
        };

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [lineItem],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: params.userId,
    customer_email: params.userEmail || undefined,
    metadata: {
      userId: params.userId,
      planId: params.planId,
    },
  });

  const url = session.url ?? null;
  if (!url) {
    return { error: "Failed to create checkout session" };
  }
  return { sessionId: session.id, url };
}

export type StripeWebhookRequest = {
  body: Buffer;
  headers: { [key: string]: string | string[] | undefined };
};

/**
 * Handle Stripe webhook (checkout.session.completed).
 * Idempotent: uses payment_intent or session id to avoid double-fulfillment.
 */
export async function handleStripeWebhook(
  req: { body: Buffer; headers: { [key: string]: string | string[] | undefined } },
  res: { status: (code: number) => { send: (body: string) => void }; send: (body: string) => void }
): Promise<void> {
  if (!stripe || !STRIPE_WEBHOOK_SECRET) {
    res.status(500).send("Stripe or webhook secret not configured");
    return;
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || typeof sig !== "string") {
    res.status(400).send("Missing stripe-signature");
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err?.message);
    res.status(400).send(`Webhook Error: ${err?.message ?? "Invalid signature"}`);
    return;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id ?? session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId || !planId) {
      console.error("Stripe webhook: missing userId or planId in session", {
        sessionId: session.id,
        client_reference_id: session.client_reference_id,
        metadata: session.metadata,
      });
      res.status(200).send("OK");
      return;
    }

    const plan = (await storage.getSubscriptionPlans()).find((p) => p.id === planId);
    if (!plan) {
      console.error("Stripe webhook: plan not found", { planId });
      res.status(200).send("OK");
      return;
    }

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id ?? null;

    await storage.createSubscriptionTransaction({
      userId,
      planId,
      amount: plan.priceUSD,
      status: "completed",
      stripePaymentIntentId: paymentIntentId,
      startDate,
      endDate,
    });

    await storage.updateUserProfile(userId, {
      subscriptionStatus: "active",
      subscriptionPlan: plan.name as any,
      subscriptionEndsAt: endDate,
    });

    console.log("Stripe subscription fulfilled", { userId, planId, sessionId: session.id });
  }

  res.status(200).send("OK");
}

export async function fulfillFromCheckoutSession(sessionId: string, userId: string, planId: string): Promise<{ ok: true } | { error: string }> {
  if (!stripe) return { error: "Stripe is not configured." };
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ["subscription"] });
    if (session.payment_status !== "paid" && session.status !== "complete") return { error: "Checkout session not paid." };
    const plans = await storage.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { error: "Plan not found." };
    const sub = typeof session.subscription === "object" && session.subscription !== null ? (session.subscription as Stripe.Subscription) : null;
    const subId = sub?.id ?? null;

    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    let subscriptionStatus: string = "active";
    let trialEndsAt: Date | null = null;
    let subscriptionEndsAt: Date = endDate;

    if (sub) {
      const periodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000) : endDate;
      const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
      subscriptionEndsAt = periodEnd;
      startDate = sub.created ? new Date(sub.created * 1000) : startDate;
      endDate = periodEnd;
      if (trialEnd && trialEnd.getTime() > Date.now()) {
        subscriptionStatus = "trial";
        trialEndsAt = trialEnd;
      }
    }

    await storage.createSubscriptionTransaction({
      userId,
      planId: plan.id,
      amount: plan.priceUSD,
      status: "completed",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      startDate,
      endDate,
    });
    const updates: Record<string, unknown> = {
      subscriptionStatus,
      subscriptionPlan: plan.name,
      subscriptionEndsAt,
      trialEndsAt: trialEndsAt ?? null,
    };
    if (subId) updates.stripeSubscriptionId = subId;
    await storage.updateUserProfile(userId, updates as any);
    return { ok: true };
  } catch (err: any) {
    console.error("Stripe fulfill from session error:", err?.message);
    return { error: err?.message ?? "Fulfill failed." };
  }
}

/**
 * Cancel a Stripe subscription at period end (turns off automatic billing; access until current period ends).
 * Returns true if canceled, false if subscription not found or already canceled.
 */
export async function cancelStripeSubscriptionAtPeriodEnd(subscriptionId: string): Promise<boolean> {
  if (!stripe) return false;
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    if (sub.status === "canceled") return true;
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
    return true;
  } catch (err: any) {
    console.error("Stripe cancel subscription error:", err?.message);
    return false;
  }
}

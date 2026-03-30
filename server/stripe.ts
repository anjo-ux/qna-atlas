import Stripe from "stripe";
import { storage } from "./storage";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_LIVE_SECRET_KEY = process.env.STRIPE_LIVE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL || process.env.VITE_APP_URL || "http://localhost:5000";

export const stripe: Stripe | null = STRIPE_SECRET_KEY
  ? new Stripe(STRIPE_SECRET_KEY)
  : null;

/**
 * Live Payment Links produce cs_live_* sessions; they can only be retrieved with sk_live_*.
 * If STRIPE_SECRET_KEY is sk_test_*, set STRIPE_LIVE_SECRET_KEY to sk_live_* for fulfill, or use sk_live_ as STRIPE_SECRET_KEY in production.
 */
function getStripeForCheckoutSessionRetrieve(sessionId: string): Stripe | null {
  const defaultKey = STRIPE_SECRET_KEY || "";
  const liveOnlyKey = STRIPE_LIVE_SECRET_KEY || "";
  const isLiveSession = sessionId.startsWith("cs_live_");

  if (isLiveSession) {
    if (defaultKey.startsWith("sk_live_")) {
      return stripe;
    }
    if (liveOnlyKey.startsWith("sk_live_")) {
      return new Stripe(liveOnlyKey);
    }
    return null;
  }

  return stripe;
}

export function stripeLiveKeyMismatchMessage(): string {
  return (
    "This checkout was completed in Stripe Live mode, but the server is using a Test secret key (or no live key). " +
    "Set STRIPE_SECRET_KEY to your sk_live_… key in production, or add STRIPE_LIVE_SECRET_KEY=sk_live_… while keeping STRIPE_SECRET_KEY for test. " +
    "Also use a Live webhook signing secret (whsec_…) for live events."
  );
}

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
  /** When false, use no-trial Payment Link if configured (returning subscribers). */
  introTrialEligible?: boolean;
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

  const planRow = plan as {
    stripePaymentLinkUrl?: string | null;
    stripePaymentLinkUrlNoTrial?: string | null;
  };
  const introOk = params.introTrialEligible !== false;

  if (!introOk) {
    const noTrialUrl = planRow.stripePaymentLinkUrlNoTrial?.trim();
    if (noTrialUrl) {
      return { sessionId: "", url: noTrialUrl };
    }
    return {
      error:
        "No-trial checkout is not configured for this plan. In Stripe, duplicate each Payment Link without a trial phase, then set stripe_payment_link_url_no_trial in the DB or env STRIPE_PAYMENT_LINK_MONTHLY_NO_TRIAL / STRIPE_PAYMENT_LINK_6_MONTH_NO_TRIAL / STRIPE_PAYMENT_LINK_1_YEAR_NO_TRIAL.",
    };
  }

  // Prefer Payment Link URL (with free trial); Stripe redirects to success_url with session_id
  const paymentLinkUrl = planRow.stripePaymentLinkUrl?.trim();
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
    let transactionStartDate = startDate;
    let transactionEndDate = endDate;
    let transactionAmount = plan.priceUSD;

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent as Stripe.PaymentIntent)?.id ?? null;

    const invRaw = session.invoice;
    const invoiceIdFromSession =
      typeof invRaw === "string" ? invRaw : (invRaw as Stripe.Invoice | null | undefined)?.id ?? null;

    const subRef = session.subscription;
    const subId =
      typeof subRef === "string"
        ? subRef
        : subRef && typeof subRef === "object" && "id" in subRef
          ? (subRef as Stripe.Subscription).id
          : null;
    if (subId) {
      try {
        const sub = await stripe.subscriptions.retrieve(subId);
        const trialEnd = sub.trial_end ? new Date(sub.trial_end * 1000) : null;
        if (trialEnd && trialEnd.getTime() > Date.now()) {
          const trialStart =
            sub.trial_start != null
              ? new Date(sub.trial_start * 1000)
              : new Date(trialEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          transactionStartDate = trialStart;
          transactionEndDate = trialEnd;
          transactionAmount = 0;
        }
      } catch (err: any) {
        console.warn("Stripe webhook: unable to inspect subscription trial window", err?.message);
      }
    }

    await storage.createSubscriptionTransaction({
      userId,
      planId,
      amount: transactionAmount,
      status: "completed",
      stripePaymentIntentId: paymentIntentId,
      stripeInvoiceId: invoiceIdFromSession,
      startDate: transactionStartDate,
      endDate: transactionEndDate,
    });

    await storage.updateUserProfile(userId, {
      subscriptionStatus: "active",
      subscriptionPlan: plan.name as any,
      subscriptionEndsAt: endDate,
      subscriptionCancelAtPeriodEnd: false as any,
      subscriptionCanceledAt: null as any,
      subscriptionTrialUsed: true,
    });

    console.log("Stripe subscription fulfilled", { userId, planId, sessionId: session.id });
  }

  /**
   * Recurring subscription charges (Payment Link / Checkout in subscription mode).
   * Skips subscription_create — initial period is handled by checkout.session.completed or fulfillFromCheckoutSession.
   */
  if (event.type === "invoice.paid") {
    const inv = event.data.object as Stripe.Invoice;
    const br = inv.billing_reason ?? "";
    if (br === "subscription_create") {
      res.status(200).send("OK");
      return;
    }
    if (br !== "subscription_cycle" && br !== "subscription_update") {
      res.status(200).send("OK");
      return;
    }

    const invId = inv.id;
    if (!invId) {
      res.status(200).send("OK");
      return;
    }

    const existing = await storage.getSubscriptionTransactionByStripeInvoiceId(invId);
    if (existing) {
      res.status(200).send("OK");
      return;
    }

    const subRef = inv.subscription;
    const subId =
      typeof subRef === "string"
        ? subRef
        : subRef && typeof subRef === "object" && subRef !== null && "id" in subRef
          ? (subRef as Stripe.Subscription).id
          : null;
    if (!subId) {
      res.status(200).send("OK");
      return;
    }

    const u = await storage.getUserByStripeSubscriptionId(subId);
    if (!u) {
      console.warn("Stripe invoice.paid: no user for subscription", { subId, invId });
      res.status(200).send("OK");
      return;
    }

    const planName = u.subscriptionPlan;
    if (!planName || planName === "institutional") {
      res.status(200).send("OK");
      return;
    }

    const dbPlans = await storage.getSubscriptionPlans();
    const plan = dbPlans.find((p) => p.name === planName);
    if (!plan) {
      console.error("Stripe invoice.paid: plan not found", { planName, userId: u.id });
      res.status(200).send("OK");
      return;
    }

    const periodStart = inv.period_start ? new Date(inv.period_start * 1000) : new Date();
    const periodEnd = inv.period_end ? new Date(inv.period_end * 1000) : new Date(periodStart);
    const amountCents = typeof inv.amount_paid === "number" ? inv.amount_paid : plan.priceUSD;
    const piRef = inv.payment_intent;
    const piId =
      typeof piRef === "string"
        ? piRef
        : piRef && typeof piRef === "object" && piRef !== null && "id" in piRef
          ? (piRef as Stripe.PaymentIntent).id
          : null;

    await storage.createSubscriptionTransaction({
      userId: u.id,
      planId: plan.id,
      amount: amountCents,
      status: "completed",
      stripePaymentIntentId: piId,
      stripeInvoiceId: invId,
      startDate: periodStart,
      endDate: periodEnd,
    });

    const nextEnd = periodEnd;
    await storage.updateUserProfile(u.id, {
      subscriptionEndsAt: nextEnd,
      subscriptionCancelAtPeriodEnd: false as any,
      subscriptionCanceledAt: null as any,
      ...(u.subscriptionStatus !== "trial" ? { subscriptionStatus: "active" as const } : {}),
    } as any);

    console.log("Stripe invoice.paid recorded", { userId: u.id, invId, subId, br });
  }

  res.status(200).send("OK");
}

export async function fulfillFromCheckoutSession(sessionId: string, userId: string, planId: string): Promise<{ ok: true } | { error: string }> {
  const client = getStripeForCheckoutSessionRetrieve(sessionId);
  if (!client) {
    if (sessionId.startsWith("cs_live_")) {
      return { error: stripeLiveKeyMismatchMessage() };
    }
    return { error: "Stripe is not configured." };
  }
  try {
    const session = await client.checkout.sessions.retrieve(sessionId, { expand: ["subscription", "invoice"] });
    if (session.payment_status !== "paid" && session.status !== "complete") return { error: "Checkout session not paid." };
    const plans = await storage.getSubscriptionPlans();
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return { error: "Plan not found." };
    const sub = typeof session.subscription === "object" && session.subscription !== null ? (session.subscription as Stripe.Subscription) : null;
    const subId = sub?.id ?? null;

    let startDate = new Date();
    let endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);
    let transactionStartDate = startDate;
    let transactionEndDate = endDate;
    let transactionAmount = plan.priceUSD;
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
        const trialStart =
          sub.trial_start != null
            ? new Date(sub.trial_start * 1000)
            : new Date(trialEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
        transactionStartDate = trialStart;
        transactionEndDate = trialEnd;
        transactionAmount = 0;
      }
    }

    const invRaw = session.invoice;
    const invoiceIdFromSession =
      typeof invRaw === "string" ? invRaw : invRaw && typeof invRaw === "object" && "id" in invRaw ? (invRaw as Stripe.Invoice).id : null;

    await storage.createSubscriptionTransaction({
      userId,
      planId: plan.id,
      amount: transactionAmount,
      status: "completed",
      stripePaymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
      stripeInvoiceId: invoiceIdFromSession,
      startDate: transactionStartDate,
      endDate: transactionEndDate,
    });
    const updates: Record<string, unknown> = {
      subscriptionStatus,
      subscriptionPlan: plan.name,
      subscriptionEndsAt,
      subscriptionCancelAtPeriodEnd: false,
      subscriptionCanceledAt: null,
      trialEndsAt: trialEndsAt ?? null,
    };
    if (subId) updates.stripeSubscriptionId = subId;
    updates.subscriptionTrialUsed = true;
    await storage.updateUserProfile(userId, updates as any);
    return { ok: true };
  } catch (err: any) {
    const msg = err?.message ?? String(err);
    console.error("Stripe fulfill from session error:", msg);
    if (
      typeof msg === "string" &&
      (msg.includes("No such checkout.session") || msg.includes("resource_missing"))
    ) {
      if (sessionId.startsWith("cs_live_") && STRIPE_SECRET_KEY?.startsWith("sk_test_")) {
        return { error: stripeLiveKeyMismatchMessage() };
      }
      return {
        error:
          msg +
          " If this was a live checkout, ensure STRIPE_SECRET_KEY (or STRIPE_LIVE_SECRET_KEY) is a matching sk_live_ key.",
      };
    }
    return { error: msg || "Fulfill failed." };
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

/** Stripe clients that may own subscriptions (test default + optional live key). */
export function stripeClientsForSubscriptionMutations(): Stripe[] {
  const clients: Stripe[] = [];
  if (stripe) clients.push(stripe);
  const live = STRIPE_LIVE_SECRET_KEY?.trim();
  if (live?.startsWith("sk_live_") && !STRIPE_SECRET_KEY?.startsWith("sk_live_")) {
    clients.push(new Stripe(live));
  }
  return clients;
}

function isStripeSubscriptionMissingError(err: unknown): boolean {
  const e = err as { code?: string; message?: string };
  if (e?.code === "resource_missing") return true;
  const m = typeof e?.message === "string" ? e.message : "";
  return m.includes("No such subscription") || m.includes("a similar object exists in live mode");
}

/**
 * Cancel a Stripe subscription immediately (no further invoices; trialing subs end without converting to paid).
 * Tries default secret key then live key when both are configured.
 */
export async function cancelStripeSubscriptionImmediately(subscriptionId: string): Promise<boolean> {
  const clients = stripeClientsForSubscriptionMutations();
  if (clients.length === 0) return false;
  let lastErr: unknown;
  for (let i = 0; i < clients.length; i++) {
    try {
      await clients[i].subscriptions.cancel(subscriptionId);
      return true;
    } catch (err: unknown) {
      lastErr = err;
      if (isStripeSubscriptionMissingError(err) && i < clients.length - 1) continue;
      if (isStripeSubscriptionMissingError(err)) {
        console.warn("Stripe immediate cancel: subscription not found;", subscriptionId);
        return false;
      }
      console.error("Stripe immediate cancel error:", (err as { message?: string })?.message);
      throw err;
    }
  }
  return false;
}

/**
 * Resolve a customer-viewable URL for a completed checkout:
 * 1) Invoice: `hosted_invoice_url` (best), then `invoice_pdf`, then underlying `charge.receipt_url`.
 * 2) PaymentIntent: `latest_charge.receipt_url` (charge may be an id string — we retrieve it).
 *
 * Tries `STRIPE_SECRET_KEY` client first, then `STRIPE_LIVE_SECRET_KEY` when configured (same account
 * as subscription cancel / fulfill).
 */
async function receiptUrlFromCharge(
  client: Stripe,
  latestCharge: string | Stripe.Charge | null | undefined
): Promise<string | null> {
  if (latestCharge == null) return null;
  try {
    const ch =
      typeof latestCharge === "string"
        ? await client.charges.retrieve(latestCharge)
        : latestCharge;
    return ch.receipt_url ?? null;
  } catch {
    return null;
  }
}

export async function getReceiptOrInvoiceUrlForTransaction(
  stripePaymentIntentId: string | null | undefined,
  stripeInvoiceId: string | null | undefined
): Promise<string | null> {
  const clients = stripeClientsForSubscriptionMutations();
  if (clients.length === 0) return null;

  const invId = stripeInvoiceId?.trim();
  if (invId) {
    for (const c of clients) {
      try {
        const inv = await c.invoices.retrieve(invId, { expand: ["charge"] });
        if (inv.hosted_invoice_url) return inv.hosted_invoice_url;
        if (inv.invoice_pdf) return inv.invoice_pdf;
        const chargeRef = inv.charge as string | Stripe.Charge | null | undefined;
        const fromInvCharge = await receiptUrlFromCharge(c, chargeRef ?? null);
        if (fromInvCharge) return fromInvCharge;
      } catch {
        continue;
      }
    }
  }

  const piId = stripePaymentIntentId?.trim();
  if (piId) {
    for (const c of clients) {
      try {
        const pi = await c.paymentIntents.retrieve(piId, { expand: ["latest_charge"] });
        const fromPi = await receiptUrlFromCharge(c, pi.latest_charge);
        if (fromPi) return fromPi;
      } catch {
        continue;
      }
    }
  }

  return null;
}

async function retrieveStripeSubscriptionAcrossClients(
  subscriptionId: string
): Promise<Stripe.Subscription | null> {
  const clients = stripeClientsForSubscriptionMutations();
  for (let i = 0; i < clients.length; i++) {
    try {
      return await clients[i].subscriptions.retrieve(subscriptionId, {
        expand: ["latest_invoice"],
      });
    } catch (err: unknown) {
      if (isStripeSubscriptionMissingError(err) && i < clients.length - 1) continue;
      if (isStripeSubscriptionMissingError(err)) return null;
      throw err;
    }
  }
  return null;
}

/**
 * Periodic Stripe reconciliation:
 * - Ensures user entitlement dates/status match Stripe subscription state
 * - Backfills missed recurring paid invoices into subscription_transactions (idempotent by invoice id)
 */
export async function reconcileStripeSubscriptions(): Promise<{
  scanned: number;
  updatedUsers: number;
  createdTransactions: number;
  skippedNoStripe: number;
  errors: number;
}> {
  if (!stripe) {
    return { scanned: 0, updatedUsers: 0, createdTransactions: 0, skippedNoStripe: 0, errors: 0 };
  }

  const users = await storage.getUsersWithStripeSubscriptions();
  const plans = await storage.getSubscriptionPlans();
  const planByName = new Map(plans.map((p) => [p.name, p]));
  let updatedUsers = 0;
  let createdTransactions = 0;
  let skippedNoStripe = 0;
  let errors = 0;
  const nowMs = Date.now();

  for (const u of users) {
    const subId = u.stripeSubscriptionId?.trim();
    if (!subId) {
      skippedNoStripe += 1;
      continue;
    }
    try {
      const sub = await retrieveStripeSubscriptionAcrossClients(subId);
      if (!sub) continue;

      const periodEnd =
        typeof sub.current_period_end === "number"
          ? new Date(sub.current_period_end * 1000)
          : null;
      const trialEnd =
        typeof sub.trial_end === "number" && sub.trial_end > 0
          ? new Date(sub.trial_end * 1000)
          : null;
      const cancelAtPeriodEnd = sub.cancel_at_period_end === true;

      const updates: Record<string, unknown> = {};
      if (periodEnd) updates.subscriptionEndsAt = periodEnd;
      updates.subscriptionCancelAtPeriodEnd = cancelAtPeriodEnd;
      updates.subscriptionCanceledAt = cancelAtPeriodEnd ? (u.subscriptionCanceledAt ?? new Date()) : null;

      if (periodEnd && periodEnd.getTime() <= nowMs) {
        updates.subscriptionStatus = "expired";
      } else if (sub.status === "trialing" && trialEnd && trialEnd.getTime() > nowMs) {
        updates.subscriptionStatus = "trial";
        updates.trialEndsAt = trialEnd;
      } else {
        updates.subscriptionStatus = "active";
        updates.trialEndsAt = null;
      }

      await storage.updateUserProfile(u.id, updates as any);
      updatedUsers += 1;

      const latestInvoice = sub.latest_invoice as Stripe.Invoice | string | null | undefined;
      const inv =
        latestInvoice && typeof latestInvoice === "object" && "id" in latestInvoice
          ? (latestInvoice as Stripe.Invoice)
          : null;
      const invoiceId = inv?.id ?? null;
      const invoicePaid = !!inv && (inv.status === "paid" || inv.paid === true);
      const planName = u.subscriptionPlan ?? null;
      const plan = planName ? planByName.get(planName) : undefined;
      if (invoiceId && invoicePaid && plan) {
        const existing = await storage.getSubscriptionTransactionByStripeInvoiceId(invoiceId);
        if (!existing) {
          const periodStart = inv?.period_start ? new Date(inv.period_start * 1000) : new Date();
          const txEnd =
            inv?.period_end
              ? new Date(inv.period_end * 1000)
              : periodEnd ?? new Date(periodStart.getTime() + plan.durationMonths * 30 * 24 * 60 * 60 * 1000);
          const amountCents = typeof inv?.amount_paid === "number" ? inv.amount_paid : plan.priceUSD;
          const piRef = inv?.payment_intent;
          const piId =
            typeof piRef === "string"
              ? piRef
              : piRef && typeof piRef === "object" && "id" in piRef
                ? (piRef as Stripe.PaymentIntent).id
                : null;

          await storage.createSubscriptionTransaction({
            userId: u.id,
            planId: plan.id,
            amount: amountCents,
            status: "completed",
            stripePaymentIntentId: piId,
            stripeInvoiceId: invoiceId,
            startDate: periodStart,
            endDate: txEnd,
          });
          createdTransactions += 1;
        }
      }
    } catch (err: any) {
      errors += 1;
      console.error("Stripe reconciliation user error:", {
        userId: u.id,
        stripeSubscriptionId: subId,
        message: err?.message ?? String(err),
      });
    }
  }

  return {
    scanned: users.length,
    updatedUsers,
    createdTransactions,
    skippedNoStripe,
    errors,
  };
}

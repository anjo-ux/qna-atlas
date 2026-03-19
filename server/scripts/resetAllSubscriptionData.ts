/**
 * DESTRUCTIVE — run separately against dev and production DATABASE_URL.
 *
 * - Deletes ALL rows in subscription_transactions
 * - Clears on ALL users: subscription status/plan/dates, Stripe ids, trial_used,
 *   institutional access fields, institutional_code_redeemed_at
 * - Does NOT remove users, passwords, study progress, notes, or profile institutional_affiliation
 * - Does NOT cancel Stripe subscriptions (cancel in Stripe Dashboard if required)
 *
 * Usage:
 *   CONFIRM_RESET_ALL_SUBSCRIPTION_DATA=yes DATABASE_URL="postgresql://..." npx tsx server/scripts/resetAllSubscriptionData.ts
 *
 * Or set RUN_SUBSCRIPTION_RESET=true once and restart the server (same logic as this script).
 */
import { runFullSubscriptionDataReset } from "../subscriptionFullReset";
import { pool } from "../db";

if (process.env.CONFIRM_RESET_ALL_SUBSCRIPTION_DATA !== "yes") {
  console.error(
    "Refusing to run. Set CONFIRM_RESET_ALL_SUBSCRIPTION_DATA=yes and ensure DATABASE_URL points at the intended database."
  );
  process.exit(1);
}

async function main() {
  console.log("Running full subscription data reset…");
  const result = await runFullSubscriptionDataReset(pool);
  console.log("Done:", result);
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

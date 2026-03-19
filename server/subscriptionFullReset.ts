import type { Pool } from "pg";

/**
 * Clears all subscription-related data for every user (DB only).
 * Does not cancel active Stripe subscriptions — handle those in Stripe Dashboard if needed.
 */
export async function runFullSubscriptionDataReset(pool: Pool): Promise<{
  deletedTransactions: number;
  updatedUsers: number;
}> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const del = await client.query(`DELETE FROM "subscription_transactions"`);
    const upd = await client.query(`
      UPDATE "users"
      SET
        "subscription_status" = 'expired',
        "trial_ends_at" = NULL,
        "subscription_ends_at" = NULL,
        "subscription_plan" = NULL,
        "institutional_access_affiliation" = NULL,
        "institutional_access_expires_at" = NULL,
        "institutional_code_redeemed_at" = NULL,
        "stripe_customer_id" = NULL,
        "stripe_subscription_id" = NULL,
        "subscription_trial_used" = false,
        "updated_at" = CURRENT_TIMESTAMP
    `);
    await client.query("COMMIT");
    return {
      deletedTransactions: del.rowCount ?? 0,
      updatedUsers: upd.rowCount ?? 0,
    };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

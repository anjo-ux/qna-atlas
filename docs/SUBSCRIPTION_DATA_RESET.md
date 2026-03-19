# Reset all subscription data (dev / production)

This wipes **database** subscription state for **every user**. It does **not** cancel subscriptions in Stripe (do that in the Stripe Dashboard if you need billing to stop).

## What gets cleared

- All rows in `subscription_transactions` and `user_institutional_code_redemptions`
- On every user: `subscription_status` → `expired`, plan/trial/end dates, Stripe customer + subscription IDs, `subscription_trial_used` → `false`, institutional **access** fields + `institutional_code_redeemed_at` (legacy column, cleared)

## What is kept

- User accounts, passwords, OAuth links, `tester`, profile `institutional_affiliation` (display-only in Settings)
- Study data: responses, notes, bookmarks, test sessions, etc.
- `subscription_plans` and `institutional_codes` catalog tables

## Option A — one-off script (recommended)

Point `DATABASE_URL` at the target database, then:

```bash
CONFIRM_RESET_ALL_SUBSCRIPTION_DATA=yes npm run reset:subscription-data
```

Run once for **dev** and once for **production** (with each environment’s URL).

## Option B — on next server start

Set `RUN_SUBSCRIPTION_RESET=true`, deploy/restart **once**, then **remove** the env var so it does not run again on every restart.

Same logic as Option A; logs: `[RUN_SUBSCRIPTION_RESET] Full subscription data reset: …`

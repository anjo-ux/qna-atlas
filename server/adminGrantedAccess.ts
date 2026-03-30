import type { User } from "@shared/schema";

/**
 * Accounts that always have full Atlas Review access (no paywall), regardless of Stripe / trial / institutional rows.
 * Case-insensitive match on `users.email`.
 *
 * Optional env `ADMIN_FOREVER_ACCESS_EMAILS` — comma-separated emails merged with the defaults below.
 */
const DEFAULT_ADMIN_FOREVER_ACCESS_EMAILS = ["orr.shauly@gmail.com"] as const;

function buildAdminForeverAccessSet(): Set<string> {
  const set = new Set<string>(
    DEFAULT_ADMIN_FOREVER_ACCESS_EMAILS.map((e) => e.trim().toLowerCase()).filter(Boolean)
  );
  const extra = process.env.ADMIN_FOREVER_ACCESS_EMAILS ?? "";
  for (const part of extra.split(",")) {
    const e = part.trim().toLowerCase();
    if (e) set.add(e);
  }
  return set;
}

const adminForeverAccessEmails = buildAdminForeverAccessSet();

export function userHasAdminForeverAccess(user: User | null | undefined): boolean {
  const email = user?.email?.trim().toLowerCase();
  if (!email) return false;
  return adminForeverAccessEmails.has(email);
}

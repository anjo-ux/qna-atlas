import type { User } from "@shared/schema";

export type SanitizedUser = Omit<User, "passwordHash"> & { passwordHash?: never };

/**
 * Strip sensitive fields from user for API responses and session storage.
 * Never expose passwordHash to the client or store it in session payloads.
 */
export function sanitizeUser(user: User | null | undefined): SanitizedUser | null {
  if (!user) return null;
  const { passwordHash: _, ...rest } = user;
  return rest as SanitizedUser;
}

/** Built-in institutional code: full platform access with no expiry (redeemed via existing UI). */
export const SOCIALMEDIA_INSTITUTIONAL_CODE = "socialmedia";

/** Sentinel end date for unlimited institutional access (year 2099). */
export const UNLIMITED_INSTITUTIONAL_EXPIRES_AT_ISO = "2099-12-31T23:59:59.999Z";

const UNLIMITED_INSTITUTIONAL_EXPIRES_AT_MS = new Date(
  UNLIMITED_INSTITUTIONAL_EXPIRES_AT_ISO
).getTime();

export function isUnlimitedInstitutionalCode(plainCode: string): boolean {
  return plainCode.trim().toLowerCase() === SOCIALMEDIA_INSTITUTIONAL_CODE;
}

export function normalizeInstitutionalCodeForLookup(plainCode: string): string {
  const trimmed = plainCode.trim();
  return isUnlimitedInstitutionalCode(trimmed) ? SOCIALMEDIA_INSTITUTIONAL_CODE : trimmed;
}

export function isUnlimitedInstitutionalExpiry(expiresAt: Date | null | undefined): boolean {
  if (!expiresAt) return false;
  return expiresAt.getTime() >= UNLIMITED_INSTITUTIONAL_EXPIRES_AT_MS;
}

export function institutionalAccessExpiresAtForRedemption(plainCode: string): Date {
  if (isUnlimitedInstitutionalCode(plainCode)) {
    return new Date(UNLIMITED_INSTITUTIONAL_EXPIRES_AT_ISO);
  }
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 365);
  return expiresAt;
}

export function institutionalDaysRemaining(
  expiresAt: Date | null,
  now: Date = new Date()
): number | null {
  if (!expiresAt) return null;
  if (isUnlimitedInstitutionalExpiry(expiresAt)) return null;
  return Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

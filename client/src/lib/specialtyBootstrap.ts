import {
  DEFAULT_SPECIALTY_ID,
  SPECIALTY_BOOTSTRAP_GLOBAL,
  getSpecialty,
  isKnownSpecialtyHost,
  isSpecialtyId,
  specialtyFromHostname,
  type SpecialtyBootstrap,
  type SpecialtyConfig,
  type SpecialtyId,
} from "@shared/specialties";

const MARKETING_SPECIALTY_STORAGE_KEY = "atlas.marketingSpecialty";

const marketingSpecialtyListeners = new Set<() => void>();

function notifyMarketingSpecialtyListeners(): void {
  marketingSpecialtyListeners.forEach((listener) => listener());
}

/**
 * Host specialty available synchronously on first paint. The server injects
 * a bootstrap global; hostname is the fallback when the shell was served from
 * cache or a dev tool bypassed injection.
 *
 * Theme (`data-specialty`) is intentionally not read here — the client updates
 * that attribute when previewing another specialty or the logged-in q-bank.
 */
export function readHostSpecialty(): SpecialtyId {
  if (typeof window === "undefined") return DEFAULT_SPECIALTY_ID;

  const injected = (window as unknown as Record<string, SpecialtyBootstrap | undefined>)[
    SPECIALTY_BOOTSTRAP_GLOBAL
  ];
  if (injected && isSpecialtyId(injected.hostSpecialty)) return injected.hostSpecialty;

  return specialtyFromHostname(window.location.hostname);
}

function readMarketingSpecialtyOverride(): SpecialtyId | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(MARKETING_SPECIALTY_STORAGE_KEY);
    return isSpecialtyId(raw) ? raw : null;
  } catch {
    return null;
  }
}

/** Specialty driving marketing copy/theme: session override, else domain host. */
export function getMarketingSpecialtyId(): SpecialtyId {
  return readMarketingSpecialtyOverride() ?? readHostSpecialty();
}

export function subscribeMarketingSpecialty(listener: () => void): () => void {
  marketingSpecialtyListeners.add(listener);
  return () => {
    marketingSpecialtyListeners.delete(listener);
  };
}

/**
 * Switch the marketing specialty preview.
 * On a production specialty host, choosing the other bank navigates to that
 * specialty's domain — except on auth routes, where a local session override
 * keeps signup/sign-in form state intact.
 * On preview/localhost, always apply a session override in place.
 */
export function switchMarketingSpecialty(specialtyId: SpecialtyId): void {
  if (!isSpecialtyId(specialtyId)) return;

  if (typeof window !== "undefined" && isKnownSpecialtyHost(window.location.hostname)) {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const onAuthRoute =
      path === "/login" || path === "/signup" || path.startsWith("/reset-password");
    const hostSpecialty = specialtyFromHostname(window.location.hostname);
    if (!onAuthRoute && specialtyId !== hostSpecialty) {
      const target = getSpecialty(specialtyId);
      const { pathname, search, hash } = window.location;
      window.location.assign(`${target.canonicalOrigin}${pathname}${search}${hash}`);
      return;
    }
  }

  try {
    if (specialtyId === readHostSpecialty()) {
      sessionStorage.removeItem(MARKETING_SPECIALTY_STORAGE_KEY);
    } else {
      sessionStorage.setItem(MARKETING_SPECIALTY_STORAGE_KEY, specialtyId);
    }
  } catch {
    // sessionStorage may be unavailable; still apply theme below.
  }

  applySpecialtyToDocument(specialtyId);
  notifyMarketingSpecialtyListeners();
}

/** Applies the specialty palette by setting `data-specialty` on <html>. */
export function applySpecialtyToDocument(specialtyId: SpecialtyId): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-specialty", specialtyId);
}

export function hostSpecialtyConfig(): SpecialtyConfig {
  return getSpecialty(getMarketingSpecialtyId());
}

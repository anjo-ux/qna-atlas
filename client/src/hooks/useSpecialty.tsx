import { createContext, useCallback, useContext, useEffect, useState, useSyncExternalStore } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  applySpecialtyToDocument,
  getMarketingSpecialtyId,
  readHostSpecialty,
  subscribeMarketingSpecialty,
  switchMarketingSpecialty,
} from "@/lib/specialtyBootstrap";
import { useAuth } from "@/hooks/useAuth";
import {
  DEFAULT_SPECIALTY_ID,
  SPECIALTY_LIST,
  getSpecialty,
  isSpecialtyId,
  type SpecialtyConfig,
  type SpecialtyId,
} from "@shared/specialties";

type SpecialtyContextResponse = {
  hostSpecialty: SpecialtyId;
  activeSpecialty: SpecialtyId;
  available: { id: SpecialtyId; specialtyName: string; brandName: string; shortName: string }[];
  entitlements: { specialtyId: SpecialtyId; isLocked: boolean }[];
};

interface SpecialtyContextType {
  /** Specialty implied by the domain the user is on; drives marketing + signup default. */
  hostSpecialty: SpecialtyId;
  /** Question bank currently in use (logged-in); falls back to host specialty when logged out. */
  activeSpecialty: SpecialtyId;
  specialty: SpecialtyConfig;
  available: readonly SpecialtyConfig[];
  lockedBySpecialty: Partial<Record<SpecialtyId, boolean>>;
  isSwitching: boolean;
  switchSpecialty: (specialtyId: SpecialtyId) => void;
}

const SpecialtyContext = createContext<SpecialtyContextType | undefined>(undefined);

/** Queries invalidated on switch: everything whose contents depend on the question bank. */
const SPECIALTY_SCOPED_QUERY_PREFIXES = [
  "/api/sections",
  "/api/subscription",
  "/api/user",
  "/api/auth/user",
  "/api/specialty",
  "/api/progress",
  "/api/stats",
  "/api/bookmarks",
  "/api/spaced-repetition",
];

const MARKETING_PATHS = new Set([
  "/about",
  "/the-atlas-way",
  "/contact",
  "/pricing",
  "/oral-boards-coach",
  "/terms",
  "/privacy",
  "/preview",
]);

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function isAuthPath(pathname: string): boolean {
  const path = normalizePath(pathname);
  return path === "/login" || path === "/signup" || path.startsWith("/reset-password");
}

function isMarketingPath(
  pathname: string,
  isAuthenticated: boolean,
  isAuthLoading: boolean,
): boolean {
  const path = normalizePath(pathname);
  if (MARKETING_PATHS.has(path)) return true;
  // While auth resolves, keep the active/bootstrap specialty on `/` to avoid a theme flash.
  if (path === "/" && isAuthLoading) return false;
  // Logged-out home is Landing; logged-in home is the q-bank.
  return path === "/" && !isAuthenticated;
}

export function SpecialtyProvider({ children }: { children: React.ReactNode }) {
  const hostSpecialtyFromShell = readHostSpecialty();
  const [activeSpecialty, setActiveSpecialty] = useState<SpecialtyId>(hostSpecialtyFromShell);
  const [location, setLocation] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const { data } = useQuery<SpecialtyContextResponse>({
    queryKey: ["/api/specialty"],
    staleTime: 0,
    retry: false,
  });

  const hostSpecialty = isSpecialtyId(data?.hostSpecialty)
    ? data.hostSpecialty
    : hostSpecialtyFromShell;

  // Server is authoritative once loaded: an Ortho subscriber on prs-atlas.com still gets Ortho.
  useEffect(() => {
    if (isSpecialtyId(data?.activeSpecialty)) setActiveSpecialty(data.activeSpecialty);
  }, [data?.activeSpecialty]);

  /**
   * Theme source of truth:
   * - Auth routes: Login owns the document specialty (signup picker preview).
   * - Marketing: marketing specialty (host domain, or session override on preview).
   * - App / subscribe: active question bank.
   */
  useEffect(() => {
    if (isAuthPath(location)) return;
    const themeSpecialty = isMarketingPath(location, isAuthenticated, isAuthLoading)
      ? getMarketingSpecialtyId()
      : activeSpecialty;
    applySpecialtyToDocument(themeSpecialty);
    if (!isMarketingPath(location, isAuthenticated, isAuthLoading)) return;
    return subscribeMarketingSpecialty(() => {
      applySpecialtyToDocument(getMarketingSpecialtyId());
    });
  }, [activeSpecialty, hostSpecialty, location, isAuthenticated, isAuthLoading]);

  const switchMutation = useMutation({
    mutationFn: async (specialtyId: SpecialtyId) =>
      apiRequest("/api/specialty/active", {
        method: "POST",
        body: JSON.stringify({ specialtyId }),
      }),
    onSuccess: (_result, specialtyId) => {
      setActiveSpecialty(specialtyId);
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          return (
            typeof key === "string" &&
            SPECIALTY_SCOPED_QUERY_PREFIXES.some((prefix) => key.startsWith(prefix))
          );
        },
      });
      // Land on home so locked banks show the themed subscribe paywall immediately.
      if (normalizePath(location) !== "/") {
        setLocation("/");
      }
    },
  });

  const switchSpecialty = useCallback(
    (specialtyId: SpecialtyId) => {
      if (specialtyId === activeSpecialty) return;
      switchMutation.mutate(specialtyId);
    },
    [activeSpecialty, switchMutation]
  );

  const lockedBySpecialty: Partial<Record<SpecialtyId, boolean>> = {};
  for (const entitlement of data?.entitlements ?? []) {
    lockedBySpecialty[entitlement.specialtyId] = entitlement.isLocked;
  }

  return (
    <SpecialtyContext.Provider
      value={{
        hostSpecialty,
        activeSpecialty,
        specialty: getSpecialty(activeSpecialty),
        available: SPECIALTY_LIST,
        lockedBySpecialty,
        isSwitching: switchMutation.isPending,
        switchSpecialty,
      }}
    >
      {children}
    </SpecialtyContext.Provider>
  );
}

export function useSpecialty(): SpecialtyContextType {
  const context = useContext(SpecialtyContext);
  if (!context) {
    throw new Error("useSpecialty must be used within SpecialtyProvider");
  }
  return context;
}

/**
 * Specialty for marketing/auth surfaces. Follows the domain by default; on
 * preview hosts, `switchMarketingSpecialty` can override for the session.
 */
export function useHostSpecialty(): SpecialtyConfig {
  const specialtyId = useSyncExternalStore(
    subscribeMarketingSpecialty,
    getMarketingSpecialtyId,
    () => DEFAULT_SPECIALTY_ID,
  );
  return getSpecialty(specialtyId);
}

export function useSwitchMarketingSpecialty(): (specialtyId: SpecialtyId) => void {
  return switchMarketingSpecialty;
}

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
  isKnownSpecialtyHost,
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

/** Queries cleared on switch so the dashboard never keeps the previous bank's numbers. */
const SPECIALTY_CONTENT_QUERY_PREFIXES = [
  "/api/sections",
  "/api/preview/questions",
  "/api/subscription",
  "/api/question-responses",
  "/api/test-sessions",
  "/api/highlights",
  "/api/bookmarks",
  "/api/spaced-repetition",
];

function isSpecialtyContentQuery(queryKey: readonly unknown[]): boolean {
  const key = queryKey[0];
  return (
    typeof key === "string" &&
    SPECIALTY_CONTENT_QUERY_PREFIXES.some((prefix) => key.startsWith(prefix))
  );
}

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
  const [handoffPending, setHandoffPending] = useState(false);
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
    mutationFn: async (specialtyId: SpecialtyId) => {
      await apiRequest("/api/specialty/active", {
        method: "POST",
        body: JSON.stringify({ specialtyId }),
      });
      return specialtyId;
    },
    onMutate: async (specialtyId) => {
      const previousSpecialty = activeSpecialty;
      setHandoffPending(true);
      queryClient.removeQueries({
        predicate: (query) => isSpecialtyContentQuery(query.queryKey),
      });
      // Theme flips immediately; activeSpecialty waits for the server so /api/sections
      // does not briefly return the previous bank under the new specialty key.
      if (!isAuthPath(location) && !isMarketingPath(location, isAuthenticated, isAuthLoading)) {
        applySpecialtyToDocument(specialtyId);
      }
      return { previousSpecialty };
    },
    onSuccess: async (_result, specialtyId) => {
      // Production: switching banks navigates to that specialty's domain with a session handoff.
      if (
        typeof window !== "undefined" &&
        isKnownSpecialtyHost(window.location.hostname) &&
        getSpecialty(specialtyId).apexHost !== window.location.hostname.replace(/^www\./, "")
      ) {
        try {
          const handoff = await apiRequest("/api/auth/handoff", {
            method: "POST",
            body: JSON.stringify({
              targetSpecialtyId: specialtyId,
              nextPath: "/",
            }),
          });
          const dest = handoff?.handoffUrl ?? handoff?.url;
          if (typeof dest === "string" && dest) {
            window.location.assign(dest);
            return;
          }
        } catch (error) {
          console.error("Cross-domain handoff failed:", error);
        }
      }

      // Same-host (localhost / preview): stay put and refresh queries.
      queryClient.removeQueries({
        predicate: (query) => isSpecialtyContentQuery(query.queryKey),
      });
      setActiveSpecialty(specialtyId);
      setHandoffPending(false);
      queryClient.invalidateQueries({ queryKey: ["/api/specialty"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      if (normalizePath(location) !== "/") {
        setLocation("/");
      }
    },
    onError: (_error, _specialtyId, context) => {
      setHandoffPending(false);
      const previous = context?.previousSpecialty;
      if (isSpecialtyId(previous)) {
        if (!isAuthPath(location) && !isMarketingPath(location, isAuthenticated, isAuthLoading)) {
          applySpecialtyToDocument(previous);
        }
      }
    },
  });

  const switchSpecialty = useCallback(
    (specialtyId: SpecialtyId) => {
      if (specialtyId === activeSpecialty || switchMutation.isPending) return;
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
        isSwitching: switchMutation.isPending || handoffPending,
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

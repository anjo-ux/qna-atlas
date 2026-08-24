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
  /** Question bank currently in use (logged-in); on production hosts this matches the domain. */
  activeSpecialty: SpecialtyId;
  specialty: SpecialtyConfig;
  available: readonly SpecialtyConfig[];
  lockedBySpecialty: Partial<Record<SpecialtyId, boolean>>;
  isSwitching: boolean;
  switchSpecialty: (specialtyId: SpecialtyId) => void;
}

const SpecialtyContext = createContext<SpecialtyContextType | undefined>(undefined);

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
  if (path === "/" && isAuthLoading) return false;
  return path === "/" && !isAuthenticated;
}

function hostnameIsSpecialtyHost(): boolean {
  return typeof window !== "undefined" && isKnownSpecialtyHost(window.location.hostname);
}

function currentApexHost(): string {
  return typeof window === "undefined" ? "" : window.location.hostname.replace(/^www\./, "");
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

  // Production domains always show that host's bank. Preview/localhost can switch in place.
  useEffect(() => {
    if (!isSpecialtyId(data?.activeSpecialty)) return;
    if (hostnameIsSpecialtyHost()) {
      setActiveSpecialty(hostSpecialty);
      return;
    }
    setActiveSpecialty(data.activeSpecialty);
  }, [data?.activeSpecialty, hostSpecialty]);

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
      const crossDomain =
        hostnameIsSpecialtyHost() && getSpecialty(specialtyId).apexHost !== currentApexHost();

      if (crossDomain) {
        const handoff = await apiRequest("/api/auth/handoff", {
          method: "POST",
          body: JSON.stringify({
            targetSpecialtyId: specialtyId,
            nextPath: "/",
          }),
        });
        const dest = handoff?.handoffUrl ?? handoff?.url;
        if (typeof dest !== "string" || !dest) {
          throw new Error("Cross-domain handoff did not return a destination.");
        }
        window.location.assign(dest);
        return specialtyId;
      }

      await apiRequest("/api/specialty/active", {
        method: "POST",
        body: JSON.stringify({ specialtyId }),
      });
      return specialtyId;
    },
    onMutate: async () => {
      const previousSpecialty = activeSpecialty;
      setHandoffPending(true);
      return { previousSpecialty };
    },
    onSuccess: async (_result, specialtyId) => {
      if (hostnameIsSpecialtyHost() && getSpecialty(specialtyId).apexHost !== currentApexHost()) {
        return;
      }

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
      if (isSpecialtyId(previous) && !isAuthPath(location) && !isMarketingPath(location, isAuthenticated, isAuthLoading)) {
        applySpecialtyToDocument(previous);
      }
    },
  });

  const switchSpecialty = useCallback(
    (specialtyId: SpecialtyId) => {
      if (specialtyId === activeSpecialty || switchMutation.isPending || handoffPending) return;
      switchMutation.mutate(specialtyId);
    },
    [activeSpecialty, switchMutation, handoffPending],
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

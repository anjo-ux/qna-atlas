import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

/** /api/auth/user includes introTrialAvailable for the active specialty. */
export type AuthUser = User & {
  introTrialAvailable?: boolean;
  activeSpecialtyId?: string;
};

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: false, // Don't throw on error - handle gracefully
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
      const data = (await res.json().catch(() => ({}))) as { continueLogoutUrl?: string };
      queryClient.clear();
      if (
        typeof data.continueLogoutUrl === 'string' &&
        /^https:\/\/(www\.)?(prs-atlas|ortho-atlas)\.com\/api\/auth\/logout\?/.test(data.continueLogoutUrl)
      ) {
        window.location.href = data.continueLogoutUrl;
        return;
      }
      window.location.href = '/';
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  // Treat any error (including 401) as simply unauthenticated
  const isError = !!error;

  return {
    user: isError ? null : user || null,
    isAuthenticated: !!user && !isError,
    isLoading,
    logout: logoutMutation.mutate,
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: false, // Don't throw on error - handle gracefully
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      window.location.href = '/api/logout';
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

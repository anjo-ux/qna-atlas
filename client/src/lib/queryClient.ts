import { QueryClient } from "@tanstack/react-query";

async function throwError(response: Response) {
  let message = `Error: ${response.status}`;

  try {
    const data = await response.json();
    if (data?.message) {
      message = data.message;
    }
  } catch {
    // Failed to parse JSON
  }

  throw new Error(message);
}

async function fetcher(url: string) {
  const res = await fetch(url, { credentials: "include" });

  // For auth endpoint, return null on 401/403 instead of throwing
  if (url.includes('/api/auth/user') && (res.status === 401 || res.status === 403)) {
    return null;
  }

  if (!res.ok) {
    await throwError(res);
  }

  return await res.json();
}

export async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!res.ok) {
    await throwError(res);
  }

  return await res.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => fetcher(queryKey[0] as string),
      staleTime: 1000 * 60 * 5,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

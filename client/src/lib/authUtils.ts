export function handleAuthError(error: any) {
  // Don't redirect on 401 - just let the app show the Landing page
  if (error?.message === "Unauthorized" || error?.status === 401) {
    return;
  }
  throw error;
}

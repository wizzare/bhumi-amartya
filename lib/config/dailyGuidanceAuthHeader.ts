export async function getDailyGuidanceAuthHeaders(): Promise<Record<string, string>> {
  if (typeof window === "undefined") return {};
  try {
    const { auth } = await import("@/lib/firebase/firebase");
    const token = await auth.currentUser?.getIdToken();
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    // Graceful fallback for offline / unauthenticated states
  }
  return {};
}

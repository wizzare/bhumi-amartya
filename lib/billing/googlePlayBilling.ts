export const GOOGLE_PLAY_BILLING_ENABLED = false;

export async function initiateGooglePlaySubscription(): Promise<boolean> {
  // TODO: Integrate actual Google Play Billing logic here when the app is packaged
  // For the MVP, this just simulates the flow or alerts the user.
  console.log("[Google Play Billing] Subscription flow initiated.");
  alert("Integrasi Google Play Billing belum diaktifkan di versi ini.");
  return false; 
}

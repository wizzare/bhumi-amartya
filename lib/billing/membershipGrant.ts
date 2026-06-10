import { PENJAGA_BHUMI_INTI_EMAILS, PENJAGA_BHUMI_INTI_DURATION_DAYS } from "@/lib/constants/membership";

export type MembershipType = "REGULAR" | "PENJAGA_BHUMI_INTI";

export function getPenjagaBhumiIntiGrant(email?: string | null) {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const isMatch = PENJAGA_BHUMI_INTI_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

  if (!isMatch) return null;

  return {
    membershipType: "PENJAGA_BHUMI_INTI" as const,
    planType: "FREE" as const,
    planLabel: "Free Plan 2 Bulan",
    durationDays: PENJAGA_BHUMI_INTI_DURATION_DAYS,
    badge: "Penjaga Bhumi Inti",
  };
}

export function isPenjagaBhumiInti(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return PENJAGA_BHUMI_INTI_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
}

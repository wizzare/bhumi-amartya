import { PENJAGA_BHUMI_INTI_DIRECT_EMAILS, PENJAGA_BHUMI_INTI_EMAILS } from "@/lib/constants/membership";

export type MembershipType = "REGULAR" | "PENJAGA_BHUMI_INTI";

export function getPenjagaBhumiIntiGrant(email?: string | null) {
  if (!email) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const isMatch = PENJAGA_BHUMI_INTI_EMAILS.some(e => e.toLowerCase() === normalizedEmail);

  if (!isMatch) return null;

  return {
    membershipType: "PENJAGA_BHUMI_INTI" as const,
    planType: "FREE" as const,
    planLabel: "Akses Bhumi Inti",
    badge: "Penjaga Bhumi Inti",
  };
}

export function isPenjagaBhumiInti(email?: string | null): boolean {
  if (!email) return false;
  const normalizedEmail = email.trim().toLowerCase();
  return PENJAGA_BHUMI_INTI_EMAILS.some(e => e.toLowerCase() === normalizedEmail);
}

export function isDirectPenjagaBhumiInti(email?: string | null): boolean {
  if (!email) return false;
  return PENJAGA_BHUMI_INTI_DIRECT_EMAILS.includes(email.trim().toLowerCase() as typeof PENJAGA_BHUMI_INTI_DIRECT_EMAILS[number]);
}

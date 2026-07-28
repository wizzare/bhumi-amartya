const FOUNDER_ALLOWLIST = [
  "wedhaswarawidhi@gmail.com",
  "widhi.w.karyodikromo@gmail.com",
  "wizzare@gmail.com",
];

function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  return normalized.length > 0 ? normalized : null;
}

export function isFounderQaMode(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA === "true";
}

export function evaluateFounderQaAllowlist(
  email: string | null | undefined,
): { allowed: boolean; reason?: string } {
  if (!isFounderQaMode()) return { allowed: true };
  const normalized = normalizeEmail(email);
  if (!normalized) {
    return { allowed: false, reason: "Email tidak dikenali. Hanya akun Founder yang diizinkan dalam mode ini." };
  }
  if (!FOUNDER_ALLOWLIST.includes(normalized)) {
    return { allowed: false, reason: "Akun ini tidak terdaftar dalam whitelist Founder QA." };
  }
  return { allowed: true };
}

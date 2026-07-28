import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

const FOUNDER_ALLOWLIST = [
  "wedhaswarawidhi@gmail.com",
  "widhi.w.karyodikromo@gmail.com",
  "wizzare@gmail.com",
];

const QA_FLAG = process.env.NEXT_PUBLIC_ENABLE_FOUNDER_PRE_RELEASE_QA === "true";

function normalizeEmail(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  return normalized.length > 0 ? normalized : null;
}

export async function enforceFounderQaAllowlist(
  email: string | null | undefined,
): Promise<{ allowed: boolean; reason?: string }> {
  if (!QA_FLAG) return { allowed: true };
  const normalized = normalizeEmail(email);
  if (!normalized) {
    await signOut(auth);
    return { allowed: false, reason: "Email tidak dikenali. Hanya akun Founder yang diizinkan dalam mode ini." };
  }
  if (!FOUNDER_ALLOWLIST.includes(normalized)) {
    await signOut(auth);
    return { allowed: false, reason: "Akun ini tidak terdaftar dalam whitelist Founder QA." };
  }
  return { allowed: true };
}

export function isFounderQaMode(): boolean {
  return QA_FLAG;
}

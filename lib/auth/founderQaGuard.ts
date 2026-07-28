import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";
import { evaluateFounderQaAllowlist, isFounderQaMode } from "./founderQaPolicy";

export { evaluateFounderQaAllowlist, isFounderQaMode } from "./founderQaPolicy";

export async function enforceFounderQaAllowlist(
  email: string | null | undefined,
): Promise<{ allowed: boolean; reason?: string }> {
  const decision = evaluateFounderQaAllowlist(email);
  if (!decision.allowed) {
    await signOut(auth);
    return decision;
  }
  return decision;
}

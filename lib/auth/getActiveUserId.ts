import { auth } from "@/lib/firebase/firebase";

type AuthUserLike = {
  uid?: string | null;
} | null | undefined;

type ProfileLike = {
  uid?: string | null;
} | null | undefined;

export function getActiveUserId(profile?: ProfileLike, authUser?: AuthUserLike): string | null {
  const firebaseUid = auth.currentUser?.uid;
  if (firebaseUid) return firebaseUid;
  if (authUser?.uid) return authUser.uid;
  if (profile?.uid) return profile.uid;
  return null;
}

import { withHdDeadline } from "./hdCommunication";

export async function readHdBlueprint(uid: string, signal: AbortSignal): Promise<Record<string, unknown> | null> {
  return withHdDeadline(async () => {
    const { auth, db } = await import("@/lib/firebase/firebase");
    const user = auth.currentUser;
    if (!user || user.uid !== uid || signal.aborted) throw new Error("inactive");
    const { doc, getDocFromServer } = await import("firebase/firestore");
    const snapshot = await getDocFromServer(doc(db, "blueprints", uid));
    if (auth.currentUser !== user || signal.aborted) throw new Error("inactive");
    if (snapshot.metadata.fromCache || snapshot.metadata.hasPendingWrites) throw new Error("unconfirmed");
    return snapshot.exists() ? { ...snapshot.data(), uid } : null;
  }, 10_000, signal);
}

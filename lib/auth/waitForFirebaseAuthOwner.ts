import { onAuthStateChanged, type Auth } from "firebase/auth";

export async function waitForFirebaseAuthOwner(auth: Auth, uid: string, timeoutMs = 3000): Promise<void> {
  const currentUser = auth.currentUser;
  if (currentUser?.uid === uid) return;

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      const latestUid = auth.currentUser?.uid ?? null;
      reject(new Error(`missing auth: expected uid ${uid}, current auth uid ${latestUid ?? "null"}`));
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user?.uid !== uid) return;
      window.clearTimeout(timeout);
      unsubscribe();
      resolve();
    }, (error) => {
      window.clearTimeout(timeout);
      unsubscribe();
      reject(error);
    });
  });
}

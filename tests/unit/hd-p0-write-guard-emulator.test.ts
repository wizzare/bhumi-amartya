import assert from "node:assert/strict";
import test from "node:test";
import { deleteApp } from "firebase/app";
import { signInAnonymously, signOut } from "firebase/auth";
import { deleteDoc, doc, getDocFromServer, setDoc, terminate, Transaction } from "firebase/firestore";
import { isCanonicalHumanDesign } from "../../lib/humandesign/hdAudit";
import { createPendingHumanDesignChart } from "../../lib/humandesign/types";

const canonical = {
  type: "Projector",
  strategy: "Wait for the Invitation",
  authority: "Emotional Authority",
  profile: "4/6",
  status: "ready",
  source: "human-design-py",
  accuracy: "verified",
  calculationQuality: "verified",
  hdEngineVersion: "gaia-hd-v1",
  hdAuditStatus: "validated",
  calculationStatus: "completed",
  extension: { untouched: true },
};

test("P0 transactional write guards", { timeout: 60000 }, async (t) => {
  assert.equal(process.env.FIRESTORE_EMULATOR_HOST, "127.0.0.1:8080", "explicit local Firestore emulator required");
  assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST, "127.0.0.1:9099", "explicit local Auth emulator required");
  Object.assign(process.env, {
    NEXT_PUBLIC_USE_FIREBASE_EMULATORS: "true",
    NEXT_PUBLIC_USE_AUTH_EMULATOR: "true",
    NEXT_PUBLIC_USE_FIRESTORE_EMULATOR: "true",
    NEXT_PUBLIC_USE_FUNCTIONS_EMULATOR: "false",
    NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID: "demo-hd-p0-write-guard",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-hd-p0-write-guard",
    NEXT_PUBLIC_FIREBASE_API_KEY: "synthetic-emulator-key",
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-hd-p0-write-guard.firebaseapp.com",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-hd-p0-write-guard.appspot.com",
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "1234567890",
    NEXT_PUBLIC_FIREBASE_APP_ID: "1:1234567890:web:synthetic",
  });
  const { app, auth, db } = await import("../../lib/firebase/firebase");
  t.after(async () => {
    await terminate(db);
    await deleteApp(app);
  });
  const { blueprintRepository } = await import("../../lib/repositories/blueprintRepository");
  const { firebaseService } = await import("../../lib/firebase/service");
  const owner = (await signInAnonymously(auth)).user;
  const ref = doc(db, "blueprints", owner.uid);
  const userRef = doc(db, "users", owner.uid);
  const pending = createPendingHumanDesignChart("synthetic stale writer");
  const writers = {
    repository: async (uid: string) => {
      await blueprintRepository.saveUserBlueprint(uid, {
        humanDesign: pending,
        numerology: { number: 7, role: "synthetic", positiveTraits: [], negativeTraits: [] },
      } as never);
      return true;
    },
    service: (uid: string) => firebaseService.saveUserBlueprint({
      uid,
      humanDesign: pending,
      numerology: { number: 7, role: "synthetic", positiveTraits: [], negativeTraits: [] },
    } as never),
  };
  assert.ok(isCanonicalHumanDesign(canonical));
  for (const [name, write] of Object.entries(writers)) {
    await t.test(`${name}: concurrent canonical commit forces stale transaction retry`, async () => {
      await setDoc(ref, { uid: owner.uid, humanDesign: pending });
      await setDoc(userRef, { hdDismissedAt: "synthetic-dismissal" });
      let reads = 0;
      let signalRead!: () => void;
      let releaseRead!: () => void;
      const readReached = new Promise<void>((resolve) => { signalRead = resolve; });
      const released = new Promise<void>((resolve) => { releaseRead = resolve; });
      const originalGet = Transaction.prototype.get;
      const interception = t.mock.method(Transaction.prototype, "get", async function (this: Transaction, ...args: Parameters<Transaction["get"]>) {
        const snapshot = await originalGet.apply(this, args);
        reads++;
        if (reads === 1) {
          signalRead();
          await released;
        }
        return snapshot;
      });
      const staleWrite = write(owner.uid);
      try {
        await Promise.race([
          readReached,
          staleWrite.then(() => { throw new Error("writer completed without transactional read"); }),
        ]);
        await setDoc(ref, { humanDesign: canonical }, { mergeFields: ["humanDesign"] });
        releaseRead();
        assert.equal(await staleWrite, true);
        assert.ok(reads >= 2, "conflicting transaction must retry against canonical data");
      } finally {
        releaseRead();
        await staleWrite.catch(() => {});
        interception.mock.restore();
      }
      const stored = (await getDocFromServer(ref)).data();
      assert.deepEqual(stored?.humanDesign, canonical);
      assert.equal(stored?.numerology.number, 7);
      assert.equal((await getDocFromServer(userRef)).data()?.hdDismissedAt, "synthetic-dismissal");
      assert.equal(await write(owner.uid), true);
      assert.deepEqual((await getDocFromServer(ref)).data()?.humanDesign, canonical);
    });
  }
  await t.test("cross-user and signed-out reads fail closed without mutation", async () => {
    const before = (await getDocFromServer(ref)).data();
    await signOut(auth);
    const other = (await signInAnonymously(auth)).user;
    assert.notEqual(other.uid, owner.uid);
    await assert.rejects(getDocFromServer(ref), { code: "permission-denied" });
    await assert.rejects(writers.repository(owner.uid), { code: "permission-denied" });
    assert.equal(await writers.service(owner.uid), false);
    const otherRef = doc(db, "blueprints", other.uid);
    assert.equal(await writers.service(other.uid), true);
    assert.equal((await getDocFromServer(otherRef)).data()?.numerology.number, 7);
    await deleteDoc(otherRef);
    await signOut(auth);
    await assert.rejects(writers.repository(owner.uid), { code: "permission-denied" });
    assert.equal(await writers.service(owner.uid), false);
    await auth.updateCurrentUser(owner);
    assert.deepEqual((await getDocFromServer(ref)).data(), before);
  });
  await deleteDoc(ref);
  await deleteDoc(userRef);
});

import fs from "fs";
import { initializeApp, deleteApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  getAuth,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from "firebase/firestore";

for (const envFile of [".env.local", ".env"]) {
  if (!fs.existsSync(envFile)) continue;
  const lines = fs.readFileSync(envFile, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error("Missing Firebase env.");
}

const app = initializeApp(firebaseConfig, `account-deletion-qa-${Date.now()}`);
const auth = getAuth(app);
const db = getFirestore(app);

const evidence = [];
const remaining = {};
let createdUser = null;

function push(step, status, details) {
  evidence.push({ step, status, details });
}

async function snapshotExists(ref) {
  try {
    const snapshot = await getDoc(ref);
    return snapshot.exists();
  } catch (error) {
    console.error(`TRACE: FAILED snapshotExists ${ref.path} - Error: ${error.code} - ${error.message}`);
    throw error;
  }
}

async function loggedDelete(ref) {
  console.log(`TRACE: Attempting DELETE ${ref.path}`);
  try {
    await deleteDoc(ref);
    console.log(`TRACE: SUCCESS DELETE ${ref.path}`);
    return true;
  } catch (error) {
    console.error(`TRACE: FAILED DELETE ${ref.path} - Error: ${error.code} - ${error.message}`);
    return false;
  }
}

async function loggedGetDocs(q, description) {
  console.log(`TRACE: Attempting GET_DOCS ${description}`);
  try {
    const snapshot = await getDocs(q);
    console.log(`TRACE: SUCCESS GET_DOCS ${description} - Size: ${snapshot.size}`);
    return snapshot;
  } catch (error) {
    console.error(`TRACE: FAILED GET_DOCS ${description} - Error: ${error.code} - ${error.message}`);
    return { docs: [], size: 0, empty: true };
  }
}

async function deleteScoped(collectionName, uid) {
  const snapshot = await loggedGetDocs(
    query(collection(db, collectionName), where("uid", "==", uid)),
    `collection=${collectionName} uid=${uid}`
  );
  let deletedCount = 0;
  for (const document of snapshot.docs) {
    if (await loggedDelete(document.ref)) deletedCount++;
  }
  return deletedCount;
}

async function deleteAccountData(uid) {
  const dailyGuidance = collection(db, "dailyGuidance");

  const dailySnapshots = await Promise.all([
    loggedGetDocs(query(dailyGuidance, where("uid", "==", uid)), `dailyGuidance by uid=${uid}`),
    loggedGetDocs(
      query(
        dailyGuidance,
        where("uid", "==", uid),
        where(documentId(), ">=", `${uid}_`),
        where(documentId(), "<", `${uid}_\uf8ff`),
      ),
      `dailyGuidance by docId prefix=${uid}_`
    ),
  ]);

  const dailyRefs = new Map();
  for (const snapshot of dailySnapshots) {
    for (const document of snapshot.docs) {
      dailyRefs.set(document.ref.path, document.ref);
    }
  }

  const journalEntries = await loggedGetDocs(collection(db, "journals", uid, "entries"), `journals/${uid}/entries`);

  await deleteScoped("journalEntries", uid);
  await deleteScoped("meditationEntries", uid);
  await deleteScoped("audioHealingEntries", uid);
  await deleteScoped("healingMemory", uid);
  await deleteScoped("journeyData", uid);
  await deleteScoped("notifications", uid);
  await deleteScoped("weeklyReports", uid);

  await loggedDelete(doc(db, "blueprints", uid));
  await loggedDelete(doc(db, "users", uid));
  await loggedDelete(doc(db, "healingMemory", uid));
  await loggedDelete(doc(db, "journeyData", uid));
  await loggedDelete(doc(db, "notifications", uid));

  for (const ref of dailyRefs.values()) {
    await loggedDelete(ref);
  }

  for (const document of journalEntries.docs) {
    await loggedDelete(document.ref);
  }
  await loggedDelete(doc(db, "journals", uid));

  return {
    status: "discovery and deletion completed"
  };
}

try {
  const stamp = Date.now();
  const email = `bhumi.qa.delete+${stamp}@example.com`;
  const password = `QaDelete!${stamp}`;
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  createdUser = credential.user;
  await credential.user.getIdToken(true);
  const uid = credential.user.uid;
  const today = new Date().toISOString().slice(0, 10);
  const dailyGuidanceId = `${uid}_${today}`;
  const journalId = `qa-entry-${stamp}`;

  push("create test account", "PASS", `uid=${uid}`);

  await Promise.all([
    setDoc(doc(db, "users", uid), {
      uid,
      email,
      fullName: "QA Delete Account",
      setupCompleted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    setDoc(doc(db, "blueprints", uid), {
      uid,
      status: "ready",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
    setDoc(doc(db, "dailyGuidance", dailyGuidanceId), {
      uid,
      date: today,
      title: "QA Daily Guidance",
      createdAt: new Date().toISOString(),
    }),
    setDoc(doc(db, "journals", uid, "entries", journalId), {
      uid,
      id: journalId,
      date: today,
      journalText: "QA journal entry",
      createdAt: new Date().toISOString(),
    }),
    setDoc(doc(db, "journalEntries", journalId), {
      uid,
      id: journalId,
      date: today,
      journalText: "QA legacy journal entry",
      createdAt: new Date().toISOString(),
    }),
  ]);

  push(
    "complete setup / seed generated data",
    "PASS",
    "users, blueprints, dailyGuidance, journals/{uid}/entries, journalEntries",
  );

  const preChecks = {
    users: await snapshotExists(doc(db, "users", uid)),
    blueprints: await snapshotExists(doc(db, "blueprints", uid)),
    dailyGuidance: await snapshotExists(doc(db, "dailyGuidance", dailyGuidanceId)),
    journalNested: await snapshotExists(doc(db, "journals", uid, "entries", journalId)),
    journalEntries: await snapshotExists(doc(db, "journalEntries", journalId)),
  };

  for (const [key, exists] of Object.entries(preChecks)) {
    push(`pre-delete ${key}`, exists ? "PASS" : "FAIL", exists ? "exists" : "missing");
  }

  const result = await deleteAccountData(uid);
  push("delete Firestore account data", "PASS", result.status);

  const postRefs = {
    users: doc(db, "users", uid),
    blueprints: doc(db, "blueprints", uid),
    dailyGuidance: doc(db, "dailyGuidance", dailyGuidanceId),
    journalNested: doc(db, "journals", uid, "entries", journalId),
    journalEntries: doc(db, "journalEntries", journalId),
  };

  for (const [key, ref] of Object.entries(postRefs)) {
    const exists = await snapshotExists(ref);
    remaining[key] = exists;
    push(`post-delete ${key}`, exists ? "FAIL" : "PASS", exists ? "remaining" : "deleted");
  }

  console.log(`TRACE: Attempting DELETE Firebase Auth user ${uid}`);
  await deleteUser(credential.user);
  console.log(`TRACE: SUCCESS DELETE Firebase Auth user ${uid}`);
  push("delete Firebase Auth user", "PASS", "deleteUser resolved");

  console.log(JSON.stringify({
    qaRunAt: new Date().toISOString(),
    uid,
    email,
    today,
    dailyGuidanceId,
    journalId,
    evidence,
    remaining,
  }, null, 2));
} catch (error) {
  if (createdUser) {
    try {
      console.log(`TRACE: Cleanup - Attempting DELETE Firebase Auth user ${createdUser.uid}`);
      await deleteUser(createdUser);
      console.log(`TRACE: Cleanup - SUCCESS DELETE Firebase Auth user ${createdUser.uid}`);
      push("cleanup Firebase Auth user after failure", "PASS", "deleteUser resolved");
    } catch (cleanupError) {
      if (cleanupError.code !== 'auth/user-not-found' && cleanupError.code !== 'auth/user-token-expired') {
        console.error(`TRACE: Cleanup - FAILED DELETE Firebase Auth user ${createdUser.uid} - Error: ${cleanupError.code} - ${cleanupError.message}`);
        push(
          "cleanup Firebase Auth user after failure",
          "FAIL",
          cleanupError?.code || cleanupError?.message || String(cleanupError),
        );
      }
    }
  }

  console.error(JSON.stringify({
    qaRunAt: new Date().toISOString(),
    error: error?.code || error?.name || "Error",
    message: error?.message || String(error),
    evidence,
    remaining,
  }, null, 2));
  process.exitCode = 1;
} finally {
  await deleteApp(app);
}

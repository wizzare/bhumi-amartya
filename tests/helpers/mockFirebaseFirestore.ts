import { FirebaseApp, getApp } from "./mockFirebaseApp";
import fixture from "../fixtures/build110-hd-local.json" with { type: "json" };
import { normalizeLiveHumanDesignResponse } from "../../lib/humandesign/liveContract";
import { computeBirthInputFingerprint } from "../../lib/humandesign/birthFingerprint";
import { isHdRetryable } from "../../lib/humandesign/hdCommunication";
import { getHdRecoveryDueForUid, recoverHumanDesignIfNeeded, clearHdRecoverySession, inFlightHdRecoveries, hdRecoveryKey } from "../../lib/humandesign/hdRecovery";
import { hdUiCopy } from "../../lib/humandesign/hdView";
import { loadHdView, HD_CACHE_TTL_MS } from "../../lib/humandesign/hdLoad";

const inputFixture = {
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthCity: "Jakarta",
  timezone: "+07:00",
  latitude: -6.2088,
  longitude: 106.8456,
};

const fp = computeBirthInputFingerprint("synthetic-user-123", inputFixture);

const norm = normalizeLiveHumanDesignResponse(fixture as any);
const hdFixture = {
  ...norm,
  inputHash: fp?.revisionHash || "bip_v1_7b375056",
  hdEngineVersion: "gaia-hd-v1",
  source: "human-design-py",
  calculationQuality: "verified",
  hdAuditStatus: "validated",
  status: "ready",
};

const store: Record<string, Record<string, any>> = {
  users: {
    "synthetic-user-123": {
      uid: "synthetic-user-123",
      email: "synthetic@example.com",
      name: "Synthetic User",
      birthDate: "1985-05-03",
      birthTime: "23:45",
      birthCity: "Jakarta",
      timezone: "+07:00",
      latitude: -6.2088,
      longitude: 106.8456,
      setupCompleted: true,
      trialStartedAt: new Date(Date.now() - 86400000).toISOString(),
      trialEndsAt: new Date(Date.now() + 86400000 * 30).toISOString(),
      plan: "lifetime",
      tier: "premium",
      guardianRole: "member",
      profile: inputFixture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
  blueprints: {
    "synthetic-user-123": {
      uid: "synthetic-user-123",
      input: inputFixture,
      humanDesign: hdFixture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  },
};

for (const account of ["a", "b", "c"]) {
  const uid = `hd-browser-test-${account}`;
  const input = account === "c"
    ? { ...inputFixture, birthDate: "1988-12-05", birthTime: "10:15", birthCity: "Bandung", latitude: -6.9175, longitude: 107.6191 }
    : { ...inputFixture, birthDate: account === "a" ? "1985-05-03" : "1991-08-12" };
  const raw = account === "a" ? fixture : {
    ...fixture, type: "Projector", strategy: "Wait for the Invitation", authority: "Splenic", profile: "2/4",
    definition: "Single Definition", definedCenters: ["Spleen", "G Center"],
    openCenters: ["Head", "Ajna", "Throat", "Heart", "Sacral", "Solar Plexus", "Root"],
    channels: ["10-57"], gatesPersonality: [10, 57], gatesDesign: [10, 57],
    personalityActivations: [{ planet: "Sun", gate: 10, line: 2 }, { planet: "Earth", gate: 57, line: 2 }],
    designActivations: [{ planet: "Sun", gate: 57, line: 4 }, { planet: "Earth", gate: 10, line: 4 }],
  };
  store.users[uid] = { ...store.users["synthetic-user-123"], ...input, uid, email: `${account}@example.invalid`, name: `Synthetic ${account.toUpperCase()}`, profile: input, plan: "free", tier: "free" };
  if (account === "c") {
    const past = new Date(Date.now() - 70000).toISOString();
    store.blueprints[uid] = { uid, input, weton: { day: "Senin", pasaran: "Pahing", weton: "Senin Pahing", neptuDay: 4, neptuPasaran: 9, totalNeptu: 13, wuku: { name: "Wukir", index: 3, description: "Menguatkan ketekunan" }, pranataMangsa: { name: "Saddha", description: "Masa melepaskan" } }, bazi: { dayMaster: { pinyin: "Bing", element: "Fire", polarity: "Yang" }, yearPillar: { stem: "Jia", branch: "Zi" }, monthPillar: { stem: "Bing", branch: "Yin" }, dayPillar: { stem: "Bing", branch: "Wu" }, hourPillar: { stem: "Wu", branch: "Zi" }, fiveElements: { Wood: 20, Fire: 40, Earth: 20, Metal: 10, Water: 10 }, favorableElements: ["Wood", "Fire"], unfavorableElements: ["Water", "Metal"] }, vedic: { moonSign: "Sagittarius" }, humanDesign: { status: "pending", source: "pending", lastAttempt: past, updatedAt: past } };
  } else {
    store.blueprints[uid] = { uid, input, humanDesign: { ...hdFixture, ...normalizeLiveHumanDesignResponse(raw as any), inputHash: computeBirthInputFingerprint(uid, input)?.revisionHash } };
  }
}

for (const account of ["new-a", "new-a2"]) {
  const uid = `hd-${account}`;
  const now = new Date();
  store.users[uid] = {
    uid,
    email: `${account}@example.invalid`,
    displayName: `Synthetic ${account.toUpperCase()}`,
    name: `Synthetic ${account.toUpperCase()}`,
    birthDate: "",
    birthTime: "",
    birthCity: "",
    setupCompleted: false,
    blueprintStatus: "missing",
    trialStartedAt: now.toISOString(),
    trialEndsAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
    plan: "free_trial",
    membershipType: "TRIAL",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };
}

const FIRESTORE_STORAGE_KEY = "__BHUMI_MOCK_FIRESTORE_STORE__";
const FIRESTORE_WRITES_KEY = "__BHUMI_MOCK_FIRESTORE_WRITES__";

function syncFromStorage() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(FIRESTORE_STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw);
      for (const col of Object.keys(saved)) {
        store[col] = { ...store[col], ...saved[col] };
      }
    }
    const rawWrites = localStorage.getItem(FIRESTORE_WRITES_KEY);
    if (rawWrites) {
      control.writes = JSON.parse(rawWrites);
    }
  } catch {}
}

function syncToStorage() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(FIRESTORE_STORAGE_KEY, JSON.stringify(store));
    localStorage.setItem(FIRESTORE_WRITES_KEY, JSON.stringify(control.writes));
  } catch {}
}

const control = {
  armed: false, pending: 0, released: 0, target: "hd-browser-test-a", failTransaction: false, failGetDocFromServer: false, failReadbackOnce: false,
  writes: [] as { path: string; owner: string | null; hd: boolean; op?: string; hdStatus?: string | null }[],
  release: () => {},
  arm() { this.armed = true; this.pending = 0; this.released = 0; },
  makePending() { store.blueprints["hd-browser-test-a"].humanDesign = { status: "pending", source: "pending" }; syncToStorage(); },
  pendingFor(uid: string) {
    if (store.blueprints[uid]) {
      const past = new Date(Date.now() - 120000).toISOString();
      store.blueprints[uid].humanDesign = { status: "retriable_error", source: "pending", lastAttempt: past, updatedAt: past, retryCount: 0, nextRetryAt: null };
      if (!store.blueprints[uid].weton) store.blueprints[uid].weton = { day: "Senin", pasaran: "Pahing", weton: "Senin Pahing", neptuDay: 4, neptuPasaran: 9, totalNeptu: 13, wuku: { name: "Wukir", index: 3, description: "Menguatkan ketekunan" }, pranataMangsa: { name: "Saddha", description: "Masa melepaskan" } };
      if (!store.blueprints[uid].bazi) store.blueprints[uid].bazi = { dayMaster: "Yang Fire" };
      if (!store.blueprints[uid].vedic) store.blueprints[uid].vedic = { moonSign: "Sagittarius" };
      clearHdRecoverySession(uid);
      syncToStorage();
    }
  },
  exhaustFor(uid: string) {
    if (store.blueprints[uid]) {
      const past = new Date(Date.now() - 120000).toISOString();
      store.blueprints[uid].humanDesign = { status: "retriable_error", source: "pending", lastAttempt: past, updatedAt: past, retryCount: 5, lastErrorCode: "service_unavailable" };
      if (!store.blueprints[uid].weton) store.blueprints[uid].weton = { day: "Senin", pasaran: "Pahing", weton: "Senin Pahing", neptuDay: 4, neptuPasaran: 9, totalNeptu: 13, wuku: { name: "Wukir", index: 3, description: "Menguatkan ketekunan" }, pranataMangsa: { name: "Saddha", description: "Masa melepaskan" } };
      if (!store.blueprints[uid].bazi) store.blueprints[uid].bazi = { dayMaster: "Yang Fire" };
      if (!store.blueprints[uid].vedic) store.blueprints[uid].vedic = { moonSign: "Sagittarius" };
      syncToStorage();
    }
  },
  snapshot() { syncFromStorage(); return structuredClone(store); },
  state() { syncFromStorage(); return structuredClone(store.blueprints); },
};
syncFromStorage();
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  Object.assign(window, {
    __HD05D_STORE__: control,
    __HD05D_RECOVERY_LIB__: {
      isHdRetryable,
      getHdRecoveryDueForUid,
      recoverHumanDesignIfNeeded,
      clearHdRecoverySession,
      inFlightHdRecoveries,
      hdRecoveryKey,
      hdUiCopy,
      loadHdView,
      HD_CACHE_TTL_MS,
    },
  });
}

export class DocumentSnapshot {
  private _data: any;
  readonly id: string;
  readonly metadata = { fromCache: false, hasPendingWrites: false };

  constructor(id: string, data: any) {
    this.id = id;
    this._data = data ? structuredClone(data) : undefined;
  }

  exists(): boolean {
    return this._data !== undefined && this._data !== null;
  }

  data(): any {
    return this._data ? structuredClone(this._data) : undefined;
  }

  get(fieldPath: string): any {
    if (!this._data) return undefined;
    return this._data[fieldPath];
  }
}

export class QuerySnapshot {
  readonly docs: DocumentSnapshot[];
  readonly empty: boolean;
  readonly size: number;

  constructor(docs: DocumentSnapshot[]) {
    this.docs = docs;
    this.empty = docs.length === 0;
    this.size = docs.length;
  }

  forEach(callback: (doc: DocumentSnapshot) => void): void {
    this.docs.forEach(callback);
  }
}

export interface DocumentReference {
  id: string;
  path: string;
  parent: CollectionReference;
}

export interface CollectionReference {
  id: string;
  path: string;
}

export class Firestore {
  app: FirebaseApp;
  constructor(app: FirebaseApp) {
    this.app = app;
  }
}

const defaultFirestore = new Firestore(getApp());

export function getFirestore(app?: any): Firestore {
  return defaultFirestore;
}

export function doc(dbOrCol: any, ...pathSegments: string[]): DocumentReference {
  let path = "";
  if (typeof dbOrCol === "string") {
    path = [dbOrCol, ...pathSegments].join("/");
  } else if (dbOrCol && typeof dbOrCol.path === "string") {
    path = [dbOrCol.path, ...pathSegments].join("/");
  } else {
    path = pathSegments.join("/");
  }
  const parts = path.split("/").filter(Boolean);
  const id = parts[parts.length - 1] || "";
  const parentPath = parts.slice(0, -1).join("/");
  return {
    id,
    path,
    parent: { id: parts[parts.length - 2] || "", path: parentPath },
  };
}

export function collection(dbOrRef: any, ...pathSegments: string[]): CollectionReference {
  let path = "";
  if (typeof dbOrRef === "string") {
    path = [dbOrRef, ...pathSegments].join("/");
  } else if (dbOrRef && typeof dbOrRef.path === "string") {
    path = [dbOrRef.path, ...pathSegments].join("/");
  } else {
    path = pathSegments.join("/");
  }
  const parts = path.split("/").filter(Boolean);
  return { id: parts[parts.length - 1] || "", path };
}

export async function getDoc(ref: DocumentReference): Promise<DocumentSnapshot> {
  syncFromStorage();
  const parts = ref.path.split("/").filter(Boolean);
  if (parts.length === 2) {
    const [col, docId] = parts;
    const data = store[col]?.[docId];
    return new DocumentSnapshot(docId, data);
  }
  return new DocumentSnapshot(ref.id, undefined);
}

export async function getDocFromServer(ref: DocumentReference): Promise<DocumentSnapshot> {
  if (control.failGetDocFromServer) throw new Error("mock_getDocFromServer_failed");
  if (control.failReadbackOnce) {
    control.failReadbackOnce = false;
    throw new Error("mock_readback_failed");
  }
  const snapshot = await getDoc(ref);
  if (control.armed && ref.path === `blueprints/${control.target}`) {
    control.pending++;
    await new Promise<void>(resolve => {
      const previous = control.release;
      control.release = () => { previous(); control.armed = false; control.released++; resolve(); };
    });
  }
  return snapshot;
}

export async function setDoc(ref: DocumentReference, data: any, options?: { merge?: boolean }): Promise<void> {
  syncFromStorage();
  control.writes.push({ path: ref.path, owner: typeof window === "undefined" ? null : JSON.parse(localStorage.getItem("__BHUMI_MOCK_AUTH_USER__") || "null")?.uid ?? null, hd: Boolean(data.humanDesign), op: "set", hdStatus: data.humanDesign ? String(data.humanDesign.status ?? data.humanDesign.calculationStatus ?? null) : undefined });
  const parts = ref.path.split("/").filter(Boolean);
  if (parts.length === 2) {
    const [col, docId] = parts;
    if (!store[col]) store[col] = {};
    if (col === "users") {
      const existing = store[col][docId];
      if (!existing?.trialStartedAt && !data.trialStartedAt && !existing?.membershipType && !data.membershipType && data.plan === "free_trial") {
        const now = new Date();
        data.trialStartedAt = now.toISOString();
        data.trialEndsAt = new Date(now.getTime() + 7 * 86400000).toISOString();
        data.plan = data.plan || "free_trial";
        data.membershipType = data.membershipType || "TRIAL";
      }
    }
    if (col === "users" && store[col][docId]) {
      const prev = store[col][docId];
      const next = options?.merge ? { ...prev, ...data } : structuredClone(data);
      for (const field of ["entitlementSource", "membershipType", "membershipExpiryDate", "accessUntil", "subscriptionStatus", "trialStartedAt", "trialEndsAt", "plan", "tier", "role", "badge", "testerBadge", "sourceBadge"]) {
        if (prev[field] !== undefined && next[field] === undefined) {
          next[field] = prev[field];
        }
      }
      store[col][docId] = next;
    } else if (options?.merge && store[col][docId]) {
      store[col][docId] = { ...store[col][docId], ...data };
    } else {
      store[col][docId] = structuredClone(data);
    }
    syncToStorage();
  }
}

export async function updateDoc(ref: DocumentReference, data: any): Promise<void> {
  control.writes.push({ path: ref.path, owner: typeof window === "undefined" ? null : JSON.parse(localStorage.getItem("__BHUMI_MOCK_AUTH_USER__") || "null")?.uid ?? null, hd: Boolean(data.humanDesign), op: "update", hdStatus: data.humanDesign ? String(data.humanDesign.status ?? data.humanDesign.calculationStatus ?? null) : undefined });
  return setDoc(ref, data, { merge: true });
}

export async function deleteDoc(ref: DocumentReference): Promise<void> {
  const parts = ref.path.split("/").filter(Boolean);
  if (parts.length === 2) {
    const [col, docId] = parts;
    if (store[col]) delete store[col][docId];
    syncToStorage();
  }
}

export async function getDocs(query: any): Promise<QuerySnapshot> {
  syncFromStorage();
  const path = query?.path || "";
  const parts = path.split("/").filter(Boolean);
  const col = parts[0];
  const docs: DocumentSnapshot[] = [];
  if (col && store[col]) {
    for (const [id, data] of Object.entries(store[col])) {
      docs.push(new DocumentSnapshot(id, data));
    }
  }
  return new QuerySnapshot(docs);
}

export async function addDoc(colRef: CollectionReference, data: any): Promise<DocumentReference> {
  const id = "mock_doc_" + Math.random().toString(36).slice(2, 9);
  const ref = doc(colRef, id);
  await setDoc(ref, data);
  return ref;
}

export function query(colRef: any, ...queryConstraints: any[]): any {
  return { path: colRef.path, constraints: queryConstraints };
}

export function where(field: string, op: string, value: any) {
  return { type: "where", field, op, value };
}

export function orderBy(field: string, dir: string = "asc") {
  return { type: "orderBy", field, dir };
}

export function limit(n: number) {
  return { type: "limit", limit: n };
}

export function startAfter(...values: any[]) {
  return { type: "startAfter", values };
}

export function onSnapshot(ref: any, callback: (snap: any) => void): () => void {
  setTimeout(async () => {
    const snap = ref.path.split("/").filter(Boolean).length === 2
      ? await getDoc(ref)
      : await getDocs(ref);
    callback(snap);
  }, 0);
  return () => {};
}

export async function runTransaction(db: any, updateFunction: (transaction: any) => Promise<any>): Promise<any> {
  if (control.failTransaction) throw new Error("mock_transaction_failed");
  const transaction = {
    get: async (ref: DocumentReference) => getDoc(ref),
    set: (ref: DocumentReference, data: any, options?: any) => setDoc(ref, data, options),
    update: (ref: DocumentReference, data: any) => updateDoc(ref, data),
    delete: (ref: DocumentReference) => deleteDoc(ref),
  };
  return updateFunction(transaction);
}

export function writeBatch(db: any) {
  return {
    set: (ref: any, data: any, options?: any) => setDoc(ref, data, options),
    update: (ref: any, data: any) => updateDoc(ref, data),
    delete: (ref: any) => deleteDoc(ref),
    commit: async () => {},
  };
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }

  toMillis(): number {
    return this.seconds * 1000 + Math.floor(this.nanoseconds / 1000000);
  }

  static now(): Timestamp {
    const ms = Date.now();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  static fromDate(date: Date): Timestamp {
    const ms = date.getTime();
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }

  static fromMillis(ms: number): Timestamp {
    return new Timestamp(Math.floor(ms / 1000), (ms % 1000) * 1000000);
  }
}

export function serverTimestamp() {
  return Timestamp.now();
}

export function connectFirestoreEmulator(db: any, host: string, port: number, options?: any) {}
export function collectionGroup(db: any, collectionId: string): CollectionReference {
  return collection(db, collectionId);
}

export function arrayUnion(...elements: any[]) { return elements; }
export function increment(n: number) { return n; }
export function documentId() { return "__name__"; }
export function deleteField() { return undefined; }
export function terminate(db: any): Promise<void> { return Promise.resolve(); }
export async function getCountFromServer(query: any) {
  const snap = await getDocs(query);
  return { data: () => ({ count: snap.size }) };
}

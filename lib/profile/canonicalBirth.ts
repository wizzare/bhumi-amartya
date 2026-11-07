import { db } from "@/lib/firebase/config";
import { callCanonicalApi } from "@/lib/profile/canonicalHttps";
import { doc, getDocFromServer } from "firebase/firestore";
import {
  extractCanonicalBirth,
  extractCanonicalRevision,
  type CanonicalBirthPayload,
  type CanonicalRevision,
} from "@/lib/profile/canonicalBirthFields";

export {
  CANONICAL_BIRTH_FIELDS,
  extractCanonicalBirth,
  extractCanonicalRevision,
  isCanonicalBirthField,
  stripCanonicalBirthFields,
} from "@/lib/profile/canonicalBirthFields";
export type { CanonicalBirthPayload, CanonicalRevision } from "@/lib/profile/canonicalBirthFields";

export type ProfileSaveStatus = "COMMITTED" | "PENDING" | "CONFLICT" | "REJECTED" | "FAILED" | "UNKNOWN";

export interface ProfileSaveResult {
  status: ProfileSaveStatus;
  operationId: string;
  epoch?: string | null;
  revision?: number;
  currentEpoch?: string | null;
  currentRevision?: number;
  reason?: string;
  idempotent?: boolean;
}

export interface CanonicalBirthState {
  epoch: string | null;
  revision: number;
  canonicalBirth: CanonicalBirthPayload | null;
  committedAt?: string;
  operationId?: string;
}

export interface InitializeResult {
  status: "COMMITTED" | "ALREADY_INITIALIZED" | "REJECTED" | "UNKNOWN";
  operationId: string;
  epoch?: string;
  revision?: number;
  idempotent?: boolean;
  alreadyInitialized?: boolean;
  reason?: string;
}

function generateOperationId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function callCommitCanonicalBirth(
  uid: string,
  expected: CanonicalRevision,
  canonicalBirth: CanonicalBirthPayload,
  operationId: string,
): Promise<ProfileSaveResult> {
  try {
    const result = await callCanonicalApi("commitCanonicalBirth", {
      profileUid: uid,
      expected,
      canonicalBirth,
      operationId,
    });
    const data: any = result.data;
    if (data?.status === "COMMITTED") {
      if (data.operationId !== operationId || typeof data.epoch !== "string" || !data.epoch || !Number.isSafeInteger(data.revision) || data.revision < 1) {
        return { status: "UNKNOWN", operationId, reason: "invalid_commit_confirmation" };
      }
      return {
        status: "COMMITTED",
        operationId,
        epoch: data.epoch,
        revision: data.revision,
        idempotent: data.idempotent,
      };
    }
    if (data?.status === "CONFLICT") {
      return {
        status: "CONFLICT",
        operationId,
        currentEpoch: data.currentEpoch ?? expected.epoch,
        currentRevision: data.currentRevision ?? expected.revision,
      };
    }
    if (data?.status === "REJECTED" && data.operationId === operationId) {
      return { status: "REJECTED", operationId, reason: data.reason ?? "unknown" };
    }
    return { status: "UNKNOWN", operationId, reason: "invalid_server_response" };
  } catch (e) {
    const code = e instanceof Error && "code" in e ? String((e as { code: unknown }).code).replace(/^functions\//, "") : "";
    if (["unauthenticated", "permission-denied", "invalid-argument"].includes(code)) return { status: "REJECTED", operationId, reason: code };
    // Transport errors may occur after commit. Keep the request id for lookup/retry.
    return { status: "UNKNOWN", operationId, reason: "unconfirmed_response" };
  }
}

async function callInitializeCanonicalBirth(
  uid: string,
  operationId: string,
): Promise<InitializeResult> {
  try {
    const result = await callCanonicalApi("initializeCanonicalBirth", {
      profileUid: uid,
      operationId,
    });
    const data: any = result.data;
    if ((data?.status === "COMMITTED" || data?.status === "ALREADY_INITIALIZED") && typeof data.epoch === "string" && data.epoch && Number.isSafeInteger(data.revision) && data.revision > 0) {
      return {
        status: data.status,
        operationId,
        epoch: data.epoch,
        revision: data.revision,
        idempotent: data.idempotent,
        alreadyInitialized: data.alreadyInitialized,
      };
    }
    if (data?.status === "REJECTED" && data.operationId === operationId) {
      return { status: "REJECTED", operationId, reason: data.reason ?? "unknown" };
    }
    return { status: "UNKNOWN", operationId, reason: "invalid_initialization_response" };
  } catch (e) {
    const code = e instanceof Error && "code" in e ? String((e as { code: unknown }).code).replace(/^functions\//, "") : "";
    if (["unauthenticated", "permission-denied", "invalid-argument"].includes(code)) return { status: "REJECTED", operationId, reason: code };
    return { status: "UNKNOWN", operationId, reason: "unconfirmed_initialization" };
  }
}

export async function lookupCanonicalOperation(
  uid: string,
  operationId: string,
): Promise<{ status: "FOUND" | "NOT_FOUND" | "UNKNOWN"; receipt?: Record<string, unknown> }> {
  try {
    const result = await callCanonicalApi("getCanonicalBirth", { profileUid: uid, operationId });
    const data: any = result.data;
    if (data?.status === "SUCCESS" && data.data?.type === "receipt") {
      return { status: "FOUND", receipt: data.data.value };
    }
    return { status: "NOT_FOUND" };
  } catch {
    return { status: "UNKNOWN" };
  }
}

// Store only opaque hashes and the request id. A different edit is held while
// an earlier response is uncertain; it must not silently create a new revision.
async function digestPendingValue(value: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

async function digestText(value: string): Promise<string> {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, "0")).join("");
}

// The owner reviews a fresh server snapshot; this is not a canonical record.
export async function readLegacyBirthForReview(uid: string): Promise<CanonicalBirthPayload | null> {
  if (!uid) return null;
  const snapshot = await getDocFromServer(doc(db, "users", uid));
  const birth = snapshot.exists() ? extractCanonicalBirth(snapshot.data()) : null;
  if (!birth || typeof birth.birthDate !== "string" || typeof birth.birthTime !== "string" || typeof birth.birthCity !== "string" || typeof birth.birthPlace !== "string" || typeof birth.timezone !== "string" || (birth.birthCountry !== null && typeof birth.birthCountry !== "string") || !Number.isFinite(birth.latitude) || !Number.isFinite(birth.longitude)) return null;
  return { ...birth, birthDate: birth.birthDate.trim(), birthTime: birth.birthTime.trim(), birthCity: birth.birthCity.trim(), birthPlace: birth.birthPlace.trim(), birthCountry: birth.birthCountry?.trim() ?? null, timezone: birth.timezone.trim() };
}

// Called only after the owner reviews the complete values shown in Settings.
export async function confirmLegacyBirth(uid: string, birth: CanonicalBirthPayload): Promise<InitializeResult> {
  const key = `bhumi-legacy-confirm-${await digestPendingValue(uid)}`;
  const fingerprint = await digestPendingValue({ uid, birth });
  let operationId: string;
  try {
    const existing = sessionStorage.getItem(key);
    const pending = existing ? JSON.parse(existing) as { fingerprint?: unknown; operationId?: unknown } : null;
    if (pending && (pending.fingerprint !== fingerprint || typeof pending.operationId !== "string")) {
      return { status: "UNKNOWN", operationId: "", reason: "previous_request_unresolved" };
    }
    operationId = pending ? pending.operationId as string : generateOperationId();
    if (!pending) sessionStorage.setItem(key, JSON.stringify({ fingerprint, operationId }));
  } catch {
    return { status: "UNKNOWN", operationId: "", reason: "pending_storage_unavailable" };
  }
  try {
    const result = await callCanonicalApi("initializeCanonicalBirth", { profileUid: uid, operationId, confirmedBirth: birth, attestation: "owner_reviewed_birth_v1" });
    const data: any = result.data;
    if (data?.operationId !== operationId) return { status: "UNKNOWN", operationId, reason: "invalid_initialization_response" };
    if ((data.status === "COMMITTED" || data.status === "ALREADY_INITIALIZED") && typeof data.epoch === "string" && data.epoch && Number.isSafeInteger(data.revision) && data.revision > 0) {
      if (data.status === "COMMITTED") {
        const { status, receipt } = await lookupCanonicalOperation(uid, operationId);
        const reviewedDigest = await digestPendingValue({ uid, ...birth });
        const expectedDigest = await digestText(`${uid}:${operationId}:initialize:${reviewedDigest}:owner_reviewed_birth_v1`);
        if (status !== "FOUND" || !receipt || receipt.uid !== uid || receipt.operationId !== operationId || receipt.status !== "COMMITTED" || receipt.epoch !== data.epoch || receipt.revision !== data.revision || receipt.attestation !== "owner_reviewed_birth_v1" || receipt.requestDigest !== expectedDigest) {
          return { status: "UNKNOWN", operationId, reason: "receipt_not_verified" };
        }
      }
      sessionStorage.removeItem(key);
      return { status: data.status, operationId, epoch: data.epoch, revision: data.revision, idempotent: data.idempotent };
    }
    if (data.status === "REJECTED") {
      sessionStorage.removeItem(key);
      return { status: "REJECTED", operationId, reason: data.reason ?? "unknown" };
    }
    return { status: "UNKNOWN", operationId, reason: "invalid_initialization_response" };
  } catch {
    return { status: "UNKNOWN", operationId, reason: "unconfirmed_initialization" };
  }
}

export async function persistCanonicalBirth(
  profile: Record<string, unknown>,
  requestedOperationId?: string,
): Promise<ProfileSaveResult> {
  const uid = (profile.uid as string) || "";
  const fallbackId = requestedOperationId || generateOperationId();
  if (!uid) return { status: "FAILED", operationId: fallbackId, reason: "missing_uid" };
  const birth = extractCanonicalBirth(profile);
  if (!birth) return { status: "REJECTED", operationId: fallbackId, reason: "invalid_birth_data" };
  let expected = extractCanonicalRevision(profile) ?? { epoch: null, revision: 0 };

  let key: string;
  let fingerprint: string;
  let operationId: string;
  try {
    key = `bhumi-canonical-pending-${await digestPendingValue(uid)}`;
    fingerprint = await digestPendingValue({ uid, birth, expected });
    const stored = sessionStorage.getItem(key);
    const pending = stored ? JSON.parse(stored) as { fingerprint?: unknown; operationId?: unknown } : null;
    if (pending && (typeof pending.fingerprint !== "string" || typeof pending.operationId !== "string" || !/^[A-Za-z0-9_-]{8,128}$/.test(pending.operationId))) {
      return { status: "UNKNOWN", operationId: fallbackId, reason: "invalid_pending_request" };
    }
    if (pending && pending.fingerprint !== fingerprint) {
      return { status: "UNKNOWN", operationId: pending.operationId as string, reason: "previous_request_unresolved" };
    }
    if (pending && requestedOperationId && requestedOperationId !== pending.operationId) {
      return { status: "UNKNOWN", operationId: pending.operationId as string, reason: "previous_request_unresolved" };
    }
    operationId = pending ? pending.operationId as string : fallbackId;
    if (!pending) sessionStorage.setItem(key, JSON.stringify({ fingerprint, operationId }));
  } catch {
    // Without durable request identity, do not issue an unrepeatable write.
    return { status: "FAILED", operationId: fallbackId, reason: "pending_storage_unavailable" };
  }

  let result: ProfileSaveResult = { status: "UNKNOWN", operationId };
  for (let attempt = 0; attempt < 2; attempt++) {
    result = await callCommitCanonicalBirth(uid, expected, birth, operationId);
    if (result.status !== "REJECTED" || result.reason !== "canonical_not_initialized") break;
    const initResult = await callInitializeCanonicalBirth(uid, operationId + "-init");
    if (initResult.status === "UNKNOWN") {
      result = { status: "UNKNOWN", operationId, reason: initResult.reason };
      break;
    }
    if (initResult.status !== "COMMITTED" && initResult.status !== "ALREADY_INITIALIZED") {
      result = { status: "REJECTED", operationId, reason: initResult.reason ?? "initialize_failed" };
      break;
    }
    expected = { epoch: initResult.epoch!, revision: initResult.revision! };
  }
  if (result.status === "COMMITTED") {
    // A response alone is not a receipt. Verify the server-owned operation
    // and its normalized payload before clearing the retry identity.
    const confirmation = await lookupCanonicalOperation(uid, operationId);
    const receipt = confirmation.receipt;
    const normalizedBirth = {
      uid,
      birthDate: birth.birthDate.trim(), birthTime: birth.birthTime.trim(),
      birthCity: birth.birthCity.trim(), birthPlace: birth.birthPlace.trim(),
      birthCountry: birth.birthCountry == null ? null : birth.birthCountry.trim(),
      latitude: birth.latitude, longitude: birth.longitude, timezone: birth.timezone.trim(),
    };
    let digest: string;
    try { digest = await digestPendingValue(normalizedBirth); }
    catch { return { status: "UNKNOWN", operationId, reason: "receipt_digest_unavailable" }; }
    if (confirmation.status !== "FOUND" || !receipt || receipt.uid !== uid || receipt.operationId !== operationId || receipt.status !== "COMMITTED" || receipt.epoch !== result.epoch || receipt.revision !== result.revision || receipt.requestDigest !== digest) {
      return { status: "UNKNOWN", operationId, reason: "receipt_not_verified" };
    }
  }
  if (result.status !== "UNKNOWN" && result.status !== "PENDING") {
    try {
      const current = sessionStorage.getItem(key);
      const pending = current ? JSON.parse(current) as { fingerprint?: unknown; operationId?: unknown } : null;
      if (pending?.fingerprint === fingerprint && pending.operationId === operationId) sessionStorage.removeItem(key);
    } catch {
      // Retaining an already-completed request is safer than losing an uncertain one.
    }
  }
  return result;
}

export async function readCanonicalBirth(uid: string): Promise<CanonicalBirthState | null> {
  try {
    const result = await callCanonicalApi("getCanonicalBirth", { profileUid: uid });
    const data: any = result.data;
    if (data?.status === "SUCCESS" && data.data?.type === "canonical") {
      const canonical = data.data.canonical;
      return {
        epoch: canonical.epoch ?? null,
        revision: canonical.revision ?? 0,
        canonicalBirth: {
          birthDate: canonical.birthDate,
          birthTime: canonical.birthTime,
          birthCity: canonical.birthCity,
          birthPlace: canonical.birthPlace,
          birthCountry: canonical.birthCountry,
          latitude: canonical.latitude,
          longitude: canonical.longitude,
          timezone: canonical.timezone,
        },
        committedAt: canonical.committedAt,
        operationId: canonical.lastOperationId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

// Used at the onboarding boundary after a fresh authenticated server read.
export async function verifyCanonicalProfileReadiness(uid: string, profile: Record<string, unknown>): Promise<boolean> {
  if (!uid || profile.uid !== uid || profile.setupCompleted !== true || typeof profile.fullName !== "string" || !profile.fullName.trim()) return false;
  try {
    const snapshot = await getDocFromServer(doc(db, "users", uid));
    if (!snapshot.exists() || snapshot.data().setupCompleted !== true || snapshot.data().fullName !== profile.fullName) return false;
  } catch {
    return false;
  }
  const birth = extractCanonicalBirth(profile);
  const revision = extractCanonicalRevision(profile);
  if (!birth || !Number.isFinite(birth.latitude) || !Number.isFinite(birth.longitude)) return false;
  if (!revision || !revision.epoch || !Number.isSafeInteger(revision.revision)) return true;
  const canonical = await readCanonicalBirth(uid);
  if (!canonical?.canonicalBirth || !canonical.operationId || canonical.epoch !== revision.epoch || canonical.revision !== revision.revision || JSON.stringify(birth) !== JSON.stringify(canonical.canonicalBirth)) return false;
  const { status, receipt } = await lookupCanonicalOperation(uid, canonical.operationId);
  if (status !== "FOUND" || !receipt || receipt.uid !== uid || receipt.operationId !== canonical.operationId || receipt.status !== "COMMITTED" || receipt.epoch !== canonical.epoch || receipt.revision !== canonical.revision) return false;
  try {
    if (receipt.requestDigest === await digestPendingValue({ uid, ...birth })) return true;
    // The existing legacy initializer uses a distinct, server-owned digest.
    if (canonical.revision !== 1) return false;
    if (receipt.requestDigest === await digestText(`${uid}:${canonical.operationId}:initialize`)) return true;
    if (receipt.attestation !== "owner_reviewed_birth_v1") return false;
    const reviewedDigest = await digestPendingValue({ uid, ...birth });
    return receipt.requestDigest === await digestText(`${uid}:${canonical.operationId}:initialize:${reviewedDigest}:owner_reviewed_birth_v1`);
  } catch {
    return false;
  }
}

import { getHdAttemptMs, getHdState, HD_PENDING_TTL_MS, type HdStateResult } from "./hdState";
import { HD_RETRY_MAX_ATTEMPTS, buildHdRetryMetadata } from "./hdRetry";
import { resolveHumanDesignBirthSources } from "./normalizedAudit";
import { isCanonicalHumanDesign } from "./hdAudit";
import { isCanonicalCoreComplete } from "./completeness";
import { computeBirthInputFingerprint, compareBirthInputMatch } from "./birthFingerprint";
import { createPendingHumanDesignChart, type HumanDesignBirthProfile, type HumanDesignChart } from "./types";
import { withHdDeadline, HD_CLIENT_TIMEOUT_MS, HdCommunicationError, isHdRetryable } from "./hdCommunication";

export const HD_RECOVERY_MAX_ATTEMPTS = HD_RETRY_MAX_ATTEMPTS;
export { HD_PENDING_TTL_MS };
type HdRecord = Record<string, unknown>;
export type HdRecoveryDue = {
  due: boolean;
  reason: "preserved_canonical" | "repair_eligible_incomplete" | "terminal" | "exhausted" | "scheduled" | "due";
  state: HdStateResult;
  retryCount: number;
  retryAt: number | null;
};
export type HdRecoveryAction = "preserved-canonical" | "recovered-canonical" | "still-pending" | "scheduled" | "exhausted" | "terminal" | "incomplete-birth" | "cancelled";
export type HdRecoveryResult = {
  action: HdRecoveryAction;
  state: HdStateResult;
  retryCount: number;
  persisted: boolean;
  reason: string;
  chart: HumanDesignChart | null;
  blueprint?: HdRecord;
};

export function isHdRecoveryDue(value: unknown, nowMs = Date.now()): HdRecoveryDue {
  const state = getHdState(value, { now: nowMs });
  const hd = (value && typeof value === "object" ? value : {}) as HdRecord;
  const raw = Number(hd.retryCount);
  const retryCount = Number.isFinite(raw) ? Math.max(0, Math.floor(raw)) : 0;
  const base = { state, retryCount, retryAt: null };
  if (state.state === "CANONICAL") {
    // Only core-complete canonical charts are exempted from recovery.
    // Canonical charts with empty/incomplete core are marked repair-eligible ("repair_eligible_incomplete")
    // but in Sprint HD-02 they are NOT automatically recalculated/overwritten.
    if (isCanonicalCoreComplete(value)) {
      return { ...base, due: false, reason: "preserved_canonical" };
    }
    return { ...base, due: false, reason: "repair_eligible_incomplete" };
  }
  if (["endpoint_not_found", "unauthorized", "invalid_input", "invalid_response", "cancelled"].includes(String(hd.lastErrorCode))) return { ...base, due: false, reason: "terminal" };
  if (state.state === "TERMINAL_ERROR") return { ...base, due: false, reason: "terminal" };
  if (retryCount >= HD_RECOVERY_MAX_ATTEMPTS) return { ...base, due: false, reason: "exhausted" };
  const scheduled = typeof hd.nextRetryAt === "string" ? Date.parse(hd.nextRetryAt) : NaN;
  const attempt = getHdAttemptMs(hd);
  const pendingUntil = state.state === "PENDING" && attempt !== null ? attempt + HD_PENDING_TTL_MS : 0;
  const retryAt = Math.max(Number.isFinite(scheduled) ? scheduled : 0, pendingUntil);
  if (retryAt > nowMs) return { ...base, due: false, reason: "scheduled", retryAt };
  return { ...base, due: true, reason: "due" };
}

export function mergeBlueprintPreservingCanonical(existingHd: unknown, incomingHd: unknown): unknown {
  if (isCanonicalHumanDesign(existingHd)) return existingHd;
  return incomingHd;
}

export function selectHumanDesignChart(humanDesign: unknown, state: HdStateResult | null): HumanDesignChart | null {
  if (!humanDesign || typeof humanDesign !== "object" || !state) return null;
  if (state.state === "CANONICAL") return humanDesign as HumanDesignChart;
  if (state.state === "FALLBACK_LABELED" && (humanDesign as HumanDesignChart).type) return humanDesign as HumanDesignChart;
  return null;
}

export type HdRecoveryDeps = {
  uid: string;
  profile: HdRecord;
  blueprint: HdRecord;
  nowMs?: number;
  isActive?: () => boolean;
  sessionId?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  calculate?: (profile: HumanDesignBirthProfile, options?: { signal?: AbortSignal }) => Promise<HumanDesignChart>;
  persist?: (uid: string, updatedBlueprint: HdRecord) => Promise<unknown>;
  read?: (uid: string) => Promise<HdRecord | null>;
};
export const inFlightHdRecoveries = new Map<string, Promise<HdRecoveryResult>>();
const attempts = new Map<string, ReturnType<typeof buildHdRetryMetadata>>();
const latestKeys = new Map<string, string>();

export function hdRecoveryKey(deps: Pick<HdRecoveryDeps, "uid" | "sessionId" | "profile" | "blueprint">): string {
  const birth = resolveHumanDesignBirthSources(deps.profile, deps.blueprint.input).profile;
  return JSON.stringify([deps.uid, deps.sessionId ?? "legacy", birth.birthDate, birth.birthTime,
    birth.birthCity, birth.timezone, birth.latitude, birth.longitude]);
}

export function clearHdRecoverySession(uid: string): void {
  const key = latestKeys.get(uid);
  if (key) attempts.delete(key);
  latestKeys.delete(uid);
}

export function assertHdRecoveryWrite(current: HdRecord, expectedInput: string, active: boolean): void {
  if (!active || JSON.stringify(current.input) !== expectedInput) throw new Error("inactive_or_input_changed");
}

export function getHdRecoveryDueForUid(uid: string, hd: unknown, nowMs = Date.now()): HdRecoveryDue {
  const stored = (hd && typeof hd === "object" ? hd : {}) as HdRecord;
  const local = attempts.get(latestKeys.get(uid) ?? uid);
  return isHdRecoveryDue(local && (local.retryCount ?? 0) >= (Number(stored.retryCount) || 0) ? { ...stored, ...local } : stored, nowMs);
}

export function scheduleHdRecovery(uid: string, hd: unknown, run: () => void, nowMs = Date.now()): () => void {
  const due = getHdRecoveryDueForUid(uid, hd, nowMs);
  if (!due.due && due.retryAt === null) return () => {};
  const timer = setTimeout(run, Math.min(2_147_483_647, Math.max(0, (due.retryAt ?? nowMs) - nowMs)));
  return () => clearTimeout(timer);
}

export function recoverHumanDesignIfNeeded(deps: HdRecoveryDeps): Promise<HdRecoveryResult> {
  const { uid } = deps;
  const key = hdRecoveryKey(deps);
  const existing = inFlightHdRecoveries.get(key);
  if (existing) {
    (existing as any).__hits = ((existing as any).__hits || 0) + 1;
    return existing;
  }
  const previous = latestKeys.get(uid);
  if (previous && previous !== key) attempts.delete(previous);
  latestKeys.set(uid, key);
  let expired = false;
  const promise = (async (): Promise<HdRecoveryResult> => {
    let current = deps.blueprint;
    let expectedInput = "";
    let eligibility = getHdRecoveryDueForUid(uid, current.humanDesign, deps.nowMs);
    const result = (action: HdRecoveryAction, reason: string): HdRecoveryResult => ({
      action, reason, state: getHdState(current.humanDesign), retryCount: eligibility.retryCount,
      persisted: false, chart: null,
    });
    if (!uid || (current.uid && current.uid !== uid)) return result("cancelled", "owner_mismatch");
    if (!eligibility.due) {
      const action = (eligibility.reason === "preserved_canonical" || eligibility.reason === "repair_eligible_incomplete") ? "preserved-canonical"
        : eligibility.reason === "terminal" ? "terminal" : eligibility.reason === "exhausted" ? "exhausted" : "scheduled";
      return result(action, eligibility.reason);
    }
    let active = () => !expired && !deps.signal?.aborted && latestKeys.get(uid) === key && (deps.isActive?.() ?? true);
    const bounded = <T>(operation: () => Promise<T>) => withHdDeadline(operation, deps.timeoutMs ?? HD_CLIENT_TIMEOUT_MS, deps.signal);
    let read = deps.read;
    let persist = deps.persist;
    if (!persist || !read) {
      if (persist) return result("still-pending", "authoritative_read_required");
      const { auth, db } = await import("@/lib/firebase/firebase");
      const { doc, getDocFromServer, runTransaction } = await import("firebase/firestore");
      const { sanitizeForFirestore } = await import("@/lib/firebase/sanitizeForFirestore");
      const callerActive = active;
      active = () => callerActive() && auth.currentUser?.uid === uid;
      const ref = doc(db, "blueprints", uid);
      read = async () => {
        if (!active()) return null;
        const snapshot = await getDocFromServer(ref);
        return snapshot.exists() ? { ...snapshot.data(), uid } : null;
      };
      persist = async (_uid, updated) => runTransaction(db, async transaction => {
        if (!active()) throw new Error("inactive");
        const snapshot = await transaction.get(ref);
        if (!active() || !snapshot.exists()) throw new Error("inactive_or_missing");
        assertHdRecoveryWrite(snapshot.data(), expectedInput, active());
        const old = snapshot.data().humanDesign;
        if (isCanonicalHumanDesign(old)) return;
        const incoming = updated.humanDesign as HumanDesignChart;
        const historical = getHdState(old).state === "FALLBACK_LABELED";
        const hd = historical && !isCanonicalHumanDesign(incoming)
          ? { ...old, ...attempts.get(key) } : incoming;
        transaction.update(ref, sanitizeForFirestore({ humanDesign: hd }));
      });
    }
    if (!active()) return result("cancelled", "inactive");
    if (isCanonicalHumanDesign(current.humanDesign)) return result("preserved-canonical", "preserved_canonical");
    try {
      const authoritative = await bounded(() => read!(uid));
      if (!active()) return result("cancelled", "inactive");
      if (!authoritative || (authoritative.uid && authoritative.uid !== uid)) throw new Error("missing_or_wrong_owner");
      current = authoritative;
    } catch {
      const count = eligibility.retryCount + 1;
      attempts.set(key, buildHdRetryMetadata({ code: "read_failed" }, count, deps.nowMs));
      eligibility = getHdRecoveryDueForUid(uid, current.humanDesign, deps.nowMs);
      return result(count >= HD_RECOVERY_MAX_ATTEMPTS ? "exhausted" : "still-pending", "read_failed");
    }
    eligibility = getHdRecoveryDueForUid(uid, current.humanDesign, deps.nowMs);
    if (!eligibility.due) {
      const action = eligibility.reason === "preserved_canonical" ? "preserved-canonical"
        : eligibility.reason === "terminal" ? "terminal" : eligibility.reason === "exhausted" ? "exhausted" : "scheduled";
      return { ...result(action, eligibility.reason), blueprint: current };
    }
    expectedInput = JSON.stringify(current.input);
    const birth = resolveHumanDesignBirthSources(deps.profile, current.input);
    if (!birth.complete) return result("incomplete-birth", "incomplete_birth");

    // Compute input fingerprint at start of calculation to protect against concurrent input revisions
    const startingFingerprint = computeBirthInputFingerprint(uid, birth.profile);

    const count = eligibility.retryCount + 1;
    let metadata = buildHdRetryMetadata({ code: "recovery_failed", reason: "recovery_failed" }, count, deps.nowMs);
    attempts.set(key, metadata);
    const calculate = deps.calculate ?? (async (profile: HumanDesignBirthProfile, options?: { signal?: AbortSignal }) => {
      const { calculateHumanDesign } = await import("./calculateHumanDesign");
      return calculateHumanDesign(profile, options);
    });
    let chart: HumanDesignChart;
    try {
      chart = await withHdDeadline(signal => calculate(birth.profile, { signal }), deps.timeoutMs ?? HD_CLIENT_TIMEOUT_MS, deps.signal);
    } catch (error) {
      const code = error instanceof HdCommunicationError ? error.code : "connection_error";
      chart = { ...createPendingHumanDesignChart(""), lastErrorCode: code };
    }
    if (chart.lastErrorCode === "cancelled") return result("cancelled", "inactive");
    const failureCode = chart.lastErrorCode || "service_unavailable";
    metadata = buildHdRetryMetadata({ code: failureCode, reason: failureCode }, count, deps.nowMs);
    attempts.set(key, metadata);
    if (chart.lastErrorCode && !isHdRetryable(chart.lastErrorCode)) {
      return { ...result("terminal", chart.lastErrorCode), retryCount: count };
    }
    if (!active()) return result("cancelled", "inactive");
    const canonical = isCanonicalCoreComplete(chart);

    // Verify input revision hasn't changed during calculation
    if (startingFingerprint) {
      try {
        const checkLatest = await bounded(() => read!(uid));
        if (!active()) return result("cancelled", "inactive");
        if (!checkLatest || (checkLatest.uid && checkLatest.uid !== uid) || JSON.stringify(checkLatest.input) !== expectedInput) {
          return result("cancelled", "input_revision_changed_during_calculation");
        }
        if (checkLatest.input) {
          const latestMatch = compareBirthInputMatch(uid, { inputHash: startingFingerprint.revisionHash }, checkLatest.input);
          if (latestMatch === "CHANGED") {
            return result("cancelled", "input_revision_changed_during_calculation");
          }
        }
      } catch {
        return { ...result(count >= HD_RECOVERY_MAX_ATTEMPTS ? "exhausted" : "still-pending", "revision_read_failed"), retryCount: count };
      }
    }

    const failedChart = getHdState(current.humanDesign).state === "FALLBACK_LABELED"
      ? current.humanDesign as HumanDesignChart : chart;
    const finalChart = canonical
      ? (startingFingerprint ? { ...chart, inputHash: startingFingerprint.revisionHash } : chart)
      : { ...failedChart, ...metadata };
    try {
      if (!active()) return result("cancelled", "inactive");
      const saved = await bounded(() => persist!(uid, { ...current, humanDesign: finalChart }));
      if (saved === false) throw new Error("persist_failed");
      if (!active()) return result("cancelled", "inactive");
      const reread = await bounded(() => read!(uid));
      if (!active()) return result("cancelled", "inactive");
      if (!reread || (reread.uid && reread.uid !== uid)) throw new Error("read_failed");
      current = reread;
      const recovered = isCanonicalCoreComplete(current.humanDesign)
        && JSON.stringify(current.input) === expectedInput
        && compareBirthInputMatch(uid, current.humanDesign, birth.profile) === "MATCH";
      if (recovered) attempts.delete(key);
      return {
        action: recovered ? "recovered-canonical" : count >= HD_RECOVERY_MAX_ATTEMPTS ? "exhausted" : "still-pending",
        reason: recovered ? "recovered_canonical" : "attempt_failed", persisted: recovered,
        state: getHdState(current.humanDesign), retryCount: count,
        chart: current.humanDesign as HumanDesignChart, blueprint: current,
      };
    } catch {
      return { ...result(count >= HD_RECOVERY_MAX_ATTEMPTS ? "exhausted" : "still-pending", "persistence_unconfirmed"), retryCount: count };
    }
  })();
  (promise as any).__id = Math.random().toString(36).slice(2, 8);
  inFlightHdRecoveries.set(key, promise);
  const cleanup = () => {
    expired = true;
    if (inFlightHdRecoveries.get(key) === promise) inFlightHdRecoveries.delete(key);
    if (deps.signal?.aborted && latestKeys.get(uid) === key) clearHdRecoverySession(uid);
  };
  void promise.then(cleanup, cleanup);
  return promise;
}

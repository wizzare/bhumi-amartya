import { computeBirthInputFingerprint } from "./birthFingerprint";
import { selectHdView, type HdUiState } from "./hdView";
import { withHdDeadline } from "./hdCommunication";

type RecordValue = Record<string, unknown>;
export const HD_CACHE_TTL_MS = 300_000;
const cache = new WeakMap<object, { uid: string; revision: string; confirmedAt: number; blueprint: RecordValue }>();

export async function loadHdView(options: {
  uid: string;
  session: object;
  input: RecordValue | null;
  signal: AbortSignal;
  active: () => boolean;
  online: boolean;
  read: () => Promise<RecordValue | null>;
  now?: number;
  timeoutMs?: number;
}): Promise<{ state: HdUiState; blueprint: RecordValue | null }> {
  const { uid, session, signal, active, input } = options;
  const now = options.now ?? Date.now();
  const revision = computeBirthInputFingerprint(uid, input)?.revisionHash;
  const current = () => !signal.aborted && active();
  if (!uid) return { state: "authentication_required", blueprint: null };
  if (!current()) return { state: "cancelled", blueprint: null };
  const previous = cache.get(session);
  const valid = previous?.uid === uid && previous.revision === revision
    && now >= previous.confirmedAt && now - previous.confirmedAt < HD_CACHE_TTL_MS;
  if (options.online) {
    try {
      const blueprint = await withHdDeadline(options.read, options.timeoutMs ?? 10_000, signal);
      if (!current()) return { state: "cancelled", blueprint: null };
      if (!blueprint) {
        cache.delete(session);
        return { state: "missing_blueprint", blueprint: null };
      }
      if (blueprint.uid !== uid) return { state: "read_error", blueprint: null };
      const resolvedInput = input ?? blueprint.input as RecordValue | null;
      const view = selectHdView(uid, blueprint, resolvedInput);
      const confirmedRevision = computeBirthInputFingerprint(uid, resolvedInput)?.revisionHash;
      if (view.state === "ready_canonical" && confirmedRevision) {
        cache.set(session, { uid, revision: confirmedRevision, confirmedAt: now, blueprint: structuredClone(blueprint) });
      } else {
        cache.delete(session);
      }
      return { state: view.state, blueprint };
    } catch {
      if (!current()) return { state: "cancelled", blueprint: null };
      return { state: "read_error", blueprint: valid ? structuredClone(previous.blueprint) : null };
    }
  }
  return valid
    ? { state: "offline_with_valid_cache", blueprint: structuredClone(previous.blueprint) }
    : { state: "offline_without_cache", blueprint: null };
}

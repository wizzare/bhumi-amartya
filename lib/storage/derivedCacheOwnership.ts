import { getActiveUserId } from "@/lib/auth/getActiveUserId";
import { safeJsonParse } from "@/lib/storage/safeJson";
import { auth } from "@/lib/firebase/firebase";

type UnknownRecord = Record<string, unknown>;

function getActiveUid(): string | null {
  if (typeof window === "undefined") return null;

  // Primary: Firebase Auth
  const authUid = auth.currentUser?.uid;
  if (authUid) return authUid;

  // Fallback: search for scoped profile to identify WHO might be active locally
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('bhumiProfile:')) {
      const uid = key.split(':')[1];
      if (uid) return uid;
    }
  }

  return null;
}

function getCacheUid(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const uid = (value as UnknownRecord).uid;
  return typeof uid === "string" && uid.trim() ? uid : null;
}

function logDerivedUidCheck(input: {
  key: string;
  label: string;
  activeUid: string | null;
  cachedUid: string | null;
  action: "use" | "remove" | "filter" | "empty";
}) {
  console.log("[DERIVED UID CHECK]", input);
}

export function readOwnedCacheObject<T extends object>(
  key: string,
  label: string,
): T | null {
  if (typeof window === "undefined") return null;

  const activeUid = getActiveUid();
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    logDerivedUidCheck({ key, label, activeUid, cachedUid: null, action: "empty" });
    return null;
  }

  const parsed = safeJsonParse<T | null>(stored, null);
  if (!parsed) {
    window.localStorage.removeItem(key);
    logDerivedUidCheck({ key, label, activeUid, cachedUid: null, action: "remove" });
    return null;
  }

  const cachedUid = getCacheUid(parsed);
  if (activeUid && cachedUid !== activeUid) {
    window.localStorage.removeItem(key);
    logDerivedUidCheck({ key, label, activeUid, cachedUid, action: "remove" });
    return null;
  }

  logDerivedUidCheck({ key, label, activeUid, cachedUid, action: "use" });
  return parsed;
}

export function writeOwnedCacheObject<T extends object>(
  key: string,
  value: T,
  label: string,
): T {
  if (typeof window === "undefined") return value;
  const activeUid = getActiveUid();
  const nextValue = activeUid ? { ...value, uid: getCacheUid(value) ?? activeUid } : value;
  window.localStorage.setItem(key, JSON.stringify(nextValue));
  logDerivedUidCheck({
    key,
    label,
    activeUid,
    cachedUid: getCacheUid(nextValue),
    action: "use",
  });
  return nextValue as T;
}

export function readOwnedCacheArray<T extends object>(
  key: string,
  label: string,
): T[] {
  if (typeof window === "undefined") return [];

  const activeUid = getActiveUid();
  const stored = window.localStorage.getItem(key);
  if (!stored) {
    logDerivedUidCheck({ key, label, activeUid, cachedUid: null, action: "empty" });
    return [];
  }

  const parsed = safeJsonParse<unknown>(stored, []);
  if (!Array.isArray(parsed)) {
    window.localStorage.removeItem(key);
    logDerivedUidCheck({ key, label, activeUid, cachedUid: null, action: "remove" });
    return [];
  }

  if (!activeUid) return parsed as T[];

  const owned = parsed.filter((item) => getCacheUid(item) === activeUid) as T[];
  if (owned.length !== parsed.length) {
    if (owned.length > 0) {
      window.localStorage.setItem(key, JSON.stringify(owned));
    } else {
      window.localStorage.removeItem(key);
    }
    logDerivedUidCheck({ key, label, activeUid, cachedUid: "mixed-or-missing", action: "filter" });
  } else {
    logDerivedUidCheck({ key, label, activeUid, cachedUid: activeUid, action: "use" });
  }

  return owned;
}

export function writeOwnedCacheArray<T extends object>(
  key: string,
  values: T[],
  label: string,
): T[] {
  if (typeof window === "undefined") return values;
  const activeUid = getActiveUid();
  const nextValues = activeUid
    ? values.map((value) => ({ ...value, uid: getCacheUid(value) ?? activeUid } as T))
    : values;
  window.localStorage.setItem(key, JSON.stringify(nextValues));
  logDerivedUidCheck({
    key,
    label,
    activeUid,
    cachedUid: activeUid,
    action: "use",
  });
  return nextValues;
}

export function withActiveUid<T extends object>(value: T): T {
  const activeUid = getActiveUid();
  return activeUid ? ({ ...value, uid: getCacheUid(value) ?? activeUid } as T) : value;
}

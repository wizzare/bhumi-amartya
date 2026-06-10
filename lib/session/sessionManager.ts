import type { UserProfile, CoreIdentity } from "@/lib/data/types";
import { safeJsonParse } from "@/lib/storage/safeJson";

const STORAGE_KEY = "bhumi-sessions";

export interface UserSession {
  email: string;
  profile?: UserProfile;
  identity?: CoreIdentity;
  completedSetup?: boolean;
  lastActive: string;
}

function readAll(): Record<string, UserSession> {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  return safeJsonParse<Record<string, UserSession>>(raw, {});
}

function writeAll(data: Record<string, UserSession>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function saveUserSession(email: string, patch: Partial<UserSession>): Promise<UserSession> {
  if (!email) throw new Error("email required");
  const all = readAll();
  const existing = all[email] ?? { email, lastActive: new Date().toISOString() };
  const merged: UserSession = {
    ...existing,
    ...patch,
    email,
    lastActive: new Date().toISOString(),
  };
  all[email] = merged;
  writeAll(all);
  return merged;
}

export async function getUserSession(email: string | null | undefined): Promise<UserSession | null> {
  if (!email) return null;
  const all = readAll();
  return all[email] ?? null;
}

export async function clearUserSession(email?: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (!email) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  const all = readAll();
  delete all[email];
  writeAll(all);
}

export async function hasCompletedSetup(email: string | null | undefined): Promise<boolean> {
  const s = await getUserSession(email);
  return Boolean(s && s.completedSetup === true && s.profile);
}

export async function listSessions(): Promise<UserSession[]> {
  const all = readAll();
  return Object.values(all);
}

export default {
  saveUserSession,
  getUserSession,
  clearUserSession,
  hasCompletedSetup,
  listSessions,
};

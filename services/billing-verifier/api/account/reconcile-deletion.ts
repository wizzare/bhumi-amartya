import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "../../lib/firebaseAdmin";
import { originAllowed } from "../../lib/security";
import { sendJson } from "../../lib/response";

export const config = { runtime: "nodejs", maxDuration: 30, api: { bodyParser: { sizeLimit: "4kb" } } };

const DEVICE_CLAIM_RETENTION_DAYS = 180;
const AUDIT_LOG_RETENTION_DAYS = 90;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = typeof req.headers.origin === "string" ? req.headers.origin : undefined;
  const failure = (status: number, error: string) => sendJson(res, status, { ok: false, error });

  if (!originAllowed(origin)) return failure(403, "ORIGIN_NOT_ALLOWED");
  if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Firebase-AppCheck");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return failure(405, "METHOD_NOT_ALLOWED");

  const authorization = typeof req.headers.authorization === "string" ? req.headers.authorization : "";
  if (!authorization.startsWith("Bearer ") || !authorization.slice(7).trim()) {
    return failure(401, "AUTH_MISSING");
  }

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(authorization.slice(7).trim(), true)).uid;
    if (!uid || uid.includes("/")) return failure(401, "AUTH_INVALID");
  } catch {
    return failure(401, "AUTH_INVALID");
  }

  try {
    const db = adminDb();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const deviceRetainUntil = new Date(now + DEVICE_CLAIM_RETENTION_DAYS * 86400_000).toISOString();
    const auditRetainUntil = new Date(now + AUDIT_LOG_RETENTION_DAYS * 86400_000).toISOString();
    const uidHash = sha256Hex(`bhumi-uid-v1:${uid}`).slice(0, 32);

    let birthClaimsCleaned = 0;
    let deviceClaimsScrubbed = 0;
    let auditLogsRedacted = 0;

    // 1. Remove user's link from personal birth-profile cluster records
    const birthSnap = await db.collection("antiAbuseBirthClaims").where("uidHashes", "array-contains", uidHash).get();
    for (const docSnap of birthSnap.docs) {
      const data = docSnap.data() || {};
      const remaining = Array.isArray(data.uidHashes)
        ? data.uidHashes.filter((h: unknown) => typeof h === "string" && h !== uidHash)
        : [];
      if (remaining.length === 0) {
        await docSnap.ref.delete();
      } else {
        await docSnap.ref.set(
          {
            uidHashes: remaining,
            uidCount: remaining.length,
            firstUidHash: data.firstUidHash === uidHash ? remaining[0] : data.firstUidHash,
            lastSeenAt: nowIso,
          },
          { merge: true },
        );
      }
      birthClaimsCleaned++;
    }

    // 2. Scrub any raw Firebase UID from device fraud claims while retaining bounded pseudonymous hash
    const byFirstUid = await db.collection("antiAbuseDeviceClaims").where("firstUid", "==", uid).get();
    const byHistory = await db.collection("antiAbuseDeviceClaims").where("uidHistory", "array-contains", uidHash).get();
    const seenDevicePaths = new Set<string>();
    for (const docSnap of [...byFirstUid.docs, ...byHistory.docs]) {
      if (seenDevicePaths.has(docSnap.ref.path)) continue;
      seenDevicePaths.add(docSnap.ref.path);
      const data = docSnap.data() || {};
      const patch: Record<string, unknown> = {
        accountDeletedAt: nowIso,
        retainUntil: deviceRetainUntil,
      };
      if (data.firstUid !== undefined) {
        patch.firstUid = FieldValue.delete();
        if (!data.firstUidHash) {
          patch.firstUidHash = typeof data.firstUid === "string" ? sha256Hex(`bhumi-uid-v1:${data.firstUid}`).slice(0, 32) : uidHash;
        }
      }
      await docSnap.ref.set(patch, { merge: true });
      deviceClaimsScrubbed++;
    }

    // 3. Redact personal birth HMAC & stamp retention bound on audit logs for this UID hash
    const auditSnap = await db.collection("antiAbuseAuditLogs").where("uidHash", "==", uidHash).get();
    for (const docSnap of auditSnap.docs) {
      await docSnap.ref.set(
        {
          birthCoreHmac: null,
          accountDeletedAt: nowIso,
          retainUntil: auditRetainUntil,
        },
        { merge: true },
      );
      auditLogsRedacted++;
    }

    return sendJson(res, 200, {
      ok: true,
      birthClaimsCleaned,
      deviceClaimsScrubbed,
      auditLogsRedacted,
    });
  } catch {
    return failure(500, "DELETION_RECONCILIATION_FAILURE");
  }
}

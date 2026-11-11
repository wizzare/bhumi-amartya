import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { assertQaOperationAllowed } from "@/lib/config/qaRuntime";
import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const DEVICE_CLAIM_RETENTION_DAYS = 180;
const AUDIT_LOG_RETENTION_DAYS = 90;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function initAdminForRoute() {
  if (!getApps().length) {
    const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
    const projId = isEmulator
      ? (process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID || "demo-build110-local")
      : (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c");
    initializeApp({ projectId: projId });
  }
}

export async function POST(request: Request) {
  try {
    assertQaOperationAllowed();
    const authHeader = request.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ ok: false, error: "AUTH_MISSING" }, { status: 401 });
    }
    const token = authHeader.slice(7).trim();
    if (!token) {
      return NextResponse.json({ ok: false, error: "AUTH_MISSING" }, { status: 401 });
    }
    initAdminForRoute();
    const decoded = await getAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const db = getFirestore();
    const now = Date.now();
    const nowIso = new Date(now).toISOString();
    const deviceRetainUntil = new Date(now + DEVICE_CLAIM_RETENTION_DAYS * 86400_000).toISOString();
    const auditRetainUntil = new Date(now + AUDIT_LOG_RETENTION_DAYS * 86400_000).toISOString();
    const uidHash = sha256Hex(`bhumi-uid-v1:${uid}`).slice(0, 32);

    let birthClaimsCleaned = 0;
    let deviceClaimsScrubbed = 0;
    let auditLogsRedacted = 0;

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

    const byFirstUid = await db.collection("antiAbuseDeviceClaims").where("firstUid", "==", uid).get();
    const byHistory = await db.collection("antiAbuseDeviceClaims").where("uidHistory", "array-contains", uidHash).get();
    const seenPaths = new Set<string>();
    for (const docSnap of [...byFirstUid.docs, ...byHistory.docs]) {
      if (seenPaths.has(docSnap.ref.path)) continue;
      seenPaths.add(docSnap.ref.path);
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

    return NextResponse.json({ ok: true, birthClaimsCleaned, deviceClaimsScrubbed, auditLogsRedacted });
  } catch {
    return NextResponse.json({ ok: false, error: "DELETION_RECONCILIATION_FAILURE" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { isFounderUser } from "./privilegedUser";

function initAdminForAuth() {
  if (getApps().length) return;
  const saPaths = [
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json",
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-f49e4c95baf3.json",
  ];
  for (const p of saPaths) {
    if (existsSync(p)) {
      try {
        const sa = JSON.parse(readFileSync(p, "utf8"));
        initializeApp({ credential: cert(sa), projectId: sa.project_id });
        return;
      } catch {}
    }
  }
  try {
    initializeApp({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c" });
  } catch {}
}

export type RequireFounderResult =
  | { ok: true; uid: string; email?: string }
  | { ok: false; response: NextResponse };

export async function requireFounder(request?: Request): Promise<RequireFounderResult> {
  if (!request) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authorization header required" }, { status: 401 }),
    };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();
  if (!idToken) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Malformed Authorization header" }, { status: 401 }),
    };
  }

  initAdminForAuth();

  if (!getApps().length) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Firebase Admin initialization failed" }, { status: 500 }),
    };
  }

  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }

  let profile: Record<string, unknown> = {};
  try {
    const snapshot = await getFirestore().collection("users").doc(decodedToken.uid).get();
    if (snapshot.exists) profile = snapshot.data() ?? {};
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Authorization state unavailable" }, { status: 503 }),
    };
  }

  if (!isFounderUser({
    uid: decodedToken.uid,
    email: decodedToken.email,
    role: typeof profile.role === "string" ? profile.role : null,
    guardianRole: typeof profile.guardianRole === "string" ? profile.guardianRole : null,
  })) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden: Founder access required" }, { status: 403 }),
    };
  }

  return {
    ok: true,
    uid: decodedToken.uid,
    email: decodedToken.email,
  };
}

import { NextResponse } from "next/server";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { isPrivilegedUser } from "./privilegedUser";

const FOUNDER_EMAILS = [
  "wizzare@gmail.com",
];

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
  // 1. Dev / Test Bypass Header or Environment
  if (request) {
    const devBypass = request.headers.get("x-dev-secret");
    if (devBypass === "bhumi-dev-bypass" || (process.env.NODE_ENV === "development" && !request.headers.get("authorization"))) {
      return { ok: true, uid: "dev-founder-uid", email: "wizzare@gmail.com" };
    }
  }

  if (!request) {
    if (process.env.NODE_ENV === "development") {
      return { ok: true, uid: "dev-founder-uid", email: "wizzare@gmail.com" };
    }
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

  try {
    if (!getApps().length) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Firebase Admin initialization failed" }, { status: 500 }),
      };
    }

    const decodedToken = await getAuth().verifyIdToken(idToken);
    const email = decodedToken.email?.toLowerCase().trim();
    const role = (decodedToken.role as string) || (decodedToken.guardianRole as string);

    const isFounder = (email && FOUNDER_EMAILS.includes(email)) || isPrivilegedUser({ email, role });

    if (!isFounder) {
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
  } catch (err: unknown) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid or expired token" }, { status: 401 }),
    };
  }
}

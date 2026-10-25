import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";

export const HD_ADMIN_APP_NAME = "bhumi-hd-admin";
export const EXPECTED_FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bhumiamartya-fe85c";

export type HdAuthVerificationResult = {
  authenticated: boolean;
  uid?: string;
  status?: number;
  errorNote?: string;
};

export type HdAuthDependencies = {
  verifyIdToken?: (token: string) => Promise<{ uid: string; [key: string]: unknown }>;
};

function getLocalServiceAccount(): { sa: Record<string, unknown>; projectId: string } | null {
  const saPaths = [
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json",
    "C:/Users/shein/Downloads/bhumiamartya-fe85c-f49e4c95baf3.json",
  ];
  for (const p of saPaths) {
    if (existsSync(p)) {
      try {
        const sa = JSON.parse(readFileSync(p, "utf8"));
        const projectId = typeof sa.project_id === "string" ? sa.project_id : EXPECTED_FIREBASE_PROJECT_ID;
        return { sa, projectId };
      } catch {
        // continue search
      }
    }
  }
  return null;
}

export function getOrCreateHdAdminApp(): App | null {
  const existing = getApps().find((a) => a.name === HD_ADMIN_APP_NAME);
  if (existing) return existing;

  const isEmulator = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true" || Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);
  const emulatorProjectId = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "demo-qa";

  if (isEmulator) {
    try {
      return initializeApp({ projectId: emulatorProjectId }, HD_ADMIN_APP_NAME);
    } catch {
      return null;
    }
  }

  const localSa = getLocalServiceAccount();
  if (localSa) {
    try {
      return initializeApp(
        { credential: cert(localSa.sa), projectId: localSa.projectId },
        HD_ADMIN_APP_NAME,
      );
    } catch {
      return null;
    }
  }

  const envProjectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || EXPECTED_FIREBASE_PROJECT_ID;
  try {
    return initializeApp({ projectId: envProjectId }, HD_ADMIN_APP_NAME);
  } catch {
    return null;
  }
}

export function isLocalDevBypassAllowed(request: Request): boolean {
  if (process.env.NODE_ENV === "production") return false;
  const devBypass = request.headers.get("x-dev-secret");
  if (devBypass !== "bhumi-dev-bypass") return false;

  const isDev = process.env.NODE_ENV === "development";
  const isQa = process.env.BHUMI_LOCAL_QA === "1" || process.env.NEXT_PUBLIC_ENABLE_EMULATOR_QA_LOGIN === "true";
  if (!isDev && !isQa) return false;

  try {
    const url = new URL(request.url);
    const host = url.hostname;
    return ["127.0.0.1", "localhost"].includes(host);
  } catch {
    return false;
  }
}

export async function verifyHdRequestAuthentication(
  request: Request,
  deps: HdAuthDependencies = {},
): Promise<HdAuthVerificationResult> {
  if (isLocalDevBypassAllowed(request)) {
    const authHeader = request.headers.get("authorization");
    const uidFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.split("Bearer ")[1]?.trim()
      : "dev-bypass-user";
    return { authenticated: true, uid: uidFromHeader || "dev-bypass-user" };
  }

  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      status: 401,
      errorNote: "Firebase Auth ID token (Bearer) is required.",
    };
  }

  const idToken = authHeader.split("Bearer ")[1]?.trim();
  if (!idToken) {
    return {
      authenticated: false,
      status: 401,
      errorNote: "Malformed Authorization header.",
    };
  }

  if (deps.verifyIdToken) {
    try {
      const decoded = await deps.verifyIdToken(idToken);
      if (!decoded || typeof decoded.uid !== "string" || !decoded.uid) {
        return { authenticated: false, status: 403, errorNote: "Invalid Firebase Auth ID token payload." };
      }
      return { authenticated: true, uid: decoded.uid };
    } catch {
      return { authenticated: false, status: 403, errorNote: "Invalid or expired Firebase Auth ID token." };
    }
  }

  const adminApp = getOrCreateHdAdminApp();
  if (!adminApp) {
    return {
      authenticated: false,
      status: 500,
      errorNote: "Authentication service unavailable (Firebase Admin initialization failed).",
    };
  }

  try {
    const authInstance = getAuth(adminApp);
    const decoded = await authInstance.verifyIdToken(idToken);
    if (!decoded || typeof decoded.uid !== "string" || !decoded.uid) {
      return { authenticated: false, status: 403, errorNote: "Invalid Firebase Auth ID token payload." };
    }
    return { authenticated: true, uid: decoded.uid };
  } catch {
    return {
      authenticated: false,
      status: 403,
      errorNote: "Invalid or expired Firebase Auth ID token.",
    };
  }
}

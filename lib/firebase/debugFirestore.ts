import { app, auth } from "@/lib/firebase/config";

type FirestoreDebugMeta = {
  operation: string;
  path: string;
  uid?: string;
  payloadKeys?: string[];
};

export type FirestoreDebugError = {
  operation: string;
  path: string;
  uid?: string;
  authUid: string | null;
  projectId?: string | null;
  payloadKeys?: string[];
  code?: string;
  message: string;
};

const getErrorInfo = (error: unknown) => {
  if (typeof error !== "object" || error === null) {
    return { code: undefined, message: String(error) };
  }

  const { code, message } = error as { code?: unknown; message?: unknown };

  return {
    code: typeof code === "string" ? code : undefined,
    message: typeof message === "string" ? message : String(error),
  };
};

export async function debugFirestoreOperation<T>(
  meta: FirestoreDebugMeta,
  operation: () => Promise<T>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = getErrorInfo(error);
    const debugError: FirestoreDebugError = {
      operation: meta.operation,
      path: meta.path,
      uid: meta.uid,
      authUid: auth.currentUser?.uid ?? null,
      projectId: app.options.projectId,
      payloadKeys: meta.payloadKeys,
      code: errorInfo.code,
      message: errorInfo.message,
    };

    if (process.env.NODE_ENV !== "production" && typeof window !== "undefined") {
      window.localStorage.setItem("bhumi.lastFirestoreError", JSON.stringify(debugError));
    }

    if (typeof error === "object" && error !== null) {
      Object.assign(error, { firestoreDebug: debugError });
    }

    throw error;
  }
}

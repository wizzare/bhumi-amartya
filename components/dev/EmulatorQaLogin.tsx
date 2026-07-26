"use client";

import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/firebase";

export function shouldShowEmulatorQaLogin({
  nodeEnv,
  useFirebaseEmulators,
  enableAndroidQaLogin,
  isNativePlatform,
  platform,
}: {
  nodeEnv: string | undefined;
  useFirebaseEmulators: string | undefined;
  enableAndroidQaLogin: string | undefined;
  isNativePlatform: boolean;
  platform: string;
}) {
  if (useFirebaseEmulators !== "true") return false;
  if (!isNativePlatform) return nodeEnv !== "production";
  return platform === "android" && enableAndroidQaLogin === "true";
}

export function EmulatorQaLogin() {
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const showQaLogin = shouldShowEmulatorQaLogin({
    nodeEnv: process.env.NODE_ENV,
    useFirebaseEmulators: process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS,
    enableAndroidQaLogin: process.env.NEXT_PUBLIC_ENABLE_ANDROID_EMULATOR_QA_LOGIN,
    isNativePlatform: Capacitor.isNativePlatform(),
    platform: Capacitor.getPlatform(),
  });

  if (!showQaLogin) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      console.log("[QA LOGIN] Success UID:", cred.user.uid);
    } catch (err: any) {
      setError(err?.code || err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      marginTop: "24px",
      padding: "16px",
      border: "1px solid #D9D6CC",
      borderRadius: "8px",
      background: "#F7F4ED",
    }}>
      <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "#6D786F", marginBottom: "8px" }}>
        Local Emulator QA Login
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <input
          data-testid="qa-emulator-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #D9D6CC", fontSize: "14px" }}
        />
        <input
          data-testid="qa-emulator-password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #D9D6CC", fontSize: "14px" }}
        />
        <button
          data-testid="qa-emulator-submit"
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px", borderRadius: "4px", border: "none", background: "#2F3C34",
            color: "#fff", fontWeight: 600, fontSize: "14px", cursor: "pointer",
          }}
        >
          {loading ? "Logging in…" : "QA Login"}
        </button>
        <p
          data-testid="qa-emulator-error"
          aria-live="polite"
          hidden={!error}
          style={{ color: "#B91C1C", fontSize: "12px" }}
        >
          {error}
        </p>
      </form>
    </div>
  );
}

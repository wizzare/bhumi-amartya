"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { isEnlEdition } from "@/lib/config/edition";
import { Capacitor } from "@capacitor/core";
import {
  GooglePopupTimeoutError,
  handleGoogleRedirectResult,
  signInWithGoogle,
  signInWithGoogleRedirect,
} from "@/lib/auth/authActions";
import Link from "next/link";
import { BHUMI_TOKENS } from "@/components/onboarding/onboardingTokens";
import { useAuth } from "@/context/AuthContext";
import { storageProvider } from "@/lib/storage/storageProvider";
import { userRepository } from "@/lib/repositories/userRepository";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { participationEngine } from "@/lib/engines/participationEngine";
import { EmulatorQaLogin } from "@/components/dev/EmulatorQaLogin";
import { Build110LocalLogin } from "@/components/dev/Build110LocalLogin";
import { isBuild110LocalQa } from "@/lib/config/localQa";
import { logSafeAuthError } from "@/lib/auth/safeDiagnostics";
import { classifyGoogleSignInError, GoogleSignInFailure, googleSignInCategoryMessage } from "@/lib/auth/classifyGoogleSignInError";

function LoginContent() {
  const router = useRouter();
  const t = translations["id"];

  const auth = useAuth();
  const authUser = auth?.user;
  const authLoading = auth?.authLoading === true;
  const authStateResolved = auth?.authStateResolved === true;
  const profileLoading = auth?.profileLoading === true;

  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRedirectFallback, setShowRedirectFallback] = useState(false);

  const getGoogleLoginErrorMessage = (err: unknown): string => {
    const { code } = classifyGoogleSignInError(err);
    if (err instanceof GooglePopupTimeoutError || code === "auth/popup-timeout") {
      return t.login?.popupTimeout || "Google tidak merespons. Periksa apakah pop-up diblokir, lalu coba lagi atau gunakan halaman login Google.";
    }
    if (code === "auth/popup-blocked") {
      return t.login?.popupBlocked || "Pop-up Google diblokir peramban. Gunakan halaman login Google atau izinkan pop-up untuk aplikasi ini.";
    }
    if (code === "auth/popup-closed-by-user") {
      return t.login?.popupClosed || "Jendela login Google ditutup sebelum selesai. Silakan coba lagi.";
    }
    return googleSignInCategoryMessage(classifyGoogleSignInError(err).category);
  };

  useEffect(() => {
    let active = true;

    if (!isBuild110LocalQa() && !Capacitor.isNativePlatform()) {
      void handleGoogleRedirectResult().catch((err) => {
        logSafeAuthError("[GOOGLE REDIRECT AUTH ERROR]", new GoogleSignInFailure(classifyGoogleSignInError(err)));
        if (!active) return;
        setError(getGoogleLoginErrorMessage(err));
      });
    }

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const checkUserAndRoute = async () => {
      if (!authStateResolved || !authUser || profileLoading) return;

      console.info("[LOGIN SUCCESS]", { hasAuthenticatedUser: true });
      trackEvent("login_success", authUser.uid);
      void participationEngine.recordActivity(authUser.uid, "login");
      console.log("[POST LOGIN CHECK] Checking Profile and Blueprint...");

      try {
        // Prefer AuthContext's server-loaded profile over the local mirror; the
        // mirror is cleared on sign-out, so after logout/login it is cold.
        // DS-2C1: getUserProfile now propagates genuine read failures. This cold-mirror
        // fallback stays tolerant (the authoritative server re-check below owns the routing
        // decision); a transient read error here must not by itself force /setup.
        let profile: { uid?: string | null; setupCompleted?: boolean | null } | null =
          (auth?.userProfile as any) ?? (await storageProvider.getUserProfile().catch(() => null));
        const blueprint = await storageProvider.getUserBlueprint();

        let setupCompleted =
          profile?.setupCompleted === true &&
          (profile?.uid == null || profile?.uid === authUser.uid);

        // Build 106 Invariant G/D: do not send an authenticated user with
        // authoritative completed setup to first-time /setup just because the
        // local mirror is cold. Confirm against the server before routing.
        if (!setupCompleted) {
          const server = await userRepository.getUserProfile(authUser.uid).catch(() => null);
          if (server?.setupCompleted === true) {
            profile = server as any;
            setupCompleted = true;
            await storageProvider.saveUserProfile(server as any).catch(() => {});
          }
        }

        // When setup is authoritatively complete the dashboard boot recovers a
        // cold blueprint on its own, so a missing local blueprint is not a
        // reason to bounce the user back through setup.
        const blueprintExists = Boolean(blueprint) || setupCompleted;

        console.log("[POST LOGIN CHECK]", {
          setupCompleted,
          blueprintExists,
        });

        if (setupCompleted && blueprintExists) {
          console.log("[POST LOGIN ROUTE] -> /dashboard");
          router.replace("/dashboard");
        } else {
          console.log("[POST LOGIN ROUTE] -> /setup");
          router.replace("/setup");
        }
      } catch (err) {
        logSafeAuthError("[POST LOGIN ERROR]", err);
        router.replace("/setup");
      }
    };

    void checkUserAndRoute();
  }, [authStateResolved, authUser, profileLoading, router]);

  const handleGoogleLogin = async () => {
    if (isBuild110LocalQa()) return;
    try {
      setLoginLoading(true);
      setError(null);
      setShowRedirectFallback(false);
      console.log("[LOGIN FLOW] Starting Google Auth");
      await signInWithGoogle({ promptSelectAccount: true });
    } catch (err: unknown) {
      logSafeAuthError("[CRITICAL AUTH ERROR]", new GoogleSignInFailure(classifyGoogleSignInError(err)));
      const { code } = classifyGoogleSignInError(err);
      setError(getGoogleLoginErrorMessage(err));
      if (!Capacitor.isNativePlatform()) {
        setShowRedirectFallback(code === "auth/popup-timeout" || code === "auth/popup-blocked");
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleGoogleRedirectLogin = async () => {
    try {
      setLoginLoading(true);
      setError(null);
      await signInWithGoogleRedirect({ promptSelectAccount: true });
    } catch (err) {
      logSafeAuthError("[GOOGLE REDIRECT AUTH ERROR]", new GoogleSignInFailure(classifyGoogleSignInError(err)));
      setError(getGoogleLoginErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  };

  if (authLoading || (authUser && !authStateResolved) || (authUser && profileLoading)) {
    return (
      <div
        className="w-full max-w-sm rounded-[24px] p-8 text-center"
        style={{
          backgroundColor: BHUMI_TOKENS.surface,
          border: `1px solid ${BHUMI_TOKENS.border}`,
          boxShadow: BHUMI_TOKENS.shadowSoft,
        }}
      >
        <p className="text-base font-medium" style={{ color: BHUMI_TOKENS.textPrimary }}>
          {t.login?.verifying || "Memverifikasi akun..."}
        </p>
        <div
          className="mt-6 h-1.5 w-full overflow-hidden rounded-full"
          style={{ backgroundColor: BHUMI_TOKENS.primarySoft }}
        >
          <div
            className="h-full w-2/3 animate-pulse rounded-full"
            style={{ backgroundColor: BHUMI_TOKENS.primary }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-sm space-y-6 rounded-[24px] p-8"
      style={{
        backgroundColor: BHUMI_TOKENS.surface,
        border: `1px solid ${BHUMI_TOKENS.border}`,
        boxShadow: BHUMI_TOKENS.shadowSoft,
      }}
    >
      <div className="text-center">
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            backgroundColor: BHUMI_TOKENS.surface,
            border: `1px solid ${BHUMI_TOKENS.border}`,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <img src="/images/logo.png" alt="Bhumi" className="w-10 h-10 object-contain" />
        </div>
        <h1
          className="text-2xl sm:text-[26px] font-serif font-medium leading-snug tracking-tight"
          style={{ color: BHUMI_TOKENS.textPrimary }}
        >
          Masuk ke Bhumi Amartya
        </h1>
        <p
          className="mt-2 text-sm leading-relaxed"
          style={{ color: BHUMI_TOKENS.textSecondary }}
        >
          Masuk untuk menyimpan profil dan melanjutkan proses pengenalan dirimu.
        </p>
      </div>

      <div className="space-y-4 pt-2">
        {error && (
          <div
            role="alert"
            className="text-sm text-left p-4 rounded-[16px] border border-red-200"
            style={{ backgroundColor: "#FDF4F4", color: "#B91C1C" }}
          >
            <p className="font-semibold mb-0.5">{t.login?.errorTitle || "Login Google belum selesai"}</p>
            <p className="text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {showRedirectFallback && (
          <button
            type="button"
            onClick={handleGoogleRedirectLogin}
            disabled={loginLoading}
            className="w-full min-h-[48px] rounded-[16px] border px-5 py-3 text-sm font-medium transition hover:opacity-80 active:scale-[0.99] disabled:opacity-60"
            style={{
              borderColor: BHUMI_TOKENS.primary,
              color: BHUMI_TOKENS.primary,
              backgroundColor: "transparent",
            }}
          >
            {t.login?.useRedirect || "Gunakan halaman login Google"}
          </button>
        )}

        {!isBuild110LocalQa() && (
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loginLoading}
            className="w-full min-h-[52px] rounded-[16px] font-medium text-white transition-all active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 flex items-center justify-center gap-3"
            style={{
              backgroundColor: BHUMI_TOKENS.primary,
              boxShadow: "0 2px 10px rgba(74, 88, 73, 0.14)",
              outlineColor: BHUMI_TOKENS.primary,
              fontSize: "15px",
            }}
          >
            {loginLoading ? (
              t.login?.connecting || "Menghubungkan..."
            ) : (
              <>
                <div className="w-5 h-5 bg-white rounded-full p-0.5 flex items-center justify-center shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                    <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                    <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                    <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                  </svg>
                </div>
                <span>{t.login?.continueWithGoogle || "Lanjutkan dengan Google"}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Account / Privacy Microcopy */}
      <p
        className="text-center text-xs leading-relaxed px-2"
        style={{ color: BHUMI_TOKENS.textSecondary }}
      >
        Data akun dan profilmu digunakan untuk menyediakan pengalaman personal di Bhumi.
      </p>

      {/* Clickable Legal Links */}
      <p
        className="text-center text-[11px] leading-relaxed px-2"
        style={{ color: BHUMI_TOKENS.textSecondary }}
      >
        Dengan melanjutkan, kamu menyetujui{" "}
        <Link
          href="/syarat-ketentuan"
          className="underline hover:opacity-80 transition-opacity font-medium"
          style={{ color: BHUMI_TOKENS.primary }}
        >
          Ketentuan Layanan
        </Link>{" "}
        dan{" "}
        <Link
          href="/kebijakan-privasi"
          className="underline hover:opacity-80 transition-opacity font-medium"
          style={{ color: BHUMI_TOKENS.primary }}
        >
          Kebijakan Privasi
        </Link>{" "}
        Bhumi Amartya.
      </p>

      {isBuild110LocalQa() ? <Build110LocalLogin /> : <EmulatorQaLogin />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-8"
      style={{
        backgroundColor: BHUMI_TOKENS.canvas,
        paddingTop: "max(2rem, env(safe-area-inset-top))",
        paddingBottom: "max(2rem, env(safe-area-inset-bottom))",
      }}
    >
      <Suspense fallback={<div style={{ color: BHUMI_TOKENS.textSecondary }}>Memuat...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "@/lib/data/translations";
import { Capacitor } from "@capacitor/core";
import {
  GooglePopupTimeoutError,
  handleGoogleRedirectResult,
  signInWithGoogle,
  signInWithGoogleRedirect,
} from "@/lib/auth/authActions";
import { useAuth } from "@/context/AuthContext";
import { storageProvider } from "@/lib/storage/storageProvider";
import { trackEvent } from "@/lib/analytics/usageAnalytics";
import { participationEngine } from "@/lib/engines/participationEngine";
import { EmulatorQaLogin } from "@/components/dev/EmulatorQaLogin";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useLanguage();
  const t = translations[language];
  const nextParam = searchParams.get("next") || "/dashboard";

  const auth = useAuth();
  const authUser = auth?.user;
  const authLoading = auth?.authLoading === true;
  const authStateResolved = auth?.authStateResolved === true;
  const profileLoading = auth?.profileLoading === true;

  const [loginLoading, setLoginLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRedirectFallback, setShowRedirectFallback] = useState(false);

  const getGoogleLoginErrorMessage = (err: unknown): string => {
    const code = (err as { code?: string })?.code;
    if (err instanceof GooglePopupTimeoutError || code === "auth/popup-timeout") {
      return "Google belum merespons. Periksa apakah pop-up diblokir, lalu coba lagi atau gunakan halaman masuk Google.";
    }
    if (code === "auth/popup-blocked") {
      return "Pop-up Google diblokir oleh browser. Gunakan halaman masuk Google atau izinkan pop-up untuk aplikasi ini.";
    }
    if (code === "auth/popup-closed-by-user") {
      return "Jendela masuk Google ditutup sebelum proses selesai. Silakan coba lagi.";
    }
    return "Masuk dengan Google belum berhasil. Periksa koneksi lalu coba lagi.";
  };

  useEffect(() => {
    let active = true;

    if (!Capacitor.isNativePlatform()) {
      void handleGoogleRedirectResult().catch((err) => {
        console.error("[GOOGLE REDIRECT AUTH ERROR]", err);
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

      console.log("[LOGIN SUCCESS] UID:", authUser.uid);
      trackEvent("login_success", authUser.uid);
      void participationEngine.recordActivity(authUser.uid, "login");
      console.log("[POST LOGIN CHECK] Checking Profile and Blueprint...");

      try {
        const profile = await storageProvider.getUserProfile();
        const blueprint = await storageProvider.getUserBlueprint();

        const setupCompleted = profile?.setupCompleted === true;
        const blueprintExists = Boolean(blueprint);

        console.log("[POST LOGIN CHECK]", {
          uid: authUser.uid,
          setupCompleted,
          blueprintExists,
          nextParam
        });

        if (setupCompleted && blueprintExists) {
          console.log("[POST LOGIN ROUTE] -> /dashboard");
          router.replace("/dashboard");
        } else {
          console.log("[POST LOGIN ROUTE] -> /setup");
          router.replace("/setup");
        }
      } catch (err) {
        console.error("[POST LOGIN ERROR]", err);
        router.replace("/setup");
      }
    };

    void checkUserAndRoute();
  }, [authStateResolved, authUser, profileLoading, router, nextParam]);

  const handleGoogleLogin = async () => {
    try {
      setLoginLoading(true);
      setError(null);
      setShowRedirectFallback(false);
      console.log("[LOGIN FLOW] Starting Google Auth");
      await signInWithGoogle({ promptSelectAccount: true });
    } catch (err: unknown) {
      console.error("[CRITICAL AUTH ERROR - RAW]", err);
      const code = (err as { code?: string })?.code;
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
      console.error("[GOOGLE REDIRECT AUTH ERROR]", err);
      setError(getGoogleLoginErrorMessage(err));
    } finally {
      setLoginLoading(false);
    }
  };

  if (authLoading || (authUser && !authStateResolved) || (authUser && profileLoading)) {
    return (
      <div className="bhumi-card w-full max-w-md p-10 text-center">
        <p className="text-[#4F5E52] text-lg">Memverifikasi akun...</p>
        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#E8E9E5]">
          <div className="h-full w-3/4 animate-pulse rounded-full bg-[#4F5E52]" />
        </div>
      </div>
    );
  }

  return (
    <div className="bhumi-card w-full max-w-md space-y-8 p-10">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
          <img src="/images/logo.png" alt="Bhumi" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-3xl font-serif text-[#4F5E52]">{t.welcome.title}</h1>
        <p className="mt-4 text-[#7B8776] leading-relaxed">
          Masuk untuk melanjutkan perjalanan pengenalan dirimu.
        </p>
      </div>

      <div className="space-y-4 pt-4">
        {error && (
          <div className="text-red-600 text-sm text-left bg-red-50 p-4 rounded-2xl border border-red-100">
            <p className="font-bold mb-1">Masuk dengan Google belum selesai</p>
            {error}
          </div>
        )}

        {showRedirectFallback && (
          <button
            type="button"
            onClick={handleGoogleRedirectLogin}
            disabled={loginLoading}
            className="w-full rounded-full border border-[#4F5E52] px-6 py-3 text-[#4F5E52] font-medium transition hover:bg-[#F3F5F1] disabled:opacity-60"
          >
            Gunakan halaman masuk Google
          </button>
        )}

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loginLoading}
          className="w-full rounded-full bg-[#4F5E52] px-6 py-4 text-white font-medium shadow-lg transition hover:bg-[#3e4b42] disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {loginLoading ? (
            "Menghubungkan..."
          ) : (
            <>
              <div className="w-5 h-5 bg-white rounded-full p-0.5 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-full h-full">
                  <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                  <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                  <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                  <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                </svg>
              </div>
              Lanjutkan dengan Google
            </>
          )}
        </button>
      </div>

      <p className="text-center text-xs text-[#7B8776] leading-relaxed px-4">
        Dengan melanjutkan, kamu menyetujui Ketentuan Layanan dan Kebijakan Privasi Bhumi Amartya.
      </p>

      <EmulatorQaLogin />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6 py-10">
      <Suspense fallback={<div>Loading...</div>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}

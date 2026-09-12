"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/app/context/LanguageContext";
import { decideLandingCtaRoute } from "@/lib/auth/landingCtaRoute";
import { translations } from "@/lib/data/translations";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();
  const { language } = useLanguage();
  const t = translations[language] || translations["en"];
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    if (auth?.loading) {
      const timer = setTimeout(() => {
        setShowFallback(true);
      }, 10000); // 10 seconds
      return () => clearTimeout(timer);
    } else {
      setShowFallback(false);
    }
  }, [auth?.loading]);

  useEffect(() => {
    console.log("[LANDING RENDER]", {
      resolved: auth?.authStateResolved,
      hasUser: !!auth?.user,
      setupCompleted: auth?.userProfile?.setupCompleted
    });

    // Auto-redirect if already logged in and setup completed
    if (auth?.authStateResolved && !auth?.profileLoading && auth?.user && auth?.userProfile?.setupCompleted) {
      console.log("[LANDING AUTO-REDIRECT] Authenticated & Setup Completed -> /dashboard");
      router.replace("/dashboard");
    }
  }, [auth?.authStateResolved, auth?.profileLoading, auth?.user, auth?.userProfile?.setupCompleted, router]);

  // Both CTAs share one canonical decision. A failed profile READ (profileError)
  // is never treated as "profile missing" -> an existing user is not sent to
  // first-time /setup; they re-authenticate instead (READ ERROR != MISSING).
  const routeFromLandingCta = (loginNext: string) => {
    const decision = decideLandingCtaRoute({
      authLoading: auth?.loading,
      profileLoading: auth?.profileLoading,
      authUser: auth?.user,
      profile: auth?.userProfile,
      profileError: auth?.profileError,
    });
    console.log("[LANDING ROUTE DECISION]", decision);
    switch (decision) {
      case "wait":
        return;
      case "login":
        router.push(`/login?next=${loginNext}`);
        return;
      case "reauth":
        router.push("/login?next=/dashboard");
        return;
      case "dashboard":
        router.push("/dashboard");
        return;
      case "setup":
        router.push("/setup");
        return;
    }
  };

  const handleMulai = () => {
    console.log("[LANDING CTA] Mulai Perjalanan");
    routeFromLandingCta("/setup");
  };

  const handlePunyaAkun = () => {
    console.log("[LANDING CTA] Saya Sudah Punya Akun");
    routeFromLandingCta("/dashboard");
  };

  if (auth?.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <div className="flex flex-col items-center">
           {!showFallback ? (
             <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4F5E52]/10 rounded-full mb-4"></div>
                <p className="text-[#4F5E52] text-sm font-medium">{t.welcome?.connecting || "Connecting your journey..."}</p>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-4 text-center px-6 max-w-xs">
                <p className="text-[#4F5E52] text-sm font-medium">{t.welcome?.connectionSlow || "Connection seems slow or session was interrupted."}</p>
                <div className="flex gap-2 w-full">
                  <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-[#4F5E52] text-white rounded-xl text-xs font-bold uppercase tracking-wider">{t.welcome?.reload || "Try Again"}</button>
                  <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="flex-1 py-3 border border-[#4F5E52] text-[#4F5E52] rounded-xl text-xs font-bold uppercase tracking-wider">{t.welcome?.relogin || "Sign In Again"}</button>
                </div>
             </div>
           )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAF5] px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-8">
        <img src="/images/logo.png" alt="Bhumi" className="w-14 h-14 object-contain" />
      </div>

      <h1 className="text-4xl font-serif text-[#4F5E52] mb-4">{t.welcome?.title || "Bhumi Amartya"}</h1>

      <p className="max-w-xs text-[#7B8776] leading-relaxed mb-12">
        {t.welcome?.subtitle || "A space to return home, understand yourself, and grow gently."}
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleMulai}
          className="bhumi-button w-full"
        >
          {t.welcome?.newUser || "I Am New Here"}
        </button>

        <button
          onClick={handlePunyaAkun}
          className="w-full rounded-2xl border border-[#4F5E52] bg-white px-5 py-4 font-semibold text-[#4F5E52] transition hover:bg-[#F5F1E8]"
        >
          {t.welcome?.returningUser || "I Already Have an Account"}
        </button>
      </div>


    </main>
  );
}

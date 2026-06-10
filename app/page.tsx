"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();

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

  const handleMulai = () => {
    if (auth?.loading) return;

    console.log("[LANDING CTA] Mulai Perjalanan");
    if (!auth?.user) {
      console.log("[LANDING ROUTE DECISION] No Auth -> /login?next=/setup");
      router.push("/login?next=/setup");
    } else if (auth?.userProfile?.setupCompleted) {
      console.log("[LANDING ROUTE DECISION] Setup Completed -> /dashboard");
      router.push("/dashboard");
    } else {
      console.log("[LANDING ROUTE DECISION] Setup Incomplete -> /setup");
      router.push("/setup");
    }
  };

  const handlePunyaAkun = () => {
    if (auth?.loading) return;

    console.log("[LANDING CTA] Saya Sudah Punya Akun");
    if (!auth?.user) {
      console.log("[LANDING ROUTE DECISION] No Auth -> /login?next=/dashboard");
      router.push("/login?next=/dashboard");
    } else if (auth?.userProfile?.setupCompleted) {
      console.log("[LANDING ROUTE DECISION] Setup Completed -> /dashboard");
      router.push("/dashboard");
    } else {
      console.log("[LANDING ROUTE DECISION] Setup Incomplete -> /setup");
      router.push("/setup");
    }
  };

  if (auth?.loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5]">
        <div className="animate-pulse flex flex-col items-center">
           <div className="w-16 h-16 bg-[#4F5E52]/10 rounded-full mb-4"></div>
           <p className="text-[#4F5E52] text-sm font-medium">Menghubungkan perjalanan...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#FCFAF5] px-6 text-center">
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg mb-8">
        <img src="/images/logo.png" alt="Bhumi" className="w-14 h-14 object-contain" />
      </div>

      <h1 className="text-4xl font-serif text-[#4F5E52] mb-4">Bhumi Amartya</h1>

      <p className="max-w-xs text-[#7B8776] leading-relaxed mb-12">
        Ruang harian untuk mengenali diri, membaca ritme hidup, dan menjalani innerwork sesuai blueprint-mu.
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleMulai}
          className="bhumi-button w-full"
        >
          Mulai Perjalanan
        </button>

        <button
          onClick={handlePunyaAkun}
          className="w-full py-4 text-[#4F5E52] font-medium text-sm hover:underline"
        >
          Saya Sudah Punya Akun
        </button>
      </div>

      {/* P1 AUDIT BYPASS */}
      {process.env.NODE_ENV === "development" && (
        <div className="mt-8 flex gap-2 flex-wrap justify-center">
          <button
            onClick={() => {
              localStorage.setItem("bhumi_audit_user", "widhi");
              router.push("/dashboard?audit=widhi");
            }}
            className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold"
          >
            AUDIT: WIDHI
          </button>
          <button
            onClick={() => {
              localStorage.setItem("bhumi_audit_user", "sheina");
              router.push("/dashboard?audit=sheina");
            }}
            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold"
          >
            AUDIT: SHEINA
          </button>
          <button
            onClick={() => {
              localStorage.setItem("bhumi_audit_user", "amartya");
              router.push("/dashboard?audit=amartya");
            }}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold"
          >
            AUDIT: AMARTYA
          </button>
        </div>
      )}

      <p className="mt-12 text-[10px] text-[#7B8776]/50 uppercase tracking-widest font-mono">
        Closed Beta v1.0
      </p>
    </main>
  );
}

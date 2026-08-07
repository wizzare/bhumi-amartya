"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const router = useRouter();
  const auth = useAuth();
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
        <div className="flex flex-col items-center">
           {!showFallback ? (
             <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-[#4F5E52]/10 rounded-full mb-4"></div>
                <p className="text-[#4F5E52] text-sm font-medium">Menghubungkan perjalanan...</p>
             </div>
           ) : (
             <div className="flex flex-col items-center gap-4 text-center px-6 max-w-xs">
                <p className="text-[#4F5E52] text-sm font-medium">Sepertinya koneksi melambat atau sesi terganggu.</p>
                <div className="flex gap-2 w-full">
                  <button onClick={() => window.location.reload()} className="flex-1 py-3 bg-[#4F5E52] text-white rounded-xl text-xs font-bold uppercase tracking-wider">Coba Lagi</button>
                  <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="flex-1 py-3 border border-[#4F5E52] text-[#4F5E52] rounded-xl text-xs font-bold uppercase tracking-wider">Masuk Ulang</button>
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

      <h1 className="text-4xl font-serif text-[#4F5E52] mb-4">Bhumi Amartya</h1>

      <p className="max-w-xs text-[#7B8776] leading-relaxed mb-12">
        Ruang Untuk Pulang dan Kenali Diri
      </p>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button
          onClick={handleMulai}
          className="bhumi-button w-full"
        >
          Pengguna Baru
        </button>

        <button
          onClick={handlePunyaAkun}
          className="w-full rounded-2xl border border-[#4F5E52] bg-white px-5 py-4 font-semibold text-[#4F5E52] transition hover:bg-[#F5F1E8]"
        >
          Saya Sudah Punya Akun
        </button>
      </div>

      <div className="mt-12 pb-[calc(1rem+env(safe-area-inset-bottom))] text-center">
        <p className="text-xs text-[#7B8776]">
          Indonesia | English
        </p>
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, RefreshCw, ArrowLeft, Activity } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { diagnosticRepository, GoogleSignInFailureEvent } from "@/lib/repositories/diagnosticRepository";

export default function AdminDiagnosticsPage() {
  const auth = useAuth();
  const profile = auth?.userProfile;

  const [failures, setFailures] = useState<GoogleSignInFailureEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFounder = profile?.guardianRole === "founder" || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com";

  const fetchFailures = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await diagnosticRepository.getGoogleSignInFailures();
      setFailures(data);
    } catch (err) {
      console.error("Failed to load diagnostics:", err);
      setError("Gagal memuat data diagnostik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFounder) {
      void fetchFailures();
    }
  }, [isFounder]);

  if (auth?.authLoading || auth?.profileLoading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <p className="text-[#7B8776] animate-pulse font-medium">Memverifikasi Akses Founder...</p>
      </main>
    );
  }

  if (!auth?.user || !isFounder) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bhumi-card p-10 text-center bg-white border border-[#E8E9E5] rounded-[2rem] shadow-sm">
          <ShieldAlert size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#4F5E52]">Akses Ditolak</h1>
          <p className="mt-3 text-[#7B8776]">Halaman ini hanya tersedia untuk Founder Bhumi.</p>
          <Link href="/dashboard" className="bhumi-button mt-8 inline-flex px-6 py-2.5 bg-[#4F5E52] text-white rounded-xl text-xs font-bold uppercase tracking-wider">
            Kembali ke Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] text-[#4F6658] pb-32">
      <header className="pt-12 pb-8 px-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard" className="p-2 rounded-full hover:bg-black/5 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-4xl font-serif font-bold text-[#4F6658]">Auth Diagnostics</h1>
        </div>

        <div className="flex items-center justify-between">
            <p className="text-sm text-[#7B8776]">Menampilkan kegagalan Google Sign-In terbaru</p>
            <button
                onClick={() => void fetchFailures()}
                className="p-3 rounded-xl bg-white border border-[#E8E9E5] text-[#4F6658] hover:bg-[#F5F1E8] transition-colors"
            >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 space-y-6">
        {error && (
          <div className="p-5 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-[#7B8776] font-medium animate-pulse">
            Memuat data diagnostik...
          </div>
        ) : failures.length === 0 ? (
          <div className="py-20 text-center text-[#9AA394] italic border-2 border-dashed border-[#E8E9E5] rounded-3xl bg-white">
            Belum ada kegagalan Google Sign-In terekam.
          </div>
        ) : (
          <div className="space-y-4">
            {failures.map((event) => (
              <div key={event.id} className="bg-white p-6 rounded-[2rem] border border-[#E8E9E5] shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-bold uppercase tracking-wider mb-2">
                      {event.category}
                    </span>
                    <h3 className="text-lg font-bold text-[#4F5E52]">{event.stage}</h3>
                    <p className="text-xs text-[#9AA394] font-mono">
                      {event.timestamp?.toDate?.().toLocaleString() || "N/A"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#4F5E52]">Code: {event.code || "N/A"}</p>
                    <p className="text-[10px] text-[#7B8776] uppercase tracking-widest">Build {event.versionCode}</p>
                  </div>
                </div>

                <div className="bg-[#FCFAF5] p-4 rounded-2xl space-y-2 text-xs border border-[#F5F1E8]">
                  <p className="text-[#4F5E52] leading-relaxed break-words font-mono">{event.message}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px]">
                  <div>
                    <p className="text-[#9AA394] uppercase tracking-widest font-bold">Android</p>
                    <p className="font-semibold text-[#4F5E52]">{event.androidVersion || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#9AA394] uppercase tracking-widest font-bold">Device</p>
                    <p className="font-semibold text-[#4F5E52] truncate" title={event.deviceModel || ""}>{event.deviceModel || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-[#9AA394] uppercase tracking-widest font-bold">Locale</p>
                    <p className="font-semibold text-[#4F5E52]">{event.locale}</p>
                  </div>
                  <div>
                    <p className="text-[#9AA394] uppercase tracking-widest font-bold">CredMgr</p>
                    <p className="font-semibold text-[#4F5E52]">{event.credentialManagerEnabled ? "Enabled" : "Disabled"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

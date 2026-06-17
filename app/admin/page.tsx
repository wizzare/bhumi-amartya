"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MonitorSmartphone, ShieldCheck, Settings } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { CoreGuardianValidation } from "@/components/admin/CoreGuardianValidation";
import { useAuth } from "@/context/AuthContext";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { BuildInfo, getRuntimeBuildInfo } from "@/lib/config/buildInfo";
import { RELEASE_NAME } from "@/src/lib/version";

export default function AdminPage() {
  const auth = useAuth();
  const profile = auth?.userProfile;
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const hasAdminAccess = profile?.guardianRole === "founder"
    || profile?.guardianRole === "admin"
    || profile?.email?.trim().toLowerCase() === "wizzare@gmail.com";

  useEffect(() => {
    void getRuntimeBuildInfo().then(setBuildInfo);
  }, []);

  if (auth?.authLoading || auth?.profileLoading) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] flex items-center justify-center">
        <p className="text-[#7B8776] animate-pulse font-medium">Membuka Founder Dashboard...</p>
      </main>
    );
  }

  if (!auth?.user || !hasAdminAccess) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 flex items-center justify-center">
        <div className="max-w-md w-full bhumi-card p-10 text-center bg-white">
          <ShieldCheck size={48} className="mx-auto text-red-400 mb-4" />
          <h1 className="text-2xl font-serif font-bold text-[#4F5E52]">Akses Ditolak</h1>
          <p className="mt-3 text-[#7B8776]">Ruang ini hanya tersedia untuk Founder dan Admin Bhumi.</p>
          <Link href="/dashboard" className="bhumi-button mt-8 inline-flex">Kembali ke Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] text-[#4F5E52] pb-32">
      <AppNav />

      <header className="pt-12 pb-8 px-6 max-w-4xl mx-auto">
        <BhumiPageHeader className="mb-8 justify-start" />
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[#4F5E52] text-white shadow-sm">
            <Settings size={18} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B8776]">Ruang Internal Founder</p>
        </div>
        <h1 className="text-4xl font-serif font-bold text-[#4F6658]">Founder Dashboard</h1>
        <div className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-[#DDE4DA] bg-white px-4 py-3 shadow-sm">
          <MonitorSmartphone size={18} className="text-[#4F6658]" />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#9AA394]">Versi Terpasang</p>
            <p className="mt-0.5 text-sm font-bold text-[#4F6658]">
              {RELEASE_NAME} · v{buildInfo?.versionName ?? "..."} · Build {buildInfo?.buildNumber ?? "..."}
            </p>
            <p className="mt-0.5 text-[10px] text-[#7B8776]">
              Version Code {buildInfo?.versionCode ?? "..."} · {buildInfo?.platform ?? "..."}
            </p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6">
        <CoreGuardianValidation founderUid={auth.user.uid} />
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { App } from "@capacitor/app";
import { checkAppUpdateStatus, completeFlexibleUpdate, resumeImmediateUpdate, startFlexibleUpdate, startImmediateUpdate, type AppUpdateStatus } from "@/lib/services/appUpdateService";
import { UpdateRequiredScreen } from "./UpdateRequiredScreen";
import { CURRENT_VERSION_NAME } from "@/lib/config/buildInfo";

// simple version comparison
function compareVersions(a: string, b: string) {
  const pa = a.split('.').map(v => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);
  const pb = b.split('.').map(v => parseInt(v.replace(/[^0-9]/g, ''), 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function VersionChecker({ children }: { children: React.ReactNode }) {
  const [updateStatus, setUpdateStatus] = useState<AppUpdateStatus | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [updateAction, setUpdateAction] = useState<"idle" | "starting" | "completing" | "failed">("idle");

  useEffect(() => {
    let disposed = false;
    async function check() {
      try {
        const status = await checkAppUpdateStatus();
        if (disposed) return;
        setUpdateStatus(status);

        if (status.nativeState === "downloaded") setIsOptionalOpen(true);
        else if (status.nativeState === "available") setIsOptionalOpen(true);
        else if (status.nativeState === "immediate_in_progress") setIsOptionalOpen(false);
        else if (!status.isOutdated) {
          const latestVer = status.latestVersion || "0.0.0";
          if (compareVersions(CURRENT_VERSION_NAME, latestVer) < 0) {
            setIsOptionalOpen(true);
          }
        }
      } catch (err) {
        console.warn("[VERSION CHECKER] Failed to check for updates:", err);
      } finally {
        if (!disposed) setIsChecking(false);
      }
    }
    void check();
    let appStateHandle: { remove: () => Promise<void> } | undefined;
    void App.addListener("appStateChange", ({ isActive }) => {
      if (!isActive) return;
      void resumeImmediateUpdate();
      void check();
    }).then((handle) => { appStateHandle = handle; });
    return () => { disposed = true; void appStateHandle?.remove(); };
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#FCFAF5]" />
    );
  }

  if (!updateStatus) return <>{children}</>;

  // 1. FORCED UPDATE (Blocker)
  if (updateStatus.isOutdated && updateStatus.nativeState !== "immediate_required") {
    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-6">
        <UpdateRequiredScreen
          updateUrl={updateStatus.updateUrl}
          currentBuild={updateStatus.currentBuild}
          minimumBuild={updateStatus.minimumBuild}
        />
      </div>
    );
  }

  if (updateStatus.nativeState === "immediate_required" || updateStatus.nativeState === "immediate_in_progress") {
    return (
      <div className="min-h-screen bg-[#FCFAF5] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white p-6 rounded-3xl shadow-xl text-center border border-[#E8E9E5]">
          <h2 className="text-xl font-bold text-[#4F5E52] mb-3">Pembaruan wajib tersedia</h2>
          <p className="text-sm text-[#7B8776] mb-6">Perbarui aplikasi melalui Google Play untuk melanjutkan.</p>
          <button type="button" disabled={updateAction === "starting" || updateStatus.nativeState === "immediate_in_progress"} onClick={async () => { setUpdateAction("starting"); const result = await startImmediateUpdate(); if (result === "failed") setUpdateAction("failed"); }} className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm">
            {updateStatus.nativeState === "immediate_in_progress" ? "Pembaruan sedang berjalan…" : updateAction === "starting" ? "Membuka Google Play…" : "Perbarui Sekarang"}
          </button>
          {updateAction === "failed" ? <p className="text-sm text-[#A85B4B] mt-3">Pembaruan belum dapat dimulai. Coba lagi saat Google Play tersedia.</p> : null}
        </div>
      </div>
    );
  }

  // 2. OPTIONAL UPDATE (Modal)
  if (isOptionalOpen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="max-w-sm w-full bg-white p-6 rounded-3xl shadow-xl text-center border border-[#E8E9E5]">
          <h2 className="text-xl font-bold text-[#4F5E52] mb-3">Versi terbaru tersedia</h2>
          <p className="text-sm text-[#7B8776] mb-6">Versi {updateStatus.latestVersion} telah tersedia. Dapatkan fitur terbaru dan pengalaman yang lebih baik.</p>
          <div className="flex flex-col gap-2">
            {updateStatus.nativeState === "downloaded" ? (
              <button type="button" disabled={updateAction === "completing"} onClick={async () => { setUpdateAction("completing"); const result = await completeFlexibleUpdate(); if (result === "failed") setUpdateAction("failed"); }} className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm">{updateAction === "completing" ? "Menyelesaikan…" : "Selesaikan pembaruan"}</button>
            ) : updateStatus.nativeState === "available" ? (
              <button type="button" disabled={updateAction === "starting"} onClick={async () => { setUpdateAction("starting"); const result = await startFlexibleUpdate(); if (result === "failed") { setUpdateAction("failed"); setIsOptionalOpen(false); } }} className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm">{updateAction === "starting" ? "Mengunduh…" : "Perbarui Sekarang"}</button>
            ) : (
              <a href={updateStatus.updateUrl} target="_blank" rel="noopener noreferrer" className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm text-center">Perbarui Sekarang</a>
            )}
            <button
              onClick={() => setIsOptionalOpen(false)}
              className="block w-full text-[#7B8776] py-3 text-sm font-medium hover:bg-black/5 rounded-2xl transition-colors"
            >
              Nanti
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}


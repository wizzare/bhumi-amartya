"use client";

import { useEffect, useState } from "react";
import { checkAppUpdateStatus, type AppUpdateStatus } from "@/lib/services/appUpdateService";
import { UpdateRequiredScreen } from "./UpdateRequiredScreen";
import { CURRENT_VERSION_NAME } from "@/lib/config/buildInfo";
import { useAuth } from "@/context/AuthContext";
import { isPrivilegedUser } from "@/lib/auth/privilegedUser";

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

export function VersionChecker() {
  const auth = useAuth();
  const [updateStatus, setUpdateStatus] = useState<AppUpdateStatus | null>(null);
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);

  useEffect(() => {
    async function check() {
      try {
        const status = await checkAppUpdateStatus();
        setUpdateStatus(status);

        if (!status.isOutdated) {
          const latestVer = status.latestVersion || "0.0.0";
          if (compareVersions(CURRENT_VERSION_NAME, latestVer) < 0) {
            setIsOptionalOpen(true);
          }
        }
      } catch (err) {
        console.warn("[VERSION CHECKER] Failed to check for updates:", err);
      }
    }
    check();
  }, []);

  // FOUNDER/ADMIN BYPASS
  // If the user is privileged, we don't show the update screen even if outdated.
  // This ensures founders can always access the app for debugging/audit.
  if (isPrivilegedUser((auth?.userProfile || auth?.user) ?? null)) {
    console.info("[VERSION CHECKER] Privileged user detected, bypassing gate.");
    return null;
  }

  if (!updateStatus) return null;

  // 1. FORCED UPDATE (Blocker)
  if (updateStatus.isOutdated) {
    return (
      <div className="fixed inset-0 z-[10000] bg-[#FCFAF5] flex items-center justify-center p-6">
        <UpdateRequiredScreen
          updateUrl={updateStatus.updateUrl}
          currentBuild={updateStatus.currentBuild}
          minimumBuild={updateStatus.minimumBuild}
        />
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
            <a
              href={updateStatus.updateUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm hover:bg-[#3d4a40] transition-colors text-center"
            >
              Perbarui Sekarang
            </a>
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

  return null;
}


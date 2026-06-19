"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { APP_VERSION } from "@/src/lib/version";

// simple version comparison
function compareVersions(a: string, b: string) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const na = pa[i] || 0;
    const nb = pb[i] || 0;
    if (na > nb) return 1;
    if (na < nb) return -1;
  }
  return 0;
}

export function VersionChecker() {
  const [updateConfig, setUpdateConfig] = useState<any>(null);
  const [isOptionalOpen, setIsOptionalOpen] = useState(false);
  const [isForceUpdate, setIsForceUpdate] = useState(false);

  useEffect(() => {
    async function checkVersion() {
      try {
        const snap = await getDoc(doc(db, "app_config", "version"));
        if (snap.exists()) {
          const data = snap.data();
          setUpdateConfig(data);
          
          const force = compareVersions(APP_VERSION, data.minimumVersion) < 0 || data.forceUpdate;
          if (force) {
            setIsForceUpdate(true);
          } else if (compareVersions(APP_VERSION, data.currentVersion) < 0) {
            setIsOptionalOpen(true);
          }
        }
      } catch (err) {
        // Offline Mode or Firestore Read Failure: fail silently, allow app usage
        console.warn("Could not check for updates:", err);
      }
    }
    checkVersion();
  }, []);

  if (!updateConfig) return null;

  if (isForceUpdate) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#FCFAF5] flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white p-6 rounded-3xl shadow-xl text-center border border-[#E8E9E5]">
          <h2 className="text-xl font-bold text-[#4F5E52] mb-3">Versi aplikasi sudah tidak didukung.</h2>
          <p className="text-sm text-[#7B8776] mb-6">Harap perbarui aplikasi ke versi terbaru untuk melanjutkan.</p>
          <a 
            href={updateConfig.updateUrl || "#"} 
            className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm hover:bg-[#3d4a40] transition-colors"
          >
            Perbarui Aplikasi
          </a>
        </div>
      </div>
    );
  }

  if (isOptionalOpen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/40 flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="max-w-sm w-full bg-white p-6 rounded-3xl shadow-xl text-center border border-[#E8E9E5]">
          <h2 className="text-xl font-bold text-[#4F5E52] mb-3">Versi terbaru tersedia</h2>
          <p className="text-sm text-[#7B8776] mb-6">Versi {updateConfig.currentVersion} telah tersedia. Dapatkan fitur terbaru dan pengalaman yang lebih baik.</p>
          <div className="flex flex-col gap-2">
            <a 
              href={updateConfig.updateUrl || "#"} 
              className="block w-full bg-[#4F5E52] text-white rounded-2xl py-3 font-semibold text-sm hover:bg-[#3d4a40] transition-colors"
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

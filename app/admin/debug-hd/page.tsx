"use client";

import React, { useState } from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { useAuth } from "@/context/AuthContext";
import { FounderDebugHD } from "@/components/admin/FounderDebugHD";
import { storageProvider } from "@/lib/storage/storageProvider";
import { calculateHumanDesign } from "@/lib/humandesign/calculateHumanDesign";
import { RefreshCw, Search } from "lucide-react";

export default function HDDebugPage() {
  const auth = useAuth();
  const [blueprint, setBlueprint] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFounder = auth?.userProfile?.guardianRole === "founder" || auth?.userProfile?.email === "wizzare@gmail.com";

  if (!isFounder) return <div className="p-20 text-center">Unauthorized</div>;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const b = await storageProvider.getUserBlueprint();
      if (!b) throw new Error("No blueprint found for active session.");
      setBlueprint(b);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const forceRecalculate = async () => {
    if (!auth?.userProfile) return;
    setLoading(true);
    try {
      const nextHD = await calculateHumanDesign({
        birthDate: auth.userProfile.birthDate,
        birthTime: auth.userProfile.birthTime,
        birthCity: auth.userProfile.birthCity,
        timezone: auth.userProfile.timezone,
        latitude: auth.userProfile.latitude,
        longitude: auth.userProfile.longitude,
      });

      setBlueprint((prev: any) => ({ ...prev, humanDesign: nextHD }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFAF5] pb-32">
      <AppNav />
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <h1 className="text-3xl font-bold text-[#4F5E52] mb-6 flex items-center gap-3">
          <Search size={28} /> HD Accuracy Debugger
        </h1>

        <div className="flex gap-4 mb-10">
          <button
            onClick={loadData}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-white border border-[#E8E9E5] font-bold text-xs uppercase tracking-widest hover:bg-[#F5F1E8]"
          >
            Load Current Data
          </button>

          <button
            onClick={forceRecalculate}
            disabled={loading || !blueprint}
            className="px-6 py-3 rounded-2xl bg-[#4F5E52] text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-[#3D4A40]"
          >
            {loading ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Force Full Calculation
          </button>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-2xl mb-8 border border-red-100 font-medium">
            Error: {error}
          </div>
        )}

        {blueprint?.humanDesign && (
          <FounderDebugHD hd={blueprint.humanDesign} />
        )}

        {!blueprint && !loading && (
          <div className="py-20 text-center text-[#9AA394] italic border-2 border-dashed border-[#E8E9E5] rounded-[3rem]">
            Klik 'Load Current Data' untuk memulai audit.
          </div>
        )}
      </div>
    </main>
  );
}

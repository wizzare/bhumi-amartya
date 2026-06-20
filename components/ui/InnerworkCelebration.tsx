"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { safeJsonParse } from "@/lib/storage/safeJson";

interface InnerworkCelebrationProps {
  isOpen: boolean;
}

export function InnerworkCelebration({ isOpen }: InnerworkCelebrationProps) {
  const router = useRouter();
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      const today = new Date().toISOString().slice(0, 10);

      const journalEntries = safeJsonParse<any[]>(localStorage.getItem("bhumiJournalEntries"), []);
      const meditationEntries = safeJsonParse<any[]>(localStorage.getItem("bhumiMeditationEntries"), []);
      const audioEntries = safeJsonParse<any[]>(localStorage.getItem("bhumiAudioHealingEntries"), []);

      const count = [
        ...journalEntries.filter(e => e.date === today),
        ...meditationEntries.filter(e => e.date === today),
        ...audioEntries.filter(e => e.date === today),
      ].length;

      setSessionCount(count);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-md scale-up-center rounded-[32px] bg-white p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F1E8] text-4xl">
          🌱
        </div>

        <h2 className="text-2xl font-semibold text-[#4F5E52]">
          Praktik berhasil disimpan 🌱
        </h2>

        <p className="mt-4 leading-relaxed text-[#7B8776]">
          Kamu sudah menyelesaikan sesi hari ini. Pelan-pelan, langkah kecil seperti ini yang membentuk perubahan besar.
        </p>

        {sessionCount >= 2 && (
          <p className="mt-4 font-medium text-[#4F5E52] bg-[#F5F1E8] p-4 rounded-2xl">
            Kamu sudah menyelesaikan beberapa sesi. Terima kasih sudah tetap hadir untuk dirimu sendiri.
          </p>
        )}

        <button
          type="button"
          onClick={() => router.push("/wellness")}
          className="bhumi-button mt-8 w-full"
        >
          Kembali ke Wellness
        </button>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppNav } from "@/components/navigation/AppNav";
import { FeatureLocked } from "@/components/billing/FeatureLocked";
import { hasFeatureAccess } from "@/lib/billing/accessControl";
import { resolveActiveProfile } from "@/lib/auth/resolveActiveProfile";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { useAuth } from "@/context/AuthContext";
import {
  createWeeklySoulReportFromStorage,
  formatWeeklyRange,
  hasWeeklySoulReportData,
  type WeeklySoulReportOutput,
} from "@/lib/reports/createWeeklySoulReport";
import { syncDerivedCacheFromStorageProvider } from "@/lib/storage/syncDerivedCache";

export default function WeeklyReportPage() {
  const auth = useAuth();
  const [report, setReport] = useState<WeeklySoulReportOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [locked, setLocked] = useState(false);
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);

  useEffect(() => {
    const initialize = async () => {
    try {
      const resolved = await resolveActiveProfile(auth);
      if (resolved.isLoading) return;
      if (resolved.isMissing) {
        setLoading(false);
        return;
      }
      const record = await getFounderTesterRecord((resolved.profile as any)?.uid).catch(() => null);
      setTesterRecord(record);
      setLocked(!hasFeatureAccess(resolved.profile as any, "weeklyReport", new Date(), record));
      await syncDerivedCacheFromStorageProvider({
        profile: resolved.profile as object,
        source: "weeklyReport",
      });
      const data = createWeeklySoulReportFromStorage();
      console.log("[WEEKLY REPORT SOURCE]", {
        source: "weekly-report-page",
        profileUid: (resolved.profile as { uid?: string } | null)?.uid ?? null,
        reportUid: data?.uid ?? null,
        totalJournal: data?.totalJournal ?? 0,
        totalMeditation: data?.totalMeditation ?? 0,
        totalAudioHealing: data?.totalAudioHealing ?? 0,
      });
      setReport(data);
    } catch (e) {
      console.error("Failed to generate report", e);
    } finally {
      setLoading(false);
    }
    };
    void initialize();
  }, [auth]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="rounded-3xl bg-white p-8 shadow-xl text-center max-w-md w-full">
          <p className="text-[#4F5E52] text-lg">Menyusun Laporan Jiwa Mingguan...</p>
        </div>
      </main>
    );
  }

  if (locked) {
    return <FeatureLocked />;
  }

  if (!report) {
    return (
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-24">
        <AppNav />
        <div className="mx-auto max-w-md text-center">
          <p className="text-[#7B8776]">Gagal memuat laporan. Silakan coba kembali.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-10 pb-28">
      <AppNav />
      <div className="mx-auto max-w-md space-y-6">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#4F5E52]">Laporan Mingguan Jiwa</h1>
          <p className="mt-2 text-[#7B8776]">Ringkasan perjalanan innerwork kamu selama 7 hari terakhir.</p>
          <p className="mt-1 text-sm text-[#9AA69A]">{formatWeeklyRange(report)}</p>
        </header>

        {!hasWeeklySoulReportData(report) ? (
          <div className="bhumi-card p-8 text-center bg-white/70 border border-dashed border-[#4F5E52]/20">
            <p className="text-[#4F5E52] font-medium mb-2">Jejak Belum Terlihat</p>
            <p className="text-[#7B8776] text-sm leading-relaxed">
              Mulai Journal, Meditasi, atau Audio Healing agar laporan mingguanmu terbentuk.
            </p>
            <Link href="/dashboard" className="bhumi-button mt-6 inline-flex">
              Mulai Innerwork Hari Ini
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">📅 Minggu Ini</p>
              <p className="mt-2 text-sm text-[#7B8776]">{formatWeeklyRange(report)}</p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-[#F7F8F5] p-3 text-center">
                  <p className="text-xs text-[#7B8776]">Journal</p>
                  <p className="text-lg font-semibold text-[#4F5E52]">{report.totalJournal}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F5] p-3 text-center">
                  <p className="text-xs text-[#7B8776]">Meditasi</p>
                  <p className="text-lg font-semibold text-[#4F5E52]">{report.totalMeditation}</p>
                </div>
                <div className="rounded-2xl bg-[#F7F8F5] p-3 text-center">
                  <p className="text-xs text-[#7B8776]">Audio</p>
                  <p className="text-lg font-semibold text-[#4F5E52]">{report.totalAudioHealing}</p>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">🌱 Tema Dominan</p>
              <p className="mt-2 text-2xl font-semibold text-[#4F5E52]">{report.dominantTheme}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#7B8776]">
                Tema ini terlihat paling sering muncul dalam pola innerwork kamu minggu ini.
              </p>
            </section>

            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">🫀 Emosi &amp; Tubuh</p>
              <p className="mt-3 text-sm text-[#7B8776]"><span className="font-medium text-[#4F5E52]">Pola emosi:</span> {report.emotionalPattern}</p>
              <p className="mt-1 text-sm text-[#7B8776]"><span className="font-medium text-[#4F5E52]">Pola tubuh:</span> {report.bodyPattern}</p>
              <p className="mt-3 text-sm leading-relaxed text-[#4F5E52]">{report.growthSummary}</p>
            </section>

            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">✨ Kaitan Dengan Blueprint</p>
              <p className="mt-3 text-sm leading-relaxed text-[#4F5E52]">{report.blueprintReflection}</p>
            </section>

            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">🧭 Fokus Minggu Depan</p>
              <div className="mt-3 space-y-2 text-sm text-[#4F5E52]">
                <p><span className="font-medium">Fokus:</span> {report.recommendedFocusNextWeek}</p>
                <p><span className="font-medium">Journal:</span> {report.recommendedJournalPrompt}</p>
                <p><span className="font-medium">Meditasi:</span> {report.recommendedMeditation}</p>
                <p><span className="font-medium">Audio Healing:</span> {report.recommendedAudioHealing}</p>
              </div>
            </section>

            <section className="rounded-3xl border border-[#E8E9E5] bg-white p-6">
              <p className="text-sm font-semibold text-[#4F5E52]">🌙 Pesan Penutup</p>
              <p className="mt-3 text-sm leading-7 text-[#4F5E52]">{report.closingMessage}</p>
            </section>

            {/* TODO: create shareable weekly report image/card */}

            <Link href="/dashboard" className="block rounded-2xl bg-[#4F5E52] px-4 py-3 text-center text-sm font-medium text-white transition hover:bg-[#3D4A3F]">
              Kembali ke Dashboard
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

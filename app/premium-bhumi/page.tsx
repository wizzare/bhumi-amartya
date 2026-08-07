"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { translations } from "@/lib/data/translations";
import { useLanguage } from "@/app/context/LanguageContext";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { Shield, Crown, Sparkles, RefreshCw, ArrowLeft, CreditCard, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getCurrentBadge } from "@/lib/billing/billingPreparation";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { getBillingPresentation } from "@/lib/billing/entitlementPresentation";
import { purchaseAndRecoverPremium, restoreAndRecoverPremium } from "@/lib/billing/googlePlayBilling";

export default function PremiumBhumiPage() {
  const router = useRouter();
  const auth = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const [profile, setProfile] = useState<any>(null);
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.authStateResolved) return;
      if (!auth.user) {
        router.replace("/login?next=/premium-bhumi");
        return;
      }
      try {
        const p = await storageProvider.getUserProfile();
        setProfile(p);
        const record = await getFounderTesterRecord(p?.uid).catch(() => null);
        setTesterRecord(record);
      } catch (err) {
        console.error("[PremiumBhumi] Load profile failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [auth, router]);

  const badge = profile ? getCurrentBadge(profile) : null;
  const entitlement = profile ? getEntitlementStatus(profile, new Date(), testerRecord) : null;
  const presentation = getBillingPresentation(entitlement);
  const isPremium = presentation.state === "premium_active";
  const isTrial = presentation.state === "trial_active";
  const isExpired = presentation.state === "trial_exhausted" || presentation.state === "premium_expired";

  // Founder = Lifetime, No expiry date. Show "Akses hingga" only for actual trial users.
  const isFounder = badge === "Founder" || badge === "Penjaga Bhumi Inti" || badge === "Penjaga Bhumi Alfa";
  // Derived from the same entitlement object above (Priority 4 time-based
  // trial), not recomputed via the badge-based isTrialUser() check — keeps
  // the "days left" text consistent with the actual access decision.
  const accessUntil = entitlement?.expiresAt || null;
  const daysLeft = profile && isTrial ? (entitlement?.daysRemaining ?? 0) : 0;
  const accountLabel = badge
    || (isTrial ? "Trial" : isPremium ? "Premium Bhumi" : (t.premiumBhumi?.freeUser || "Penghuni Bhumi (Gratis)"));

  const handleSubscribe = async () => {
    setPurchasing(true);
    setError(null);
    setMessage(null);
    try {
      const recovery = await purchaseAndRecoverPremium(async () => { await auth?.refreshUserProfile?.(); }, Boolean(isPremium));
      if (recovery.state === "ACCESS_ACTIVE") {
        setMessage(t.premiumBhumi?.purchaseSuccess || "Pembelian berhasil! Akses Premium Bhumi diaktifkan.");
        setTimeout(() => router.refresh(), 1500);
      } else if (recovery.state === "NO_ACTIVE_PURCHASE") setError("Tidak ada pembelian aktif yang dapat diverifikasi.");
      else if (recovery.state === "RETRYABLE_VERIFICATION_FAILURE") setError("Verifikasi sementara belum tersedia. Silakan coba lagi tanpa membeli ulang.");
      else if (recovery.state === "PERSISTENCE_FAILURE") setError("Pembelian terdeteksi, tetapi penyimpanan akses belum berhasil. Silakan coba verifikasi ulang.");
      else if (recovery.state === "PROFILE_REFRESH_FAILURE") setError("Akses telah diverifikasi, tetapi profil belum dapat diperbarui. Silakan muat ulang halaman.");
      else setError("Pembelian ditolak oleh penyedia atau tidak lagi aktif. Gunakan Pulihkan Pembelian bila status berubah.");
    } catch (err: any) {
      if (err?.message?.includes("USER_CANCELED") || err?.code === "USER_CANCELED") {
        setMessage(null);
      } else {
        setError(err?.message || t.premiumBhumi?.purchaseFailed || "Pembelian gagal. Silakan coba lagi.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    setError(null);
    setMessage(null);
    try {
      const recovery = await restoreAndRecoverPremium(async () => { await auth?.refreshUserProfile?.(); }, Boolean(isPremium));
      if (recovery.state === "ACCESS_ACTIVE") {
        setMessage(t.premiumBhumi?.restoreSuccess || "Pembelian berhasil dipulihkan & diverifikasi!");
        setTimeout(() => router.refresh(), 1500);
      } else if (recovery.state === "NO_ACTIVE_PURCHASE") setMessage(t.premiumBhumi?.restoreNotFound || "Tidak ada langganan aktif yang ditemukan untuk dipulihkan.");
      else if (recovery.state === "RETRYABLE_VERIFICATION_FAILURE") setError("Verifikasi sementara belum tersedia. Silakan coba lagi.");
      else if (recovery.state === "PERSISTENCE_FAILURE") setError("Pembelian ditemukan, tetapi akses belum tersimpan. Silakan coba pulihkan lagi.");
      else if (recovery.state === "PROFILE_REFRESH_FAILURE") setError("Akses telah diverifikasi, tetapi profil belum dapat diperbarui. Silakan muat ulang halaman.");
      else setError("Pembelian aktif ditolak oleh penyedia. Periksa status langganan Google Play.");
    } catch (err: any) {
      setError(err?.message || t.premiumBhumi?.restoreFailed || "Pulihkan gagal. Silakan coba lagi.");
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="bhumi-card p-12 text-center max-w-md w-full bg-white border-none shadow-xl">
          <p className="text-[#4F5E52] text-xl font-serif italic">Memuat Premium Bhumi...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-28">
      <AppNav />
      <div className="mx-auto max-w-3xl space-y-6">
        <BhumiPageHeader />
        
        <header className="bhumi-card p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-xl bg-white border border-[#E8E9E5] text-[#7B8776] hover:bg-[#F5F1E8] hover:text-[#4F5E52] transition"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-semibold text-[#4F5E52]">{t.premiumBhumi?.title || "Premium Bhumi"}</h1>
              <p className="mt-1 text-[#7B8776]">{t.premiumBhumi?.subtitle || "Tingkatkan pengalaman Bhumi-mu dengan akses penuh ke semua fitur premium."}</p>
            </div>
          </div>
        </header>

        {/* Account Status Card */}
        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t.premiumBhumi?.accountStatus || "Status Akun"}
          </h2>
          
          <div className="p-4 rounded-2xl bg-white border border-[#E8E9E5]">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-3 rounded-2xl ${
                badge === "Founder" ? "bg-amber-100 text-amber-700" :
                badge === "Penjaga Bhumi Inti" ? "bg-emerald-100 text-emerald-700" :
                badge === "Penjaga Bhumi Alfa" ? "bg-blue-100 text-blue-700" :
                badge === "Penjaga Bhumi" ? "bg-green-100 text-green-700" :
                "bg-[#F5F1E8] text-[#7B8776]"
              }`}>
                {badge === "Founder" ? <Crown className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#4F5E52]">
                  {accountLabel}
                </h3>
                                <p className="text-sm text-[#7B8776]">
                  {isFounder
                    ? (t.premiumBhumi?.lifetimeAccess || "Akses selamanya (Lifetime)")
                    : isTrial
                      ? `${t.premiumBhumi?.trialActive || "Masa percobaan aktif"} - ${daysLeft} ${t.premiumBhumi?.daysLeft || "hari tersisa"}`
                      : isPremium
                        ? (t.premiumBhumi?.activeAccess || "Akses premium aktif")
                        : isExpired
                          ? (t.premiumBhumi?.accessExpired || "Akses kedaluwarsa")
                          : (t.premiumBhumi?.freeAccess || "Akses gratis")}
                </p>
              </div>
            </div>

            {accessUntil && (
              <div className="text-sm text-[#7B8776] border-t border-[#F5F1E8] pt-3">
                <p>{t.premiumBhumi?.accessUntil || "Akses hingga"}: {accessUntil.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
              </div>
            )}
          </div>
        </section>

        {/* Benefits */}
        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            {t.premiumBhumi?.benefits || "Manfaat Premium"}
          </h2>
          
          <div className="space-y-3">
            {[
              { icon: <Sparkles className="h-5 w-5" />, title: t.premiumBhumi?.benefit1 || "Akses penuh ke Profil, Wellness, Journey, Refleksi Jiwa" },
              { icon: <Sparkles className="h-5 w-5" />, title: t.premiumBhumi?.benefit2 || "Audio Healing dan Manifestasi tanpa batas" },
              { icon: <Sparkles className="h-5 w-5" />, title: t.premiumBhumi?.benefit3 || "Catatan Hari Ini dan Innerwork Hub lengkap" },
              { icon: <Sparkles className="h-5 w-5" />, title: t.premiumBhumi?.benefit4 || "Prioritas dukungan dan pembaruan fitur terbaru" },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-[#E8E9E5]">
                <div className="p-2 rounded-xl bg-[#F5F1E8] text-[#4F5E52] shrink-0">{benefit.icon}</div>
                <p className="text-sm text-[#4F5E52] mt-0.5">{benefit.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <section className="bhumi-card space-y-4 p-6">
          <h2 className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {t.premiumBhumi?.upgradeTitle || "Tingkatkan ke Premium"}
          </h2>

          {error && (
            <div className="p-4 rounded-2xl bg-red-50/50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && !error && (
            <div className="p-4 rounded-2xl bg-green-50/50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleSubscribe}
              disabled={purchasing || restoring}
              className="bhumi-button w-full py-4 flex items-center justify-center gap-3"
            >
              {purchasing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>{t.premiumBhumi?.processing || "Memproses..."}</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>{t.premiumBhumi?.subscribeButton || "Langganan Sekarang"}</span>
                </>
              )}
            </button>

            <button
              onClick={handleRestore}
              disabled={purchasing || restoring}
              className="w-full py-4 rounded-2xl border border-[#E5DCD0] bg-white px-5 text-[#4F5E52] transition hover:bg-[#F5F1E8] flex items-center justify-center gap-3 font-medium"
            >
              {restoring ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4F5E52]/30 border-t-[#4F5E52]" />
                  <span>{t.premiumBhumi?.restoring || "Memulihkan..."}</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-5 w-5" />
                  <span>{t.premiumBhumi?.restoreButton || "Pulihkan Pembelian"}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[#9BB89A] text-center">
            {t.premiumBhumi?.subscriptionNote || "Langganan bulanan Rp50.000/bulan. Dapat dibatalkan kapan saja melalui Google Play."}
          </p>
        </section>

        {/* Free Access Info */}
        <section className="bhumi-card space-y-3 p-6 bg-[#FCFAF5] border border-[#E8E9E5]">
          <h3 className="text-lg font-semibold text-[#4F5E52] flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            {t.premiumBhumi?.freeAccessTitle || "Akses Gratis Tetap Tersedia"}
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white border border-[#E8E9E5]">
              <p className="font-medium text-[#4F5E52] mb-1">{t.premiumBhumi?.freeIncludes || "Termasuk gratis:"}</p>
              <ul className="text-[#7B8776] space-y-1">
                <li>Dashboard</li>
                <li>Lainnya</li>
                <li>Pengaturan</li>
                <li>Premium Bhumi</li>
              </ul>
            </div>
            <div className="p-3 rounded-xl bg-white border border-[#E8E9E5]">
              <p className="font-medium text-[#4F5E52] mb-1">{t.premiumBhumi?.premiumRequires || "Membutuhkan Premium:"}</p>
              <ul className="text-[#7B8776] space-y-1">
                <li>Profil</li>
                <li>Wellness</li>
                <li>Journey</li>
                <li>Refleksi Jiwa</li>
                <li>Audio Healing</li>
                <li>Manifestasi</li>
                <li>Catatan Hari Ini</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { AppNav } from "@/components/navigation/AppNav";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import {
  Shield,
  Crown,
  Sparkles,
  RefreshCw,
  ArrowLeft,
  CreditCard,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Info,
} from "lucide-react";
import { storageProvider } from "@/lib/storage/storageProvider";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";
import { getFounderTesterRecord, type FounderTesterRecord } from "@/lib/billing/founderTesterSourceOfTruth";
import { getBillingPresentation } from "@/lib/billing/entitlementPresentation";
import {
  purchaseAndRecoverPremium,
  restoreAndRecoverPremium,
  queryPremiumSubscription,
  isGooglePlayBillingAvailable,
  GOOGLE_PLAY_BASE_PLAN_ID,
} from "@/lib/billing/googlePlayBilling";

export function CanonicalPremiumScreen() {
  const router = useRouter();
  const auth = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [testerRecord, setTesterRecord] = useState<FounderTesterRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [priceLabel, setPriceLabel] = useState<string>("Harga tersedia melalui Google Play");

  const billingAvailable = useMemo(() => isGooglePlayBillingAvailable(), []);

  // Fetch live product price from Google Play
  useEffect(() => {
    let cancelled = false;
    if (!billingAvailable) {
      setPriceLabel("Harga tersedia melalui Google Play");
      return;
    }

    queryPremiumSubscription()
      .then((product) => {
        if (cancelled) return;
        const formattedPrice =
          product?.offers?.find((offer) => offer.basePlanId === GOOGLE_PLAY_BASE_PLAN_ID)?.pricingPhases?.[0]
            ?.formattedPrice ||
          product?.offers?.[0]?.pricingPhases?.[0]?.formattedPrice;
        if (formattedPrice) {
          setPriceLabel(`${formattedPrice}/bulan`);
        } else {
          setPriceLabel("Harga tersedia melalui Google Play");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPriceLabel("Harga tersedia melalui Google Play");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [billingAvailable]);

  // Load user profile & tester record
  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.authStateResolved) return;
      if (!auth.user) {
        router.replace("/login?next=/premium-bhumi");
        return;
      }
      try {
        const p = auth.userProfile || (await storageProvider.getUserProfile());
        setProfile(p);
        const record = await getFounderTesterRecord(p?.uid).catch(() => null);
        setTesterRecord(record);
      } catch (err) {
        console.error("[CanonicalPremiumScreen] Load profile failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [auth, router]);

  // Compute canonical entitlement and dual-display presentation
  const entitlement = useMemo(() => {
    return profile ? getEntitlementStatus(profile, new Date(), testerRecord) : null;
  }, [profile, testerRecord]);

  const presentation = useMemo(() => {
    return getBillingPresentation(entitlement, profile, testerRecord);
  }, [entitlement, profile, testerRecord]);

  const handleSubscribe = async () => {
    if (!billingAvailable) {
      setError("Pembelian Google Play hanya tersedia dari aplikasi Android yang dipasang melalui Google Play.");
      return;
    }
    setPurchasing(true);
    setError(null);
    setMessage(null);
    try {
      const recovery = await purchaseAndRecoverPremium(async () => {
        await auth?.refreshUserProfile?.();
      }, Boolean(presentation.hasAccess));

      if (recovery.state === "ACCESS_ACTIVE") {
        setMessage("Pembelian berhasil! Akses Premium Bhumi diaktifkan.");
        setTimeout(() => router.refresh(), 1500);
      } else if (recovery.state === "NO_ACTIVE_PURCHASE") {
        setError("Tidak ada pembelian aktif yang dapat diverifikasi.");
      } else if (recovery.state === "PAYMENT_PENDING") {
        setMessage("Pembayaran sedang diproses oleh Google Play. Kamu tidak perlu membeli ulang. Status akan diperbarui setelah pembayaran selesai.");
      } else if (recovery.state === "RETRYABLE_VERIFICATION_FAILURE") {
        setError("Verifikasi sementara belum tersedia. Silakan coba lagi tanpa membeli ulang.");
      } else if (recovery.state === "PERSISTENCE_FAILURE") {
        setError("Pembelian terdeteksi, tetapi penyimpanan akses belum berhasil. Silakan coba verifikasi ulang.");
      } else if (recovery.state === "PROFILE_REFRESH_FAILURE") {
        setError("Akses telah diverifikasi, tetapi profil belum dapat diperbarui. Silakan muat ulang halaman.");
      } else {
        setError("Pembelian ditolak oleh penyedia atau tidak lagi aktif. Gunakan Pulihkan Pembelian bila status berubah.");
      }
    } catch (err: any) {
      if (err?.message?.includes("USER_CANCELED") || err?.code === "USER_CANCELED") {
        setMessage(null);
      } else {
        setError(err?.message || "Pembelian gagal. Silakan coba lagi.");
      }
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    if (!billingAvailable) {
      setError("Pemulihan Google Play hanya tersedia dari aplikasi Android yang dipasang melalui Google Play.");
      return;
    }
    setRestoring(true);
    setError(null);
    setMessage(null);
    try {
      const recovery = await restoreAndRecoverPremium(async () => {
        await auth?.refreshUserProfile?.();
      }, Boolean(presentation.hasAccess));

      if (recovery.state === "ACCESS_ACTIVE") {
        setMessage("Pembelian berhasil dipulihkan & diverifikasi!");
        setTimeout(() => router.refresh(), 1500);
      } else if (recovery.state === "NO_ACTIVE_PURCHASE") {
        setMessage("Tidak ada pembelian Premium aktif yang bisa dipulihkan.");
      } else if (recovery.state === "PAYMENT_PENDING") {
        setMessage("Pembayaran sedang diproses oleh Google Play. Kamu tidak perlu membeli ulang. Status akan diperbarui setelah pembayaran selesai.");
      } else if (recovery.state === "RETRYABLE_VERIFICATION_FAILURE") {
        setError("Verifikasi sementara belum tersedia. Silakan coba lagi.");
      } else if (recovery.state === "PERSISTENCE_FAILURE") {
        setError("Pembelian ditemukan, tetapi akses belum tersimpan. Silakan coba pulihkan lagi.");
      } else if (recovery.state === "PROFILE_REFRESH_FAILURE") {
        setError("Akses telah diverifikasi, tetapi profil belum dapat diperbarui. Silakan muat ulang halaman.");
      } else {
        setError("Pembelian aktif ditolak oleh penyedia. Periksa status langganan Google Play.");
      }
    } catch (err: any) {
      setError(err?.message || "Pulihkan gagal. Silakan coba lagi.");
    } finally {
      setRestoring(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
        <div className="bhumi-card p-12 text-center max-w-md w-full bg-white border-none shadow-xl" role="status">
          <p className="text-[#4F5E52] text-xl font-serif italic">Memuat status langganan...</p>
        </div>
      </main>
    );
  }

  const isFounder = presentation.communityBadge === "Founder";
  const isInti = presentation.communityBadge === "Penjaga Bhumi Inti";
  const isAlfa = presentation.communityBadge === "Penjaga Bhumi Alfa";

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-4 py-8 pb-28 sm:px-6 md:px-8 text-[#24352E]">
      <AppNav />
      <div className="mx-auto max-w-3xl space-y-6">
        <BhumiPageHeader />

        <header className="bhumi-card p-6 sm:p-7 bg-gradient-to-br from-[#FCFAF5] to-[#F5F1E8]">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              aria-label="Kembali"
              className="p-2.5 rounded-xl bg-white border border-[#E8E9E5] text-[#7B8776] hover:bg-[#F5F1E8] hover:text-[#4F5E52] transition focus:outline-none focus:ring-2 focus:ring-[#7B8776]"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-[#4F5E52]">Premium Bhumi</h1>
              <p className="mt-1 text-sm text-[#7B8776]">
                Akses penuh ke seluruh modul kesadaran, analisis personal, dan audio healing.
              </p>
            </div>
          </div>
        </header>

        {/* Section 1: Canonical Account Status & Dual-Display Card */}
        <section className="bhumi-card space-y-4 p-5 sm:p-6" aria-labelledby="account-status-heading">
          <h2 id="account-status-heading" className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#7B8776]" />
            Status Akun & Akses
          </h2>

          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8E9E5] shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F5F1E8]">
              <div className="flex items-center gap-3.5">
                <div
                  className={`p-3 rounded-2xl shrink-0 ${
                    isFounder
                      ? "bg-amber-100 text-amber-800"
                      : isInti
                        ? "bg-emerald-100 text-emerald-800"
                        : isAlfa
                          ? "bg-blue-100 text-blue-800"
                          : presentation.hasAccess
                            ? "bg-teal-100 text-teal-800"
                            : "bg-[#F5F1E8] text-[#7B8776]"
                  }`}
                >
                  {isFounder ? <Crown className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-bold text-[#4F5E52]">{presentation.communityBadge}</h3>
                    {presentation.isDualDisplay && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        Paid + Community
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-[#7B8776] mt-0.5">
                    {presentation.commercialStatus}
                  </p>
                </div>
              </div>

              <div className="sm:text-right">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#9BB89A] block">
                  Sumber Hak Akses
                </span>
                <span className="text-sm font-semibold text-[#4F5E52]">
                  {presentation.entitlementSource}
                </span>
              </div>
            </div>

            {/* Expiry / Lifetime Information */}
            <div className="pt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm text-[#7B8776]">
              <span>Masa Berlaku:</span>
              <span className="font-semibold text-[#2F4438]">
                {presentation.isLifetime
                  ? "Akses selamanya (Lifetime)"
                  : presentation.state === "trial_active"
                    ? `Masa percobaan aktif (${presentation.daysRemaining} hari tersisa s/d ${presentation.formattedExpiry || "-"})`
                    : presentation.hasAccess && presentation.formattedExpiry
                      ? `Aktif sampai ${presentation.formattedExpiry}`
                      : presentation.state === "trial_exhausted" || presentation.state === "premium_expired"
                        ? "Akses kedaluwarsa"
                        : "Akses gratis (dasar)"}
              </span>
            </div>
          </div>
        </section>

        {/* Section 2: Benefits List */}
        <section className="bhumi-card space-y-4 p-5 sm:p-6" aria-labelledby="benefits-heading">
          <h2 id="benefits-heading" className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-600" />
            Manfaat Premium
          </h2>

          <div className="space-y-3">
            {[
              "Akses penuh ke Profil, Wellness, Journey, Refleksi Jiwa",
              "Audio Healing dan Manifestasi tanpa batas",
              "Catatan Hari Ini dan Innerwork Hub lengkap",
              "Prioritas pembaruan fitur kesadaran terbaru",
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-2xl bg-white border border-[#E8E9E5]">
                <div className="p-1.5 rounded-xl bg-[#F5F1E8] text-[#4F5E52] shrink-0 mt-0.5">
                  <Sparkles className="h-4 w-4" />
                </div>
                <p className="text-sm text-[#4F5E52] leading-relaxed">{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 3: Action Buttons & Google Play Price Authority */}
        <section className="bhumi-card space-y-4 p-5 sm:p-6" aria-labelledby="purchase-heading">
          <h2 id="purchase-heading" className="text-xl font-semibold text-[#4F5E52] flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-[#7B8776]" />
            Kelola Langganan
          </h2>

          {/* Web Platform Notice */}
          {!billingAvailable && (
            <div className="rounded-2xl border border-[#D8D0C3] bg-[#F5F1E8] p-4 text-sm leading-6 text-[#657066] flex items-start gap-3">
              <Info className="h-5 w-5 text-[#7B8776] shrink-0 mt-0.5" />
              <span>
                Pembelian Google Play hanya tersedia dari aplikasi Android yang dipasang melalui Google Play.
              </span>
            </div>
          )}

          {/* Feedback & Error Banners with ARIA live announcements */}
          {error && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5"
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && !error && (
            <div
              role="status"
              aria-live="polite"
              className="p-4 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2.5"
            >
              <CheckCircle className="h-5 w-5 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleSubscribe}
              disabled={purchasing || restoring || !billingAvailable}
              aria-disabled={purchasing || restoring || !billingAvailable}
              className="bhumi-button w-full py-4 flex items-center justify-center gap-3 disabled:cursor-not-allowed disabled:opacity-50 text-base"
            >
              {purchasing ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5" />
                  <span>Langganan Sekarang</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRestore}
              disabled={purchasing || restoring || !billingAvailable}
              aria-disabled={purchasing || restoring || !billingAvailable}
              className="w-full py-3.5 rounded-2xl border border-[#E5DCD0] bg-white px-5 text-[#4F5E52] transition hover:bg-[#F5F1E8] flex items-center justify-center gap-3 font-semibold disabled:cursor-not-allowed disabled:opacity-50 text-sm"
            >
              {restoring ? (
                <>
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#4F5E52]/30 border-t-[#4F5E52]" />
                  <span>Memulihkan...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Pulihkan Pembelian</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-[#7B8776] text-center pt-1">
            Langganan bulanan {priceLabel}. Dapat dibatalkan kapan saja melalui Google Play.
          </p>
        </section>

        {/* Section 4: Free vs Premium Information */}
        <section className="bhumi-card space-y-3 p-5 sm:p-6 bg-[#FCFAF5] border border-[#E8E9E5]" aria-labelledby="free-access-heading">
          <h3 id="free-access-heading" className="text-lg font-semibold text-[#4F5E52] flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-[#7B8776]" />
            Akses Gratis Tetap Tersedia
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm pt-1">
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E9E5]">
              <p className="font-semibold text-[#4F5E52] mb-1.5">Termasuk gratis:</p>
              <ul className="text-[#7B8776] space-y-1 list-disc list-inside">
                <li>Dashboard Harian</li>
                <li>Pengaturan & Profil Dasar</li>
                <li>Panduan Kosmik Awal</li>
              </ul>
            </div>
            <div className="p-3.5 rounded-xl bg-white border border-[#E8E9E5]">
              <p className="font-semibold text-[#4F5E52] mb-1.5">Membutuhkan Premium:</p>
              <ul className="text-[#7B8776] space-y-1 list-disc list-inside">
                <li>Profil Lengkap & Refleksi Jiwa</li>
                <li>Wellness & Audio Healing</li>
                <li>Journey & Catatan Hari Ini</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

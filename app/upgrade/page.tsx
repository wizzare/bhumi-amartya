"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { useAuth } from "@/context/AuthContext";
import {
  GOOGLE_PLAY_PRODUCT_ID,
  isGooglePlayBillingAvailable,
  purchasePremiumSubscription,
  queryPremiumSubscription,
  restorePremiumPurchases,
  processAndVerifyPurchaseToken,
  type GooglePlayProduct,
  type GooglePlayPurchase,
} from "@/lib/billing/googlePlayBilling";
import { getEntitlementStatus } from "@/lib/billing/entitlementService";

type PurchaseState = "idle" | "loading" | "success" | "error";

export default function UpgradePage() {
  const auth = useAuth();
  const [product, setProduct] = useState<GooglePlayProduct | null>(null);
  const [state, setState] = useState<PurchaseState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const billingAvailable = useMemo(() => isGooglePlayBillingAvailable(), []);

  const activeUntil = useMemo(() => formatAccessUntil((auth?.userProfile as any)?.accessUntil), [auth?.userProfile]);
  // Canonical entitlement source (Build 85 P0): active trial and premium both
  // count as premium access; status label distinguishes TRIAL / PREMIUM / FREE.
  const entitlement = useMemo(
    () => getEntitlementStatus(auth?.userProfile || null, new Date(), null),
    [auth?.userProfile],
  );
  const isPremium = entitlement.isPremium;
  const statusLabel =
    !isPremium
      ? "Free"
      : entitlement.reason === "trial"
        ? "Trial"
        : "Premium";
  const price = product?.offers
    ?.find((offer) => offer.basePlanId === "monthly")
    ?.pricingPhases?.[0]?.formattedPrice
    || product?.offers?.[0]?.pricingPhases?.[0]?.formattedPrice
    || "Google Play";

  useEffect(() => {
    if (!billingAvailable) return;

    let cancelled = false;
    void queryPremiumSubscription()
      .then((details) => {
        if (!cancelled) setProduct(details);
      })
      .catch((error) => {
        console.warn("[GOOGLE PLAY PRODUCT LOAD FAILED]", error);
        if (!cancelled) setMessage("Produk Premium belum bisa dimuat dari Google Play.");
      });

    return () => {
      cancelled = true;
    };
  }, [billingAvailable]);

  const verifyAndRefresh = async (purchase: GooglePlayPurchase) => {
    const verification = await processAndVerifyPurchaseToken(purchase);
    if (!verification.active) {
      setMessage("Pembelian tercatat, tetapi statusnya belum aktif dari Google Play.");
      return;
    }

    await auth?.refreshUserProfile();
    setState("success");
    setMessage(`Premium aktif sampai ${formatAccessUntil(verification.accessUntil)}.`);
  };

  const handlePurchase = async () => {
    setState("loading");
    setMessage(null);

    try {
      const result = await purchasePremiumSubscription();
      const purchase = findPremiumPurchase(result.purchases);
      if (!purchase) throw new Error("Token pembelian Premium tidak ditemukan.");
      await verifyAndRefresh(purchase);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Pembelian belum berhasil diproses.");
    }
  };

  const handleRestore = async () => {
    setState("loading");
    setMessage(null);

    try {
      const result = await restorePremiumPurchases();
      const purchase = findPremiumPurchase(result.purchases);
      if (!purchase) {
        setState("idle");
        setMessage("Tidak ada pembelian Premium aktif yang bisa dipulihkan.");
        return;
      }
      await verifyAndRefresh(purchase);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Restore pembelian belum berhasil.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-28 text-[#24352E]">
      <AppNav />
      <section className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7B8776]">Premium</p>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-[#2F4438]">Bhumi Premium</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-[#657066]">
            Akses Premium dikelola dari server setelah pembelian Google Play berhasil diverifikasi.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#D8D0C3] bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-[#E8E1D3] pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7B8776]">Status</p>
              <p className="mt-2 text-2xl font-semibold text-[#2F4438]">{statusLabel}</p>
            </div>
            <p className="rounded-[8px] border border-[#D8D0C3] px-3 py-2 text-right text-sm font-semibold text-[#4F5E52]">
              {activeUntil || "Belum aktif"}
            </p>
          </div>

          <div className="grid gap-3 py-5 text-sm text-[#4F5E52]">
            <Row label="Product ID" value={GOOGLE_PLAY_PRODUCT_ID} />
            <Row label="Base Plan" value="monthly" />
            <Row label="Harga" value={price} />
          </div>

          {!billingAvailable ? (
            <p className="rounded-[8px] border border-[#D8D0C3] bg-[#F5F1E8] p-4 text-sm leading-6 text-[#657066]">
              Pembelian Google Play hanya tersedia dari aplikasi Android yang dipasang melalui Google Play.
            </p>
          ) : (
            <div className="grid gap-3">
              <button
                type="button"
                onClick={handlePurchase}
                disabled={state === "loading"}
                className="bhumi-button w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === "loading" ? "Memproses..." : "Beli Premium Bulanan"}
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={state === "loading"}
                className="w-full rounded-[8px] border border-[#CFC6B8] bg-white px-4 py-3 text-sm font-semibold text-[#4F5E52] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Pulihkan Pembelian
              </button>
            </div>
          )}

          {message ? (
            <p className={`mt-4 text-sm font-medium ${state === "error" ? "text-[#9D3B2F]" : "text-[#4F5E52]"}`}>
              {message}
            </p>
          ) : null}
        </div>

        <Link href="/dashboard" className="text-sm font-semibold text-[#7B8776] transition-colors hover:text-[#4F5E52]">
          Kembali ke Dasbor
        </Link>
      </section>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#E8E1D3] pb-3 last:border-b-0 last:pb-0">
      <span>{label}</span>
      <span className="text-right font-semibold text-[#24352E]">{value}</span>
    </div>
  );
}

function findPremiumPurchase(purchases: GooglePlayPurchase[]) {
  return purchases.find((purchase) => purchase.products?.includes(GOOGLE_PLAY_PRODUCT_ID)) ?? purchases[0] ?? null;
}

function formatAccessUntil(value: unknown) {
  if (!value) return "";
  if (typeof value === "string") return formatDate(value);
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return formatDate(value.toDate());
  }
  return "";
}

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

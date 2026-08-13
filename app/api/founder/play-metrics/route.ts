import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { requireFounder } from "@/lib/auth/requireFounder";
import {
  fetchCrashRateMetric,
  fetchAnrRateMetric,
  fetchStorePerformanceMetric,
  fetchPlayReviews,
  type PlayReportResult,
} from "@/lib/google/playReporting";
import { listGcsObjects, GCS_PREFIXES } from "@/lib/google/playGcs";

export async function GET(request: Request) {
  const auth = await requireFounder(request);
  if (!auth.ok) return auth.response;

  try {
    const [crashRes, anrRes, storePerfRes, reviewsRes, gcsInstallsRes, gcsSalesRes] = await Promise.all([
      fetchCrashRateMetric(),
      fetchAnrRateMetric(),
      fetchStorePerformanceMetric(),
      fetchPlayReviews(),
      listGcsObjects(GCS_PREFIXES.installs, { maxResults: 10 }),
      listGcsObjects(GCS_PREFIXES.sales, { maxResults: 10 }),
    ]);

    // Structured metric format mapping
    const crashRate = crashRes.ok
      ? { status: "LIVE", data: crashRes.data }
      : { status: crashRes.code === "PERMISSION_DENIED" ? "PERMISSION_DENIED" : "CONFIG_REQUIRED", error: crashRes.message };

    const anrRate = anrRes.ok
      ? { status: "LIVE", data: anrRes.data }
      : { status: anrRes.code === "PERMISSION_DENIED" ? "PERMISSION_DENIED" : "CONFIG_REQUIRED", error: anrRes.message };

    const storePerformance = storePerfRes.ok
      ? { status: "LIVE", data: storePerfRes.data }
      : { status: storePerfRes.code === "PERMISSION_DENIED" ? "PERMISSION_DENIED" : "CONFIG_REQUIRED", error: storePerfRes.message };

    const reviews = reviewsRes.ok
      ? { status: "LIVE", data: reviewsRes.data }
      : { status: reviewsRes.code === "PERMISSION_DENIED" ? "PERMISSION_DENIED" : "CONFIG_REQUIRED", error: reviewsRes.message };

    const gcsInstalls = gcsInstallsRes.ok
      ? { status: "LIVE", data: gcsInstallsRes.data }
      : { status: gcsInstallsRes.code === "PERMISSION_DENIED" ? "GCS_403" : "CONFIG_REQUIRED", error: gcsInstallsRes.message };

    const gcsSales = gcsSalesRes.ok
      ? { status: "LIVE", data: gcsSalesRes.data }
      : { status: gcsSalesRes.code === "PERMISSION_DENIED" ? "GCS_FINANCIAL_403" : "CONFIG_REQUIRED", error: gcsSalesRes.message };

    // Revenue source evaluation
    let revenueSource = "SNAPSHOT_FALLBACK";
    if (gcsSalesRes.ok && gcsSalesRes.data.items && gcsSalesRes.data.items.length > 0) {
      revenueSource = "GCS_ESTIMATED_SALES";
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      packageName: "com.bhumiamartya.app",
      metrics: {
        crashRate,
        anrRate,
        storePerformance,
        reviews,
        gcsInstalls,
        gcsSales,
      },
      revenue: {
        revenueSource,
        revenueCurrency: "IDR",
        revenuePeriod: "MONTHLY",
      },
      snapshots: {
        firstOpens: { status: "SNAPSHOT", note: "snapshot until export mapped" },
        dau: { status: "SNAPSHOT", note: "snapshot until stats export mapped" },
        mau: { status: "SNAPSHOT", note: "snapshot until stats export mapped" },
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[PLAY METRICS ROUTE] Unexpected error:", msg);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}

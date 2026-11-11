import type { VercelRequest, VercelResponse } from "@vercel/node";
import { adminDb } from "../../lib/firebaseAdmin";
import { resolveVerifierAntiAbuseFlags } from "../../lib/antiAbuse";
import { sendJson } from "../../lib/response";

export const config = { runtime: "nodejs", maxDuration: 30 };

export type AntiAbuseAlert = {
  severity: "CRITICAL" | "WARNING";
  code: string;
  message: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET" && req.method !== "POST") {
    return sendJson(res, 405, { ok: false, error: "METHOD_NOT_ALLOWED" });
  }

  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) {
    return sendJson(res, 500, { ok: false, error: "CRON_SECRET_NOT_CONFIGURED" });
  }
  if (req.headers.authorization !== `Bearer ${cronSecret}`) {
    return sendJson(res, 401, { ok: false, error: "UNAUTHORIZED_CRON" });
  }

  const alerts: AntiAbuseAlert[] = [];
  const hmacSecret = process.env.BHUMI_ANTI_ABUSE_HMAC_SECRET?.trim() || "";
  if (hmacSecret.length < 16) {
    alerts.push({
      severity: "CRITICAL",
      code: "ANTI_ABUSE_HMAC_SECRET_WEAK_OR_MISSING",
      message: "BHUMI_ANTI_ABUSE_HMAC_SECRET is missing or shorter than 16 characters.",
    });
  }

  const db = adminDb();
  const cfgSnap = await db.doc("app_config/antiAbuse").get().catch(() => null);
  const flags = resolveVerifierAntiAbuseFlags(cfgSnap?.exists ? cfgSnap.data() || null : null);

  const [claimsCountSnap, auditsCountSnap, noncesCountSnap, recentAuditsSnap] = await Promise.all([
    db.collection("antiAbuseDeviceClaims").count().get(),
    db.collection("antiAbuseAuditLogs").count().get(),
    db.collection("antiAbuseUsedNonces").count().get(),
    db.collection("antiAbuseAuditLogs").orderBy("createdAt", "desc").limit(100).get(),
  ]);

  const byStatus: Record<string, number> = {};
  const byIntegrityReason: Record<string, number> = {};
  let playIntegrityTrue = 0;
  let playIntegrityFalse = 0;
  let decodeErrors = 0;

  for (const doc of recentAuditsSnap.docs) {
    const d = doc.data() || {};
    const status = typeof d.status === "string" ? d.status : "UNKNOWN";
    const reason = typeof d.integrityReason === "string" ? d.integrityReason : "NONE";
    byStatus[status] = (byStatus[status] || 0) + 1;
    byIntegrityReason[reason] = (byIntegrityReason[reason] || 0) + 1;
    if (d.playIntegrityVerified === true) playIntegrityTrue++;
    else playIntegrityFalse++;
    if (reason.startsWith("INTEGRITY_DECODE_HTTP_") || reason === "PLAY_INTEGRITY_DECODE_ERROR") {
      decodeErrors++;
    }
  }

  const sampleSize = recentAuditsSnap.size;
  if (sampleSize >= 5 && decodeErrors / sampleSize >= 0.2) {
    alerts.push({
      severity: "CRITICAL",
      code: "PLAY_INTEGRITY_DECODE_ERROR_SPIKE",
      message: `High Play Integrity decode failure rate: ${decodeErrors}/${sampleSize} recent audits.`,
    });
  }

  const signalUnavailable = byStatus.SIGNAL_UNAVAILABLE || 0;
  if (sampleSize >= 10 && signalUnavailable / sampleSize >= 0.25) {
    alerts.push({
      severity: "WARNING",
      code: "DEVICE_SIGNAL_UNAVAILABLE_SPIKE",
      message: `Elevated missing-signal rate: ${signalUnavailable}/${sampleSize} recent audits.`,
    });
  }

  const verificationRequired = byStatus.VERIFICATION_REQUIRED || 0;
  if (sampleSize >= 10 && verificationRequired / sampleSize >= 0.25) {
    alerts.push({
      severity: "WARNING",
      code: "VERIFICATION_REQUIRED_SPIKE",
      message: `Elevated Play Integrity denial/observation rate: ${verificationRequired}/${sampleSize}.`,
    });
  }

  const hasCritical = alerts.some((a) => a.severity === "CRITICAL");
  return sendJson(res, hasCritical ? 503 : 200, {
    ok: !hasCritical,
    healthy: !hasCritical,
    checkedAt: new Date().toISOString(),
    config: {
      mode: flags.mode,
      requirePlayIntegrity: flags.requirePlayIntegrity,
      enforceDeviceFreeClaim: flags.enforceDeviceFreeClaim,
      allowSignalUnavailableFallback: flags.allowSignalUnavailableFallback,
      remoteConfigExists: Boolean(cfgSnap?.exists),
      killSwitchActive: cfgSnap?.exists ? cfgSnap.data()?.killSwitch === true : false,
      playCertPinConfigured: Boolean(process.env.BHUMI_PLAY_CERT_SHA256_B64?.trim()),
    },
    counts: {
      antiAbuseDeviceClaims: claimsCountSnap.data().count,
      antiAbuseAuditLogs: auditsCountSnap.data().count,
      antiAbuseUsedNonces: noncesCountSnap.data().count,
    },
    recentSampleSize: sampleSize,
    byStatus,
    byIntegrityReason,
    playIntegrityTrue,
    playIntegrityFalse,
    alerts,
  });
}

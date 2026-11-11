#!/usr/bin/env node
/**
 * Read-only VC 122 Production Preflight & Anti-Abuse Monitoring Script
 * - Verifies billing-verifier endpoints fail closed with expected CORS & auth responses
 * - Inspects non-PII aggregate metrics & app_config/antiAbuse via ADC (never mutates entitlements or reads PII)
 */

const BASE_URL = (process.env.BHUMI_BILLING_VERIFIER_URL || "https://bhumi-billing-verifier.vercel.app").replace(/\/+$/, "");
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "bhumiamartya-fe85c";

async function checkEndpoint(name, path, init, expectedStatus, checkBody) {
  const res = await fetch(`${BASE_URL}${path}`, init);
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  const okStatus = res.status === expectedStatus;
  const okBody = checkBody ? checkBody(json, res) : true;
  if (!okStatus || !okBody) {
    throw new Error(`${name} failed: status=${res.status} (expected ${expectedStatus}), body=${text.slice(0, 200)}`);
  }
  return { name, status: res.status, error: json?.error || null };
}

async function checkLiveEndpoints() {
  const results = [];
  results.push(
    await checkEndpoint(
      "CORS preflight bootstrap-trial",
      "/api/access/bootstrap-trial",
      { method: "OPTIONS", headers: { Origin: "https://localhost" } },
      204,
      (_json, res) => {
        const allowHeaders = res.headers.get("access-control-allow-headers") || "";
        return allowHeaders.includes("X-Firebase-AppCheck") && allowHeaders.includes("Authorization");
      },
    ),
  );
  results.push(
    await checkEndpoint(
      "Challenge unauthenticated",
      "/api/access/challenge",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
      401,
      (j) => j?.ok === false && j?.error === "AUTH_MISSING",
    ),
  );
  results.push(
    await checkEndpoint(
      "Bootstrap trial unauthenticated",
      "/api/access/bootstrap-trial",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: '{"platform":"android"}' },
      401,
      (j) => j?.ok === false && j?.outcome === "RETRYABLE_ERROR" && j?.error === "AUTH_MISSING",
    ),
  );
  results.push(
    await checkEndpoint(
      "Bootstrap trial disallowed origin",
      "/api/access/bootstrap-trial",
      {
        method: "POST",
        headers: { Origin: "https://evil.example.com", "Content-Type": "application/json" },
        body: '{"platform":"android"}',
      },
      403,
      (j) => j?.ok === false && j?.error === "ORIGIN_NOT_ALLOWED",
    ),
  );
  results.push(
    await checkEndpoint(
      "Reconcile deletion unauthenticated",
      "/api/account/reconcile-deletion",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
      401,
      (j) => j?.ok === false && j?.error === "AUTH_MISSING",
    ),
  );
  results.push(
    await checkEndpoint(
      "Play billing verify unauthenticated",
      "/api/billing/google-play/verify",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
      401,
      (j) => j?.ok === false && j?.error === "AUTH_MISSING",
    ),
  );
  results.push(
    await checkEndpoint(
      "Billing reconcile cron fail-closed",
      "/api/billing/reconcile",
      { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
      401,
      (j) => j?.ok === false && j?.error === "UNAUTHORIZED_CRON",
    ),
  );
  results.push(
    await checkEndpoint(
      "Anti-abuse monitor cron fail-closed",
      "/api/access/monitor",
      { method: "GET" },
      401,
      (j) => j?.ok === false && j?.error === "UNAUTHORIZED_CRON",
    ),
  );
  return results;
}

async function inspectFirestoreReadOnly() {
  const { execSync } = await import("node:child_process");
  let accessToken = "";
  try {
    accessToken = execSync("gcloud auth print-access-token", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return { available: false, reason: "GCLOUD_TOKEN_UNAVAILABLE" };
  }
  if (!accessToken) {
    return { available: false, reason: "GCLOUD_TOKEN_EMPTY" };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "x-goog-user-project": FIREBASE_PROJECT_ID,
    "Content-Type": "application/json",
  };

  // Read app_config/antiAbuse config doc only (zero PII)
  const cfgRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/(default)/documents/app_config/antiAbuse`,
    { headers },
  );
  let appConfigAntiAbuse = { exists: false, httpStatus: cfgRes.status };
  if (cfgRes.ok) {
    const cfgJson = await cfgRes.json();
    const fields = cfgJson.fields || {};
    appConfigAntiAbuse = {
      exists: true,
      httpStatus: cfgRes.status,
      mode: fields.mode?.stringValue ?? null,
      killSwitch: fields.killSwitch?.booleanValue ?? null,
      requirePlayIntegrity: fields.requirePlayIntegrity?.booleanValue ?? null,
      enforceDeviceFreeClaim: fields.enforceDeviceFreeClaim?.booleanValue ?? null,
    };
  }

  // Aggregation count queries across anti-abuse operational collections only (zero user PII)
  const counts = {};
  for (const col of ["antiAbuseDeviceClaims", "antiAbuseAuditLogs", "antiAbuseUsedNonces"]) {
    const aggRes = await fetch(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/(default)/documents:runAggregationQuery`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          structuredAggregationQuery: {
            structuredQuery: { from: [{ collectionId: col }] },
            aggregations: [{ alias: "total", count: {} }],
          },
        }),
      },
    );
    if (aggRes.ok) {
      const aggJson = await aggRes.json();
      const total = Number(aggJson?.[0]?.result?.aggregateFields?.total?.integerValue ?? 0);
      counts[col] = { ok: true, count: total };
    } else {
      counts[col] = { ok: false, httpStatus: aggRes.status };
    }
  }

  // Read-only recent audit categorical summary (status, mode, platform, playIntegrityVerified, integrityReason only)
  const auditSummary = { byStatus: {}, byIntegrityReason: {}, playIntegrityTrue: 0, playIntegrityFalse: 0 };
  const qRes = await fetch(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(FIREBASE_PROJECT_ID)}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "antiAbuseAuditLogs" }],
          orderBy: [{ field: { fieldPath: "createdAt" }, direction: "DESCENDING" }],
          limit: 50,
          select: {
            fields: [
              { fieldPath: "status" },
              { fieldPath: "mode" },
              { fieldPath: "platform" },
              { fieldPath: "playIntegrityVerified" },
              { fieldPath: "integrityReason" },
            ],
          },
        },
      }),
    },
  );
  if (qRes.ok) {
    const rows = await qRes.json();
    for (const row of Array.isArray(rows) ? rows : []) {
      const f = row?.document?.fields;
      if (!f) continue;
      const status = f.status?.stringValue || "UNKNOWN";
      const reason = f.integrityReason?.stringValue || "NONE";
      const pi = Boolean(f.playIntegrityVerified?.booleanValue);
      auditSummary.byStatus[status] = (auditSummary.byStatus[status] || 0) + 1;
      auditSummary.byIntegrityReason[reason] = (auditSummary.byIntegrityReason[reason] || 0) + 1;
      if (pi) auditSummary.playIntegrityTrue += 1;
      else auditSummary.playIntegrityFalse += 1;
    }
  }

  return { available: true, appConfigAntiAbuse, counts, auditSummary };
}

async function inspectCronMonitor() {
  const secret = process.env.BHUMI_VERIFIER_CRON_SECRET?.trim();
  if (!secret) {
    return { configured: false, reason: "BHUMI_VERIFIER_CRON_SECRET_NOT_SET" };
  }
  const res = await fetch(`${BASE_URL}/api/access/monitor`, {
    method: "GET",
    headers: { Authorization: `Bearer ${secret}` },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  if (!res.ok || json?.healthy === false) {
    throw new Error(`CRON_MONITOR_ALERT status=${res.status} alerts=${JSON.stringify(json?.alerts || [])}`);
  }
  return { configured: true, status: res.status, summary: json };
}

async function main() {
  const endpoints = await checkLiveEndpoints();
  const cronMonitor = await inspectCronMonitor();
  const firestore = await inspectFirestoreReadOnly();
  console.log(JSON.stringify({ ok: true, baseUrl: BASE_URL, projectId: FIREBASE_PROJECT_ID, endpoints, cronMonitor, firestore }, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});

import { getPlayReportsAccessToken, type PlayAuthResult } from "./playAuth";

const DEFAULT_PACKAGE_NAME = "com.bhumiamartya.app";

export function getPackageName(): string {
  return process.env.ANDROID_PACKAGE_NAME?.trim() || DEFAULT_PACKAGE_NAME;
}

export type PlayReportErrorCode =
  | "CONFIG_REQUIRED"
  | "AUTH_ERROR"
  | "PERMISSION_DENIED"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INVALID_RESPONSE";

export type PlayReportSuccess<T> = {
  ok: true;
  data: T;
};

export type PlayReportFailure = {
  ok: false;
  code: PlayReportErrorCode;
  status?: number;
  message?: string;
};

export type PlayReportResult<T> = PlayReportSuccess<T> | PlayReportFailure;

export function classifyHttpStatus(status: number, defaultMessage: string): PlayReportFailure {
  if (status === 401) {
    return { ok: false, code: "AUTH_ERROR", status, message: defaultMessage || "Unauthorized" };
  }
  if (status === 403) {
    return { ok: false, code: "PERMISSION_DENIED", status, message: defaultMessage || "Permission denied" };
  }
  if (status === 404) {
    return { ok: false, code: "NOT_FOUND", status, message: defaultMessage || "Resource not found" };
  }
  if (status === 429) {
    return { ok: false, code: "RATE_LIMITED", status, message: defaultMessage || "Rate limit exceeded" };
  }
  return { ok: false, code: "UPSTREAM_ERROR", status, message: defaultMessage || `Google API error (Status ${status})` };
}

export async function fetchPlayReviews(): Promise<PlayReportResult<{ reviews: unknown[] }>> {
  const authRes = await getPlayReportsAccessToken();
  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const pkg = getPackageName();
  const url = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(pkg)}/reviews`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authRes.token}` },
    });

    if (!res.ok) {
      return classifyHttpStatus(res.status, `Reviews API returned status ${res.status}`);
    }

    const data = await res.json();
    return { ok: true, data: { reviews: data.reviews || [] } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

export async function fetchCrashRateMetric(): Promise<PlayReportResult<unknown>> {
  const authRes = await getPlayReportsAccessToken();
  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const pkg = getPackageName();
  const url = `https://playdeveloperreporting.googleapis.com/v1beta1/apps/${encodeURIComponent(pkg)}/crashRateMetricSet:query`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authRes.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metrics: ["crashRate"],
        timelineSpec: { aggregationPeriod: "DAILY" },
      }),
    });

    if (!res.ok) {
      return classifyHttpStatus(res.status, `Crash Rate API returned status ${res.status}`);
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

export async function fetchAnrRateMetric(): Promise<PlayReportResult<unknown>> {
  const authRes = await getPlayReportsAccessToken();
  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const pkg = getPackageName();
  const url = `https://playdeveloperreporting.googleapis.com/v1beta1/apps/${encodeURIComponent(pkg)}/anrRateMetricSet:query`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authRes.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metrics: ["anrRate"],
        timelineSpec: { aggregationPeriod: "DAILY" },
      }),
    });

    if (!res.ok) {
      return classifyHttpStatus(res.status, `ANR Rate API returned status ${res.status}`);
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

export async function fetchStorePerformanceMetric(): Promise<PlayReportResult<unknown>> {
  const authRes = await getPlayReportsAccessToken();
  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const pkg = getPackageName();
  const url = `https://playdeveloperreporting.googleapis.com/v1beta1/apps/${encodeURIComponent(pkg)}/storePerformanceMetricSet:query`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authRes.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        metrics: ["storePerformance"],
        timelineSpec: { aggregationPeriod: "DAILY" },
      }),
    });

    if (!res.ok) {
      return classifyHttpStatus(res.status, `Store Performance API returned status ${res.status}`);
    }

    const data = await res.json();
    return { ok: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

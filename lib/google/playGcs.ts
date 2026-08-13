import { getPlayReportsAccessToken } from "./playAuth";
import { classifyHttpStatus, type PlayReportResult } from "./playReporting";

const DEFAULT_BUCKET_NAME = "pubsite_prod_4753825950500775050";

export function getBucketName(): string {
  return process.env.PLAY_GCS_BUCKET_NAME?.trim() || DEFAULT_BUCKET_NAME;
}

export type StorageObject = {
  name: string;
  bucket: string;
  size?: string;
  updated?: string;
};

export type StorageObjectsListResponse = {
  kind: string;
  nextPageToken?: string;
  items?: StorageObject[];
};

export async function listGcsObjects(
  prefix: string,
  options?: { maxResults?: number; pageToken?: string }
): Promise<PlayReportResult<StorageObjectsListResponse>> {
  const authRes = await getPlayReportsAccessToken([
    "https://www.googleapis.com/auth/devstorage.read_only",
  ]);

  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const bucket = getBucketName();
  const url = new URL(`https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o`);
  url.searchParams.set("prefix", prefix);
  if (options?.maxResults) {
    url.searchParams.set("maxResults", String(options.maxResults));
  }
  if (options?.pageToken) {
    url.searchParams.set("pageToken", options.pageToken);
  }

  try {
    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${authRes.token}` },
    });

    if (!res.ok) {
      if (res.status === 403) {
        return {
          ok: false,
          code: "PERMISSION_DENIED",
          status: 403,
          message: `GCS 403 Forbidden accessing bucket ${bucket} prefix ${prefix}`,
        };
      }
      return classifyHttpStatus(res.status, `GCS API returned status ${res.status}`);
    }

    const data = (await res.json()) as StorageObjectsListResponse;
    return { ok: true, data };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

export async function downloadGcsObjectContent(
  objectName: string
): Promise<PlayReportResult<string>> {
  const authRes = await getPlayReportsAccessToken([
    "https://www.googleapis.com/auth/devstorage.read_only",
  ]);

  if (!authRes.ok) {
    return { ok: false, code: authRes.code, message: authRes.message };
  }

  const bucket = getBucketName();
  const url = `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(
    bucket
  )}/o/${encodeURIComponent(objectName)}?alt=media`;

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${authRes.token}` },
    });

    if (!res.ok) {
      return classifyHttpStatus(res.status, `GCS Media API returned status ${res.status}`);
    }

    const text = await res.text();
    return { ok: true, data: text };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, code: "UPSTREAM_ERROR", message: msg };
  }
}

export const GCS_PREFIXES = {
  installs: "stats/installs/",
  storePerformance: "stats/store_performance/",
  sales: "sales/",
  earnings: "earnings/",
  reviews: "reviews/",
  ratings: "stats/ratings/",
  crashes: "stats/crashes/",
  financialSubscriptions: "financial-stats/subscriptions/",
} as const;

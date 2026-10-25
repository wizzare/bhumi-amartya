export function createRateLimiter({ limit, windowMs, now = Date.now }) {
  if (!Number.isInteger(limit) || limit < 1) throw new Error("QA_VERCEL_RATE_LIMIT_INVALID");
  if (!Number.isInteger(windowMs) || windowMs < 1) throw new Error("QA_VERCEL_RATE_WINDOW_INVALID");
  const buckets = new Map();

  function prune(nowMs) {
    if (buckets.size < 1000) return;
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= nowMs) buckets.delete(key);
    }
  }

  return Object.freeze({
    check(key) {
      const nowMs = now();
      const normalized = typeof key === "string" && key ? key : "unknown";
      const existing = buckets.get(normalized);
      if (!existing || existing.resetAt <= nowMs) {
        buckets.set(normalized, { count: 1, resetAt: nowMs + windowMs });
        prune(nowMs);
        return true;
      }
      if (existing.count >= limit) return false;
      existing.count += 1;
      return true;
    },
    size() {
      return buckets.size;
    },
  });
}

export function clientKey(req) {
  const forwarded = req?.headers?.["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = String(raw || "").split(",")[0].trim();
  if (first) return first;
  const remote = req?.socket?.remoteAddress;
  return typeof remote === "string" && remote ? remote : "unknown";
}

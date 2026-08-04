// Dev-only Firestore query instrumentation (Phase A / Build 84 read-reduction).
// Never log email, tokens, credentials, or private user content — only shape/cost metadata.
const counts = new Map<string, number>();

export function logQuery(params: { name: string; component: string; expectedMax: number; durationMs: number }): void {
  if (process.env.NODE_ENV !== "development") return;
  const count = (counts.get(params.name) ?? 0) + 1;
  counts.set(params.name, count);
  console.debug(
    `[query] ${params.name} @ ${params.component} — expectedMax=${params.expectedMax} count=${count} durationMs=${params.durationMs.toFixed(1)}`
  );
}

export async function timedQuery<T>(
  params: { name: string; component: string; expectedMax: number },
  run: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    return await run();
  } finally {
    logQuery({ ...params, durationMs: performance.now() - start });
  }
}

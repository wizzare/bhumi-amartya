export type MoanaRuntimeDiagnosticEntry = {
  at: string;
  event: string;
  payload: Record<string, unknown>;
};

export const MOANA_RUNTIME_DIAGNOSTICS_KEY = "moana:v58:section4JourneyDiagnostics";
const MAX_ENTRIES = 80;

function readEntries(): MoanaRuntimeDiagnosticEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(MOANA_RUNTIME_DIAGNOSTICS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getMoanaRuntimeDiagnostics(): MoanaRuntimeDiagnosticEntry[] {
  return readEntries();
}

export function clearMoanaRuntimeDiagnostics(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(MOANA_RUNTIME_DIAGNOSTICS_KEY);
  window.dispatchEvent(new CustomEvent("moana-runtime-diagnostics"));
}

export function appendMoanaRuntimeDiagnostic(event: string, payload: Record<string, unknown> = {}): void {
  const entry: MoanaRuntimeDiagnosticEntry = {
    at: new Date().toISOString(),
    event,
    payload,
  };

  if (typeof window !== "undefined") {
    const next = [...readEntries(), entry].slice(-MAX_ENTRIES);
    try {
      window.localStorage.setItem(MOANA_RUNTIME_DIAGNOSTICS_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent("moana-runtime-diagnostics"));
    } catch {
      // Console output still gives Android WebView / remote-debug proof if localStorage fails.
    }
  }

  console.info("[MOANA_RUNTIME_DIAG]", entry);
}

export function toDiagnosticError(error: unknown): Record<string, unknown> {
  if (!error || typeof error !== "object") {
    return { message: String(error) };
  }

  const record = error as Record<string, unknown>;
  return {
    name: typeof record.name === "string" ? record.name : undefined,
    code: typeof record.code === "string" ? record.code : undefined,
    message: typeof record.message === "string" ? record.message : String(error),
    stack: typeof record.stack === "string" ? record.stack.slice(0, 800) : undefined,
  };
}

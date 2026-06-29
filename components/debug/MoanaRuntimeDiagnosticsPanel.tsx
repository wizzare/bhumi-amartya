"use client";

import React from "react";
import {
  clearMoanaRuntimeDiagnostics,
  getMoanaRuntimeDiagnostics,
  MOANA_RUNTIME_DIAGNOSTICS_KEY,
  type MoanaRuntimeDiagnosticEntry,
} from "@/lib/innerwork/moanaRuntimeDiagnostics";

export function MoanaRuntimeDiagnosticsPanel({ label }: { label: string }) {
  const [entries, setEntries] = React.useState<MoanaRuntimeDiagnosticEntry[]>([]);
  const [isDevDebugEnabled, setIsDevDebugEnabled] = React.useState(false);

  React.useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const hasExplicitDebugFlag = typeof window !== "undefined" && window.localStorage.getItem("moana_show_diagnostics") === "true";
    const enabled = isDev && hasExplicitDebugFlag;
    setIsDevDebugEnabled(enabled);

    if (!enabled) return;

    const refresh = () => setEntries(getMoanaRuntimeDiagnostics());
    refresh();
    window.addEventListener("moana-runtime-diagnostics", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("moana-runtime-diagnostics", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  if (!isDevDebugEnabled) {
    return null;
  }

  const latest = entries.slice(-12).reverse();

  return (
    <section className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-red-950">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">MOANA v58 Runtime Diagnostics</p>
          <p className="mt-1 text-xs font-semibold">{label}</p>
          <p className="mt-1 text-[10px] text-red-700">localStorage: {MOANA_RUNTIME_DIAGNOSTICS_KEY}</p>
        </div>
        <button
          type="button"
          onClick={clearMoanaRuntimeDiagnostics}
          className="rounded-lg border border-red-300 px-2 py-1 text-[10px] font-bold uppercase text-red-700"
        >
          Clear
        </button>
      </div>

      <div className="mt-3 max-h-72 space-y-2 overflow-auto rounded-xl bg-white/70 p-3">
        {latest.length > 0 ? latest.map((entry, index) => (
          <pre key={`${entry.at}-${index}`} className="whitespace-pre-wrap break-words text-[10px] leading-relaxed text-red-950">
            {JSON.stringify(entry, null, 2)}
          </pre>
        )) : (
          <p className="text-xs text-red-700">No runtime diagnostics captured yet. Tap a Section 4 button or save a practice.</p>
        )}
      </div>
    </section>
  );
}

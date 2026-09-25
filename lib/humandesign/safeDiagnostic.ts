const categories = ["human-design", "blueprint", "settings", "banner", "natal", "repository", "storage"] as const;
const stages = ["validate", "calculate", "recover", "save", "load", "retry", "dismiss", "normalize"] as const;
type DiagnosticCategory = typeof categories[number];
type DiagnosticStage = typeof stages[number];
type DiagnosticFlags = Partial<Record<"failed" | "complete" | "preserved" | "started" | "valid" | "conflict" | "offline", boolean>> & { elapsedMs?: number; retries?: number };

export function safeDiagnostic(category: DiagnosticCategory, stage: DiagnosticStage, flags: DiagnosticFlags = {}): void {
  if (!categories.includes(category) || !stages.includes(stage)) return;
  const output: Record<string, string | number | boolean> = { category, stage };
  for (const key of ["failed", "complete", "preserved", "started", "valid", "conflict", "offline"] as const) {
    if (typeof flags[key] === "boolean") output[key] = flags[key];
  }
  for (const key of ["elapsedMs", "retries"] as const) {
    const value = flags[key];
    if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 86_400_000) output[key] = Math.floor(value);
  }
  console.info("[DIAGNOSTIC]", output);
}

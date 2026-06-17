import { getCanonicalHumanDesign } from "@/lib/humandesign/hdAudit";

type DailyContentKeyInput = {
  uid: string;
  localDateKey: string;
  blueprint?: Record<string, unknown> | null;
  blueprintSummary?: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 96);
}

function compactHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function weekdayKey(localDateKey: string): string {
  const date = new Date(`${localDateKey}T12:00:00`);
  return Number.isFinite(date.getTime())
    ? date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()
    : "weekday-unknown";
}

export function createBlueprintDailySummary(
  blueprint?: Record<string, unknown> | null,
  fallbackSummary?: string | null,
): string {
  const root = asRecord(blueprint);
  const lifePath = asRecord(root.lifePath);
  const humanDesign = asRecord(getCanonicalHumanDesign(root.humanDesign));
  const destinyMatrix = asRecord(root.destinyMatrix);
  const astrology = asRecord(root.astrology || root.natalChart);

  const parts = [
    text(lifePath.number || root.lifePathNumber || root.lifePath),
    text(humanDesign.type),
    text(humanDesign.profile),
    text(destinyMatrix.center || root.arcanaCenter),
    text(astrology.sunSign || root.sunSign),
    text(astrology.moonSign || root.moonSign),
    text(astrology.ascendant || astrology.risingSign || root.risingSign),
    text(fallbackSummary),
  ].filter(Boolean);

  return normalize(parts.join("-")) || "blueprint-unknown";
}

export function createDailyContentKey(input: DailyContentKeyInput): string {
  const blueprintSummary = createBlueprintDailySummary(input.blueprint, input.blueprintSummary);
  return [
    input.localDateKey,
    weekdayKey(input.localDateKey),
    input.uid,
    blueprintSummary,
  ].join("|");
}

export function createDailyContentSeed(input: DailyContentKeyInput): string {
  const key = createDailyContentKey(input);
  return `${key}|${compactHash(key)}`;
}

export function seededIndex(seed: string, length: number, offset = 0): number {
  if (length <= 0) return 0;
  const hash = compactHash(`${seed}|${offset}`);
  return Number.parseInt(hash, 36) % length;
}

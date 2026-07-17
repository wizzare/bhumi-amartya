import assert from "node:assert/strict";
import test from "node:test";
import { longitudinalWellnessEngine } from "@/lib/engines/longitudinalWellnessEngine";
import type { WellnessEventInput } from "@/lib/types/longitudinalWellness";

const NOW = new Date("2026-07-13T12:00:00.000Z");

function event(daysBefore: number, id: string, rawDomain: string, overrides: Partial<WellnessEventInput> = {}) {
  const timestamp = new Date(NOW.getTime() - daysBefore * 86_400_000).toISOString();
  return longitudinalWellnessEngine.normalizeEvent({
    timestamp,
    dateKey: timestamp.slice(0, 10),
    recommendationId: id,
    rawDomain,
    subcategory: rawDomain,
    durationMinutes: 8,
    period: "night",
    difficulty: "beginner",
    energyCapacity: "medium",
    environment: "indoor",
    ...overrides,
  });
}

test("menghasilkan observasi terstruktur tanpa mekanik permainan", () => {
  const events = [
    event(1, "reflection-journal", "reflection"),
    event(3, "reflection-journal", "reflection"),
    event(5, "reflection-journal", "reflection"),
    event(18, "breath-box", "breath"),
    event(35, "nature-walk", "nature", { environment: "outdoor" }),
    event(40, "nature-walk", "nature", { environment: "outdoor" }),
  ];
  const result = longitudinalWellnessEngine.observe(events, NOW);
  const serialized = JSON.stringify(result).toLowerCase();

  assert.equal(result.rhythm.preferredPeriod, "night");
  assert.ok(result.emergingHabits.some((habit) => habit.recommendationId === "reflection-journal"));
  assert.ok(result.variety.dormantPractices.some((item) => item.recommendationId === "nature-walk"));
  for (const forbidden of ["streak", "points", "ranking", "badges", "leaderboard", "completionrate", "diversityindex"]) {
    assert.equal(serialized.includes(forbidden), false);
  }
});

test("menahan event secara terbatas dan tidak menciptakan pola tanpa bukti", () => {
  const duplicate = event(1, "mind-focus", "mind", { eventId: "same-event" });
  const retained = longitudinalWellnessEngine.retain([duplicate, duplicate], NOW);
  assert.equal(retained.length, 2);
  assert.equal(longitudinalWellnessEngine.observe([], NOW).patterns.length, 0);
});

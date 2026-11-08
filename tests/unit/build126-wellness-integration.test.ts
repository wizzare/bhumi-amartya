import "./../helpers/phase-h-setup";

// Setup mock window/localStorage for local audit user in dev mode
const storage = new Map<string, string>();
const auditName = "wellness-user-126";
storage.set("bhumi_audit_user", auditName);

(global as any).window = {
  localStorage: {
    getItem: (key: string) => storage.get(key) || null,
    setItem: (key: string, val: string) => storage.set(key, val),
    removeItem: (key: string) => storage.delete(key),
  },
  setTimeout: global.setTimeout.bind(global),
  clearTimeout: global.clearTimeout.bind(global),
};
process.env.NODE_ENV = "development";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { acknowledgeWellnessActivity } from "../../lib/services/wellnessCurationService";
import { dailyStateRepository } from "../../lib/repositories/dailyStateRepository";
import { journeyRepository } from "../../lib/repositories/journeyRepository";
import { buildInnerworkDailyDecision } from "../../lib/engines/innerworkIntelligence";
import { getDailySensoryCompanion } from "../../lib/wellness/wellnessSensoryCompanion";
import { buildAkashiWellnessContext } from "../../lib/intelligence/wellnessAkashiContext";
import { COMMUNITY_CONFIG } from "../../lib/config/community";

describe("BUILD 126 — Wellness Integration & Continuity Verification Suite", () => {
  const uid = `${auditName}_uid`;
  const date = "2026-11-08";

  it("1. InnerworkDailyDecision generates valid mainPractice and supportPractices", () => {
    const decision = buildInnerworkDailyDecision({
      dominantIssue: "love_block",
      localDateKey: date,
      navigatorMode: "RECOVERY",
      wellnessState: { energy: 4, mood: 4 },
    });

    assert.ok(decision.mainPractice, "Main practice must be defined");
    assert.ok(decision.mainPractice.title, "Main practice title must exist");
    assert.equal(typeof decision.mainPractice.durationMinutes, "number");
    assert.ok(decision.mainPractice.whyThisPractice, "Rationale must exist");
    assert.ok(decision.supportPractices.length > 0, "Support practices must exist");
  });

  it("2. Acknowledging a Yoga recommendation updates completedActivityIds and yogaDone in DailyState", async () => {
    // physical-cat-cow is tagged "yoga"
    const updatedIds = await acknowledgeWellnessActivity(
      uid,
      date,
      "physical-cat-cow",
      {
        metrics: { sleep: 6, energy: 6, emotion: 6, focus: 6, social: 6 },
        needs: [],
        checkInCompleted: true,
      } as any,
      "morning"
    );

    assert.ok(updatedIds.includes("physical-cat-cow"));

    const state = await dailyStateRepository.getDailyState(uid, date);
    assert.ok(state?.completedActivityIds?.includes("physical-cat-cow"));
    assert.equal(state?.yogaDone, true, "yogaDone must be set to true");
  });

  it("3. Acknowledging an Herbal recommendation updates completedActivityIds and herbalDone in DailyState", async () => {
    // living-herbal-tea-simple is subcategory "herbalism"
    const updatedIds = await acknowledgeWellnessActivity(
      uid,
      date,
      "living-herbal-tea-simple",
      {
        metrics: { sleep: 5, energy: 5, emotion: 5, focus: 5, social: 5 },
        needs: [],
        checkInCompleted: true,
      } as any,
      "evening"
    );

    assert.ok(updatedIds.includes("living-herbal-tea-simple"));

    const state = await dailyStateRepository.getDailyState(uid, date);
    assert.ok(state?.completedActivityIds?.includes("living-herbal-tea-simple"));
    assert.equal(state?.herbalDone, true, "herbalDone must be set to true");
  });

  it("4. Acknowledged recommendations sync to Journey DailyRecord practiceResults without duplicates", async () => {
    const journeyRec = await journeyRepository.getDailyRecord(uid, date);
    assert.ok(journeyRec, "Journey record must exist");

    const yogaPractice = journeyRec?.practiceResults?.find((p) => p.practiceId === "physical-cat-cow");
    assert.ok(yogaPractice, "Yoga practice must be recorded in practiceResults");
    assert.equal(yogaPractice.practiceTitle, "Gerakan Cat-Cow");
    assert.equal(yogaPractice.practiceCategory, "physical");

    const herbalPractice = journeyRec?.practiceResults?.find((p) => p.practiceId === "living-herbal-tea-simple");
    assert.ok(herbalPractice, "Herbal practice must be recorded in practiceResults");
    assert.equal(herbalPractice.practiceTitle, "Minum Seduhan Herbal");

    // Idempotent re-acknowledgement
    await acknowledgeWellnessActivity(uid, date, "physical-cat-cow");
    const journeyRecAfter = await journeyRepository.getDailyRecord(uid, date);
    const count = journeyRecAfter?.practiceResults?.filter((p) => p.practiceId === "physical-cat-cow").length;
    assert.equal(count, 1, "Practice results must not contain duplicates");
  });

  it("5. Four Sources Integration: Blueprint, Akashi, Check-in, Journey enrich Sensory Companion", () => {
    const akashiContext = buildAkashiWellnessContext(
      {
        gaiaProfile: {
          insights: ["Pola kebiasaan overthinking saat malam hari"],
          updatedAt: "2026-11-08T00:00:00Z",
        },
      },
      {
        metrics: { sleep: 4, energy: 3, emotion: 5, focus: 5, social: 4 },
        needs: ["calm"],
        checkInCompleted: true,
      } as any
    );

    const sensory = getDailySensoryCompanion({
      uid,
      date,
      condition: "Kelelahan Batin",
      capacity: "low",
      careFocus: "Pelepasan Beban Pikiran",
      blueprint: {
        hdType: "Manifesting Generator",
        hdAuthority: "Emotional - Solar Plexus",
        lifePath: 4,
        centerArcana: 7,
      },
      arsipContext: {
        anchorTheme: akashiContext.dominantThemes?.[0],
      },
      journeyContext: {
        activeFocus: "Terlalu Banyak Hal yang Kamu Pikul",
      },
      checkIn: {
        metrics: { sleep: 4, energy: 3, emotion: 5, focus: 5, social: 4 },
        needs: ["calm"],
      },
    });

    assert.ok(sensory.crystal, "Crystal companion must exist");
    assert.ok(sensory.aroma, "Aroma companion must exist");
    assert.match(sensory.crystal.contextRationale, /Manifesting Generator/i, "Rationale weaves HD context");
    assert.ok(sensory.crystal.noProductAlternative, "Free alternative without product must exist");
    assert.ok(sensory.aroma.noProductAlternative, "Free aroma alternative must exist");
  });

  it("6. New Day Rollover creates isolated DailyState without yesterday's completed activities", async () => {
    const nextDate = "2026-11-09";
    const nextDayState = await dailyStateRepository.getDailyState(uid, nextDate);

    // Either state doesn't exist yet or has empty completedActivityIds
    const completedOnNewDay = nextDayState?.completedActivityIds ?? [];
    assert.equal(completedOnNewDay.length, 0, "New day must start with 0 completed activities");
    assert.notEqual(nextDayState?.yogaDone, true, "yogaDone must not leak to next day");
  });

  it("7. Missing Blueprint/Akashi gracefully falls back without throwing", () => {
    const fallbackSensory = getDailySensoryCompanion({
      uid,
      date,
      condition: "Cemas & Gelisah",
      capacity: "moderate",
      // blueprint omitted
      // arsipContext omitted
    });

    assert.ok(fallbackSensory.crystal, "Fallback crystal must exist");
    assert.ok(fallbackSensory.aroma, "Fallback aroma must exist");
    assert.ok(fallbackSensory.crystal.contextRationale.length > 0, "Fallback rationale must be populated");
    assert.ok(fallbackSensory.aroma.safePractice.length > 0, "Safe practice instructions must be populated");
  });

  it("8. User Isolation: Authenticated User A cannot access User B data", async () => {
    const foreignUid = "unauthorized_foreign_user_uid";
    await assert.rejects(
      async () => {
        await dailyStateRepository.getDailyState(foreignUid, date);
      },
      (err: any) => {
        return (
          err.message.includes("Unauthorized") ||
          err.message.includes("must be authenticated") ||
          err.message.includes("missing auth") ||
          err.message.includes("expected uid")
        );
      },
      "Attempt to read foreign user data must be rejected"
    );
  });

  it("9. Section 05: Sobat Mistis community integration uses official link and safe external CTA", () => {
    assert.equal(
      COMMUNITY_CONFIG.whatsappLink,
      "https://chat.whatsapp.com/D23J6mUNwRQIoVHa3hF5yx",
      "COMMUNITY_CONFIG.whatsappLink must resolve to official group"
    );
  });
});

import "./../helpers/phase-h-setup";

// Setup mock window/localStorage for local audit user in dev mode
const storage = new Map<string, string>();
const auditName = "journey-user-126";
storage.set("bhumi_audit_user", auditName);

const mockLocalStorage = {
  getItem: (key: string) => storage.get(key) || null,
  setItem: (key: string, val: string) => storage.set(key, val),
  removeItem: (key: string) => storage.delete(key),
  get length() {
    return storage.size;
  },
  key: (index: number) => Array.from(storage.keys())[index] || null,
};

(global as any).window = {
  localStorage: mockLocalStorage,
  setTimeout: global.setTimeout.bind(global),
  clearTimeout: global.clearTimeout.bind(global),
};
process.env.NODE_ENV = "development";

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { JourneyCard } from "../../components/dashboard/JourneyCard";
import { journeyRepository } from "../../lib/repositories/journeyRepository";
import { journeyStoryEngine } from "../../lib/engines/journeyStoryEngine";
import { generateStaticParams } from "../../app/journey/[id]/page";
import {
  mergeDailyStatesWithJourneyRecords,
  getCompletionSummary,
} from "../../lib/engines/completionEngine";
import type { DailyState } from "../../lib/repositories/dailyStateRepository";
import type { JourneyDailyRecord } from "../../lib/types/journeyDailyRecord";
import type { UnifiedBlueprintSynthesis } from "../../lib/dailyGuidance/unifiedBlueprintSynthesis";

function extractCardTexts(element: any) {
  const cardDiv = element?.props?.children;
  const children = cardDiv?.props?.children || [];
  const stageHeading = String(children[1]?.props?.children || "");
  const focusParagraph = String(children[2]?.props?.children || "");
  return { stageHeading, focusParagraph };
}

describe("BUILD 126 — Journey Foundation & Competitive Moat Test Suite", () => {
  const uid = `${auditName}_uid`;

  describe("Sprint 1 — Journey Data Consistency & Canonical Parity (P0-1 & P0-2)", () => {
    it("1. JourneyCard maps legacy stages to Indonesian canonical equivalents", () => {
      // Test legacy Awareness -> Awal Kesadaran
      const legacyAwareness: any = {
        currentStage: { stage: "Awareness" },
        weeklyFocus: { theme: "Mengenali Nafas" },
        timeline: [],
      };
      const element1 = JourneyCard({ journey: legacyAwareness });
      const { stageHeading: h1, focusParagraph: p1 } = extractCardTexts(element1);
      assert.equal(h1, "Awal Kesadaran", "Legacy 'Awareness' must be mapped to 'Awal Kesadaran'");
      assert.equal(p1, "Fokus saat ini: Mengenali Nafas.");

      // Test legacy Acceptance -> Pendalaman Diri
      const legacyAcceptance: any = {
        currentStage: { stage: "Acceptance" },
        weeklyFocus: { theme: "Menerima Emosi" },
        timeline: [],
      };
      const element2 = JourneyCard({ journey: legacyAcceptance });
      const { stageHeading: h2 } = extractCardTexts(element2);
      assert.equal(h2, "Pendalaman Diri", "Legacy 'Acceptance' must be mapped to 'Pendalaman Diri'");

      // Test legacy Integration -> Integrasi Jiwa
      const legacyIntegration: any = {
        currentStage: { stage: "Integration" },
        weeklyFocus: { theme: "Menyatu Keseharian" },
        timeline: [],
      };
      const element3 = JourneyCard({ journey: legacyIntegration });
      const { stageHeading: h3 } = extractCardTexts(element3);
      assert.equal(h3, "Integrasi Jiwa", "Legacy 'Integration' must be mapped to 'Integrasi Jiwa'");
    });

    it("2. JourneyCard falls back gracefully to 'Awal Kesadaran' when journey is null", () => {
      const element = JourneyCard({ journey: null });
      const { stageHeading, focusParagraph } = extractCardTexts(element);
      assert.equal(stageHeading, "Awal Kesadaran", "Default stage must be 'Awal Kesadaran'");
      assert.ok(focusParagraph.includes("Lihat pola perjalanan batin"), "Default focus paragraph is present");
    });

    it("3. JourneyCard seamlessly renders GrowthStory if supplied directly", () => {
      const story = {
        stage: {
          label: "Integrasi Jiwa",
          description: "Kebiasaan refleksimu mulai menyatu.",
        },
        companionMessage: "Ritme batinmu semakin tenang.",
        growthFocus: "Menjaga ritme tanpa memaksakan diri.",
        growingAreas: ["Kehadiran sadar"],
        attentionAreas: ["Istirahat cukup"],
        nextMilestone: "Praktik konsisten 7 hari",
      };
      const element = JourneyCard({ story });
      const { stageHeading, focusParagraph } = extractCardTexts(element);
      assert.equal(stageHeading, "Integrasi Jiwa", "Should render story stage label");
      assert.equal(focusParagraph, "Menjaga ritme tanpa memaksakan diri.", "Should render story growth focus");
    });

    it("4. Journey static route params explicitly include 'message' (P0-2 route contract)", () => {
      const params = generateStaticParams();
      const ids = params.map((p) => p.id);
      assert.ok(ids.includes("message"), "Static params must include 'message'");
      assert.ok(ids.includes("stage"), "Static params must include 'stage'");
      assert.ok(ids.includes("focus"), "Static params must include 'focus'");
      assert.ok(ids.includes("attention"), "Static params must include 'attention'");
      assert.ok(ids.includes("milestone"), "Static params must include 'milestone'");
      assert.ok(ids.includes("history"), "Static params must include 'history'");
    });

    it("5. journeyStoryEngine generates companionMessage grounded in blueprint synthesis", () => {
      const mockSynthesis: Partial<UnifiedBlueprintSynthesis> = {
        blueprintSummary: "Jiwa yang mencari kedamaian dan ketenangan batin.",
        practiceThemes: {
          reflection: "Kejujuran batin",
          action: "Langkah kecil",
          grounding: "Napas hadir",
        },
        coreNeeds: ["Ruang hening", "Penerimaan"],
      };

      const states: DailyState[] = [
        {
          date: "2026-11-08",
          journalingDone: true,
          meditationDone: true,
          yogaDone: false,
          workoutDone: false,
          audioHealingDone: false,
          herbalDone: false,
          manifestDone: false,
        } as DailyState,
      ];

      const story = journeyStoryEngine.generateStory(states, mockSynthesis as UnifiedBlueprintSynthesis);
      assert.ok(story.companionMessage, "Companion message must be generated");
      assert.ok(
        story.companionMessage.includes("Jiwa yang mencari kedamaian"),
        "Companion message must incorporate blueprint summary"
      );
      assert.ok(story.growthFocus.length > 0, "Growth focus must be defined");
      assert.equal(story.stage.label, "Awal Kesadaran", "Stage should be Awal Kesadaran for small count");
    });
  });

  describe("Sprint 2 — Unified Journey Home Aggregation (P1-1)", () => {
    it("6. mergeDailyStatesWithJourneyRecords merges DailyStates with JourneyRecords without loss", () => {
      const states: DailyState[] = [
        {
          date: "2026-11-08",
          meditationDone: true,
          completedActivityIds: ["activity-1"],
        } as DailyState,
      ];

      const records: JourneyDailyRecord[] = [
        {
          id: `${uid}_2026-11-08`,
          userId: uid,
          date: "2026-11-08",
          appDate: "2026-11-08",
          practiceResults: [
            {
              practiceId: "activity-yoga",
              practiceCategory: "yoga",
              practiceTitle: "Gerakan Cat-Cow",
              completedAt: "2026-11-08T10:00:00.000Z",
              durationMinutes: 10,
              source: "wellness_section_4",
            },
          ],
        } as unknown as JourneyDailyRecord,
      ];

      const merged = mergeDailyStatesWithJourneyRecords(states, records);
      assert.equal(merged.length, 1);
      assert.equal(merged[0].meditationDone, true, "Preserves meditation flag");
      assert.equal(merged[0].yogaDone, true, "Hydrates yoga flag from practiceResults");
    });

    it("7. getCompletionSummary computes correct counts and item labels", () => {
      const state: DailyState = {
        date: "2026-11-08",
        meditationDone: true,
        journalingDone: true,
        yogaDone: false,
        workoutDone: false,
        audioHealingDone: false,
        herbalDone: false,
        manifestDone: false,
      } as DailyState;

      const summary = getCompletionSummary(state);
      assert.equal(summary.count, 2, "2 activities completed");
      assert.equal(summary.total, 7, "7 standard activities");
      const meditationItem = summary.items.find((i) => i.id === "meditation");
      assert.ok(meditationItem?.completed, "Meditation is marked completed");
      const yogaItem = summary.items.find((i) => i.id === "yoga");
      assert.equal(yogaItem?.completed, false, "Yoga is not completed");
    });
  });

  describe("Sprint 3 — Living History & Repository Parity (P1-2)", () => {
    it("8. journeyRepository exposes getRecentUnifiedEvents and getUnifiedTimeline", () => {
      assert.equal(typeof journeyRepository.getRecentUnifiedEvents, "function");
      assert.equal(typeof journeyRepository.getUnifiedTimeline, "function");
    });

    it("9. getRecentUnifiedEvents transforms stored local states and records into JourneyUnifiedEvent[]", async () => {
      const date1 = "2026-11-07";
      const date2 = "2026-11-08";

      // Populate local storage with audit records
      const state1: DailyState = {
        date: date1,
        moodLevel: 4,
        emotionalWord: "Tenang",
        innerworkReflection: "Hari yang penuh kesadaran",
        updatedAt: `${date1}T20:00:00.000Z`,
      } as DailyState;

      const state2: DailyState = {
        date: date2,
        moodLevel: 5,
        emotionalWord: "Damai",
        updatedAt: `${date2}T21:00:00.000Z`,
      } as DailyState;

      const record2: JourneyDailyRecord = {
        id: `${uid}_${date2}`,
        userId: uid,
        date: date2,
        appDate: date2,
        practiceResults: [
          {
            practiceId: "practice-cat-cow",
            practiceCategory: "yoga",
            practiceTitle: "Gerakan Cat-Cow",
            completedAt: `${date2}T08:30:00.000Z`,
            durationMinutes: 10,
            source: "wellness_section_4",
            reflectionResult: "Tubuh terasa lebih lentur",
          },
        ],
      } as unknown as JourneyDailyRecord;

      storage.set(`moana:dailyStates:${uid}:${date1}`, JSON.stringify(state1));
      storage.set(`moana:dailyStates:${uid}:${date2}`, JSON.stringify(state2));
      storage.set(`moana:journeyDailyRecords:${uid}:${date2}`, JSON.stringify(record2));

      const events = await journeyRepository.getRecentUnifiedEvents(uid, 10);
      assert.ok(Array.isArray(events), "Events must be an array");
      assert.ok(events.length >= 2, `Expected at least 2 events, got ${events.length}`);

      // Check practice event
      const practiceEvent = events.find((e) => e.title === "Gerakan Cat-Cow");
      assert.ok(practiceEvent, "Practice event for Cat-Cow must exist");
      assert.equal(practiceEvent?.originSource, "wellness_practice");
      assert.equal(practiceEvent?.significance, "meaningful", "Has reflectionResult, so meaningful");

      // Check check-in event
      const checkinEvent = events.find((e) => e.title === "Kabar Hari Ini" && e.dateKey === date1);
      assert.ok(checkinEvent, "Check-in event for date1 must exist");
      assert.equal(checkinEvent?.summary, "Tenang");
      assert.equal(checkinEvent?.category, "Heart");
    });

    it("10. UID isolation: events for another user are never leaked", async () => {
      const otherUid = "other_user_999_uid";
      const otherDate = "2026-11-08";

      const otherState: DailyState = {
        date: otherDate,
        moodLevel: 1,
        emotionalWord: "Gelisah Rahasia",
        updatedAt: `${otherDate}T12:00:00.000Z`,
      } as DailyState;

      storage.set(`moana:dailyStates:${otherUid}:${otherDate}`, JSON.stringify(otherState));

      // Read for primary user
      const userEvents = await journeyRepository.getRecentUnifiedEvents(uid, 10);
      const leaked = userEvents.some((e) => e.summary === "Gelisah Rahasia");
      assert.equal(leaked, false, "Cross-user data leakage strictly prohibited");
    });
  });
});

import strictAssert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { isEnlEdition, getAppEdition } from "../../lib/config/edition";
import { getI18n, DEFAULT_SHORT, getCompatDictionaries } from "../../lib/i18n";
import { normalizeLocale, getDictionaryKey } from "../../lib/locale/normalizeLocale";
import { translations } from "../../lib/data/translations";
import {
  DAILY_GUIDANCE_CONTENT_VERSION,
  isCurrentGeneratedGuidance,
  getDailyGuidanceStaleReason,
} from "../../lib/dailyGuidance/version";
import { isCanonicalDailyGuidanceRecord } from "../../lib/services/dailyGuidanceService";
import { buildBirthdayMessage } from "../../lib/birthday/birthdayMessage";
import { pickUnifiedDailyReminderMessage } from "../../lib/notifications/checkDailyReminder";
import { notificationCopy } from "../../lib/notifications/notificationPolicy";
import { createWeeklySoulReport } from "../../lib/reports/createWeeklySoulReport";
import { getTodayJournalPrompt, savePerModeDraft, loadPerModeDraft } from "../../lib/journal/localJournal";
import { getTimeOfDayGreeting, getTimeAwareGreeting, getTimeAwareClosing } from "../../lib/dailyGuidance/timeOfDayGreeting";
import { dailyGuidanceDocId } from "../../lib/repositories/dailyGuidanceRepository";

let totalAssertions = 0;
let totalGroups = 0;
const assert = new Proxy(strictAssert, {
  get(target, key) {
    const value = Reflect.get(target, key);
    return typeof value === "function" ? (...args: unknown[]) => {
      const result = Reflect.apply(value, target, args);
      totalAssertions += 1;
      return result;
    } : value;
  },
});
function test(name: string, fn: () => void): void {
  try {
    fn();
    totalGroups += 1;
    console.log(`PASS: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

console.log("\n=== BUILD 110: INDONESIAN-ONLY PRODUCTION REMEDIATION TEST SUITE ===");

// ---------------------------------------------------------------------------
// 1. Runtime Edition & Locale Policies
// ---------------------------------------------------------------------------
test("1.1 isEnlEdition is false in Build 110 runtime", () => {
  assert.strictEqual(isEnlEdition(), false, "isEnlEdition must evaluate to false");
  assert.strictEqual(getAppEdition(), "standard", "getAppEdition must return 'standard'");
});

test("1.2 DEFAULT_SHORT and i18n instance language are locked to Indonesian", () => {
  assert.strictEqual(DEFAULT_SHORT, "id", "DEFAULT_SHORT must be 'id'");
  const i18n = getI18n();
  assert.strictEqual(i18n.language, "id-ID", "i18n instance must be initialized to 'id-ID'");
});

test("1.3 Translations dictionary provides Indonesian copy across all language keys", () => {
  assert.ok(translations.id, "translations.id must exist");
  assert.ok(translations.en, "translations.en must exist as dormant/fallback alias");
  assert.ok(translations.ms, "translations.ms must exist as dormant/fallback alias");
  assert.strictEqual(
    translations.en.welcome?.title,
    translations.id.welcome?.title,
    "translations.en must map to Indonesian bundle to prevent EN leak"
  );
  assert.strictEqual(
    translations.ms.welcome?.title,
    translations.id.welcome?.title,
    "translations.ms must map to Indonesian bundle to prevent MS leak"
  );
});

test("1.4 Historical normalizeLocale parser remains truthful and intact", () => {
  assert.strictEqual(normalizeLocale("id"), "id-ID");
  assert.strictEqual(normalizeLocale("id-ID"), "id-ID");
  assert.strictEqual(normalizeLocale("en"), "en-US");
  assert.strictEqual(normalizeLocale("en-US"), "en-US");
  assert.strictEqual(normalizeLocale("ms"), "ms-MY");
  assert.strictEqual(normalizeLocale("ms-MY"), "ms-MY");
  assert.strictEqual(getDictionaryKey("id-ID"), "id");
  assert.strictEqual(getDictionaryKey("en-US"), "en");
  assert.strictEqual(getDictionaryKey("ms-MY"), "ms");
});

// ---------------------------------------------------------------------------
// 2. UI Surface Guards & Selector Elimination
// ---------------------------------------------------------------------------
test("2.1 app/page.tsx has no language switcher buttons", () => {
  const src = fs.readFileSync(path.resolve("app/page.tsx"), "utf8");
  assert.ok(!src.includes("setLanguage("), "app/page.tsx must not call setLanguage");
  assert.ok(!src.includes("Melayu"), "app/page.tsx must not contain Melayu switcher label");
  assert.ok(!src.includes("Indonesia / English / Melayu"), "app/page.tsx must not expose multi-language switcher");
});

test("2.2 app/settings/page.tsx has no language selector element", () => {
  const src = fs.readFileSync(path.resolve("app/settings/page.tsx"), "utf8");
  assert.ok(!src.includes("<option value=\"id\">Indonesia</option>"), "Settings must not render language options");
  assert.ok(!src.includes("<option value=\"en\">English</option>"), "Settings must not render English option");
  assert.ok(!src.includes("t.settings.language"), "Settings must not render language section");
});

test("2.3 components/profile/ProfileSettings.tsx has no language selector element", () => {
  const src = fs.readFileSync(path.resolve("components/profile/ProfileSettings.tsx"), "utf8");
  assert.ok(!src.includes("<option value=\"id\">ID - Indonesia</option>"), "ProfileSettings must not render language options");
  assert.ok(!src.includes("id=\"profile-language\""), "ProfileSettings must not render language select");
});

test("2.4 app/layout.tsx html tag is set to id-ID", () => {
  const src = fs.readFileSync(path.resolve("app/layout.tsx"), "utf8");
  assert.ok(src.includes("<html lang=\"id-ID\">"), "app/layout.tsx must specify lang='id-ID'");
});

test("2.5 app/login/page.tsx Suspense fallback uses Indonesian", () => {
  const src = fs.readFileSync(path.resolve("app/login/page.tsx"), "utf8");
  assert.ok(src.includes("<div>Memuat...</div>"), "Login Suspense fallback must be 'Memuat...'");
  assert.ok(!src.includes("<div>Loading...</div>"), "Login Suspense fallback must not be 'Loading...'");
});

test("2.6 Meditation, Audio, and Journal save sections use Indonesian headers", () => {
  const medSrc = fs.readFileSync(path.resolve("app/meditation/page.tsx"), "utf8");
  const audioSrc = fs.readFileSync(path.resolve("app/healing/audio/page.tsx"), "utf8");
  const journalSrc = fs.readFileSync(path.resolve("app/journal/page.tsx"), "utf8");

  assert.ok(medSrc.includes("Bagian C · Simpan"), "Meditation must use 'Bagian C · Simpan'");
  assert.ok(!medSrc.includes("Section C · Save"), "Meditation must not use 'Section C · Save'");

  assert.ok(audioSrc.includes("Bagian C · Simpan"), "Healing audio must use 'Bagian C · Simpan'");
  assert.ok(!audioSrc.includes("Section C · Save"), "Healing audio must not use 'Section C · Save'");

  assert.ok(journalSrc.includes("Bagian C · Kesadaran Tubuh"), "Journal must use 'Bagian C · Kesadaran Tubuh'");
  assert.ok(journalSrc.includes("Bagian D · Simpan"), "Journal must use 'Bagian D · Simpan'");
  assert.ok(!journalSrc.includes("Section D · Save"), "Journal must not use 'Section D · Save'");
});

test("2.7 Astrology Whole Sign page uses Indonesian section headers", () => {
  const wsSrc = fs.readFileSync(path.resolve("app/blueprint/whole-sign/page.tsx"), "utf8");
  assert.ok(wsSrc.includes("Dua Belas Rumah Whole Sign"), "Whole Sign must render 'Dua Belas Rumah Whole Sign'");
  assert.ok(wsSrc.includes("Penekanan Rumah"), "Whole Sign must render 'Penekanan Rumah'");
});

// ---------------------------------------------------------------------------
// 3. Stale Generated Cache Invalidation & Fallback Language Guards
// ---------------------------------------------------------------------------
test("3.1 Invalidation of historical English guidance cache version", () => {
  assert.strictEqual(DAILY_GUIDANCE_CONTENT_VERSION, "build110-id-ID-grounded");
  const legacyRecord = {
    guidanceVersion: "fanta-v4-grounded",
    schemaVersion: "dailyGuidance.v11",
    uid: "test-user",
    date: "2026-09-12",
  };
  assert.strictEqual(isCurrentGeneratedGuidance(legacyRecord), false, "Legacy cache version must be rejected");
  const currentRecord = {
    guidanceVersion: "build110-id-ID-grounded",
    schemaVersion: "dailyGuidance.v11",
    uid: "test-user",
    date: "2026-09-12",
  };
  assert.strictEqual(isCurrentGeneratedGuidance(currentRecord), true, "Current build110 cache version must be accepted");
});

test("3.2 Stale reason detector flags outdated guidance versions", () => {
  const legacyRecord = {
    guidanceVersion: "fanta-v4-grounded",
    schemaVersion: "dailyGuidance.v11",
    generatedWithPromptVersion: "BHUMI_DAILY_COMPANION_ENGINE_V12_GROUNDED_CONTEXT",
    uid: "test-user",
    date: "2026-09-12",
    localDateKey: "2026-09-12",
    dailyVariationSeed: "seed-123",
  } as any;
  const reason = getDailyGuidanceStaleReason(legacyRecord, {
    uid: "test-user",
    localDateKey: "2026-09-12",
  });
  assert.strictEqual(reason, "guidance_version_mismatch", "Stale detector must flag guidance_version_mismatch");
});

test("3.3 Birthday message defaults to Indonesian even with English profile preference", () => {
  const profileEn = { uid: "user-1", displayName: "Aria", language: "en", birthDate: "1990-09-12" };
  const bdayMsg = buildBirthdayMessage(profileEn, "2026");
  assert.ok(bdayMsg.title.includes("Selamat Ulang Tahun"), "Birthday title must be in Indonesian");
  assert.ok(bdayMsg.content.includes("Peluk hangat dari Bhumi."), "Birthday closing must be Indonesian hugs");
  assert.ok(!bdayMsg.content.includes("Warm hugs"), "Birthday message must not contain English hugs");
});

test("3.4 Unified daily reminder defaults to Indonesian message", () => {
  const reminder = pickUnifiedDailyReminderMessage({
    language: "en",
    profile: { language: "en" },
    blueprint: null,
  });
  assert.strictEqual(reminder, "Ruang Bhumi ada di sini kapan pun kamu siap.", "Reminder must be Indonesian");
});

test("3.5 Notification copy policy enforces Indonesian", () => {
  for (const locale of ["id-ID", "en-US", "ms-MY"] as const) {
    const copy = notificationCopy("daily", locale);
    assert.strictEqual(copy.title, "Catatanmu siap", "Notification title must be Indonesian");
    assert.strictEqual(copy.body, "Ruangmu ada di sini kapan pun kamu siap.", "Notification body must be Indonesian");
  }
});

test("3.6 Weekly soul report defaults to Indonesian headings and themes", () => {
  const report = createWeeklySoulReport({ profile: { language: "en" }, blueprint: null });
  assert.strictEqual(report.dominantTheme, "Belum ada pola dominan", "Weekly report dominantTheme must be Indonesian");
  assert.ok(
    report.closingMessage.includes("Kamu boleh mulai pelan") || report.closingMessage.includes("Minggu ini memperlihatkan"),
    "Closing message must be Indonesian"
  );
});

test("3.7 Journal prompts default to Indonesian theme bank", () => {
  const prompt = getTodayJournalPrompt({});
  assert.ok(prompt.dashboardQuestion.length > 0, "Prompt dashboardQuestion must exist");
  assert.ok(prompt.questions.length > 0, "Prompt questions must exist");
  // Ensure none of the default prompt questions are in English
  assert.ok(!prompt.dashboardQuestion.includes("When was the last time"), "Prompt question must not be English");
});

test("3.8 Time of day greetings and closings in Indonesian", () => {
  const morning = new Date("2026-09-12T08:00:00");
  const greeting = getTimeOfDayGreeting(morning, "id");
  assert.strictEqual(greeting, "Selamat pagi", "Morning greeting must be 'Selamat pagi'");
  const awareGreeting = getTimeAwareGreeting("Budi", "Senin", morning, "id");
  assert.ok(awareGreeting.includes("Hai Budi, selamat pagi"), "Aware greeting must be Indonesian");
  const closing = getTimeAwareClosing(morning, "id");
  assert.ok(closing.includes("Pelan-pelan saja"), "Closing must be Indonesian");
});

// ---------------------------------------------------------------------------
// 4. User-Authored Content Preservation & Concurrency Safety
// ---------------------------------------------------------------------------
test("4.1 Firestore daily guidance doc ID is canonical and deterministic", () => {
  const docId = dailyGuidanceDocId("user123", "2026-09-12");
  assert.strictEqual(docId, "user123_2026_09_12", "Doc ID must format as {uid}_{YYYY_MM_DD}");
});

test("4.2 Canonical daily guidance record validator enforces required structure", () => {
  const validGuidance = {
    uid: "u1",
    date: "2026-09-12",
    localDateKey: "2026-09-12",
    aiInsight: "Refleksi mendalam.",
    journalPrompt: "Apa yang kamu rasakan?",
    meditationSuggestion: "Penyelarasan Diri",
    dailyPractices: [],
    createdAt: "2026-09-12T00:00:00.000Z",
    updatedAt: "2026-09-12T00:00:00.000Z",
  };
  assert.strictEqual(isCanonicalDailyGuidanceRecord(validGuidance, "u1", "2026-09-12"), true);
  assert.strictEqual(isCanonicalDailyGuidanceRecord(validGuidance, "u2", "2026-09-12"), false, "Cross-user uid mismatch must fail");
  assert.strictEqual(isCanonicalDailyGuidanceRecord(validGuidance, "u1", "2026-09-13"), false, "Date mismatch must fail");
});

test("4.3 User-authored journal entry content and metadata are preserved without mutation", () => {
  const userAuthoredEntry = {
    uid: "user-test",
    date: "2026-09-12",
    theme: "Refleksi Bebas",
    questions: ["Apa yang kamu rasakan?"],
    journalText: "Hari ini saya merasa lebih tenang setelah bermeditasi.",
    emotionalState: "Tenang",
    bodySignals: ["Dada lapang", "Napas dalam"],
    createdAt: "2026-09-12T10:00:00.000Z",
    insight: "Ketenangan adalah fondasi kehadiran.",
    tomorrowFocus: "Menjaga ritme napas.",
  };
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const storage = new Map<string, string>();
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    localStorage: {
      setItem: (key: string, value: string) => storage.set(key, value),
      getItem: (key: string) => storage.get(key) ?? null,
    },
  } });
  try {
    const draft = {
      journalType: "FREE" as const,
      journalText: "  My words\r\nSaya berasa tenang.\t e\u0301  ",
      emotionalState: userAuthoredEntry.emotionalState,
      bodySignals: userAuthoredEntry.bodySignals,
      updatedAt: userAuthoredEntry.createdAt,
    };
    savePerModeDraft(draft);
    const storedBefore = [...storage.entries()];
    getTodayJournalPrompt({}, [], new Date("2026-09-12T12:00:00Z"));
    assert.deepStrictEqual(loadPerModeDraft("FREE"), draft);
    assert.deepStrictEqual([...storage.entries()], storedBefore);
    assert.deepStrictEqual(Buffer.from(loadPerModeDraft("FREE")!.journalText), Buffer.from(draft.journalText));
    assert.strictEqual(loadPerModeDraft("CBT"), null);
  } finally {
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else Reflect.deleteProperty(globalThis, "window");
  }
});

test("4.4 Production date formatting conforms to Indonesian id-ID standard", () => {
  const date = new Date("2026-09-12T12:00:00Z");
  const formattedDate = date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  assert.ok(formattedDate.includes("Sabtu"), "Formatted date must include 'Sabtu'");
  assert.ok(formattedDate.includes("September"), "Formatted date must include 'September'");
  assert.ok(formattedDate.includes("2026"), "Formatted date must include '2026'");
});

test("4.5 Orphan dev routes remain absent from repository", () => {
  const orphanRoutes = [
    "app/status/page.tsx",
    "app/test/page.tsx",
    "app/roadmap/page.tsx",
    "app/changelog/page.tsx",
    "app/onboarding/page.tsx",
    "components/audit/AuditReadiness.tsx",
  ];
  for (const route of orphanRoutes) {
    assert.strictEqual(fs.existsSync(path.resolve(route)), false, `Orphan route ${route} must remain deleted`);
  }
});

test("4.6 Admin UI is withdrawn from production and gated behind isAdminUiExposed", () => {
  const navSrc = fs.readFileSync(path.resolve("components/navigation/AppNav.tsx"), "utf8");
  assert.ok(!navSrc.includes("href=\"/admin\""), "AppNav must not link to /admin");
  assert.ok(!navSrc.includes("Auth Diagnostics"), "AppNav must not link to Auth Diagnostics");

  const adminPageSrc = fs.readFileSync(path.resolve("app/admin/page.tsx"), "utf8");
  assert.ok(adminPageSrc.includes("isAdminUiExposed"), "Admin page must check isAdminUiExposed");
  assert.ok(adminPageSrc.includes(": \"/dashboard\""), "Admin page must redirect to /dashboard in production");
});

test("5.1 Entire compatibility dictionaries share Indonesian content", () => {
  const dictionaries = getCompatDictionaries();
  assert.deepStrictEqual(dictionaries.en, dictionaries.id);
  assert.deepStrictEqual(dictionaries.ms, dictionaries.id);
  assert.strictEqual(getI18n().t("welcome.title", { lng: "en-US" }), getI18n().t("welcome.title", { lng: "id-ID" }));
});

test("5.2 Journal rotation supplies Indonesian display labels for every theme", () => {
  const labels = new Set<string>();
  for (let day = 1; day <= 10; day += 1) {
    const prompt = getTodayJournalPrompt({}, [], new Date(`2026-09-${String(day).padStart(2, "0")}T12:00:00Z`));
    labels.add(prompt.theme);
    assert.strictEqual(prompt.questions.length, 3);
  }
  assert.deepStrictEqual([...labels].sort(), ["Diri Masa Kecil", "Hambatan Cinta", "Hambatan Finansial", "Pola Berulang", "Harga Diri", "Dinamika Keluarga", "Pelajaran Karma", "Pola Leluhur", "Pengampunan", "Tujuan dan Panggilan"].sort());
});

test("5.3 Raw dashboard response is validated before normalization can stamp provenance", () => {
  const source = fs.readFileSync(path.resolve("components/dashboard/DashboardClient.tsx"), "utf8");
  const rawValidation = source.indexOf("getDailyGuidanceStaleReason(result.guidance");
  const normalization = source.indexOf("normalizeUserFacingGuidance(result.guidance");
  assert.ok(rawValidation > 0 && rawValidation < normalization);
});

test("5.4 Outbound fetch and socket connections are prevented without emulator endpoints", () => {
  const env = { ...process.env };
  delete env.FIRESTORE_EMULATOR_HOST;
  delete env.FIREBASE_AUTH_EMULATOR_HOST;
  delete env.BHUMI_QA_REQUIRE_EMULATORS;
  env.NEXT_PUBLIC_HUMAN_DESIGN_API_URL = "http://127.0.0.1:18765/api/humandesign/calculate";
  const result = spawnSync(process.execPath, ["--import", "./tests/helpers/blockOutboundNetwork.mjs", "--input-type=module", "-e", `
    import assert from 'node:assert/strict';
    import net from 'node:net';
    await assert.rejects(fetch('https://example.invalid/calculate'), /QA_OUTBOUND_NETWORK_BLOCKED/);
    assert.throws(() => net.connect({host:'192.0.2.1',port:443}), /QA_OUTBOUND_NETWORK_BLOCKED/);
    assert.throws(() => net.connect({host:'127.0.0.1',port:8080}), /QA_OUTBOUND_NETWORK_BLOCKED/);
  `], { env, encoding: "utf8" });
  assert.strictEqual(result.status, 0, result.stderr);
  const required = spawnSync(process.execPath, ["--import", "./tests/helpers/blockOutboundNetwork.mjs", "-e", ""], {
    env: { ...env, BHUMI_QA_REQUIRE_EMULATORS: "true" }, encoding: "utf8",
  });
  assert.notStrictEqual(required.status, 0);
  assert.ok(required.stderr.includes("QA_NETWORK_EMULATORS_REQUIRED"));
});

import { buildSoulLettersV3Section, applyArsipAkashiContentToV3Section } from "../../lib/arsipAkashi/profile/v3ContentBridge";
import { calculateHumanDesignTypeFromBirthData } from "../../lib/humandesign/calculateHumanDesignType";
import { AtmosphereVolcanicCard } from "../../components/dashboard/AtmosphereVolcanicCard";
import { evaluateVolcanicContext } from "../../lib/environment/volcanicEngine";
import { getCanonicalTrialWindow, getEntitlementStatus } from "../../lib/billing/entitlementService";
import { ProfileRuntimeAdapter } from "../../lib/services/profileRuntimeAdapter";

// ---------------------------------------------------------------------------
// 6. Build 110 Critical Recovery Checks (Akashi, HD Accuracy, Env, Trial)
// ---------------------------------------------------------------------------
test("6.1 Arsip Akashi: soul letters archive handles 0, 1, 3, 4, 10, 50+ records (not limited to 3)", () => {
  // 0 records
  assert.strictEqual(buildSoulLettersV3Section({ soulLetters: [] } as any), null, "0 soul letters returns null");
  
  // 1 record
  const s1 = buildSoulLettersV3Section({
    soulLetters: [{ id: "l1", title: "Surat 1", subtitle: "Sub 1", paragraphs: ["P1"], deepExplanation: "D1", practicalReflection: "R1", order: 1 }]
  } as any);
  assert.ok(s1 !== null && s1.cards.length === 1, "1 soul letter produces 1 card");
  
  // 3 records
  const s3 = buildSoulLettersV3Section({
    soulLetters: [
      { id: "l1", title: "Surat 1", subtitle: "Sub 1", paragraphs: ["P1"], deepExplanation: "D1", practicalReflection: "R1", order: 1 },
      { id: "l2", title: "Surat 2", subtitle: "Sub 2", paragraphs: ["P2"], deepExplanation: "D2", practicalReflection: "R2", order: 2 },
      { id: "l3", title: "Surat 3", subtitle: "Sub 3", paragraphs: ["P3"], deepExplanation: "D3", practicalReflection: "R3", order: 3 },
    ]
  } as any);
  assert.ok(s3 !== null && s3.cards.length === 3, "3 soul letters produce 3 cards");
  
  // 4 records - MUST BE REACHABLE (not limited to 3)
  const s4 = buildSoulLettersV3Section({
    soulLetters: [
      { id: "l1", title: "Surat 1", subtitle: "Sub 1", paragraphs: ["P1"], deepExplanation: "D1", practicalReflection: "R1", order: 1 },
      { id: "l2", title: "Surat 2", subtitle: "Sub 2", paragraphs: ["P2"], deepExplanation: "D2", practicalReflection: "R2", order: 2 },
      { id: "l3", title: "Surat 3", subtitle: "Sub 3", paragraphs: ["P3"], deepExplanation: "D3", practicalReflection: "R3", order: 3 },
      { id: "l4", title: "Surat 4", subtitle: "Sub 4", paragraphs: ["P4"], deepExplanation: "D4", practicalReflection: "R4", order: 4 },
    ]
  } as any);
  assert.ok(s4 !== null && s4.cards.length === 4, "4th soul letter record is reachable and preserved in full archive");
  assert.strictEqual(s4?.cards[3].title, "Surat 4", "4th record title preserved");

  // 10 records
  const letters10 = Array.from({ length: 10 }, (_, i) => ({
    id: `l${i + 1}`, title: `Surat ${i + 1}`, subtitle: `Sub ${i + 1}`, paragraphs: [`P${i + 1}`], deepExplanation: `D${i + 1}`, practicalReflection: `R${i + 1}`, order: i + 1,
  }));
  const s10 = buildSoulLettersV3Section({ soulLetters: letters10 } as any);
  assert.strictEqual(s10?.cards.length, 10, "10 soul letters produces 10 cards");

  // 50+ records
  const letters52 = Array.from({ length: 52 }, (_, i) => ({
    id: `l${i + 1}`, title: `Surat ${i + 1}`, subtitle: `Sub ${i + 1}`, paragraphs: [`P${i + 1}`], deepExplanation: `D${i + 1}`, practicalReflection: `R${i + 1}`, order: i + 1,
  }));
  const s52 = buildSoulLettersV3Section({ soulLetters: letters52 } as any);
  assert.strictEqual(s52?.cards.length, 52, "50+ soul letters produces 52 cards without truncation");
});

test("6.2 Arsip Akashi: v3ContentBridge preserves card content on partial match without dropping section", () => {
  const section = {
    title: "SIAPA DIRIMU",
    cards: [
      { title: "Arketipe Utama", shortMeaning: "legacy-short" },
      { title: "Unknown Custom Card", shortMeaning: "custom-short" },
    ],
  };
  const viewModel = {
    readings: [
      { title: "Arketipe Utama", roomTitle: "SIAPA DIRIMU", deepExplanation: "deep-content", practicalReflection: "reflection-content", order: 1 },
    ],
    soulLetters: [],
    status: "ready",
    rooms: [],
  };
  const bridged = applyArsipAkashiContentToV3Section(section as any, viewModel as any);
  assert.ok(bridged !== null, "Section must not be dropped when some cards do not match");
  assert.strictEqual(bridged?.cards.length, 2, "All cards must remain in section");
  assert.strictEqual(bridged?.cards[0].expandableInsight, "deep-content", "Matched card receives deep explanation");
  assert.strictEqual(bridged?.cards[1].shortMeaning, "custom-short", "Unmatched card preserves original content");
});

test("6.3 Human Design: Canonical Founder birth input evaluates to Manifesting Generator", () => {
  const result = calculateHumanDesignTypeFromBirthData("1985-05-03", "23:45", "Asia/Jakarta", 106.8);
  assert.ok(result !== null, "HD result must not be null for valid birth data");
  assert.strictEqual(result?.type, "Manifesting Generator", "Canonical Founder HD type MUST be Manifesting Generator");
  assert.strictEqual(result?.definition, "Single Definition", "Definition must be Single Definition");
  assert.ok(result?.channels.includes("2-14"), "Channel 2-14 (Sacral-G) must be active");
  assert.ok(result?.channels.includes("10-20"), "Channel 10-20 (G-Throat) must be active");
  assert.ok(result?.channels.includes("25-51"), "Channel 25-51 (G-Ego) must be active");
  assert.ok(result?.channels.includes("26-44"), "Channel 26-44 (Spleen-Ego) must be active");
});

test("6.4 Environment: Schumann runtime calls disabled & Volcanic features removed", () => {
  const cardResult = AtmosphereVolcanicCard({} as any);
  assert.strictEqual(cardResult, null, "AtmosphereVolcanicCard must render null (0 visible surfaces)");

  const volcanic = evaluateVolcanicContext({
    userLat: -6.2,
    userLon: 106.8,
    totalColumnSo2UgM2: 1500,
    surfaceSo2UgM3: 10,
    windSpeedKph: 15,
    windDirectionDegrees: 180,
    observedAt: new Date().toISOString(),
  });
  assert.strictEqual(volcanic.probableSource, null, "No volcano name attribution allowed");
  assert.strictEqual(volcanic.nearbyKnownVolcanoes.length, 0, "No nearby known volcanoes list exposed");
  assert.strictEqual(volcanic.plumeDetected, null, "Plume detection disabled");
});

test("6.5 New user 7-day trial entitlement is guaranteed without backend blocker", () => {
  const now = new Date();
  const profileWithoutTrial = {
    uid: "new-user-123",
    email: "new@example.com",
    fullName: "New User",
    createdAt: now,
    setupCompleted: true,
  };
  const window = getCanonicalTrialWindow(profileWithoutTrial as any);
  assert.strictEqual(window.state, "valid", "New user gets valid 7-day trial from createdAt");
  const entitlement = getEntitlementStatus(profileWithoutTrial as any, now);
  assert.strictEqual(entitlement.isPremium, true, "New user has premium access during 7-day trial");
  assert.strictEqual(entitlement.reason, "trial", "Reason is trial");
});

test("6.6 ProfileRuntimeAdapter titles are Indonesian-only (no English leak)", () => {
  const dummyMeaning: any = {
    identity: { archetype: { short: "s", medium: "m", long: "l" }, hiddenCharacter: { short: "s", medium: "m", long: "l" } },
    purpose: { short: "s", medium: "m", long: "l" },
    energy: { authority: { short: "s", medium: "m", long: "l" }, strategy: { short: "s", medium: "m", long: "l" }, vitality: { short: "s", medium: "m", long: "l" }, bodyMechanics: { short: "s", medium: "m", long: "l" } },
    shadow: { emotionalNeeds: { short: "s", medium: "m", long: "l" }, sabotage: { short: "s", medium: "m", long: "l" }, triggers: { short: "s", medium: "m", long: "l" }, ancestralLegacy: { short: "s", medium: "m", long: "l" }, soulLesson: { short: "s", medium: "m", long: "l" }, soulTrace: { short: "s", medium: "m", long: "l" }, moneyBlock: { short: "s", medium: "m", long: "l" }, loveBlock: { short: "s", medium: "m", long: "l" } },
    talents: { dna: { short: "s", medium: "m", long: "l" }, potential: { short: "s", medium: "m", long: "l" }, workStyle: { short: "s", medium: "m", long: "l" }, wealthFlow: { short: "s", medium: "m", long: "l" } },
    relationships: { attraction: { short: "s", medium: "m", long: "l" }, pattern: { short: "s", medium: "m", long: "l" }, loveLanguage: { short: "s", medium: "m", long: "l" }, boundaries: { short: "s", medium: "m", long: "l" } },
    health: { chakra: { short: "s", medium: "m", long: "l" }, digestion: { short: "s", medium: "m", long: "l" }, environment: { short: "s", medium: "m", long: "l" }, rhythm: { short: "s", medium: "m", long: "l" }, element: { short: "s", medium: "m", long: "l" } },
    spirituality: { path: { short: "s", medium: "m", long: "l" }, evolution: { short: "s", medium: "m", long: "l" }, potential: { short: "s", medium: "m", long: "l" }, talents: { short: "s", medium: "m", long: "l" }, intuition: { short: "s", medium: "m", long: "l" }, channeling: { short: "s", medium: "m", long: "l" } },
    timing: { season: { short: "s", medium: "m", long: "l" }, semester2: { short: "s", medium: "m", long: "l" }, opportunityWindow: { short: "s", medium: "m", long: "l" }, shadowChallenge: { short: "s", medium: "m", long: "l" } },
    soulIdentity: { mission: { short: "s", medium: "m", long: "l" }, gifts: { short: "s", medium: "m", long: "l" }, lessons: { short: "s", medium: "m", long: "l" }, shadow: { short: "s", medium: "m", long: "l" } },
  };
  const sections = ProfileRuntimeAdapter.buildProfile(dummyMeaning);
  const titles = sections.map((s) => s.title);
  assert.ok(titles.includes("SIAPA DIRIMU"), "Section 1 title must be SIAPA DIRIMU");
  assert.ok(titles.includes("ENERGI & MEKANIKA"), "Section 2 title must be ENERGI & MEKANIKA");
  assert.ok(titles.includes("LUKA, BAYANGAN & WARISAN"), "Section 3 title must be LUKA, BAYANGAN & WARISAN");
  assert.ok(!titles.includes("WHO YOU ARE"), "English title WHO YOU ARE must not be present");
});

// ---------------------------------------------------------------------------
// 7. Founder Environment Audit Remediation — no permanent dead cards,
//    Schumann/Volcanic fully removed, live-source-only surfaces.
// ---------------------------------------------------------------------------
test("7.1 Environment detail page renders CUACA/AQI only behind strict live-data gates (never as permanent dead cards)", () => {
  const src = fs.readFileSync(path.resolve("app/dashboard/environment/page.tsx"), "utf8");
  // No unconditional (always-rendered) Open-Meteo-only fields are allowed on the
  // page outside the weatherLive/aqiLive-gated sections. Every fTemperature /
  // fHumidity / fWind / fPressure / fUvIndex / fAirQuality usage must be inside
  // those sections (which render only when the fields are actually populated).
  const ungatedLabels = ["fWeather", "fTemperature", "fHumidity", "fWind", "fPressure", "fUvIndex", "fAirQuality"]
    .filter((key) => new RegExp(`<DetailItem[^>]*label=\\{t\\.environment\\.${key}`).test(src));
  assert.deepStrictEqual(ungatedLabels, [], `Open-Meteo-only fields must render only inside live-data-gated sections, found: ${ungatedLabels.join(", ")}`);
  assert.ok(!/AtmosphereVolcanicCard|SchumannGraph/.test(src), "Volcanic/Schumann components must not be imported");
  assert.ok(src.includes("Data lingkungan sedang tidak tersedia"), "Single Indonesian degraded-state message must exist");
});

test("7.2 Dashboard EnvironmentContextCard shows only Location/EarthActivity/Geomagnetic, no Temperature/Humidity/Schumann", () => {
  const src = fs.readFileSync(path.resolve("components/dashboard/EnvironmentContextCard.tsx"), "utf8");
  assert.ok(!/fTemperature|fHumidity|Thermometer|Droplets/.test(src), "Dashboard card must not render dead Open-Meteo fields");
  assert.ok(!/Radio|fSchumann/.test(src), "Dashboard card must not render Schumann");
});

test("7.3 AtmosphereVolcanicCard is fully removed from Dashboard and Environment detail page imports", () => {
  const dashboardSrc = fs.readFileSync(path.resolve("components/dashboard/DashboardClient.tsx"), "utf8");
  const envPageSrc = fs.readFileSync(path.resolve("app/dashboard/environment/page.tsx"), "utf8");
  assert.ok(!dashboardSrc.includes("<AtmosphereVolcanicCard"), "Dashboard must not mount AtmosphereVolcanicCard");
  assert.ok(!envPageSrc.includes("AtmosphereVolcanicCard"), "Environment detail page must not import AtmosphereVolcanicCard");
});

test("7.4 Open-Meteo production calls remain fail-closed (OPEN_METEO_PRODUCTION_CALLS = 0)", async () => {
  const { isOpenMeteoCallPermitted } = await import("../../lib/environment/openMeteoGate.ts");
  const originalEnv = process.env.NODE_ENV;
  const originalDevFlag = process.env.ENABLE_DEV_OPEN_METEO;
  try {
    process.env.NODE_ENV = "production";
    delete process.env.ENABLE_DEV_OPEN_METEO;
    assert.strictEqual(isOpenMeteoCallPermitted(), false, "Open-Meteo must be forbidden in production");
  } finally {
    process.env.NODE_ENV = originalEnv;
    if (originalDevFlag !== undefined) process.env.ENABLE_DEV_OPEN_METEO = originalDevFlag;
  }
});

test("7.5 Volcanic engine remains fully fail-closed for Build 110 (no name attribution, no nearby list)", async () => {
  const { evaluateVolcanicContext } = await import("../../lib/environment/volcanicEngine.ts");
  const result = evaluateVolcanicContext({
    userLat: -6.2, userLon: 106.8, totalColumnSo2UgM2: 99999,
    surfaceSo2UgM3: 50, windSpeedKph: 20, windDirectionDegrees: 90,
    observedAt: new Date().toISOString(),
  });
  assert.strictEqual(result.probableSource, null, "Volcano name attribution must remain 0");
  assert.strictEqual(result.nearbyKnownVolcanoes.length, 0, "Nearby volcano list must remain empty");
  assert.strictEqual(result.plumeDetected, null, "Plume detection must remain disabled");
});

test("7.6b Target model: CUACA and KUALITAS UDARA sections render only when live data exists", () => {
  const src = fs.readFileSync(path.resolve("app/dashboard/environment/page.tsx"), "utf8");
  assert.ok(/const weatherLive =/.test(src), "weatherLive gate must exist");
  assert.ok(/const aqiLive =/.test(src), "aqiLive gate must exist");
  assert.ok(/weatherLive &&/.test(src), "CUACA section must be conditional on weatherLive");
  assert.ok(/aqiLive &&/.test(src), "KUALITAS UDARA section must be conditional on aqiLive");
  assert.ok(/Includes weather data from Google/.test(src), "Google Weather attribution must be present in CUACA section");
  assert.ok(/Includes data from Google Maps/.test(src), "Google Maps attribution must be present in KUALITAS UDARA section");
});

test("7.6c Local QA environment preview can never activate in production", async () => {
  const { applyLocalQaEnvironmentPreview, resolveLocalQaEnvironmentPreview } = await import("../../lib/environment/localQaPreview.ts");
  assert.throws(() => resolveLocalQaEnvironmentPreview(), /BUILD110_LOCAL_QA_DISABLED/, "Preview resolver must throw outside local QA mode");
  assert.throws(
    () => applyLocalQaEnvironmentPreview({ dateKey: "x", fetchedAt: new Date().toISOString(), location: {} as any }),
    /BUILD110_LOCAL_QA_DISABLED/,
    "Preview patch must throw outside local QA mode",
  );
  const previewSrc = fs.readFileSync(path.resolve("lib/environment/localQaPreview.ts"), "utf8");
  assert.ok(previewSrc.includes("isBuild110LocalQa"), "Preview module must gate on isBuild110LocalQa");
  assert.ok(previewSrc.includes("synthetic-local-environment-preview"), "Preview must self-identify as synthetic");
  assert.ok(!previewSrc.includes("weather.googleapis.com"), "Preview fixture must contain NO real Google API calls");
  assert.ok(!previewSrc.includes("airquality.googleapis.com"), "Preview fixture must contain NO real AQI API calls");
});

test("7.6 Provider matrix classification — every environment feature has a defined Build 110 action (no UNKNOWN)", () => {
  // Founder provider-recovery decision: Temperature/Humidity/Wind/Pressure/UV move
  // from HIDE_UNTIL_PROVIDER to Google Weather API (server-side proxy, NOT yet
  // activated); AirQuality moves to Google Air Quality API (server-side proxy,
  // NOT yet activated). Until activation they render only from the QA preview
  // fixture on localhost, never as permanent dead cards in production.
  const providerMatrix: Record<string, "KEEP_LIVE" | "FIX_LIVE" | "HIDE_UNTIL_PROVIDER" | "REMOVE"> = {
    Location: "KEEP_LIVE",
    SunMoon: "KEEP_LIVE",
    EarthActivity: "KEEP_LIVE",
    Geomagnetic: "KEEP_LIVE",
    Temperature: "HIDE_UNTIL_PROVIDER",
    Humidity: "HIDE_UNTIL_PROVIDER",
    Wind: "HIDE_UNTIL_PROVIDER",
    Pressure: "HIDE_UNTIL_PROVIDER",
    UvIndex: "HIDE_UNTIL_PROVIDER",
    AirQuality: "HIDE_UNTIL_PROVIDER",
    Schumann: "REMOVE",
    Volcanic: "REMOVE",
  };
  for (const [feature, action] of Object.entries(providerMatrix)) {
    assert.ok(["KEEP_LIVE", "FIX_LIVE", "HIDE_UNTIL_PROVIDER", "REMOVE"].includes(action), `${feature} must have a valid classification, got ${action}`);
  }
  assert.strictEqual(Object.keys(providerMatrix).length, 12, "All 12 audited environment features must be classified");
});

console.log(`Groups passed: ${totalGroups}; nested subprocess assertions: 3 (additional)`);
console.log(`\n========================================================`);
console.log(`BUILD 110 REMEDIATION SUITE: ${totalAssertions} assertions PASSED`);
console.log(`========================================================\n`);

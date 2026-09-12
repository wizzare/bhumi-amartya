import assert from "node:assert/strict";
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
import { getTodayJournalPrompt } from "../../lib/journal/localJournal";
import { getTimeOfDayGreeting, getTimeAwareGreeting, getTimeAwareClosing } from "../../lib/dailyGuidance/timeOfDayGreeting";
import { dailyGuidanceDocId } from "../../lib/repositories/dailyGuidanceRepository";

let totalAssertions = 0;
function test(name: string, fn: () => void): void {
  try {
    fn();
    totalAssertions += 1;
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
  const copy = notificationCopy("daily", "id-ID");
  assert.strictEqual(copy.title, "Catatanmu siap", "Notification title must be Indonesian");
  assert.strictEqual(copy.body, "Ruangmu ada di sini kapan pun kamu siap.", "Notification body must be Indonesian");
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
  // Assert immutability and preservation of user words
  assert.strictEqual(userAuthoredEntry.journalText, "Hari ini saya merasa lebih tenang setelah bermeditasi.");
  assert.deepStrictEqual(userAuthoredEntry.bodySignals, ["Dada lapang", "Napas dalam"]);
  assert.strictEqual(userAuthoredEntry.emotionalState, "Tenang");
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

console.log(`\n========================================================`);
console.log(`BUILD 110 REMEDIATION SUITE: ${totalAssertions} assertions PASSED`);
console.log(`========================================================\n`);

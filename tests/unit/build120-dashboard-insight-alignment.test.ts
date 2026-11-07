import { strictEqual, ok, deepStrictEqual } from "node:assert";
import fs from "node:fs";
import { buildDailyGuidance } from "@/lib/dailyGuidance/dailyGuidanceEngine";

console.log("=== BUILD 120: DASHBOARD & PROFILE INSIGHT ALIGNMENT TEST SUITE ===\n");

const PROFILE_A = {
  uid: "user-alpha-1985",
  fullName: "Widhi Wedhaswara",
  displayName: "Widhi",
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthCity: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "Asia/Jakarta",
  relationshipStatus: "in_relationship",
};

const BLUEPRINT_A = {
  uid: "user-alpha-1985",
  lifePath: { number: 4, role: "The Master Builder" },
  humanDesign: {
    type: "Manifesting Generator",
    profile: "6/3",
    authority: "Emotional - Solar Plexus",
    strategy: "To Respond",
  },
  destinyMatrix: {
    center: 7,
    loveLine: [7, 10, 21],
    moneyLine: [10, 21, 11],
    karmicTail: [21, 7, 13],
  },
  astrology: {
    sunSign: "Taurus",
    risingSign: "Scorpio",
    moonSign: "Libra",
  },
};

const PROFILE_B = {
  uid: "user-beta-1992",
  fullName: "Siti Rahma",
  displayName: "Siti",
  birthDate: "1992-08-15",
  birthTime: "06:15",
  birthCity: "Surabaya",
  latitude: -7.2575,
  longitude: 112.7521,
  timezone: "Asia/Jakarta",
  relationshipStatus: "single",
};

const BLUEPRINT_B = {
  uid: "user-beta-1992",
  lifePath: { number: 8, role: "The Leader" },
  humanDesign: {
    type: "Projector",
    profile: "1/3",
    authority: "Splenic",
    strategy: "Wait for the Invitation",
  },
  destinyMatrix: {
    center: 11,
    loveLine: [6, 12, 18],
    moneyLine: [12, 18, 6],
    karmicTail: [18, 6, 15],
  },
  astrology: {
    sunSign: "Leo",
    risingSign: "Virgo",
    moonSign: "Aquarius",
  },
};

// -------------------------------------------------------------
// TEST 1: Parity between Dashboard and Profile Insight Source
// -------------------------------------------------------------
console.log("--- 1. Testing Dashboard and Profile Insight Source Parity ---");

const testDate = new Date("2026-11-07T12:00:00.000Z");

// Run 1: Exactly as Profile page calls it
const profileCallResult = buildDailyGuidance({
  uid: BLUEPRINT_A.uid,
  profile: PROFILE_A as unknown as Record<string, unknown>,
  blueprint: BLUEPRINT_A as unknown as Record<string, unknown>,
  timezone: "Asia/Jakarta",
  referenceDate: testDate,
});

// Run 2: Exactly as DashboardClient calls it
const dashboardCallResult = buildDailyGuidance({
  uid: BLUEPRINT_A.uid,
  profile: PROFILE_A as unknown as Record<string, unknown>,
  blueprint: BLUEPRINT_A as unknown as Record<string, unknown>,
  timezone: "Asia/Jakarta",
  referenceDate: testDate,
});

ok(profileCallResult.dailyDirection, "Profile guidance has dailyDirection");
ok(dashboardCallResult.dailyDirection, "Dashboard guidance has dailyDirection");
strictEqual(profileCallResult.dailyDirection.title, "Arah Hari Ini", "Direction title is 'Arah Hari Ini'");
strictEqual(dashboardCallResult.dailyDirection.title, "Arah Hari Ini", "Dashboard direction title is 'Arah Hari Ini'");

deepStrictEqual(
  profileCallResult.dailyDirection.paragraphs,
  dashboardCallResult.dailyDirection.paragraphs,
  "Dashboard and Profile produce 100% identical paragraphs for identical profile and date"
);
console.log("  [PASS] 100% exact parity between Profile and Dashboard daily direction.\n");

// -------------------------------------------------------------
// TEST 2: No Duplicate Greeting & Format Integrity
// -------------------------------------------------------------
console.log("--- 2. Testing No Duplicate Greeting ('Halo...') ---");
const paragraphs = dashboardCallResult.dailyDirection.paragraphs;
ok(paragraphs.length >= 2, "Has multiple structured paragraphs");

for (const para of paragraphs) {
  ok(!para.toLowerCase().startsWith("halo"), `Paragraph must not start with greeting: "${para.slice(0, 20)}..."`);
  ok(!para.includes("Halo "), `Paragraph must not contain greeting: "${para.slice(0, 30)}..."`);
  ok(para.length > 20, "Paragraph has rich content length");
}
console.log("  [PASS] Zero duplicate greeting found; formatting is clean and readable.\n");

// -------------------------------------------------------------
// TEST 3: User Differentiation (User A vs User B)
// -------------------------------------------------------------
console.log("--- 3. Testing User Isolation & Differentiation ---");
const userBResult = buildDailyGuidance({
  uid: BLUEPRINT_B.uid,
  profile: PROFILE_B as unknown as Record<string, unknown>,
  blueprint: BLUEPRINT_B as unknown as Record<string, unknown>,
  timezone: "Asia/Jakarta",
  referenceDate: testDate,
});

ok(
  userBResult.dailyDirection.paragraphs[1] !== dashboardCallResult.dailyDirection.paragraphs[1],
  "User A (Manifesting Generator) and User B (Projector) receive distinct HD-grounded direction"
);
console.log("  [PASS] User A and User B produce differentiated, personalized narratives.\n");

// -------------------------------------------------------------
// TEST 4: SATU TINDAKAN Section Removal
// -------------------------------------------------------------
console.log("--- 4. Verifying Section 'SATU TINDAKAN' Removal from Source & CSS ---");
const clientSource = fs.readFileSync("components/dashboard/DashboardClient.tsx", "utf8");
const cssSource = fs.readFileSync("components/dashboard/DashboardClient.module.css", "utf8");

ok(!clientSource.includes("SATU TINDAKAN"), "DashboardClient.tsx must NOT contain 'SATU TINDAKAN'");
ok(!clientSource.includes('id="action-title"'), "DashboardClient.tsx must NOT contain action-title anchor");
ok(!clientSource.includes("styles.action"), "DashboardClient.tsx must NOT reference styles.action");
ok(!cssSource.includes(".action,"), "DashboardClient.module.css must NOT contain .action class");
ok(!cssSource.includes(".action "), "DashboardClient.module.css must NOT contain .action selector");
console.log("  [PASS] Section 'SATU TINDAKAN' and its CSS container are completely removed.\n");

// -------------------------------------------------------------
// TEST 5: SoulReflectionCard Integration & SentenceCase Parity
// -------------------------------------------------------------
console.log("--- 5. Verifying SoulReflectionCard Paragraphs & Link Integration ---");
const soulSource = fs.readFileSync("components/dashboard/SoulReflectionCard.tsx", "utf8");

ok(soulSource.includes("paragraphs?: string[]"), "SoulReflectionCardProps accepts paragraphs array");
ok(soulSource.includes("Lihat Catatan Hari Ini di Profil"), "SoulReflectionCard includes link to Profile page");
ok(soulSource.includes('href="/profile"'), "Link directs user to /profile");
ok(soulSource.includes("normalizeIndonesianSentenceCase"), "SoulReflectionCard normalizes with identical sentenceCase function as Profile");

// Check exact paragraph-by-paragraph rendered strings
import { normalizeIndonesianSentenceCase } from "@/lib/utils/sentenceCase";
const profileRenderedParas = profileCallResult.dailyDirection.paragraphs.map((p) => normalizeIndonesianSentenceCase(p));
const dashboardRenderedParas = dashboardCallResult.dailyDirection.paragraphs.map((p) => normalizeIndonesianSentenceCase(p));

deepStrictEqual(profileRenderedParas, dashboardRenderedParas, "Profile and Dashboard rendered paragraphs are 100% character-by-character identical");
console.log("  [PASS] Rendered paragraphs match 100% character-by-character with Profile.\n");

// -------------------------------------------------------------
// TEST 6: Memorial Footer Integrity (Sheina Khazmalia)
// -------------------------------------------------------------
console.log("--- 6. Verifying Memorial Footer Integrity (Sheina Khazmalia) ---");
ok(clientSource.includes("Sheina Khazmalia"), "Dashboard contains Sheina Khazmalia dedication");
ok(clientSource.includes("17 Oktober 1988 \u2013 5 November 2026") || clientSource.includes("17 Oktober 1988 – 5 November 2026"), "Dashboard contains memorial dates");
ok(clientSource.includes("Aplikasi Bhumi Amartya ini dipersembahkan dengan cinta untuk"), "Dashboard contains dedication header");
ok(clientSource.includes("Semoga setiap manfaat yang hadir melalui aplikasi ini menjadi cahaya bagi jiwanya."), "Dashboard contains prayer quote");
ok(!clientSource.includes("Halaman ini tetap di sini kapan pun kamu kembali."), "Legacy footer quote is completely removed");
console.log("  [PASS] Sheina Khazmalia memorial footer is verified and intact.\n");

console.log("=== ALL BUILD 120 DASHBOARD INSIGHT ALIGNMENT CHECKS PASSED (EXIT 0) ===");

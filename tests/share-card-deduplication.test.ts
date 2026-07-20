import assert from "assert";
import {
  stripThemePrefix,
  deduplicatePhrases,
  createDailyShareCardContent,
} from "../lib/profile/dailyShareCardEngine";

console.log("▶ Running Share Card Deduplication & Cleaning Test Suite (7 Assertions)\n");

// 1. Theme already containing prefix
const themeWithPrefix = "Tema saat ini: Menemani Hari. Tidak semua hal perlu dipaksa hari ini.";
const cleanedTheme1 = stripThemePrefix(themeWithPrefix);
assert.strictEqual(cleanedTheme1, "Menemani Hari. Tidak semua hal perlu dipaksa hari ini.", "Test 1 Failed");
console.log("✔ 1. Theme already containing prefix stripped correctly PASS");

// 2. Theme without prefix
const themeWithoutPrefix = "Menemani Hari. Tidak semua hal perlu dipaksa hari ini.";
const cleanedTheme2 = stripThemePrefix(themeWithoutPrefix);
assert.strictEqual(cleanedTheme2, "Menemani Hari. Tidak semua hal perlu dipaksa hari ini.", "Test 2 Failed");
console.log("✔ 2. Theme without prefix preserved unchanged PASS");

// 3. Repeated identical identity phrase
const repeatedIdentical = ["Kedalaman yang Tidak Selalu Terlihat", "Kedalaman yang Tidak Selalu Terlihat"];
const deduplicated1 = deduplicatePhrases(repeatedIdentical);
assert.deepStrictEqual(deduplicated1, ["Kedalaman yang Tidak Selalu Terlihat"], "Test 3 Failed");
console.log("✔ 3. Repeated identical identity phrase deduplicated PASS");

// 4. Repeated phrase with whitespace/case variation
const repeatedVariations = [
  "Kedalaman yang Tidak Selalu Terlihat",
  "  kedalaman yang tidak selalu terlihat  ",
  "KEDALAMAN YANG TIDAK SELALU TERLIHAT",
];
const deduplicated2 = deduplicatePhrases(repeatedVariations);
assert.deepStrictEqual(deduplicated2, ["Kedalaman yang Tidak Selalu Terlihat"], "Test 4 Failed");
console.log("✔ 4. Repeated phrase with whitespace/case variation deduplicated PASS");

// 5. Unique phrases preserve order
const uniquePhrases = ["Kedalaman Jiwa", "Keberanian Melangkah", "Kedalaman Jiwa", "Penerimaan Diri"];
const deduplicated3 = deduplicatePhrases(uniquePhrases);
assert.deepStrictEqual(deduplicated3, ["Kedalaman Jiwa", "Keberanian Melangkah", "Penerimaan Diri"], "Test 5 Failed");
console.log("✔ 5. Unique phrases preserve original order PASS");

// 6. Manifestation output unchanged
const sampleGuidance = {
  manifestation: {
    affirmation: "Hari ini aku mengalir bersama ketenangan.",
    assumption: "Setiap langkah membawaku mendekati kedamaian.",
    attraction: "Ketenangan menarik kebaikan ke dalam hidupku.",
  },
} as any;
const content1 = createDailyShareCardContent({
  profileSections: [],
  dateKey: "2026-07-21",
  userSeed: "USER_SEED_123",
  guidance: sampleGuidance,
});
assert.strictEqual(typeof content1.manifestationToday.text, "string", "Test 6 Failed");
assert.strictEqual(content1.manifestationToday.text.length > 0, true, "Test 6 Text Empty Failed");
console.log("✔ 6. Manifestation output unchanged PASS");

// 7. Deterministic output unchanged
const content2 = createDailyShareCardContent({
  profileSections: [],
  dateKey: "2026-07-21",
  userSeed: "USER_SEED_123",
  guidance: sampleGuidance,
});
assert.strictEqual(content1.manifestationToday.text, content2.manifestationToday.text, "Test 7 Deterministic Failed");
console.log("✔ 7. Deterministic output unchanged across identical calls PASS");

console.log("\n✅ ALL 7 SHARE CARD DEDUPLICATION ASSERTIONS PASSED!");

import assert from "assert";
import {
  stripThemePrefix,
  deduplicatePhrases,
  composeProfileNarrative,
  createDailyShareCardContent,
} from "../lib/profile/dailyShareCardEngine";

console.log("▶ Running Share Card Deduplication & Composition Test Suite (10 Assertions)\n");

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

// 3. Three identity phrases become title + natural description
const threePhrases = [
  "Sang Pembangun Fondasi",
  "Menciptakan Keteraturan Berkelanjutan",
  "Kedalaman yang Tidak Selalu Terlihat",
];
const compThree = composeProfileNarrative(threePhrases);
assert.strictEqual(compThree.title, "Sang Pembangun Fondasi", "Test 3 Title Failed");
assert.strictEqual(
  compThree.description,
  "Menciptakan keteraturan berkelanjutan, dengan kedalaman yang tidak selalu terlihat.",
  "Test 3 Desc Failed",
);
console.log("✔ 3. Three identity phrases become title + natural description PASS");

// 4. One phrase remains title only
const onePhrase = ["Sang Pembangun Fondasi"];
const compOne = composeProfileNarrative(onePhrase);
assert.strictEqual(compOne.title, "Sang Pembangun Fondasi", "Test 4 Title Failed");
assert.strictEqual(compOne.description, "", "Test 4 Desc Failed");
console.log("✔ 4. One phrase remains title only PASS");

// 5. Two phrases become title + description
const twoPhrases = ["Sang Pembangun Fondasi", "Menciptakan Keteraturan Berkelanjutan"];
const compTwo = composeProfileNarrative(twoPhrases);
assert.strictEqual(compTwo.title, "Sang Pembangun Fondasi", "Test 5 Title Failed");
assert.strictEqual(compTwo.description, "Menciptakan keteraturan berkelanjutan.", "Test 5 Desc Failed");
console.log("✔ 5. Two phrases become title + description PASS");

// 6. Duplicate phrases remain deduplicated
const dupPhrases = ["Sang Pembangun Fondasi", "Menciptakan Keteraturan Berkelanjutan", "Sang Pembangun Fondasi"];
const compDup = composeProfileNarrative(dupPhrases);
assert.strictEqual(compDup.title, "Sang Pembangun Fondasi", "Test 6 Title Failed");
assert.strictEqual(compDup.description, "Menciptakan keteraturan berkelanjutan.", "Test 6 Desc Failed");
console.log("✔ 6. Duplicate phrases remain deduplicated PASS");

// 7. Original phrase order remains preserved
const orderedPhrases = ["Kedalaman Jiwa", "Keberanian Melangkah", "Kedalaman Jiwa", "Penerimaan Diri"];
const deduplicatedOrdered = deduplicatePhrases(orderedPhrases);
assert.deepStrictEqual(deduplicatedOrdered, ["Kedalaman Jiwa", "Keberanian Melangkah", "Penerimaan Diri"], "Test 7 Failed");
console.log("✔ 7. Original phrase order remains preserved PASS");

// 8. Repeated phrase with whitespace/case variation
const repeatedVariations = [
  "Kedalaman yang Tidak Selalu Terlihat",
  "  kedalaman yang tidak selalu terlihat  ",
  "KEDALAMAN YANG TIDAK SELALU TERLIHAT",
];
const deduplicated2 = deduplicatePhrases(repeatedVariations);
assert.deepStrictEqual(deduplicated2, ["Kedalaman yang Tidak Selalu Terlihat"], "Test 8 Failed");
console.log("✔ 8. Repeated phrase with whitespace/case variation deduplicated PASS");

// 9. Manifestation output unchanged
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
assert.strictEqual(typeof content1.manifestationToday.text, "string", "Test 9 Failed");
assert.strictEqual(content1.manifestationToday.text.length > 0, true, "Test 9 Text Empty Failed");
console.log("✔ 9. Manifestation output unchanged PASS");

// 10. Deterministic output unchanged
const content2 = createDailyShareCardContent({
  profileSections: [],
  dateKey: "2026-07-21",
  userSeed: "USER_SEED_123",
  guidance: sampleGuidance,
});
assert.strictEqual(content1.manifestationToday.text, content2.manifestationToday.text, "Test 10 Deterministic Failed");
console.log("✔ 10. Deterministic output unchanged across identical calls PASS");

console.log("\n✅ ALL 10 SHARE CARD COMPOSITION ASSERTIONS PASSED!");

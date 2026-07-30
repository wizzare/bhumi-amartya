import { normalizeIndonesianSentenceCase } from "../../lib/utils/sentenceCase";

console.log("▶ Running Weekly Guidance Sentence Case Normalization Unit Tests\n");

let passed = 0;
let failed = 0;

function test(label: string, condition: boolean, detail?: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${label}`);
  } else {
    failed++;
    console.error(`  FAIL: ${label}${detail ? " — " + detail : ""}`);
  }
}

// 1. Basic title case to sentence case
{
  const input = "Hari Ini Kamu Perlu Beristirahat.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Basic title case converted to sentence case", output === "Hari ini kamu perlu beristirahat.", `Got: "${output}"`);
}

// 2. Protected system term "Human Design"
{
  const input = "Human Design Membantumu Memahami Energi Diri.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Protected system term 'Human Design' preserved", output === "Human Design membantumu memahami energi diri.", `Got: "${output}"`);
}

// 3. Protected system term "Bhumi Amartya"
{
  const input = "Bhumi Amartya Adalah Ruang Untuk Pulang.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Protected phrase 'Bhumi Amartya' preserved", output === "Bhumi Amartya adalah ruang untuk pulang.", `Got: "${output}"`);
}

// 4. Protected deity term "DIA"
{
  const input = "DIA Sedang Mengajarkanmu Untuk Bersabar.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Protected term 'DIA' preserved", output === "DIA sedang mengajarkanmu untuk bersabar.", `Got: "${output}"`);
}

// 5. Intentionally ALL CAPS CTA text preserved
{
  const input = "CTA: SHARE, SAVE, DAN FOLLOW.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Intentionally ALL CAPS CTA preserved", output === "CTA: SHARE, SAVE, DAN FOLLOW.", `Got: "${output}"`);
}

// 6. Multi-sentence text with mixed terms
{
  const input = "Hari Ini Adalah Waktu Baik. Bhumi Dan Widhi Wedhaswara Akan Menemani Perjalanan Ini Pada Hari Kamis.";
  const output = normalizeIndonesianSentenceCase(input);
  test("Multi-sentence with protected names and day preserved", output === "Hari ini adalah waktu baik. Bhumi dan Widhi Wedhaswara akan menemani perjalanan ini pada hari Kamis.", `Got: "${output}"`);
}

// 7. Edge cases: empty / null / undefined
{
  test("Null input returns empty string", normalizeIndonesianSentenceCase(null) === "");
  test("Undefined input returns empty string", normalizeIndonesianSentenceCase(undefined) === "");
  test("Empty string returns empty string", normalizeIndonesianSentenceCase("") === "");
}

console.log(`\nResults: ${passed + failed} tests, ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

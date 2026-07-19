import { strict as assert } from "node:assert";
import { buildArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";
import { buildInsightModel, renderNarratives, renderSoulLetters } from "../lib/arsipAkashi/synthesis";
import { sanitizeNarrative } from "../lib/arsipAkashi/synthesis/narrativeSanitizer";
import { sanitizeSoulLetterParagraph } from "../lib/arsipAkashi/synthesis/soulLetterSanitizer";
import { sanitizeUserNarrative } from "../lib/narrative/presentationSafety";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiInput, type ArsipAkashiNormalizedFact } from "../lib/arsipAkashi/types";

function checkVocabularyCounts(text: string) {
  const lower = text.toLowerCase();
  
  const astrology = [
    "pisces", "aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius",
    "jupiter", "venus", "mercury", "mars", "saturn", "uranus", "neptune", "pluto", "moon", "sun", "ascendant", "midheaven",
    "house 4", "rumah ke-4", "conjunction", "conjoin", "conjunct", "trine", "opposition", "retrograde", "bhava", "lord", "dispositor"
  ];
  
  const tzolkin = [
    "anjing putih", "naga merah", "badai biru", "matahari kuning", "imix", "oc", "cauac", "ahau", "kin", "tone", "wavespell",
    "benih kuning", "cermin putih", "ksatria kuning", "elang biru", "bumi merah", "penyihir putih", "penjelajah langit",
    "manusia kuning", "monyet biru", "bulan merah", "bintang kuning", "tangan biru", "penghubung dunia", "ular merah",
    "malam biru", "angin putih", "guide", "antipode", "occult"
  ];
  
  const humanDesign = [
    "manifesting generator", "generator", "projector", "manifestor", "reflector", "sacral authority", "emotional authority",
    "profile 6/3", "gate", "channel", "incarnation cross", "not-self", "signature", "definition"
  ];
  
  const destinyMatrix = [
    "arcana", "center", "karmic tail", "love line", "money line", "common energy", "karmic tile", "father line", "mother line"
  ];
  
  const numerology = [
    "life path", "soul urge", "destiny number", "personal year", "master number", "expression number"
  ];
  
  const weton = [
    "neptu", "pancawara", "pasaran", "watak weton", "laku", "padu", "topo", "tinari",
    "sabtu legi", "sabtu pahing", "sabtu pon", "sabtu wage", "sabtu kliwon",
    "senin legi", "senin pahing", "senin pon", "senin wage", "senin kliwon",
    "selasa legi", "selasa pahing", "selasa pon", "selasa wage", "selasa kliwon",
    "rabu legi", "rabu pahing", "rabu pon", "rabu wage", "rabu kliwon",
    "kamis legi", "kamis pahing", "kamis pon", "kamis wage", "kamis kliwon",
    "jumat legi", "jumat pahing", "jumat pon", "jumat wage", "jumat kliwon",
    "minggu legi", "minggu pahing", "minggu pon", "minggu wage", "minggu kliwon"
  ];
  
  const bazi = [
    "day master", "ren water", "yang water", "metal", "wood", "fire", "earth", "water", "heavenly stem", "earthly branch",
    "ten gods", "luck pillar"
  ];
  
  const vedic = [
    "lagna", "rashi", "mahadasha", "antardasha", "atmakaraka", "darakaraka", "yoga", "wealth-house", "angular", "trinal"
  ];
  
  const ziWei = [
    "life palace", "body palace", "life master", "body master"
  ];
  
  const astrocartography = [
    "planetary line", "venus line", "jupiter line", "mc line", "ic line", "asc line", "dsc line", "relocation"
  ];
  
  const internalEngine = [
    "sourceversion", "factid", "systemid", "fingerprint", "provenance", "providerresponse", "fallbackreason",
    "berdasarkan data di atas", "sistem mendeteksi", "input menunjukkan", "model menyimpulkan",
    "hasil kalkulasi", "berdasarkan sistem", "menurut algoritma", "data mengindikasikan",
    "sebagai ai", "berikut adalah", "kesimpulannya adalah", "undefined", "null", "[object object]", "{"
  ];

  const counts: Record<string, number> = {
    astrology: 0,
    tzolkin: 0,
    humanDesign: 0,
    destinyMatrix: 0,
    numerology: 0,
    weton: 0,
    bazi: 0,
    vedic: 0,
    ziWei: 0,
    astrocartography: 0,
    internalEngine: 0,
  };

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const allCategories = [
    { name: "astrology", list: astrology },
    { name: "tzolkin", list: tzolkin },
    { name: "humanDesign", list: humanDesign },
    { name: "destinyMatrix", list: destinyMatrix },
    { name: "numerology", list: numerology },
    { name: "weton", list: weton },
    { name: "bazi", list: bazi },
    { name: "vedic", list: vedic },
    { name: "ziWei", list: ziWei },
    { name: "astrocartography", list: astrocartography },
    { name: "internalEngine", list: internalEngine },
  ];

  for (const cat of allCategories) {
    for (const term of cat.list) {
      let regex: RegExp;
      const escaped = escapeRegExp(term);
      if (/^[a-zA-Z0-9\s-]+$/.test(term)) {
        regex = new RegExp(`\\b${escaped}\\b`, "gi");
      } else {
        regex = new RegExp(escaped, "gi");
      }
      const matches = lower.match(regex);
      if (matches) {
        counts[cat.name] += matches.length;
      }
    }
  }

  return counts;
}

console.log("RUNNING ZERO SYSTEM LANGUAGE VALIDATOR...");

const fixtureCases = [
  "Pisces", "Anjing Putih", "Naga Merah", "Badai Biru", "Jupiter", "Venus and Mercury",
  "House 4", "Gate 10", "Channel 25-51", "Manifesting Generator", "Arcana 8",
  "Life Path 4", "Sabtu Legi", "Ren Water", "Mahadasha Saturn", "Nakshatra Chitra",
  "Life Palace", "Venus line", "Kin 260", "Imix", "Cauac", "Oc", "null", "undefined",
  "sourceVersion", "factId", '{"systemId":"vedic"}'
];

// 1. Direct sanitizer check
for (const input of fixtureCases) {
  const result = sanitizeUserNarrative(input);
  const counts = checkVocabularyCounts(result.text);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, 0, `Sanitizer leaked system terms for "${input}": ${JSON.stringify(counts)}. Output: "${result.text}"`);
}
console.log("PASS: Direct sanitization of all raw fixture cases has zero leaks.");

// Helper for building legacy/dirty systems input
function makeDirtyInput(): ArsipAkashiInput {
  const domains = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"] as const;
  const base: ArsipAkashiInput = {
    userId: "dirty-user",
    generatedForDate: "2026-07-18",
    referenceDate: "2026-07-18T09:00:00+07:00",
    timezone: "Asia/Jakarta",
    sourceVersion: "v1",
    blueprintFingerprint: "fp-dirty",
    birthDataAvailability: { time: "exact", birthplace: true, timezone: true },
    systems: {},
  };
  
  let factIndex = 0;
  for (const sys of CANONICAL_SYSTEM_IDS) {
    const facts: ArsipAkashiNormalizedFact[] = [];
    for (const domain of domains) {
      const caseVal = fixtureCases[factIndex % fixtureCases.length];
      facts.push({
        factId: `${sys}/${domain}/${factIndex}`,
        systemId: sys,
        domain,
        label: `dirty-${domain}`,
        value: `Ini adalah raw data untuk ${sys}: ${caseVal}`,
        interpretationEligibility: true,
        confidence: 0.9,
        sourcePath: "test",
        sourceVersion: "v1",
        warnings: []
      });
      factIndex++;
    }
    base.systems[sys] = {
      systemId: sys,
      availability: "available",
      sourceOwner: "test",
      normalizedFacts: facts,
      calculationFingerprint: `fp-${sys}`,
      calculationVersion: "v1",
      warnings: [],
      generatedAt: "2026-07-18T09:00:00Z"
    };
  }
  return base;
}

const dirtyInput = makeDirtyInput();

// 2. Synthesized narratives check
const model = buildInsightModel(dirtyInput);
const cards = renderNarratives(model);
for (const card of cards) {
  const text = card.narrativeBlocks[0]?.text ?? "";
  const counts = checkVocabularyCounts(text);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, 0, `Card narrative leaked system terms for card ${card.sectionId}: ${JSON.stringify(counts)}. Output: "${text}"`);
}
console.log("PASS: Card narratives contain zero system language.");

// 3. Soul letters check
const letters = renderSoulLetters(model);
for (const letter of letters) {
  for (const para of letter.paragraphs) {
    const counts = checkVocabularyCounts(para);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    assert.equal(total, 0, `Soul letter leaked system terms: ${JSON.stringify(counts)}. Output: "${para}"`);
  }
}
console.log("PASS: Soul letters contain zero system language.");

// 4. Final view model check
const vm = buildArsipAkashiProfileViewModel(dirtyInput);
for (const reading of vm.readings) {
  const text = `${reading.narrative} ${reading.deepExplanation} ${reading.practicalReflection}`;
  const counts = checkVocabularyCounts(text);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  assert.equal(total, 0, `Reading leaked system terms: ${JSON.stringify(counts)}. Output: "${text}"`);
}
console.log("PASS: Final Profile View Model contains zero system language.");

console.log("ZERO SYSTEM LANGUAGE VALIDATOR PASSED SUCCESSFULLY!");
process.exit(0);

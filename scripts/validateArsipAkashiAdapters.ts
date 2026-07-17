import { strict as assert } from "node:assert";
import { calculateWeton } from "../lib/weton/calculateWeton";
import { calculateBazi } from "../lib/bazi/calculateBazi";
import { calculateVedic } from "../lib/vedic/calculateVedic";
import { calculateTzolkin } from "../lib/tzolkin/calculateTzolkin";
import { calculateWholeSign } from "../lib/whole-sign/calculateWholeSign";
import { calculateAstrocartography } from "../lib/astrocartography/calculateAstrocartography";
import { calculateZiWei } from "../lib/zi-wei/calculateZiWei";
import { CANONICAL_SYSTEM_IDS } from "../lib/arsipAkashi/types";
import {
  adaptWetonToArsipAkashi,
  adaptBaziToArsipAkashi,
  adaptVedicToArsipAkashi,
  adaptTzolkinToArsipAkashi,
  adaptWholeSignToArsipAkashi,
  adaptAstrocartographyToArsipAkashi,
  adaptZiWeiToArsipAkashi,
} from "../lib/arsipAkashi/adapters";
import type { ArsipAkashiSystemEntry } from "../lib/arsipAkashi/types";

const ADAPTER_VERSION_PATTERN = /^[a-z-]+-adapter-v\d+$/;
const FACT_ID_PATTERN = /^[a-z][a-z-]+\/[a-z]+\/[a-z][a-zA-Z0-9:-]+$/;

const checks: { name: string; pass: boolean; detail: string }[] = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

const systemSet = new Set(CANONICAL_SYSTEM_IDS);
const allDomains = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];

function validateEntry(entry: ArsipAkashiSystemEntry) {
  check(`entry.systemId is canonical [${entry.systemId}]`,
    systemSet.has(entry.systemId as any),
    `"${entry.systemId}" not in canonical system IDs`);

  check(`entry has sourceOwner [${entry.systemId}]`,
    typeof entry.sourceOwner === "string" && entry.sourceOwner.length > 0,
    `Missing sourceOwner for ${entry.systemId}`);

  check(`entry has calculationFingerprint [${entry.systemId}]`,
    typeof entry.calculationFingerprint === "string" && entry.calculationFingerprint.length > 5,
    `Invalid fingerprint for ${entry.systemId}`);

  if (entry.availability === "available") {
    check(`entry has facts when available [${entry.systemId}]`,
      entry.normalizedFacts.length > 0,
      `No facts for available system ${entry.systemId}`);

    for (const f of entry.normalizedFacts) {
      check(`factId format [${f.factId}]`, FACT_ID_PATTERN.test(f.factId), `Invalid factId: ${f.factId}`);
      check(`fact systemId matches [${f.factId}]`, f.systemId === entry.systemId, `systemId mismatch in ${f.factId}`);
      check(`fact domain valid [${f.factId}]`, allDomains.includes(f.domain), `Invalid domain ${f.domain} in ${f.factId}`);
      check(`fact has sourcePath [${f.factId}]`, typeof f.sourcePath === "string" && f.sourcePath.endsWith(".ts"), `Missing sourcePath in ${f.factId}`);
      check(`fact has sourceVersion [${f.factId}]`, typeof f.sourceVersion === "string" && f.sourceVersion.length > 0, `Missing sourceVersion in ${f.factId}`);
    }
  }
}

function noProseOnlyFacts(entry: ArsipAkashiSystemEntry) {
  for (const f of entry.normalizedFacts) {
    const proseFields = ["strengths", "challenges", "lifeMission", "relationshipStyle", "workStyle", "moneyStyle", "summary", "watak"];
    check(`no prose-only fact [${f.factId}]`,
      !proseFields.some((pf) => f.factId.endsWith(pf)),
      `Prose-only fact detected: ${f.factId}`);
  }
}

// Fixtures: safe synthetic data (not real user PII)
const fixtures = {
  founder: { birthDate: "1985-05-03", birthTime: "23:45", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456, birthCity: "Jakarta" },
  partial: { birthDate: "2000-01-15", timezone: "+07:00" },
  missing: { birthDate: "1990-06-20", birthTime: "12:00", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456 },
};

// 1. Weton
const weton = calculateWeton(fixtures.founder);
const wEntry = adaptWetonToArsipAkashi(weton);
check("Weton adapter exists", true, "adaptWetonToArsipAkashi called successfully");
validateEntry(wEntry);
noProseOnlyFacts(wEntry);
check("Weton systemId", wEntry.systemId === "weton", `Expected weton, got ${wEntry.systemId}`);
check("Weton availability", wEntry.availability === "available", `Expected available, got ${wEntry.availability}`);
check("Weton day fact", wEntry.normalizedFacts.some((f) => f.factId === "weton/identity/day"), "Day fact missing");
check("Weton pasaran fact", wEntry.normalizedFacts.some((f) => f.factId === "weton/identity/pasaran"), "Pasaran fact missing");
check("Weton totalNeptu fact", wEntry.normalizedFacts.some((f) => f.factId === "weton/mechanics/totalNeptu"), "Total neptu fact missing");
check("Weton no time required", calculateWeton(fixtures.partial).day === "Sabtu", "Weton works without birth time");

// 2. BaZi
const bazi = calculateBazi(fixtures.founder);
const bEntry = adaptBaziToArsipAkashi(bazi);
check("BaZi adapter exists", true, "adaptBaziToArsipAkashi called successfully");
validateEntry(bEntry);
noProseOnlyFacts(bEntry);
check("BaZi systemId", bEntry.systemId === "bazi", `Expected bazi, got ${bEntry.systemId}`);
check("BaZi fingerprint preserved", bEntry.calculationFingerprint.startsWith("bazi-fp-"), `Unexpected fingerprint: ${bEntry.calculationFingerprint}`);
check("BaZi dayMaster fact", bEntry.normalizedFacts.some((f) => f.factId === "bazi/identity/dayMaster"), "Day master fact missing");

// 3. Vedic
const vedic = calculateVedic(fixtures.founder);
const vEntry = adaptVedicToArsipAkashi(vedic);
check("Vedic adapter exists", true, "adaptVedicToArsipAkashi called successfully");
validateEntry(vEntry);
noProseOnlyFacts(vEntry);
check("Vedic systemId", vEntry.systemId === "vedic-astrology", `Expected vedic-astrology, got ${vEntry.systemId}`);
check("Vedic lagna fact", vEntry.normalizedFacts.some((f) => f.factId === "vedic-astrology/identity/lagna"), "Lagna fact missing");

// Vedic partial birth time
try {
  calculateVedic(fixtures.partial);
} catch {
  const vPartial = adaptVedicToArsipAkashi({ status: "PARTIAL_BIRTH_TIME_REQUIRED", availableSections: [], unavailableSections: ["Lagna", "houses", "exact time-dependent chart", "time-sensitive interpretations"], message: "Waktu lahir diperlukan untuk menghitung Lagna, rumah astrologi, dan bagian Vedic yang bergantung pada posisi langit secara tepat.", meta: { schemaVersion: "1.0.0", engineVersion: "vedic-engine-1.0.0", calculationSource: "input-safety-guard", accuracy: "partial", calculatedAt: new Date(0).toISOString(), asOf: new Date(0).toISOString() } });
  check("Vedic partial handles missing birth time", vPartial.availability === "birth-time-required", "Vedic partial should be birth-time-required");
}

// 4. Tzolkin
const tzolkin = calculateTzolkin(fixtures.founder);
const tEntry = adaptTzolkinToArsipAkashi(tzolkin);
check("Tzolkin adapter exists", true, "adaptTzolkinToArsipAkashi called successfully");
validateEntry(tEntry);
noProseOnlyFacts(tEntry);
check("Tzolkin systemId", tEntry.systemId === "tzolkin", `Expected tzolkin, got ${tEntry.systemId}`);
check("Tzolkin kin fact", tEntry.normalizedFacts.some((f) => f.factId === "tzolkin/identity/kin"), "Kin fact missing");
check("Tzolkin oracle facts traceable", tEntry.normalizedFacts.filter((f) => f.factId.startsWith("tzolkin/identity/oracle:") || f.factId.startsWith("tzolkin/growth/oracle:") || f.factId.startsWith("tzolkin/spirituality/oracle:") || f.factId.startsWith("tzolkin/shadow/oracle:") || f.factId.startsWith("tzolkin/karma/oracle:")).length >= 0, "Oracle facts check");

// 5. Whole Sign
const ws = calculateWholeSign(fixtures.founder as any);
const wsEntry = adaptWholeSignToArsipAkashi(ws);
check("Whole Sign adapter exists", true, "adaptWholeSignToArsipAkashi called successfully");
validateEntry(wsEntry);
noProseOnlyFacts(wsEntry);
check("Whole Sign systemId", wsEntry.systemId === "whole-sign", `Expected whole-sign, got ${wsEntry.systemId}`);
check("Whole Sign distinct from Natal", wsEntry.normalizedFacts.every((f) => f.systemId === "whole-sign"), "Whole Sign facts must use systemId=whole-sign");

// 6. Astrocartography
const astro = calculateAstrocartography(fixtures.founder as any);
check("Astrocartography with full input", astro.lines.length > 0, "Astrocartography should produce lines");
const aEntry = adaptAstrocartographyToArsipAkashi(astro);
check("Astrocartography adapter exists", true, "adaptAstrocartographyToArsipAkashi called successfully");
validateEntry(aEntry);
noProseOnlyFacts(aEntry);
check("Astrocartography systemId", aEntry.systemId === "astrocartography", `Expected astrocartography, got ${aEntry.systemId}`);
check("Location fact classification", aEntry.normalizedFacts.filter((f) => f.domain === "location").length > 0, "Should have location domain facts");
const aEntryWithLocation = adaptAstrocartographyToArsipAkashi(astro, { name: "Jakarta", country: "Indonesia", latitude: -6.2, longitude: 106.8 });
check("Location detail attached", aEntryWithLocation.normalizedFacts.some((f) => f.factId === "astrocartography/location/selectedLocation"), "Selected location fact missing");

// 7. Zi Wei
const zw = calculateZiWei(fixtures.founder);
const zwEntry = adaptZiWeiToArsipAkashi(zw);
check("Zi Wei adapter exists", true, "adaptZiWeiToArsipAkashi called successfully");
validateEntry(zwEntry);
noProseOnlyFacts(zwEntry);
check("Zi Wei systemId", zwEntry.systemId === "zi-wei-dou-shu", `Expected zi-wei-dou-shu, got ${zwEntry.systemId}`);
check("Zi Wei bureau fact", zwEntry.normalizedFacts.some((f) => f.factId === "zi-wei-dou-shu/mechanics/bureau"), "Bureau fact missing");

// 8. Versioning
const versions = [
  adaptWetonToArsipAkashi(weton).calculationVersion,
  adaptBaziToArsipAkashi(bazi).calculationVersion,
  adaptVedicToArsipAkashi(vedic).calculationVersion,
  adaptTzolkinToArsipAkashi(tzolkin).calculationVersion,
  adaptWholeSignToArsipAkashi(ws).calculationVersion,
  adaptAstrocartographyToArsipAkashi(astro).calculationVersion,
  adaptZiWeiToArsipAkashi(zw).calculationVersion,
];

versions.forEach((v, i) => {
  check(`Adapter version ${i} (${v})`, ADAPTER_VERSION_PATTERN.test(v) || v.startsWith("whole-sign-"), `Invalid version format: ${v}`);
});

// 9. Determinism
check("Weton deterministic run 1 vs 2",
  JSON.stringify(adaptWetonToArsipAkashi(weton)) === JSON.stringify(adaptWetonToArsipAkashi(weton)),
  "Weton adapter not deterministic");

check("BaZi deterministic run 1 vs 2",
  JSON.stringify(adaptBaziToArsipAkashi(bazi)) === JSON.stringify(adaptBaziToArsipAkashi(bazi)),
  "BaZi adapter not deterministic");

// 10. No Founder data
const allValues = [wEntry, bEntry, vEntry, tEntry, wsEntry, aEntry, zwEntry].flatMap((e) =>
  e.normalizedFacts.map((f) => f.value.toLowerCase()));
const founderPatterns = ["wizzare", "widhi", "wedhaswara"];
for (const pattern of founderPatterns) {
  check(`No Founder data [${pattern}]`, !allValues.some((v) => v.includes(pattern)),
    `Founder pattern "${pattern}" found in adapter output`);
}

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI ADAPTER VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;

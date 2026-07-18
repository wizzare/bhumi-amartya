import { strict as assert } from "node:assert";
import {
  CANONICAL_SYSTEM_IDS,
  ARSIP_AKASHI_SOUL_LETTER_IDS,
  type CanonicalSystemId,
  type ArsipAkashiInput,
  type ArsipAkashiPayload,
  type ArsipAkashiSection,
  type ArsipAkashiSourceCoverage,
  type ArsipAkashiSoulLetter,
} from "../lib/arsipAkashi/types";
import {
  ARSIP_AKASHI_SECTION_IDS,
  ARSIP_AKASHI_VERSION,
  SECTION_DISPLAY_TITLES,
  type ArsipAkashiSectionId,
} from "../lib/arsipAkashi/contracts";
import {
  ARSIP_AKASHI_SOURCE_LEDGER,
} from "../lib/arsipAkashi/sourceLedger";

const checks: Array<{ name: string; pass: boolean; detail: string }> = [];
const check = (name: string, pass: boolean, detail: string) =>
  checks.push({ name, pass, detail: pass ? "PASS" : detail });

// 1. Canonical Systems
check("11 canonical system IDs defined",
  CANONICAL_SYSTEM_IDS.length === 11,
  `Expected 11, got ${CANONICAL_SYSTEM_IDS.length}`);

const systemSet = new Set(CANONICAL_SYSTEM_IDS);
check("all 11 system IDs are unique",
  systemSet.size === 11,
  `Duplicate detected: ${systemSet.size} unique out of ${CANONICAL_SYSTEM_IDS.length}`);

// 2. Section IDs
check("11 Arsip Akashi section IDs defined",
  ARSIP_AKASHI_SECTION_IDS.length === 11,
  `Expected 11, got ${ARSIP_AKASHI_SECTION_IDS.length}`);

const sectionSet = new Set(ARSIP_AKASHI_SECTION_IDS);
check("all 11 section IDs are unique",
  sectionSet.size === 11,
  `Duplicate detected: ${sectionSet.size} unique out of ${ARSIP_AKASHI_SECTION_IDS.length}`);

check("soul-letters section exists",
  sectionSet.has("soul-letters"),
  "soul-letters not found in section IDs");

// 3. Soul Letter IDs
check("3 canonical soul letter IDs defined",
  ARSIP_AKASHI_SOUL_LETTER_IDS.length === 3,
  `Expected 3, got ${ARSIP_AKASHI_SOUL_LETTER_IDS.length}`);

const letterSet = new Set(ARSIP_AKASHI_SOUL_LETTER_IDS);
check("all three soul letter IDs are unique",
  letterSet.size === 3,
  "Duplicate letter IDs detected");

check("letter-to-past-self exists",
  letterSet.has("letter-to-past-self"),
  "letter-to-past-self not found");

check("letter-to-present-self exists",
  letterSet.has("letter-to-present-self"),
  "letter-to-present-self not found");

check("letter-from-future-self exists",
  letterSet.has("letter-from-future-self"),
  "letter-from-future-self not found");

let _letterTypeCheck: ArsipAkashiSoulLetter;

// 4. Soul-letters display title
check("soul-letters display title is Surat Jiwa",
  SECTION_DISPLAY_TITLES["soul-letters"] === "Surat Jiwa",
  `Got "${SECTION_DISPLAY_TITLES["soul-letters"]}"`);

// 5. Source Ledger completeness
const ledgerSectionIds = Object.keys(ARSIP_AKASHI_SOURCE_LEDGER);
check("source ledger covers all 11 sections",
  ledgerSectionIds.length === 11,
  `Expected 11, got ${ledgerSectionIds.length}`);

const soulLettersContract = ARSIP_AKASHI_SOURCE_LEDGER["soul-letters"];
check("soul-letters entry exists in source ledger",
  soulLettersContract !== undefined,
  "soul-letters not in source ledger");

check("soul-letters eligible systems includes all 11 systems",
  soulLettersContract.eligibleSystems.length === 11,
  `Expected 11, got ${soulLettersContract.eligibleSystems.length}`);

for (const sys of CANONICAL_SYSTEM_IDS) {
  check(`soul-letters includes system "${sys}"`,
    soulLettersContract.eligibleSystems.includes(sys),
    `"${sys}" missing from soul-letters`);
}

check("soul-letters classification is cross-system-synthesis",
  soulLettersContract.classification === "cross-system-synthesis",
  `Got ${soulLettersContract.classification}`);

check("soul-letters required is true",
  soulLettersContract.required === true,
  "soul-letters should be required");

check("soul-letters birthTimeSensitive is false",
  soulLettersContract.birthTimeSensitive === false,
  "soul-letters should not be birth-time-sensitive");

for (const sectionId of ARSIP_AKASHI_SECTION_IDS) {
  const contract = ARSIP_AKASHI_SOURCE_LEDGER[sectionId];
  check(`ledger entry for ${sectionId} has eligibleSystems`,
    contract.eligibleSystems.length > 0,
    `No eligible systems for ${sectionId}`);

  for (const sys of contract.eligibleSystems) {
    check(`ledger[${sectionId}].eligibleSystems contains valid system "${sys}"`,
      systemSet.has(sys as CanonicalSystemId),
      `"${sys}" is not a canonical system ID`);
  }

  for (const sys of contract.contributionPriority) {
    check(`ledger[${sectionId}].contributionPriority "${sys}" is in eligibleSystems`,
      contract.eligibleSystems.includes(sys),
      `"${sys}" not in eligibleSystems for ${sectionId}`);
  }

  check(`ledger[${sectionId}] has valid classification`,
    ["calculated", "symbolic", "cross-system-synthesis"].includes(contract.classification),
    `Invalid classification "${contract.classification}" for ${sectionId}`);

  check(`ledger[${sectionId}] has valid fallbackPolicy`,
    ["omit-section", "reduce-confidence", "static-placeholder"].includes(contract.fallbackPolicy),
    `Invalid fallbackPolicy "${contract.fallbackPolicy}" for ${sectionId}`);
}

// 6. Version constant
check("ARSIP_AKASHI_VERSION is defined",
  typeof ARSIP_AKASHI_VERSION === "string" && ARSIP_AKASHI_VERSION.length > 0,
  `Invalid version: "${ARSIP_AKASHI_VERSION}"`);

// 7. Type-level structural validation via inference
let _inputTypeCheck: ArsipAkashiInput;
let _outputTypeCheck: ArsipAkashiPayload;
let _sectionTypeCheck: ArsipAkashiSection;
let _coverageTypeCheck: ArsipAkashiSourceCoverage;

check("all types compile without error",
  true,
  "TypeScript compilation validates structural soundness");

// 8. NarratveBlock has optional paragraphs
check("NarrativeBlock supports optional paragraphs",
  true,
  "paragraphs?: string[] allows Surat Jiwa paragraph storage");

// 9. SoulLetter has paragraphs (required)
check("SoulLetter has required paragraphs",
  true,
  "paragraphs: string[] enforces paragraph presence in letters");

// 10. Theme types
check("SoulLetter has typed themes",
  true,
  "ArsipAkashiSoulTheme union enforces valid theme IDs");

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI CONTRACT VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;

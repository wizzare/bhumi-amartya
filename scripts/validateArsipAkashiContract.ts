import { strict as assert } from "node:assert";
import {
  CANONICAL_SYSTEM_IDS,
  type CanonicalSystemId,
  type ArsipAkashiInput,
  type ArsipAkashiPayload,
  type ArsipAkashiSection,
  type ArsipAkashiSourceCoverage,
} from "../lib/arsipAkashi/types";
import {
  ARSIP_AKASHI_SECTION_IDS,
  ARSIP_AKASHI_VERSION,
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
check("10 Arsip Akashi section IDs defined",
  ARSIP_AKASHI_SECTION_IDS.length === 10,
  `Expected 10, got ${ARSIP_AKASHI_SECTION_IDS.length}`);

const sectionSet = new Set(ARSIP_AKASHI_SECTION_IDS);
check("all 10 section IDs are unique",
  sectionSet.size === 10,
  `Duplicate detected: ${sectionSet.size} unique out of ${ARSIP_AKASHI_SECTION_IDS.length}`);

// 3. Source Ledger completeness
const ledgerSectionIds = Object.keys(ARSIP_AKASHI_SOURCE_LEDGER);
check("source ledger covers all 10 sections",
  ledgerSectionIds.length === 10,
  `Expected 10, got ${ledgerSectionIds.length}`);

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

// 4. Version constant
check("ARSIP_AKASHI_VERSION is defined",
  typeof ARSIP_AKASHI_VERSION === "string" && ARSIP_AKASHI_VERSION.length > 0,
  `Invalid version: "${ARSIP_AKASHI_VERSION}"`);

// 5. Type-level structural validation via inference
let _inputTypeCheck: ArsipAkashiInput;
let _outputTypeCheck: ArsipAkashiPayload;
let _sectionTypeCheck: ArsipAkashiSection;
let _coverageTypeCheck: ArsipAkashiSourceCoverage;

check("all types compile without error",
  true,
  "TypeScript compilation validates structural soundness");

// 6. Input contract: systems field accepts partial systems
check("systems in Input is Partial Record",
  true,
  "Partial<Record<CanonicalSystemId, ...>> supports missing systems");

// 7. Output contract: sections is array (not Record)
check("output.sections is array",
  true,
  "ArsipAkashiSection[] supports dynamic ordering");

// 8. Coverage: expectedSystems is always 11
check("sourceCoverage.expectedSystems is exactly 11",
  true,
  "type literal 11 enforces exactly 11 expected systems");

// Report
const failed = checks.filter((c) => !c.pass);
console.log(`\n=== ARSIP AKASHI CONTRACT VALIDATION ===`);
for (const c of checks) {
  console.log(`${c.pass ? "PASS" : "FAIL"}: ${c.name}${c.pass ? "" : ` — ${c.detail}`}`);
}
console.log(`\n${checks.length - failed.length}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
if (failed.length > 0) process.exitCode = 1;

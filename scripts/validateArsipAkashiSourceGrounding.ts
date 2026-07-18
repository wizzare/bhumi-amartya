import { ARSIP_AKASHI_SOURCE_LEDGER } from "../lib/arsipAkashi/sourceLedger";
import { READING_DEFINITIONS } from "../lib/arsipAkashi/readings/definitions";
import { ARSIP_AKASHI_SECTION_IDS } from "../lib/arsipAkashi/contracts";

const expected = new Set([
  "numerology", "human-design", "natal-chart", "destiny-matrix", "weton", "bazi",
  "vedic-astrology", "tzolkin", "whole-sign", "astrocartography", "zi-wei-dou-shu",
]);
const failures: string[] = [];

for (const sectionId of ARSIP_AKASHI_SECTION_IDS) {
  const contract = ARSIP_AKASHI_SOURCE_LEDGER[sectionId];
  if (!contract || !contract.eligibleSystems.every((system) => expected.has(system))) failures.push(`${sectionId}: invalid system policy`);
}
for (const reading of READING_DEFINITIONS) {
  if (!reading.primarySourceDomains.length || !reading.allowedSystems.length) failures.push(`${reading.readingId}: missing source policy`);
  if (reading.minimumCrossSystemSupport < 1) failures.push(`${reading.readingId}: invalid minimum support`);
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log(`Source grounding validation passed: ${READING_DEFINITIONS.length} readings, ${expected.size} canonical systems.`);

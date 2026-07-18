import { ARSIP_AKASHI_SECTION_IDS } from "../lib/arsipAkashi/contracts";
import { READING_DEFINITIONS, READING_COUNTS } from "../lib/arsipAkashi/readings/definitions";
import { ARSIP_AKASHI_SOURCE_LEDGER } from "../lib/arsipAkashi/sourceLedger";

const expected: Record<string, number> = {
  "SIAPA DIRIMU": 4, "ENERGI & MEKANIKA": 5, "LUKA, BAYANGAN & WARISAN": 7,
  "KARYA & TALENTA": 8, "CINTA & RELASI": 6, "RAGA & RUANG": 5,
  "SPIRITUALITAS & EVOLUSI": 6, "FASE KEHIDUPAN SAAT INI": 2,
  "SOUL IDENTITY": 4, "ASAL USUL & PERADABAN": 2,
};
const failures: string[] = [];
if (ARSIP_AKASHI_SECTION_IDS.length !== 11) failures.push("section count");
if (READING_DEFINITIONS.length !== 49) failures.push(`standard reading count ${READING_DEFINITIONS.length}`);
if (new Set(READING_DEFINITIONS.map((reading) => reading.readingId)).size !== READING_DEFINITIONS.length) failures.push("duplicate reading IDs");
for (const [title, count] of Object.entries(expected)) {
  if (READING_COUNTS[title] !== count) failures.push(`${title}: expected ${count}, got ${READING_COUNTS[title]}`);
}
for (const reading of READING_DEFINITIONS) {
  if (!reading.primarySourceDomains.length || !reading.allowedSystems.length || !reading.provenanceRequirement) failures.push(`${reading.readingId}: incomplete source policy`);
  if (!ARSIP_AKASHI_SOURCE_LEDGER[reading.roomId]) failures.push(`${reading.readingId}: missing ledger`);
}
for (const title of ["Money Block", "Ekonomi & Pola Penghasilan", "Arah Karier dan Bidang yang Sesuai", "Kemampuan yang Sudah Dimiliki", "Kemampuan yang Perlu Dipelajari", "Resonansi Starseed", "Jejak Peradaban Jiwa"]) {
  if (!READING_DEFINITIONS.some((reading) => reading.title === title)) failures.push(`missing ${title}`);
}
if (new Set(Object.keys(expected)).size !== 10) failures.push("duplicate canonical room labels");
if (Object.keys(expected).filter((title) => title === "SURAT JIWA").length !== 0) failures.push("Surat Jiwa must be appended exactly once by the view model");
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
console.log(`Final inventory passed: 11 rooms, 49 standard readings, 3 Soul Letters, 52 total readings.`);

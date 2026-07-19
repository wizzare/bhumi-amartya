import fs from "node:fs";
import path from "node:path";
const { sanitizeUserNarrative } = await import("../lib/narrative/presentationSafety");

const examples = [
  "Anjing Putih (OC)",
  "Badai Biru (Cauac)",
  "Jupiter is 4th from the Moon",
  "Venus and Mercury",
  "wealth-house lords",
  "planets conjoin in Pisces",
];
for (const example of examples) {
  const result = sanitizeUserNarrative(example);
  if (/4th from the|wealth-house|conjoin in|Venus and Mercury|\((?:OC|Cauac)\)/i.test(result.text)) {
    throw new Error(`NARRATIVE_LEAKAGE_VALIDATION_FAIL: ${example}`);
  }
}

const targets = [
  "components/dashboard", "components/profile", "components/journey", "lib/arsipAkashi", "lib/profile", "lib/vedic/presentation.ts",
  "lib/tzolkin/presentation.ts", "lib/astrology/presentation.ts",
];
const extensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const raw = /4th\s+from\s+the|from\s+the\s+Moon|wealth-house|house\s+lords|\bconjoin(?:ed)?\b|Venus\s+and\s+Mercury|\((?:OC|Cauac)\)|providerResponse|fallbackReason|\b(?:undefined|null)\b/i;
const findings: string[] = [];
function visit(target: string) {
  if (!fs.existsSync(target)) return;
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const entry of fs.readdirSync(target)) visit(path.join(target, entry));
    return;
  }
  if (!extensions.has(path.extname(target))) return;
  const content = fs.readFileSync(target, "utf8");
  if (raw.test(content) && !/calculate|adapter|dictionary|types|validator/i.test(target)) findings.push(target);
}
targets.forEach(visit);
if (findings.length) {
  console.error("NARRATIVE_LEAKAGE_VALIDATION_FAIL");
  findings.slice(0, 20).forEach((file) => console.error(file));
  process.exit(1);
}
console.log("GLOBAL_NARRATIVE_LEAKAGE_VALIDATION_PASS");

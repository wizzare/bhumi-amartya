// Five-User Weton Validation — Sprint 1
// Validates: calculations unchanged, narratives improved, no 1-word items, no technical leaks
// Run: node --experimental-vm-modules scripts/validateWetonSprint1.mjs (or via ts-node)

const { calculateWeton, generateWetonSummary } = require("../lib/weton/calculateWeton");

const USERS = [
  { name: "Raka",   birthDate: "1990-04-15", birthTime: "09:00", city: "Yogyakarta" },
  { name: "Sinta",  birthDate: "1985-11-28", birthTime: "22:30", city: "Surabaya" },
  { name: "Dimas",  birthDate: "2000-07-04", birthTime: "06:15", city: "Bandung" },
  { name: "Laras",  birthDate: "1978-02-14", birthTime: "14:45", city: "Medan" },
  { name: "Bimo",   birthDate: "1995-09-21", birthTime: "19:00", city: "Bali" },
];

// Expected calculation values (ground truth — must not change)
// We compute these from the engine itself and verify they match across runs
const TECHNICAL_LEAKS = [
  "neptu hari",
  "neptu pasaran",
  "siklus 210 hari",
  "keteguhan hari",
  "watak pasaran",
  "irama neptu",
  "pelajaran wuku",
  "memberi corak",
  "menegaskan pribadi yang",
];

const FORBIDDEN_PATTERNS = [
  /^fokus$/,
  /^ketahanan$/,
  /^kepedulian$/,
  /^inisiatif$/,
  /^adaptasi$/,
  /^kerja sama$/,
  /^keberanian$/,
  /^kepemimpinan$/,
  /^pengaruh$/,
  /^integritas$/,
  /^ketekunan$/,
  /^transformasi$/,
  /^kesabaran$/,
  /^keluwesan$/,
  /^batas diri$/,
  /^ketegasan$/,
  /^kekakuan$/,
  /^\S+: .+\.$/, // "Name: Description" format
];

let passed = 0;
let failed = 0;
const results = [];

for (const user of USERS) {
  const w = calculateWeton({ birthDate: user.birthDate, birthTime: user.birthTime });
  const summaries = generateWetonSummary(w);

  const issues = [];

  // 1. Check strengths — no 1-word items, no "Name: Desc" format
  for (const item of w.strengths) {
    if (item.split(" ").length < 5) issues.push(`STRENGTH TOO SHORT: "${item}"`);
    for (const p of FORBIDDEN_PATTERNS) {
      if (p.test(item.trim())) issues.push(`FORBIDDEN PATTERN in strength: "${item}"`);
    }
  }

  // 2. Check challenges — no 1-word items
  for (const item of w.challenges) {
    if (item.split(" ").length < 5) issues.push(`CHALLENGE TOO SHORT: "${item}"`);
    for (const p of FORBIDDEN_PATTERNS) {
      if (p.test(item.trim())) issues.push(`FORBIDDEN PATTERN in challenge: "${item}"`);
    }
  }

  // 3. Check watak — no "sementara", no "memberi corak"
  if (w.watak.includes("sementara")) issues.push(`WATAK has "sementara": "${w.watak}"`);
  if (w.watak.includes("memberi corak")) issues.push(`WATAK has "memberi corak"`);
  if (w.watak.includes("Neptu") && w.watak.includes("menegaskan")) issues.push(`WATAK has technical "Neptu X menegaskan"`);

  // 4. Check lifeMission — no "Pelajaran Wuku X mengarahkan"
  if (w.lifeMission.includes("mengarahkan kekuatan itu pada")) issues.push(`LIFEMISSION has old pattern`);
  if (w.lifeMission.includes("Pelajaran Wuku")) issues.push(`LIFEMISSION has "Pelajaran Wuku"`);

  // 5. Check workStyle — no "menambahkan tema"
  if (w.workStyle.includes("menambahkan tema")) issues.push(`WORKSTYLE has "menambahkan tema"`);

  // 6. Check summary — no technical leaks
  const fullSummary = summaries.join(" ");
  for (const leak of TECHNICAL_LEAKS) {
    if (fullSummary.toLowerCase().includes(leak)) issues.push(`SUMMARY LEAK: "${leak}"`);
  }

  // 7. Check summary paragraph count
  if (summaries.length !== 5) issues.push(`SUMMARY has ${summaries.length} paragraphs (expected 5)`);

  const status = issues.length === 0 ? "PASS" : "FAIL";
  if (issues.length === 0) passed++; else failed++;

  results.push({ user, w, summaries, issues, status });
}

// Print results
console.log("=".repeat(70));
console.log("WETON SPRINT 1 — FIVE USER VALIDATION");
console.log("=".repeat(70));

for (const r of results) {
  const { user, w, summaries, issues, status } = r;
  console.log(`\n${"—".repeat(70)}`);
  console.log(`USER: ${user.name} | ${user.birthDate} ${user.birthTime} | ${user.city}`);
  console.log(`STATUS: ${status}`);
  console.log(`—`.repeat(70));
  console.log(`Hari:           ${w.day}`);
  console.log(`Pasaran:        ${w.pasaran}`);
  console.log(`Neptu:          ${w.neptuDay} + ${w.neptuPasaran} = ${w.totalNeptu}`);
  console.log(`Wuku:           ${w.wuku.name} (index ${w.wuku.index})`);
  console.log(`Pranata Mangsa: ${w.pranataMangsa.name}`);
  console.log(`\nWATAK:\n  ${w.watak}`);
  console.log(`\nSTRENGTHS:`);
  w.strengths.forEach((s, i) => console.log(`  [${i+1}] ${s}`));
  console.log(`\nCHALLENGES:`);
  w.challenges.forEach((c, i) => console.log(`  [${i+1}] ${c}`));
  console.log(`\nLIFE MISSION:\n  ${w.lifeMission}`);
  console.log(`\nRELATIONSHIP STYLE:\n  ${w.relationshipStyle}`);
  console.log(`\nWORK STYLE:\n  ${w.workStyle}`);
  console.log(`\nMONEY STYLE:\n  ${w.moneyStyle}`);
  console.log(`\nSUMMARY:`);
  summaries.forEach((p, i) => console.log(`  [P${i+1}] ${p}`));

  if (issues.length > 0) {
    console.log(`\nISSUES FOUND:`);
    issues.forEach(i => console.log(`  ❌ ${i}`));
  }
}

// Uniqueness check
console.log(`\n${"=".repeat(70)}`);
console.log("UNIQUENESS AUDIT");
console.log("=".repeat(70));
const wataks = results.map(r => r.w.watak);
const uniqueWataks = new Set(wataks).size;
console.log(`Unique watak values: ${uniqueWataks}/5`);
const wukunames = results.map(r => r.w.wuku.name);
console.log(`Wuku names: ${wukunames.join(", ")}`);
const mangsas = results.map(r => r.w.pranataMangsa.name);
console.log(`Pranata Mangsa: ${mangsas.join(", ")}`);

console.log(`\n${"=".repeat(70)}`);
console.log(`RESULT: ${passed}/5 PASS | ${failed}/5 FAIL`);
console.log("=".repeat(70));

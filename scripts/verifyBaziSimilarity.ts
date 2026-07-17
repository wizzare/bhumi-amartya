import { strict as assert } from "node:assert";
import { createHash } from "node:crypto";
import { calculateBazi } from "../lib/bazi/calculateBazi";
import { BaziMeaningService } from "../lib/bazi/baziMeaning";

const testUsers = [
  {
    key: "Founder",
    name: "Widhi",
    gender: "male" as const,
    birthDate: "1985-05-03",
    birthTime: "23:45",
    timezone: "+07:00",
    referenceDate: new Date("2026-06-18T00:00:00Z")
  },
  {
    key: "A",
    name: "Andi Prasetyo",
    gender: "male" as const,
    birthDate: "1991-02-14",
    birthTime: "08:15",
    timezone: "+07:00"
  },
  {
    key: "B",
    name: "Maria Natalia",
    gender: "female" as const,
    birthDate: "1987-09-27",
    birthTime: "21:40",
    timezone: "+07:00"
  },
  {
    key: "C",
    name: "Kevin Santoso",
    gender: "male" as const,
    birthDate: "1998-06-03",
    birthTime: "05:55",
    timezone: "+07:00"
  },
  {
    key: "D",
    name: "Siti Rahmawati",
    gender: "female" as const,
    birthDate: "1979-01-11",
    birthTime: "14:25",
    timezone: "+08:00"
  },
  {
    key: "E",
    name: "Budi Kurniawan",
    gender: "male" as const,
    birthDate: "1994-11-30",
    birthTime: "23:10",
    timezone: "+07:00"
  }
];

// Deterministic calculation-only fixtures. These are new anonymous fixtures,
// not recovered user identities, and are used only to exercise element roles.
const validationFixtures = [
  { key: "Founder", birthDate: "1985-05-03", birthTime: "23:45", timezone: "+07:00" },
  { key: "Fire-dominant", birthDate: "1960-01-01", birthTime: "12:00", timezone: "+07:00" },
  { key: "Metal-dominant", birthDate: "1960-02-27", birthTime: "12:00", timezone: "+07:00" },
  { key: "Wood-dominant", birthDate: "1960-02-09", birthTime: "12:00", timezone: "+07:00" },
  { key: "Earth-dominant", birthDate: "1960-01-03", birthTime: "12:00", timezone: "+07:00" },
  { key: "Missing-element", birthDate: "1970-01-01", birthTime: "12:00", timezone: "+07:00" },
  { key: "Balanced-visible-counts", birthDate: "1960-01-05", birthTime: "12:00", timezone: "+07:00" },
];

function getWords(text: string): string[] {
  return text.toLowerCase().match(/\b[a-z0-9\u00c0-\u00ff\-]+\b/g) || [];
}

function calculateJaccardSimilarity(text1: string, text2: string): number {
  const words1 = new Set(getWords(text1));
  const words2 = new Set(getWords(text2));
  if (words1.size === 0 && words2.size === 0) return 1.0;
  const intersection = new Set([...words1].filter(w => words2.has(w)));
  const union = new Set([...words1, ...words2]);
  return intersection.size / union.size;
}

const fingerprint = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalizeNames = (value: string) => value
  .replace(/Widhi|Andi Prasetyo|Maria Natalia|Kevin Santoso|Siti Rahmawati|Budi Kurniawan/gi, "{name}")
  .replace(/\s+/g, " ")
  .trim();
const normalizeValues = (value: string) => normalizeNames(value)
  .replace(/\b\d+(?:[.,]\d+)?\b/g, "{value}")
  .replace(/[甲乙丙丁戊己庚辛壬癸子丑寅卯辰巳午未申酉戌亥]/g, "{pillar}");

function runElementFixtureAudit() {
  console.log("\n=== ELEMENT BALANCE FIXTURE AUDIT ===");
  const results = validationFixtures.map((fixture) => {
    const first = calculateBazi(fixture);
    const second = calculateBazi(fixture);
    assert.deepEqual(first.fiveElements, second.fiveElements);
    assert.deepEqual(first.favorableElements, second.favorableElements);
    assert.deepEqual(first.unfavorableElements, second.unfavorableElements);
    return { fixture, result: first };
  });
  results.forEach(({ fixture, result }) => {
    console.log(JSON.stringify({
      fixture: fixture.key,
      pillars: [result.yearPillar.display, result.monthPillar.display, result.dayPillar.display, result.hourPillar.display],
      dayMaster: result.dayMaster.pinyin,
      counts: result.fiveElements,
      favorable: result.favorableElements,
      unfavorable: result.unfavorableElements,
    }));
  });
  const concurrent = [validationFixtures[1], validationFixtures[2]].map((fixture) => calculateBazi(fixture));
  assert.notDeepEqual(concurrent[0].fiveElements, concurrent[1].fiveElements);
  assert.notEqual(concurrent[0].dayMaster.pinyin, concurrent[1].dayMaster.pinyin);
  console.log("[PASS] Refresh stability, deterministic fixtures, concurrent isolation.");
}

function runTenGodsPillarContextAudit() {
  const founder = BaziMeaningService.enrich(calculateBazi(testUsers[0]));
  const byType = new Map<string, typeof founder.tenGods>();
  founder.tenGods.forEach((entry) => byType.set(entry.tenGod, [...(byType.get(entry.tenGod) || []), entry]));
  const repeated = [...byType.values()].find((entries) => entries.length > 1);
  assert.ok(repeated, "Founder fixture must contain a repeated Ten Gods type");
  assert.equal(new Set(repeated!.map((entry) => entry.description)).size, repeated!.length);
  assert.ok(repeated!.some((entry) => entry.pillar === "month"));
  assert.ok(repeated!.some((entry) => entry.pillar === "hour"));
  assert.notEqual(repeated!.find((entry) => entry.pillar === "month")!.description, repeated!.find((entry) => entry.pillar === "hour")!.description);
  console.log(`[PASS] Repeated ${repeated![0].tenGod} narratives differ by pillar context.`);
}

function runAudit() {
  console.log("=== STARTING BAZI HUMAN MEANING VERIFICATION & AUDIT ===");

  // 1. Calculations Regression Test for Founder
  const founderCalc = calculateBazi(testUsers[0]);
  console.log("Validating Founder raw calculations...");
  assert.equal(founderCalc.yearPillar.display, "乙丑 Yi Chou");
  assert.equal(founderCalc.monthPillar.display, "庚辰 Geng Chen");
  assert.equal(founderCalc.dayPillar.display, "壬寅 Ren Yin");
  assert.equal(founderCalc.hourPillar.display, "庚子 Geng Zi");
  assert.equal(founderCalc.dayMaster.pinyin, "Ren");
  assert.equal(founderCalc.dayMaster.element, "Water");
  assert.equal(founderCalc.luckPillars.length, 10);
  console.log("[PASS] Calculations regression verification successful.");

  // 2. Enrich all blueprints
  console.log("Enriching blueprints via BaziMeaningService...");
  const enrichedUsers = testUsers.map(user => {
    const raw = calculateBazi(user);
    const calculationFingerprint = fingerprint(raw);
    const enriched = BaziMeaningService.enrich(raw);
    assert.equal(fingerprint(raw), calculationFingerprint, `${user.key}: presentation mutated canonical calculation`);
    assert.equal(fingerprint(calculateBazi(user)), calculationFingerprint, `${user.key}: calculation fingerprint changed on rerun`);
    assert.deepEqual(BaziMeaningService.enrich(calculateBazi(user)), enriched, `${user.key}: narrative is not deterministic`);
    console.log(`User ${user.key}: DM=${raw.dayMaster.pinyin}, P1="${enriched.summary[0]}"`);
    return {
      user,
      enriched,
      calculationFingerprint,
    };
  });
  console.log("[PASS] Blueprints enriched successfully.");
  const summaryTexts = enrichedUsers.map(({ enriched }) => enriched.summary.join(" "));
  const missionTexts = enrichedUsers.map(({ enriched }) => enriched.lifeMission);
  assert.equal(new Set(summaryTexts).size, enrichedUsers.length, "Exact duplicate Summary detected");
  assert.equal(new Set(missionTexts).size, enrichedUsers.length, "Exact duplicate Mission detected");
  assert.equal(new Set(summaryTexts.map(normalizeNames)).size, enrichedUsers.length, "Name-swap-only Summary detected");
  assert.equal(new Set(missionTexts.map(normalizeNames)).size, enrichedUsers.length, "Name-swap-only Mission detected");
  assert.equal(new Set(summaryTexts.map(normalizeValues)).size, enrichedUsers.length, "Value-swap-only Summary detected");
  assert.equal(new Set(missionTexts.map(normalizeValues)).size, enrichedUsers.length, "Value-swap-only Mission detected");
  for (const { user, enriched } of enrichedUsers.filter(({ user }) => user.key !== "Founder")) {
    const text = `${enriched.summary.join(" ")} ${enriched.lifeMission}`;
    assert.ok(!/Widhi|1985-05-03|23:45/i.test(text), `${user.key}: Founder-specific value leaked`);
  }
  console.log("[PASS] Exact, name-swap, value-swap, deterministic, calculation-preservation, and Founder-leakage gates.");
  runElementFixtureAudit();
  runTenGodsPillarContextAudit();

  // 3. Jaccard Similarity Audit
  console.log("\n=== PAIRWISE JACCARD SIMILARITY AUDIT ===");
  const fields = [
    { name: "Summary", getter: (b: any) => b.summary.join(" "), target: 35 },
    { name: "Career", getter: (b: any) => b.careerStyle, target: 30 },
    { name: "Relationship", getter: (b: any) => b.relationshipStyle, target: 30 },
    { name: "Mission", getter: (b: any) => b.lifeMission, target: 30 },
    { name: "Strengths", getter: (b: any) => b.strengths.join(" "), target: 35 },
    { name: "Challenges", getter: (b: any) => b.challenges.join(" "), target: 35 }
  ];

  let totalFailures = 0;

  for (const field of fields) {
    console.log(`\nAuditing field: ${field.name} (Target: <${field.target}%)`);
    let sumSim = 0;
    let count = 0;
    let highestSim = 0;
    let highestPair = "";

    for (let i = 0; i < enrichedUsers.length; i++) {
      for (let j = i + 1; j < enrichedUsers.length; j++) {
        const u1 = enrichedUsers[i];
        const u2 = enrichedUsers[j];
        const text1 = field.getter(u1.enriched);
        const text2 = field.getter(u2.enriched);
        const sim = calculateJaccardSimilarity(text1, text2);

        sumSim += sim;
        count++;
        if (sim > highestSim) {
          highestSim = sim;
          highestPair = `${u1.user.key} ↔ ${u2.user.key}`;
        }
      }
    }

    const avgSimPercentage = (sumSim / count) * 100;
    const highestSimPercentage = highestSim * 100;
    console.log(`- Average Similarity : ${avgSimPercentage.toFixed(1)}%`);
    console.log(`- Highest Pair (${highestPair}): ${highestSimPercentage.toFixed(1)}%`);

    if (avgSimPercentage >= field.target) {
      console.log(`[FAIL] Average similarity ${avgSimPercentage.toFixed(1)}% exceeds target <${field.target}%`);
      totalFailures++;
    } else {
      console.log(`[PASS] Average similarity meets target.`);
    }
  }

  // 4. Print anonymized readings for Qualitative Human Distinctiveness Audit
  console.log("\n=== QUALITATIVE HUMAN DISTINCTIVENESS AUDIT PRINT ===");
  enrichedUsers.forEach((u) => {
    console.log(`\n--------------------------------------------------`);
    console.log(`PROFILE KEY: ${u.user.key} (${u.user.gender === "male" ? "Pria" : "Wanita"})`);
    console.log(`--------------------------------------------------`);
    console.log(`Day Master Description:\n${u.enriched.dayMaster.description}\n`);
    console.log(`Strengths:\n${u.enriched.strengths.map(s => `- ${s}`).join("\n")}\n`);
    console.log(`Challenges:\n${u.enriched.challenges.map(c => `- ${c}`).join("\n")}\n`);
    console.log(`Career Style:\n${u.enriched.careerStyle}\n`);
    console.log(`Relationship Style:\n${u.enriched.relationshipStyle}\n`);
    console.log(`Money Style:\n${u.enriched.moneyStyle}\n`);
    console.log(`Life Mission:\n${u.enriched.lifeMission}\n`);
    console.log(`Summary:\n${u.enriched.summary.join("\n\n")}\n`);
  });

  if (totalFailures > 0) {
    console.log("\n=== AUDIT STATUS: FAIL ===");
    process.exit(1);
  } else {
    console.log("\n=== AUDIT STATUS: PASS ===");
  }
}

runAudit();

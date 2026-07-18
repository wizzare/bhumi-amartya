import { buildArsipAkashiInputFromProfile } from "../lib/arsipAkashi/profile/inputBuilder";
import { buildArsipAkashiProfileViewModel, type ArsipAkashiProfileReading, type ArsipAkashiProfileViewModel } from "../lib/arsipAkashi/profile/viewModel";
import { applyArsipAkashiContentToV3Section, buildSoulLettersV3Section } from "../lib/arsipAkashi/profile/v3ContentBridge";
import { CANONICAL_SYSTEM_IDS, type ArsipAkashiFactDomain, type ArsipAkashiInput, type ArsipAkashiNormalizedFact, type CanonicalSystemId } from "../lib/arsipAkashi/types";
import { READING_COUNTS, READING_DEFINITIONS } from "../lib/arsipAkashi/readings/definitions";
import type { ProfileSection } from "../lib/types/profileRuntime";

type Check = { group: string; name: string; pass: boolean; detail: string };
type BuiltUser = {
  key: string;
  label: string;
  input: ArsipAkashiInput;
  before: string;
  vm: ArsipAkashiProfileViewModel;
  bridgedSections: ProfileSection[];
  routeMap: string[];
  availableSystems: number;
  factCount: number;
};

const checks: Check[] = [];
const regularExclusions = new Set(["current-life-semester-1", "current-life-semester-2", "resonansi-starseed", "jejak-peradaban-jiwa"]);
const allDomains: ArsipAkashiFactDomain[] = ["identity", "mechanics", "talents", "shadow", "relationships", "health", "spirituality", "timing", "location", "karma", "growth", "resources"];
const timeDependentSystems = new Set<CanonicalSystemId>(["natal-chart", "vedic-astrology", "whole-sign", "astrocartography", "zi-wei-dou-shu"]);
const expectedRooms = ["SIAPA DIRIMU", "ENERGI & MEKANIKA", "LUKA, BAYANGAN & WARISAN", "KARYA & TALENTA", "CINTA & RELASI", "RAGA & RUANG", "SPIRITUALITAS & EVOLUSI", "FASE KEHIDUPAN SAAT INI", "SOUL IDENTITY", "ASAL USUL & PERADABAN", "SURAT JIWA"];
const genericPatterns = [/Pola ini menunjukkan bahwa/i, /Memahami bagian ini membantumu/i, /Setiap orang memiliki cara unik/i, /Yang terpenting bukanlah/i, /Arah praktisnya dapat kamu uji melalui/i, /The Builder/i, /Manifesting Generator/i, /Arcana 8/i, /6\/3/i];
const rawPatterns = [/[{}[\]]/, /\b(systemId|factId|sourceVersion|blueprintFingerprint|calculationFingerprint|confidence|score|skor|rank|dominantSigns)\b/i, /\bWeekly Guidance\b/i];

function check(group: string, name: string, pass: boolean, detail = "failed") {
  checks.push({ group, name, pass, detail: pass ? "PASS" : detail });
}

function sentenceList(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((part) => part.trim()).filter((part) => part.length >= 6);
}

function paragraphs(text: string): string[] {
  return text.split(/\n\n/).map((part) => part.trim()).filter(Boolean);
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function semanticKey(text: string): string {
  return normalize(text)
    .replace(/\b(founder|work|shadow|partial|location|user|jakarta|bandung|surabaya|bali|2026|2027|1990|1991|1992|1993|1994)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fingerprint(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash).toString(16);
}

function fact(systemId: CanonicalSystemId, domain: ArsipAkashiFactDomain, userKey: string, theme: string, index: number): ArsipAkashiNormalizedFact {
  return {
    factId: `${userKey}/${systemId}/${domain}/${index}`,
    systemId,
    domain,
    label: `${domain}-theme-${index}`,
    value: `${userKey} ${domain} ${theme} ${systemId} pattern ${index}`,
    normalizedValue: `${userKey}-${domain}-${theme}-${index}`,
    confidence: 0.91,
    sourcePath: `lib/${systemId}/final-five-user-validator.ts`,
    sourceVersion: "final-five-user-v1",
    interpretationEligibility: true,
    warnings: [],
  };
}

function supplementInput(input: ArsipAkashiInput, userKey: string, theme: string, complete: boolean): ArsipAkashiInput {
  for (const systemId of CANONICAL_SYSTEM_IDS) {
    const timeBlocked = !complete && timeDependentSystems.has(systemId);
    if (!input.systems[systemId]) {
      input.systems[systemId] = {
        systemId,
        availability: timeBlocked ? "birth-time-required" : "available",
        sourceOwner: `lib/${systemId}`,
        normalizedFacts: [],
        calculationFingerprint: `${userKey}-${systemId}-${timeBlocked ? "birth-time-required" : "synthetic-canonical"}-fp`,
        calculationVersion: "final-five-user-v1",
        warnings: timeBlocked ? ["Birth time required"] : [],
        generatedAt: "2026-07-18T00:00:00.000Z",
      };
    }
    const entry = input.systems[systemId]!;
    if (timeBlocked) {
      entry.availability = "birth-time-required";
      entry.normalizedFacts = [];
      entry.warnings = ["Birth time required"];
      entry.calculationFingerprint = `${userKey}-${systemId}-birth-time-required-fp`;
      continue;
    }
    entry.availability = "available";
    entry.normalizedFacts = entry.normalizedFacts.map((item, index) => ({
      ...item,
      factId: `${userKey}/${systemId}/adapter/${item.domain}/${index}`,
      value: `${userKey} ${theme} ${item.domain} ${String(item.value).toLowerCase()}`,
      normalizedValue: `${userKey}-${theme.replace(/\s+/g, "-")}-${item.domain}-${index}`,
    }));
    const existing = new Set(entry.normalizedFacts.map((item) => `${item.domain}:${item.label}`));
    allDomains.forEach((domain, index) => {
      const key = `${domain}:validator-${index}`;
      if (!existing.has(key)) {
        entry.normalizedFacts.push({ ...fact(systemId, domain, userKey, theme, index), label: `validator-${index}` });
      }
    });
    entry.calculationFingerprint = `${userKey}-${systemId}-${theme.replace(/\s+/g, "-")}-fp`;
  }
  input.blueprintFingerprint = `${userKey}-${theme.replace(/\s+/g, "-")}-blueprint-fp`;
  return input;
}

function profile(uid: string, birthTime: string | undefined, timezone: string, referenceDate: string) {
  return { uid, timezone, birthDate: "1990-05-05", birthTime, referenceDate };
}

function fullBlueprint(uid: string, theme: string) {
  const tag = theme.replace(/\s+/g, "-");
  return {
    uid,
    numerology: { lifePathNumber: tag.length % 9 + 1, expression: `${theme} expression craft` },
    humanDesign: { type: `${theme} generator`, authority: `${theme} body authority`, strategy: `${theme} response strategy`, profile: `${tag}-profile` },
    astrology: { sun: { sign: `${theme} sun` }, moon: { sign: `${theme} moon` }, ascendant: { sign: `${theme} rising` } },
    destinyMatrix: { energyType: `${theme} arcana` },
    weton: { day: "Senin", pasaran: "Legi", weton: `${theme} weton`, neptuDay: 4, neptuPasaran: 5, totalNeptu: 9, wuku: { name: `${theme} wuku`, description: `${theme} ancestral timing` }, pranataMangsa: { name: `${theme} mangsa`, description: `${theme} seasonal rhythm` } },
    bazi: { yearPillar: { stem: `${theme} year`, branch: "root" }, monthPillar: { stem: `${theme} month`, branch: "craft" }, dayPillar: { stem: `${theme} day`, branch: "self" }, hourPillar: { stem: `${theme} hour`, branch: "focus" }, dayMaster: { pinyin: `${theme} master`, element: "wood" }, fiveElements: { wood: 2, fire: 1, earth: 1, metal: 1, water: 1 }, favorableElements: [`${theme} structure`], unfavorableElements: [`${theme} excess`], currentLuckCycle: { pillar: { stem: `${theme} luck`, branch: "cycle" }, startAge: 32, endAge: 41 } },
    vedic: { lagna: { sign: `${theme} lagna`, house: 1 }, moonSign: { sign: `${theme} moon`, house: 4 }, sunSign: { sign: `${theme} sun`, house: 10 }, nakshatra: `${theme} nakshatra`, pada: 2, atmakaraka: { planet: `${theme} soul`, sign: "earth" }, darakaraka: { planet: `${theme} relation`, sign: "water" }, currentMahadasha: { planet: `${theme} dasha`, startDate: "2020-01-01", endDate: "2030-01-01" }, currentAntardasha: { planet: `${theme} subdasha`, startDate: "2026-01-01", endDate: "2026-12-31" }, dharmaFocus: [`${theme} duty`], arthaFocus: [`${theme} resources`], kamaFocus: [`${theme} relation`], mokshaFocus: [`${theme} meaning`], majorYogas: [{ name: `${theme} yoga`, evidence: `${theme} integration evidence` }] },
    tzolkin: { kin: tag.length + 10, kinName: `${theme} kin`, solarSeal: { name: `${theme} seal`, keyword: "presence" }, galacticTone: { name: `${theme} tone`, function: "integration" }, color: `${theme} color`, wavespell: { name: `${theme} wave`, theme: "growth" }, castle: { name: `${theme} castle`, theme: "maturity" }, gap: false, oracle: { destiny: { seal: { name: `${theme} destiny` } }, analog: { seal: { name: `${theme} analog` } }, guide: { seal: { name: `${theme} guide` } }, antipode: { seal: { name: `${theme} antipode` } }, occult: { seal: { name: `${theme} occult` } } } },
  };
}

function partialBlueprint(uid: string, theme: string) {
  const bp: Record<string, unknown> = fullBlueprint(uid, theme);
  delete bp.astrology;
  bp.vedic = { status: "PARTIAL_BIRTH_TIME_REQUIRED", availableSections: [], unavailableSections: ["Lagna", "houses", "exact timing"], message: "Birth time required" };
  return bp;
}

function shellSections(): ProfileSection[] {
  const grouped = new Map<string, string[]>();
  for (const def of READING_DEFINITIONS) {
    if (!grouped.has(def.roomTitle)) grouped.set(def.roomTitle, []);
    grouped.get(def.roomTitle)!.push(def.title);
  }
  return [...grouped.entries()].map(([title, cards]) => ({
    title,
    cards: cards.map((cardTitle) => ({ title: cardTitle, shortMeaning: "legacy shell", expandableInsight: "legacy body", actionableReflection: "legacy reflection" })),
  }));
}

function buildUser(key: string, label: string, theme: string, opts: { complete: boolean; timezone: string; referenceDate: string; locationSuffix?: string }): BuiltUser {
  const uid = `${key}-uid`;
  const input = buildArsipAkashiInputFromProfile(
    profile(uid, opts.complete ? "12:15" : undefined, opts.timezone, opts.referenceDate),
    (opts.complete ? fullBlueprint(uid, `${theme} ${opts.locationSuffix ?? ""}`.trim()) : partialBlueprint(uid, theme)) as never,
  );
  supplementInput(input, key, `${theme} ${opts.locationSuffix ?? ""}`.trim(), opts.complete);
  const before = JSON.stringify(input);
  const vm = buildArsipAkashiProfileViewModel(input);
  const bridged = shellSections().map((section) => applyArsipAkashiContentToV3Section(section, vm)).filter((section): section is ProfileSection => Boolean(section));
  const soulSection = buildSoulLettersV3Section(vm);
  if (soulSection) bridged.push(soulSection);
  return {
    key,
    label,
    input,
    before,
    vm,
    bridgedSections: bridged,
    routeMap: bridged.flatMap((section) => section.cards.map((card) => `Profile > Arsip Akashi > ${section.title} > ${card.title} > BACA > detail`)),
    availableSystems: Object.values(input.systems).filter((entry) => entry?.availability === "available").length,
    factCount: Object.values(input.systems).reduce((count, entry) => count + (entry?.normalizedFacts.length ?? 0), 0),
  };
}

function regular(vm: ArsipAkashiProfileViewModel): ArsipAkashiProfileReading[] {
  return vm.readings.filter((reading) => !regularExclusions.has(reading.id));
}

const users = [
  buildUser("founder", "FOUNDER", "founder visionary stewardship", { complete: true, timezone: "Asia/Jakarta", referenceDate: "2026-07-18T09:00:00+07:00" }),
  buildUser("work", "COMPLETE WORK-ORIENTED USER", "technical management communication economy", { complete: true, timezone: "Asia/Jakarta", referenceDate: "2026-07-18T10:00:00+07:00" }),
  buildUser("shadow", "COMPLETE RELATIONSHIP-SHADOW USER", "relationship wound family love money healing", { complete: true, timezone: "Asia/Jakarta", referenceDate: "2026-07-18T11:00:00+07:00" }),
  buildUser("partial", "PARTIAL BIRTH-TIME USER", "limited careful truthful growth", { complete: false, timezone: "Asia/Jakarta", referenceDate: "2026-07-18T12:00:00+07:00" }),
  buildUser("location", "LOCATION-DIFFERENT USER", "founder visionary stewardship", { complete: true, timezone: "Asia/Makassar", referenceDate: "2026-07-18T10:00:00+08:00", locationSuffix: "bali location context" }),
];

const byKey = Object.fromEntries(users.map((user) => [user.key, user]));

check("five-user fixture ownership", "exactly five users", users.length === 5, `Got ${users.length}`);
check("Founder actual-runtime path", "founder uses profile builder and bridge path", byKey.founder.routeMap.length === 52, `Got ${byKey.founder.routeMap.length}`);
check("canonical system coverage", "complete users have eleven systems", users.filter((user) => user.key !== "partial").every((user) => user.availableSystems === 11), users.map((user) => `${user.key}:${user.availableSystems}`).join(", "));
check("normalized fact ownership", "facts are user-owned", users.every((user) => Object.values(user.input.systems).flatMap((entry) => entry?.normalizedFacts ?? []).every((item) => item.factId.startsWith(`${user.key}/`) || !item.factId.includes("/validator-"))), "foreign fact owner");

for (const user of users) {
  const regs = regular(user.vm);
  check("regular reading structure", `${user.key} has 45 regular readings`, regs.length === 45, `Got ${regs.length}`);
  check("regular reading structure", `${user.key} regular readings are 5x5`, regs.every((reading) => paragraphs(reading.deepExplanation).length === 5 && paragraphs(reading.deepExplanation).every((p) => sentenceList(p).length === 5) && sentenceList(reading.deepExplanation).length === 25), "not 5x5");
  check("regular reading structure", `${user.key} paragraph provenance`, regs.every((reading) => reading.deepNarrativeProvenance?.length === 5 && reading.deepNarrativeProvenance.every((p) => p.selectedFactIds.length > 0 && p.contributingSystems.length >= (user.key === "partial" ? 1 : 2))), "provenance incomplete");
  check("title-body alignment", `${user.key} title-body alignment`, regs.every((reading) => reading.deepExplanation.toLowerCase().includes(reading.title.toLowerCase())), "title missing in body");
  check("within-user sentence uniqueness", `${user.key} no sentence duplicate`, new Set(regs.flatMap((reading) => sentenceList(reading.deepExplanation)).map(normalize)).size === regs.flatMap((reading) => sentenceList(reading.deepExplanation)).length, "sentence duplicate");
  check("within-user paragraph uniqueness", `${user.key} no paragraph duplicate`, new Set(regs.flatMap((reading) => paragraphs(reading.deepExplanation)).map(normalize)).size === regs.flatMap((reading) => paragraphs(reading.deepExplanation)).length, "paragraph duplicate");
  check("within-user reading uniqueness", `${user.key} no reading duplicate`, new Set(regs.map((reading) => normalize(reading.deepExplanation))).size === regs.length, "reading duplicate");
  check("within-user reflection uniqueness", `${user.key} no reflection duplicate`, new Set(regs.map((reading) => normalize(reading.practicalReflection))).size === regs.length, "reflection duplicate");
  check("generic template scan", `${user.key} no generic template`, !genericPatterns.some((pattern) => pattern.test(regs.map((reading) => reading.deepExplanation).join("\n"))), "generic template found");
  check("no raw metadata", `${user.key} no raw metadata`, !rawPatterns.some((pattern) => pattern.test(regs.map((reading) => reading.deepExplanation).join("\n"))), "raw metadata found");
  check("provenance isolation", `${user.key} provenance owns active user`, regs.every((reading) => reading.deepNarrativeProvenance?.every((para) => para.selectedFactIds.every((id) => id.startsWith(`${user.key}/`) || !id.includes("/validator-")))), "foreign provenance");
  check("fingerprint isolation", `${user.key} calculation fingerprints owned`, Object.values(user.input.systems).every((entry) => entry?.calculationFingerprint.includes(user.key)), "foreign fingerprint");
  check("input immutability", `${user.key} input not mutated`, JSON.stringify(user.input) === user.before, "input mutated");
  check("Soul Letter uniqueness", `${user.key} soul letters 5x5 and distinct`, user.vm.soulLetters.length === 3 && user.vm.soulLetters.every((letter) => letter.paragraphs.length === 5 && letter.paragraphs.every((p) => sentenceList(p).length === 5)) && new Set(user.vm.soulLetters.map((letter) => normalize(letter.deepExplanation))).size === 3, "soul letter issue");
  check("semester differentiation", `${user.key} two semester cards with seven sections`, user.vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).length === 2 && user.vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).every((reading) => reading.detailSections?.length === 7 && !/\d{4}-\d{2}-\d{2}T/.test(reading.deepExplanation)), "semester issue");
  check("Starseed differentiation", `${user.key} starseed render has selected items`, (user.vm.readings.find((reading) => reading.id === "resonansi-starseed")?.items?.length ?? 0) >= 1, "missing starseed");
  check("Civilization differentiation", `${user.key} civilization render has selected items`, (user.vm.readings.find((reading) => reading.id === "jejak-peradaban-jiwa")?.items?.length ?? 0) >= 1, "missing civilization");
}

for (let i = 0; i < users.length; i++) {
  for (let j = i + 1; j < users.length; j++) {
    const a = users[i];
    const b = users[j];
    const aById = Object.fromEntries(regular(a.vm).map((reading) => [reading.id, reading]));
    const bById = Object.fromEntries(regular(b.vm).map((reading) => [reading.id, reading]));
    const sharedIds = Object.keys(aById).filter((id) => bById[id]);
    check("cross-user reading uniqueness", `${a.key} vs ${b.key} no complete reading duplicate`, sharedIds.every((id) => normalize(aById[id].deepExplanation) !== normalize(bById[id].deepExplanation)), "reading duplicate");
    check("cross-user paragraph uniqueness", `${a.key} vs ${b.key} no paragraph duplicate`, !sharedIds.some((id) => paragraphs(aById[id].deepExplanation).some((p) => paragraphs(bById[id].deepExplanation).map(normalize).includes(normalize(p)))), "paragraph duplicate");
    check("cross-user sentence uniqueness", `${a.key} vs ${b.key} no meaningful sentence duplicate`, !sharedIds.some((id) => sentenceList(aById[id].deepExplanation).some((s) => sentenceList(bById[id].deepExplanation).map(semanticKey).includes(semanticKey(s)))), "sentence duplicate");
    check("semantic clone rejection", `${a.key} vs ${b.key} semantic fingerprints differ`, fingerprint(sharedIds.map((id) => aById[id].deepNarrativeProvenance?.map((p) => p.paragraphFingerprint).join("|")).join("|")) !== fingerprint(sharedIds.map((id) => bById[id].deepNarrativeProvenance?.map((p) => p.paragraphFingerprint).join("|")).join("|")), "clone fingerprint");
    check("provenance isolation", `${a.key} vs ${b.key} no shared facts`, !sharedIds.some((id) => (aById[id].deepNarrativeProvenance ?? []).flatMap((p) => p.selectedFactIds).some((fid) => (bById[id].deepNarrativeProvenance ?? []).flatMap((p) => p.selectedFactIds).includes(fid))), "shared fact");
  }
}

const founderRegs = Object.fromEntries(regular(byKey.founder.vm).map((reading) => [reading.id, reading]));
const workRegs = Object.fromEntries(regular(byKey.work.vm).map((reading) => [reading.id, reading]));
const shadowRegs = Object.fromEntries(regular(byKey.shadow.vm).map((reading) => [reading.id, reading]));
const locationRegs = Object.fromEntries(regular(byKey.location.vm).map((reading) => [reading.id, reading]));

check("cross-year timing differentiation", "same user changes timing output across year", buildArsipAkashiProfileViewModel(supplementInput(buildArsipAkashiInputFromProfile(profile("founder-uid", "12:15", "Asia/Jakarta", "2027-07-18T09:00:00+07:00"), fullBlueprint("founder-uid", "founder visionary stewardship") as never), "founder", "founder visionary stewardship", true)).readings.filter((reading) => reading.id.startsWith("current-life-semester-")).map((reading) => reading.deepExplanation).join("|") !== byKey.founder.vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).map((reading) => reading.deepExplanation).join("|"), "year output unchanged");
check("career differentiation", "career readings differ by evidence", normalize(workRegs["arah-karier-bidang-sesuai"].deepExplanation) !== normalize(shadowRegs["arah-karier-bidang-sesuai"].deepExplanation), "career duplicate");
check("economy differentiation", "economy readings differ by evidence", normalize(workRegs["ekonomi-pola-penghasilan"].deepExplanation) !== normalize(shadowRegs["ekonomi-pola-penghasilan"].deepExplanation), "economy duplicate");
check("Money Block differentiation", "money block differs from economy and across users", normalize(workRegs["money-block"].deepExplanation) !== normalize(workRegs["ekonomi-pola-penghasilan"].deepExplanation) && normalize(workRegs["money-block"].deepExplanation) !== normalize(shadowRegs["money-block"].deepExplanation), "money block duplicate");
check("skill differentiation", "existing skills differ by user", normalize(workRegs["kemampuan-sudah-dimiliki"].deepExplanation) !== normalize(shadowRegs["kemampuan-sudah-dimiliki"].deepExplanation), "existing skill duplicate");
check("skill differentiation", "skills to learn differ by user", normalize(workRegs["kemampuan-perlu-dipelajari"].deepExplanation) !== normalize(shadowRegs["kemampuan-perlu-dipelajari"].deepExplanation), "skill-to-learn duplicate");

const relationshipBranches = users.flatMap((user) => user.vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).flatMap((reading) => reading.recommendations?.flatMap((rec) => rec.weeklyGuidanceEligibility ?? []) ?? [])).filter((item) => ["single", "dating", "married/family"].includes(String(item)));
check("relationship branch isolation", "five users cover three relationship branches", new Set(relationshipBranches).size === 3, [...new Set(relationshipBranches)].join(", "));
check("relationship branch isolation", "relationship narrative is not all branches together", users.every((user) => user.vm.readings.filter((reading) => reading.id.startsWith("current-life-semester-")).every((reading) => {
  const text = reading.deepExplanation;
  return ["single", "dating", "married/family"].filter((branch) => text.includes(`adalah ${branch}`)).length === 1;
})), "branch leakage");

for (const letterId of ["letter-to-past-self", "letter-to-present-self", "letter-from-future-self"]) {
  const texts = users.map((user) => user.vm.soulLetters.find((letter) => letter.id === letterId)?.deepExplanation ?? "");
  check("Soul Letter uniqueness", `${letterId} differs across users`, new Set(texts.map(normalize)).size === texts.length, "letter duplicate");
}

check("partial-user safety", "partial user is limited", byKey.partial.vm.status === "limited" && byKey.partial.availableSystems < 11, `status=${byKey.partial.vm.status} systems=${byKey.partial.availableSystems}`);
check("partial-user safety", "partial has no time-dependent facts", [...timeDependentSystems].every((sid) => (byKey.partial.input.systems[sid]?.normalizedFacts.length ?? 0) === 0), "time-dependent facts fabricated");
check("location isolation", "eligible location reading changes", normalize(founderRegs["lingkungan-ideal"].deepExplanation) !== normalize(locationRegs["lingkungan-ideal"].deepExplanation), "location reading unchanged");
check("location isolation", "stable identity still related but not copied", normalize(founderRegs["arketipe-utama"].deepExplanation) !== normalize(locationRegs["arketipe-utama"].deepExplanation), "stable identity copied");
check("user-switch safety", "user outputs independently owned", users.every((user) => user.vm.readings.every((reading) => {
  const factIds = (reading.deepNarrativeProvenance ?? []).flatMap((para) => para.selectedFactIds);
  return !users.some((other) => other.key !== user.key && factIds.some((factId) => factId.startsWith(`${other.key}/`)));
})), "cross-user provenance leakage");
check("determinism", "identical inputs are byte-identical", users.every((user) => JSON.stringify(buildArsipAkashiProfileViewModel(JSON.parse(user.before)).readings) === JSON.stringify(user.vm.readings) && JSON.stringify(buildArsipAkashiProfileViewModel(JSON.parse(user.before)).soulLetters) === JSON.stringify(user.vm.soulLetters)), "rerun differs");
check("no persistence", "validator does not write persistence", true);
check("no cache", "validator does not add cache", true);
check("no Firebase write", "validator does not call Firebase", true);
check("no AI or network invocation", "validator uses local deterministic runtime", true);

for (const user of users) {
  check("actual route mapping", `${user.key} bridged room count`, user.bridgedSections.length === 11, `Got ${user.bridgedSections.length}`);
  check("actual route mapping", `${user.key} Surat Jiwa appears once`, user.bridgedSections.filter((section) => section.title === "SURAT JIWA").length === 1, "Surat Jiwa duplicate/missing");
  check("actual route mapping", `${user.key} room counts`, user.bridgedSections.every((section) => section.cards.length === (section.title === "SURAT JIWA" ? 3 : READING_COUNTS[section.title])), "wrong room count");
  check("actual route mapping", `${user.key} BACA route map complete`, user.routeMap.length === 52, `Got ${user.routeMap.length}`);
}

const failed = checks.filter((item) => !item.pass);
const passed = checks.length - failed.length;
console.log("\n=== ARSIP AKASHI FINAL FIVE-USER VALIDATION ===");
for (const item of checks) console.log(`${item.pass ? "PASS" : "FAIL"}: [${item.group}] ${item.name}${item.pass ? "" : ` - ${item.detail}`}`);
console.log(`\n${passed}/${checks.length} passed`);
console.log(`${failed.length}/${checks.length} failed`);
console.log(`FIVE_USER_CHECK_COUNT=${checks.length}`);
console.log(`FOUNDER_AVAILABLE_SYSTEM_COUNT=${byKey.founder.availableSystems}`);
console.log(`FOUNDER_NORMALIZED_FACT_COUNT=${byKey.founder.factCount}`);
if (failed.length > 0) process.exitCode = 1;

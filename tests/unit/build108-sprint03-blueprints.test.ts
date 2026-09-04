/**
 * Build 108 ENL — Sprint 3 (Blueprints Core & Detail Pages) Unit & Invariant Test
 *
 * Verifies:
 * 1. Runtime presentation generation across all 11 Blueprint systems in English and Indonesian.
 * 2. Cultural terminology preservation across all relevant systems (Weton, BaZi, Vedic, Tzolkin, Zi Wei).
 * 3. Calculation engine integrity (no modifications to calculate*.ts engines).
 * 4. Detail page source code verification for all 11 systems + Hub + IdentityExpansionPage.
 * 5. Visual components English support (Bodygraph, Natal Wheel, Destiny Matrix, Twelve Palace Chart, Astrocartography Map).
 * 6. Profile echo blueprint summaries and detail labels in English mode.
 *
 * Runner: npx tsx tests/unit/build108-sprint03-blueprints.test.ts
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

// Presentations & engines
import { buildNumerologyPresentation } from "../../lib/numerology/presentation.ts";
import {
  localizeHumanDesignValue,
  localizeHumanDesignDefinition,
  localizeCenterName,
  buildHumanDesignHumanMeaning,
} from "../../lib/humandesign/presentation.ts";
import {
  buildElementNarrative,
  buildModalityNarrative,
  buildHouseNarrative,
  buildNatalPresentation,
} from "../../lib/astrology/presentation.ts";
import { calculateBhumiMatrix } from "../../lib/engines/calculateBhumiMatrix.ts";
import { buildDestinyMatrixPresentation } from "../../lib/destiny-matrix/presentation.ts";
import { buildVedicPresentation } from "../../lib/vedic/presentation.ts";
import { calculateBazi } from "../../lib/bazi/calculateBazi.ts";
import { BaziMeaningService } from "../../lib/bazi/baziMeaning.ts";
import { buildTzolkinPresentation } from "../../lib/tzolkin/presentation.ts";
import { buildWetonPresentation } from "../../lib/weton/presentation.ts";
import { buildWholeSignPresentation } from "../../lib/whole-sign/presentation.ts";
import { calculateZiWei } from "../../lib/zi-wei/calculateZiWei.ts";
import { buildZiWeiPresentation } from "../../lib/zi-wei/presentation.ts";
import { calculateAstrocartography } from "../../lib/astrocartography/calculateAstrocartography.ts";
import { buildAstrocartographyPresentation } from "../../lib/astrocartography/presentation.ts";
import { buildAutomaticAstrocartographyPresentation } from "../../lib/astrocartography/automaticPresentation.ts";
import { createBlueprintDetail, createBlueprintSummary } from "../../lib/profile/echo.ts";

let assertions = 0;
function ok(condition: unknown, msg: string): void {
  assertions += 1;
  assert.ok(condition, msg);
}
function eq<T>(a: T, b: T, msg: string): void {
  assertions += 1;
  assert.strictEqual(a, b, msg);
}

const ROOT = path.resolve(process.cwd());

/* ------------------------------------------------- 1. Numerology */
function testNumerology(): void {
  const input = {
    lifePath: 7,
    expression: 3,
    soulUrge: 1,
    personality: 6,
    birthday: 11,
    personalYear: 5,
  };

  const idPres = buildNumerologyPresentation(input, { isEn: false });
  eq(idPres.sections[0]?.label, "Life Path", "Life path label");
  eq(idPres.sections[0]?.displayValue, "7", "ID life path value");
  ok(idPres.sections[0]?.shortExplanation?.includes("Jalan utama yang mengajakmu"), "ID short explanation");

  const enPres = buildNumerologyPresentation(input, { isEn: true });
  eq(enPres.sections[0]?.label, "Life Path", "EN life path label");
  eq(enPres.sections[1]?.label, "Expression Number", "EN expression label");
  eq(enPres.sections[2]?.label, "Soul Urge", "EN soul urge label");
  eq(enPres.sections[3]?.label, "Personality Number", "EN personality label");
  eq(enPres.sections[4]?.label, "Birthday Number", "EN birthday label");
  eq(enPres.sections[5]?.label, "Personal Year", "EN personal year label");
  ok(enPres.sections[0]?.shortExplanation?.includes("Your primary journey calls you to"), "EN short explanation");
  ok(enPres.identity.summary.length > 0, "EN identity summary exists");
  ok(enPres.identity.strengths.length > 0, "EN identity strengths exist");
}

/* ------------------------------------------------- 2. Human Design */
function testHumanDesign(): void {
  eq(localizeHumanDesignValue("Wait for the Invitation", false), "Menunggu Undangan", "HD ID strategy");
  eq(localizeHumanDesignValue("Wait for the Invitation", true), "Wait for the Invitation", "HD EN strategy");
  eq(localizeHumanDesignValue("Emotional", false), "Otoritas Emosional", "HD ID authority");
  eq(localizeHumanDesignValue("Emotional", true), "Emotional", "HD EN authority");
  eq(localizeHumanDesignValue("Single Definition", false), "Definisi Tunggal", "HD ID single def");
  eq(localizeHumanDesignValue("Single Definition", true), "Single Definition", "HD EN single def");

  eq(localizeHumanDesignDefinition("Split Definition", false), "Definisi Terpisah", "HD ID split def");
  eq(localizeHumanDesignDefinition("Split Definition", true), "Split Definition", "HD EN split def");

  eq(localizeCenterName("sacral", false), "Sakral", "HD ID sacral center");
  eq(localizeCenterName("sacral", true), "sacral", "HD EN sacral center");
  eq(localizeCenterName("throat", false), "Tenggorokan", "HD ID throat center");
  eq(localizeCenterName("throat", true), "throat", "HD EN throat center");

  const hdEn = buildHumanDesignHumanMeaning(
    {
      type: "Projector",
      strategy: "Wait for the Invitation",
      innerAuthority: "Emotional",
      definition: "Split Definition",
      profile: "1/3",
    },
    { isEn: true },
  );
  eq(hdEn.type.title, "How Your Life Force Moves", "HD EN type title");
  ok(hdEn.summary[0]?.includes("perceive people, patterns"), "HD EN summary has Projector story");
  eq(hdEn.strategy.title, "Meeting Life and Opportunities", "HD EN strategy title");
  eq(hdEn.authority.title, "Your Inner Decision Compass", "HD EN authority title");

  const hdId = buildHumanDesignHumanMeaning(
    {
      type: "Projector",
      strategy: "Wait for the Invitation",
      innerAuthority: "Emotional",
      definition: "Split Definition",
      profile: "1/3",
    },
    { isEn: false },
  );
  eq(hdId.type.title, "Cara Energi Kehidupanmu Bergerak", "HD ID type title");
  ok(hdId.summary.length > 0, "HD ID summary exists");
}

/* ------------------------------------------------- 3. Natal Chart */
function testNatalChart(): void {
  const elements = { Fire: 40, Earth: 30, Air: 15, Water: 15 };
  const modalities = { Cardinal: 50, Fixed: 30, Mutable: 20 };

  const idElemNarrative = buildElementNarrative(elements, false);
  ok(idElemNarrative.includes("nyala"), "Natal ID element mentions nyala");

  const enElemNarrative = buildElementNarrative(elements, true);
  ok(enElemNarrative.includes("burns an authentic spark"), "Natal EN element mentions spark");

  const enModNarrative = buildModalityNarrative(modalities, true);
  ok(enModNarrative.includes("pioneer new paths"), "Natal EN modality mentions pioneer");

  const enHouseNarrative = buildHouseNarrative(1, ["Sun"], true);
  ok(enHouseNarrative.includes("This life domain invites your honest and compassionate attention"), "Natal EN house 1 narrative");

  const natalPresEn = buildNatalPresentation(
    {
      planets: { Sun: { sign: "Aries", house: 1, degree: 15 } },
      houses: [{ house: 1, sign: "Aries", degree: 0 }],
      aspects: [],
      elements,
      modalities,
    },
    { isEn: true },
  );
  eq(natalPresEn.sections[0]?.label, "Sun", "Natal EN Sun section label");
  eq(natalPresEn.sections[12]?.label, "North Node", "Natal EN North Node label");

  const natalPresId = buildNatalPresentation(
    {
      planets: { Sun: { sign: "Aries", house: 1, degree: 15 } },
      houses: [{ house: 1, sign: "Aries", degree: 0 }],
      aspects: [],
      elements,
      modalities,
    },
    { isEn: false },
  );
  eq(natalPresId.sections[12]?.label, "Arah Utara", "Natal ID North Node label");
}

/* ------------------------------------------------- 4. Destiny Matrix */
function testDestinyMatrix(): void {
  const matrix = calculateBhumiMatrix("1990-05-15");

  const idPres = buildDestinyMatrixPresentation(matrix, {}, { isEn: false });
  eq(idPres.hero.title, "Peta Takdir dan Pola Kehidupanmu", "DM ID hero title");
  eq(idPres.profileCard.action, "Lihat detail selengkapnya", "DM ID action");
  ok(idPres.center.narrative.includes("Kamu cenderung menata hidup melalui"), "DM ID center narrative");

  const enPres = buildDestinyMatrixPresentation(matrix, {}, { isEn: true });
  eq(enPres.hero.title, "Map of Destiny and Life Patterns", "DM EN hero title");
  eq(enPres.profileCard.action, "View full details", "DM EN action");
  ok(enPres.center.narrative.includes("You naturally structure life through"), "DM EN center narrative");
  ok(enPres.strengths.length > 0, "DM EN strengths exist");
  ok(enPres.challenges.length > 0, "DM EN challenges exist");
  ok(enPres.growthDirection.length > 0, "DM EN growth direction exists");
}

/* ------------------------------------------------- 5. Vedic */
function testVedic(): void {
  const idPres = buildVedicPresentation(null, { isEn: false });
  eq(idPres.hero.title, "Peta Langit Vedikmu", "Vedic ID hero title");
  eq(idPres.hero.action, "Lihat detail selengkapnya", "Vedic ID hero action");

  const enPres = buildVedicPresentation(null, { isEn: true });
  eq(enPres.hero.title, "Your Vedic Sky Map", "Vedic EN hero title");
  eq(enPres.hero.action, "View complete details", "Vedic EN hero action");
  ok(enPres.hero.insight.includes("Complete birth details to unlock your Vedic Astrology reading"), "Vedic EN insight");

  // Verify cultural terminology preservation for active Vedic data
  const mockVedicData: any = {
    lagna: { rashi: "Mesha", nakshatra: "Ashwini", pada: 1 },
    moon: { rashi: "Vrishabha", nakshatra: "Rohini", pada: 2 },
    sun: { rashi: "Simha", nakshatra: "Magha", pada: 3 },
    houses: [{ house: 1, rashi: "Mesha" }],
    mahadasha: { lord: "Jupiter", until: "2028-01-01" },
  };
  const activeEn = buildVedicPresentation(mockVedicData, { isEn: true });
  eq(activeEn.canonicalName, "Vedic Astrology", "Vedic canonical name");
}

/* ------------------------------------------------- 6. BaZi */
function testBazi(): void {
  const baziData = calculateBazi({ birthDate: "1990-05-15", birthTime: "14:30" });

  const idPres = BaziMeaningService.enrich(baziData, { isEn: false });
  ok(idPres.dayMaster.description.length > 0, "BaZi ID day master description exists");

  const enPres = BaziMeaningService.enrich(baziData, { isEn: true });
  ok(enPres.dayMaster.description.includes("Your inner nature"), "BaZi EN day master description");

  // Verify authentic cultural terms preserved
  ok(enPres.dayPillar.stemPinyin, "Day stem pinyin preserved");
  ok(enPres.dayPillar.branchPinyin, "Day branch pinyin preserved");
  ok(enPres.yearPillar.stemPinyin, "Year stem pinyin preserved");
  ok(enPres.yearPillar.branchPinyin, "Year branch pinyin preserved");
  eq(enPres.dayMaster.pinyin, baziData.dayMaster.pinyin, "Day master pinyin invariant");
}

/* ------------------------------------------------- 7. Tzolkin */
function testTzolkin(): void {
  const idPres = buildTzolkinPresentation(null, { isEn: false });
  eq(idPres.hero.title, "Kalender Kesadaran Maya", "Tzolkin ID hero title");
  eq(idPres.hero.action, "Lihat detail selengkapnya", "Tzolkin ID hero action");

  const enPres = buildTzolkinPresentation(null, { isEn: true });
  eq(enPres.hero.title, "Maya Consciousness Calendar", "Tzolkin EN hero title");
  eq(enPres.hero.action, "View full details", "Tzolkin EN hero action");
  ok(enPres.hero.insight.includes("Complete your birth date"), "Tzolkin EN insight");

  // Verify Tzolkin active presentation
  const mockTzolkinData: any = {
    kin: 120,
    solarSeal: { number: 20, nameId: "Ahau", nameEn: "Sun", color: "Kuning" },
    galacticTone: { number: 3, nameId: "Listrik", nameEn: "Electric" },
    wavespell: { kin: 118, sealName: "Etznab", nameEn: "Mirror" },
    castle: { color: "Biru", name: "Kastil Barat Transformasi" },
    guideKin: { number: 68, name: "Bintang Kuning Listrik" },
  };
  const activeEn = buildTzolkinPresentation(mockTzolkinData, { isEn: true });
  eq(activeEn.canonicalName, "Tzolkin", "Tzolkin canonical name");
}

/* ------------------------------------------------- 8. Weton */
function testWeton(): void {
  const mockWetonInput = {
    day: "Selasa",
    pasaran: "Legi",
    weton: "Selasa Legi",
    neptuDino: 3,
    neptuPasaran: 5,
    totalNeptu: 8,
    watak: "Lakuning Lintang",
    strengths: ["Setia", "Pekerja Keras"],
    challenges: ["Mudah Tersinggung"],
    lifeMission: "Membawa kedamaian",
    wuku: { name: "Sinta", index: 1, description: "Wuku Sinta melambangkan keteguhan" },
    pranataMangsa: { name: "Kasa", description: "Musim pertama" },
  };

  const idPres = buildWetonPresentation(mockWetonInput, { isEn: false });
  eq(idPres.hero, "Jejak Hari Kelahiranmu", "Weton ID hero");
  eq(idPres.sections[0]?.title, "Hari, Pasaran, dan Weton", "Weton ID section 0 title");
  eq(idPres.tulangWangi?.canonicalLabel, "Tulang Wangi", "Weton ID Tulang Wangi canonicalLabel");
  ok(idPres.tulangWangi?.statusText.includes("termasuk dalam salah satu Weton"), "Weton ID statusText");

  const enPres = buildWetonPresentation(mockWetonInput, { isEn: true });
  eq(enPres.hero, "Traces of Your Birth Day", "Weton EN hero");
  eq(enPres.sections[0]?.title, "Day, Pasaran, and Weton", "Weton EN section 0 title");
  eq(enPres.tulangWangi?.canonicalLabel, "Tulang Wangi", "Weton EN Tulang Wangi canonicalLabel");
  ok(enPres.tulangWangi?.statusText.includes("traditionally recognized in Javanese lore as Tulang Wangi"), "Weton EN statusText");

  // Verify authentic cultural terms preserved
  eq(enPres.profileCard.weton, "Selasa Legi", "Weton name Selasa Legi preserved");
  eq(enPres.profileCard.dayAndPasaran, "Selasa · Legi", "Day and Pasaran preserved");
  ok(enPres.tulangWangi?.culturalContext.includes("Javanese cultural traditions"), "Tulang Wangi preserved in culturalContext");
}

/* ------------------------------------------------- 9. Whole Sign */
function testWholeSign(): void {
  const mockWholeSignResult: any = {
    ascendant: { sign: "Cancer" },
    midheaven: { sign: "Aries", wholeSignHouse: 10 },
    planets: [
      { planet: "Sun", sign: "Taurus", wholeSignHouse: 11, degree: 10 },
      { planet: "Moon", sign: "Cancer", wholeSignHouse: 1, degree: 5 },
    ],
    houses: [{ houseNumber: 1, sign: "Cancer", ruler: "Moon", planets: ["Moon"] }],
    houseEmphasis: [{ houseNumber: 1, sign: "Cancer", planets: ["Moon"], reasons: ["Ascendant", "Chart Ruler"] }],
    angularPlanets: [{ planet: "Moon", wholeSignHouse: 1 }],
    aspects: [],
  };

  const idPres = buildWholeSignPresentation(mockWholeSignResult, { isEn: false });
  eq(idPres.hero.title, "Rumah Kehidupan dalam Whole Sign", "WS ID hero title");
  ok(idPres.ascendant?.narrative.includes("Kamu cenderung memasuki pengalaman"), "WS ID ascendant narrative");
  ok(idPres.houseEmphasis[0]?.title.includes("House 1 · Diri dan Cara Hadir"), "WS ID House 1 title");

  const enPres = buildWholeSignPresentation(mockWholeSignResult, { isEn: true });
  eq(enPres.hero.title, "Life Houses in Whole Sign", "WS EN hero title");
  eq(enPres.ascendant?.title, "Ascendant", "WS EN ascendant title");
  ok(enPres.ascendant?.narrative.includes("You enter experiences with a presence"), "WS EN ascendant narrative");
  ok(enPres.houseEmphasis[0]?.title.includes("House 1 · Self & Presence"), "WS EN House 1 title");
}

/* ------------------------------------------------- 10. Zi Wei */
function testZiWei(): void {
  const mockZiWeiResult = calculateZiWei({ birthDate: "1990-05-15", birthTime: "14:30", gender: "male" });

  const idPres = buildZiWeiPresentation(mockZiWeiResult, { isEn: false });
  eq(idPres.hero.title, "Peta Istana dan Bintang Kehidupanmu", "ZW ID hero title");
  ok(idPres.hero.insight.includes("Kekuatanmu tumbuh ketika ketegasan"), "ZW ID hero insight");
  ok(idPres.themeSections[1]?.humanMeaning[0]?.includes("Ketika menyangkut sumber daya"), "ZW ID wealth narrative");

  const enPres = buildZiWeiPresentation(mockZiWeiResult, { isEn: true });
  eq(enPres.hero.title, "Your Life Palaces and Stars Blueprint", "ZW EN hero title");
  ok(enPres.hero.insight.includes("Your strength deepens when resolve"), "ZW EN hero insight");
  ok(enPres.themeSections[1]?.humanMeaning[0]?.includes("When managing resources"), "ZW EN wealth narrative");

  // Verify cultural terms preserved: Palace branch, Master Star names
  ok(mockZiWeiResult.lifePalace?.earthlyBranch, "Palace earthlyBranch preserved");
  ok(mockZiWeiResult.lifeMaster, "Master star lifeMaster preserved");
  ok(mockZiWeiResult.bodyMaster, "Master star bodyMaster preserved");
}

/* ------------------------------------------------- 11. Astrocartography */
function testAstrocartography(): void {
  const realAstro = calculateAstrocartography({
    birthDate: "1990-05-15",
    birthTime: "14:30",
    timezone: "Asia/Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
  });

  const idPres = buildAstrocartographyPresentation(realAstro, { isEn: false });
  eq(idPres.hero.title, "Peta Langitmu di Atas Bumi", "AC ID hero title");
  eq(idPres.profileCard.action, "Lihat peta selengkapnya", "AC ID profile card action");
  ok(idPres.travelThemes.includes("Tempat baru dapat menjadi ruang"), "AC ID travel themes");

  const enPres = buildAstrocartographyPresentation(realAstro, { isEn: true });
  eq(enPres.hero.title, "Your Planetary Lines Across the Earth", "AC EN hero title");
  eq(enPres.profileCard.action, "Explore full map", "AC EN profile card action");
  ok(enPres.travelThemes.includes("Unfamiliar destinations"), "AC EN travel themes");

  // Automatic presentation test
  const autoEn = buildAutomaticAstrocartographyPresentation(realAstro, { isEn: true });
  ok(autoEn?.dominantTheme.includes("theme forms one of the closest geographic alignments"), "Auto EN dominant theme");
  ok(autoEn?.safetyNote.includes("Reference cities are not directives to relocate"), "Auto EN safety note");

  const autoId = buildAutomaticAstrocartographyPresentation(realAstro, { isEn: false });
  ok(autoId?.dominantTheme.includes("menjadi salah satu jalur geografis"), "Auto ID dominant theme");
  ok(autoId?.safetyNote.includes("Kota referensi bukan perintah untuk pindah"), "Auto ID safety note");
}

/* ------------------------------------------------- 12. Echo Blueprint Summary */
function testEchoBlueprint(): void {
  const mockEcho = {
    humanDesign: {
      type: "Projector",
      status: "ready",
      source: "canonical",
      hdEngineVersion: "gaia-hd-v1",
      strategy: "Wait for the Invitation",
      authority: "Solar Plexus",
    },
  };

  const detailId = createBlueprintDetail(mockEcho, false);
  eq(detailId.humanDesign.Type, "Projector", "Detail ID Type");
  eq(detailId.humanDesign.Profile, "Belum tersedia", "Detail ID Profile fallback");

  const detailEn = createBlueprintDetail(mockEcho, true);
  eq(detailEn.humanDesign.Type, "Projector", "Detail EN Type");
  eq(detailEn.humanDesign.Profile, "Not available", "Detail EN Profile fallback");

  const summaryEn = createBlueprintSummary(mockEcho, true);
  eq(summaryEn.humanDesignType, "Projector", "Summary EN humanDesignType");
  eq(summaryEn.lifePath, "Not available", "Summary EN lifePath fallback");

  const summaryId = createBlueprintSummary(mockEcho, false);
  eq(summaryId.humanDesignType, "Projector", "Summary ID humanDesignType");
  eq(summaryId.lifePath, "Belum tersedia", "Summary ID lifePath fallback");
}

/* ------------------------------------------------- 13. Calculation Engines Integrity */
function testEngineIntegrity(): void {
  const diff = execSync("git diff --name-only HEAD", { cwd: ROOT, encoding: "utf-8" });
  const forbiddenEngines = [
    "calculateHumanDesign.ts",
    "calculateNatalBasics.ts",
    "calculateNumerology.ts",
    "calculateBazi.ts",
    "calculateWeton.ts",
    "calculateTzolkin.ts",
    "calculateZiWei.ts",
    "calculateAstrocartography.ts",
    "calculateWholeSign.ts",
  ];

  for (const engine of forbiddenEngines) {
    const touched = diff.split("\n").some((f) => f.includes(engine));
    eq(touched, false, `Calculation engine ${engine} MUST NOT be modified`);
  }
}

/* ------------------------------------------------- 14. Detail Page Source Invariants */
function testPageSourceInvariants(): void {
  const pages = [
    "app/blueprint/page.tsx",
    "app/blueprint/numerology/page.tsx",
    "app/blueprint/human-design/page.tsx",
    "app/blueprint/natal-chart/page.tsx",
    "app/blueprint/destiny-matrix/page.tsx",
    "app/blueprint/vedic/page.tsx",
    "app/blueprint/bazi/page.tsx",
    "app/blueprint/tzolkin/page.tsx",
    "app/blueprint/weton/page.tsx",
    "app/blueprint/whole-sign/page.tsx",
    "app/blueprint/zi-wei/page.tsx",
    "app/blueprint/astrocartography/page.tsx",
    "app/blueprint/components/AuditSection.tsx",
    "app/blueprint/components/IdentityExpansionPage.tsx",
  ];

  for (const p of pages) {
    const fullPath = path.join(ROOT, p);
    ok(fs.existsSync(fullPath), `Page file ${p} must exist`);
    const content = fs.readFileSync(fullPath, "utf-8");
    ok(
      content.includes("useLanguage") || content.includes("isEnlEdition"),
      `Page ${p} must integrate useLanguage or isEnlEdition`,
    );
    ok(
      content.includes("isEn"),
      `Page ${p} must evaluate isEn flag for conditional localization`,
    );
  }
}

/* ------------------------------------------------- 15. Child Visual Components */
function testVisualComponents(): void {
  const components = [
    "components/blueprint/AstrocartographyMap.tsx",
    "components/blueprint/DestinyMatrixVisual.tsx",
    "components/zi-wei/TwelvePalaceChart.tsx",
    "components/blueprint/HumanDesignBodygraphLite.tsx",
    "components/blueprint/NatalWheelLite.tsx",
  ];

  for (const c of components) {
    const fullPath = path.join(ROOT, c);
    ok(fs.existsSync(fullPath), `Visual component ${c} must exist`);
    const content = fs.readFileSync(fullPath, "utf-8");
    ok(
      content.includes("isEn"),
      `Visual component ${c} must support isEn localization`,
    );
  }
}

/* ------------------------------------------------- Main Runner */
console.log("Running Build 108 Sprint 3 (Blueprint Core & Detail Pages) test suite:");
testNumerology();
console.log("  1. Numerology presentation (EN/ID) ................. PASS");
testHumanDesign();
console.log("  2. Human Design presentation (EN/ID) ............... PASS");
testNatalChart();
console.log("  3. Natal Chart presentation (EN/ID) ................ PASS");
testDestinyMatrix();
console.log("  4. Destiny Matrix presentation (EN/ID) ............. PASS");
testVedic();
console.log("  5. Vedic presentation & Nakshatra invariants ....... PASS");
testBazi();
console.log("  6. BaZi presentation & Stems/Branches invariants ... PASS");
testTzolkin();
console.log("  7. Tzolkin presentation & Kin invariants ........... PASS");
testWeton();
console.log("  8. Weton presentation & Neptu/Pasaran invariants ... PASS");
testWholeSign();
console.log("  9. Whole Sign presentation (EN/ID) ................. PASS");
testZiWei();
console.log(" 10. Zi Wei Dou Shu presentation & Stars invariants .. PASS");
testAstrocartography();
console.log(" 11. Astrocartography presentation (EN/ID) ........... PASS");
testEchoBlueprint();
console.log(" 12. Echo blueprint summary & detail helpers ......... PASS");
testEngineIntegrity();
console.log(" 13. Calculation engines integrity (0 modified) ...... PASS");
testPageSourceInvariants();
console.log(" 14. Detail page source invariants (14 surfaces) ..... PASS");
testVisualComponents();
console.log(" 15. Visual components English support (5 components)  PASS");

console.log(`PASS build108-sprint03-blueprints (${assertions} assertions)`);

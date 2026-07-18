import { HD_ENGINE_VERSION } from "@/lib/humandesign/hdAudit";

function fullAuditBlueprint(uid: string, theme: string, overrides: Record<string, unknown> = {}) {
  const slug = theme.toLowerCase().replace(/\s+/g, "-");
  const pillar = (stem: string, branch: string, element: "Wood" | "Fire" | "Earth" | "Metal" | "Water") => ({
    stem,
    stemPinyin: stem,
    branch,
    branchPinyin: branch,
    element,
    polarity: "Yang" as const,
    animal: branch,
    display: `${stem} ${branch}`,
  });
  const yearPillar = pillar("Jia", `${slug}-root`, "Wood");
  const monthPillar = pillar("Bing", `${slug}-craft`, "Fire");
  const dayPillar = pillar("Wu", `${slug}-self`, "Earth");
  const hourPillar = pillar("Ren", `${slug}-focus`, "Water");
  const currentLuckPillar = pillar("Geng", `${slug}-cycle`, "Metal");
  return {
    uid,
    status: "ready",
    lifePath: { number: 4, role: "The Builder" },
    numerology: { lifePathNumber: 4, expression: `${theme} expression` },
    humanDesign: {
      type: "Manifesting Generator",
      authority: `${theme} body authority`,
      strategy: `${theme} response strategy`,
      profile: "5/1",
      status: "ready",
      source: "gaia-hd-api",
      hdEngineVersion: HD_ENGINE_VERSION,
      calculationQuality: "verified",
    },
    destinyMatrix: { center: 8, energyType: `${theme} arcana` },
    astrology: {
      sun: { sign: `${theme} sun` },
      moon: { sign: `${theme} moon` },
      ascendant: { sign: `${theme} rising` },
      sunSign: `${theme} sun`,
    },
    tzolkin: {
      kin: 260,
      kinName: `${theme} kin`,
      solarSeal: { name: `${theme} seal`, keyword: "presence" },
      galacticTone: { name: `${theme} tone`, function: "integration" },
      color: `${theme} color`,
      wavespell: { name: `${theme} wavespell`, theme: "growth" },
      castle: { name: `${theme} castle`, theme: "maturity" },
      gap: false,
      oracle: {
        destiny: { seal: { name: `${theme} destiny` } },
        analog: { seal: { name: `${theme} analog` } },
        guide: { seal: { name: `${theme} guide` } },
        antipode: { seal: { name: `${theme} antipode` } },
        occult: { seal: { name: `${theme} occult` } },
      },
    },
    weton: {
      day: "Sabtu",
      pasaran: "Legi",
      weton: `${theme} weton`,
      neptuDay: 9,
      neptuPasaran: 5,
      totalNeptu: 14,
      wuku: { name: `${theme} wuku`, description: `${theme} ancestral rhythm` },
      pranataMangsa: { name: `${theme} mangsa`, description: `${theme} seasonal rhythm` },
    },
    bazi: {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
      dayMaster: { stem: "Wu", pinyin: "Wu", element: "Earth", polarity: "Yang", description: `${theme} day master` },
      fiveElements: { Wood: 2, Fire: 1, Earth: 2, Metal: 1, Water: 1 },
      tenGods: [
        { pillar: "year", stem: "Jia", tenGod: "Direct Resource" },
        { pillar: "month", stem: "Bing", tenGod: "Indirect Resource" },
        { pillar: "hour", stem: "Ren", tenGod: "Seven Killings" },
      ],
      favorableElements: ["Wood", "Fire"],
      unfavorableElements: ["Metal"],
      luckPillars: [{ index: 1, startAge: 32, endAge: 41, pillar: currentLuckPillar }],
      currentLuckCycle: { index: 1, startAge: 32, endAge: 41, pillar: currentLuckPillar },
      luckCycleMethod: "forward-solar-sequence",
      strengths: [`${theme} structure`],
      challenges: [`${theme} excess`],
      careerStyle: `${theme} career style`,
      relationshipStyle: `${theme} relationship style`,
      moneyStyle: `${theme} money style`,
      lifeMission: `${theme} life mission`,
      summary: [`${theme} summary`],
    },
    vedic: {
      lagna: { sign: `${theme} lagna`, house: 1 },
      moonSign: { sign: `${theme} moon`, house: 4 },
      sunSign: { sign: `${theme} sun`, house: 10 },
      nakshatra: `${theme} nakshatra`,
      pada: 2,
      atmakaraka: { planet: `${theme} soul`, sign: "earth" },
      darakaraka: { planet: `${theme} relation`, sign: "water" },
      currentMahadasha: { planet: `${theme} dasha`, startDate: "2020-01-01", endDate: "2030-01-01" },
      currentAntardasha: { planet: `${theme} subdasha`, startDate: "2026-01-01", endDate: "2026-12-31" },
      dharmaFocus: [`${theme} duty`],
      arthaFocus: [`${theme} resources`],
      kamaFocus: [`${theme} relation`],
      mokshaFocus: [`${theme} meaning`],
      majorYogas: [{ name: `${slug} yoga`, evidence: `${theme} integration evidence` }],
    },
    ...overrides,
  };
}

export function getMockProfile(user: string) {
  if (user === "moana007") {
    return {
      uid: "moana007_uid",
      fullName: "Founder Test",
      language: "id",
      setupCompleted: true,
      birthDate: "1990-05-05",
      birthTime: "12:00",
      birthCity: "Jakarta",
      timezone: "Asia/Jakarta",
      guardianRole: "founder",
    };
  }

  return {
    uid: `${user}_uid`,
    fullName: user.charAt(0).toUpperCase() + user.slice(1),
    language: "id",
    setupCompleted: true,
    birthDate: "1990-01-01",
    birthTime: user.includes("partial") ? undefined : "09:30",
    birthCity: user.includes("location") ? "Denpasar" : "Jakarta",
    timezone: user.includes("location") ? "Asia/Makassar" : "Asia/Jakarta",
    guardianRole: "founder",
  };
}

export function getMockBlueprint(user: string) {
  if (user === "moana007") {
    return fullAuditBlueprint("moana007_uid", "founder stewardship");
  }

  if (user.includes("partial")) {
    return fullAuditBlueprint(`${user}_uid`, "partial careful growth", {
      astrology: undefined,
      vedic: {
        status: "PARTIAL_BIRTH_TIME_REQUIRED",
        availableSections: [],
        unavailableSections: ["Lagna", "houses", "exact timing"],
        message: "Birth time required",
      },
    });
  }

  const theme = user.includes("location")
    ? "founder stewardship bali location"
    : user.includes("shadow")
      ? "relationship shadow healing"
      : "technical work contribution";
  return fullAuditBlueprint(`${user}_uid`, theme, {
    lifePath: { number: user.includes("shadow") ? 9 : 7, role: user.includes("shadow") ? "The Healer" : "The Seeker" },
    numerology: { lifePathNumber: user.includes("shadow") ? 9 : 7, expression: `${theme} expression` },
    humanDesign: {
      type: user.includes("shadow") ? "Projector" : "Generator",
      authority: `${theme} authority`,
      strategy: `${theme} strategy`,
      profile: "5/1",
      status: "ready",
      source: "gaia-hd-api",
      hdEngineVersion: HD_ENGINE_VERSION,
      calculationQuality: "verified",
    },
  });
}

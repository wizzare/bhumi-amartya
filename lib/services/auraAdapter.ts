import { Blueprint } from "../types/blueprint";

export interface AuraScores {
  red: number;
  orange: number;
  yellow: number;
  green: number;
  blue: number;
  purple: number;
  gold: number;
  silver: number;
}

export function calculateAuraScores(blueprint: Blueprint): AuraScores {
  const scores: AuraScores = {
    red: 0,
    orange: 0,
    yellow: 0,
    green: 0,
    blue: 0,
    purple: 0,
    gold: 0,
    silver: 0,
  };

  // 1. WETON (Day & Pasaran)
  if (blueprint.weton) {
    const day = blueprint.weton.day;
    const pasaran = blueprint.weton.pasaran;

    // Day mapping
    if (day === "Minggu") { scores.yellow += 10; scores.gold += 10; }
    else if (day === "Senin") { scores.purple += 10; scores.green += 10; }
    else if (day === "Selasa") { scores.red += 20; }
    else if (day === "Rabu") { scores.blue += 20; }
    else if (day === "Kamis") { scores.gold += 10; scores.yellow += 10; }
    else if (day === "Jumat") { scores.green += 15; scores.orange += 5; }
    else if (day === "Sabtu") { scores.silver += 20; }

    // Pasaran mapping
    if (pasaran === "Legi") { scores.yellow += 20; }
    else if (pasaran === "Pahing") { scores.red += 20; }
    else if (pasaran === "Pon") { scores.gold += 20; }
    else if (pasaran === "Wage") { scores.silver += 20; }
    else if (pasaran === "Kliwon") { scores.purple += 20; }
  }

  // 2. NUMEROLOGY
  if (blueprint.numerology) {
    const num = blueprint.numerology as any;
    // Map available properties
    const numList = [num.number, num.expression, num.soulUrge, num.personality];

    numList.forEach((val) => {
      if (!val) return;
      if (val === 1) { scores.gold += 15; scores.red += 5; }
      else if (val === 2) { scores.green += 15; scores.blue += 5; }
      else if (val === 3) { scores.orange += 20; }
      else if (val === 4) { scores.silver += 15; scores.green += 5; }
      else if (val === 5) { scores.yellow += 20; }
      else if (val === 6) { scores.green += 15; scores.gold += 5; }
      else if (val === 7) { scores.purple += 20; }
      else if (val === 8) { scores.gold += 15; scores.red += 5; }
      else if (val === 9) { scores.silver += 10; scores.blue += 10; }
      else if (val === 11) { scores.purple += 15; scores.silver += 5; }
      else if (val === 22) { scores.gold += 15; scores.silver += 5; }
      else if (val === 33) { scores.green += 15; scores.purple += 5; }
    });
  }

  // 3. HUMAN DESIGN
  if (blueprint.humanDesign) {
    const hd = blueprint.humanDesign;
    const type = hd.type;
    const authority = hd.authority;

    if (type) {
      if (type.includes("Manifestor")) { scores.gold += 20; }
      else if (type.includes("Generator") && !type.includes("Manifesting")) { scores.orange += 20; }
      else if (type.includes("Manifesting Generator")) { scores.red += 20; }
      else if (type.includes("Projector")) { scores.green += 20; }
      else if (type.includes("Reflector")) { scores.silver += 20; }
    }

    if (authority) {
      if (authority.includes("Emotional") || authority.includes("Solar Plexus")) { scores.orange += 15; }
      else if (authority.includes("Sacral")) { scores.red += 15; }
      else if (authority.includes("Splenic")) { scores.purple += 10; scores.silver += 5; }
      else if (authority.includes("Ego") || authority.includes("Heart")) { scores.gold += 15; }
      else if (authority.includes("Self") || authority.includes("G-Center")) { scores.green += 15; }
      else if (authority.includes("Mental") || authority.includes("Outer")) { scores.blue += 10; scores.silver += 5; }
      else if (authority.includes("Lunar")) { scores.purple += 15; }
    }
  }

  // 4. DESTINY MATRIX
  if (blueprint.destinyMatrix) {
    const dm = blueprint.destinyMatrix;
    const center = dm.arcanaCenter || dm.center;
    if (center) {
      if (center === 1) { scores.gold += 15; }
      else if (center === 2) { scores.purple += 15; }
      else if (center === 3) { scores.orange += 15; }
      else if (center === 4) { scores.gold += 15; }
      else if (center === 5) { scores.yellow += 15; }
      else if (center === 6) { scores.green += 15; }
      else if (center === 7) { scores.red += 15; }
      else if (center === 8) { scores.silver += 15; }
      else if (center === 9) { scores.silver += 10; scores.purple += 5; }
      else if (center === 10) { scores.yellow += 15; }
      else if (center === 11) { scores.red += 15; }
      else if (center === 12) { scores.green += 15; }
      else if (center === 13) { scores.purple += 15; }
      else if (center === 14) { scores.green += 15; }
      else if (center === 15) { scores.orange += 15; }
      else if (center === 16) { scores.red += 15; }
      else if (center === 17) { scores.blue += 15; }
      else if (center === 18) { scores.purple += 15; }
      else if (center === 19) { scores.yellow += 10; scores.gold += 5; }
      else if (center === 20) { scores.silver += 15; }
      else if (center === 21) { scores.blue += 10; scores.gold += 5; }
      else if (center === 22) { scores.orange += 15; }
    }
  }

  // 5. NATAL CHART (Astrology)
  const chart = blueprint.natalChart || blueprint.astrology;
  if (chart) {
    const sunSign = chart.sunSign;
    const moonSign = chart.moonSign;
    const ascendant = chart.risingSign;

    const signs = [sunSign, moonSign, ascendant].filter(Boolean) as string[];
    signs.forEach((sign) => {
      const lowerSign = sign.toLowerCase();
      // Fire
      if (["aries", "leo", "sagittarius"].includes(lowerSign)) {
        scores.red += 10;
        scores.yellow += 5;
      }
      // Earth
      else if (["taurus", "virgo", "capricorn"].includes(lowerSign)) {
        scores.silver += 10;
        scores.green += 5;
      }
      // Air
      else if (["gemini", "libra", "aquarius"].includes(lowerSign)) {
        scores.blue += 10;
        scores.orange += 5;
      }
      // Water
      else if (["cancer", "scorpio", "pisces"].includes(lowerSign)) {
        scores.green += 10;
        scores.purple += 5;
      }

      if (lowerSign === "leo") { scores.gold += 10; }
      else if (lowerSign === "scorpio") { scores.purple += 10; }
    });
  }

  // 6. BAZI
  if (blueprint.bazi && blueprint.bazi.dayMaster) {
    const element = blueprint.bazi.dayMaster.element;
    if (element === "Wood") { scores.green += 20; }
    else if (element === "Fire") { scores.red += 20; }
    else if (element === "Earth") { scores.yellow += 20; }
    else if (element === "Metal") { scores.silver += 25; }
    else if (element === "Water") { scores.blue += 20; }
  }

  // 7. VEDIC ASTROLOGY
  if (blueprint.vedic && blueprint.vedic.moonSign) {
    const vSign = blueprint.vedic.moonSign.sign?.toLowerCase();
    if (vSign) {
      if (["aries", "leo", "sagittarius", "mesha", "simha", "dhanus"].includes(vSign)) { scores.red += 15; }
      else if (["taurus", "virgo", "capricorn", "vrishabha", "kanya", "makara"].includes(vSign)) { scores.silver += 15; }
      else if (["gemini", "libra", "aquarius", "mithuna", "tula", "kumbha"].includes(vSign)) { scores.blue += 15; }
      else if (["cancer", "scorpio", "pisces", "karka", "vrishchika", "meena"].includes(vSign)) { scores.purple += 15; }
    }
  }

  // 8. TZOLKIN
  if (blueprint.tzolkin) {
    const tzColor = blueprint.tzolkin.color?.toLowerCase();
    if (tzColor) {
      if (tzColor === "red") { scores.red += 15; }
      else if (tzColor === "white") { scores.silver += 15; }
      else if (tzColor === "blue") { scores.blue += 15; }
      else if (tzColor === "yellow") { scores.yellow += 15; }
    }
  }

  // Handle fallback uniform base if all scores remain zero
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) {
    return {
      red: 50,
      orange: 50,
      yellow: 50,
      green: 50,
      blue: 50,
      purple: 50,
      gold: 50,
      silver: 50,
    };
  }

  return scores;
}

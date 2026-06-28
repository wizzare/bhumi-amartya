import { HD_ENGINE_VERSION } from "@/lib/humandesign/hdAudit";

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
    birthCity: "Jakarta"
  };
}

export function getMockBlueprint(user: string) {
  if (user === "moana007") {
    return {
      uid: "moana007_uid",
      status: "ready",
      lifePath: { number: 4, role: "The Builder" },
      humanDesign: {
        type: "Manifesting Generator",
        profile: "5/1",
        status: "ready",
        source: "gaia-hd-api",
        hdEngineVersion: HD_ENGINE_VERSION,
        calculationQuality: "verified",
      },
      destinyMatrix: { center: 8 },
      astrology: { sunSign: "Taurus" },
      tzolkin: {
        kin: 260,
        kinName: "Matahari Kuning (Ahau) Cosmic",
        solarSeal: { name: "Matahari Kuning (Ahau)" },
      },
      weton: { weton: "Sabtu Legi" },
      bazi: { dayMaster: { polarity: "Yang", element: "Wood" } },
      vedic: { moonSign: { sign: "Libra" } },
    };
  }

  return {
    uid: `${user}_uid`,
    status: "ready",
    lifePath: { number: 7, role: "The Seeker" },
    humanDesign: {
      type: "Projector",
      profile: "5/1",
      status: "ready",
      source: "gaia-hd-api",
      hdEngineVersion: HD_ENGINE_VERSION,
      calculationQuality: "verified",
    },
    destinyMatrix: { center: 17 },
    astrology: { sunSign: "Capricorn" },
    tzolkin: { kinName: "Cosmic Night" },
    weton: { weton: "Senin Legi" },
    bazi: { dayMaster: { polarity: "Yang", element: "Wood" } },
    vedic: { moonSign: { sign: "Vrishabha" } },
  };
}

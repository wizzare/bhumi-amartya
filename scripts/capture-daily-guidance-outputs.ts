import { buildDailyGuidance } from "../lib/dailyGuidance/dailyGuidanceEngine";
import { generateLocalBlueprint } from "../lib/local/generateLocalBlueprint";
import fs from "fs";
import path from "path";

const userAria = {
  uid: "synthetic-user-a-aria",
  name: "Aria Dewanta",
  fullName: "Aria Dewanta",
  birthDate: "1985-05-03",
  birthTime: "18:45",
  latitude: -7.2575,
  longitude: 112.7521,
  timezone: "Asia/Jakarta",
  gender: "male" as const,
  relationshipStatus: "single" as const,
};

const userMaya = {
  uid: "synthetic-user-b-maya",
  name: "Maya Pratiwi",
  fullName: "Maya Pratiwi",
  birthDate: "1992-09-18",
  birthTime: "04:15",
  latitude: -6.9175,
  longitude: 107.6191,
  timezone: "Asia/Jakarta",
  gender: "female" as const,
  relationshipStatus: "in_relationship" as const,
};

const bpAria = generateLocalBlueprint(userAria as any);
(bpAria as any).humanDesign = {
  type: "Projector",
  authority: "Splenic",
  profile: "1/3",
  notSelfTheme: "Bitterness",
};
(bpAria as any).destinyMatrix = {
  center: 8,
  loveLine: [7, 10, 21],
  moneyLine: [8, 10, 21],
  karmicTail: [21, 7, 13],
};

const bpMaya = generateLocalBlueprint(userMaya as any);
(bpMaya as any).humanDesign = {
  type: "Generator",
  authority: "Sacral",
  profile: "2/4",
  notSelfTheme: "Frustration",
};
(bpMaya as any).destinyMatrix = {
  center: 6,
  loveLine: [6, 12, 18],
  moneyLine: [6, 12, 18],
  karmicTail: [18, 6, 15],
};

const ariaOct28 = buildDailyGuidance({
  uid: userAria.uid,
  profile: userAria as any,
  blueprint: bpAria as any,
  referenceDate: new Date("2026-10-28T12:00:00+07:00"),
  timezone: "Asia/Jakarta",
});

const mayaOct28 = buildDailyGuidance({
  uid: userMaya.uid,
  profile: userMaya as any,
  blueprint: bpMaya as any,
  referenceDate: new Date("2026-10-28T12:00:00+07:00"),
  timezone: "Asia/Jakarta",
});

const ariaOct26DayRen = buildDailyGuidance({
  uid: userAria.uid,
  profile: userAria as any,
  blueprint: bpAria as any,
  referenceDate: new Date("2026-10-26T12:00:00+07:00"),
  timezone: "Asia/Jakarta",
});

const output = {
  metadata: {
    feature: "Catatan Hari Ini (Profile Page)",
    version: "Build 118 / 5.0.18",
    format: "Weekly Guidance Parity (8 Vertical Accordion Domain Cards)",
    generatedAt: new Date().toISOString(),
  },
  ariaOct28: {
    profile: {
      name: userAria.name,
      relationshipStatus: userAria.relationshipStatus,
    },
    cosmicSummary: ariaOct28.cosmicSummary,
    sections: ariaOct28.sections.map((s) => ({
      key: s.key,
      title: s.title,
      intensity: s.intensity,
      summary: s.summary,
      astrologicalMeaning: s.astrologicalMeaning,
      spiritualMeaning: s.spiritualMeaning,
      crossSystemSynthesis: s.crossSystemSynthesis,
      saranBhumi: s.advice[0],
      phases: s.phases,
      readingFoundations: s.readingFoundations,
    })),
    dailyDirection: ariaOct28.dailyDirection,
  },
  mayaOct28: {
    profile: {
      name: userMaya.name,
      relationshipStatus: userMaya.relationshipStatus,
    },
    cosmicSummary: mayaOct28.cosmicSummary,
    sections: mayaOct28.sections.map((s) => ({
      key: s.key,
      title: s.title,
      intensity: s.intensity,
      summary: s.summary,
      astrologicalMeaning: s.astrologicalMeaning,
      spiritualMeaning: s.spiritualMeaning,
      crossSystemSynthesis: s.crossSystemSynthesis,
      saranBhumi: s.advice[0],
      phases: s.phases,
      readingFoundations: s.readingFoundations,
    })),
    dailyDirection: mayaOct28.dailyDirection,
  },
  ariaOct26DayRen: {
    date: "2026-10-26",
    baziToday: ariaOct26DayRen.cosmicSummary.baziToday,
    kabarHariIni: ariaOct26DayRen.sections.find((s) => s.key === "kabarHariIni"),
  },
};

const scratchDir = path.resolve(process.cwd(), "scratch");
fs.mkdirSync(scratchDir, { recursive: true });
fs.writeFileSync(
  path.join(scratchDir, "build118-daily-guidance-parity-outputs.json"),
  JSON.stringify(output, null, 2),
  "utf8"
);
console.log("SUCCESS: Saved scratch/build118-daily-guidance-parity-outputs.json");

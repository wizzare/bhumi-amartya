import path from "node:path";
import Module from "node:module";

const rootDir = path.resolve(__dirname, "..");
const originalResolveFilename = (Module as any)._resolveFilename;

(Module as any)._resolveFilename = function resolveAlias(
  request: string,
  parent: unknown,
  isMain: boolean,
  options: unknown,
) {
  if (request.startsWith("@/")) {
    return originalResolveFilename.call(
      this,
      path.join(rootDir, request.slice(2)),
      parent,
      isMain,
      options,
    );
  }

  return originalResolveFilename.call(this, request, parent, isMain, options);
};

const { default: calculateArcanaCenter } = require("../lib/calculations/calculateArcanaCenter");
const { calculateDestinyMatrix } = require("../lib/calculations/calculateDestinyMatrix");
const { calculateLifePath } = require("../lib/calculations/calculateLifePath");
const { default: calculateSunSign } = require("../lib/calculations/calculateSunSign");
const { calculateNatalBasics } = require("../lib/astrology/calculateNatalBasics");
const { calculateHumanDesign } = require("../lib/humandesign/calculateHumanDesign");

type ExpectedValue = string | number | "manual-review";

type Case = {
  id: string;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthCountry: string;
  timezone: string;
  latitude: number;
  longitude: number;
  expected: Record<string, ExpectedValue>;
};

const cases: Case[] = [
  {
    id: "A",
    birthDate: "1985-05-03",
    birthTime: "23:45",
    birthCity: "Jakarta",
    birthCountry: "Indonesia",
    timezone: "+07:00",
    latitude: -6.2088,
    longitude: 106.8456,
    expected: {
      lifePath: "4",
      sunSign: "Taurus",
      moonSign: "manual-review",
      ascendant: "manual-review",
      arcana: 8,
      destinyCenter: 8,
      humanDesignStatus: "needs_verified_engine",
    },
  },
  {
    id: "B",
    birthDate: "1987-06-09",
    birthTime: "09:00",
    birthCity: "Bangil",
    birthCountry: "Indonesia",
    timezone: "+07:00",
    latitude: -7.5995,
    longitude: 112.8186,
    expected: {
      lifePath: "22/4",
      sunSign: "Gemini",
      moonSign: "manual-review",
      ascendant: "manual-review",
      arcana: 8,
      destinyCenter: 8,
      humanDesignStatus: "needs_verified_engine",
    },
  },
  {
    id: "C",
    birthDate: "2006-12-26",
    birthTime: "06:00",
    birthCity: "Selong",
    birthCountry: "Indonesia",
    timezone: "+08:00",
    latitude: -8.6506,
    longitude: 116.5304,
    expected: {
      lifePath: "1",
      sunSign: "Capricorn",
      moonSign: "manual-review",
      ascendant: "manual-review",
      arcana: 11,
      destinyCenter: 11,
      humanDesignStatus: "needs_verified_engine",
    },
  },
  {
    id: "D",
    birthDate: "2020-01-01",
    birthTime: "12:00",
    birthCity: "Jakarta",
    birthCountry: "Indonesia",
    timezone: "+07:00",
    latitude: -6.2088,
    longitude: 106.8456,
    expected: {
      lifePath: "6",
      sunSign: "Capricorn",
      moonSign: "manual-review",
      ascendant: "manual-review",
      arcana: 12,
      destinyCenter: 12,
      humanDesignStatus: "needs_verified_engine",
    },
  },
];

function pass(expected: ExpectedValue, calculated: string | number | null): string {
  if (expected === "manual-review") return "REVIEW";
  return String(expected) === String(calculated) ? "PASS" : "FAIL";
}

async function main() {
  const rows: string[] = [
    "| Case | Field | Expected | Calculated | Result |",
    "| --- | --- | --- | --- | --- |",
  ];

  for (const item of cases) {
    const lifePath = calculateLifePath(item.birthDate);
    const natal = calculateNatalBasics(item);
    const arcana = calculateArcanaCenter(item.birthDate);
    const destiny = calculateDestinyMatrix(item.birthDate);
    const hd = await calculateHumanDesign(item);

    const calculated: Record<string, string | number | null> = {
      lifePath: lifePath.display ?? String(lifePath.number),
      sunSign: calculateSunSign(item.birthDate),
      moonSign: natal.moonSign,
      ascendant: natal.ascendant,
      arcana,
      destinyCenter: destiny.center,
      humanDesignStatus: hd.status,
    };

    for (const field of Object.keys(item.expected)) {
      rows.push(`| ${item.id} | ${field} | ${item.expected[field]} | ${calculated[field]} | ${pass(item.expected[field], calculated[field])} |`);
    }
  }

  console.log(rows.join("\n"));
}

void main();

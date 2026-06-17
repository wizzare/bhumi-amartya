import * as Astronomy from "astronomy-engine";
import {
  calculateHumanDesignTypeFromBirthData,
  calculateHumanDesignProfileFromBirthData,
  birthDateTimeToUtcDate
} from "../lib/humandesign/calculateHumanDesignType";

async function runForensic() {
  console.log("=== HUMAN DESIGN FORENSIC AUDIT PHASE 2 ===");

  const cases = [
    {
      name: "Widya Amalia",
      birthDate: "1987-06-09",
      birthTime: "09:00",
      birthPlace: "Bangil, East Java",
      timezone: "+07:00",
      longitude: 112.809,
      expected: "Manifestor 1/3 Emotional"
    },
    {
      name: "Trisia",
      birthDate: "2002-09-17",
      birthTime: "02:00",
      birthPlace: "Banjarmasin",
      timezone: "+08:00",
      longitude: 114.591,
      expected: "Manifesting Generator Emotional"
    }
  ];

  for (const c of cases) {
    console.log(`\n--- CASE: ${c.name} ---`);
    console.log(`Input: ${c.birthDate} ${c.birthTime} (TZ: ${c.timezone})`);

    const type = calculateHumanDesignTypeFromBirthData(c.birthDate, c.birthTime, c.timezone, c.longitude);
    const profile = calculateHumanDesignProfileFromBirthData(c.birthDate, c.birthTime, c.timezone, c.longitude);

    console.log("JS FALLBACK RESULT:");
    console.log(`- Type:    ${type}`);
    console.log(`- Profile: ${profile}`);

    // Detailed Audit of Gates (Mandala Verification)
    const utcDate = birthDateTimeToUtcDate(c.birthDate, c.birthTime, c.timezone, c.longitude);
    const sunLon = Astronomy.SunPosition(utcDate).elon;
    console.log(`Sun Longitude (Personality): ${sunLon.toFixed(4)}°`);

    // Calculation: (Lon + 58) % 360
    const adjusted = (sunLon + 58) % 360;
    const gateIndex = Math.floor((adjusted / 360) * 64);

    const gateOrder = [
      41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
      27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
      31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
      28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
    ];

    console.log(`Adjusted Sun (Mandala): ${adjusted.toFixed(4)}° (Index: ${gateIndex}, Gate: ${gateOrder[gateIndex]})`);
  }
}

runForensic();

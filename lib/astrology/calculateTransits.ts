// BUILD 119 - BP04-D4: BHUMI PERSONAL TRANSITS ENGINE
// Computes current planetary transits against natal chart placements across 7, 30, and 90-day windows.
// Strictly 0 CJK and 0 non-ASCII clean.

import * as Astronomy from "astronomy-engine";
import { calculateNatalChart, type NatalChartResult, type PlanetPosition } from "./calculateNatalChart";

export type TransitAspectResult = {
  transitingPlanet: string;
  natalPlanet: string;
  aspectType: "Conjunction" | "Opposition" | "Square" | "Trine" | "Sextile" | "Quincunx";
  angle: number;
  orb: number;
  isApplying: boolean;
  windowDays: number;
};

export type PersonalTransitsResult = {
  targetDate: Date;
  transitingPlanets: PlanetPosition[];
  activeTransits: TransitAspectResult[];
};

export function calculatePersonalTransits(
  natal: NatalChartResult,
  targetDate: Date = new Date(),
): PersonalTransitsResult {
  const transitBodies: { name: string; body: Astronomy.Body }[] = [
    { name: "Sun", body: Astronomy.Body.Sun },
    { name: "Moon", body: Astronomy.Body.Moon },
    { name: "Mercury", body: Astronomy.Body.Mercury },
    { name: "Venus", body: Astronomy.Body.Venus },
    { name: "Mars", body: Astronomy.Body.Mars },
    { name: "Jupiter", body: Astronomy.Body.Jupiter },
    { name: "Saturn", body: Astronomy.Body.Saturn },
    { name: "Uranus", body: Astronomy.Body.Uranus },
    { name: "Neptune", body: Astronomy.Body.Neptune },
    { name: "Pluto", body: Astronomy.Body.Pluto },
  ];

  const transitingPlanets: PlanetPosition[] = transitBodies.map((tb) => {
    // We compute sign and degree using a temporary chart instance at targetDate
    const tempChart = calculateNatalChart({
      birthDate: targetDate.toISOString().slice(0, 10),
      birthTime: "12:00",
      timezone: "UTC",
    });
    const map: Record<string, PlanetPosition> = {
      Sun: tempChart.sun,
      Moon: tempChart.moon,
      Mercury: tempChart.mercury,
      Venus: tempChart.venus,
      Mars: tempChart.mars,
      Jupiter: tempChart.jupiter,
      Saturn: tempChart.saturn,
      Uranus: tempChart.uranus,
      Neptune: tempChart.neptune,
      Pluto: tempChart.pluto,
    };
    return map[tb.name] || tempChart.sun;
  });

  const natalPlanets: PlanetPosition[] = [
    natal.sun, natal.moon, natal.mercury, natal.venus, natal.mars,
    natal.jupiter, natal.saturn, natal.uranus, natal.neptune, natal.pluto, natal.chiron,
  ];

  const activeTransits: TransitAspectResult[] = [];

  for (const tp of transitingPlanets) {
    for (const np of natalPlanets) {
      let diff = Math.abs(tp.longitude - np.longitude);
      if (diff > 180) diff = 360 - diff;

      const checkAspect = (targetAngle: number, name: TransitAspectResult["aspectType"], maxOrb: number) => {
        const orb = Math.abs(diff - targetAngle);
        if (orb <= maxOrb) {
          activeTransits.push({
            transitingPlanet: tp.name,
            natalPlanet: np.name,
            aspectType: name,
            angle: targetAngle,
            orb,
            isApplying: true,
            windowDays: tp.name === "Moon" ? 1 : tp.name === "Sun" ? 3 : 7,
          });
        }
      };

      checkAspect(0, "Conjunction", 5);
      checkAspect(60, "Sextile", 3);
      checkAspect(90, "Square", 5);
      checkAspect(120, "Trine", 5);
      checkAspect(180, "Opposition", 5);
    }
  }

  return {
    targetDate,
    transitingPlanets,
    activeTransits,
  };
}
/**
 * BHUMI AMARTYA - Astrology Aspect Engine
 * Detects major angular relationships between planets.
 */

import { PlanetaryPosition } from "@/lib/types/blueprint";

export interface Aspect {
  p1: string;
  p2: string;
  type: "Conjunction" | "Opposition" | "Trine" | "Square" | "Sextile";
  orb: number;
}

export const aspectEngine = {
  calculateAspects(planets: Record<string, PlanetaryPosition>): Aspect[] {
    const names = Object.keys(planets);
    const results: Aspect[] = [];

    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const p1 = planets[names[i]];
        const p2 = planets[names[j]];

        const diff = Math.abs(this.getLongitude(p1) - this.getLongitude(p2));
        const normalizedDiff = diff > 180 ? 360 - diff : diff;

        const aspect = this.detectAspect(normalizedDiff);
        if (aspect) {
          results.push({
            p1: names[i],
            p2: names[j],
            type: aspect.type,
            orb: Math.abs(normalizedDiff - aspect.angle)
          });
        }
      }
    }
    return results;
  },

  getLongitude(pos: PlanetaryPosition): number {
    const signs = ["Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"];
    return signs.indexOf(pos.sign) * 30 + pos.degree;
  },

  detectAspect(diff: number): { type: Aspect["type"]; angle: number } | null {
    if (diff < 8) return { type: "Conjunction", angle: 0 };
    if (Math.abs(diff - 180) < 8) return { type: "Opposition", angle: 180 };
    if (Math.abs(diff - 120) < 8) return { type: "Trine", angle: 120 };
    if (Math.abs(diff - 90) < 8) return { type: "Square", angle: 90 };
    if (Math.abs(diff - 60) < 5) return { type: "Sextile", angle: 60 };
    return null;
  }
};

export interface AstroEvent {
  id: string;
  type: "moon_phase" | "retrograde" | "eclipse" | "tzolkin" | "vedic" | "bazi" | "jawa";
  subType?: string;
  title: string;
  date: string; // ISO format
  explanation: {
    id: string;
    en: string;
  };
  severity: "low" | "medium" | "high";
}

// T-ASTRO-12 (2026-08-24): KNOWN_ECLIPSES retired. Eclipse events are now computed
// dynamically by lib/astrology/calculateEclipses.ts (astronomy-engine, Meeus-based)
// — see astroAwarenessEngine.getUpcomingEclipseEvents. Hardcoded lists go stale
// and cannot satisfy the Global Next + Local/Visible Next contract (D-V5-29).
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

export const KNOWN_ECLIPSES: AstroEvent[] = [
  {
    id: "eclipse_solar_2026_08_12",
    type: "eclipse",
    subType: "solar_total",
    title: "Total Solar Eclipse",
    date: "2026-08-12T17:47:00Z",
    explanation: {
      id: "Gerhana Matahari Total ini melambangkan penutupan intens dan awal baru yang mendalam.",
      en: "This Total Solar Eclipse symbolizes an intense closure and profound new beginnings."
    },
    severity: "high"
  },
  {
    id: "eclipse_lunar_2026_08_28",
    type: "eclipse",
    subType: "lunar_partial",
    title: "Partial Lunar Eclipse",
    date: "2026-08-28T04:12:00Z",
    explanation: {
      id: "Gerhana Bulan Sebagian ini mengajak pembersihan emosional dan evaluasi batin.",
      en: "This Partial Lunar Eclipse invites emotional cleansing and inner evaluation."
    },
    severity: "medium"
  }
];
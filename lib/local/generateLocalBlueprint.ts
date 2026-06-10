import { calculateLifePath } from "@/lib/calculations/calculateLifePath";
import calculateSunSign from "@/lib/calculations/calculateSunSign";
import calculateArcanaCenter from "@/lib/calculations/calculateArcanaCenter";
import { calculateNatalBasics } from "@/lib/astrology/calculateNatalBasics";
import type { UserPlan } from "@/lib/billing/getUserPlanStatus";

export type LocalUserProfile = {
  uid: string;
  fullName: string;
  displayName: string;
  email: string | null;
  birthDate: string;
  birthTime: string;
  birthCity: string;
  birthPlace: string;
  cityOfBirth?: string;
  birthCountry?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
  language: "id" | "en";
  setupCompleted: boolean;
  authProvider?: "google" | "local";
  plan?: UserPlan;
  trialStartedAt?: string;
  trialEndsAt?: string;
  isPro?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LocalHumanDesign = {
  type: string | null;
  profile: string | null;
  authority: string | null;
  strategy: string | null;
  notSelfTheme: string | null;
  signature: string | null;
  definedCenters: string[];
  openCenters: string[];
  gatesPersonality: string[];
  gatesDesign: string[];
  status: "ready" | "pending" | "error" | "needs_verified_engine" | "verified";
  source: "human-design-py" | "local-fallback" | "pending" | "error" | "verified-override" | "manual_verified";
  note?: string;
};

export function generateLocalBlueprint(profile: LocalUserProfile) {
  if (!profile.birthDate) {
    throw new Error("Birth date is required to generate a blueprint.");
  }

  const lifePath = calculateLifePath(profile.birthDate);
  const sunSign = calculateSunSign(profile.birthDate);
  const natalChart = calculateNatalBasics({
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthCity: profile.birthCity,
    timezone: profile.timezone,
    latitude: profile.latitude,
    longitude: profile.longitude,
  });
  const arcanaCenter = calculateArcanaCenter(profile.birthDate);
  const reflectionContent =
    profile.language === "en"
      ? `As a soul with the ${lifePath.role} pattern, today can be a good time to choose one small step that feels aligned with your inner values. Notice what supports your energy, then let that become enough for today.`
      : `Sebagai jiwa dengan pola ${lifePath.role}, hari ini kamu bisa memilih satu langkah kecil yang lebih selaras dengan nilai batinmu. Perhatikan apa yang mendukung energimu, lalu biarkan itu cukup untuk hari ini.`;

  const blueprint = {
    lifePath,
    sunSign: {
      sign: sunSign,
    },
    natalChart,
    arcanaCenter: {
      number: arcanaCenter,
    },
    humanDesign: {
      type: null,
      profile: null,
      authority: null,
      strategy: null,
      notSelfTheme: null,
      signature: null,
      definedCenters: [],
      openCenters: [],
      gatesPersonality: [],
      gatesDesign: [],
      status: "pending",
      source: "human-design-py",
      note: "Human Design type has not been requested yet.",
    } as LocalHumanDesign,
    dailyReflection: {
      title: "Refleksi Diri",
      content: reflectionContent,
    },
  };

  return blueprint;
}

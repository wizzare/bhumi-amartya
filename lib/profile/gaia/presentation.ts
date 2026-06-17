import { BriefcaseBusiness, Brain, Heart, Leaf, MoonStar, Sparkles, type LucideIcon } from "lucide-react";
import type { GaiaTheme } from "./types";

export type GaiaSectionPresentation = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  color: string;
};

export const GAIA_SECTION_PRESENTATION: Record<GaiaTheme, GaiaSectionPresentation> = {
  shadow: { title: "Sisi Gelap", subtitle: "10 lapisan untuk disadari dan disembuhkan", icon: MoonStar, color: "bg-violet-50 text-violet-600" },
  talents: { title: "Talenta & Potensi", subtitle: "9 kekuatan alami dalam dirimu", icon: Brain, color: "bg-amber-50 text-amber-600" },
  energy: { title: "Energi & Keseimbangan", subtitle: "8 pembacaan ritme energi dan tubuh", icon: Leaf, color: "bg-emerald-50 text-emerald-600" },
  relationships: { title: "Relasi", subtitle: "9 pola saat kamu bertemu orang lain", icon: Heart, color: "bg-rose-50 text-rose-600" },
  career: { title: "Ekonomi & Karir", subtitle: "9 arah berkarya dan menciptakan nilai", icon: BriefcaseBusiness, color: "bg-blue-50 text-blue-600" },
  spirituality: { title: "Spiritualitas & Misi", subtitle: "8 lapisan arah perjalanan jiwa", icon: Sparkles, color: "bg-indigo-50 text-indigo-600" },
};

export function isGaiaTheme(value: string): value is GaiaTheme {
  return value in GAIA_SECTION_PRESENTATION;
}

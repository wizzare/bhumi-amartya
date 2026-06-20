import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { cleanMarkdown } from "@/lib/utils/markdown";

export interface DailyNoteSection {
  key?: string;
  title: string;
  icon?: string;
  main: string;
  advice?: string;
  isClosing?: boolean;
}

const SECTIONS_CONFIG = [
  { key: "general" as const, title: "Kabar Harimu", icon: "Compass" },
  { key: "mental" as const, title: "Pikiran", icon: "Brain" },
  { key: "finance" as const, title: "Rasa Aman & Rezeki", icon: "Wallet" },
  { key: "love" as const, title: "Hati", icon: "Heart" },
  { key: "relational" as const, title: "Orang Terdekat", icon: "Users" },
  { key: "spiritual" as const, title: "Makna Batin", icon: "Sparkles" },
  { key: "challenges" as const, title: "Yang Lagi Berat", icon: "ShieldAlert" },
  { key: "opportunities" as const, title: "Ruang Baru", icon: "Sprout" },
];

function ensureSentenceEnding(value: string): string {
  const clean = value.trim();
  if (!clean) return "";
  return /[.!?]$/.test(clean) ? clean : `${clean}.`;
}

export const DashboardNoteAdapter = {
  adapt(dailyGuidance: DailyGuidance | null): DailyNoteSection[] {
    if (!dailyGuidance?.categories) {
      return [];
    }

    const categories = dailyGuidance.categories;
    const sections: DailyNoteSection[] = [];

    // Map the 8 categories
    for (const config of SECTIONS_CONFIG) {
      const category = categories[config.key];
      if (!category) continue;

      const mainText = [category.insight, category.reason, category.reflection]
        .filter(Boolean)
        .join(" ");

      sections.push({
        key: config.key,
        title: config.title,
        icon: config.icon,
        main: ensureSentenceEnding(cleanMarkdown(mainText)),
        advice: category.advice ? ensureSentenceEnding(cleanMarkdown(category.advice)) : undefined,
      });
    }

    // Map the closing section if dailyNoteText is available
    if (dailyGuidance.dailyNoteText) {
      sections.push({
        key: "closing",
        title: "Pesan Penutup buat Kamu",
        icon: "Sprout",
        main: ensureSentenceEnding(cleanMarkdown(dailyGuidance.dailyNoteText)),
        isClosing: true,
      });
    }

    return sections;
  }
};

"use client";

import { useEffect, useState } from "react";
import { ShareCard } from "@/components/ui/ShareCard";
import { useAuth } from "@/context/AuthContext";
import { dailyGuidanceRepository } from "@/lib/repositories/dailyGuidanceRepository";
import { getLocalDateKey } from "@/lib/dailyGuidance/dateKey";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import { generateLocalDailyGuidance } from "@/lib/orchestrators/localDailyGuidanceFallback";
import type { DailyGuidanceInput } from "@/lib/orchestrators/types";
import { storageProvider } from "@/lib/storage/storageProvider";
import { ProfileRuntimeAdapter } from "@/lib/services/profileRuntimeAdapter";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import type { Blueprint } from "@/lib/types/blueprint";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import { profileToCoreIdentity, profileToDashboardUser } from "@/lib/mappers/userProfileMapper";
import { createDailyContentSeed } from "@/lib/dailyGuidance/dailyContentKey";

type LocalRecord = Record<string, unknown>;

function profileName(profile: LocalRecord): string {
  for (const key of ["fullName", "displayName", "name"]) {
    const value = profile[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "Penghuni Bhumi";
}

function readLocalManifestation(uid: string, dateKey: string): DailyGuidance["manifestation"] | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const candidateUids = Array.from(new Set([uid, "local_user", "null_uid", "undefined_uid", "local-user", "guest", ""])).filter((u) => u !== undefined);
    for (const u of candidateUids) {
      const stored = window.localStorage.getItem(`moana:manifestation:${u}:${dateKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed.affirmation === "string" && parsed.affirmation.trim()) return parsed;
      }
    }
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith("moana:manifestation:") && key.endsWith(`:${dateKey}`)) {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed.affirmation === "string" && parsed.affirmation.trim()) return parsed;
        }
      }
    }
  } catch {
    // Ignore local cache parse errors; share card can still use guidance fallback.
  }
  return undefined;
}

function buildLocalShareGuidance(params: {
  uid: string;
  dateKey: string;
  profile: Record<string, any>;
  blueprint: Record<string, any>;
}): DailyGuidance {
  const output = generateLocalDailyGuidance({
    user: profileToDashboardUser(params.profile),
    identity: profileToCoreIdentity(params.profile, params.blueprint as any),
    blueprint: params.blueprint as any,
    emotionalState: params.profile?.emotionalState || { currentMood: 5, recurringThemes: [] },
    emotionalMemory: params.profile?.emotionalMemory || { recurringThemes: [], recurringWounds: [] },
    healingProgress: params.profile?.healingProgress || { healingStreak: 0 },
    astrologyTransits: null,
    adaptiveContext: {
      dailyVariationSeed: createDailyContentSeed({
        uid: params.uid,
        localDateKey: params.dateKey,
        blueprint: params.blueprint,
      }),
      completionRateYesterday: 0,
      journalCompletedYesterday: false,
      meditationCompletedYesterday: false,
      audioCompletedYesterday: false,
      practiceCompletedCountYesterday: 0,
      streakDays: 0,
      adaptiveTone: "steady_supportive",
      previousProgressSummary: "Share card local fallback",
      previousGuidanceSummaries: [],
    },
    language: params.profile?.language === "en" ? "en" : "id",
    generatedAt: new Date().toISOString(),
  } satisfies DailyGuidanceInput);

  return {
    uid: params.uid,
    date: params.dateKey,
    localDateKey: params.dateKey,
    profileSnapshot: params.profile,
    blueprintSnapshot: params.blueprint,
    astrologyToday: "",
    previousProgressSummary: "",
    soulReflectionText: output.soulReflectionText || output.soulReflection.dailyMessage,
    dailyNoteText: output.dailyNoteText || output.companionReflection?.fullReflection || "",
    companionReflection: output.companionReflection,
    aiInsight: output.soulReflectionText || output.soulReflection.dailyMessage,
    journalPrompt: output.journalingPrompt.prompt,
    meditationSuggestion: output.meditationRecommendation.title,
    dailyPractices: [],
    emotionalFocus: output.soulReflection.theme,
    spiritualFocus: output.soulReflection.theme,
    groundedAction: output.soulReflection.guidance,
    manifestation: output.manifestation,
    categories: output.categories,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "local-fallback",
  } as DailyGuidance;
}

export function ProfileShareCardSection({ title }: { title: string }) {
  const auth = useAuth();
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const [name, setName] = useState("Penghuni Bhumi");
  const [profileSections, setProfileSections] = useState<ProfileSection[]>([]);
  const [dailyGuidance, setDailyGuidance] = useState<DailyGuidance | null>(null);
  const [dateKey, setDateKey] = useState("");
  useEffect(() => {
    async function load() {
      let [profile, blueprint] = await Promise.all([
        storageProvider.getUserProfile(),
        storageProvider.getUserBlueprint(),
      ]);
      if (auditUser && (!profile || !blueprint)) {
        const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
        profile = profile || getMockProfile(auditUser) as any;
        blueprint = blueprint || getMockBlueprint(auditUser) as any;
      }
      if (profile) {
        setName(profileName(profile as unknown as LocalRecord));
      }
      const timezone = (profile as LocalRecord | null)?.timezone;
      const today = getLocalDateKey(new Date(), typeof timezone === "string" ? timezone : Intl.DateTimeFormat().resolvedOptions().timeZone);
      setDateKey(today);
      const activeUid = auth?.user?.uid || (auditUser ? `${auditUser}_uid` : "");
      let guidance: DailyGuidance | null = null;
      if (activeUid) {
        guidance = await dailyGuidanceRepository.getDailyGuidance(activeUid, today).catch(() => null);
      }
      if (!guidance && profile && blueprint) {
        guidance = buildLocalShareGuidance({
          uid: activeUid || (profile as any)?.uid || "local_user",
          dateKey: today,
          profile: profile as Record<string, any>,
          blueprint: blueprint as Record<string, any>,
        });
      }
      const effectiveUid = activeUid || (profile as any)?.uid || "local_user";
      const localManifestation = readLocalManifestation(effectiveUid, today);
      if (localManifestation) {
        const baseGuidance = guidance || ({
          uid: effectiveUid,
          date: today,
          localDateKey: today,
          soulReflectionText: "",
          dailyNoteText: "",
        } as DailyGuidance);
        guidance = { ...baseGuidance, manifestation: localManifestation };
      }
      setDailyGuidance(guidance);
      if (blueprint) {
        const canonical = CanonicalTranslatorService.translate(blueprint as unknown as Blueprint);
        const meaning = HumanMeaningService.generate(canonical);
        setProfileSections(ProfileRuntimeAdapter.buildProfile(meaning));
      }
    }
    void load();
  }, [auth?.user?.uid, auditUser]);

  if (!profileSections.length) return null;

  return (
    <section className="space-y-5 pt-4">
      <header className="text-center">
        <h2 className="text-2xl font-serif text-[#4F5E52]">{title}</h2>
      </header>
      <ShareCard
        userName={name}
        profileSections={profileSections}
        dateKey={dateKey}
        userSeed={auth?.user?.uid ?? name}
        guidance={dailyGuidance}
      />
    </section>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AccessGuard } from "@/components/auth/AccessGuard";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { ProfileRuntimeAdapter } from "@/lib/services/profileRuntimeAdapter";
import type { ProfileSection, ProfileCard } from "@/lib/types/profileRuntime";
import type { Blueprint } from "@/lib/types/blueprint";
import { sanitizeNarrative } from "@/lib/profile/narrativeHumanizer";
import { buildArsipAkashiProfileViewModel } from "@/lib/arsipAkashi/profile/viewModel";
import { buildArsipAkashiInputFromProfile } from "@/lib/arsipAkashi/profile/inputBuilder";
import {
  applyArsipAkashiContentToV3Section,
  buildSoulLettersV3Section,
} from "@/lib/arsipAkashi/profile/v3ContentBridge";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sectionIntro(title: string) {
  if (title === "ASAL USUL & PERADABAN") {
    return "Bagian ini adalah refleksi simbolik dari sintesis peta dirimu. Ini bukan klaim literal tentang asal-usul atau peradaban masa lalu.";
  }

  return `Menyelami lebih dalam lapisan ${title.toLowerCase()}.`;
}

function humanize(text: string): string {
  if (!text) return "";

  const temp = text
    .replace(/related to/gi, "berhubungan dengan")
    .replace(/indicates/gi, "menunjukkan")
    .replace(/dominant energy/gi, "energi dominan")
    .replace(/synthesis/gi, "sintesis")
    .replace(/generated/gi, "disiapkan")
    .replace(/fallback/gi, "cadangan")
    .replace(/your type/gi, "tipe jiwamu")
    .replace(/your profile/gi, "profil jiwamu")
    .replace(/this profile/gi, "profil ini")
    .replace(/element means/gi, "elemen ini berarti")
    .replace(/metal means/gi, "elemen logam berarti")
    .replace(/energy type/gi, "tipe energi")
    .replace(/undefined/gi, "")
    .replace(/unknown/gi, "belum diketahui")
    .replace(/no data/gi, "data belum tersedia")
    .replace(/loading/gi, "memuat")
    // Technical Identity labels within explanations - softening them
    .replace(/Arcana Center/gi, "Pusat Arcana")
    .replace(/Human Design Type/gi, "Tipe Human Design")
    .replace(/Life Path/gi, "Jalan Hidup (Life Path)")
    // Indonesian-English mixed patterns
    .replace(/menunjukkan your/gi, "menunjukkan")
    .replace(/adalah related/gi, "berhubungan dengan")
    .replace(/energy yang/gi, "energi yang")
    .replace(/profile ini/gi, "profil ini")
    .replace(/type ini/gi, "tipe ini")
    .replace(/center kamu/gi, "pusat energimu")
    .replace(/\bHealth Chart\b/gi, "Peta Kesehatan");

  return sanitizeNarrative(temp);
}

function humanizeParagraphs(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => humanize(paragraph))
    .filter(Boolean)
    .join("\n\n");
}

function InsightCard({ card }: { card: ProfileCard }) {
  const [expanded, setExpanded] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const hasItems = Boolean(card.items?.length);

  return (
    <div className="bhumi-card bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#4F5E52]">{card.title}</h2>
            {!hasItems && (
              <button
                type="button"
                aria-expanded={expanded}
                onClick={() => setExpanded(!expanded)}
                className="mt-1 text-left text-[10px] font-bold uppercase tracking-widest text-[#9AA394]"
              >
                Lihat selengkapnya
              </button>
            )}
          </div>
        </div>
        {!hasItems && (
          <button
            type="button"
            aria-label={`${expanded ? "Tutup" : "Buka"} bacaan ${card.title}`}
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1E8] text-[#7B8776]"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      
      <div className="mt-4 space-y-4">
        {card.shortMeaning && (
          <p className="whitespace-pre-line text-sm font-medium leading-6 text-[#5E6A61]">{humanize(card.shortMeaning)}</p>
        )}

        {hasItems && (
          <div className="space-y-3 border-t border-[#E8E9E5] pt-4">
            {card.items?.map((item) => {
              const itemExpanded = expandedItem === item.title;

              return (
                <div key={item.title} className="rounded-xl bg-[#F8F6EF]">
                  <button
                    type="button"
                    aria-expanded={itemExpanded}
                    onClick={() => setExpandedItem(itemExpanded ? null : item.title)}
                    className="flex w-full items-center justify-between gap-4 p-4 text-left"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#4F5E52]">{item.title}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">
                        Lihat selengkapnya
                      </p>
                    </div>
                    {itemExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {itemExpanded && (
                    <div className="space-y-4 border-t border-[#E8E9E5] bg-white p-4">
                      {item.detailSections?.length ? item.detailSections.map((section) => (
                        <div key={section.title}>
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">{section.title}</p>
                          <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{humanizeParagraphs(section.body)}</p>
                        </div>
                      )) : (
                        <>
                          <div>
                            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">Pembacaan</p>
                            <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{humanizeParagraphs(item.expandableInsight)}</p>
                          </div>
                          {item.actionableReflection && (
                            <div className="rounded-xl bg-[#F8F6EF] p-4">
                              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">Refleksi Hari Ini</p>
                              <p className="whitespace-pre-line text-sm leading-6 text-[#5E6A61]">{humanize(item.actionableReflection)}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {!hasItems && expanded && (
          card.displayStyle === "soul-letter" ? (
            <div className="border-t border-[#E8E9E5] pt-4">
              <p className="whitespace-pre-line text-sm leading-6 text-[#5E6A61]">
                {humanizeParagraphs(card.expandableInsight)}
              </p>
            </div>
          ) : (
            <div className="space-y-4 border-t border-[#E8E9E5] pt-4">
              {card.detailSections?.length ? card.detailSections.map((detail) => (
                <div key={detail.title}>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[#9AA394]">{detail.title}</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{humanizeParagraphs(detail.body)}</p>
                </div>
              )) : <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Penjelasan Mendalam</p>
                <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{humanizeParagraphs(card.expandableInsight)}</p>
              </div>}
              {card.actionableReflection && !card.detailSections?.length && (
                <div className="rounded-xl bg-[#F8F6EF] p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Refleksi Praktis</p>
                  <p className="whitespace-pre-line text-sm leading-6 text-[#5E6A61]">{humanize(card.actionableReflection)}</p>
                </div>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function ProfileSectionClient({ section }: { section: string }) {
  const auditUser = process.env.NODE_ENV === "development" && typeof window !== "undefined"
    ? window.localStorage.getItem("bhumi_audit_user")
    : null;
  const [profileSection, setProfileSection] = useState<ProfileSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        let [profile, blueprint] = await Promise.all([
          storageProvider.getUserProfile(),
          storageProvider.getUserBlueprint(),
        ]);
        if (auditUser && (!profile || !blueprint)) {
          const { getMockProfile, getMockBlueprint } = await import("@/lib/dailyGuidance/auditMocks");
          profile = profile || getMockProfile(auditUser) as any;
          blueprint = blueprint || getMockBlueprint(auditUser) as any;
        }
        if (blueprint) {
          const soulIdentityAi = (profile as any)?.soulIdentityAi;
          const canonical = CanonicalTranslatorService.translate(blueprint as unknown as Blueprint);
          const meaning = HumanMeaningService.generate(canonical, soulIdentityAi);
          const sections = ProfileRuntimeAdapter.buildProfile(meaning);
          const aaInput = buildArsipAkashiInputFromProfile(
            profile ? { uid: (blueprint as any).uid, timezone: (profile as any)?.timezone, birthDate: (profile as any)?.birthDate, birthTime: (profile as any)?.birthTime } as any : null,
            blueprint as any,
          );
          const aaVM = buildArsipAkashiProfileViewModel(aaInput);

          if (section === "surat-jiwa") {
            setProfileSection(buildSoulLettersV3Section(aaVM));
            return;
          }

          const shellSection = sections.find((candidate) => slugify(candidate.title) === section);
          setProfileSection(
            shellSection
              ? applyArsipAkashiContentToV3Section(shellSection, aaVM)
              : null,
          );
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [auditUser, section]);

    return (
    <ProtectedRoute>
      <AccessGuard feature="profile">
        <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
          <AppNav />
          <div className="mx-auto max-w-lg">
            <BhumiPageHeader className="mb-8" />
            <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
              <ArrowLeft size={16} />Kembali ke Profil
            </Link>

            {loading ? (
              <p className="text-center text-[#7B8776]">Membuka bagian ini...</p>
            ) : profileSection ? (
              <>
                <header className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Sparkles size={28} />
                  </div>
                  <h1 className="text-3xl font-serif text-[#4F5E52]">{profileSection.title}</h1>
                  <p className="mt-3 text-sm leading-6 text-[#7B8776]">{sectionIntro(profileSection.title)}</p>
                </header>
                <div className="space-y-4">
                  {profileSection.cards.map((card, idx) => (
                    <InsightCard key={idx} card={card} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center text-[#7B8776]">Bagian ini belum tersedia.</p>
            )}
          </div>
        </main>
      </AccessGuard>
    </ProtectedRoute>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { storageProvider } from "@/lib/storage/storageProvider";
import { CanonicalTranslatorService } from "@/lib/services/canonicalTranslatorService";
import { HumanMeaningService } from "@/lib/services/humanMeaningService";
import { ProfileRuntimeAdapter } from "@/lib/services/profileRuntimeAdapter";
import type { ProfileSection, ProfileCard } from "@/lib/types/profileRuntime";
import type { Blueprint } from "@/lib/types/blueprint";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function sectionIntro(title: string) {
  if (title === "ASAL USUL & PERADABAN") {
    return "Bagian ini adalah refleksi simbolik dari sintesis peta dirimu. Ini bukan klaim literal tentang asal-usul atau peradaban masa lalu.";
  }

  return `Menyelami lebih dalam lapisan ${title.toLowerCase()}.`;
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
          <h2 className="text-base font-bold text-[#4F5E52]">{card.title}</h2>
        </div>
        {!hasItems && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F1E8] text-[#7B8776]"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
      
      <div className="mt-4 space-y-4">
        {card.shortMeaning && (
          <p className="whitespace-pre-line text-sm font-medium leading-6 text-[#5E6A61]">{card.shortMeaning}</p>
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
                    <p className="text-sm font-bold text-[#4F5E52]">{item.title}</p>
                    {itemExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {itemExpanded && (
                    <div className="space-y-4 border-t border-[#E8E9E5] bg-white p-4">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Pembacaan</p>
                        <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{item.expandableInsight}</p>
                      </div>
                      {item.actionableReflection && (
                        <div className="rounded-xl bg-[#F8F6EF] p-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Refleksi Hari Ini</p>
                          <p className="whitespace-pre-line text-sm leading-6 text-[#5E6A61]">{item.actionableReflection}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        
        {!hasItems && expanded && (
          <div className="space-y-4 border-t border-[#E8E9E5] pt-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Penjelasan Mendalam</p>
              <p className="whitespace-pre-line text-sm leading-6 text-[#7B8776]">{card.expandableInsight}</p>
            </div>
            {card.actionableReflection && (
              <div className="rounded-xl bg-[#F8F6EF] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#9AA394] mb-2">Refleksi Praktis</p>
                <p className="whitespace-pre-line text-sm leading-6 text-[#5E6A61]">{card.actionableReflection}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfileSectionClient({ section }: { section: string }) {
  const [profileSection, setProfileSection] = useState<ProfileSection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const blueprint = await storageProvider.getUserBlueprint();
        if (blueprint) {
          const canonical = CanonicalTranslatorService.translate(blueprint as unknown as Blueprint);
          const meaning = HumanMeaningService.generate(canonical);
          const sections = ProfileRuntimeAdapter.buildProfile(meaning);
          const found = sections.find((s) => slugify(s.title) === section);
          setProfileSection(found ?? null);
        }
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [section]);

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  );
}

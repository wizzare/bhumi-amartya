"use client";
/* eslint-disable @next/next/no-img-element -- html-to-image export waits on native image loading state. */

import React, { useMemo, useState, useRef } from "react";
import { Loader2, Share2 } from "lucide-react";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";
import { toPng } from "html-to-image";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { Capacitor } from "@capacitor/core";
import { Toast } from "@capacitor/toast";
import type { DailyGuidance } from "@/lib/dailyGuidance/types";
import type { ProfileSection } from "@/lib/types/profileRuntime";
import { createDailyShareCardContent } from "@/lib/profile/dailyShareCardEngine";
import type { GaiaInsight } from "@/lib/profile/gaia/types";

interface ShareCardProps {
  profileSections: ProfileSection[];
  dateKey: string;
  userSeed: string;
  guidance?: DailyGuidance | null;
  userName?: string;
  gaiaInsights?: GaiaInsight[];
}

const ornamentPath = "/share-card/ornaments";

async function waitForCardImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete && image.naturalWidth > 0) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error(`Asset gagal dimuat: ${image.src}`)), { once: true });
    });
  }));
  await document.fonts?.ready;
}

export function ShareCard({ profileSections, dateKey, userSeed, guidance, userName, gaiaInsights }: ShareCardProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const cardRef = useRef<HTMLDivElement>(null);

  const content = useMemo(() => createDailyShareCardContent({
    profileSections,
    dateKey: dateKey || new Date().toISOString().slice(0, 10),
    userSeed,
    guidance,
    gaiaInsights,
    now,
  }), [dateKey, profileSections, gaiaInsights, guidance, now, userSeed]);
  const shareDate = useMemo(() => new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date()), []);

  React.useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 30000);
    return () => window.clearInterval(interval);
  }, []);
  const handleShare = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      await waitForCardImages(cardRef.current);
      // Export DOM to image
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: "#FCFAF5",
        pixelRatio: 2, // Better quality
      });

      const fileName = `bhumi-amartya-${Date.now()}.png`;

      if (Capacitor.isNativePlatform()) {
        // Handle Capacitor (Android/iOS)
        const base64Data = dataUrl.split(",")[1];

        await Filesystem.writeFile({
          path: fileName,
          data: base64Data,
          directory: Directory.Documents, // Or Documents for broader access
        });

        await Toast.show({
          text: "Gambar berhasil disimpan. Kamu bisa cek di folder HP kamu ya.",
          duration: "long",
        });
      } else {
        // Handle Web/Browser fallback
        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();

        // Simple alert as fallback for web toast if not implemented globally
        alert("Gambar berhasil disimpan. Kamu bisa cek di folder HP kamu ya.");
      }
    } catch (error) {
      console.error("Export failed:", error);

      if (Capacitor.isNativePlatform()) {
        await Toast.show({
          text: "Gambar belum berhasil disimpan. Coba lagi sebentar ya.",
          duration: "short",
        });
      } else {
        alert("Gambar belum berhasil disimpan. Coba lagi sebentar ya.");
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div ref={cardRef} className="bg-[#FCFAF5] p-1"> {/* Wrapper to ensure padding/bg in export */}
          <article className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#F8F3E8] via-[#FCFAF5] to-[#E7EBDD] text-[#344A38] shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-16 -mt-16 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#9BB89A]/20 rounded-full -ml-24 -mb-24 blur-3xl" />
          <img src={`${ornamentPath}/flower-branch-left.svg`} alt="" className="pointer-events-none absolute -left-5 top-1 z-0 w-24 opacity-55" />
          <img src={`${ornamentPath}/leaf-top-left.svg`} alt="" className="pointer-events-none absolute -left-8 -top-8 z-0 w-28 opacity-70" />
          <img src={`${ornamentPath}/leaf-top-right.svg`} alt="" className="pointer-events-none absolute -right-8 -top-8 z-0 w-28 opacity-75" />
          <img src={`${ornamentPath}/leaf-bottom-left.svg`} alt="" className="pointer-events-none absolute -bottom-10 -left-8 z-0 w-28 opacity-65" />
          <img src={`${ornamentPath}/leaf-bottom-right.svg`} alt="" className="pointer-events-none absolute -bottom-10 -right-8 z-0 w-28 opacity-75" />
          <img src={`${ornamentPath}/gold-star.svg`} alt="" className="pointer-events-none absolute right-8 top-36 z-0 w-5 opacity-80" />

          <div className="relative z-10 flex flex-col p-4">
            <header className="text-center">
              <div className="mx-auto w-fit"><BhumiPageHeader /></div>
              <p className="mt-2 font-serif text-2xl leading-tight">{userName || "Penghuni Bhumi"}</p>
              <p className="mt-1 text-[9px] capitalize italic text-[#7B776D]">{shareDate}</p>
              <img src={`${ornamentPath}/gold-divider.svg`} alt="" className="mx-auto mt-2 h-4 w-36 object-contain" />
            </header>

            <section className="relative mt-3 min-h-40 overflow-hidden rounded-[1.25rem] border border-white bg-white/70 p-4 shadow-sm">
              <img src={`${ornamentPath}/journal-window.png`} alt="" className="pointer-events-none absolute -bottom-2 -right-5 w-[52%] opacity-95" />
              <div className="relative z-10 w-[62%]">
                <div className="flex items-center gap-1.5 text-[#A66D23]"><img src={`${ornamentPath}/small-leaf-icon.svg`} alt="" className="h-4 w-4" /><p className="text-[8px] font-bold uppercase tracking-[0.16em]">Refleksi Hari Ini</p></div>
                <img src={`${ornamentPath}/gold-divider.svg`} alt="" className="my-1 h-3 w-24 object-contain" />
                <p className="text-[8px] leading-[1.45] text-[#4F5E52]">{content.reflection}</p>
              </div>
            </section>

            <div className="mt-3 flex flex-col gap-2.5">
              <section className="rounded-[1.25rem] border border-white/80 bg-white/60 p-4 shadow-sm">
                <div className="flex items-center gap-1.5"><img src={`${ornamentPath}/small-leaf-icon.svg`} alt="" className="h-4 w-4 shrink-0" /><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#A66D23]">{content.catatanHariIni.label}</p></div>
                <p className="mt-2 text-[9px] leading-[1.5] text-[#4F5E52]">{content.catatanHariIni.content}</p>
              </section>
              <section className="rounded-[1.25rem] border border-white/80 bg-white/60 p-4 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5"><img src={`${ornamentPath}/small-leaf-icon.svg`} alt="" className="h-4 w-4 shrink-0" /><p className="text-[8px] font-bold uppercase tracking-[0.16em] text-[#A66D23]">Profil Hari Ini</p></div>
                    <p className="text-[8px] italic text-[#7B8776] mb-1.5">Satu bagian dari dirimu yang layak diamati hari ini.</p>
                    <h4 className="text-[11px] font-bold text-[#4F6658]">{content.profileInsight.label}</h4>
                  </div>
                  <span className="text-[7px] font-bold uppercase tracking-wider text-[#9BB89A] bg-white px-2 py-1 rounded-full border border-[#E8E9E5]/50">Lihat Detail</span>
                </div>
                <p className="mt-1.5 text-[9px] leading-[1.5] text-[#4F5E52]">{content.profileInsight.content}</p>
                {content.profileInsight.reflection && (
                  <div className="mt-2.5 pt-2.5 border-t border-white flex gap-2 items-start">
                    <span className="text-[8px] font-bold uppercase tracking-[0.15em] text-[#9AA394] mt-0.5 shrink-0">Refleksi</span>
                    <p className="text-[9px] italic text-[#4F6658] font-medium">&quot;{content.profileInsight.reflection}&quot;</p>
                  </div>
                )}
              </section>
            </div>

            <section className="mt-3 rounded-[1.5rem] border border-white bg-white/65 p-4 shadow-sm">
              <p className="text-center text-[9px] font-bold uppercase tracking-[0.18em] text-[#4F5E52]">{content.manifestation.label}</p>
              <p className="mt-3 text-center text-[10px] italic leading-[1.55] text-[#4F5E52]">&quot;{content.manifestation.content}&quot;</p>
            </section>

            <footer className="pt-4 text-center">
              <img src={`${ornamentPath}/gold-divider.svg`} alt="" className="mx-auto mb-2 h-4 w-44 object-contain" />
              <p className="font-serif text-[11px] font-semibold uppercase tracking-[0.25em] text-[#4F5E52]">Bhumi Amartya</p>
              <p className="mt-1 text-[9px] italic text-[#7B8776]">- {content.footerQuote} -</p>
            </footer>
          </div>
        </article>
      </div>

      <div className="px-1">
          <button
              onClick={handleShare}
              disabled={isExporting}
              className="w-full bg-[#4F5E52] text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-widest hover:bg-[#3F5146] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
          >
              {isExporting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Menyiapkan gambar...
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  Bagikan
                </>
              )}
          </button>
      </div>
    </div>
  );
}

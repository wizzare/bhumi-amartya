"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { storageProvider } from "@/lib/storage/storageProvider";
import { createProfileEcho, EchoChapter, EchoSection, getProfileChapter } from "@/lib/profile/echo";
import { BhumiPageHeader } from "@/components/ui/BhumiPageHeader";

function FeatureCard({ feature }: { feature: EchoSection }) {
  return (
    <article className="rounded-[2rem] border border-[#E8E9E5] bg-white p-7 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#9AA394]">{feature.title}</p>
      <p className="mt-4 leading-7 text-[#5F6B60]">{feature.summary}</p>
    </article>
  );
}

export default function ProfileDetailClient({ section }: { section: string }) {
  const [chapter, setChapter] = useState<EchoChapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const blueprint = await storageProvider.getUserBlueprint();
        if (blueprint) setChapter(getProfileChapter(createProfileEcho(blueprint), section));
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
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]"><ArrowLeft size={16} />Kembali ke Profil</Link>
          {loading ? <p className="text-center text-[#7B8776]">Membuka bagian ini...</p> : chapter ? (
            <>
              <header className="mb-8">
                <h1 className="text-4xl font-serif text-[#4F5E52]">{chapter.title}</h1>
                <p className="mt-3 leading-7 text-[#7B8776]">{chapter.summary}</p>
              </header>
              <div className="space-y-5">{chapter.features.map((feature) => <FeatureCard key={feature.id} feature={feature} />)}</div>
            </>
          ) : <p className="text-center text-[#7B8776]">Bagian ini belum tersedia.</p>}
        </div>
      </main>
    </ProtectedRoute>
  );
}

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AppNav } from "@/components/navigation/AppNav";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

interface IdentityField {
  label: string;
  icon: LucideIcon;
  color: string;
  background: string;
}

interface IdentityExpansionPageProps {
  eyebrow: string;
  title: string;
  description: string;
  heroIcon: LucideIcon;
  fields: IdentityField[];
}

export function IdentityExpansionPage({
  eyebrow,
  title,
  description,
  heroIcon: HeroIcon,
  fields,
}: IdentityExpansionPageProps) {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-32">
        <AppNav />
        <div className="mx-auto max-w-lg">
          <Link href="/profile" className="mb-8 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#7B8776]">
            <ArrowLeft size={16} />
            Kembali ke Profil
          </Link>

          <header className="mb-8">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4F5E52] text-white">
              <HeroIcon size={25} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9AA394]">{eyebrow}</p>
            <h1 className="mt-2 text-4xl font-serif text-[#4F5E52]">{title}</h1>
            <p className="mt-3 leading-7 text-[#7B8776]">{description}</p>
          </header>

          <div className="space-y-6">
            <div className="grid gap-4">
              {fields.map(({ label, icon: Icon, color, background }) => (
                <section key={label} className="rounded-2xl border border-[#E8E1D3] bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${background} ${color}`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-[#9AA394]">{label}</h2>
                      <p className="mt-1 text-lg font-serif font-bold text-[#4F5E52]">Belum tersedia</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>

            <section className="mt-10 rounded-2xl bg-[#4F5E52] p-6 text-white shadow-md">
              <div className="mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#D4AF37]" />
                <h2 className="text-lg font-bold">Kesimpulan</h2>
              </div>
              <p className="text-sm leading-relaxed text-[#D2D8D0]">
                Blueprint sedang dipersiapkan pada versi Kara.
              </p>
            </section>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}

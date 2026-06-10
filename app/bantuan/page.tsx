"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";

export default function BantuanPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52] pb-32">
      <AppNav />
      <section className="mx-auto max-w-3xl bhumi-card p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Bantuan
        </p>
        <h1 className="mt-3 text-4xl font-serif">Pusat Bantuan</h1>
        <div className="mt-8 space-y-8 text-[#7B8776] leading-relaxed text-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">Apa itu Blueprint Jiwa?</h2>
            <p className="mt-2">Peta yang merangkum potensi energimu berdasarkan data kelahiran, membantu kamu memahami cara terbaik untuk berinteraksi dengan dunia.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">Cara Melakukan Journaling</h2>
            <p className="mt-2">Gunakan fitur Jurnal harian untuk menjawab pertanyaan reflektif yang disesuaikan dengan profil batinmu.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">Bagaimana jika data saya salah?</h2>
            <p className="mt-2">Kamu bisa menghapus dan menghitung ulang Blueprint melalui menu Pengaturan &gt; Zona Bahaya.</p>
          </div>

          <div className="pt-6 border-t border-[#4F5E52]/10">
            <p>Butuh bantuan lebih lanjut? Hubungi kami di <span className="font-medium">hello@wedhaswara.my.id</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}

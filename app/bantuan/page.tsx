"use client";

import React from "react";
import { AppNav } from "@/components/navigation/AppNav";
import { isEnlEdition } from "@/lib/config/edition";

export default function BantuanPage() {
  const isEn = isEnlEdition();
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52] pb-32">
      <AppNav />
      <section className="mx-auto max-w-3xl bhumi-card p-10">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          {isEn ? "Help" : "Bantuan"}
        </p>
        <h1 className="mt-3 text-4xl font-serif">{isEn ? "Help Center" : "Pusat Bantuan"}</h1>
        <div className="mt-8 space-y-8 text-[#7B8776] leading-relaxed text-sm">
          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">{isEn ? "What is a Soul Blueprint?" : "Apa itu Blueprint Jiwa?"}</h2>
            <p className="mt-2">{isEn ? "A map that summarizes your energetic potential based on your birth data, helping you understand the best way to interact with the world." : "Peta yang merangkum potensi energimu berdasarkan data kelahiran, membantu kamu memahami cara terbaik untuk berinteraksi dengan dunia."}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">{isEn ? "How to Practice Journaling" : "Cara Melakukan Journaling"}</h2>
            <p className="mt-2">{isEn ? "Use the daily Journal feature to answer reflective questions tailored to your inner profile." : "Gunakan fitur Jurnal harian untuk menjawab pertanyaan reflektif yang disesuaikan dengan profil batinmu."}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-[#4F5E52]">{isEn ? "What if my birth data is incorrect?" : "Bagaimana jika data saya salah?"}</h2>
            <p className="mt-2">{isEn ? (
              <>You can reset and recalculate your Blueprint via Settings &gt; Danger Zone.</>
            ) : (
              <>Kamu bisa menghapus dan menghitung ulang Blueprint melalui menu Pengaturan &gt; Zona Bahaya.</>
            )}</p>
          </div>

          <div className="pt-6 border-t border-[#4F5E52]/10">
            <p>{isEn ? "Need further help? Contact us at" : "Butuh bantuan lebih lanjut? Hubungi kami di"} <span className="font-medium">hello@wedhaswara.my.id</span></p>
          </div>
        </div>
      </section>
    </main>
  );
}

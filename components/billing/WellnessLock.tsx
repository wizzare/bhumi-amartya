"use client";

import { AppNav } from "@/components/navigation/AppNav";

export function WellnessLock() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-24">
      <AppNav />
      <div className="mx-auto max-w-3xl">
        <section className="bhumi-card p-8 text-center">
          <h1 className="text-3xl font-semibold text-[#4F5E52]">Akses Bhumi kamu perlu diperbarui.</h1>
          <p className="mt-4 leading-relaxed text-[#7B8776]">
            Kami sedang menyiapkan akses berikutnya. Untuk saat ini, kembali ke Dashboard dan lanjutkan bagian yang tersedia.
          </p>
          <button type="button" onClick={() => window.location.href = "/dashboard"} className="bhumi-button mt-6 w-full sm:w-auto">
            Kembali ke Dashboard
          </button>
        </section>
      </div>
    </main>
  );
}

"use client";

import { AppNav } from "@/components/navigation/AppNav";
import { useRouter } from "next/navigation";
import { isEnlEdition } from "@/lib/config/edition";

export function WellnessLock() {
  const router = useRouter();
  const isEn = isEnlEdition();

  return (
    <main className="min-h-screen bg-[#FCFAF5] px-5 py-8 pb-24">
      <AppNav />
      <div className="mx-auto max-w-3xl">
        <section className="bhumi-card p-8 text-center bg-white rounded-3xl border border-[#E8E9E5] shadow-sm">
          <h1 className="text-3xl font-semibold text-[#4F5E52]">
            {isEn ? "Your Bhumi access needs to be renewed." : "Akses Bhumi kamu perlu diperbarui."}
          </h1>
          <p className="mt-4 leading-relaxed text-[#7B8776] mb-8">
            {isEn
              ? "We're preparing the next level of access. For now, return to the Dashboard and continue with the available sections."
              : "Kami sedang menyiapkan akses berikutnya. Untuk saat ini, kembali ke Dashboard dan lanjutkan bagian yang tersedia."}
          </p>
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <button
              type="button"
              onClick={() => router.replace("/dashboard")}
              className="w-full rounded-2xl bg-[#4F5E52] px-5 py-4 text-sm font-bold text-white transition-colors hover:bg-[#3D4A3F]"
            >
              {isEn ? "Back to Dashboard" : "Kembali ke Dashboard"}
            </button>
            <button
              type="button"
              onClick={() => router.replace("/premium-bhumi")}
              className="w-full rounded-2xl border border-[#4F5E52] px-5 py-4 text-sm font-bold text-[#4F5E52] bg-white transition-colors hover:bg-[#F2F4F0]"
            >
              {isEn ? "View Premium Bhumi" : "Buka Premium Bhumi"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

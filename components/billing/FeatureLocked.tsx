"use client";

import { useRouter } from "next/navigation";
import { isEnlEdition } from "@/lib/config/edition";

export function FeatureLocked() {
  const router = useRouter();
  const isEn = isEnlEdition();

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
      <section className="w-full max-w-md rounded-3xl border border-[#E8E9E5] bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-[#4F5E52] mb-4">
          {isEn ? "Your Bhumi access needs to be renewed." : "Akses Bhumi kamu perlu diperbarui."}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[#7B8776] mb-8">
          {isEn
            ? "We're preparing the next step so your journey still feels safe and comfortable."
            : "Kami sedang menyiapkan langkah berikutnya agar perjalananmu tetap terasa aman dan nyaman."}
        </p>
        <div className="flex flex-col gap-3">
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
    </main>
  );
}

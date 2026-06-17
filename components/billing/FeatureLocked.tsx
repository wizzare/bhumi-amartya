"use client";

export function FeatureLocked() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
      <section className="w-full max-w-md rounded-3xl border border-[#E8E9E5] bg-white p-8 text-center shadow-xl">
        <h1 className="text-2xl font-semibold text-[#4F5E52]">Akses Bhumi kamu perlu diperbarui.</h1>
        <p className="mt-4 text-sm leading-relaxed text-[#7B8776]">
          Kami sedang menyiapkan langkah berikutnya agar perjalananmu tetap terasa aman dan nyaman.
        </p>
        <button type="button" onClick={() => window.location.href = "/dashboard"} className="mt-6 w-full rounded-full bg-[#4F5E52] px-5 py-3 text-sm font-medium text-white hover:bg-[#3D4A3F]">
          Kembali ke Dashboard
        </button>
      </section>
    </main>
  );
}

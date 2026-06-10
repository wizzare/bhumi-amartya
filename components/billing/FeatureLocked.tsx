"use client";

export function FeatureLocked() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FCFAF5] px-6">
      <section className="w-full max-w-md rounded-3xl border border-[#E8E9E5] bg-white p-8 shadow-xl">
        <p className="text-xl font-semibold text-[#4F5E52]">🔒 Masa percobaan Bhumi telah berakhir.</p>
        <p className="mt-3 text-sm leading-relaxed text-[#7B8776]">Perjalanan mengenal diri tidak berhenti di sini.</p>
        <p className="mt-5 text-sm font-medium text-[#4F5E52]">Lanjutkan akses:</p>
        <ul className="mt-2 space-y-1 text-sm text-[#7B8776]">
          <li>• Journal</li>
          <li>• Meditation</li>
          <li>• Audio Healing</li>
          <li>• Journey</li>
          <li>• Weekly Report</li>
          <li>• Healing Memory</li>
        </ul>
        <div className="mt-6 rounded-2xl bg-[#F7F8F5] p-4">
          <p className="text-sm font-semibold text-[#4F5E52]">Bhumi Pro</p>
          <p className="mt-1 text-sm text-[#7B8776]">Rp50.000/bulan</p>
        </div>
        <button
          type="button"
          onClick={() => window.location.href = '/dashboard'}
          className="mt-6 w-full rounded-full bg-[#4F5E52] px-5 py-3 text-sm font-medium text-white hover:bg-[#3D4A3F]"
        >
          Kembali ke Dashboard
        </button>
      </section>
    </main>
  );
}


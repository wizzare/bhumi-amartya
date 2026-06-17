import { APP_VERSION, RELEASE_NAME } from "@/src/lib/version";

const releasedFeatures = [
  "Astro personal dengan Tema Kolektif, Menyentuh Dirimu, dan Yang Bisa Dilakukan",
  "Share Card harian dengan Refleksi, Saran Bhumi, insight Profile, dan Manifestasi",
  "Struktur final Journey, Kenali Diri, dan Profile",
  "Founder Dashboard khusus halaman Admin",
  "Gentle Night Reminder pukul 21.00",
  "Akses evaluasi tester tanpa paywall hingga 1 Juli 2026",
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Changelog
        </p>
        <h1 className="mt-3 text-4xl">{RELEASE_NAME}</h1>
        <p className="mt-2 text-[#7B8776]">Versi {APP_VERSION}</p>
        <ul className="mt-8 space-y-3">
          {releasedFeatures.map((feature) => (
            <li
              key={feature}
              className="rounded-lg border border-[#4F5E52]/10 bg-white/50 px-4 py-3 text-lg shadow-sm"
            >
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}

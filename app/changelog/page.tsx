const releasedFeatures = [
  "Blueprint Core Identity",
  "Human Design local fallback",
  "Daily Guidance (AI & Fallback)",
  "Journaling Module",
  "Meditation Module",
  "Audio Healing Player",
  "Account Deletion Flow",
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Changelog
        </p>
        <h1 className="mt-3 text-4xl">Versi 0.1.0</h1>
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

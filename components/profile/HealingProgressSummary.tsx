type HealingProgressSummaryProps = {
  healingStreak: number;
  journalEntriesCount: number;
  lastEmotionalCheckIn: string | null;
  currentHealingPhase: string;
};

function formatDate(value: string | null) {
  if (!value) return "Belum ada check-in";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function HealingProgressSummary({
  healingStreak,
  journalEntriesCount,
  lastEmotionalCheckIn,
  currentHealingPhase,
}: HealingProgressSummaryProps) {
  const items = [
    ["Healing streak", `${healingStreak} hari`],
    ["Journal entries", `${journalEntriesCount} catatan`],
    ["Last emotional check-in", formatDate(lastEmotionalCheckIn)],
    ["Current healing phase", currentHealingPhase],
  ];

  return (
    <section className="bhumi-card p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7B8776]">
          Healing Progress
        </p>
        <h2 className="mt-2 text-2xl text-[#4F5E52]">Jejak lembut perjalananmu</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-black/5 bg-[#FCFAF5] p-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B9488]">
              {label}
            </p>
            <p className="mt-2 text-lg text-[#33413A]">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

type BlueprintSummaryProps = {
  birthDate?: string;
  birthTime?: string;
  birthCity?: string;
  lifePath?: number;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
  humanDesignType?: string;
  arcanaCenter?: number;
};

const emptyValue = "Belum tersedia";

export function BlueprintSummary({
  birthDate,
  birthTime,
  birthCity,
  lifePath,
  sunSign,
  moonSign,
  risingSign,
  humanDesignType,
  arcanaCenter,
}: BlueprintSummaryProps) {
  const items = [
    ["Birth date", birthDate],
    ["Birth time", birthTime],
    ["Birth city", birthCity],
    ["Life path", lifePath],
    ["Sun sign", sunSign],
    ["Moon sign", moonSign],
    ["Rising sign", risingSign],
    ["Human Design type", humanDesignType],
    ["Arcana center", arcanaCenter],
  ];

  return (
    <section className="bhumi-card p-6 sm:p-8">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-[0.22em] text-[#7B8776]">
          Blueprint Summary
        </p>
        <h2 className="mt-2 text-2xl text-[#4F5E52]">Peta dasar jiwamu</h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-3xl border border-black/5 bg-white/70 p-4"
          >
            <p className="text-xs uppercase tracking-[0.18em] text-[#8B9488]">
              {label}
            </p>
            <p className="mt-2 text-lg text-[#33413A]">
              {value || emptyValue}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

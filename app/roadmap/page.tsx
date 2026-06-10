const roadmap = [
  {
    phase: "Now",
    items: ["MVP Launch", "User Pertama"],
  },
  {
    phase: "Next",
    items: ["Login", "Database", "Feedback"],
  },
  {
    phase: "Future",
    items: ["Marketplace Data", "Integrasi Pembayaran", "Export", "Analytics"],
  },
];

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
          Product Roadmap
        </p>
        <h1 className="mt-3 text-4xl">Roadmap</h1>
        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {roadmap.map((group) => (
            <div
              key={group.phase}
              className="rounded-lg border border-[#4F5E52]/10 bg-white/50 p-5 shadow-sm"
            >
              <h2 className="text-2xl">{group.phase}</h2>
              <ul className="mt-5 space-y-3 text-[#7B8776]">
                {group.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

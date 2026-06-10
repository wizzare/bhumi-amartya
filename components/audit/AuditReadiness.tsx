const auditItems = [
  {
    label: "Route tersedia",
    status: "OK",
    detail: "Route publik dan dashboard utama tersedia.",
  },
  {
    label: "Sidebar tersedia",
    status: "OK",
    detail: "Navigasi aplikasi tersedia untuk area utama.",
  },
  {
    label: "Footer tersedia",
    status: "OK",
    detail: "Footer versi tampil secara global.",
  },
  {
    label: "Pricing tersedia",
    status: "OK",
    detail: "Halaman pricing publik tersedia.",
  },
];

export default function AuditReadiness() {
  return (
    <section className="w-full max-w-4xl">
      <h2 className="mb-4 text-2xl text-[#4F5E52]">Audit Readiness</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {auditItems.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[#4F5E52]/10 bg-white/50 p-4 shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-base text-[#4F5E52]">{item.label}</h3>
              <span className="rounded-full bg-[#7D977B]/15 px-3 py-1 text-xs font-semibold text-[#4F5E52]">
                {item.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-[#7B8776]">{item.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

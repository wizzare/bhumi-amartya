import AuditReadiness from "@/components/audit/AuditReadiness";
import { APP_VERSION, LAST_UPDATED, RELEASE_NAME } from "@/src/lib/version";

const statusItems = [
  ["Build Status", "Ready"],
  ["Version", `${APP_VERSION} ${RELEASE_NAME}`],
  ["Last Update", LAST_UPDATED],
  ["Environment", "Internal Testing"],
  ["Version Code", "45"],
  ["Release", "BHUMI V3 FANTA"],
];

const activeFeatures = [
  "Dashboard Harian",
  "Astro Personal",
  "Kenali Diri",
  "Journey",
  "Profile Lima Bagian",
  "Share Cards",
  "Innerwork dan Manifestasi",
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-[#FCFAF5] px-6 py-16 text-[#4F5E52]">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <header>
          <p className="text-sm uppercase tracking-[0.24em] text-[#7B8776]">
            Production Readiness
          </p>
          <h1 className="mt-3 text-4xl">Status</h1>
        </header>

        <section className="grid gap-3 md:grid-cols-2">
          {statusItems.map(([label, value]) => (
            <div
              key={label}
              className="rounded-lg border border-[#4F5E52]/10 bg-white/50 p-4 shadow-sm"
            >
              <p className="text-sm text-[#7B8776]">{label}</p>
              <p className="mt-1 text-xl text-[#4F5E52]">{value}</p>
            </div>
          ))}
        </section>

        <section>
          <h2 className="mb-4 text-2xl">Fitur Aktif</h2>
          <div className="flex flex-wrap gap-2">
            {activeFeatures.map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-[#7D977B]/30 bg-[#7D977B]/10 px-4 py-2 text-sm text-[#4F5E52]"
              >
                {feature}
              </span>
            ))}
          </div>
        </section>

        <AuditReadiness />
      </div>
    </main>
  );
}

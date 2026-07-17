import type { ZiWeiPalace } from "@/lib/zi-wei/types";
import type { ZiWeiSection } from "@/lib/zi-wei/presentation";

const GRID_POSITIONS: Record<number, string> = {
  5: "col-start-1 row-start-1", 6: "col-start-2 row-start-1", 7: "col-start-3 row-start-1", 8: "col-start-4 row-start-1",
  4: "col-start-1 row-start-2", 9: "col-start-4 row-start-2", 3: "col-start-1 row-start-3", 10: "col-start-4 row-start-3",
  2: "col-start-1 row-start-4", 1: "col-start-2 row-start-4", 0: "col-start-3 row-start-4", 11: "col-start-4 row-start-4",
};

export function TwelvePalaceChart({ palaces, interpretations }: { palaces: ZiWeiPalace[]; interpretations: ZiWeiSection[] }) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="grid min-w-[760px] grid-cols-4 grid-rows-4 gap-2" aria-label="Twelve Palace Chart">
        {palaces.map((palace) => {
          const interpretation = interpretations.find((item) => item.id === `palace-${palace.key}`);
          return (
          <article key={palace.index} className={`${GRID_POSITIONS[palace.index] ?? ""} min-h-40 rounded-2xl border border-[#E5DDCF] bg-white p-4 shadow-sm`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-bold text-[#4F5E52]">{palace.name}</h3>
              {palace.isBodyPalace && <span className="rounded-full bg-[#E8EFE8] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#4F5E52]">Body</span>}
            </div>
            <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#9AA394]">{palace.heavenlyStem} · {palace.earthlyBranch}</p>
            <p className="mt-3 text-sm font-semibold leading-5 text-[#4F5E52]">{palace.majorStars.map((star) => star.canonicalName).join(" · ") || "Tanpa Major Star"}</p>
            {palace.supportingStars.length > 0 && <p className="mt-2 text-xs leading-5 text-[#7B8776]">{palace.supportingStars.slice(0, 4).map((star) => star.canonicalName).join(" · ")}</p>}
            {palace.majorStars.some((star) => star.transformation) && (
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[#A6782B]">
                {palace.majorStars.filter((star) => star.transformation).map((star) => `${star.canonicalName} ${star.transformation}`).join(" · ")}
              </p>
            )}
            {interpretation && <details className="group mt-3 border-t border-[#F3EFE6] pt-2">
              <summary className="cursor-pointer list-none text-xs font-bold text-[#4F5E52]"><span className="group-open:hidden">Lihat makna</span><span className="hidden group-open:inline">Tutup makna</span></summary>
              <div className="mt-2 space-y-2 text-xs leading-5 text-[#7B8776]">
                {interpretation.humanMeaning.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {interpretation.challenge && <p><span className="font-bold text-[#4F5E52]">Yang perlu dijaga:</span> {interpretation.challenge.replace(/^Yang perlu dijaga adalah\s*/i, "")}</p>}
                {interpretation.growthDirection && <p><span className="font-bold text-[#4F5E52]">Arah pertumbuhan:</span> {interpretation.growthDirection}</p>}
              </div>
            </details>}
          </article>
          );
        })}
        <div className="col-start-2 col-end-4 row-start-2 row-end-4 flex flex-col items-center justify-center rounded-3xl bg-[#4F5E52] p-6 text-center text-white">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C7D0C6]">Zi Wei Dou Shu</p>
          <p className="mt-3 font-serif text-2xl">Twelve Palace Chart</p>
          <p className="mt-2 max-w-xs text-xs leading-5 text-[#D7DDD5]">Istana dibaca sebagai satu struktur yang saling terhubung.</p>
        </div>
      </div>
    </div>
  );
}

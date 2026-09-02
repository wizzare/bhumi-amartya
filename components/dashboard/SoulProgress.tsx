"use client";

// R-PRD-18 / R-XC-02: progress without streak pressure — `daysActive` is a plain
// count of gentle activity days, never a consecutive-day run to keep alive.
interface SoulProgressProps {
  daysActive: number;
  consciousnessLevel: number;
}

export function SoulProgress({
  daysActive,
  consciousnessLevel,
}: SoulProgressProps) {
  return (
    <div className="mt-6 bhumi-card p-6">
      <p className="text-[#7B8776]">📈 Soul Progress</p>

      <div className="mt-5 space-y-4">
        <div>
          <div className="flex justify-between items-center">
            <p className="text-[#4F5E52] font-semibold">Hari aktif</p>
            <p className="text-2xl font-bold text-[#9BB89A]">
              {daysActive} hari
            </p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="text-[#4F5E52] font-semibold">
              Consciousness Level
            </p>
            <p className="text-2xl font-bold text-[#9BB89A]">
              {consciousnessLevel}%
            </p>
          </div>
          <div className="w-full bg-[#E8EBE6] rounded-full h-3">
            <div
              className="bg-[#9BB89A] h-3 rounded-full transition-all duration-500"
              style={{ width: `${consciousnessLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}

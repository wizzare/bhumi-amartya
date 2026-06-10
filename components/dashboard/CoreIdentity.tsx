"use client";

interface CoreIdentityProps {
  lifePath?: string | number;
  lifePathRole?: string;
  arcanaCenter?: number;
  sunSign?: string;
  humanDesign?: {
    type?: string | null;
    status?: string | null;
  } | null;
  labels: {
    title: string;
    lifePath: string;
    arcanaCenter: string;
    sunSign: string;
    humanDesign: string;
    humanDesignPending: string;
    humanDesignNeedsTimezone?: string;
  };
}

const Stat = ({ label, value, subValue }: { label: string; value?: string | number; subValue?: string }) => (
  <div className="flex flex-col items-center justify-center p-3 min-h-[110px] border border-[#E8E9E5]/60 rounded-3xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
    <p className="text-base sm:text-lg font-bold text-[#4F6658] leading-tight text-center w-full break-words">
      {value || "..."}
    </p>
    {subValue && <p className="text-[10px] text-[#3C3C3C] mt-1.5 text-center leading-tight font-semibold opacity-80">{subValue}</p>}
    <p className="text-[9px] text-[#7B8776] mt-auto pt-3 text-center uppercase tracking-[0.15em] font-bold">{label}</p>
  </div>
);

export function CoreIdentity({
  lifePath,
  lifePathRole,
  arcanaCenter,
  sunSign,
  humanDesign,
  labels,
}: CoreIdentityProps) {
  const isVerified = humanDesign?.status === "ready" || humanDesign?.status === "verified";
  let humanDesignValue = isVerified ? humanDesign?.type : null;

  if (!humanDesignValue) {
    if (humanDesign?.status === "needs_verified_timezone") {
      humanDesignValue = labels.humanDesignNeedsTimezone || "Butuh Zona Waktu";
    } else {
      humanDesignValue = labels.humanDesignPending;
    }
  }

  return (
    <div className="mt-8 bhumi-card p-6 bg-[#FCFAF5]/50 shadow-none border-dashed">
      <h2 className="text-center text-[10px] font-bold text-[#7B8776] mb-5 uppercase tracking-[0.25em]">
        {labels.title}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Stat label={labels.lifePath} value={lifePath} subValue={lifePathRole} />
        <Stat label={labels.sunSign} value={sunSign} />
        <Stat label={labels.arcanaCenter} value={arcanaCenter} />
        <Stat label={labels.humanDesign} value={humanDesignValue} />
      </div>
    </div>
  );
}

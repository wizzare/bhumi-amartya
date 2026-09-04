"use client";

import { getHdState } from "@/lib/humandesign/hdState";
import { isRecognizedHumanDesignType } from "@/lib/humandesign/hdAudit";
import type { HumanDesignChart } from "@/lib/humandesign/types";

interface CoreIdentityProps {
  lifePath?: string | number;
  lifePathRole?: string;
  arcanaCenter?: number;
  sunSign?: string;
  humanDesign?: Partial<HumanDesignChart> | null;
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
      {value || "Belum tersedia"}
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
  const hdState = getHdState(humanDesign);
  const humanDesignType = hdState.type === "Manifesting Generator" ? "ManGen" : hdState.type;

  // Build 106 hotfix: an existing user whose stored Human Design carries a
  // recognizable type MUST converge to a resolved identity here — never a
  // perpetual "menghitung ulang" / "Menghitung..." primary value. The
  // canonical-accuracy path (remote Gaia engine promoting to CANONICAL, its
  // background retry, and the /blueprint/human-design detail view) is unchanged;
  // this only stops the dashboard tile from stranding recoverable data.
  const humanDesignPresentation = (() => {
    // Any usable stored type resolves the tile — a recognized type, or (for a
    // settled canonical/historical record) whatever label the engine stored.
    if (isRecognizedHumanDesignType(hdState.type)) {
      return { value: humanDesignType as string };
    }
    if (hdState.type && (hdState.state === "CANONICAL" || hdState.state === "FALLBACK_LABELED")) {
      return { value: humanDesignType as string };
    }
    if (hdState.state === "PENDING") {
      return {
        value: hdState.reason === "needs_verified_timezone"
          ? labels.humanDesignNeedsTimezone || labels.humanDesignPending
          : labels.humanDesignPending,
        subValue: "Perhitungan sedang berlangsung",
      };
    }
    return {
      value: "Belum tersedia",
      subValue: "Data Human Design belum dapat dihitung.",
    };
  })();

  return (
    <div className="mt-8 bhumi-card p-6 bg-[#FCFAF5]/50 shadow-none border-dashed">
      <h2 className="text-center text-[10px] font-bold text-[#7B8776] mb-5 uppercase tracking-[0.25em]">
        {labels.title}
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <Stat label={labels.lifePath} value={lifePath} subValue={lifePathRole} />
        <Stat label={labels.sunSign} value={sunSign} />
        <Stat label={labels.arcanaCenter} value={arcanaCenter} />
        <Stat label={labels.humanDesign} {...humanDesignPresentation} />
      </div>
    </div>
  );
}

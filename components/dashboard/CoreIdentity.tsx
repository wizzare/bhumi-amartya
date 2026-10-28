"use client";

import React from "react";
import Link from "next/link";
import { HdStoredStatus } from "@/components/blueprint/HdStoredStatus";
import { getHdState } from "@/lib/humandesign/hdState";
import { isRecognizedHumanDesignType } from "@/lib/humandesign/hdAudit";
import type { HumanDesignChart } from "@/lib/humandesign/types";

interface CoreIdentityProps {
  lifePath?: string | number;
  lifePathRole?: string;
  arcanaCenter?: number | string;
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
    unavailable?: string;
    calculatingInProgress?: string;
    cannotCalculate?: string;
  };
  subtitle?: string;
  loading?: boolean;
  uid?: string;
}

interface IdentityCardProps {
  label: string;
  value?: string | number;
  subValue?: string;
  href?: string;
  fallback?: string;
  badge?: React.ReactNode;
  statusDot?: "green" | "yellow" | "none";
  loading?: boolean;
  testId?: string;
}

const IdentityCard: React.FC<IdentityCardProps> = ({
  label,
  value,
  subValue,
  href,
  fallback = "Belum tersedia",
  badge,
  statusDot = "none",
  loading = false,
  testId,
}) => {
  const isAvailable = Boolean(value !== undefined && value !== null && value !== "" && value !== 0 && value !== "0");
  const displayValue = isAvailable ? String(value) : fallback;

  const cardContent = (
    <>
      {/* Top Header: Label + Optional Badge */}
      <div className="flex items-center justify-between gap-1 w-full">
        <span className="text-[10px] sm:text-[11px] font-semibold text-[#5F6B5E] tracking-wider uppercase truncate">
          {label}
        </span>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {/* Middle: Prominent Value or Skeleton */}
      <div className="my-auto py-1.5 w-full min-w-0">
        {loading ? (
          <div className="h-7 w-20 bg-[#F0EDE6] rounded-md animate-pulse my-1" />
        ) : isAvailable ? (
          <p className="text-xl sm:text-2xl font-serif font-semibold text-[#2D352E] leading-tight truncate">
            {displayValue}
          </p>
        ) : (
          <p className="text-sm sm:text-base font-sans font-medium text-[#8F998C] leading-snug truncate">
            {fallback}
          </p>
        )}
      </div>

      {/* Bottom: Context / Subtitle / Indicator */}
      <div className="w-full min-w-0 flex items-center gap-1.5 pt-0.5">
        {loading ? (
          <div className="h-3.5 w-16 bg-[#F0EDE6] rounded animate-pulse" />
        ) : (
          <>
            {statusDot === "green" && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-[#4F6658] shrink-0"
                aria-hidden="true"
              />
            )}
            {statusDot === "yellow" && (
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4A373] shrink-0"
                aria-hidden="true"
              />
            )}
            {subValue && (
              <span className="text-[11px] sm:text-xs text-[#5F6B5E] font-medium truncate">
                {subValue}
              </span>
            )}
          </>
        )}
      </div>
    </>
  );

  const baseClasses =
    "flex flex-col justify-between p-3.5 sm:p-4 rounded-[20px] bg-white border border-[#E8E9E5] shadow-[0_2px_8px_rgba(0,0,0,0.03)] min-h-[128px] sm:min-h-[136px] overflow-hidden text-left";

  if (href) {
    return (
      <Link
        href={href}
        data-testid={testId}
        className={`${baseClasses} hover:shadow-md hover:border-[#D5D0C5] active:scale-[0.985] transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#4F6658] focus-visible:outline-offset-2 group no-underline cursor-pointer`}
        aria-label={`${label}: ${displayValue}${subValue ? `, ${subValue}` : ""}`}
      >
        {cardContent}
      </Link>
    );
  }

  return (
    <div
      data-testid={testId}
      className={baseClasses}
      aria-label={`${label}: ${displayValue}${subValue ? `, ${subValue}` : ""}`}
    >
      {cardContent}
    </div>
  );
};

export function CoreIdentity({
  lifePath,
  lifePathRole,
  arcanaCenter,
  sunSign,
  humanDesign,
  labels,
  subtitle = "Empat perspektif tentang dirimu",
  loading = false,
  uid,
}: CoreIdentityProps) {
  const fallback = labels.unavailable || "Belum tersedia";

  // Human Design State Hardening
  const hdState = getHdState(humanDesign);
  const rawType = hdState.type;
  const humanDesignType = rawType === "Manifesting Generator" ? "ManGen" : rawType;
  const isRecognized = isRecognizedHumanDesignType(rawType);

  let hdValue: string | undefined;
  let hdSubValue: string | undefined;
  let hdStatusDot: "green" | "yellow" | "none" = "none";

  if (isRecognized || (rawType && (hdState.state === "CANONICAL" || hdState.state === "FALLBACK_LABELED"))) {
    hdValue = humanDesignType as string;
    if (hdState.state === "CANONICAL" && hdState.provenance === "canonical") {
      hdSubValue = "Tipe Energi";
      hdStatusDot = "none";
    } else {
      hdSubValue = "Data tersimpan";
      hdStatusDot = "green";
    }
  } else if (hdState.state === "PENDING") {
    const isExplicitlyPending = Boolean(
      humanDesign &&
      typeof humanDesign === "object" &&
      ((humanDesign as any).status === "pending" || (humanDesign as any).calculationStatus === "pending")
    );
    if (isExplicitlyPending) {
      hdValue = hdState.reason === "needs_verified_timezone"
        ? (labels.humanDesignNeedsTimezone || labels.humanDesignPending || "Menghitung...")
        : (labels.humanDesignPending || "Menghitung...");
      hdSubValue = labels.calculatingInProgress || "Sedang diproses";
      hdStatusDot = "yellow";
    } else {
      hdValue = undefined;
      hdSubValue = labels.cannotCalculate || "Data belum dihitung";
      hdStatusDot = "none";
    }
  } else {
    // Unrecognized, missing, error, or uncalculated
    hdValue = undefined;
    hdSubValue = hdState.state === "RETRIABLE_ERROR"
      ? "Layanan dalam pemulihan"
      : (labels.cannotCalculate || "Data belum dihitung");
    hdStatusDot = "none";
  }

  // Life Path value handling
  const validLifePath = (lifePath !== undefined && lifePath !== null && lifePath !== 0 && lifePath !== "0" && String(lifePath).trim() !== "")
    ? lifePath
    : undefined;
  const lifePathSub = lifePathRole || (validLifePath ? "Pola Hidup" : undefined);

  // Sun Sign value handling
  const validSunSign = (sunSign && sunSign.trim() !== "") ? sunSign.trim() : undefined;
  const sunSignSub = validSunSign ? "Tanda Matahari" : undefined;

  // Arcana Center value handling
  const validArcana = (arcanaCenter !== undefined && arcanaCenter !== null && arcanaCenter !== 0 && arcanaCenter !== "0" && String(arcanaCenter).trim() !== "")
    ? arcanaCenter
    : undefined;
  const arcanaSub = validArcana ? "Pusat Jiwa" : undefined;

  return (
    <section className="my-3 sm:my-4" aria-labelledby="core-identity-title" data-uid={uid}>
      {/* Header Section */}
      <div className="mb-3.5 px-0.5">
        <h2 id="core-identity-title" className="text-lg sm:text-xl font-serif font-medium text-[#2D352E]">
          {labels.title || "Identitas Inti"}
        </h2>
        {subtitle && (
          <p className="text-xs text-[#5F6B5E] mt-0.5 font-normal">
            {subtitle}
          </p>
        )}
      </div>

      {/* Identity Grid: exactly 4 cards, 2 columns on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* 1. Life Path */}
        <IdentityCard
          label={labels.lifePath || "Life Path"}
          value={validLifePath}
          subValue={lifePathSub}
          fallback={fallback}
          href="/blueprint/numerology/"
          loading={loading}
          testId="core-identity-lifepath"
        />

        {/* 2. Zodiak Matahari */}
        <IdentityCard
          label={labels.sunSign || "Zodiak Matahari"}
          value={validSunSign}
          subValue={sunSignSub}
          fallback={fallback}
          href="/blueprint/natal-chart/"
          loading={loading}
          testId="core-identity-sunsign"
        />

        {/* 3. Pusat Arcana */}
        <IdentityCard
          label={labels.arcanaCenter || "Pusat Arcana"}
          value={validArcana}
          subValue={arcanaSub}
          fallback={fallback}
          href="/blueprint/destiny-matrix/"
          loading={loading}
          testId="core-identity-arcana"
        />

        {/* 4. Human Design */}
        <IdentityCard
          label={labels.humanDesign || "Human Design"}
          value={hdValue}
          subValue={hdSubValue}
          fallback={fallback}
          href="/blueprint/human-design/"
          badge={
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-[#EBF1EB] text-[#42594B] border border-[#D5E2D5]/70">
              Beta
            </span>
          }
          statusDot={hdStatusDot}
          loading={loading}
          testId="core-identity-humandesign"
        />
      </div>

      {/* Screen-reader only stored status wiring for accessibility and test contract */}
      <div className="sr-only" aria-live="polite">
        <HdStoredStatus />
      </div>
    </section>
  );
}

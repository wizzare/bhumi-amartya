"use client";

import React from "react";
import type { SkyBody } from "@/lib/astrology/calculateCurrentSky";

interface RelevantPlanetBadgeProps {
  body: SkyBody;
  isRetrograde?: boolean;
  sign?: string;
  size?: number;
  className?: string;
}

const PLANET_PALETTES: Record<string, { base: string; accent: string; symbol: string }> = {
  Mercury: { base: "#9AA59D", accent: "#717F75", symbol: "☿" },
  Venus: { base: "#D6B898", accent: "#B5916A", symbol: "♀" },
  Mars: { base: "#C97A63", accent: "#9E4F3A", symbol: "♂" },
  Jupiter: { base: "#C4A67B", accent: "#8F7249", symbol: "♃" },
  Saturn: { base: "#B8A389", accent: "#7D6B54", symbol: "♄" },
  Uranus: { base: "#8DAEAE", accent: "#5E8484", symbol: "♅" },
  Neptune: { base: "#7A9BB8", accent: "#4E7291", symbol: "♆" },
  Pluto: { base: "#8E7D88", accent: "#5A4B55", symbol: "♇" },
  Sun: { base: "#E0B354", accent: "#B8861B", symbol: "☉" },
};

/**
 * 2.5D Restrained Planet Visual.
 * Appears ONLY when the planet has genuine astronomical relevance on that day
 * (e.g. retrograde, tight aspect <= 6°, or fresh sign ingress). Zero random decoration.
 */
export function RelevantPlanetBadge({
  body,
  isRetrograde = false,
  sign,
  size = 32,
  className = "",
}: RelevantPlanetBadgeProps) {
  const palette = PLANET_PALETTES[body] || { base: "#A4ADA7", accent: "#7B8776", symbol: "●" };
  const uniqueId = `planet-${body.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 border border-[#E4DFD5] bg-[#FFFFFF] shadow-sm ${className}`}
      role="group"
      aria-label={`${body} ${sign ? `di ${sign}` : ""} ${isRetrograde ? "(Retrograde)" : ""}`}
    >
      {/* 2.5D Matte Planet Disc */}
      <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0 overflow-visible" aria-hidden="true">
        <defs>
          <radialGradient id={`${uniqueId}-grad`} cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="35%" stopColor={palette.base} />
            <stop offset="100%" stopColor={palette.accent} />
          </radialGradient>
        </defs>

        {/* Planet Sphere */}
        <circle cx="20" cy="20" r="14" fill={`url(#${uniqueId}-grad)`} />

        {/* Subtle Ring for Saturn */}
        {body === "Saturn" && (
          <ellipse
            cx="20"
            cy="20"
            rx="19"
            ry="5.5"
            fill="none"
            stroke={palette.accent}
            strokeWidth="1.8"
            opacity="0.8"
            transform="rotate(-20 20 20)"
          />
        )}
      </svg>

      {/* Label and Planetary Context */}
      <div className="flex flex-col text-left leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-[#2D352E]">{body}</span>
          {isRetrograde && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1 py-0.2 rounded bg-[#F8E7E3] text-[#9B3E36]">
              Rx
            </span>
          )}
        </div>
        {sign && <span className="text-[10px] text-[#5F6B5E]">di {sign}</span>}
      </div>
    </div>
  );
}

"use client";

import React, { useId } from "react";

export type MoonPhaseGeometry = {
  fraction: number; // 0.0 (New Moon) to 1.0 (Full Moon)
  phaseAngle: number; // 0 to 360 degrees
  isWaxing: boolean;
  phaseLabel: string;
};

/**
 * Derives continuous lunar illumination fraction and waxing/waning direction
 * directly from phase angle (0..360) where 0 = New Moon, 180 = Full Moon.
 */
export function getMoonIllumination(phaseAngle: number, labelFallback?: string): MoonPhaseGeometry {
  const normAngle = ((phaseAngle % 360) + 360) % 360;
  // Standard astronomical formula: fraction = (1 - cos(angle)) / 2
  const fraction = 0.5 * (1 - Math.cos((normAngle * Math.PI) / 180));
  const isWaxing = normAngle >= 0 && normAngle < 180;

  let phaseLabel = labelFallback || "Fase Bulan";
  if (!labelFallback) {
    if (normAngle < 22.5 || normAngle >= 337.5) phaseLabel = "Bulan Baru";
    else if (normAngle < 67.5) phaseLabel = "Sabit Awal";
    else if (normAngle < 112.5) phaseLabel = "Perbani Awal";
    else if (normAngle < 157.5) phaseLabel = "Cembung Awal";
    else if (normAngle < 202.5) phaseLabel = "Bulan Purnama";
    else if (normAngle < 247.5) phaseLabel = "Cembung Akhir";
    else if (normAngle < 292.5) phaseLabel = "Perbani Akhir";
    else phaseLabel = "Sabit Akhir";
  }

  return {
    fraction: Math.max(0, Math.min(1, fraction)),
    phaseAngle: normAngle,
    isWaxing,
    phaseLabel,
  };
}

interface CelestialMoonProps {
  phaseAngle?: number;
  illuminationFraction?: number;
  isWaxing?: boolean;
  size?: number; // width & height in px
  className?: string;
  showAmbientGlow?: boolean;
  subtleFloating?: boolean;
}

/**
 * Continuous 2.5D Moon Renderer.
 * Produces smooth terminator geometry matching exact illumination fraction (0..100%).
 * Completely pure SVG, zero Three.js / WebGL, lightweight and battery-efficient.
 */
export function CelestialMoon({
  phaseAngle = NaN,
  illuminationFraction,
  isWaxing: isWaxingProp,
  size = 120,
  className = "",
  showAmbientGlow = true,
  subtleFloating = false,
}: CelestialMoonProps) {
  const uniqueId = useId();
  const derived = getMoonIllumination(phaseAngle);
  const frac = typeof illuminationFraction === "number" ? Math.max(0, Math.min(1, illuminationFraction)) : derived.fraction;
  if (!Number.isFinite(frac) || (!Number.isFinite(phaseAngle) && typeof isWaxingProp !== "boolean")) {
    return <span role="img" aria-label="Fase bulan belum tersedia">Fase bulan belum tersedia</span>;
  }
  const isWaxing = typeof isWaxingProp === "boolean" ? isWaxingProp : derived.isWaxing;

  // ViewBox coordinates (Center = 50, Radius = 44)
  const cx = 50;
  const cy = 50;
  const r = 44;

  // Curvature for the terminator curve ellipse (dx from center)
  // When frac = 0.5 (Quarter Moon), terminator is straight line (dx = 0)
  // When frac = 1.0 (Full Moon), terminator reaches full right/left (dx = r)
  // When frac = 0.0 (New Moon), terminator reaches opposite edge (dx = r)
  const cosVal = 1 - 2 * frac;
  const ellipseRx = Math.abs(cosVal) * r;

  // Build illuminated SVG path:
  // We draw circular arc for the sunlit outer limb, then elliptical arc for the terminator.
  let illuminatedPath = "";
  if (frac === 0) {
    // New Moon: virtually zero sunlit surface
    illuminatedPath = "";
  } else if (frac === 1) {
    // Full Moon: entire circle
    illuminatedPath = `M ${cx - r},${cy} a ${r},${r} 0 1,0 ${2 * r},0 a ${r},${r} 0 1,0 -${2 * r},0`;
  } else {
    // Intermediate continuous terminator curve
    if (isWaxing) {
      // Light is on the right side
      if (frac < 0.5) {
        // Crescent: crescent on right, inner shadow sweeps right
        // Outer arc: top (50, 6) to bottom (50, 94) via right side
        // Inner arc: bottom back to top curving right
        illuminatedPath = `M ${cx},${cy - r} A ${r},${r} 0 0,1 ${cx},${cy + r} A ${ellipseRx},${r} 0 0,1 ${cx},${cy - r} Z`;
      } else {
        // Gibbous: right half lit + bulging into left half
        illuminatedPath = `M ${cx},${cy - r} A ${r},${r} 0 0,1 ${cx},${cy + r} A ${ellipseRx},${r} 0 0,0 ${cx},${cy - r} Z`;
      }
    } else {
      // Waning: light is on the left side
      if (frac < 0.5) {
        // Crescent: crescent on left
        illuminatedPath = `M ${cx},${cy - r} A ${r},${r} 0 0,0 ${cx},${cy + r} A ${ellipseRx},${r} 0 0,0 ${cx},${cy - r} Z`;
      } else {
        // Gibbous: left half lit + bulging into right half
        illuminatedPath = `M ${cx},${cy - r} A ${r},${r} 0 0,0 ${cx},${cy + r} A ${ellipseRx},${r} 0 0,1 ${cx},${cy - r} Z`;
      }
    }
  }


  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${subtleFloating ? "animate-pulse" : ""} ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${Number.isFinite(phaseAngle) ? derived.phaseLabel : "Bulan"}, ${illuminationFraction === undefined ? "perkiraan iluminasi dari sudut fase" : "iluminasi"} ${(frac * 100).toFixed(0)}%`}
    >
      {/* Soft Ambient Celestial Glow */}
      {showAmbientGlow && (
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-opacity duration-700"
          style={{
            background: frac > 0.1
              ? "radial-gradient(circle at 50% 50%, rgba(230, 222, 206, 0.45) 0%, rgba(140, 122, 107, 0.08) 55%, transparent 70%)"
              : "radial-gradient(circle at 50% 50%, rgba(100, 110, 105, 0.15) 0%, transparent 70%)",
            transform: "scale(1.2)",
          }}
          aria-hidden="true"
        />
      )}

      {/* SVG 2.5D Matte Moon Sphere */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="relative z-10 drop-shadow-sm overflow-visible"
        aria-hidden="true"
      >
        <defs>
          {/* Dark / Earthshine Base Gradient */}
          <radialGradient id={`${uniqueId}-dark`} cx="42%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#252B27" />
            <stop offset="60%" stopColor="#1C211E" />
            <stop offset="100%" stopColor="#141715" />
          </radialGradient>

          {/* Illuminated Soft Cream/Silver Surface Gradient */}
          <radialGradient id={`${uniqueId}-lit`} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#FCFAF5" />
            <stop offset="45%" stopColor="#EDE6D8" />
            <stop offset="85%" stopColor="#D5CBB9" />
            <stop offset="100%" stopColor="#B3A794" />
          </radialGradient>

          {/* Subtle 2.5D Sphere Rim Shadow */}
          <radialGradient id={`${uniqueId}-rim`} cx="50%" cy="50%" r="50%">
            <stop offset="82%" stopColor="transparent" stopOpacity="0" />
            <stop offset="96%" stopColor="#0B0D0C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0B0D0C" stopOpacity="0.75" />
          </radialGradient>

          {/* Subtle Maria / Crater Texture Texture Pattern */}
          <mask id={`${uniqueId}-crater-mask`}>
            <circle cx={cx} cy={cy} r={r} fill="#ffffff" />
          </mask>
        </defs>

        {/* 1. Base Dark Disc (Earthshine) — Disc is ALWAYS tangible and grounded */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#${uniqueId}-dark)`}
          stroke="#38433C"
          strokeWidth="0.8"
          strokeOpacity="0.35"
        />

        {/* Subtle Dark Maria Patches (Visible on unlit side under earthshine) */}
        <g opacity="0.22" mask={`url(#${uniqueId}-crater-mask)`}>
          <circle cx="36" cy="38" r="9" fill="#0E1210" />
          <circle cx="58" cy="46" r="13" fill="#0E1210" />
          <circle cx="48" cy="62" r="11" fill="#0E1210" />
          <ellipse cx="64" cy="32" rx="7" ry="5" fill="#0E1210" />
        </g>

        {/* 2. Illuminated Lunar Surface (Exact Mathematical Fraction) */}
        {illuminatedPath && (
          <path
            d={illuminatedPath}
            fill={`url(#${uniqueId}-lit)`}
            className="transition-all duration-500 ease-out"
          />
        )}

        {/* 3. Subtle Maria Patches on Lit Side */}
        {illuminatedPath && (
          <g opacity="0.08" mask={`url(#${uniqueId}-crater-mask)`}>
            <circle cx="38" cy="36" r="10" fill="#756A5B" />
            <circle cx="56" cy="44" r="12" fill="#756A5B" />
            <circle cx="46" cy="64" r="11" fill="#756A5B" />
            <circle cx="68" cy="34" r="7" fill="#756A5B" />
          </g>
        )}

        {/* 4. Subtle 3D Spherical Depth Overlay Rim */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill={`url(#${uniqueId}-rim)`}
          style={{ mixBlendMode: "multiply" }}
        />
      </svg>
    </div>
  );
}

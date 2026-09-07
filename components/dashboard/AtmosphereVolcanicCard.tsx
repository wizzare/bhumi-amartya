"use client";

import React from "react";
import Link from "next/link";
import { Wind, Activity, Flame, ShieldAlert, CheckCircle, Info } from "lucide-react";
import type { EnvironmentalConditionPayload } from "@/lib/environment/env2Types";

interface AtmosphereVolcanicCardProps {
  payload: EnvironmentalConditionPayload | null;
  loading?: boolean;
}

export function AtmosphereVolcanicCard({ payload, loading }: AtmosphereVolcanicCardProps) {
  if (loading) {
    return (
      <div className="bhumi-card p-6 bg-white border border-[#E8E9E5] animate-pulse">
        <div className="h-4 w-48 bg-[#E8E9E5] rounded mb-3" />
        <div className="h-16 w-full bg-[#F5F1E8] rounded-xl" />
      </div>
    );
  }

  if (!payload || payload.failClosed) {
    return (
      <div className="bhumi-card p-6 bg-white border border-[#E8E9E5]">
        <div className="flex items-center gap-2 mb-2 text-[#4F5E52]">
          <Flame className="h-5 w-5 text-[#9AA394]" />
          <h3 className="font-semibold text-sm tracking-wide">Atmosphere & Volcanic Context</h3>
        </div>
        <p className="text-xs text-[#7B8776] leading-relaxed">
          Environmental atmospheric context is currently unavailable for your location. Check back later or ensure location permissions are enabled.
        </p>
      </div>
    );
  }

  const { airQuality, atmosphere, wind, volcanic } = payload;

  return (
    <section className="bhumi-card p-6 bg-white border border-[#E8E9E5] space-y-5">
      <div className="flex items-center justify-between border-b border-[#E8E9E5] pb-3">
        <div className="flex items-center gap-2.5 text-[#4F5E52]">
          <Flame className="h-5 w-5 text-amber-600" />
          <div>
            <h3 className="font-semibold text-sm text-[#4F5E52]">Atmosphere & Volcanic Context</h3>
            <p className="text-[10px] text-[#9AA394]">
              {payload.overallFreshness === "fresh" ? "Near-Real-Time Observation" : "Cached Observation (Stale)"}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/environment"
          className="text-xs font-semibold text-[#4F5E52] hover:text-emerald-700 underline"
        >
          Details
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* 1. Surface Air Quality */}
        <div className="p-3.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7B8776] mb-1">
            <span className="text-[11px] font-medium">Surface AQI</span>
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold text-[#4F5E52]">
              {typeof airQuality.aqi === "number" ? airQuality.aqi : "—"}
            </span>
            <p className="text-[10px] font-medium text-emerald-700 mt-0.5 truncate">
              {airQuality.label ?? "Unrecorded"}
            </p>
          </div>
          <p className="text-[9px] text-[#9AA394] mt-2">
            PM2.5: {airQuality.pm25UgM3 !== undefined ? `${airQuality.pm25UgM3} μg/m³` : "—"}
          </p>
        </div>

        {/* 2. Atmospheric Column SO2 */}
        <div className="p-3.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7B8776] mb-1">
            <span className="text-[11px] font-medium">SO₂ Column</span>
            <Info className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold text-[#4F5E52]">
              {typeof atmosphere.totalColumnSo2DobsonUnits === "number"
                ? `${atmosphere.totalColumnSo2DobsonUnits} DU`
                : "Unavailable"}
            </span>
            <p className="text-[10px] font-medium text-[#7B8776] mt-0.5">
              {atmosphere.totalColumnSo2UgM2 !== undefined
                ? (atmosphere.anomalyDetected ? "Elevated Column" : "Nominal Column")
                : "Source Pending"}
            </p>
          </div>
          <p className="text-[9px] text-[#9AA394] mt-2">
            Surface SO₂: {airQuality.surfaceSo2UgM3 !== undefined ? `${airQuality.surfaceSo2UgM3} μg/m³` : "—"}
          </p>
        </div>

        {/* 3. Wind Vector */}
        <div className="p-3.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7B8776] mb-1">
            <span className="text-[11px] font-medium">Local Wind</span>
            <Wind className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1">
            <span className="text-xl font-bold text-[#4F5E52]">
              {typeof wind.speedKph === "number" ? `${wind.speedKph} km/h` : "—"}
            </span>
            <p className="text-[10px] font-medium text-[#7B8776] mt-0.5">
              {wind.directionCardinal ? `From ${wind.directionCardinal}` : "Calm"}
            </p>
          </div>
          <p className="text-[9px] text-[#9AA394] mt-2">
            Elevation: {wind.elevationMeters}m
          </p>
        </div>

        {/* 4. Volcanic Attribution */}
        <div className="p-3.5 rounded-xl bg-[#FCFAF5] border border-[#E8E9E5]/60 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#7B8776] mb-1">
            <span className="text-[11px] font-medium">Volcanic Origin</span>
            <Flame className="h-3.5 w-3.5" />
          </div>
          <div className="mt-1">
            <span className="text-sm font-bold text-[#4F5E52]">
              {volcanic.probableSource ? volcanic.probableSource.name : "Unavailable"}
            </span>
            <p className="text-[10px] font-medium text-[#7B8776] mt-0.5">
              Confidence: {volcanic.attributionConfidence}
            </p>
          </div>
          <p className="text-[9px] text-[#9AA394] mt-2 truncate">
            {volcanic.nearbyKnownVolcanoes.length > 0 ? `${volcanic.nearbyKnownVolcanoes.length} known in 250km` : "Source Gated"}
          </p>
        </div>
      </div>

      {/* Rationale & Health Safety Note */}
      <div className="p-3.5 rounded-xl bg-[#F7F8F5] text-xs text-[#5C6659] space-y-1.5">
        <div className="flex items-start gap-2">
          {volcanic.plumeDetected ? (
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          <p className="leading-relaxed">
            {volcanic.attributionRationale}
          </p>
        </div>
        {airQuality.healthRecommendation && (
          <p className="text-[11px] text-[#7B8776] border-t border-[#E8E9E5] pt-1.5 mt-1.5">
            <strong className="font-semibold text-[#4F5E52]">Outdoor Air Guidance:</strong> {airQuality.healthRecommendation}
          </p>
        )}
      </div>

      {/* Provenance and Scientific Separation Disclaimer */}
      <div className="text-[10px] text-[#9AA394] leading-normal space-y-0.5 border-t border-[#E8E9E5] pt-2.5">
        <p>
          <strong className="font-medium">Data Provenance:</strong> {airQuality.provenance.attributionText} & {atmosphere.provenance.attributionText}.
        </p>
        <p>
          <strong className="font-medium">Scientific Boundary:</strong> Total column SO₂ reflects integrated vertical atmospheric gas and cannot be converted into surface inhalation concentration.
        </p>
      </div>
    </section>
  );
}

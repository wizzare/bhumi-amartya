"use client";

import { useMemo } from "react";
import type { SchumannObservation } from "@/lib/environment/types";

type SchumannGraphProps = {
  series: SchumannObservation[];
  amplitudeLabel: string;
  powerLabel: string;
  windowLabel: string;
};

const WIDTH = 600;
const HEIGHT = 150;
const PADDING = 4;

function buildPath(values: Array<number | null | undefined>, min: number, max: number): string {
  if (values.length < 2) return "";
  const span = max - min || 1;
  const stepX = (WIDTH - PADDING * 2) / (values.length - 1);
  let path = "";
  let started = false;
  values.forEach((value, index) => {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      started = false;
      return;
    }
    const x = PADDING + index * stepX;
    const y = HEIGHT - PADDING - ((value - min) / span) * (HEIGHT - PADDING * 2);
    path += `${started ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)} `;
    started = true;
  });
  return path.trim();
}

export function SchumannGraph({ series, amplitudeLabel, powerLabel, windowLabel }: SchumannGraphProps) {
  const graph = useMemo(() => {
    if (series.length === 0) return null;
    const amplitudes = series.map((item) => item.a).filter((value): value is number => Number.isFinite(value));
    const powers = series.map((item) => item.p).filter((value): value is number => Number.isFinite(value));
    const firstT = series[0].t;
    const lastT = series[series.length - 1].t;
    const slots = Math.min(series.length, 240);
    const slotMs = Math.max((lastT - firstT) / Math.max(slots - 1, 1), 1);
    const resample = (key: "a" | "p") => Array.from({ length: slots }, (_, index) => {
      const target = firstT + index * slotMs;
      let nearest: SchumannObservation | undefined;
      let distance = Number.POSITIVE_INFINITY;
      for (const item of series) {
        const candidate = Math.abs(item.t - target);
        if (candidate < distance) { distance = candidate; nearest = item; }
      }
      return typeof nearest?.[key] === "number" ? nearest[key] : null;
    });
    return {
      amplitudePath: buildPath(resample("a"), amplitudes.length ? Math.min(...amplitudes) : 0, amplitudes.length ? Math.max(...amplitudes) : 1),
      powerPath: buildPath(resample("p"), powers.length ? Math.min(...powers) : 0, powers.length ? Math.max(...powers) : 1),
      hours: Math.round(((lastT - firstT) / 3_600_000) * 10) / 10,
    };
  }, [series]);

  if (!graph) return null;
  return (
    <div className="rounded-2xl border border-[#E8E9E5] bg-[#FCFAF5] p-3">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full" role="img" aria-label={`${amplitudeLabel} / ${powerLabel}`}>
        {graph.amplitudePath && <path d={graph.amplitudePath} fill="none" stroke="#5B8A9F" strokeWidth="2" />}
        {graph.powerPath && <path d={graph.powerPath} fill="none" stroke="#A08963" strokeWidth="2" strokeDasharray="4 3" />}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-semibold text-[#7B8776]">
        <span>{amplitudeLabel}</span>
        <span>{powerLabel}</span>
        <span>{windowLabel.replace("{h}", String(graph.hours))}</span>
      </div>
    </div>
  );
}

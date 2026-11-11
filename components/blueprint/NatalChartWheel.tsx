"use client";

import { useMemo, useState } from "react";
import { RotateCcw, X, ZoomIn, ZoomOut } from "lucide-react";
import type { AspectResult, NatalChartResult, PlanetPosition } from "@/lib/astrology/calculateNatalChart";
import type { PersonalTransitsResult, TransitAspectResult } from "@/lib/astrology/calculateTransits";
import { getEphemerisStatus } from "@/lib/astrology/ephemerisClassification";

export type WheelSelection =
  | { kind: "planet"; name: string }
  | { kind: "transit"; name: string }
  | { kind: "house"; house: number }
  | { kind: "sign"; sign: string }
  | { kind: "aspect"; index: number }
  | null;

type Props = {
  natal: NatalChartResult;
  transits?: PersonalTransitsResult | null;
  selectedPlanet?: string;
  selectedHouse?: number;
  onSelectPlanet?: (name: string) => void;
  onSelectHouse?: (house: number) => void;
  isEn?: boolean;
};

const CX = 320;
const CY = 320;
const R_TRANSIT = 294;
const R_TRANSIT_TRACK = 276;
const R_ZODIAC_OUTER = 264;
const R_ZODIAC_INNER = 228;
const R_TICK_INNER = 214;
const R_HOUSE_OUTER = 132;
const R_ASPECT_RING = 108;

const SIGNS = [
  { name: "Aries", glyph: "\u2648\uFE0E", element: "Fire", modality: "Cardinal", color: "#B84A3E", qualityId: "Inisiatif, keberanian, langkah pertama" },
  { name: "Taurus", glyph: "\u2649\uFE0E", element: "Earth", modality: "Fixed", color: "#3B4940", qualityId: "Ketahanan, rasa aman, ketekunan nyata" },
  { name: "Gemini", glyph: "\u264A\uFE0E", element: "Air", modality: "Mutable", color: "#3B7A57", qualityId: "Komunikasi, rasa ingin tahu, perspektif ganda" },
  { name: "Cancer", glyph: "\u264B\uFE0E", element: "Water", modality: "Cardinal", color: "#345E8A", qualityId: "Kepekaan batin, pengasuhan, akar emosi" },
  { name: "Leo", glyph: "\u264C\uFE0E", element: "Fire", modality: "Fixed", color: "#B84A3E", qualityId: "Ekspresi hangat, kreativitas, ketulusan hati" },
  { name: "Virgo", glyph: "\u264D\uFE0E", element: "Earth", modality: "Mutable", color: "#3B4940", qualityId: "Ketelitian, perbaikan, pelayanan praktis" },
  { name: "Libra", glyph: "\u264E\uFE0E", element: "Air", modality: "Cardinal", color: "#3B7A57", qualityId: "Keseimbangan, relasi setara, harmoni" },
  { name: "Scorpio", glyph: "\u264F\uFE0E", element: "Water", modality: "Fixed", color: "#345E8A", qualityId: "Kedalaman rasa, transformasi, kejujuran batin" },
  { name: "Sagittarius", glyph: "\u2650\uFE0E", element: "Fire", modality: "Mutable", color: "#B84A3E", qualityId: "Makna luas, pencarian kebenaran, cakrawala" },
  { name: "Capricorn", glyph: "\u2651\uFE0E", element: "Earth", modality: "Cardinal", color: "#3B4940", qualityId: "Struktur, tanggung jawab, daya tahan jangka panjang" },
  { name: "Aquarius", glyph: "\u2652\uFE0E", element: "Air", modality: "Fixed", color: "#3B7A57", qualityId: "Pembaruan, pola sistem, kebebasan berpikir" },
  { name: "Pisces", glyph: "\u2653\uFE0E", element: "Water", modality: "Mutable", color: "#345E8A", qualityId: "Empati halus, imajinasi, kesatuan batin" },
] as const;

const PLANET_GLYPHS: Record<string, string> = {
  Sun: "\u2609\uFE0E",
  Moon: "\u263D\uFE0E",
  Mercury: "\u263F\uFE0E",
  Venus: "\u2640\uFE0E",
  Mars: "\u2642\uFE0E",
  Jupiter: "\u2643\uFE0E",
  Saturn: "\u2644\uFE0E",
  Uranus: "\u2645\uFE0E",
  Neptune: "\u2646\uFE0E",
  Pluto: "\u2647\uFE0E",
  Chiron: "\u26B7\uFE0E",
  "Black Moon Lilith": "\u26B8\uFE0E",
  "North Node": "\u260A\uFE0E",
  "South Node": "\u260B\uFE0E",
  "Part of Fortune": "\u2297\uFE0E",
};

const ASPECT_STYLES: Record<
  string,
  { color: string; dash?: string; width: number; labelId: string; labelEn: string }
> = {
  Conjunction: { color: "#7B5C92", width: 1.5, labelId: "Konjungsi (0\u00B0)", labelEn: "Conjunction (0\u00B0)" },
  Opposition: { color: "#C04A3E", width: 1.6, labelId: "Oposisi (180\u00B0)", labelEn: "Opposition (180\u00B0)" },
  Square: { color: "#C86B4A", dash: "4 2.5", width: 1.4, labelId: "Kuadrat (90\u00B0)", labelEn: "Square (90\u00B0)" },
  Trine: { color: "#2E6F95", width: 1.5, labelId: "Trigon (120\u00B0)", labelEn: "Trine (120\u00B0)" },
  Sextile: { color: "#4E8B73", dash: "3 2", width: 1.3, labelId: "Sekstil (60\u00B0)", labelEn: "Sextile (60\u00B0)" },
  Quincunx: { color: "#8C7A6B", dash: "1.5 2.5", width: 1.1, labelId: "Kuinkunks (150\u00B0)", labelEn: "Quincunx (150\u00B0)" },
};

const GLYPH_FONT = "'Segoe UI Symbol', 'Noto Sans Symbols', 'Apple Symbols', Georgia, serif";

function normDeg(deg: number): number {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

function signedDegDiff(a: number, b: number): number {
  let d = normDeg(a) - normDeg(b);
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return d;
}

/**
 * Standard Western astrology wheel orientation:
 * - ASC (house 1 cusp) is pinned at 9 o'clock (left horizontal, PI radians).
 * - Longitudes advance counter-clockwise (decreasing SVG screen angle).
 */
function polar(longitude: number, ascLongitude: number, radius: number) {
  const rad = Math.PI - ((longitude - ascLongitude) * Math.PI) / 180;
  return {
    x: CX + Math.cos(rad) * radius,
    y: CY + Math.sin(rad) * radius,
  };
}

function arcSegmentPath(
  startLon: number,
  endLon: number,
  ascLongitude: number,
  rOuter: number,
  rInner: number,
): string {
  const p1 = polar(startLon, ascLongitude, rOuter);
  const p2 = polar(endLon, ascLongitude, rOuter);
  const p3 = polar(endLon, ascLongitude, rInner);
  const p4 = polar(startLon, ascLongitude, rInner);
  const span = normDeg(endLon - startLon);
  const largeArc = span > 180 ? 1 : 0;
  // Because zodiac progresses counter-clockwise in SVG screen space, outer arc sweep=0, inner arc sweep=1
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    "Z",
  ].join(" ");
}

type PlacedBody = {
  planet: PlanetPosition;
  trueLon: number;
  displayLon: number;
  radius: number;
  shifted: boolean;
};

function layoutBodies(
  bodies: PlanetPosition[],
  tiers: number[],
  minSeps: number[],
): PlacedBody[] {
  const sorted = [...bodies]
    .filter((b) => Number.isFinite(b.longitude))
    .map((b) => ({ planet: b, trueLon: normDeg(b.longitude) }))
    .sort((a, b) => a.trueLon - b.trueLon);

  const tierAssignments: Array<Array<{ index: number; displayLon: number; trueLon: number }>> =
    tiers.map(() => []);

  const placed: PlacedBody[] = sorted.map((item) => ({
    planet: item.planet,
    trueLon: item.trueLon,
    displayLon: item.trueLon,
    radius: tiers[0],
    shifted: false,
  }));

  // Greedy radial tier assignment: prefer outer tier unless crowded within minSep
  sorted.forEach((item, idx) => {
    let chosenTier = 0;
    let bestMinDist = -1;

    for (let t = 0; t < tiers.length; t++) {
      const members = tierAssignments[t];
      if (members.length === 0) {
        chosenTier = t;
        bestMinDist = 360;
        break;
      }
      const nearest = Math.min(
        ...members.map((m) => Math.abs(signedDegDiff(item.trueLon, m.displayLon))),
      );
      if (nearest >= minSeps[t]) {
        chosenTier = t;
        bestMinDist = nearest;
        break;
      }
      if (nearest > bestMinDist) {
        bestMinDist = nearest;
        chosenTier = t;
      }
    }

    tierAssignments[chosenTier].push({
      index: idx,
      displayLon: item.trueLon,
      trueLon: item.trueLon,
    });
    placed[idx].radius = tiers[chosenTier];
  });

  // Angular relaxation per tier when clusters still have 3+ bodies on the same tier
  tierAssignments.forEach((members, t) => {
    const minSep = minSeps[t];
    if (members.length <= 1) return;
    for (let pass = 0; pass < 18; pass++) {
      let moved = false;
      for (let i = 0; i < members.length; i++) {
        for (let j = i + 1; j < members.length; j++) {
          const a = members[i];
          const b = members[j];
          const diff = signedDegDiff(b.displayLon, a.displayLon);
          const absDiff = Math.abs(diff);
          if (absDiff < minSep) {
            const push = (minSep - absDiff) * 0.55;
            const dir = diff >= 0 ? 1 : -1;
            const nextA = normDeg(a.displayLon - dir * push);
            const nextB = normDeg(b.displayLon + dir * push);
            if (Math.abs(signedDegDiff(nextA, a.trueLon)) <= 16) a.displayLon = nextA;
            if (Math.abs(signedDegDiff(nextB, b.trueLon)) <= 16) b.displayLon = nextB;
            moved = true;
          }
        }
      }
      if (!moved) break;
    }

    members.forEach((m) => {
      placed[m.index].displayLon = m.displayLon;
      placed[m.index].shifted =
        placed[m.index].radius !== tiers[0] ||
        Math.abs(signedDegDiff(m.displayLon, m.trueLon)) > 0.5;
    });
  });

  return placed;
}

export function NatalChartWheel({
  natal,
  transits = null,
  selectedPlanet,
  selectedHouse,
  onSelectPlanet,
  onSelectHouse,
  isEn = false,
}: Props) {
  const [showTransit, setShowTransit] = useState<boolean>(Boolean(transits?.transitingPlanets?.length));
  const [showExtraBodies, setShowExtraBodies] = useState<boolean>(true);
  const [activeAspectFilter, setActiveAspectFilter] = useState<string>("ALL");
  const [zoom, setZoom] = useState<number>(1);
  const [selection, setSelection] = useState<WheelSelection>(null);

  const ascLon = natal.ascendant.longitude;
  const mcLon = natal.midheaven.longitude;
  const dscLon = normDeg(ascLon + 180);
  const icLon = normDeg(mcLon + 180);

  const natalBodies = useMemo(() => {
    const core: PlanetPosition[] = [
      natal.sun,
      natal.moon,
      natal.mercury,
      natal.venus,
      natal.mars,
      natal.jupiter,
      natal.saturn,
      natal.uranus,
      natal.neptune,
      natal.pluto,
      natal.chiron,
      natal.partOfFortune,
    ];
    if (showExtraBodies) {
      core.push(natal.northNode, natal.southNode, natal.lilith);
    }
    return core;
  }, [natal, showExtraBodies]);

  const placedNatal = useMemo(
    () => layoutBodies(natalBodies, [194, 170, 148], [10.5, 12, 13.5]),
    [natalBodies],
  );

  const placedTransit = useMemo(() => {
    if (!showTransit || !transits?.transitingPlanets?.length) return [];
    return layoutBodies(transits.transitingPlanets, [R_TRANSIT, 281], [9, 10.5]);
  }, [showTransit, transits]);

  const planetByName = useMemo(() => {
    const map = new Map<string, PlanetPosition>();
    natalBodies.forEach((p) => map.set(p.name, p));
    return map;
  }, [natalBodies]);

  const filteredAspects = useMemo(() => {
    return natal.aspects
      .map((aspect, index) => ({ aspect, index }))
      .filter(({ aspect }) =>
        activeAspectFilter === "ALL" ? true : aspect.aspectType === activeAspectFilter,
      );
  }, [natal.aspects, activeAspectFilter]);

  const transitTimestampText = useMemo(() => {
    if (!transits?.targetDate) return null;
    const d = new Date(transits.targetDate);
    if (Number.isNaN(d.getTime())) return null;
    const datePart = d.toISOString().slice(0, 10);
    return `${datePart} · 12:00 UTC (Ref. Transit)`;
  }, [transits?.targetDate]);

  const handleSelectPlanet = (name: string) => {
    setSelection({ kind: "planet", name });
    onSelectPlanet?.(name);
  };

  const handleSelectHouse = (house: number) => {
    setSelection({ kind: "house", house });
    onSelectHouse?.(house);
  };

  const degreeTicks = useMemo(() => {
    const ticks: Array<{ deg: number; len: number; width: number; stroke: string }> = [];
    for (let deg = 0; deg < 360; deg++) {
      if (deg % 30 === 0) continue;
      if (deg % 10 === 0) {
        ticks.push({ deg, len: 12, width: 1.3, stroke: "#273B4A" });
      } else if (deg % 5 === 0) {
        ticks.push({ deg, len: 8, width: 1, stroke: "#4F5E52" });
      } else {
        ticks.push({ deg, len: 4, width: 0.7, stroke: "#9AA394" });
      }
    }
    return ticks;
  }, []);

  const renderSelectionCard = () => {
    if (!selection) return null;

    if (selection.kind === "planet") {
      const p = planetByName.get(selection.name);
      if (!p) return null;
      const eph = getEphemerisStatus(p.name);
      const relatedAspects = natal.aspects.filter(
        (a) => a.planet1 === p.name || a.planet2 === p.name,
      );
      return (
        <div
          role="region"
          aria-label="Detail planet terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Planet Natal · Ephemeris {eph.status}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#273B4A]">
                {PLANET_GLYPHS[p.name] || ""} {p.name} di {p.sign} (House {p.house})
              </h3>
              <p className="mt-0.5 font-mono text-xs text-[#5B655D]">
                {p.formattedDegree} · Lon {p.longitude.toFixed(2)}°{p.isRetrograde ? " · Retrograde (Rx)" : ""}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={isEn ? "Close detail" : "Tutup detail"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8E1D3] bg-[#FCFAF5] text-[#4F5E52] hover:bg-[#F5F1E8]"
            >
              <X size={16} />
            </button>
          </div>
          {relatedAspects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {relatedAspects.slice(0, 6).map((asp, idx) => {
                const other = asp.planet1 === p.name ? asp.planet2 : asp.planet1;
                const st = ASPECT_STYLES[asp.aspectType];
                return (
                  <span
                    key={`${other}-${asp.aspectType}-${idx}`}
                    className="inline-flex items-center gap-1 rounded-full border border-[#E8E1D3] bg-[#FCFAF5] px-2.5 py-1 text-[11px] text-[#4F5E52]"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: st?.color || "#666" }}
                    />
                    {asp.aspectType} {other} ({asp.orb.toFixed(1)}°)
                  </span>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    if (selection.kind === "transit") {
      const tp = transits?.transitingPlanets.find((item) => item.name === selection.name);
      if (!tp) return null;
      const hits: TransitAspectResult[] = (transits?.activeTransits || []).filter(
        (t) => t.transitingPlanet === tp.name,
      );
      return (
        <div
          role="region"
          aria-label="Detail transit terpilih"
          className="mt-4 rounded-2xl border border-[#D4AF37]/50 bg-[#FFFDF7] p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#9A6B16]">
                Transit Overlay · {transitTimestampText || "Referensi UTC"}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#273B4A]">
                Transit {PLANET_GLYPHS[tp.name] || ""} {tp.name} di {tp.sign}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-[#5B655D]">
                {tp.formattedDegree} · Lon {tp.longitude.toFixed(2)}°{tp.isRetrograde ? " · Retrograde (Rx)" : ""}
              </p>
              <p className="mt-1 text-[11px] text-[#7B8776]">
                Sumber: Kalkulasi posisi transit pada 12:00 UTC (bukan data natal dan tidak diberi label VERIFIED).
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={isEn ? "Close detail" : "Tutup detail"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8E1D3] bg-white text-[#4F5E52] hover:bg-[#F5F1E8]"
            >
              <X size={16} />
            </button>
          </div>
          {hits.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {hits.map((h, i) => (
                <span
                  key={`${h.natalPlanet}-${h.aspectType}-${i}`}
                  className="rounded-full border border-[#E8D8B0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5A4212]"
                >
                  {h.aspectType} Natal {h.natalPlanet} (Orb {h.orb.toFixed(1)}°)
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-xs text-[#7B8776]">Tidak ada aspek transit ketat terhadap planet natal saat ini.</p>
          )}
        </div>
      );
    }

    if (selection.kind === "house") {
      const hIdx = selection.house - 1;
      const cuspLon = natal.houses[hIdx] ?? 0;
      const signIdx = Math.floor(normDeg(cuspLon) / 30);
      const cuspSign = SIGNS[signIdx]?.name || "Aries";
      const degInSign = Math.floor(normDeg(cuspLon) % 30);
      const minInSign = Math.round(((normDeg(cuspLon) % 30) - degInSign) * 60) % 60;
      const occupants = natalBodies.filter((p) => p.house === selection.house);
      const angleTag =
        selection.house === 1
          ? " · Ascendant (ASC)"
          : selection.house === 4
          ? " · Imum Coeli (IC)"
          : selection.house === 7
          ? " · Descendant (DSC)"
          : selection.house === 10
          ? " · Midheaven (MC)"
          : "";
      return (
        <div
          role="region"
          aria-label="Detail house terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Rumah Astrologi (Placidus){angleTag}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#273B4A]">
                House {selection.house} · Cusp {cuspSign} {degInSign}°{String(minInSign).padStart(2, "0")}′
              </h3>
              <p className="mt-1 text-xs text-[#5B655D]">
                {occupants.length > 0
                  ? `Dihuni oleh: ${occupants.map((o) => `${o.name} (${o.formattedDegree})`).join(", ")}`
                  : "Tidak ada planet utama di rumah ini; ekspresinya dibaca melalui penguasa zodiak cusp."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={isEn ? "Close detail" : "Tutup detail"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8E1D3] bg-[#FCFAF5] text-[#4F5E52] hover:bg-[#F5F1E8]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (selection.kind === "sign") {
      const signMeta = SIGNS.find((s) => s.name === selection.sign);
      if (!signMeta) return null;
      const planetsInSign = natalBodies.filter((p) => p.sign === signMeta.name);
      return (
        <div
          role="region"
          aria-label="Detail zodiak terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Zodiak · Elemen {signMeta.element} · Modalitas {signMeta.modality}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#273B4A]">
                {signMeta.glyph} {signMeta.name}
              </h3>
              <p className="mt-1 text-xs text-[#4F5E52]">{signMeta.qualityId}</p>
              <p className="mt-1 text-xs text-[#7B8776]">
                {planetsInSign.length > 0
                  ? `Planet natal di ${signMeta.name}: ${planetsInSign.map((p) => `${p.name} (${p.formattedDegree})`).join(", ")}`
                  : `Tidak ada planet natal di zodiak ${signMeta.name}.`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={isEn ? "Close detail" : "Tutup detail"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8E1D3] bg-[#FCFAF5] text-[#4F5E52] hover:bg-[#F5F1E8]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    if (selection.kind === "aspect") {
      const asp: AspectResult | undefined = natal.aspects[selection.index];
      if (!asp) return null;
      const st = ASPECT_STYLES[asp.aspectType];
      return (
        <div
          role="region"
          aria-label="Detail aspek terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Aspek Natal · {asp.isApplying ? "Applying (Menguat)" : "Separating (Melepas)"}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#273B4A]">
                {asp.planet1} {st?.labelId || asp.aspectType} {asp.planet2}
              </h3>
              <p className="mt-1 font-mono text-xs text-[#5B655D]">
                Sudut target: {asp.angle}° · Orb: {asp.orb.toFixed(2)}°
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelection(null)}
              aria-label={isEn ? "Close detail" : "Tutup detail"}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#E8E1D3] bg-[#FCFAF5] text-[#4F5E52] hover:bg-[#F5F1E8]"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="w-full" data-testid="natal-chart-wheel-container">
      {/* Control Toolbar: Transit Overlay Toggle + Extra Points + Zoom */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {transits && transits.transitingPlanets.length > 0 && (
            <button
              type="button"
              onClick={() => setShowTransit((prev) => !prev)}
              aria-pressed={showTransit}
              className={`min-h-[38px] rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                showTransit
                  ? "border-[#273B4A] bg-[#273B4A] text-white"
                  : "border-[#D8D0C3] bg-white text-[#4F5E52] hover:bg-[#F5F1E8]"
              }`}
            >
              {showTransit
                ? isEn
                  ? "Transit Overlay: ON"
                  : "Transit Overlay: Aktif"
                : isEn
                ? "Transit Overlay: OFF"
                : "Tampilkan Transit"}
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowExtraBodies((prev) => !prev)}
            aria-pressed={showExtraBodies}
            className={`min-h-[38px] rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              showExtraBodies
                ? "border-[#4F5E52] bg-[#F5F1E8] text-[#4F5E52]"
                : "border-[#D8D0C3] bg-white text-[#7B8776]"
            }`}
          >
            {showExtraBodies ? "Nodes & Lilith: Aktif" : "10 Planet + Chiron"}
          </button>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-[#DED7CA] bg-white px-1.5 py-1">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(1, Number((z - 0.25).toFixed(2))))}
            disabled={zoom <= 1}
            aria-label="Perkecil roda natal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4F5E52] hover:bg-[#F5F1E8] disabled:opacity-40"
          >
            <ZoomOut size={15} />
          </button>
          <span className="min-w-[42px] text-center font-mono text-[11px] font-bold text-[#4F5E52]">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.75, Number((z + 0.25).toFixed(2))))}
            disabled={zoom >= 1.75}
            aria-label="Perbesar roda natal"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4F5E52] hover:bg-[#F5F1E8] disabled:opacity-40"
          >
            <ZoomIn size={15} />
          </button>
          {zoom > 1 && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              aria-label="Reset zoom roda natal"
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#F5F1E8] px-2 text-[11px] font-bold text-[#4F5E52] hover:bg-[#EAE3D5]"
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Angle Summary Pills */}
      <div className="mb-3 flex flex-wrap items-center justify-center gap-2 text-[11px]">
        <span className="rounded-full border border-[#DED7CA] bg-white px-2.5 py-1 font-semibold text-[#273B4A]">
          ASC: {natal.ascendant.formattedDegree}
        </span>
        <span className="rounded-full border border-[#DED7CA] bg-white px-2.5 py-1 font-semibold text-[#273B4A]">
          MC: {natal.midheaven.formattedDegree}
        </span>
        {showTransit && transitTimestampText && (
          <span className="rounded-full border border-[#D4AF37]/50 bg-[#FFF9EB] px-2.5 py-1 font-semibold text-[#8A5D0B]">
            {transitTimestampText}
          </span>
        )}
      </div>

      {/* Responsive Wheel Container (Preserves Page Scroll When Zoom = 1) */}
      <div
        className={`mx-auto w-full max-w-[560px] rounded-3xl border border-[#DED7CA] bg-[radial-gradient(circle_at_center,#FFFFFF_0%,#F6F2EA_100%)] p-2 sm:p-4 shadow-sm ${
          zoom > 1 ? "overflow-auto touch-pan-x touch-pan-y" : "overflow-hidden"
        }`}
      >
        <div
          className="mx-auto transition-transform duration-200"
          style={{
            width: zoom > 1 ? `${Math.round(zoom * 100)}%` : "100%",
          }}
        >
          <svg
            viewBox="0 0 640 640"
            className="mx-auto block h-auto w-full select-none"
            role="img"
            aria-label="Interactive Natal Chart Wheel"
          >
            {/* Outer Transit Halo (only when Transit Overlay active) */}
            {showTransit && (
              <circle
                cx={CX}
                cy={CY}
                r={R_TRANSIT_TRACK}
                fill="none"
                stroke="#D4AF37"
                strokeWidth="1"
                strokeDasharray="3 3"
                opacity="0.7"
              />
            )}

            {/* Main Outer Circle */}
            <circle cx={CX} cy={CY} r={R_ZODIAC_OUTER} fill="#FFFFFF" stroke="#273B4A" strokeWidth="2.2" />

            {/* 12 Zodiac Sign Sectors */}
            {SIGNS.map((sign, index) => {
              const startLon = index * 30;
              const endLon = startLon + 30;
              const midLon = startLon + 15;
              const glyphPt = polar(midLon, ascLon, (R_ZODIAC_OUTER + R_ZODIAC_INNER) / 2);
              const isSignSelected = selection?.kind === "sign" && selection.sign === sign.name;
              const divA = polar(startLon, ascLon, R_ZODIAC_OUTER);
              const divB = polar(startLon, ascLon, R_TICK_INNER);

              return (
                <g
                  key={sign.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`Zodiak ${sign.name}`}
                  onClick={() => setSelection({ kind: "sign", sign: sign.name })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelection({ kind: "sign", sign: sign.name });
                    }
                  }}
                  className="cursor-pointer"
                >
                  <path
                    d={arcSegmentPath(startLon, endLon, ascLon, R_ZODIAC_OUTER, R_ZODIAC_INNER)}
                    fill={isSignSelected ? "#EFE9DC" : index % 2 === 0 ? "#FFFFFF" : "#FAF8F3"}
                    stroke="none"
                  />
                  <line
                    x1={divA.x}
                    y1={divA.y}
                    x2={divB.x}
                    y2={divB.y}
                    stroke="#273B4A"
                    strokeWidth="1.4"
                  />
                  <text
                    x={glyphPt.x}
                    y={glyphPt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="19"
                    fontWeight="700"
                    fill={sign.color}
                    style={{ fontFamily: GLYPH_FONT }}
                  >
                    {sign.glyph}
                  </text>
                </g>
              );
            })}

            {/* Zodiac Inner Border & Degree Tick Ring */}
            <circle cx={CX} cy={CY} r={R_ZODIAC_INNER} fill="none" stroke="#273B4A" strokeWidth="1.4" />
            <circle cx={CX} cy={CY} r={R_TICK_INNER} fill="#FFFFFF" stroke="#4F5E52" strokeWidth="1.2" />

            {degreeTicks.map((t) => {
              const p1 = polar(t.deg, ascLon, R_ZODIAC_INNER);
              const p2 = polar(t.deg, ascLon, R_ZODIAC_INNER - t.len);
              return (
                <line
                  key={t.deg}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={t.stroke}
                  strokeWidth={t.width}
                />
              );
            })}

            {/* 12 House Sectors (Interactive) & Cusp Lines */}
            {natal.houses.map((cuspLon, idx) => {
              const houseNum = idx + 1;
              const nextLon = natal.houses[(idx + 1) % 12];
              const span = normDeg(nextLon - cuspLon);
              const midLon = normDeg(cuspLon + span / 2);
              const numPt = polar(midLon, ascLon, (R_HOUSE_OUTER + R_ASPECT_RING) / 2);
              const isSelectedHouse =
                (selection?.kind === "house" && selection.house === houseNum) ||
                selectedHouse === houseNum;
              const isAxis = houseNum === 1 || houseNum === 4 || houseNum === 7 || houseNum === 10;
              const cuspOuter = polar(cuspLon, ascLon, isAxis ? R_ZODIAC_INNER : R_TICK_INNER);
              const cuspInner = polar(cuspLon, ascLon, R_ASPECT_RING);

              return (
                <g
                  key={houseNum}
                  role="button"
                  tabIndex={0}
                  aria-label={`House ${houseNum}`}
                  onClick={() => handleSelectHouse(houseNum)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectHouse(houseNum);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <path
                    d={arcSegmentPath(cuspLon, nextLon, ascLon, R_TICK_INNER, R_HOUSE_OUTER)}
                    fill={isSelectedHouse ? "rgba(79, 94, 82, 0.08)" : "transparent"}
                  />
                  <path
                    d={arcSegmentPath(cuspLon, nextLon, ascLon, R_HOUSE_OUTER, R_ASPECT_RING)}
                    fill={isSelectedHouse ? "#E9EFEA" : "#FCFAF5"}
                  />
                  <line
                    x1={cuspOuter.x}
                    y1={cuspOuter.y}
                    x2={cuspInner.x}
                    y2={cuspInner.y}
                    stroke={isAxis ? "#273B4A" : "#7B8776"}
                    strokeWidth={isAxis ? "2.1" : "1"}
                    opacity={isAxis ? "1" : "0.75"}
                  />
                  <text
                    x={numPt.x}
                    y={numPt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="10.5"
                    fontWeight={isSelectedHouse ? "800" : "600"}
                    fill={isSelectedHouse ? "#273B4A" : "#5B655D"}
                  >
                    {houseNum}
                  </text>
                </g>
              );
            })}

            {/* House Ring & Central Aspect Ring Borders */}
            <circle cx={CX} cy={CY} r={R_HOUSE_OUTER} fill="none" stroke="#4F5E52" strokeWidth="1.2" />
            <circle cx={CX} cy={CY} r={R_ASPECT_RING} fill="#FFFFFF" stroke="#273B4A" strokeWidth="1.5" />

            {/* Cardinal Axis Markers (ASC, DSC, MC, IC) */}
            {[
              { label: "ASC", lon: ascLon, house: 1 },
              { label: "IC", lon: icLon, house: 4 },
              { label: "DSC", lon: dscLon, house: 7 },
              { label: "MC", lon: mcLon, house: 10 },
            ].map((axis) => {
              const tickOut = polar(axis.lon, ascLon, R_ZODIAC_OUTER + 5);
              const tickIn = polar(axis.lon, ascLon, R_ZODIAC_INNER);
              const badgePt = polar(axis.lon, ascLon, R_ZODIAC_OUTER + 13);
              return (
                <g
                  key={axis.label}
                  role="button"
                  tabIndex={0}
                  aria-label={`${axis.label} House ${axis.house}`}
                  onClick={() => handleSelectHouse(axis.house)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectHouse(axis.house);
                    }
                  }}
                  className="cursor-pointer"
                >
                  <line
                    x1={tickOut.x}
                    y1={tickOut.y}
                    x2={tickIn.x}
                    y2={tickIn.y}
                    stroke="#273B4A"
                    strokeWidth="2.2"
                  />
                  <rect
                    x={badgePt.x - 15}
                    y={badgePt.y - 8}
                    width="30"
                    height="16"
                    rx="6"
                    fill="#273B4A"
                  />
                  <text
                    x={badgePt.x}
                    y={badgePt.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="8.5"
                    fontWeight="800"
                    fill="#FFFFFF"
                    letterSpacing="0.5"
                  >
                    {axis.label}
                  </text>
                </g>
              );
            })}

            {/* Aspect Lines (Strictly Inside Central Hub, Interactive) */}
            {filteredAspects.map(({ aspect, index }) => {
              const p1 = planetByName.get(aspect.planet1);
              const p2 = planetByName.get(aspect.planet2);
              if (!p1 || !p2) return null;
              const a = polar(p1.longitude, ascLon, R_ASPECT_RING - 2);
              const b = polar(p2.longitude, ascLon, R_ASPECT_RING - 2);
              const st = ASPECT_STYLES[aspect.aspectType] || { color: "#7B8776", width: 1.2 };
              const isSelected = selection?.kind === "aspect" && selection.index === index;

              return (
                <g
                  key={`${aspect.planet1}-${aspect.planet2}-${aspect.aspectType}-${index}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Aspek ${aspect.planet1} ${aspect.aspectType} ${aspect.planet2}`}
                  onClick={() => setSelection({ kind: "aspect", index })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelection({ kind: "aspect", index });
                    }
                  }}
                  className="cursor-pointer"
                >
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="transparent"
                    strokeWidth="12"
                  />
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={st.color}
                    strokeWidth={isSelected ? st.width + 1.4 : st.width}
                    strokeDasharray={st.dash}
                    opacity={isSelected ? "1" : "0.78"}
                  />
                </g>
              );
            })}

            {/* Natal Planets (True Longitude Rim Tick + Staggered Glyph + Leader Line) */}
            {placedNatal.map((item) => {
              const { planet, trueLon, displayLon, radius, shifted } = item;
              const rimDot = polar(trueLon, ascLon, R_TICK_INNER);
              const rimInner = polar(trueLon, ascLon, R_TICK_INNER - 6);
              const pos = polar(displayLon, ascLon, radius);
              const isSelected =
                (selection?.kind === "planet" && selection.name === planet.name) ||
                selectedPlanet === planet.name;
              const glyph = PLANET_GLYPHS[planet.name] || planet.name.slice(0, 2);
              const degLabel = `${Math.floor(planet.degreeInSign)}°`;

              return (
                <g
                  key={planet.name}
                  role="button"
                  tabIndex={0}
                  aria-label={`Baca ${planet.name} di ${planet.sign}`}
                  aria-pressed={isSelected}
                  onClick={() => handleSelectPlanet(planet.name)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelectPlanet(planet.name);
                    }
                  }}
                  className="cursor-pointer"
                >
                  {/* Exact Canonical Longitude Marker */}
                  <line
                    x1={rimDot.x}
                    y1={rimDot.y}
                    x2={rimInner.x}
                    y2={rimInner.y}
                    stroke={isSelected ? "#D4AF37" : "#273B4A"}
                    strokeWidth="1.6"
                  />
                  <circle cx={rimDot.x} cy={rimDot.y} r="2.2" fill={isSelected ? "#D4AF37" : "#273B4A"} />

                  {/* Leader Line if Staggered */}
                  {shifted && (
                    <line
                      x1={rimInner.x}
                      y1={rimInner.y}
                      x2={pos.x}
                      y2={pos.y}
                      stroke="#7B8776"
                      strokeWidth="0.9"
                      strokeDasharray="2 1.5"
                      opacity="0.7"
                    />
                  )}

                  {/* Touch Target Hit Area */}
                  <circle cx={pos.x} cy={pos.y} r="17" fill="transparent" />

                  {/* Planet Badge */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? "12.5" : "11"}
                    fill={isSelected ? "#D4AF37" : "#FFFFFF"}
                    stroke={isSelected ? "#273B4A" : "#4F5E52"}
                    strokeWidth={isSelected ? "2" : "1.3"}
                  />
                  <text
                    x={pos.x}
                    y={pos.y - 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="13.5"
                    fontWeight="700"
                    fill="#273B4A"
                    style={{ fontFamily: GLYPH_FONT }}
                  >
                    {glyph}
                  </text>
                  <text
                    x={pos.x}
                    y={pos.y + 15.5}
                    textAnchor="middle"
                    fontSize="7.2"
                    fontWeight="700"
                    fill="#4F5E52"
                  >
                    {degLabel}
                    {planet.isRetrograde ? "R" : ""}
                  </text>
                </g>
              );
            })}

            {/* Transit Planets Overlay (Outer Ring, Visually Distinct) */}
            {placedTransit.map((item) => {
              const { planet, trueLon, displayLon, radius } = item;
              const rimOut = polar(trueLon, ascLon, R_TRANSIT_TRACK);
              const pos = polar(displayLon, ascLon, radius);
              const isSelected = selection?.kind === "transit" && selection.name === planet.name;
              const glyph = PLANET_GLYPHS[planet.name] || planet.name.slice(0, 2);

              return (
                <g
                  key={`transit-${planet.name}`}
                  role="button"
                  tabIndex={0}
                  aria-label={`Transit ${planet.name} di ${planet.sign}`}
                  onClick={() => setSelection({ kind: "transit", name: planet.name })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelection({ kind: "transit", name: planet.name });
                    }
                  }}
                  className="cursor-pointer"
                >
                  <line
                    x1={rimOut.x}
                    y1={rimOut.y}
                    x2={pos.x}
                    y2={pos.y}
                    stroke="#B45309"
                    strokeWidth="0.9"
                    opacity="0.65"
                  />
                  <circle cx={pos.x} cy={pos.y} r="15" fill="transparent" />
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r="10"
                    fill={isSelected ? "#B45309" : "#FFF8E7"}
                    stroke="#B45309"
                    strokeWidth="1.5"
                  />
                  <text
                    x={pos.x}
                    y={pos.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11.5"
                    fontWeight="700"
                    fill={isSelected ? "#FFFFFF" : "#92400E"}
                    style={{ fontFamily: GLYPH_FONT }}
                  >
                    {glyph}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Interactive Aspect Legend & Filter */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setActiveAspectFilter("ALL")}
          className={`min-h-[34px] rounded-full px-3 py-1 text-[11px] font-bold transition ${
            activeAspectFilter === "ALL"
              ? "bg-[#273B4A] text-white"
              : "border border-[#DED7CA] bg-white text-[#4F5E52]"
          }`}
        >
          {isEn ? "All Aspects" : "Semua Aspek"} ({natal.aspects.length})
        </button>
        {Object.entries(ASPECT_STYLES).map(([type, st]) => {
          const count = natal.aspects.filter((a) => a.aspectType === type).length;
          if (count === 0) return null;
          const active = activeAspectFilter === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setActiveAspectFilter(active ? "ALL" : type)}
              className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition ${
                active
                  ? "border-[#273B4A] bg-[#273B4A] text-white"
                  : "border-[#DED7CA] bg-white text-[#4F5E52] hover:bg-[#F5F1E8]"
              }`}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: st.color }}
              />
              {isEn ? st.labelEn : st.labelId} ({count})
            </button>
          );
        })}
      </div>

      {/* Dismissible Interactive Detail Drawer/Card */}
      {renderSelectionCard()}

      <p className="mt-3 text-center text-xs text-[#7B8776]">
        {isEn
          ? "Tap any planet, zodiac sign, house number, or aspect line on the wheel to inspect details."
          : "Ketuk planet, zodiak, angka house, atau garis aspek pada roda untuk melihat detail posisi & relasi."}
      </p>
    </div>
  );
}

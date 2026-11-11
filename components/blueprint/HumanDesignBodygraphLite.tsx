"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import type { HumanDesignActivation } from "@/lib/humandesign/types";
import { isEnlEdition } from "@/lib/config/edition";
import { presentHumanDesignAdvancedFields } from "@/lib/humandesign/liveContract";
import {
  getHdGateDetail,
  HD_CENTERS_CORPUS,
  HD_CHANNELS_CORPUS,
} from "@/lib/humandesign/editorialCorpus";

type Props = { humanDesign: Record<string, any>; isEn?: boolean };
type CenterKey =
  | "head"
  | "ajna"
  | "throat"
  | "g"
  | "ego"
  | "spleen"
  | "sacral"
  | "solarPlexus"
  | "root";

type BodygraphSelection =
  | { kind: "center"; key: CenterKey }
  | { kind: "channel"; id: string }
  | { kind: "gate"; gate: number }
  | null;

const PLANET_ORDER = [
  "Sun",
  "Earth",
  "North_Node",
  "South_Node",
  "Moon",
  "Mercury",
  "Venus",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
  "Pluto",
  "Chiron",
];

const PLANET_SYMBOLS: Record<string, string> = {
  Sun: "\u2609\uFE0E",
  Earth: "\u2295\uFE0E",
  North_Node: "\u260A\uFE0E",
  South_Node: "\u260B\uFE0E",
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
};

const CENTER_META: Record<
  CenterKey,
  {
    label: string;
    labelId: string;
    cx: number;
    cy: number;
    shape: "triangle-up" | "triangle-down" | "square" | "diamond" | "triangle-ego" | "triangle-right" | "triangle-left";
    points?: string;
    rect?: { x: number; y: number; width: number; height: number };
    labelPos: { x: number; y: number };
    gates: Array<{ gate: number; x: number; y: number }>;
  }
> = {
  head: {
    label: "Head",
    labelId: "Kepala",
    cx: 180,
    cy: 42,
    shape: "triangle-up",
    points: "180,14 222,68 138,68",
    labelPos: { x: 180, y: 39 },
    gates: [
      { gate: 64, x: 160, y: 56 },
      { gate: 61, x: 180, y: 56 },
      { gate: 63, x: 200, y: 56 },
    ],
  },
  ajna: {
    label: "Ajna",
    labelId: "Ajna",
    cx: 180,
    cy: 112,
    shape: "triangle-down",
    points: "138,86 222,86 180,140",
    labelPos: { x: 180, y: 127 },
    gates: [
      { gate: 47, x: 158, y: 97 },
      { gate: 24, x: 180, y: 97 },
      { gate: 4, x: 202, y: 97 },
      { gate: 17, x: 166, y: 112 },
      { gate: 43, x: 180, y: 112 },
      { gate: 11, x: 194, y: 112 },
    ],
  },
  throat: {
    label: "Throat",
    labelId: "Tenggorokan",
    cx: 180,
    cy: 184,
    shape: "square",
    rect: { x: 145, y: 156, width: 70, height: 56 },
    labelPos: { x: 180, y: 165 },
    gates: [
      { gate: 62, x: 162, y: 175 },
      { gate: 23, x: 180, y: 175 },
      { gate: 56, x: 198, y: 175 },
      { gate: 16, x: 155, y: 189 },
      { gate: 20, x: 171, y: 189 },
      { gate: 45, x: 189, y: 189 },
      { gate: 35, x: 205, y: 189 },
      { gate: 31, x: 155, y: 203 },
      { gate: 8, x: 171, y: 203 },
      { gate: 33, x: 189, y: 203 },
      { gate: 12, x: 205, y: 203 },
    ],
  },
  g: {
    label: "G",
    labelId: "Pusat G",
    cx: 180,
    cy: 268,
    shape: "diamond",
    points: "180,226 224,268 180,310 136,268",
    labelPos: { x: 180, y: 268 },
    gates: [
      { gate: 1, x: 180, y: 241 },
      { gate: 7, x: 164, y: 254 },
      { gate: 13, x: 196, y: 254 },
      { gate: 10, x: 151, y: 268 },
      { gate: 25, x: 209, y: 268 },
      { gate: 15, x: 164, y: 282 },
      { gate: 46, x: 196, y: 282 },
      { gate: 2, x: 180, y: 295 },
    ],
  },
  ego: {
    label: "Ego",
    labelId: "Jantung/Ego",
    cx: 274,
    cy: 258,
    shape: "triangle-ego",
    points: "274,230 312,282 236,282",
    labelPos: { x: 274, y: 256 },
    gates: [
      { gate: 21, x: 274, y: 245 },
      { gate: 51, x: 255, y: 271 },
      { gate: 26, x: 274, y: 271 },
      { gate: 40, x: 293, y: 271 },
    ],
  },
  spleen: {
    label: "Spleen",
    labelId: "Limpa",
    cx: 60,
    cy: 336,
    shape: "triangle-right",
    points: "26,294 98,336 26,378",
    labelPos: { x: 54, y: 314 },
    gates: [
      { gate: 48, x: 38, y: 310 },
      { gate: 57, x: 38, y: 326 },
      { gate: 44, x: 38, y: 344 },
      { gate: 50, x: 38, y: 362 },
      { gate: 32, x: 58, y: 326 },
      { gate: 28, x: 58, y: 348 },
      { gate: 18, x: 78, y: 336 },
    ],
  },
  sacral: {
    label: "Sacral",
    labelId: "Sakral",
    cx: 180,
    cy: 356,
    shape: "square",
    rect: { x: 145, y: 328, width: 70, height: 56 },
    labelPos: { x: 180, y: 337 },
    gates: [
      { gate: 5, x: 160, y: 348 },
      { gate: 14, x: 180, y: 348 },
      { gate: 29, x: 200, y: 348 },
      { gate: 34, x: 160, y: 362 },
      { gate: 27, x: 180, y: 362 },
      { gate: 59, x: 200, y: 362 },
      { gate: 42, x: 160, y: 376 },
      { gate: 3, x: 180, y: 376 },
      { gate: 9, x: 200, y: 376 },
    ],
  },
  solarPlexus: {
    label: "Solar",
    labelId: "Solar Plexus",
    cx: 300,
    cy: 336,
    shape: "triangle-left",
    points: "334,294 262,336 334,378",
    labelPos: { x: 306, y: 314 },
    gates: [
      { gate: 6, x: 282, y: 336 },
      { gate: 36, x: 302, y: 326 },
      { gate: 37, x: 302, y: 348 },
      { gate: 22, x: 322, y: 310 },
      { gate: 55, x: 322, y: 326 },
      { gate: 30, x: 322, y: 344 },
      { gate: 49, x: 322, y: 362 },
    ],
  },
  root: {
    label: "Root",
    labelId: "Akar",
    cx: 180,
    cy: 433,
    shape: "square",
    rect: { x: 142, y: 406, width: 76, height: 54 },
    labelPos: { x: 180, y: 414 },
    gates: [
      { gate: 53, x: 158, y: 424 },
      { gate: 60, x: 180, y: 424 },
      { gate: 52, x: 202, y: 424 },
      { gate: 54, x: 158, y: 438 },
      { gate: 38, x: 180, y: 438 },
      { gate: 58, x: 202, y: 438 },
      { gate: 19, x: 158, y: 452 },
      { gate: 39, x: 180, y: 452 },
      { gate: 41, x: 202, y: 452 },
    ],
  },
};

const CHANNELS: Record<
  string,
  {
    gates: [number, number];
    centers: [CenterKey, CenterKey];
    path: [number, number, number, number];
  }
> = {
  "64-47": { gates: [64, 47], centers: ["head", "ajna"], path: [164, 68, 164, 86] },
  "61-24": { gates: [61, 24], centers: ["head", "ajna"], path: [180, 68, 180, 86] },
  "63-4": { gates: [63, 4], centers: ["head", "ajna"], path: [196, 68, 196, 86] },
  "17-62": { gates: [17, 62], centers: ["ajna", "throat"], path: [166, 128, 166, 156] },
  "43-23": { gates: [43, 23], centers: ["ajna", "throat"], path: [180, 140, 180, 156] },
  "11-56": { gates: [11, 56], centers: ["ajna", "throat"], path: [194, 128, 194, 156] },
  "1-8": { gates: [1, 8], centers: ["g", "throat"], path: [180, 226, 180, 212] },
  "13-33": { gates: [13, 33], centers: ["g", "throat"], path: [193, 237, 193, 212] },
  "7-31": { gates: [7, 31], centers: ["g", "throat"], path: [167, 237, 167, 212] },
  "10-20": { gates: [10, 20], centers: ["g", "throat"], path: [152, 250, 152, 212] },
  "15-5": { gates: [15, 5], centers: ["g", "sacral"], path: [165, 297, 165, 328] },
  "2-14": { gates: [2, 14], centers: ["g", "sacral"], path: [180, 310, 180, 328] },
  "46-29": { gates: [46, 29], centers: ["g", "sacral"], path: [195, 297, 195, 328] },
  "25-51": { gates: [25, 51], centers: ["g", "ego"], path: [224, 268, 245, 268] },
  "21-45": { gates: [21, 45], centers: ["ego", "throat"], path: [274, 230, 215, 196] },
  "26-44": { gates: [26, 44], centers: ["ego", "spleen"], path: [252, 282, 86, 330] },
  "40-37": { gates: [40, 37], centers: ["ego", "solarPlexus"], path: [294, 282, 294, 315] },
  "57-20": { gates: [57, 20], centers: ["spleen", "throat"], path: [56, 312, 145, 198] },
  "48-16": { gates: [48, 16], centers: ["spleen", "throat"], path: [42, 304, 145, 184] },
  "57-10": { gates: [57, 10], centers: ["spleen", "g"], path: [68, 318, 145, 275] },
  "50-27": { gates: [50, 27], centers: ["spleen", "sacral"], path: [86, 344, 145, 356] },
  "57-34": { gates: [57, 34], centers: ["spleen", "sacral"], path: [80, 336, 145, 342] },
  "59-6": { gates: [59, 6], centers: ["sacral", "solarPlexus"], path: [215, 356, 278, 344] },
  "34-20": { gates: [34, 20], centers: ["sacral", "throat"], path: [134, 338, 134, 202] },
  "34-10": { gates: [34, 10], centers: ["sacral", "g"], path: [148, 328, 148, 280] },
  "35-36": { gates: [35, 36], centers: ["throat", "solarPlexus"], path: [215, 184, 316, 304] },
  "12-22": { gates: [12, 22], centers: ["throat", "solarPlexus"], path: [215, 204, 302, 316] },
  "42-53": { gates: [42, 53], centers: ["sacral", "root"], path: [164, 384, 164, 406] },
  "3-60": { gates: [3, 60], centers: ["sacral", "root"], path: [180, 384, 180, 406] },
  "9-52": { gates: [9, 52], centers: ["sacral", "root"], path: [196, 384, 196, 406] },
  "19-49": { gates: [19, 49], centers: ["root", "solarPlexus"], path: [218, 424, 306, 362] },
  "39-55": { gates: [39, 55], centers: ["root", "solarPlexus"], path: [218, 438, 318, 369] },
  "41-30": { gates: [41, 30], centers: ["root", "solarPlexus"], path: [218, 452, 328, 375] },
  "54-32": { gates: [54, 32], centers: ["root", "spleen"], path: [142, 424, 54, 362] },
  "38-28": { gates: [38, 28], centers: ["root", "spleen"], path: [142, 438, 42, 369] },
  "58-18": { gates: [58, 18], centers: ["root", "spleen"], path: [142, 452, 32, 375] },
};

function activations(raw: unknown): HumanDesignActivation[] {
  return Array.isArray(raw)
    ? raw.filter((item) => item && Number.isFinite(Number(item.gate)) && Number.isFinite(Number(item.line)))
    : [];
}

function gateFillColor(gate: number, design: Set<number>, personality: Set<number>, active: Set<number>) {
  if (design.has(gate) && personality.has(gate)) return "url(#dualActivation)";
  if (design.has(gate)) return "#B64B43";
  if (personality.has(gate)) return "#232323";
  if (active.has(gate)) return "#9B7B39";
  return "#FFFFFF";
}

function normalizeChannel(value: string) {
  const [a, b] = value.split("-").map(Number);
  return Object.keys(CHANNELS).find((key) => {
    const [x, y] = CHANNELS[key].gates;
    return (a === x && b === y) || (a === y && b === x);
  });
}

function lookupChannelCorpus(channelKey: string) {
  if (HD_CHANNELS_CORPUS[channelKey]) return HD_CHANNELS_CORPUS[channelKey];
  const [a, b] = channelKey.split("-");
  const reversed = `${b}-${a}`;
  return HD_CHANNELS_CORPUS[reversed] || null;
}

function ActivationPanel({
  title,
  subtitle,
  rows,
  design,
  defaultOpenMobile = false,
  onSelectGate,
}: {
  title: string;
  subtitle: string;
  rows: HumanDesignActivation[];
  design: boolean;
  defaultOpenMobile?: boolean;
  onSelectGate: (gate: number) => void;
}) {
  const [openMobile, setOpenMobile] = useState(defaultOpenMobile);
  const sorted = [...rows].sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet));

  return (
    <div className="min-w-0 rounded-2xl border border-[#DED7CA] bg-white p-3 shadow-xs">
      <button
        type="button"
        onClick={() => setOpenMobile((prev) => !prev)}
        aria-expanded={openMobile}
        className="flex w-full items-center justify-between gap-2 text-left md:pointer-events-none"
      >
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-[0.16em] ${design ? "text-[#B64B43]" : "text-[#232323]"}`}>
            {title}
          </h3>
          <p className="text-[10px] text-[#7B8776]">{subtitle} ({sorted.length})</p>
        </div>
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F0E8] text-[#4F5E52] md:hidden">
          {openMobile ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>

      <div className={`${openMobile ? "mt-3 block" : "hidden"} md:mt-3 md:block`}>
        {sorted.length > 0 ? (
          <div className="divide-y divide-[#F2EDE3]">
            {sorted.map((row, index) => (
              <button
                key={`${row.planet}-${index}`}
                type="button"
                onClick={() => onSelectGate(Number(row.gate))}
                className="grid w-full grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-0.5 py-1.5 text-left text-xs transition hover:bg-[#FAF7F0] rounded-lg px-1"
              >
                <span className={`text-center ${design ? "text-[#B64B43]" : "text-[#232323]"}`}>
                  {PLANET_SYMBOLS[row.planet] || "•"}
                </span>
                <span className="truncate font-medium text-[#5D574F]">
                  {row.planet.replaceAll("_", " ")}
                </span>
                <span className={`font-mono font-bold ${design ? "text-[#B64B43]" : "text-[#232323]"}`}>
                  {row.gate}.{row.line}
                </span>
                {(row.color !== undefined || row.tone !== undefined || row.base !== undefined) && (
                  <span className="col-span-2 col-start-2 text-right font-mono text-[10px] text-[#8E867B]">
                    {row.color !== undefined ? `C${row.color}` : ""}
                    {row.tone !== undefined ? ` T${row.tone}` : ""}
                    {row.base !== undefined ? ` B${row.base}` : ""}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs leading-5 text-[#9A9388]">
            Activation data is not present in this stored blueprint.
          </p>
        )}
      </div>
    </div>
  );
}

export function HumanDesignBodygraphLite({ humanDesign, isEn = isEnlEdition() }: Props) {
  const [selection, setSelection] = useState<BodygraphSelection>(null);

  const diagnostic = humanDesign.diagnostic || {};
  const designRows = activations(
    humanDesign.designActivations?.length
      ? humanDesign.designActivations
      : humanDesign.raw_design_gates || diagnostic.raw_design_gates,
  );
  const personalityRows = activations(
    humanDesign.personalityActivations?.length
      ? humanDesign.personalityActivations
      : humanDesign.raw_personality_gates || diagnostic.raw_personality_gates,
  );
  const designGates = new Set(designRows.map((row) => Number(row.gate)));
  const personalityGates = new Set(personalityRows.map((row) => Number(row.gate)));
  const aggregateGates = new Set<number>((humanDesign.gates || []).map(Number));
  const activeChannels = Array.from(
    new Set((humanDesign.channels || []).map(String).map(normalizeChannel).filter(Boolean) as string[]),
  );
  const activeChannelSet = new Set(activeChannels);
  const channelGates = activeChannels.flatMap((channel) => CHANNELS[channel].gates);
  const activeGates = new Set<number>([
    ...aggregateGates,
    ...designGates,
    ...personalityGates,
    ...channelGates,
  ]);
  const channelCenters = new Set(activeChannels.flatMap((channel) => CHANNELS[channel].centers));
  const storedUnavailable = isEn
    ? "Unavailable in this stored blueprint"
    : "Tidak tersedia pada blueprint tersimpan ini";
  const advanced = presentHumanDesignAdvancedFields(humanDesign, storedUnavailable);
  const variableCode = advanced.variableCode;
  const sourceUnavailable = isEn
    ? "Unavailable from current calculation source"
    : "Tidak tersedia dari sumber kalkulasi saat ini";

  const isCenterDefined = (key: CenterKey) =>
    humanDesign.centers?.[key] === true || channelCenters.has(key);

  const renderSelectionDetail = () => {
    if (!selection) return null;

    if (selection.kind === "center") {
      const meta = CENTER_META[selection.key];
      const corpus = HD_CENTERS_CORPUS[selection.key];
      const defined = isCenterDefined(selection.key);
      return (
        <div
          role="region"
          aria-label="Detail pusat energi terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                  defined
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-[#F5F0E8] text-[#6E675F] border border-[#DED7CA]"
                }`}
              >
                {defined
                  ? isEn
                    ? "Defined Center"
                    : "Pusat Terdefinisi"
                  : isEn
                  ? "Undefined / Open Center"
                  : "Pusat Terbuka / Tidak Terdefinisi"}
              </span>
              <h3 className="mt-1 font-serif text-lg font-bold text-[#4F5E52]">
                {corpus?.nameId || meta.label}
              </h3>
              {corpus?.domain && (
                <p className="mt-0.5 text-xs italic text-[#7B8776]">{corpus.domain}</p>
              )}
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
          {corpus && (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#4F5E52]">
              <p>{defined ? corpus.definedEssence : corpus.openEssence}</p>
              <div className="grid gap-2 sm:grid-cols-2 pt-1">
                <div className="rounded-xl bg-[#F7FAF6] p-2.5 border border-[#E2ECE0]">
                  <strong className="text-[#4F8A5B]">
                    {defined ? "Kekuatan Alami:" : "Kebijaksanaan Terbuka:"}
                  </strong>{" "}
                  {defined ? corpus.definedGift : corpus.openGift}
                </div>
                <div className="rounded-xl bg-[#FAF6F0] p-2.5 border border-[#ECE3D5]">
                  <strong className="text-[#9A6B16]">
                    {defined ? "Titik Buta:" : "Panduan Melepas Beban:"}
                  </strong>{" "}
                  {defined ? corpus.definedShadow : corpus.openDeconditioning}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (selection.kind === "channel") {
      const ch = CHANNELS[selection.id];
      const corpus = lookupChannelCorpus(selection.id);
      if (!ch) return null;
      return (
        <div
          role="region"
          aria-label="Detail channel terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Channel {selection.id} · {CENTER_META[ch.centers[0]].labelId} ↔ {CENTER_META[ch.centers[1]].labelId}
                {corpus ? ` · Sirkuit ${corpus.circuit}` : ""}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#4F5E52]">
                {corpus?.name || `Channel ${selection.id}`}
              </h3>
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
          {corpus && (
            <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#4F5E52]">
              <p>{corpus.essence}</p>
              <p className="rounded-xl bg-[#F7F3EC] p-2.5">
                <strong>Manifestasi:</strong> {corpus.practicalManifestation}
              </p>
              <p className="rounded-xl bg-[#FFF8F6] p-2.5">
                <strong>Tantangan:</strong> {corpus.challenge}
              </p>
            </div>
          )}
        </div>
      );
    }

    if (selection.kind === "gate") {
      const detail = getHdGateDetail(selection.gate);
      const isDesign = designGates.has(selection.gate);
      const isPersonality = personalityGates.has(selection.gate);
      const isActive = activeGates.has(selection.gate);
      const statusLabel =
        isDesign && isPersonality
          ? "Aktif di Design & Personality"
          : isDesign
          ? "Aktif di Design (Bawah Sadar)"
          : isPersonality
          ? "Aktif di Personality (Sadar)"
          : isActive
          ? "Aktif"
          : "Tidak Aktif pada Chart Ini";

      return (
        <div
          role="region"
          aria-label="Detail gate terpilih"
          className="mt-4 rounded-2xl border border-[#DED7CA] bg-white p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7B8776]">
                Gate {selection.gate} · {detail.center} · {statusLabel}
              </span>
              <h3 className="mt-0.5 font-serif text-lg font-bold text-[#4F5E52]">
                Gate {detail.gate} — {detail.nameId}
              </h3>
              <p className="text-xs italic text-[#8A8175]">{detail.nameEn}</p>
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
          <div className="mt-3 space-y-2 text-xs leading-relaxed text-[#4F5E52]">
            <p>{detail.explanation}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl bg-[#F7FAF6] p-2.5 border border-[#E2ECE0]">
                <strong className="text-[#4F8A5B]">Gift:</strong> {detail.gift}
              </div>
              <div className="rounded-xl bg-[#FFF8F6] p-2.5 border border-[#F5E2DF]">
                <strong className="text-[#C25E5E]">Shadow:</strong> {detail.shadow}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <section className="w-full min-w-0 rounded-3xl border border-[#D9D0C2] bg-[#F5F0E8] p-3 sm:p-5 shadow-sm">
      {/* 1. HEADER HUMAN DESIGN */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A746D]">
            {isEn ? "BodyGraph Energy Map" : "Peta Energi BodyGraph"}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-[#4F5E52]">
            {isEn ? "Human Design BodyGraph" : "BodyGraph Human Design"}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5 text-xs">
          {humanDesign.type && (
            <span className="rounded-full border border-[#DED7CA] bg-white px-3 py-1 font-semibold text-[#4F5E52]">
              {humanDesign.type}
            </span>
          )}
          {humanDesign.definition && (
            <span className="rounded-full border border-[#DED7CA] bg-white px-3 py-1 font-medium text-[#716A60]">
              {humanDesign.definition}
            </span>
          )}
        </div>
      </div>

      {/* 2, 3, 4. RESPONSIVE STACK ON MOBILE -> BODYGRAPH FIRST, THEN DESIGN, THEN PERSONALITY; 3-COL ON TABLET/DESKTOP */}
      <div className="flex flex-col gap-3 md:grid md:grid-cols-[minmax(160px,195px)_minmax(280px,1fr)_minmax(160px,195px)] md:items-start">
        {/* Main BodyGraph Diagram (1st in mobile flow, middle column on desktop) */}
        <div className="order-1 min-w-0 rounded-2xl border border-[#DED7CA] bg-white p-2 sm:p-3 md:order-2">
          <svg
            viewBox="0 0 360 470"
            className="mx-auto block h-auto w-full max-w-[380px] select-none"
            role="img"
            aria-label="Human Design Bodygraph V2"
          >
            <defs>
              <linearGradient id="dualActivation" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="#B64B43" />
                <stop offset="50%" stopColor="#232323" />
              </linearGradient>
            </defs>

            {/* All 36 Channel Tracks (Inactive Base + Hanging Gate Halves + Active Full Channels) */}
            {Object.entries(CHANNELS).map(([channelId, ch]) => {
              const [x1, y1, x2, y2] = ch.path;
              const mx = (x1 + x2) / 2;
              const my = (y1 + y2) / 2;
              const [gateA, gateB] = ch.gates;
              const isFullActive = activeChannelSet.has(channelId);
              const isSelected = selection?.kind === "channel" && selection.id === channelId;

              const gateAColor = activeGates.has(gateA)
                ? gateFillColor(gateA, designGates, personalityGates, activeGates)
                : null;
              const gateBColor = activeGates.has(gateB)
                ? gateFillColor(gateB, designGates, personalityGates, activeGates)
                : null;

              const hasDesign =
                designGates.has(gateA) || designGates.has(gateB);
              const hasPersonality =
                personalityGates.has(gateA) || personalityGates.has(gateB);
              const fullStroke =
                hasDesign && hasPersonality
                  ? "url(#dualActivation)"
                  : hasDesign
                  ? "#B64B43"
                  : "#232323";

              return (
                <g
                  key={channelId}
                  role="button"
                  tabIndex={0}
                  aria-label={`Channel ${channelId}`}
                  onClick={() => setSelection({ kind: "channel", id: channelId })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelection({ kind: "channel", id: channelId });
                    }
                  }}
                  className="cursor-pointer"
                >
                  {/* Wide transparent hit target */}
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth="11" />
                  {/* Base inactive track */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#E7E1D6"
                    strokeWidth="4.2"
                    strokeLinecap="round"
                  />
                  {isFullActive ? (
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={fullStroke}
                      strokeWidth={isSelected ? "7.5" : "5.5"}
                      strokeLinecap="round"
                    />
                  ) : (
                    <>
                      {gateAColor && (
                        <line
                          x1={x1}
                          y1={y1}
                          x2={mx}
                          y2={my}
                          stroke={gateAColor}
                          strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                      )}
                      {gateBColor && (
                        <line
                          x1={x2}
                          y1={y2}
                          x2={mx}
                          y2={my}
                          stroke={gateBColor}
                          strokeWidth="4.5"
                          strokeLinecap="round"
                        />
                      )}
                    </>
                  )}
                </g>
              );
            })}

            {/* 9 Energy Centers + Interactive Gate Nodes */}
            {(Object.keys(CENTER_META) as CenterKey[]).map((key) => {
              const center = CENTER_META[key];
              const defined = isCenterDefined(key);
              const isSelectedCenter = selection?.kind === "center" && selection.key === key;
              const fill = defined ? "#E4C16B" : "#FFFFFF";
              const stroke = isSelectedCenter ? "#273B4A" : "#4F5E52";
              const strokeWidth = isSelectedCenter ? "2.8" : "2";

              return (
                <g key={key}>
                  <g
                    role="button"
                    tabIndex={0}
                    aria-label={`${center.label} Center`}
                    onClick={() => setSelection({ kind: "center", key })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelection({ kind: "center", key });
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {center.rect ? (
                      <rect
                        x={center.rect.x}
                        y={center.rect.y}
                        width={center.rect.width}
                        height={center.rect.height}
                        rx="7"
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                      />
                    ) : (
                      <polygon
                        points={center.points}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeWidth}
                        strokeLinejoin="round"
                      />
                    )}
                    <text
                      x={center.labelPos.x}
                      y={center.labelPos.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="7"
                      fontWeight="800"
                      fill="#4F5E52"
                      opacity="0.85"
                    >
                      {center.label.toUpperCase()}
                    </text>
                  </g>

                  {center.gates.map(({ gate, x, y }) => {
                    const isGateActive = activeGates.has(gate);
                    const isSelectedGate = selection?.kind === "gate" && selection.gate === gate;
                    return (
                      <g
                        key={gate}
                        role="button"
                        tabIndex={0}
                        aria-label={`Gate ${gate}`}
                        onClick={() => setSelection({ kind: "gate", gate })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            setSelection({ kind: "gate", gate });
                          }
                        }}
                        className="cursor-pointer"
                      >
                        <circle cx={x} cy={y} r="9" fill="transparent" />
                        <circle
                          cx={x}
                          cy={y}
                          r={isSelectedGate ? "7.2" : "6"}
                          fill={gateFillColor(gate, designGates, personalityGates, activeGates)}
                          stroke={isSelectedGate ? "#D4AF37" : isGateActive ? "#273B4A" : "#C9C0B2"}
                          strokeWidth={isSelectedGate ? "1.8" : "1"}
                        />
                        <text
                          x={x}
                          y={y}
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="6.5"
                          fontWeight="700"
                          fill={isGateActive ? "#FFFFFF" : "#6F685E"}
                        >
                          {gate}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })}
          </svg>

          <p className="mt-2 text-center text-[11px] text-[#7B8776]">
            {isEn
              ? "Tap any center, gate, or channel in the diagram to inspect its meaning."
              : "Ketuk pusat energi, gate, atau channel pada diagram untuk melihat penjelasannya."}
          </p>
        </div>

        {/* Design Activation (2nd in mobile flow, 1st column on desktop) */}
        <div className="order-2 min-w-0 md:order-1">
          <ActivationPanel
            title="Design"
            subtitle={isEn ? "Unconscious · Body" : "Bawah Sadar · Tubuh"}
            rows={designRows}
            design
            defaultOpenMobile
            onSelectGate={(gate) => setSelection({ kind: "gate", gate })}
          />
        </div>

        {/* Personality Activation (3rd in mobile flow, 3rd column on desktop) */}
        <div className="order-3 min-w-0 md:order-3">
          <ActivationPanel
            title="Personality"
            subtitle={isEn ? "Conscious · Mind" : "Sadar · Pikiran"}
            rows={personalityRows}
            design={false}
            defaultOpenMobile
            onSelectGate={(gate) => setSelection({ kind: "gate", gate })}
          />
        </div>
      </div>

      {/* Interactive Selection Explanation Panel */}
      {renderSelectionDetail()}

      {/* 5. CHANNEL VALIDATION & 6. ACTIVATION LEGEND */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="min-w-0 rounded-2xl bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">
            Channel Validation
          </h3>
          <div className="mt-2 space-y-2">
            {activeChannels.length > 0 ? (
              activeChannels.map((channel) => {
                const item = CHANNELS[channel];
                const corpus = lookupChannelCorpus(channel);
                const selected = selection?.kind === "channel" && selection.id === channel;
                return (
                  <button
                    key={channel}
                    type="button"
                    onClick={() => setSelection({ kind: "channel", id: channel })}
                    className={`w-full rounded-lg p-2.5 text-left text-xs transition ${
                      selected
                        ? "border border-[#4F5E52] bg-[#EFF4EE]"
                        : "bg-[#F7F3EC] hover:bg-[#EFE9DC]"
                    }`}
                  >
                    <span className="font-bold text-[#4F5E52]">{channel}</span>
                    {corpus && <span className="font-medium text-[#4F5E52]"> · {corpus.name}</span>}
                    <span className="block text-[11px] text-[#81786C]">
                      Gates {item.gates.join(" + ")} ·{" "}
                      {item.centers.map((c) => CENTER_META[c].label).join(" ↔ ")}
                    </span>
                  </button>
                );
              })
            ) : (
              <p className="text-xs text-[#81786C]">
                {isEn
                  ? "No defined channels in this chart (characteristic of Reflector or pending data)."
                  : "Tidak ada channel terdefinisi pada peta ini."}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">
            Activation Legend
          </h3>
          <div className="mt-3 space-y-2 text-xs text-[#716A60]">
            <p className="flex items-center">
              <span className="mr-2 inline-block h-3 w-3 shrink-0 rounded-full bg-[#232323]" />
              Personality (Sadar)
            </p>
            <p className="flex items-center">
              <span className="mr-2 inline-block h-3 w-3 shrink-0 rounded-full bg-[#B64B43]" />
              Design (Bawah Sadar)
            </p>
            <p className="flex items-center">
              <span className="mr-2 inline-block h-3 w-3 shrink-0 rounded-full bg-gradient-to-r from-[#B64B43] from-50% to-[#232323] to-50%" />
              Design + Personality
            </p>
            <p className="flex items-center">
              <span className="mr-2 inline-block h-3 w-3 shrink-0 rounded-full border border-[#AAA] bg-white" />
              Inactive gate / Open center
            </p>
            <p className="flex items-center">
              <span className="mr-2 inline-block h-3 w-3 shrink-0 rounded-sm border border-[#4F5E52] bg-[#E4C16B]" />
              Defined center
            </p>
          </div>
        </div>
      </div>

      {/* 6b. DETAIL TAMBAHAN: ADVANCED VARIABLES */}
      <div className="mt-3 rounded-2xl bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">
          Advanced Variables
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {advanced.fields.map(({ key, value }) => (
            <div key={key} className="rounded-xl bg-[#F7F3EC] p-3">
              <p className="text-[9px] font-bold uppercase text-[#9A9388]">{key}</p>
              <p className="mt-1 text-xs font-semibold text-[#4F5E52]">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E7E0D4] p-3 text-xs">
            <span className="font-bold text-[#4F5E52]">Variables Arrows:</span>{" "}
            {variableCode || storedUnavailable}
          </div>
          <div className="rounded-xl border border-[#E7E0D4] p-3 text-xs">
            <span className="font-bold text-[#4F5E52]">Color / Tone / Base:</span>{" "}
            {designRows.concat(personalityRows).some(
              (row) => row.color !== undefined || row.tone !== undefined || row.base !== undefined,
            )
              ? "Available in activation rows"
              : sourceUnavailable}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import type { HumanDesignActivation } from "@/lib/humandesign/types";

type Props = { humanDesign: Record<string, any> };
type CenterKey = "head" | "ajna" | "throat" | "g" | "ego" | "spleen" | "sacral" | "solarPlexus" | "root";

const PLANET_ORDER = ["Sun", "Earth", "North_Node", "South_Node", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"];
const PLANET_SYMBOLS: Record<string, string> = { Sun: "☉", Earth: "⊕", North_Node: "☊", South_Node: "☋", Moon: "☽", Mercury: "☿", Venus: "♀", Mars: "♂", Jupiter: "♃", Saturn: "♄", Uranus: "♅", Neptune: "♆", Pluto: "♇", Chiron: "⚷" };

const CENTER_GATES: Record<CenterKey, number[]> = {
  head: [64, 61, 63],
  ajna: [47, 24, 4, 17, 43, 11],
  throat: [62, 23, 56, 35, 12, 45, 33, 8, 31, 20, 16],
  g: [1, 2, 7, 10, 13, 15, 25, 46],
  ego: [21, 26, 40, 51],
  spleen: [18, 28, 32, 44, 48, 50, 57],
  sacral: [3, 5, 9, 14, 27, 29, 34, 42, 59],
  solarPlexus: [6, 22, 30, 36, 37, 49, 55],
  root: [19, 38, 39, 41, 52, 53, 54, 58, 60],
};

const CHANNELS: Record<string, { gates: [number, number]; centers: [CenterKey, CenterKey]; path: [number, number, number, number] }> = {
  "64-47": { gates: [64, 47], centers: ["head", "ajna"], path: [150, 47, 150, 76] },
  "61-24": { gates: [61, 24], centers: ["head", "ajna"], path: [140, 47, 140, 76] },
  "63-4": { gates: [63, 4], centers: ["head", "ajna"], path: [160, 47, 160, 76] },
  "17-62": { gates: [17, 62], centers: ["ajna", "throat"], path: [140, 105, 140, 137] },
  "43-23": { gates: [43, 23], centers: ["ajna", "throat"], path: [150, 105, 150, 137] },
  "11-56": { gates: [11, 56], centers: ["ajna", "throat"], path: [160, 105, 160, 137] },
  "1-8": { gates: [1, 8], centers: ["g", "throat"], path: [150, 230, 150, 165] },
  "13-33": { gates: [13, 33], centers: ["g", "throat"], path: [135, 215, 125, 165] },
  "7-31": { gates: [7, 31], centers: ["g", "throat"], path: [165, 215, 175, 165] },
  "10-20": { gates: [10, 20], centers: ["g", "throat"], path: [145, 205, 145, 165] },
  "15-5": { gates: [15, 5], centers: ["g", "sacral"], path: [140, 230, 140, 278] },
  "2-14": { gates: [2, 14], centers: ["g", "sacral"], path: [150, 230, 150, 278] },
  "46-29": { gates: [46, 29], centers: ["g", "sacral"], path: [160, 230, 160, 278] },
  "25-51": { gates: [25, 51], centers: ["g", "ego"], path: [175, 205, 210, 207] },
  "21-45": { gates: [21, 45], centers: ["ego", "throat"], path: [222, 207, 185, 150] },
  "26-44": { gates: [26, 44], centers: ["ego", "spleen"], path: [210, 220, 95, 267] },
  "40-37": { gates: [40, 37], centers: ["ego", "solarPlexus"], path: [222, 220, 222, 267] },
  "57-20": { gates: [57, 20], centers: ["spleen", "throat"], path: [90, 250, 130, 165] },
  "48-16": { gates: [48, 16], centers: ["spleen", "throat"], path: [78, 245, 115, 165] },
  "57-10": { gates: [57, 10], centers: ["spleen", "g"], path: [95, 267, 135, 215] },
  "50-27": { gates: [50, 27], centers: ["spleen", "sacral"], path: [95, 267, 135, 278] },
  "57-34": { gates: [57, 34], centers: ["spleen", "sacral"], path: [95, 267, 135, 290] },
  "59-6": { gates: [59, 6], centers: ["sacral", "solarPlexus"], path: [165, 278, 205, 267] },
  "34-20": { gates: [34, 20], centers: ["sacral", "throat"], path: [150, 290, 150, 165] },
  "34-10": { gates: [34, 10], centers: ["sacral", "g"], path: [145, 278, 145, 225] },
  "35-36": { gates: [35, 36], centers: ["throat", "solarPlexus"], path: [185, 150, 222, 250] },
  "12-22": { gates: [12, 22], centers: ["throat", "solarPlexus"], path: [175, 160, 215, 255] },
  "42-53": { gates: [42, 53], centers: ["sacral", "root"], path: [145, 300, 145, 350] },
  "3-60": { gates: [3, 60], centers: ["sacral", "root"], path: [155, 300, 155, 350] },
  "9-52": { gates: [9, 52], centers: ["sacral", "root"], path: [165, 300, 165, 350] },
  "19-49": { gates: [19, 49], centers: ["root", "solarPlexus"], path: [150, 350, 205, 285] },
  "39-55": { gates: [39, 55], centers: ["root", "solarPlexus"], path: [160, 350, 215, 285] },
  "41-30": { gates: [41, 30], centers: ["root", "solarPlexus"], path: [170, 350, 225, 285] },
  "54-32": { gates: [54, 32], centers: ["root", "spleen"], path: [140, 350, 85, 285] },
  "38-28": { gates: [38, 28], centers: ["root", "spleen"], path: [130, 350, 75, 285] },
  "58-18": { gates: [58, 18], centers: ["root", "spleen"], path: [120, 350, 65, 285] },
};

const CENTER_LAYOUT: Record<CenterKey, { label: string; x: number; y: number; width: number; height: number }> = {
  head: { label: "Head", x: 150, y: 25, width: 62, height: 40 },
  ajna: { label: "Ajna", x: 150, y: 86, width: 72, height: 48 },
  throat: { label: "Throat", x: 150, y: 150, width: 82, height: 48 },
  g: { label: "G", x: 150, y: 215, width: 76, height: 58 },
  ego: { label: "Ego", x: 235, y: 215, width: 58, height: 45 },
  spleen: { label: "Spleen", x: 62, y: 280, width: 72, height: 62 },
  sacral: { label: "Sacral", x: 150, y: 290, width: 82, height: 52 },
  solarPlexus: { label: "Solar", x: 238, y: 280, width: 72, height: 62 },
  root: { label: "Root", x: 150, y: 360, width: 92, height: 48 },
};

function activations(raw: unknown): HumanDesignActivation[] {
  return Array.isArray(raw)
    ? raw.filter((item) => item && Number.isFinite(Number(item.gate)) && Number.isFinite(Number(item.line)))
    : [];
}

function activationColor(gate: number, design: Set<number>, personality: Set<number>, active: Set<number>) {
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

function ActivationColumn({ title, rows, design }: { title: string; rows: HumanDesignActivation[]; design: boolean }) {
  const sorted = [...rows].sort((a, b) => PLANET_ORDER.indexOf(a.planet) - PLANET_ORDER.indexOf(b.planet));
  return (
    <div className="rounded-2xl border border-[#DED7CA] bg-white p-3">
      <h3 className={`mb-3 text-xs font-bold uppercase tracking-[0.18em] ${design ? "text-[#B64B43]" : "text-[#232323]"}`}>{title}</h3>
      <div className="space-y-1">
        {sorted.map((row, index) => (
          <div key={`${row.planet}-${index}`} className="grid grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-1 text-[11px]">
            <span className={design ? "text-[#B64B43]" : "text-[#232323]"}>{PLANET_SYMBOLS[row.planet] || "•"}</span>
            <span className="truncate text-[#716A60]">{row.planet.replaceAll("_", " ")}</span>
            <span className={`font-mono font-bold ${design ? "text-[#B64B43]" : "text-[#232323]"}`}>{row.gate}.{row.line}</span>
            {(row.color !== undefined || row.tone !== undefined || row.base !== undefined) && (
              <span className="col-start-2 col-span-2 text-right font-mono text-[8px] text-[#9A9388]">C{row.color ?? "–"} T{row.tone ?? "–"} B{row.base ?? "–"}</span>
            )}
          </div>
        ))}
        {!sorted.length && <p className="text-xs leading-5 text-[#9A9388]">Activation data is not present in this stored blueprint.</p>}
      </div>
    </div>
  );
}

export function HumanDesignBodygraphLite({ humanDesign }: Props) {
  const diagnostic = humanDesign.diagnostic || {};
  const designRows = activations(humanDesign.designActivations?.length ? humanDesign.designActivations : humanDesign.raw_design_gates || diagnostic.raw_design_gates);
  const personalityRows = activations(humanDesign.personalityActivations?.length ? humanDesign.personalityActivations : humanDesign.raw_personality_gates || diagnostic.raw_personality_gates);
  const designGates = new Set(designRows.map((row) => row.gate));
  const personalityGates = new Set(personalityRows.map((row) => row.gate));
  const aggregateGates = new Set<number>((humanDesign.gates || []).map(Number));
  const activeChannels = (humanDesign.channels || []).map(String).map(normalizeChannel).filter(Boolean) as string[];
  const channelGates = activeChannels.flatMap((channel) => CHANNELS[channel].gates);
  const activeGates = new Set<number>([...aggregateGates, ...designGates, ...personalityGates, ...channelGates]);
  const channelCenters = new Set(activeChannels.flatMap((channel) => CHANNELS[channel].centers));
  const variables = humanDesign.variables?.advanced || humanDesign.variables || {};

  return (
    <section className="rounded-3xl border border-[#D9D0C2] bg-[#F5F0E8] p-4 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9A746D]">Human Design Audit Tool</p>
          <h2 className="mt-1 font-serif text-2xl text-[#4F5E52]">Bodygraph V2</h2>
        </div>
        <div className="text-right text-xs text-[#716A60]"><p>{humanDesign.type}</p><p>{humanDesign.definition}</p></div>
      </div>

      <div className="grid grid-cols-[minmax(86px,1fr)_minmax(170px,1.7fr)_minmax(86px,1fr)] gap-2">
        <ActivationColumn title="Design" rows={designRows} design />
        <div className="rounded-2xl border border-[#DED7CA] bg-white p-1">
          <svg viewBox="0 0 300 395" className="h-auto w-full" aria-label="Human Design Bodygraph V2">
            <defs><linearGradient id="dualActivation"><stop offset="50%" stopColor="#B64B43" /><stop offset="50%" stopColor="#232323" /></linearGradient></defs>
            {activeChannels.map((channel) => {
              const { path, gates } = CHANNELS[channel];
              const hasDesign = gates.some((gate) => designGates.has(gate));
              const hasPersonality = gates.some((gate) => personalityGates.has(gate));
              const stroke = hasDesign && hasPersonality ? "url(#dualActivation)" : hasDesign ? "#B64B43" : "#232323";
              return <line key={channel} x1={path[0]} y1={path[1]} x2={path[2]} y2={path[3]} stroke={stroke} strokeWidth="6" strokeLinecap="round" />;
            })}
            {(Object.keys(CENTER_LAYOUT) as CenterKey[]).map((key) => {
              const center = CENTER_LAYOUT[key];
              const defined = humanDesign.centers?.[key] === true || channelCenters.has(key);
              const gates = CENTER_GATES[key];
              return (
                <g key={key}>
                  <rect x={center.x - center.width / 2} y={center.y - center.height / 2} width={center.width} height={center.height} rx="7" fill={defined ? "#D8B45D" : "#FFFFFF"} stroke="#4F5E52" strokeWidth="2" />
                  <text x={center.x} y={center.y - center.height / 2 + 11} textAnchor="middle" fontSize="8" fontWeight="700" fill="#4F5E52">{center.label}</text>
                  {gates.map((gate, index) => {
                    const columns = Math.min(5, gates.length);
                    const row = Math.floor(index / columns);
                    const col = index % columns;
                    const x = center.x - ((columns - 1) * 11) / 2 + col * 11;
                    const y = center.y + 2 + row * 12;
                    return <g key={gate}><circle cx={x} cy={y} r="5" fill={activationColor(gate, designGates, personalityGates, activeGates)} stroke={activeGates.has(gate) ? "#4F5E52" : "#CFC7BA"} /><text x={x} y={y + 2.5} textAnchor="middle" fontSize="5.5" fill={activeGates.has(gate) ? "#FFFFFF" : "#968E82"}>{gate}</text></g>;
                  })}
                </g>
              );
            })}
          </svg>
        </div>
        <ActivationColumn title="Personality" rows={personalityRows} design={false} />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">Channel Validation</h3>
          <div className="mt-2 space-y-2">{activeChannels.map((channel) => {
            const item = CHANNELS[channel];
            return <div key={channel} className="rounded-lg bg-[#F7F3EC] p-2 text-[11px]"><span className="font-bold text-[#4F5E52]">{channel}</span><span className="text-[#81786C]"> · Gates {item.gates.join(" + ")} · {item.centers.map((c) => CENTER_LAYOUT[c].label).join(" ↔ ")}</span></div>;
          })}</div>
        </div>
        <div className="rounded-2xl bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">Activation Legend</h3>
          <div className="mt-3 space-y-2 text-xs text-[#716A60]">
            <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#232323]" />Personality</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-[#B64B43]" />Design</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded-full bg-gradient-to-r from-[#B64B43] from-50% to-[#232323] to-50%" />Both</p>
            <p><span className="mr-2 inline-block h-3 w-3 rounded-full border border-[#AAA] bg-white" />Inactive gate</p>
          </div>
        </div>
      </div>

      <div className="mt-3 rounded-2xl bg-white p-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#7B8776]">Advanced Variables</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {["digestion", "environment", "motivation", "perspective", "cognition"].map((key) => <div key={key} className="rounded-xl bg-[#F7F3EC] p-3"><p className="text-[9px] font-bold uppercase text-[#9A9388]">{key}</p><p className="mt-1 text-xs font-semibold text-[#4F5E52]">{humanDesign[key] || "Not stored"}</p></div>)}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#E7E0D4] p-3 text-xs"><span className="font-bold text-[#4F5E52]">Variables Arrows:</span> {variables.variable || variables.value || "Not stored"}</div>
          <div className="rounded-xl border border-[#E7E0D4] p-3 text-xs"><span className="font-bold text-[#4F5E52]">Color / Tone / Base:</span> {designRows.concat(personalityRows).some((row) => row.color || row.tone || row.base) ? "Available in activation rows" : "Not stored"}</div>
        </div>
      </div>
    </section>
  );
}

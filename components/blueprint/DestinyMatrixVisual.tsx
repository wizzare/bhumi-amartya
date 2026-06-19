"use client";

import type { DestinyMatrixVisualModel, DestinyMatrixVisualValue } from "@/lib/visual/destinyMatrixVisualModel";

type Props = { matrix: DestinyMatrixVisualModel };

export const chakraColors: Record<string, string> = {
  Sahasrara: "#A56BBC",
  Ajna: "#5FA8B8",
  Vishudha: "#7CC7BC",
  Anahata: "#83BE58",
  Manipura: "#F3C75F",
  Svadhisthana: "#F57336",
  Muladhara: "#D84242",
  Total: "#D6D0C7",
};

function getNodeColor(id: string) {
  if (["BM01", "BM02", "BM06"].includes(id)) return chakraColors.Sahasrara;
  if (["BM14", "BM15"].includes(id)) return chakraColors.Ajna;
  if (["BM12", "BM13"].includes(id)) return chakraColors.Vishudha;
  if (["BM18", "BM19"].includes(id)) return chakraColors.Anahata;
  if (["BM05"].includes(id)) return chakraColors.Manipura;
  if (["BM10", "BM11", "BM08", "BM09", "BM30", "BM29", "BM31", "BM32"].includes(id)) return chakraColors.Svadhisthana;
  if (["BM03", "BM04"].includes(id)) return chakraColors.Muladhara;
  return "#6B746C";
}

export function MatrixDiagram({ matrix }: { matrix: DestinyMatrixVisualModel }) {
  const v = (id: string) => matrix.nodeMap[id] ?? 0;
  
  const R = 150;
  const cx = 200;
  const cy = 200;

  // Outer nodes
  const outerNodes = [
    { id: "BM02", x: cx, y: cy - R, solid: true }, // Top
    { id: "BM07", x: cx + R * 0.707, y: cy - R * 0.707, solid: false }, // TR
    { id: "BM03", x: cx + R, y: cy, solid: true }, // Right
    { id: "BM09", x: cx + R * 0.707, y: cy + R * 0.707, solid: false }, // BR
    { id: "BM04", x: cx, y: cy + R, solid: true }, // Bottom
    { id: "BM08", x: cx - R * 0.707, y: cy + R * 0.707, solid: false }, // BL
    { id: "BM01", x: cx - R, y: cy, solid: true }, // Left
    { id: "BM06", x: cx - R * 0.707, y: cy - R * 0.707, solid: false }, // TL
  ];

  // Axes points for lines
  const leftX = cx - R, rightX = cx + R, topY = cy - R, bottomY = cy + R;
  const tlX = cx - R * 0.707, tlY = cy - R * 0.707;
  const trX = cx + R * 0.707, trY = cy - R * 0.707;
  const brX = cx + R * 0.707, brY = cy + R * 0.707;
  const blX = cx - R * 0.707, blY = cy + R * 0.707;

  const innerNodes = [
    // Top axis
    { id: "BM15", x: cx, y: topY + (cy - topY) * 0.25, solid: true },
    { id: "BM13", x: cx, y: topY + (cy - topY) * 0.5, solid: true },
    { id: "BM19", x: cx, y: topY + (cy - topY) * 0.75, solid: true },
    // Left axis
    { id: "BM14", x: leftX + (cx - leftX) * 0.25, y: cy, solid: true },
    { id: "BM12", x: leftX + (cx - leftX) * 0.5, y: cy, solid: true },
    { id: "BM18", x: leftX + (cx - leftX) * 0.75, y: cy, solid: true },
    // Right axis
    { id: "BM16", x: rightX - (rightX - cx) * 0.33, y: cy, solid: false },
    { id: "BM11", x: rightX - (rightX - cx) * 0.66, y: cy, solid: true },
    // Bottom axis
    { id: "BM17", x: cx, y: bottomY - (bottomY - cy) * 0.33, solid: false },
    { id: "BM10", x: cx, y: bottomY - (bottomY - cy) * 0.66, solid: true },
    // Father Line Nodes
    { id: "BM26", x: tlX + (cx - tlX) * 0.33, y: tlY + (cy - tlY) * 0.33, solid: false },
    { id: "BM25", x: tlX + (cx - tlX) * 0.66, y: tlY + (cy - tlY) * 0.66, solid: false },
    { id: "BM28", x: trX - (trX - cx) * 0.33, y: trY + (cy - trY) * 0.33, solid: false },
    { id: "BM27", x: trX - (trX - cx) * 0.66, y: trY + (cy - trY) * 0.66, solid: false },
    // Mother Line Nodes
    { id: "BM30", x: blX + (cx - blX) * 0.33, y: blY - (blY - cy) * 0.33, solid: false },
    { id: "BM29", x: blX + (cx - blX) * 0.66, y: blY - (blY - cy) * 0.66, solid: false },
    { id: "BM32", x: brX - (brX - cx) * 0.33, y: brY - (brY - cy) * 0.33, solid: false },
    { id: "BM31", x: brX - (brX - cx) * 0.66, y: brY - (brY - cy) * 0.66, solid: false },
  ];

  // Love/Money nodes
  const bm10 = { x: cx, y: bottomY - (bottomY - cy) * 0.66 };
  const bm11 = { x: rightX - (rightX - cx) * 0.66, y: cy };
  const loveMoneyNodes = [
    { id: "BM20", x: bm10.x + (bm11.x - bm10.x) * 0.5, y: bm10.y + (bm11.y - bm10.y) * 0.5, solid: false },
    { id: "BM21", x: bm10.x + (bm11.x - bm10.x) * 0.25, y: bm10.y + (bm11.y - bm10.y) * 0.25, solid: false }, // Near Heart
    { id: "BM22", x: bm10.x + (bm11.x - bm10.x) * 0.75, y: bm10.y + (bm11.y - bm10.y) * 0.75, solid: false }, // Near $
  ];

  // Center node
  const centerNode = { id: "BM05", x: cx, y: cy, solid: true, r: 18 };

  // Age timeline perimeter (56 segments)
  const renderAgePerimeter = () => {
    if (matrix.timeline.status !== "ready") return null;
    const elements = [];
    const corners = [
      { x: leftX, y: cy }, { x: tlX, y: tlY }, { x: cx, y: topY }, { x: trX, y: trY },
      { x: rightX, y: cy }, { x: brX, y: brY }, { x: cx, y: bottomY }, { x: blX, y: blY }
    ];
    let globalIndex = 0;
    
    for (let i = 0; i < 8; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 8];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const nx = -dy;
      const ny = dx;
      const len = Math.sqrt(nx * nx + ny * ny);
      const ux = nx / len;
      const uy = ny / len;
      
      const segment = matrix.timeline.segments[i];
      if (!segment) continue;
      
      // The segment values are L2, L1, L3, M, R2, R1, R3
      const fractions = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
      const orderedValues = [
        segment.values[2], // L2
        segment.values[1], // L1
        segment.values[3], // L3
        segment.values[0], // M
        segment.values[5], // R2
        segment.values[4], // R1
        segment.values[6], // R3
      ];

      for (let j = 0; j < 7; j++) {
        const tx = p1.x + dx * fractions[j] + ux * 10;
        const ty = p1.y + dy * fractions[j] + uy * 10;
        elements.push(
          <text key={`age-${i}-${j}`} x={tx} y={ty + 3} textAnchor="middle" fontSize="6" fill="#8A8175">
            {orderedValues[j]}
          </text>
        );
      }
    }
    return elements;
  };

  const renderNode = (node: { id: string; x: number; y: number; solid: boolean; r?: number }) => {
    const color = getNodeColor(node.id);
    const radius = node.r || (node.solid ? 14 : 10);
    return (
      <g key={node.id}>
        <circle cx={node.x} cy={node.y} r={radius} fill={node.solid ? color : "white"} stroke={color} strokeWidth={node.solid ? 0 : 2} />
        <text x={node.x} y={node.y + (radius / 3)} textAnchor="middle" fontSize={radius * 0.7} fontWeight={node.solid ? "bold" : "normal"} fill={node.solid ? "white" : color}>
          {v(node.id)}
        </text>
      </g>
    );
  };

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-full" role="img" aria-label="Diagram Destiny Matrix">
      {/* Octagram Squares */}
      <polygon points={`${cx},${topY} ${rightX},${cy} ${cx},${bottomY} ${leftX},${cy}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />
      <polygon points={`${tlX},${tlY} ${trX},${trY} ${brX},${brY} ${blX},${blY}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />
      
      {/* Large Inner Circle */}
      <circle cx={cx} cy={cy} r={R * 0.66} fill="none" stroke="#D8D0C3" strokeWidth="1.5" strokeDasharray="4 4" />

      {/* Main Axes */}
      <line x1={leftX} y1={cy} x2={rightX} y2={cy} stroke="#D8D0C3" strokeWidth="1.5" />
      <line x1={cx} y1={topY} x2={cx} y2={bottomY} stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Diagonal Lines (Father / Mother) */}
      <line x1={tlX} y1={tlY} x2={brX} y2={brY} stroke={chakraColors.Sahasrara} strokeWidth="1.5" />
      <line x1={blX} y1={blY} x2={trX} y2={trY} stroke={chakraColors.Svadhisthana} strokeWidth="1.5" />

      {/* Love / Money Line */}
      <line x1={bm10.x} y1={bm10.y} x2={bm11.x} y2={bm11.y} stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Icons for Love and Money */}
      <text x={loveMoneyNodes[1].x - 12} y={loveMoneyNodes[1].y + 4} fontSize="12" fill="#D84242">♥</text>
      <text x={loveMoneyNodes[2].x + 12} y={loveMoneyNodes[2].y + 4} fontSize="12" fill="#83BE58" fontWeight="bold">$</text>

      {/* Common Energy */}
      {matrix.legacyReading?.commonEnergy && (() => {
        const parts = matrix.legacyReading.commonEnergy.split("-");
        if (parts.length === 3) {
          // Displaying common energy vertically at the bottom right area outside the octagram
          return (
            <g transform={`translate(${rightX + 20}, ${bottomY - 40})`}>
              <line x1="0" y1="0" x2="0" y2="40" stroke="#D8D0C3" strokeWidth="1.5" />
              {parts.map((val, i) => {
                const color = "#6B746C";
                return (
                  <g key={`ce-${i}`} transform={`translate(0, ${i * 20})`}>
                    <circle r="9" fill="white" stroke={color} strokeWidth="1.5" />
                    <text y="3" textAnchor="middle" fontSize="7" fontWeight="bold" fill={color}>{val}</text>
                  </g>
                );
              })}
            </g>
          );
        }
        return null;
      })()}

      {/* Age Perimeter */}
      {renderAgePerimeter()}

      {/* Nodes */}
      {innerNodes.map(renderNode)}
      {loveMoneyNodes.map(renderNode)}
      {outerNodes.map(renderNode)}
      {renderNode(centerNode)}
    </svg>
  );
}

function StatusCard({ label, value }: { label: string; value: DestinyMatrixVisualValue }) {
  const isReady = value.status === "ready";
  const displayValue = isReady ? value.values.join(" · ") : "Coming Soon";
  return (
    <div className="rounded-xl bg-[#F5F1E8] p-4 text-center h-full flex flex-col justify-center">
      <p className="text-[10px] font-bold uppercase tracking-wide text-[#8A8175] mb-2">{label}</p>
      <p className="text-sm font-bold text-[#4F5E52]">{displayValue}</p>
    </div>
  );
}

export function DestinyMatrixVisual({ matrix }: Props) {
  return (
    <section className="bg-white p-4 sm:p-6 lg:p-8 rounded-3xl border border-[#DED7CA] shadow-sm">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7B8776]">Bhumi Matrix V1</p>
        <h2 className="mt-1 font-serif text-3xl text-[#4F5E52]">Destiny Matrix</h2>
      </div>

      <div className="flex flex-col gap-8 lg:gap-12">
        {/* Matrix Diagram */}
        <div className="flex justify-center items-center">
          <div className="w-full max-w-[500px]">
            <MatrixDiagram matrix={matrix} />
          </div>
        </div>

        {/* Chakra Table */}
        <div className="overflow-x-auto rounded-2xl border border-[#E7E0D4]">
          <table className="w-full min-w-[430px] text-sm">
            <thead className="bg-[#F5F1E8] text-[#6B746C]">
              <tr>
                <th className="p-3 text-left font-semibold">Chakras</th>
                <th className="p-3 text-center font-semibold">Physics</th>
                <th className="p-3 text-center font-semibold">Energy</th>
                <th className="p-3 text-center font-semibold">Emotions</th>
              </tr>
            </thead>
            <tbody>
              {matrix.health.map((row) => (
                <tr key={row.name} className="border-t border-white" style={{ backgroundColor: chakraColors[row.name] }}>
                  <td className="p-3 font-semibold text-white/90 drop-shadow-sm">{row.name}</td>
                  <td className="p-3 text-center text-white font-medium">{row.physical}</td>
                  <td className="p-3 text-center text-white font-medium">{row.energy}</td>
                  <td className="p-3 text-center text-white font-medium">{row.emotion}</td>
                </tr>
              ))}
              {matrix.healthTotals && (
                <tr className="border-t border-white bg-[#D6D0C7] font-bold text-[#4F5E52]">
                  <td className="p-3">Total</td>
                  <td className="p-3 text-center">{matrix.healthTotals.physical}</td>
                  <td className="p-3 text-center">{matrix.healthTotals.energy}</td>
                  <td className="p-3 text-center">{matrix.healthTotals.emotion}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Purpose Layer */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatusCard label="Soul Searching" value={matrix.soulSearching} />
          <StatusCard label="Socialization" value={matrix.socialization} />
          <StatusCard label="Spiritual Knowledge" value={matrix.spiritualKnowledge} />
        </div>
      </div>
    </section>
  );
}

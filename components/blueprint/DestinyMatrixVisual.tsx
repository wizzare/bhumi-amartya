"use client";

import type { DestinyMatrixVisualModel, DestinyMatrixVisualValue } from "@/lib/visual/destinyMatrixVisualModel";

type Props = { matrix: DestinyMatrixVisualModel; birthDate?: string };

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
  if (["BM01", "BM02"].includes(id)) return "#A56BBC"; // Sahasrara (purple)
  if (["BM14", "BM15"].includes(id)) return "#5FA8B8"; // Ajna (blue)
  if (["BM12", "BM13"].includes(id)) return "#7CC7BC"; // Vishudha (teal)
  if (["BM18", "BM19"].includes(id)) return "#83BE58"; // Anahata (green)
  if (["BM05"].includes(id)) return "#F3C75F"; // Center (yellow)
  if (["BM10", "BM11"].includes(id)) return "#F57336"; // Svadhisthana (orange)
  if (["BM03", "BM04"].includes(id)) return "#D84242"; // Muladhara (red)
  return "#4F5E52";
}

export function MatrixDiagram({ matrix, birthDate }: { matrix: DestinyMatrixVisualModel; birthDate?: string }) {
  const v = (id: string) => matrix.nodeMap[id] ?? 0;
  
  const R = 145;
  const cx = 200;
  const cy = 200;
  const R_inner = R * 0.5; // 72.5

  // Parse age and find highlighted segments/nodes
  let currentAge: number | null = null;
  if (birthDate) {
    try {
      const birth = new Date(birthDate);
      const today = new Date();
      let age = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      currentAge = age;
    } catch (e) {
      console.error("Failed to parse birthDate for timeline highlight:", e);
    }
  }

  let highlightedOuterId: string | null = null;
  let matchingSegment = -1;
  let matchingPoint = -1;

  if (currentAge !== null) {
    const rem = currentAge % 10;
    const dec = Math.floor(currentAge / 10);
    if (rem === 0) {
      const decadeNodeIds = ["BM01", "BM06", "BM02", "BM07", "BM03", "BM09", "BM04", "BM08"];
      highlightedOuterId = decadeNodeIds[dec % 8];
    } else {
      matchingSegment = dec % 8;
      if (rem === 1) matchingPoint = 0;
      else if (rem === 2) matchingPoint = 1;
      else if (rem === 3) matchingPoint = 2;
      else if (rem === 4 || rem === 5) matchingPoint = 3;
      else if (rem === 6) matchingPoint = 4;
      else if (rem === 7) matchingPoint = 5;
      else if (rem === 8 || rem === 9) matchingPoint = 6;
    }
  }

  // Outer nodes (Corners/Decades)
  const outerNodes = [
    { id: "BM02", x: cx, y: cy - R, solid: true, r: 18, age: 20 }, // Top
    { id: "BM07", x: cx + R * 0.707, y: cy - R * 0.707, solid: false, r: 15, age: 30 }, // TR
    { id: "BM03", x: cx + R, y: cy, solid: true, r: 18, age: 40 }, // Right
    { id: "BM09", x: cx + R * 0.707, y: cy + R * 0.707, solid: false, r: 15, age: 50 }, // BR
    { id: "BM04", x: cx, y: cy + R, solid: true, r: 18, age: 60 }, // Bottom
    { id: "BM08", x: cx - R * 0.707, y: cy + R * 0.707, solid: false, r: 15, age: 70 }, // BL
    { id: "BM01", x: cx - R, y: cy, solid: true, r: 18, age: 0 }, // Left
    { id: "BM06", x: cx - R * 0.707, y: cy - R * 0.707, solid: false, r: 15, age: 10 }, // TL
  ];

  // Base coordinates for line calculations
  const leftX = cx - R, rightX = cx + R, topY = cy - R, bottomY = cy + R;
  const tlX = cx - R * 0.707, tlY = cy - R * 0.707;
  const trX = cx + R * 0.707, trY = cy - R * 0.707;
  const brX = cx + R * 0.707, brY = cy + R * 0.707;
  const blX = cx - R * 0.707, blY = cy + R * 0.707;

  // Inner nodes positioning on the axes
  const innerNodes = [
    // Top axis
    { id: "BM15", x: cx, y: cy - R * 0.75, solid: true, r: 12 },
    { id: "BM13", x: cx, y: cy - R * 0.5, solid: true, r: 12 },
    { id: "BM19", x: cx, y: cy - R * 0.25, solid: true, r: 12 },
    // Left axis
    { id: "BM14", x: cx - R * 0.75, y: cy, solid: true, r: 12 },
    { id: "BM12", x: cx - R * 0.5, y: cy, solid: true, r: 12 },
    { id: "BM18", x: cx - R * 0.25, y: cy, solid: true, r: 12 },
    // Right axis
    { id: "BM16", x: cx + R * 0.75, y: cy, solid: false, r: 12 },
    { id: "BM11", x: cx + R * 0.5, y: cy, solid: true, r: 12 },
    { id: "BM24", x: cx + R * 0.33, y: cy, solid: false, r: 12 },
    { id: "BM23", x: cx + R * 0.17, y: cy, solid: false, r: 12 },
    // Bottom axis
    { id: "BM17", x: cx, y: cy + R * 0.75, solid: false, r: 12 },
    { id: "BM10", x: cx, y: cy + R * 0.5, solid: true, r: 12 },
    
    // TL Diagonal Descendants
    { id: "BM25", x: cx - R * 0.68 * 0.707, y: cy - R * 0.68 * 0.707, solid: false, r: 10 },
    { id: "BM26", x: cx - R * 0.35 * 0.707, y: cy - R * 0.35 * 0.707, solid: false, r: 10 },
    // TR Diagonal Descendants
    { id: "BM28", x: cx + R * 0.68 * 0.707, y: cy - R * 0.68 * 0.707, solid: false, r: 10 },
    { id: "BM27", x: cx + R * 0.35 * 0.707, y: cy - R * 0.35 * 0.707, solid: false, r: 10 },
    // BL Diagonal Descendants
    { id: "BM30", x: cx - R * 0.68 * 0.707, y: cy + R * 0.68 * 0.707, solid: false, r: 10 },
    { id: "BM29", x: cx - R * 0.35 * 0.707, y: cy + R * 0.35 * 0.707, solid: false, r: 10 },
    // BR Diagonal Descendants (Talents only, Love/Money handled separately)
    { id: "BM32", x: cx + R * 0.82 * 0.707, y: cy + R * 0.82 * 0.707, solid: false, r: 10 },
    { id: "BM31", x: cx + R * 0.65 * 0.707, y: cy + R * 0.65 * 0.707, solid: false, r: 10 },
  ];

  // Love/Money nodes placed along the side of the inner square (Bottom inner BM10 to Right inner BM11)
  const loveMoneyNodes = [
    { id: "BM20", x: cx + R_inner * 0.5, y: cy + R_inner * 0.5, solid: false, r: 10 }, // Shared midpoint (7)
    { id: "BM21", x: cx + R_inner * 0.25, y: cy + R_inner * 0.75, solid: false, r: 10 }, // Love node (10)
    { id: "BM22", x: cx + R_inner * 0.75, y: cy + R_inner * 0.25, solid: false, r: 10 }, // Money node (20)
  ];

  // Center node
  const centerNode = { id: "BM05", x: cx, y: cy, solid: true, r: 16 };

  // Helper to map index to age range labels
  const getAgeLabel = (i: number, j: number) => {
    const start = i * 10;
    if (j === 0) return `${start + 1}-${start + 2}`;
    if (j === 1) return `${start + 2}-${start + 3}`;
    if (j === 2) return `${start + 3}-${start + 4}`;
    if (j === 3) return `${start + 5}`;
    if (j === 4) return `${start + 6}-${start + 7}`;
    if (j === 5) return `${start + 7}-${start + 8}`;
    if (j === 6) return `${start + 8}-${start + 9}`;
    return "";
  };

  // Age timeline perimeter (56 segments)
  const renderAgePerimeter = () => {
    if (matrix.timeline.status !== "ready") return null;
    const elements = [];
    const corners = [
      { x: leftX, y: cy }, { x: tlX, y: tlY }, { x: cx, y: topY }, { x: trX, y: trY },
      { x: rightX, y: cy }, { x: brX, y: brY }, { x: cx, y: bottomY }, { x: blX, y: blY }
    ];
    
    for (let i = 0; i < 8; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 8];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      
      const segment = matrix.timeline.segments[i];
      if (!segment) continue;
      
      // The segment values mapped physically
      const fractions = [0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875];
      const valMap = [2, 1, 3, 0, 5, 4, 6]; // Maps layout positions to segment values array

      for (let j = 0; j < 7; j++) {
        const px = p1.x + dx * fractions[j];
        const py = p1.y + dy * fractions[j];
        
        // Calculate outward normal from center
        const vx = px - cx;
        const vy = py - cy;
        const len = Math.sqrt(vx * vx + vy * vy);
        const ux = vx / len;
        const uy = vy / len;

        const val = segment.values[valMap[j]];
        const label = getAgeLabel(i, j);

        const isHighlighted = (i === matchingSegment && j === matchingPoint);
        const tickColor = isHighlighted ? "#D4AF37" : "#8A8175";
        const dotRadius = isHighlighted ? 4 : 2;

        elements.push(
          <g key={`timeline-tick-${i}-${j}`}>
            {/* Ticks on octagon */}
            <circle cx={px} cy={py} r={dotRadius} fill={tickColor} stroke={isHighlighted ? "#4F5E52" : "none"} strokeWidth={isHighlighted ? 1 : 0} />
            
            {/* Arcana value text */}
            <text 
              x={px + ux * 13} 
              y={py + uy * 13 + 3} 
              textAnchor="middle" 
              fontSize={isHighlighted ? "8.5" : "7"} 
              fontWeight={isHighlighted ? "bold" : "semibold"} 
              fill={isHighlighted ? "#D4AF37" : "#4F5E52"}
            >
              {val}
            </text>

            {/* Age label text */}
            <text 
              x={px + ux * 25} 
              y={py + uy * 25 + 2.5} 
              textAnchor="middle" 
              fontSize={isHighlighted ? "7" : "5.5"} 
              fontWeight={isHighlighted ? "bold" : "normal"}
              fill={isHighlighted ? "#D4AF37" : "#8A8175"}
            >
              {label}
            </text>
          </g>
        );
      }
    }
    return elements;
  };

  const renderNode = (node: { id: string; x: number; y: number; solid: boolean; r: number; age?: number }) => {
    const color = getNodeColor(node.id);
    const isHighlighted = (node.id === highlightedOuterId);
    
    // Outward vector for decade labels
    const vx = node.x - cx;
    const vy = node.y - cy;
    const len = Math.sqrt(vx * vx + vy * vy);
    const ux = len > 0 ? vx / len : 0;
    const uy = len > 0 ? vy / len : 0;

    return (
      <g key={node.id}>
        <circle 
          cx={node.x} 
          cy={node.y} 
          r={node.r} 
          fill={node.solid ? color : "#FFFFFF"} 
          stroke={isHighlighted ? "#D4AF37" : (node.solid ? "none" : "#4F5E52")} 
          strokeWidth={isHighlighted ? 3.5 : (node.solid ? 0 : 1.5)} 
        />
        <text 
          x={node.x} 
          y={node.y + (node.r / 3) - 0.5} 
          textAnchor="middle" 
          fontSize={node.r * 0.72} 
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight={node.solid ? "bold" : "semibold"} 
          fill={node.solid ? "#FFFFFF" : "#4F5E52"}
        >
          {v(node.id)}
        </text>
        {node.age !== undefined && (
          <text
            x={node.x + ux * (node.r + 11)}
            y={node.y + uy * (node.r + 11) + 3}
            textAnchor="middle"
            fontSize={isHighlighted ? "8" : "7"}
            fontWeight="bold"
            fill={isHighlighted ? "#D4AF37" : "#4F5E52"}
          >
            {node.age}
          </text>
        )}
      </g>
    );
  };

  const R_arrow = R - 15; // Point arrowheads exactly to corner node edges

  return (
    <svg viewBox="0 0 400 400" className="w-full h-auto max-w-full" role="img" aria-label="Diagram Destiny Matrix">
      <defs>
        <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#A56BBC" />
        </marker>
        <marker id="arrow-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#F57336" />
        </marker>
      </defs>

      {/* Upright outer square */}
      <polygon points={`${cx},${topY} ${rightX},${cy} ${cx},${bottomY} ${leftX},${cy}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />
      
      {/* Rotated outer square */}
      <polygon points={`${tlX},${tlY} ${trX},${trY} ${brX},${brY} ${blX},${blY}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />
      
      {/* Outer octagon perimeter */}
      <polygon points={`${cx},${cy - R} ${trX},${trY} ${cx + R},${cy} ${brX},${brY} ${cx},${cy + R} ${blX},${blY} ${cx - R},${cy} ${tlX},${tlY}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Inner solid circle */}
      <circle cx={cx} cy={cy} r={R_inner} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Upright inner square connecting inner axis nodes */}
      <polygon points={`${cx},${cy - R_inner} ${cx + R_inner},${cy} ${cx},${cy + R_inner} ${cx - R_inner},${cy}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Rotated inner square connecting inner diagonal nodes */}
      <polygon points={`${cx - R_inner * 0.707},${cy - R_inner * 0.707} ${cx + R_inner * 0.707},${cy - R_inner * 0.707} ${cx + R_inner * 0.707},${cy + R_inner * 0.707} ${cx - R_inner * 0.707},${cy + R_inner * 0.707}`} fill="none" stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Main Axes */}
      <line x1={leftX} y1={cy} x2={rightX} y2={cy} stroke="#D8D0C3" strokeWidth="1.5" />
      <line x1={cx} y1={topY} x2={cx} y2={bottomY} stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Diagonal Line - Father Line (TL to BR) */}
      <line x1={cx} y1={cy} x2={cx - R_arrow * 0.707} y2={cy - R_arrow * 0.707} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />
      <line x1={cx} y1={cy} x2={cx + R_arrow * 0.707} y2={cy + R_arrow * 0.707} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />

      {/* Diagonal Line - Mother Line (BL to TR) */}
      <line x1={cx} y1={cy} x2={cx - R_arrow * 0.707} y2={cy + R_arrow * 0.707} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />
      <line x1={cx} y1={cy} x2={cx + R_arrow * 0.707} y2={cy - R_arrow * 0.707} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />

      {/* Father & Mother Line text labels */}
      <text x="-58" y="-7" transform="rotate(45 200 200)" textAnchor="middle" fontSize="6.5" fill="#A56BBC" fontWeight="bold" letterSpacing="0.06em">Father Line</text>
      <text x="58" y="-7" transform="rotate(-45 200 200)" textAnchor="middle" fontSize="6.5" fill="#F57336" fontWeight="bold" letterSpacing="0.06em">Mother Line</text>

      {/* Love / Money channels lines (drawn along inner square side segment) */}
      <line x1={loveMoneyNodes[0].x} y1={loveMoneyNodes[0].y} x2={loveMoneyNodes[1].x} y2={loveMoneyNodes[1].y} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />
      <line x1={loveMoneyNodes[1].x} y1={loveMoneyNodes[1].y} x2={cx} y2={cy + R_inner} stroke="#D8D0C3" strokeWidth="1.5" />

      <line x1={loveMoneyNodes[0].x} y1={loveMoneyNodes[0].y} x2={loveMoneyNodes[2].x} y2={loveMoneyNodes[2].y} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />
      <line x1={loveMoneyNodes[2].x} y1={loveMoneyNodes[2].y} x2={cx + R_inner} y2={cy} stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Icons for Love and Money */}
      <text x={loveMoneyNodes[1].x - 12} y={loveMoneyNodes[1].y + 11} fontSize="11" fill="#D84242">♥</text>
      <text x={loveMoneyNodes[2].x + 4} y={loveMoneyNodes[2].y - 2} fontSize="11" fill="#83BE58" fontWeight="bold">$</text>

      {/* Common Energy stack rendered vertically at bottom-right */}
      {matrix.legacyReading?.commonEnergy && (() => {
        const parts = matrix.legacyReading.commonEnergy.split("-");
        if (parts.length === 3) {
          return (
            <g transform={`translate(${rightX + 16}, ${bottomY - 45})`}>
              <line x1="0" y1="0" x2="0" y2="34" stroke="#D8D0C3" strokeWidth="1.5" />
              {parts.map((val, i) => {
                const color = "#4F5E52";
                return (
                  <g key={`ce-${i}`} transform={`translate(0, ${i * 17})`}>
                    <circle r="8" fill="white" stroke={color} strokeWidth="1.5" />
                    <text y="2.5" textAnchor="middle" fontSize="6.5" fontWeight="bold" fill={color}>{val}</text>
                  </g>
                );
              })}
            </g>
          );
        }
        return null;
      })()}

      {/* Age Perimeter Ticks and Labels */}
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

export function DestinyMatrixVisual({ matrix, birthDate }: Props) {
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
            <MatrixDiagram matrix={matrix} birthDate={birthDate} />
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

"use client";

import type { DestinyMatrixVisualModel, DestinyMatrixVisualValue } from "@/lib/visual/destinyMatrixVisualModel";
import { DESTINY_MATRIX_AGE_CYCLE, DESTINY_MATRIX_TOPOLOGY } from "@/lib/destiny-matrix/topology";

type Props = { matrix: DestinyMatrixVisualModel; birthDate?: string };

export const chakraColors: Record<string, string> = {
  Sahasrara: "#A56BBC",
  Ajna: "#5FA8B8",
  Vishudha: "#7CC7BC",
  Vishuddha: "#7CC7BC",
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

export function MatrixDiagram({ matrix, birthDate, activeAge, activeArcana }: { matrix: DestinyMatrixVisualModel; birthDate?: string; activeAge?: number; activeArcana?: number }) {
  const v = (id: string) => matrix.nodeMap[id] ?? 0;

  const registry = new Map(DESTINY_MATRIX_TOPOLOGY.nodes.map((node) => [node.nodeId, node]));
  const node = (id: string) => {
    const item = registry.get(id);
    if (!item) throw new Error(`Destiny Matrix UI references missing topology node ${id}.`);
    return { id, x: item.coordinate.x, y: item.coordinate.y, solid: item.visual.solid, r: item.visual.radius };
  };
  const centerGuide = DESTINY_MATRIX_TOPOLOGY.guides[0];
  const cx = centerGuide.center.x;
  const cy = centerGuide.center.y;
  const R = (registry.get("BM03")?.coordinate.x ?? 345) - cx;
  const R_inner = R * 0.5; // 72.5

  // Outer nodes (Corners/Decades)
  const ageRingNodeIds = [...DESTINY_MATRIX_TOPOLOGY.diagramGroups.outer];
  const ageByNode = new Map(ageRingNodeIds.map((nodeId, index) => [nodeId, index === 0 ? "0 / 80" : String(index * 10)]));
  let currentAge: number | null = activeAge ?? null;
  if (currentAge === null && birthDate) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthDate);
    if (match) {
      const today = new Date();
      const year = Number(match[1]);
      const month = Number(match[2]);
      const day = Number(match[3]);
      currentAge = today.getFullYear() - year;
      if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) currentAge -= 1;
    }
  }
  const ringAge = currentAge === null ? null : Math.max(0, Math.min(79, currentAge));
  const activeSegment = ringAge === null ? -1 : Math.floor(ringAge / 10);
  const activeRemainder = ringAge === null ? -1 : ringAge % 10;
  const activePoint = activeRemainder <= 0 ? -1 : DESTINY_MATRIX_AGE_CYCLE.points.findIndex((point) => activeRemainder >= point.offsetStart && activeRemainder <= point.offsetEnd);
  const activeDecadeNodeId = activeRemainder === 0 && activeSegment >= 0 ? ageRingNodeIds[activeSegment] : null;
  const activeAnnualArcana = activeArcana ?? (activeDecadeNodeId
    ? v(activeDecadeNodeId)
    : activeSegment >= 0 && activePoint >= 0
      ? matrix.timeline.segments[activeSegment]?.values[DESTINY_MATRIX_AGE_CYCLE.points[activePoint]?.valueIndex]
      : null);
  const outerNodes = DESTINY_MATRIX_TOPOLOGY.diagramGroups.outer.map((nodeId) => ({
    ...node(nodeId),
    ageLabel: ageByNode.get(nodeId),
    highlighted: nodeId === activeDecadeNodeId,
  }));

  // Base coordinates for line calculations
  const leftX = cx - R, rightX = cx + R, topY = cy - R, bottomY = cy + R;
  const tlX = cx - R * 0.707, tlY = cy - R * 0.707;
  const trX = cx + R * 0.707, trY = cy - R * 0.707;
  const brX = cx + R * 0.707, brY = cy + R * 0.707;
  const blX = cx - R * 0.707, blY = cy + R * 0.707;

  // Inner nodes positioning on the axes
  const ancestralStructuralIds = new Set(["BM25", "BM26", "BM27", "BM28", "BM29", "BM30", "BM31", "BM32"]);
  const innerNodes = DESTINY_MATRIX_TOPOLOGY.diagramGroups.inner.filter((nodeId) => !ancestralStructuralIds.has(nodeId)).map(node);
  const ancestralNodes = [
    ...matrix.ancestral.fatherTalent,
    ...matrix.ancestral.fatherKarma,
    ...matrix.ancestral.motherTalent,
    ...matrix.ancestral.motherKarma,
  ].filter((item) => item.role !== "outer").map((item) => ({
    id: item.projectionNodeId,
    x: item.visualCoordinate.x,
    y: item.visualCoordinate.y,
    solid: false,
    r: 10,
    value: item.value,
  }));

  // Love/Money nodes placed along the side of the inner square (Bottom inner BM10 to Right inner BM11)
  const loveMoneyNodes = DESTINY_MATRIX_TOPOLOGY.diagramGroups.loveMoney.map(node);

  // Center node
  const centerNode = node("BM05");

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
      const ageSegment = DESTINY_MATRIX_AGE_CYCLE.segments[i];
      if (!segment) continue;

      for (let j = 0; j < DESTINY_MATRIX_AGE_CYCLE.points.length; j++) {
        const point = DESTINY_MATRIX_AGE_CYCLE.points[j];
        const px = p1.x + dx * point.fraction;
        const py = p1.y + dy * point.fraction;
        
        // Calculate outward normal from center
        const vx = px - cx;
        const vy = py - cy;
        const len = Math.sqrt(vx * vx + vy * vy);
        const ux = vx / len;
        const uy = vy / len;

        const val = segment.values[point.valueIndex];
        const highlighted = i === activeSegment && j === activePoint;
        const ageLabel = point.offsetEnd - point.offsetStart === 2
          ? String(ageSegment.ageStart + 5)
          : `${ageSegment.ageStart + point.offsetStart}-${ageSegment.ageStart + point.offsetEnd}`;
        elements.push(
          <g key={`timeline-tick-${i}-${j}`}>
            <circle cx={px} cy={py} r={highlighted ? 3.5 : 1.6} fill={highlighted ? "#C8962E" : "#273B4A"} />
            <text 
              x={px + ux * 13}
              y={py + uy * 13 + 3}
              textAnchor="middle" 
              fontSize={highlighted ? "8" : "7"}
              fontWeight="700"
              fill={highlighted ? "#B7791F" : "#273B4A"}
            >
              {val}
            </text>
            <text x={px + ux * 25} y={py + uy * 25 + 2} textAnchor="middle" fontSize="4.6" fontWeight={highlighted ? "700" : "500"} fill={highlighted ? "#B7791F" : "#8A8175"}>
              {ageLabel}
            </text>
          </g>
        );
      }
    }
    return elements;
  };

  const renderNode = (node: { id: string; x: number; y: number; solid: boolean; r: number; value?: number; ageLabel?: string; highlighted?: boolean }) => {
    const color = getNodeColor(node.id);
    const vx = node.x - cx;
    const vy = node.y - cy;
    const length = Math.sqrt(vx * vx + vy * vy) || 1;
    const ux = vx / length;
    const uy = vy / length;

    return (
      <g key={node.id}>
        <circle 
          cx={node.x} 
          cy={node.y} 
          r={node.r} 
          fill={node.solid ? color : "#FFFFFF"} 
          stroke={node.highlighted ? "#C8962E" : node.solid ? "#FFFFFF" : "#273B4A"}
          strokeWidth={node.highlighted ? 3 : node.solid ? 1.5 : 1.7}
        />
        <text 
          x={node.x} 
          y={node.y + (node.r / 3) - 0.5} 
          textAnchor="middle" 
          fontSize={node.r * 0.72} 
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight={node.solid ? "bold" : "semibold"} 
          fill={node.solid ? "#FFFFFF" : "#172B3A"}
        >
          {node.value ?? v(node.id)}
        </text>
        {node.ageLabel && <text x={node.x + ux * (node.r + 12)} y={node.y + uy * (node.r + 12) + 2.5} textAnchor="middle" fontSize="6" fontWeight="700" fill={node.highlighted ? "#B7791F" : "#6F7D72"}>{node.ageLabel}</text>}
      </g>
    );
  };

  const R_arrow = R - 15; // Point arrowheads exactly to corner node edges

  return (
    <svg viewBox="-42 -40 484 480" className="h-auto w-full max-w-full" role="img" aria-label="Diagram Destiny Matrix dengan Arcana Tahunan">
      <defs>
        <marker id="arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#A56BBC" />
        </marker>
        <marker id="arrow-orange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 1.5 L 7 5 L 0 8.5 z" fill="#F57336" />
        </marker>
      </defs>

      {/* Upright outer square */}
      <polygon points={`${cx},${topY} ${rightX},${cy} ${cx},${bottomY} ${leftX},${cy}`} fill="none" stroke="#273B4A" strokeOpacity="0.72" strokeWidth="1.25" />
      
      {/* Rotated outer square */}
      <polygon points={`${tlX},${tlY} ${trX},${trY} ${brX},${brY} ${blX},${blY}`} fill="none" stroke="#273B4A" strokeOpacity="0.72" strokeWidth="1.25" />
      
      {/* Outer octagon perimeter */}
      <polygon points={`${cx},${cy - R} ${trX},${trY} ${cx + R},${cy} ${brX},${brY} ${cx},${cy + R} ${blX},${blY} ${cx - R},${cy} ${tlX},${tlY}`} fill="none" stroke="#172B3A" strokeWidth="1.45" />

      {/* Inner solid circle */}
      <circle cx={cx} cy={cy} r={R_inner} fill="none" stroke="#273B4A" strokeOpacity="0.8" strokeWidth="1.25" />

      {/* Upright inner square connecting inner axis nodes */}
      <polygon points={`${cx},${cy - R_inner} ${cx + R_inner},${cy} ${cx},${cy + R_inner} ${cx - R_inner},${cy}`} fill="none" stroke="#273B4A" strokeOpacity="0.72" strokeWidth="1.2" />

      {/* Rotated inner square connecting inner diagonal nodes */}
      <polygon points={`${cx - R_inner * 0.707},${cy - R_inner * 0.707} ${cx + R_inner * 0.707},${cy - R_inner * 0.707} ${cx + R_inner * 0.707},${cy + R_inner * 0.707} ${cx - R_inner * 0.707},${cy + R_inner * 0.707}`} fill="none" stroke="#273B4A" strokeOpacity="0.55" strokeWidth="1.1" />

      {/* Main Axes */}
      <line x1={leftX} y1={cy} x2={rightX} y2={cy} stroke="#273B4A" strokeOpacity="0.72" strokeWidth="1.25" />
      <line x1={cx} y1={topY} x2={cx} y2={bottomY} stroke="#273B4A" strokeOpacity="0.72" strokeWidth="1.25" />

      {/* Diagonal Line - Father Line (TL to BR) */}
      <line x1={cx} y1={cy} x2={cx - R_arrow * 0.707} y2={cy - R_arrow * 0.707} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />
      <line x1={cx} y1={cy} x2={cx + R_arrow * 0.707} y2={cy + R_arrow * 0.707} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />

      {/* Diagonal Line - Mother Line (BL to TR) */}
      <line x1={cx} y1={cy} x2={cx - R_arrow * 0.707} y2={cy + R_arrow * 0.707} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />
      <line x1={cx} y1={cy} x2={cx + R_arrow * 0.707} y2={cy - R_arrow * 0.707} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />

      {/* Father & Mother Line text labels */}
      <text x="-58" y="-7" transform="rotate(45 200 200)" textAnchor="middle" fontSize="6.5" fill="#A56BBC" fontWeight="bold" letterSpacing="0.06em">Garis Ayah</text>
      <text x="58" y="-7" transform="rotate(-45 200 200)" textAnchor="middle" fontSize="6.5" fill="#F57336" fontWeight="bold" letterSpacing="0.06em">Garis Ibu</text>

      {/* Love / Money channels lines (drawn along inner square side segment) */}
      <line x1={loveMoneyNodes[0].x} y1={loveMoneyNodes[0].y} x2={loveMoneyNodes[1].x} y2={loveMoneyNodes[1].y} stroke="#A56BBC" strokeWidth="1.5" marker-end="url(#arrow-purple)" />
      <line x1={loveMoneyNodes[1].x} y1={loveMoneyNodes[1].y} x2={cx} y2={cy + R_inner} stroke="#D8D0C3" strokeWidth="1.5" />

      <line x1={loveMoneyNodes[0].x} y1={loveMoneyNodes[0].y} x2={loveMoneyNodes[2].x} y2={loveMoneyNodes[2].y} stroke="#F57336" strokeWidth="1.5" marker-end="url(#arrow-orange)" />
      <line x1={loveMoneyNodes[2].x} y1={loveMoneyNodes[2].y} x2={cx + R_inner} y2={cy} stroke="#D8D0C3" strokeWidth="1.5" />

      {/* Icons for Love and Money */}
      <text role="img" aria-label="Jalur Cinta" x={loveMoneyNodes[1].x - 12} y={loveMoneyNodes[1].y + 11} fontSize="11" fill="#D84242">♥</text>
      <text role="img" aria-label="Jalur Uang" x={loveMoneyNodes[2].x + 4} y={loveMoneyNodes[2].y - 2} fontSize="11" fill="#83BE58" fontWeight="bold">$</text>

      {/* Age Perimeter Ticks and Labels */}
      {renderAgePerimeter()}

      {currentAge !== null && activeSegment >= 0 && <g transform="translate(274,-22)">
        <rect x="0" y="0" width="115" height="20" rx="10" fill="#F7E8C5" stroke="#C8962E" strokeWidth="0.8" />
        <text x="57.5" y="13" textAnchor="middle" fontSize="7" fontWeight="700" fill="#76551E">USIA {currentAge} · ARCANA TAHUNAN {activeAnnualArcana ?? "—"}</text>
      </g>}

      {/* Nodes */}
      {innerNodes.map(renderNode)}
      {ancestralNodes.map(renderNode)}
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
          <div className="w-full max-w-[980px]">
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

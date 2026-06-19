import { DestinyMatrixGraph } from "../types/destinyMatrix";
import { reduceMatrixValue } from "./destinyMatrixGraph";

export interface LegacyReading {
  center: number;
  commonEnergy: string;
  moneyLine: string;
  loveLine: string;
  karmicTile: string;
  fatherKarma: string;
  motherKarma: string;
  fatherTalent: string;
  motherTalent: string;
  godTalent: string;
  personalQualities: string;
}

export function translateToLegacyReading(graph: DestinyMatrixGraph): LegacyReading {
  const nodeMap = new Map<string, number>(graph.nodes.map(n => [n.id, n.value]));
  const get = (id: string) => {
    const val = nodeMap.get(id);
    if (val === undefined) throw new Error(`Missing node ${id}`);
    return val;
  };
  const join = (...ids: string[]) => ids.map(get).join("-");

  // Father Talent = Left Axis = BM06, R(BM06+BM08), BM08
  const bm06 = get("BM06");
  const bm08 = get("BM08");
  const fatherTalentMid = reduceMatrixValue(bm06 + bm08);
  const fatherTalent = `${bm06}-${fatherTalentMid}-${bm08}`;

  // Mother Talent = Right Axis = BM07, R(BM07+BM09), BM09
  const bm07 = get("BM07");
  const bm09 = get("BM09");
  const motherTalentMid = reduceMatrixValue(bm07 + bm09);
  const motherTalent = `${bm07}-${motherTalentMid}-${bm09}`;

  return {
    center: get("BM05"),
    commonEnergy: join("BM05", "BM23", "BM24"),
    moneyLine: join("BM03", "BM16", "BM11", "BM22", "BM20"),
    loveLine: join("BM20", "BM21", "BM10"),
    karmicTile: join("BM10", "BM17", "BM04"), // Reversed KARMIC_TAIL order (21-7-13)
    fatherKarma: join("BM06", "BM05", "BM09"), // Male Diagonal
    motherKarma: join("BM07", "BM05", "BM08"), // Female Diagonal
    fatherTalent,
    motherTalent,
    godTalent: join("BM02", "BM15", "BM13"), // Top Branch
    personalQualities: join("BM01", "BM06", "BM02") // Top-Left Edge
  };
}

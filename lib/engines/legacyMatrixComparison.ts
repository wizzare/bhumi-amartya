import { calculateDestinyMatrixEnergy } from "../calculations/destinyMatrix/energy";
import { buildDestinyMatrixGraph, matrixNodeValue } from "./destinyMatrixGraph";

const LEGACY_STRUCTURAL_KEYS = [
  "apoint", "bpoint", "cpoint", "dpoint", "epoint", "fpoint", "gpoint", "hpoint",
  "ipoint", "jpoint", "npoint", "spoint", "tpoint", "opoint", "ppoint", "qpoint",
  "rpoint", "wpoint", "xpoint", "lpoint", "kpoint", "mpoint", "upoint", "vpoint",
  "f2point", "f1point", "g2point", "g1point", "h2point", "h1point", "i2point", "i1point",
] as const;

export type LegacyMatrixComparison = {
  dateOfBirth: string;
  matches: boolean;
  differences: Array<{ nodeId: string; legacyKey: string; canonical: number; legacy: number | undefined }>;
};

/**
 * Regression tooling only. The canonical engine never imports or calls this adapter.
 */
export function compareCanonicalMatrixWithLegacy(dateOfBirth: string): LegacyMatrixComparison {
  const graph = buildDestinyMatrixGraph(dateOfBirth);
  const legacy = calculateDestinyMatrixEnergy(dateOfBirth);
  const differences = LEGACY_STRUCTURAL_KEYS.flatMap((legacyKey, index) => {
    const nodeId = `BM${String(index + 1).padStart(2, "0")}`;
    const canonical = matrixNodeValue(graph, nodeId);
    const legacyValue = legacy.points[legacyKey];
    return canonical === legacyValue ? [] : [{ nodeId, legacyKey, canonical, legacy: legacyValue }];
  });
  return { dateOfBirth, matches: differences.length === 0, differences };
}

import { calculateDestinyMatrixEnergy } from "./energy";

export function calculateDestinyMatrixForBlueprint(birthDate: string) {
  const result = calculateDestinyMatrixEnergy(birthDate);

  return {
    center: result.points.epoint,
    loveLine: [result.points.spoint, result.points.epoint, result.points.tpoint],
    moneyLine: [result.points.jpoint, result.points.epoint, result.points.npoint],
    karmicTail: [result.points.apoint, result.points.bpoint, result.points.cpoint],
    fatherLine: [result.points.fpoint, result.points.gpoint, result.points.cpoint],
    motherLine: [result.points.hpoint, result.points.ipoint, result.points.dpoint],
    talents: [result.points.f1point, result.points.g1point, result.points.h1point, result.points.i1point],
    purposes: result.purposes,
    chartHeart: result.chartHeart,
    years: result.years,
    rawPoints: result.points,
    status: "completed" as const,
  };
}

import { calculateDestinyMatrixEnergy } from "./energy";

export function calculateDestinyMatrixForBlueprint(birthDate: string) {
  const result = calculateDestinyMatrixEnergy(birthDate);

  return {
    center: result.points.epoint,
    loveLine: [result.points.epoint, result.points.kpoint, result.points.lpoint],
    moneyLine: [result.points.epoint, result.points.mpoint, result.points.lpoint],
    karmicTail: [result.points.dpoint, result.points.rpoint, result.points.jpoint],
    fatherLine: [result.points.fpoint, result.points.f2point, result.points.f1point, result.points.epoint, result.points.i1point, result.points.i2point, result.points.ipoint],
    motherLine: [result.points.hpoint, result.points.h1point, result.points.h2point, result.points.epoint, result.points.g2point, result.points.g1point, result.points.gpoint],
    ancestorLine: [result.purposes.femalepoint, result.purposes.malepoint, result.purposes.socialpurpose],
    talents: [result.points.f1point, result.points.g1point, result.points.h1point, result.points.i1point],
    talentsGreat: [result.points.f1point, result.points.g1point, result.points.h1point, result.points.i1point],
    talentsFather: [result.points.f2point, result.points.g2point],
    talentsMother: [result.points.h2point, result.points.i2point],
    purposes: result.purposes,
    chartHeart: result.chartHeart,
    years: result.years,
    rawPoints: result.points,
    status: "completed" as const,
  };
}

// @ts-expect-error import with ts extension
const { calculateDestinyMatrixEnergy } = await import("../lib/calculations/destinyMatrix/energy.ts");

const result = calculateDestinyMatrixEnergy("1985-05-03");

console.log("=== RAW POINTS ===");
console.log("apoint:", result.points.apoint);
console.log("bpoint:", result.points.bpoint);
console.log("cpoint:", result.points.cpoint);
console.log("dpoint:", result.points.dpoint);
console.log("epoint (center):", result.points.epoint);
console.log("fpoint:", result.points.fpoint);
console.log("gpoint:", result.points.gpoint);
console.log("hpoint:", result.points.hpoint);
console.log("ipoint:", result.points.ipoint);
console.log("jpoint:", result.points.jpoint);
console.log("npoint:", result.points.npoint);
console.log("spoint:", result.points.spoint);
console.log("tpoint:", result.points.tpoint);
console.log("opoint:", result.points.opoint);
console.log("ppoint:", result.points.ppoint);
console.log("qpoint:", result.points.qpoint);
console.log("rpoint:", result.points.rpoint);
console.log("wpoint:", result.points.wpoint);
console.log("xpoint:", result.points.xpoint);
console.log("lpoint:", result.points.lpoint);
console.log("kpoint:", result.points.kpoint);
console.log("mpoint:", result.points.mpoint);
console.log("upoint:", result.points.upoint);
console.log("vpoint:", result.points.vpoint);
console.log("f1point:", result.points.f1point);
console.log("g1point:", result.points.g1point);
console.log("h1point:", result.points.h1point);
console.log("i1point:", result.points.i1point);
console.log("f2point:", result.points.f2point);
console.log("g2point:", result.points.g2point);
console.log("h2point:", result.points.h2point);
console.log("i2point:", result.points.i2point);

console.log("\n=== BLUEPRINT LINES ===");
console.log("center:", result.points.epoint);
console.log("loveLine:", [result.points.spoint, result.points.epoint, result.points.tpoint]);
console.log("moneyLine:", [result.points.jpoint, result.points.epoint, result.points.npoint]);
console.log("karmicTail:", [result.points.dpoint, result.points.rpoint, result.points.jpoint]);
console.log("fatherLine:", [result.points.fpoint, result.points.gpoint, result.points.cpoint]);
console.log("motherLine:", [result.points.hpoint, result.points.ipoint, result.points.dpoint]);
console.log("ancestorLine:", [result.purposes.femalepoint, result.purposes.malepoint, result.purposes.socialpurpose]);
console.log("talents:", [result.points.f1point, result.points.g1point, result.points.h1point, result.points.i1point]);

console.log("\n=== PURPOSES ===");
console.log(JSON.stringify(result.purposes, null, 2));

console.log("\n=== CHART HEART ===");
console.log(JSON.stringify(result.chartHeart, null, 2));

export {};

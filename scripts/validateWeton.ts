import { strict as assert } from "node:assert";
import { calculateWeton, getEffectiveJavaneseDate } from "../lib/weton/calculateWeton";

const widhi = calculateWeton({
  birthDate: "1985-05-03",
  birthTime: "23:45",
});

assert.equal(getEffectiveJavaneseDate({ birthDate: "1985-05-03", birthTime: "23:45" }).toISOString().slice(0, 10), "1985-05-04");
assert.equal(widhi.day, "Sabtu");
assert.equal(widhi.pasaran, "Legi");
assert.equal(widhi.weton, "Sabtu Legi");
assert.equal(widhi.neptuDay, 9);
assert.equal(widhi.neptuPasaran, 5);
assert.equal(widhi.totalNeptu, 14);
assert.equal(widhi.wuku.name, "Bala");
assert.equal(widhi.wuku.index, 25);
assert.equal(widhi.pranataMangsa.name, "Desta");

const beforeBoundary = calculateWeton({
  birthDate: "1985-05-03",
  birthTime: "17:59",
});
assert.equal(beforeBoundary.day, "Jumat");
assert.equal(beforeBoundary.pasaran, "Kliwon");

console.log(JSON.stringify({ widhi, beforeBoundary: beforeBoundary.weton }, null, 2));

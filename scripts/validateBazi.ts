import { strict as assert } from "node:assert";
import { calculateBazi } from "../lib/bazi/calculateBazi";

const widhi = calculateBazi({
  birthDate: "1985-05-03",
  birthTime: "23:45",
  timezone: "+07:00",
  referenceDate: new Date("2026-06-18T00:00:00Z"),
});

assert.equal(widhi.yearPillar.display, "乙丑 Yi Chou");
assert.equal(widhi.monthPillar.display, "庚辰 Geng Chen");
assert.equal(widhi.dayPillar.display, "壬寅 Ren Yin");
assert.equal(widhi.hourPillar.display, "庚子 Geng Zi");
assert.equal(widhi.dayMaster.pinyin, "Ren");
assert.equal(widhi.dayMaster.element, "Water");
assert.equal(widhi.luckPillars.length, 10);
assert.equal(widhi.summary.length, 5);

console.log(JSON.stringify(widhi, null, 2));

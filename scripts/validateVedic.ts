// @ts-expect-error ts-node ESM requires the source extension for this standalone validation script.
import { calculateVedic } from "../lib/vedic/calculateVedic.ts";

const result = calculateVedic({
  birthDate: "1985-05-03",
  birthTime: "23:45",
  birthCity: "Jakarta",
  latitude: -6.2088,
  longitude: 106.8456,
  timezone: "+07:00",
  asOf: "2026-06-18T00:00:00.000Z",
});

console.log(JSON.stringify({
  lagna: result.lagna,
  moonSign: result.moonSign,
  sunSign: result.sunSign,
  nakshatra: result.nakshatra,
  pada: result.pada,
  atmakaraka: result.atmakaraka,
  darakaraka: result.darakaraka,
  currentMahadasha: result.currentMahadasha,
  currentAntardasha: result.currentAntardasha,
  yogas: result.majorYogas,
}, null, 2));

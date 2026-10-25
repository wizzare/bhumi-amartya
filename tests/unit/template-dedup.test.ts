import assert from "node:assert/strict";
import { buildTransitNarrative } from "../../lib/astrology/personalizedTransitNarrative";
import type { BodyStatus } from "../../lib/astrology/calculateCurrentSky";
import type { AstroHouseActivation } from "../../lib/astrology/astroHouseActivations";

let assertions = 0;
function narrative(body: string, house?: number) {
  return buildTransitNarrative(
    { body, sign: "Aries" } as BodyStatus,
    house === undefined ? undefined : { planet: body, house } as AstroHouseActivation,
    {},
  );
}
for (const body of ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto", "Chiron"]) {
  for (let house = 1; house <= 12; house++) {
    const result = narrative(body, house);
    assert.equal((result.personalImpact.match(/hari ini/gi) || []).length, 1);
    assert.ok(result.personalImpact.startsWith("Hari ini "));
    assert.ok(result.action.length > 0);
    assertions += 3;
  }
}
for (const [body, house, fragment] of [
  ["Sun", 3, "fokus utamamu berada"],
  ["Moon", 2, "kebutuhan emosionalmu sangat"],
  ["Moon", 5, "keadaan emosionalmu dipicu"],
  ["Moon", 6, "kenyamanan emosionalmu sangat"],
  ["Moon", 9, "kebutuhan emosionalmu dipenuhi"],
  ["Moon", 12, "kepekaan emosionalmu mengarah"],
] as const) {
  assert.ok(narrative(body, house).personalImpact.startsWith(`Hari ini ${fragment}`));
  assertions++;
}
assert.equal(narrative("Sun", 1).action, "Pilih satu kebiasaan kecil hari ini yang langsung meningkatkan vitalitas tubuhmu secara nyata.");
assert.equal(narrative("Moon", 11).action, "Hubungi seseorang yang kamu percayai untuk sekadar berbagi cerita tentang suasana hatimu hari ini.");
assert.equal(narrative("Sun").action, "Luangkan waktu sejenak untuk menjejakkan kakimu di bumi, lalu pilihlah satu hal yang ingin kamu beri energi penuh hari ini.");
assert.equal(narrative("Sun", 4).action, "Luangkan waktu 15 menit malam ini untuk merapikan salah satu sudut rumah agar suasana terasa lebih tenang.");
assertions += 4;
console.log(`PASS template production contract: assertions=${assertions}`);

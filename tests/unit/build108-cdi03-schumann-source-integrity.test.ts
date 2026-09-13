/**
 * BUILD 108 ENL — CDI-108-03 (Schumann source restoration) integrity guard.
 *
 * CDI-108-03 research found NO qualifying genuine Schumann-resonance source
 * (see BUILD_108_CDI_108_03_SCHUMANN_SOURCE_RESTORATION.md). SCHUMANN_API_URL is
 * therefore unchanged and Schumann stays fail-closed. This guard locks the
 * invariants the SOT requires be preserved while the Founder decides D1/D2/D3:
 *
 *   1. No NOAA Kp / USGS / weather / generic space-weather host may be aliased
 *      in as the "Schumann" source. SCHUMANN_API_URL host stays the dedicated
 *      Schumann provider; the EnvironmentDataSource literal stays
 *      "schumann_resonance_live" and is a distinct type member from
 *      "noaa_space_weather" / "usgs" / "weather_api".
 *   2. normalizeSchumannResponse() rejects an empty / wrong-shape body: no
 *      accepted frequency numbers, no intensity / amplitude / power, no throw
 *      (a dead feed must not fabricate a reading).
 *   3. The environment service seeds ctx.schumann fail-closed
 *      (metaUnavailable("schumann_resonance_live"), provenance "modelled-series",
 *      empty frequencies) and only patches it on a real observation.
 *   4. deriveEnvironmentBands() still defaults a missing Schumann band to
 *      "quiet", AND the /dashboard/environment `hasSchumannObservation` gate
 *      that suppresses the spiritual block on a dead feed is still present
 *      (CDI-A3).
 *
 * No network. node:assert/strict — a failed assertion throws -> exit 1.
 * Runner: npx tsx tests/unit/build108-cdi03-schumann-source-integrity.test.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { SCHUMANN_API_URL, normalizeSchumannResponse } from "../../lib/environment/schumann";
import { deriveEnvironmentBands } from "../../lib/environment/context_utils";
import type { EnvironmentContext } from "../../lib/environment/types";

const repoRoot = path.resolve(__dirname, "../..");
const read = (rel: string) => fs.readFileSync(path.join(repoRoot, rel), "utf8");

let checks = 0;
const ok = (label: string, condition: boolean) => {
  assert.ok(condition, label);
  checks += 1;
  console.log(`PASS: ${label}`);
};

/* 1. No forbidden-substitute host, dedicated source literal ------------------ */

const schumannHost = new URL(SCHUMANN_API_URL).host.toLowerCase();
const FORBIDDEN_HOST_FRAGMENTS = [
  "noaa.gov",
  "swpc",
  "spaceweather",
  "usgs.gov",
  "earthquake",
  "open-meteo",
  "openweather",
  "weatherapi",
  "bmkg",
];
ok(
  `SCHUMANN_API_URL host (${schumannHost}) is not a NOAA/USGS/weather substitute`,
  FORBIDDEN_HOST_FRAGMENTS.every((fragment) => !schumannHost.includes(fragment)),
);
ok("SCHUMANN_API_URL is HTTPS", SCHUMANN_API_URL.startsWith("https://"));

const typesSrc = read("lib/environment/types.ts");
ok(
  'EnvironmentDataSource keeps a dedicated "schumann_resonance_live" member',
  /"schumann_resonance_live"/.test(typesSrc),
);
ok(
  'EnvironmentDataSource keeps NOAA / USGS as separate members (not folded into Schumann)',
  /"noaa_space_weather"/.test(typesSrc) && /"usgs"/.test(typesSrc),
);

const serviceSrc = read("lib/environment/service.tsx");
// The Schumann task must read from the Schumann module's URL constant, never a
// NOAA/USGS endpoint variable.
const schumannTask = serviceSrc.slice(serviceSrc.indexOf("readSchumannBuffer()"));
ok(
  "environment service Schumann task fetches SCHUMANN_API_URL (not a Kp/USGS URL)",
  schumannTask.includes("fetchWithTimeout(SCHUMANN_API_URL"),
);

/* 2. Dead / malformed feed never fabricates a reading ----------------------- */

const emptyBody = normalizeSchumannResponse({} as never);
ok(
  "normalizeSchumannResponse({}) yields no numeric SR observation",
  emptyBody.frequencies.every((f) => f.valueHz === undefined)
    && emptyBody.intensity === undefined
    && emptyBody.amplitudePicoTesla === undefined
    && emptyBody.powerGwKm2 === undefined,
);

const wrongShape = normalizeSchumannResponse({
  // shapes a 404 HTML page or an unrelated JSON payload might present
  error: "Not Found",
  frequencies: "n/a",
  intensity: "high",
} as never);
ok(
  "normalizeSchumannResponse(wrong shape) yields no numeric SR observation and does not throw",
  wrongShape.frequencies.every((f) => f.valueHz === undefined)
    && wrongShape.intensity === undefined
    && wrongShape.amplitudePicoTesla === undefined
    && wrongShape.powerGwKm2 === undefined,
);

const hasObservation = (n: ReturnType<typeof normalizeSchumannResponse>) =>
  n.frequencies.some((f) => typeof f.valueHz === "number")
  || typeof n.intensity === "number"
  || typeof n.amplitudePicoTesla === "number"
  || typeof n.powerGwKm2 === "number";
ok("empty body is not accepted as an observation by the service gate", !hasObservation(emptyBody));
ok("wrong-shape body is not accepted as an observation by the service gate", !hasObservation(wrongShape));

/* 3. Fail-closed seed still present in the service ------------------------- */

ok(
  'environment service seeds ctx.schumann with metaUnavailable("schumann_resonance_live")',
  /schumann:\s*\{[^}]*metaUnavailable\("schumann_resonance_live"\)/s.test(serviceSrc)
    || /metaUnavailable\("schumann_resonance_live"\)/.test(serviceSrc),
);
ok(
  'environment service seeds Schumann provenance as "modelled-series" with empty frequencies',
  serviceSrc.includes('provenance: "modelled-series"') && /frequencies:\s*\[\]/.test(serviceSrc),
);
ok(
  "environment service only marks Schumann available on a real observation (hasObservation gate)",
  serviceSrc.includes("hasObservation") && serviceSrc.includes('status: "available"'),
);

/* 4. deriveEnvironmentBands default + hasSchumannObservation gate (CDI-A3) --- */

const ctxNoSchumann: EnvironmentContext = {
  dateKey: "2026-09-07",
  fetchedAt: "2026-09-07T00:00:00Z",
  location: {
    coordinates: { latitude: 0, longitude: 0 },
    source: { source: "device_gps", status: "available", observedAt: "2026-09-07T00:00:00Z" },
  },
};
const bands = deriveEnvironmentBands(ctxNoSchumann);
ok(
  'deriveEnvironmentBands with no Schumann data -> band "quiet" (not an invented state)',
  bands.schumann === "quiet" && bands.geomagnetic === "quiet",
);

// Build 110 Founder decision: Schumann is removed entirely from all UI
// surfaces (SCHUMANN_VISIBLE_SURFACES = 0), superseding the CDI-108-03
// "honest unavailable" render contract above (which still governs the
// underlying data-fetch/normalization layer that AI weak-context consumers
// may reference).
const envPageSrc = read("app/dashboard/environment/page.tsx");
ok(
  "/dashboard/environment no longer imports or renders Schumann UI",
  !/hasSchumannObservation|SchumannGraph|resolveSchumannUiState/.test(envPageSrc),
);

const cardSrc = read("components/dashboard/EnvironmentContextCard.tsx");
ok(
  "dashboard Environment card no longer renders a Schumann SummaryItem",
  !/frequencies\.some\(\(item\) => typeof item\.valueHz === "number"\)/.test(cardSrc),
);

console.log(`\nCDI-108-03 SCHUMANN SOURCE INTEGRITY: ${checks} checks passed`);

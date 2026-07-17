import { readFileSync } from "node:fs";
import { calculateBhumiMatrix } from "../lib/engines/calculateBhumiMatrix";
import { buildDestinyMatrixAnnualArcana, resolveDestinyMatrixArcanaAtAge } from "../lib/destiny-matrix/annualArcana";
import { buildDestinyMatrixPresentation } from "../lib/destiny-matrix/presentation";
import type { CanonicalDestinyMatrix } from "../lib/types/destinyMatrix";

type Result = { name: string; passed: boolean; detail: string };
const results: Result[] = [];
const check = (name: string, passed: boolean, detail: string) => results.push({ name, passed, detail });
const sentences = (value: string) => value.split(/[.!?]+(?=\s|$)/).map((part) => part.trim()).filter(Boolean).length;
const founder = calculateBhumiMatrix("1985-05-03");
const build = (asOf: string, timezone = "Asia/Jakarta") => buildDestinyMatrixAnnualArcana(founder, { birthDate: "1985-05-03", timezone, asOf: new Date(asOf) });
const before = build("2026-05-02T12:00:00Z");
const birthday = build("2026-05-02T17:00:00Z");
const after = build("2026-05-03T12:00:00Z");
const age41 = build("2026-07-16T05:00:00Z");
const age42 = build("2027-07-16T05:00:00Z");
const age50 = build("2035-07-16T05:00:00Z");
const pageSource = readFileSync("app/blueprint/destiny-matrix/page.tsx", "utf8");
const source = readFileSync("lib/destiny-matrix/annualArcana.ts", "utf8");

const mutate = (nodeId: string, value: number, remove = false): CanonicalDestinyMatrix => ({
  ...founder,
  graph: {
    ...founder.graph,
    nodes: remove ? founder.graph.nodes.filter((node) => node.id !== nodeId) : founder.graph.nodes.map((node) => node.id === nodeId ? { ...node, value } : node),
  },
});
const changedCenter = buildDestinyMatrixAnnualArcana(mutate("BM05", 4), { birthDate: "1985-05-03", timezone: "+07:00", asOf: new Date("2026-07-16T05:00:00Z") });
const changedLove = buildDestinyMatrixAnnualArcana(mutate("BM21", 6), { birthDate: "1985-05-03", timezone: "+07:00", asOf: new Date("2026-07-16T05:00:00Z") });
const changedMoney = buildDestinyMatrixAnnualArcana(mutate("BM22", 11), { birthDate: "1985-05-03", timezone: "+07:00", asOf: new Date("2026-07-16T05:00:00Z") });
const changedKarmic = buildDestinyMatrixAnnualArcana(mutate("BM17", 9), { birthDate: "1985-05-03", timezone: "+07:00", asOf: new Date("2026-07-16T05:00:00Z") });
const partial = buildDestinyMatrixAnnualArcana(mutate("BM21", 1, true), { birthDate: "1985-05-03", timezone: "+07:00", asOf: new Date("2026-07-16T05:00:00Z") });

check("canonical source", source.includes("DESTINY_MATRIX_AGE_CYCLE.points") && source.includes("matrix.timeline.segments"), "graph timeline plus Founder-approved ring mapping");
check("Founder age evidence", [39, 40, 41, 42, 50].map((age) => resolveDestinyMatrixArcanaAtAge(founder, age)).join("/") === "7/5/15/15/18", "39→7, 40→5, 41–42→15, 50→18");
check("one day before birthday", before?.age === 40 && before.arcana === 5, `${before?.age}/${before?.arcana}`);
check("exact local birthday", birthday?.age === 41 && birthday.arcana === 15, `${birthday?.age}/${birthday?.arcana}`);
check("one day after birthday", after?.age === 41 && after.arcana === 15, `${after?.age}/${after?.arcana}`);
check("Founder age 41", age41?.age === 41 && age41.arcana === 15, `${age41?.age}/${age41?.arcana}`);
check("Founder age 42", age42?.age === 42 && age42.arcana === 15, `${age42?.age}/${age42?.arcana}`);
check("Founder age 50", age50?.age === 50 && age50.arcana === 18, `${age50?.age}/${age50?.arcana}`);
check("active period", age41?.periodStart === "2026-05-03" && age41.periodEnd === "2028-05-02" && age41.ageRangeLabel === "Usia 41–42", `${age41?.periodStart}–${age41?.periodEnd}`);
check("timezone boundary", build("2026-05-02T18:00:00Z", "+07:00")?.age === 41 && build("2026-05-02T18:00:00Z", "UTC")?.age === 40, "local boundary differs safely from UTC");
check("missing timezone", build("2026-05-02T18:00:00Z", "")?.age === 40, "deterministic UTC fallback");
const leap = calculateBhumiMatrix("2000-02-29");
const leapResult = buildDestinyMatrixAnnualArcana(leap, { birthDate: "2000-02-29", timezone: "UTC", asOf: new Date("2025-02-28T00:00:00Z") });
check("leap birthday", leapResult?.age === 25, `age ${leapResult?.age}`);
check("missing birth time", age41 !== null, "birth time is not required by the verified full-age mapping");
check("no half-year invention", !/\.5|half|setMonth\([^)]*6/.test(source), "no unproven half-year transition");
check("Center integration", Boolean(age41?.centerConnection && changedCenter?.integratedParagraphs.join(" ") !== age41.integratedParagraphs.join(" ")), "position-aware Center narrative");
check("Love integration", Boolean(age41?.loveConnection && changedLove?.integratedParagraphs.join(" ") !== age41.integratedParagraphs.join(" ")), "position-aware Love narrative");
check("Money integration", Boolean(age41?.moneyConnection && changedMoney?.integratedParagraphs.join(" ") !== age41.integratedParagraphs.join(" ")), "position-aware Money narrative");
check("Karmic integration", Boolean(age41?.karmicConnection && changedKarmic?.integratedParagraphs.join(" ") !== age41.integratedParagraphs.join(" ")), "position-aware Karmic narrative");
check("complete paragraph count", age41?.integratedParagraphs.length === 3, String(age41?.integratedParagraphs.length));
check("complete sentence count", Boolean(age41?.integratedParagraphs.every((paragraph) => sentences(paragraph) >= 3 && sentences(paragraph) <= 4)), age41?.integratedParagraphs.map(sentences).join("/") ?? "missing");
check("partial paragraph count", partial?.integratedParagraphs.length === 2, String(partial?.integratedParagraphs.length));
check("no raw sequences", Boolean(age41?.integratedParagraphs.every((paragraph) => !/\b\d+(?:[–-]\d+){1,}/.test(paragraph))), "no technical path sequence in prose");
check("no fatalistic relationship prediction", Boolean(age41?.integratedParagraphs.every((paragraph) => !/pasti|perceraian|pernikahan|pengkhianatan|soulmate|twin flame/i.test(paragraph))), "reflective language only");
check("no financial promise", Boolean(age41?.integratedParagraphs.every((paragraph) => !/pasti kaya|jaminan|bangkrut|keuntungan pasti/i.test(paragraph))), "no promise or financial advice");
check("not calendar year", build("2026-01-01T12:00:00Z")?.arcana === before?.arcana, "January 1 does not change the Arcana");
check("not Personal Year", !/personal year|current year digits|numerology/i.test(source), "Destiny Matrix source only");
check("deterministic", JSON.stringify(build("2026-07-16T05:00:00Z")) === JSON.stringify(build("2026-07-16T05:00:00Z")), "same input produces same output");
check("birthday invalidation", before?.arcana !== birthday?.arcana && before?.periodEnd !== birthday?.periodEnd, "active result changes at birthday boundary");
check("invalid birth date omission", buildDestinyMatrixAnnualArcana(founder, { birthDate: null }) === null, "section omitted");
const presentation = buildDestinyMatrixPresentation(founder, { birthDate: "1985-05-03", timezone: "Asia/Jakarta", asOf: new Date("2026-07-16T05:00:00Z") });
check("presentation adapter ownership", presentation.annualArcana?.arcana === 15 && !/resolveDestinyMatrixArcanaAtAge/.test(pageSource), "page renders adapter output");
check("section placement", pageSource.indexOf("ACTIVE ANNUAL ARCANA") > pageSource.indexOf("CHAKRA MATRIX") && pageSource.indexOf("ACTIVE ANNUAL ARCANA") < pageSource.indexOf("DESTINY MATRIX SYNTHESIS"), "before Kesimpulan Dirimu");
check("expandable detail", pageSource.includes("Keterangan selengkapnya") && pageSource.includes("presentation.annualArcana.integratedParagraphs"), "title and metadata remain visible; prose expands");
check("read-only and no live AI", !/setUser|saveUser|updateDoc|addDoc|generateContent|openai|gemini/i.test(`${pageSource}\n${source}`), "no write or live generation");
check("source metadata", age41?.sourceClassification === "FOUNDER_APPROVED_FUNCTIONAL_RECONSTRUCTION" && age41.sourceVersion === "v3-build-72-age-ring-reconstruction-1", age41?.sourceVersion ?? "missing");

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "failed" : "passed", summary: { passed: results.length - failed.length, failed: failed.length }, failures: failed, results }, null, 2));
if (failed.length) process.exitCode = 1;

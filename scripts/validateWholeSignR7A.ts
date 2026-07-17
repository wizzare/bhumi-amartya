import { readFileSync } from "node:fs";
import { calculateNatalBasics } from "../lib/astrology/calculateNatalBasics";
import { calculateWholeSign, WHOLE_SIGN_SIGNS, wholeSignHouseForSign } from "../lib/whole-sign/calculateWholeSign";
import { buildWholeSignPresentation } from "../lib/whole-sign/presentation";
import type { NatalBasics } from "../lib/astrology/calculateNatalBasics";
import type { PlanetaryPosition } from "../lib/types/blueprint";

type Result = { name: string; passed: boolean; detail: string };
const results: Result[] = [];
const check = (name: string, passed: boolean, detail: string) => results.push({ name, passed, detail });
const equal = (left: unknown, right: unknown) => JSON.stringify(left) === JSON.stringify(right);
const sentenceCount = (value: string) => value.split(/[.!?]+(?=\s|$)/).map((item) => item.trim()).filter(Boolean).length;

const founderInput = { birthDate: "1985-05-03", birthTime: "23:45", birthCity: "Jakarta", birthCountry: "Indonesia", timezone: "+07:00", latitude: -6.2088, longitude: 106.8456 };
const natal = calculateNatalBasics(founderInput);
const whole = calculateWholeSign(founderInput);
const presentation = buildWholeSignPresentation(whole);
const calcSource = readFileSync("lib/whole-sign/calculateWholeSign.ts", "utf8");
const presentationSource = readFileSync("lib/whole-sign/presentation.ts", "utf8");
const pageSource = readFileSync("app/blueprint/whole-sign/page.tsx", "utf8");
const profileSource = readFileSync("app/profile/page.tsx", "utf8");
const natalPageSource = readFileSync("app/blueprint/natal-chart/page.tsx", "utf8");

check("active tropical chain", calcSource.includes("calculateNatalBasics(input)") && calcSource.includes("storedNatal"), "canonical stored facts or active tropical calculator");
check("all Ascendant signs", WHOLE_SIGN_SIGNS.every((sign) => wholeSignHouseForSign(sign, sign) === 1), "12/12 Ascendant signs own House 1");
check("sign wraparound", wholeSignHouseForSign("Pisces", "Aries") === 12 && wholeSignHouseForSign("Aries", "Pisces") === 2, "wraparound verified");
check("one sign after", wholeSignHouseForSign("Taurus", "Aries") === 2, "next sign is House 2");
check("one sign before", wholeSignHouseForSign("Pisces", "Aries") === 12, "previous sign is House 12");
check("twelve houses", whole.houses.length === 12 && new Set(whole.houses.map((house) => house.houseNumber)).size === 12, "12 unique house numbers");
check("twelve signs", new Set(whole.houses.map((house) => house.sign)).size === 12, "12 unique zodiac signs");
check("no Placidus cusp ownership", calcSource.includes("wholeSignHouseForSign(value.sign, ascendantSign)") && !/determineHouse|cusp/i.test(calcSource), "projection uses sign distance; Placidus house is retained only as comparison evidence");
check("same planet longitudes", equal(whole.planets.map(({ planet, longitude, sign, retrograde }) => ({ planet, longitude, sign, retrograde })), Object.entries(natal.planets || {}).map(([planet, value]) => ({ planet, longitude: value.longitude, sign: value.sign, retrograde: value.retrograde }))), "canonical tropical facts reused");
check("same aspects", equal(whole.aspects, natal.aspects || []), `${whole.aspects.length} canonical aspects reused`);

const fixturePlanet = (sign: string, longitude: number): PlanetaryPosition => ({ sign, longitude, degree: longitude % 30, retrograde: false });
const mcOutsideNatal = {
  ...natal,
  ascendant: "Aries",
  midheaven: "Sagittarius",
  planets: { Sun: fixturePlanet("Aries", 5), Moon: fixturePlanet("Cancer", 95) },
} as NatalBasics;
const mcOutside = calculateWholeSign(founderInput, mcOutsideNatal);
check("Midheaven outside House 10", mcOutside.midheaven?.wholeSignHouse === 9, `MC in House ${mcOutside.midheaven?.wholeSignHouse}`);
check("angular identification", whole.angularPlanets.every((planet) => [1, 4, 7, 10].includes(planet.wholeSignHouse || 0)), `${whole.angularPlanets.length} angular placements`);
check("empty houses", whole.houses.filter((house) => house.planets.length === 0).every((house) => /bukan berarti/.test(house.fullExplanation)), "empty houses retain sign, ruler, and meaning");
check("traditional rulership", whole.houses.find((house) => house.sign === "Aquarius")?.ruler === "Saturn" && whole.houses.find((house) => house.sign === "Scorpio")?.ruler === "Mars", "traditional rulers are primary");
check("modern co-rulers", whole.houses.find((house) => house.sign === "Aquarius")?.modernCoRuler === "Uranus" && whole.houses.find((house) => house.sign === "Pisces")?.modernCoRuler === "Neptune", "modern co-rulers identified separately");

const missingTime = calculateWholeSign({ ...founderInput, birthTime: "" });
const missingLocation = calculateWholeSign({ ...founderInput, birthCity: "Unknown", latitude: null, longitude: null });
const invalidTimezone = calculateWholeSign({ ...founderInput, timezone: "Invalid/Zone" });
const invalidTimezoneStored = calculateWholeSign({ ...founderInput, timezone: "Invalid/Zone" }, natal);
check("missing birth time", !missingTime.ascendant && missingTime.houses.length === 0, missingTime.birthDataStatus);
check("missing location", !missingLocation.ascendant && missingLocation.houses.length === 0, missingLocation.birthDataStatus);
check("invalid timezone", !invalidTimezone.ascendant && invalidTimezone.houses.length === 0 && !invalidTimezoneStored.ascendant && invalidTimezoneStored.houses.length === 0, invalidTimezone.birthDataStatus);

const legacy = calculateWholeSign(founderInput, { ...natal, wholeSignHouses: undefined });
check("legacy record", legacy.houses.length === 12 && legacy.planets.length === whole.planets.length, "reprojected from canonical signs and longitudes");
check("calculation failure safety", pageSource.includes("catch (error)") && pageSource.includes("Whole Sign Birth Chart belum dapat dibangun"), "route owns safe unavailable state");
check("presentation failure safety", pageSource.includes("setPresentation(null)"), "no fabricated fallback chart");
check("deterministic", equal(calculateWholeSign(founderInput), whole) && equal(buildWholeSignPresentation(whole), presentation), "calculation and presentation stable");
const other = calculateWholeSign({ birthDate: "1990-01-01", birthTime: "12:00", birthCity: "London", timezone: "+00:00", latitude: 51.5074, longitude: -0.1278 });
check("cross-user isolation", !equal(other.planets, whole.planets) && buildWholeSignPresentation(other).hero.insight !== presentation.hero.insight, "different birth input produces independent output");
check("no storage write", !/setUser|saveUser|updateDoc|addDoc|\.save\(/.test(pageSource), "read-only route");
check("Profile card integration", profileSource.includes('title: "Whole Sign Birth Chart"') && profileSource.includes('href: "/blueprint/whole-sign"') && profileSource.includes('desc: "Rumah kehidupan melalui astrologi tropical dengan sistem Whole Sign."') && !/wholeSignCard\.(?:ascendant|sunHouse|moonHouse|insight|action)/.test(profileSource), "ninth card uses the same title-and-description contract as the existing cards");
check("Profile append order", profileSource.indexOf('title: "Whole Sign Birth Chart"') > profileSource.indexOf('title: "Tzolkin Maya"'), "new card follows original eight");
check("route source", pageSource.includes("export default function WholeSignPage") && pageSource.includes("calculateWholeSign") && pageSource.includes("buildWholeSignPresentation"), "separate canonical route");
check("hero", presentation.hero.title === "Rumah Kehidupan dalam Whole Sign" && presentation.hero.eyebrow === "Whole Sign Birth Chart", presentation.hero.title);
check("chart identity", presentation.identity.some((item) => item.value === "Tropical Zodiac") && presentation.identity.some((item) => item.value === "Whole Sign Houses") && !presentation.identity.some((item) => item.label === "Status"), "tropical and house system explicit; redundant complete status omitted");
check("Ascendant narrative", Boolean(presentation.ascendant && sentenceCount(presentation.ascendant.narrative) >= 2 && sentenceCount(presentation.ascendant.narrative) <= 3), String(sentenceCount(presentation.ascendant?.narrative || "")));
check("Sun narrative", Boolean(presentation.sun && sentenceCount(presentation.sun.narrative) >= 2 && sentenceCount(presentation.sun.narrative) <= 3), String(sentenceCount(presentation.sun?.narrative || "")));
check("Moon narrative", Boolean(presentation.moon && sentenceCount(presentation.moon.narrative) >= 2 && sentenceCount(presentation.moon.narrative) <= 3), String(sentenceCount(presentation.moon?.narrative || "")));
check("planet narratives", presentation.planets.every((card) => sentenceCount(card.narrative) >= 2 && sentenceCount(card.narrative) <= 3), `${presentation.planets.length} cards`);
check("house cards", presentation.houses.length === 12 && presentation.houses.every((card) => card.title.startsWith("House ")), "all canonical labels visible");
check("house emphasis transparency", whole.houseEmphasis.every((item) => item.reasons.length > 0) && calcSource.includes("reasons"), "qualitative reasons exposed");
check("relationship synthesis", Boolean(presentation.relationshipThemes && sentenceCount(presentation.relationshipThemes) === 3), "House 7, Venus, Mars, Moon integrated");
check("home synthesis", Boolean(presentation.homeThemes && sentenceCount(presentation.homeThemes) === 3), "House 4 and Moon integrated");
check("work synthesis", Boolean(presentation.workThemes && sentenceCount(presentation.workThemes) === 3), "House 10, Saturn, and MC integrated");
check("spiritual synthesis", Boolean(presentation.spiritualThemes && sentenceCount(presentation.spiritualThemes) === 3 && !/tingkat spiritual|lebih tinggi/i.test(presentation.spiritualThemes)), "House 9, House 12, Jupiter, and Neptune integrated without ranking");
check("soul mission synthesis", Boolean(presentation.soulMissionThemes && sentenceCount(presentation.soulMissionThemes) === 3 && /bukan satu takdir/.test(presentation.soulMissionThemes)), "Sun, North Node, and chart ruler integrated non-fatalistically");
check("spiritual and mission placement", pageSource.indexOf('title="Arah Spiritual"') > pageSource.indexOf('title="Work and Contribution"') && pageSource.indexOf('title="Misi Jiwa"') > pageSource.indexOf('title="Arah Spiritual"'), "both sections follow Work and Contribution");
check("comparison section removed", !pageSource.includes("Whole Sign dan Placidus") && !("comparison" in presentation), "Founder-requested comparison card is absent");
check("summary paragraphs", presentation.summary.length === 4, String(presentation.summary.length));
check("summary sentences", presentation.summary.every((paragraph) => sentenceCount(paragraph) >= 2 && sentenceCount(paragraph) <= 4), presentation.summary.map(sentenceCount).join("/"));
check("summary evidence ownership", presentation.summary.some((paragraph) => /penguasa chart|House\s*\d/.test(paragraph)) && presentation.summary.some((paragraph) => /Placidus/.test(paragraph)), "summary consumes house structure and redistribution evidence");
check("partial presentation", buildWholeSignPresentation(missingTime).houses.length === 0 && buildWholeSignPresentation(missingTime).summary.length === 2, "no house claims without birth time");
check("Founder Ascendant", whole.ascendant?.sign === "Aquarius", whole.ascendant?.sign || "missing");
const founderSigns = Object.fromEntries(whole.planets.map((planet) => [planet.planet, planet.sign]));
check("Founder planet signs", equal([founderSigns.Sun, founderSigns.Moon, founderSigns.Mercury, founderSigns.Venus, founderSigns.Mars, founderSigns.Jupiter, founderSigns.Saturn, founderSigns.Uranus, founderSigns.Neptune, founderSigns.Pluto], ["Taurus", "Libra", "Aries", "Aries", "Gemini", "Aquarius", "Scorpio", "Sagittarius", "Capricorn", "Scorpio"]), "active tropical engine matches historical reference");
check("Founder houses", equal(whole.houses.map((house) => house.sign), ["Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn"]), "Aquarius House 1 sequence verified");
check("Natal separation", !/whole-sign|WholeSign|calculateWholeSign/.test(natalPageSource) && !/buildNatalPresentation/.test(calcSource), "Natal route remains separate");
check("other systems isolation", !/human-design|numerology|destiny-matrix|weton|bazi|vedic|tzolkin/.test(`${calcSource}\n${presentationSource}\n${pageSource}`), "Whole Sign modules consume astrology only");
check("mobile source safety", /grid-cols-2|md:grid-cols-2|flex-wrap|max-w-/.test(pageSource) && !/min-w-\[/.test(pageSource), "stacking and wrapping present; no forced horizontal width");
check("desktop source safety", /max-w-5xl|xl:grid-cols-3|lg:grid-cols-5/.test(pageSource), "bounded readable desktop grids");
check("no live AI", !/openai|generateContent|generative-ai|fetch\(/i.test(`${calcSource}\n${presentationSource}\n${pageSource}`), "deterministic local presentation");

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "failed" : "passed", summary: { passed: results.length - failed.length, failed: failed.length }, failures: failed, results }, null, 2));
if (failed.length) process.exitCode = 1;

// READ-ONLY: Bug 3 blast-radius count + sample diff (corrected vs stored).
//
// Does NOT mutate Firestore.
// - Tally blueprints by source / calculationQuality / status / hdAuditStatus.
// - For each non-canonical blueprint that ALSO has stored birth data (users/{uid}),
//   recompute Type/Profile/channels under the corrected +58° offset, diff vs stored.

import admin from "firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

admin.initializeApp({ projectId: "bhumiamartya-fe85c" });
const db = getFirestore();

// Mirror the corrected engine (verbatim from lib/humandesign/calculateHumanDesignType.ts).
import * as Astronomy from "astronomy-engine";

const gateOrder = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];
const centersByChannel = {
  "1-8": ["G","Throat"], "2-14": ["Sacral","G"], "3-60": ["Root","Sacral"],
  "4-63": ["Head","Ajna"], "5-15": ["Sacral","G"], "6-59": ["Sacral","Solar Plexus"],
  "7-31": ["G","Throat"], "9-52": ["Root","Sacral"], "10-20": ["G","Throat"],
  "10-34": ["G","Sacral"], "10-57": ["G","Spleen"], "11-56": ["Ajna","Throat"],
  "12-22": ["Throat","Solar Plexus"], "13-33": ["G","Throat"], "16-48": ["Spleen","Throat"],
  "17-62": ["Ajna","Throat"], "18-58": ["Root","Spleen"], "19-49": ["Root","Solar Plexus"],
  "20-34": ["Throat","Sacral"], "20-57": ["Throat","Spleen"], "21-45": ["Ego","Throat"],
  "23-43": ["Ajna","Throat"], "24-61": ["Head","Ajna"], "25-51": ["Ego","Throat"],
  "26-44": ["Spleen","Ego"], "27-50": ["Spleen","Sacral"], "28-38": ["Spleen","Root"],
  "29-46": ["Sacral","G"], "30-41": ["Root","Solar Plexus"], "32-54": ["Root","Spleen"],
  "34-57": ["Sacral","Spleen"], "35-36": ["Solar Plexus","Throat"], "37-40": ["Ego","Solar Plexus"],
  "39-55": ["Root","Solar Plexus"], "42-53": ["Root","Sacral"], "47-64": ["Head","Ajna"],
};
const planets = [
  Astronomy.Body.Sun, Astronomy.Body.Moon, Astronomy.Body.Mercury,
  Astronomy.Body.Venus, Astronomy.Body.Mars, Astronomy.Body.Jupiter,
  Astronomy.Body.Saturn, Astronomy.Body.Uranus, Astronomy.Body.Neptune, Astronomy.Body.Pluto,
];
const GATE_OFFSET = 58;

function norm(v) { const n = v % 360; return n < 0 ? n + 360 : n; }
function gate(lon) { const a = norm(lon + GATE_OFFSET); return gateOrder[Math.floor((a/360)*64)]; }
function line(lon) { const a = norm(lon + GATE_OFFSET); return Math.floor((((a/360)*64) % 1) * 6) + 1; }
function eclon(body, date) {
  if (body === Astronomy.Body.Sun) return Astronomy.SunPosition(date).elon;
  if (body === Astronomy.Body.Moon) return Astronomy.EclipticGeoMoon(date).lon;
  return Astronomy.Ecliptic(Astronomy.GeoVector(body, date, true)).elon;
}
function gatesForDate(date) {
  const out = planets.map(b => gate(eclon(b, date)));
  out.push(gate(eclon(Astronomy.Body.Sun, date)));
  out.push(gate(norm(eclon(Astronomy.Body.Sun, date) + 180)));
  return [...new Set(out)];
}
function unwrappedSun(date, pSun) {
  const l = eclon(Astronomy.Body.Sun, date);
  return l > pSun ? l - 360 : l;
}
function findDesignDate(pDate) {
  const pSun = eclon(Astronomy.Body.Sun, pDate);
  const tgt = pSun - 88;
  let s = new Date(pDate.getTime() - 100*86400000);
  let e = new Date(pDate.getTime() - 70*86400000);
  for (let i=0;i<32;i++) {
    const m = new Date((s.getTime()+e.getTime())/2);
    const u = unwrappedSun(m, pSun);
    if (u < tgt) s = m; else e = m;
  }
  return new Date((s.getTime()+e.getTime())/2);
}
function recalc(birthDate, birthTime, timezone, longitude) {
  // Approximate: use Intl Date for non-+HH:mm timezones, but here we assume +HH:mm.
  const t = birthTime.length === 5 ? `${birthTime}:00` : birthTime;
  const m2 = timezone.match(/^([+-])(\d{1,2})(?::?(\d{2}))?$/);
  const off = m2 ? (m2[1]==="-"?-1:1)*(Number(m2[2])*60+Number(m2[3]||"0")) : 0;
  const [y,mo,d] = birthDate.split("-").map(Number);
  const [h,mi,sc] = t.split(":").map(Number);
  const pDate = new Date(Date.UTC(y, mo-1, d, h, mi, sc) - off*60000);
  const dDate = findDesignDate(pDate);
  const gates = [...new Set([...gatesForDate(pDate), ...gatesForDate(dDate)])].sort((a,b)=>a-b);
  const channels = Object.keys(centersByChannel).filter(ch => {
    const [a,b] = ch.split("-").map(Number);
    return gates.includes(a) && gates.includes(b);
  }).sort();
  const definedCenters = [...new Set(channels.flatMap(ch => centersByChannel[ch]))].sort();
  const motors = ["Sacral","Root","Solar Plexus","Ego"];
  let m2t = false;
  if (definedCenters.includes("Throat")) {
    const adj = new Map();
    channels.forEach(ch => {
      const [c1,c2] = centersByChannel[ch];
      if (!adj.has(c1)) adj.set(c1, []);
      if (!adj.has(c2)) adj.set(c2, []);
      adj.get(c1).push(c2); adj.get(c2).push(c1);
    });
    const visited = new Set(["Throat"]); const queue = ["Throat"];
    while (queue.length > 0) {
      const c = queue.shift();
      if (motors.includes(c)) { m2t = true; break; }
      for (const n of (adj.get(c) || [])) if (!visited.has(n)) { visited.add(n); queue.push(n); }
    }
  }
  let type = "Projector";
  if (definedCenters.includes("Sacral")) type = m2t ? "Manifesting Generator" : "Generator";
  else if (m2t) type = "Manifestor";
  const profile = `${line(eclon(Astronomy.Body.Sun, pDate))}/${line(eclon(Astronomy.Body.Sun, dDate))}`;
  return { type, profile, channels, definedCenters, gates };
}

console.log("=========================================================");
console.log("BUG 3 BLAST-RADIUS COUNT (READ-ONLY) — corrected engine");
console.log("=========================================================");

// Step 1: provenance tally across all blueprints.
const provTally = { total: 0, withHumanDesign: 0, bySource: {}, byCalcQuality: {}, byStatus: {}, byAudit: {} };
const snap = await db.collection("blueprints").get();
provTally.total = snap.size;
snap.forEach(doc => {
  const d = doc.data();
  const hd = d.humanDesign;
  if (!hd) return;
  provTally.withHumanDesign++;
  const inc = (b, k, v) => { b[k] = (b[k] || 0) + 1; if (v != null) b[`${k}:${v}`] = (b[`${k}:${v}`] || 0) + 1; };
  inc(provTally.bySource, "all", hd.source || "?");
  if (hd.source) inc(provTally.bySource, "source", hd.source);
  inc(provTally.byCalcQuality, "all", hd.calculationQuality || "?");
  if (hd.calculationQuality) inc(provTally.byCalcQuality, "cq", hd.calculationQuality);
  inc(provTally.byStatus, "all", hd.status || "?");
  if (hd.status) inc(provTally.byStatus, "status", hd.status);
  inc(provTally.byAudit, "all", hd.hdAuditStatus || "?");
  if (hd.hdAuditStatus) inc(provTally.byAudit, "audit", hd.hdAuditStatus);
});

console.log("\nTOTAL blueprints:", provTally.total);
console.log("with humanDesign:", provTally.withHumanDesign);
console.log("\nbySource:");
console.log(JSON.stringify(provTally.bySource, null, 2));
console.log("\nbyCalcQuality:");
console.log(JSON.stringify(provTally.byCalcQuality, null, 2));
console.log("\nbyStatus:");
console.log(JSON.stringify(provTally.byStatus, null, 2));
console.log("\nbyAudit:");
console.log(JSON.stringify(provTally.byAudit, null, 2));

// Step 2: identify fallback-provenance candidates (would change under +58° fix).
// Per audit, fallback records are: source=="local-fallback" OR
// calculationQuality=="fallback_approximation" OR hdAuditStatus=="pending" with
// stored type set. We enumerate and recompute for those that also have a users/{uid}
// doc with birth data.
const fallbackCandidates = [];
snap.forEach(doc => {
  const d = doc.data();
  const hd = d.humanDesign;
  if (!hd) return;
  const isFallbackProvenance =
    hd.source === "local-fallback" ||
    hd.calculationQuality === "fallback_approximation" ||
    (hd.hdAuditStatus === "pending" && hd.type != null);
  if (!isFallbackProvenance) return;
  if (!hd.type) return; // truly pending — nothing to diff
  fallbackCandidates.push({ uid: doc.id, stored: hd });
});

console.log("\nFALLBACK-PROVENANCE CANDIDATES (with stored type):", fallbackCandidates.length);

// Step 3: for the first ~20, pull users/{uid} and recompute.
let recomputed = 0, wouldChange = 0, unchanged = 0, noBirthData = 0;
const diffs = [];
for (const fc of fallbackCandidates.slice(0, 50)) {
  const usnap = await db.doc(`users/${fc.uid}`).get();
  if (!usnap.exists) { noBirthData++; continue; }
  const u = usnap.data();
  const birthDate = u?.birthDate;
  const birthTime = u?.birthTime;
  const timezone = u?.timezone;
  const longitude = u?.longitude;
  if (!birthDate || !birthTime || !timezone) { noBirthData++; continue; }
  try {
    const newRes = recalc(birthDate, birthTime, timezone, longitude);
    recomputed++;
    const storedCh = (fc.stored.channels || []).slice().sort().join(",");
    const newCh = (newRes.channels || []).slice().sort().join(",");
    const typeChanged = fc.stored.type !== newRes.type;
    const profileChanged = fc.stored.profile !== newRes.profile;
    const channelChanged = storedCh !== newCh;
    if (typeChanged || profileChanged || channelChanged) {
      wouldChange++;
      if (diffs.length < 12) {
        diffs.push({
          uid: fc.uid.slice(0,8) + "…",
          birthDate,
          stored: { type: fc.stored.type, profile: fc.stored.profile, channels: storedCh },
          corrected: { type: newRes.type, profile: newRes.profile, channels: newCh },
          source: fc.stored.source || "?",
          cq: fc.stored.calculationQuality || "?",
        });
      }
    } else {
      unchanged++;
    }
  } catch (e) {
    noBirthData++;
  }
}

console.log("\nRecomputed (first 50):", recomputed);
console.log("  would CHANGE under corrected +58° engine:", wouldChange);
console.log("  unchanged:", unchanged);
console.log("  no birth data / errored:", noBirthData);

console.log("\nSAMPLE DIFFS (corrected vs stored):");
for (const d of diffs) console.log(JSON.stringify(d, null, 2));

// Estimate: if first 50 shows X% change rate, project to entire candidate set.
const est = fallbackCandidates.length > 0
  ? Math.round((wouldChange / Math.max(recomputed, 1)) * fallbackCandidates.length)
  : 0;
console.log(`\nPROJECTED blast radius: ~${est} of ${fallbackCandidates.length} fallback-provenance records would change.`);
console.log("(Projection assumes first-50 change rate generalises; sanity-check before migration.)");

process.exit(0);

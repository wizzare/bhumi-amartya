const Astronomy = require("astronomy-engine");
const fs = require('fs');

// We manually implement the logic here since importing from lib is failing due to ESM/CJS mix
const gateOrder = [
  41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3,
  27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56,
  31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50,
  28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60,
];

const centersByChannel = {
  "1-8": ["G", "Throat"],
  "2-14": ["Sacral", "G"],
  "3-60": ["Root", "Sacral"],
  "4-63": ["Head", "Ajna"],
  "5-15": ["Sacral", "G"],
  "6-59": ["Sacral", "Solar Plexus"],
  "7-31": ["G", "Throat"],
  "9-52": ["Root", "Sacral"],
  "10-20": ["G", "Throat"],
  "10-34": ["G", "Sacral"],
  "10-57": ["G", "Spleen"],
  "11-56": ["Ajna", "Throat"],
  "12-22": ["Throat", "Solar Plexus"],
  "13-33": ["G", "Throat"],
  "16-48": ["Spleen", "Throat"],
  "17-62": ["Ajna", "Throat"],
  "18-58": ["Root", "Spleen"],
  "19-49": ["Root", "Solar Plexus"],
  "20-34": ["Throat", "Sacral"],
  "20-57": ["Throat", "Spleen"],
  "21-45": ["Ego", "Throat"],
  "23-43": ["Ajna", "Throat"],
  "24-61": ["Head", "Ajna"],
  "25-51": ["Ego", "Throat"],
  "26-44": ["Spleen", "Ego"],
  "27-50": ["Spleen", "Sacral"],
  "28-38": ["Spleen", "Root"],
  "29-46": ["Sacral", "G"],
  "30-41": ["Root", "Solar Plexus"],
  "32-54": ["Root", "Spleen"],
  "34-57": ["Sacral", "Spleen"],
  "35-36": ["Solar Plexus", "Throat"],
  "37-40": ["Ego", "Solar Plexus"],
  "39-55": ["Root", "Solar Plexus"],
  "42-53": ["Root", "Sacral"],
  "47-64": ["Head", "Ajna"],
};

function normalizeDegrees(value) {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function gateFromLongitude(longitude) {
  const adjusted = normalizeDegrees(longitude + 58);
  return gateOrder[Math.floor((adjusted / 360) * 64)];
}

function birthDateTimeToUtcDate(birthDate, birthTime, timezone) {
  const [year, month, day] = birthDate.split("-").map(Number);
  const [hour, minute] = birthTime.split(":").map(Number);
  const sign = timezone[0] === "-" ? -1 : 1;
  const hours = Number(timezone.slice(1, 3));
  const minutes = Number(timezone.slice(4, 6));
  const offsetMinutes = sign * (hours * 60 + minutes);
  const utcMs = Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60_000;
  return new Date(utcMs);
}

function eclipticLongitude(body, date) {
  if (body === "Sun") return Astronomy.SunPosition(date).elon;
  if (body === "Moon") return Astronomy.EclipticGeoMoon(date).lon;
  // Node logic skipped here to match JS fallback exactly
  return 0;
}

function activatedGatesForDate(date) {
    const bodies = ["Sun", "Moon"]; // JS Fallback only does major planets, no Nodes
    const gates = bodies.map(b => gateFromLongitude(eclipticLongitude(b, date)));
    const earthGate = gateFromLongitude(normalizeDegrees(eclipticLongitude("Sun", date) + 180));
    return [...new Set([...gates, earthGate])];
}

const motors = ["Sacral", "Root", "Solar Plexus", "Ego"];

function motorToThroat(channels, definedCenters) {
  if (!definedCenters.has("Throat")) return false;
  const adj = new Map();
  channels.forEach(ch => {
    const [c1, c2] = centersByChannel[ch];
    if (!adj.has(c1)) adj.set(c1, []);
    if (!adj.has(c2)) adj.set(c2, []);
    adj.get(c1).push(c2);
    adj.get(c2).push(c1);
  });
  const visited = new Set();
  const queue = ["Throat"];
  visited.add("Throat");
  while (queue.length > 0) {
    const curr = queue.shift();
    if (motors.includes(curr)) return true;
    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return false;
}

async function runForensic() {
  console.log("=== HUMAN DESIGN FORENSIC AUDIT PHASE 2 ===");

  const cases = [
    {
      name: "Widya Amalia",
      birthDate: "1987-06-09",
      birthTime: "09:00",
      timezone: "+07:00",
      longitude: 112.809,
      expected: "Manifestor 1/3 Emotional"
    },
    {
      name: "Trisia",
      birthDate: "2002-09-17",
      birthTime: "02:00",
      timezone: "+08:00",
      longitude: 114.591,
      expected: "Manifesting Generator Emotional"
    }
  ];

  for (const c of cases) {
    console.log(`\n--- CASE: ${c.name} ---`);
    const pDate = birthDateTimeToUtcDate(c.birthDate, c.birthTime, c.timezone);

    // Design Date (Approximate -88 degrees Sun)
    const pSunLon = Astronomy.SunPosition(pDate).elon;
    const targetLon = pSunLon - 88;
    const dDate = new Date(pDate.getTime() - 88 * 24 * 60 * 60 * 1000); // Rough estimate for now

    const activeGates = new Set([
        ...activatedGatesForDate(pDate),
        ...activatedGatesForDate(dDate)
    ]);

    const channels = Object.keys(centersByChannel).filter(ch => {
        const [g1, g2] = ch.split("-").map(Number);
        return activeGates.has(g1) && activeGates.has(g2);
    });

    const definedCenters = new Set();
    channels.forEach(ch => {
        centersByChannel[ch].forEach(c => definedCenters.add(c));
    });

    let type = "Projector";
    if (channels.length === 0) type = "Reflector";
    else if (definedCenters.has("Sacral")) {
        type = motorToThroat(channels, definedCenters) ? "Manifesting Generator" : "Generator";
    } else if (motorToThroat(channels, definedCenters)) {
        type = "Manifestor";
    }

    console.log("JS FALLBACK RESULT (Simulated):");
    console.log(`- Type:    ${type}`);
    console.log(`- Centers: ${Array.from(definedCenters).join(", ")}`);
    console.log(`- Channels: ${channels.join(", ")}`);
    console.log(`- Active Gates: ${Array.from(activeGates).sort((a,b)=>a-b).join(", ")}`);
  }
}

runForensic();

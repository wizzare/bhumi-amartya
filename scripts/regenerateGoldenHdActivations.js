const fs = require("node:fs");
const apiv2 = require("C:/Users/shein/AppData/Roaming/npm/node_modules/firebase-tools/lib/apiv2");
const firebaseAuth = require("C:/Users/shein/AppData/Roaming/npm/node_modules/firebase-tools/lib/auth");

const PROJECT_ID = "bhumiamartya-fe85c";
const API = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const approvedNames = ["Widhi", "Ning", "Widya", "Amartya", "Eva Syana"];
const goldenBirthDates = {
  Widhi: "1985-05-03",
  Ning: "1993-10-10",
  Widya: "1987-06-09",
  Amartya: "2012-06-16",
  "Eva Syana": "1990-09-10",
};

function encode(value) {
  if (value === null) return { nullValue: null };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (value && typeof value === "object") {
    return { mapValue: { fields: Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item)])) } };
  }
  throw new Error(`Unsupported Firestore value: ${typeof value}`);
}

function decode(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(decode);
  if ("mapValue" in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, decode(item)]));
}

function documentData(document) {
  return Object.fromEntries(Object.entries(document.fields || {}).map(([key, value]) => [key, decode(value)]));
}

function normalizedName(data) {
  return String(data.fullName || data.displayName || data.name || "").trim().toLowerCase();
}

async function request(url, options = {}) {
  const token = await apiv2.getAccessToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${await response.text()}`);
  return response.json();
}

async function listCollection(collectionId) {
  const output = [];
  let pageToken = "";
  do {
    const url = `${API}/${collectionId}?pageSize=1000${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
    const page = await request(url);
    output.push(...(page.documents || []));
    pageToken = page.nextPageToken || "";
  } while (pageToken);
  return output;
}

async function main() {
  const account = firebaseAuth.getGlobalDefaultAccount();
  if (!account || account.user?.email !== "wizzare@gmail.com") {
    throw new Error("Founder Firebase CLI account is not available.");
  }
  firebaseAuth.setActiveAccount({}, account);
  const activations = JSON.parse(fs.readFileSync("C:/tmp/hd-golden-activations.json", "utf8").replace(/^\uFEFF/, ""));
  const users = await listCollection("users");
  const userRows = users.map((document) => ({
    uid: document.name.split("/").pop(),
    data: documentData(document),
  }));
  const report = [];

  for (const name of approvedNames) {
    const baseCandidates = userRows.filter((row) => {
      const stored = normalizedName(row.data);
      return stored === name.toLowerCase() || stored.startsWith(`${name.toLowerCase()} `);
    });
    const candidates = await Promise.all(baseCandidates.map(async (row) => {
      try {
        const blueprint = documentData(await request(`${API}/blueprints/${row.uid}`));
        return { ...row, blueprint };
      } catch {
        return { ...row, blueprint: null };
      }
    }));
    const exact = candidates.filter((row) => normalizedName(row.data) === name.toLowerCase());
    const canonicalFullName = name === "Widya" ? "widya amalia" : name.toLowerCase();
    const canonical = candidates.filter((row) => normalizedName(row.data) === canonicalFullName);
    const birthMatched = candidates.filter((row) => {
      const storedDate = row.data.birthDate || row.data.birthData?.birthDate || row.data.input?.birthDate;
      return storedDate === goldenBirthDates[name];
    });
    const canonicalHd = name === "Widya"
      ? birthMatched.filter((row) => row.blueprint?.humanDesign?.type === "Manifestor" && String(row.blueprint?.humanDesign?.profile || "").startsWith("1/3"))
      : [];
    const target = canonicalHd.length === 1 ? canonicalHd : birthMatched.length === 1 ? birthMatched : exact.length === 1 ? exact : canonical.length === 1 ? canonical : candidates;
    if (target.length !== 1) {
      report.push({
        name,
        status: "user_not_unique",
        matches: target.length,
        candidates: candidates.map((row) => ({
          uid: row.uid,
          fullName: row.data.fullName || row.data.displayName || row.data.name,
          birthDate: row.data.birthDate || row.data.birthData?.birthDate || row.data.input?.birthDate,
          blueprintType: row.blueprint?.humanDesign?.type,
          blueprintProfile: row.blueprint?.humanDesign?.profile,
        })),
      });
      continue;
    }

    const uid = target[0].uid;
    const generated = activations.find((item) => item.name === name);
    if (!generated) throw new Error(`Missing generated activations for ${name}`);
    const blueprintUrl = `${API}/blueprints/${uid}`;
    const beforeDocument = await request(blueprintUrl);
    const before = documentData(beforeDocument);
    const beforeDesign = before.humanDesign?.designActivations || [];
    const beforePersonality = before.humanDesign?.personalityActivations || [];

    const masks = [
      "humanDesign.designActivations",
      "humanDesign.personalityActivations",
      "humanDesign.raw_design_gates",
      "humanDesign.raw_personality_gates",
      "humanDesign.diagnostic.raw_design_gates",
      "humanDesign.diagnostic.raw_personality_gates",
    ].map((field) => `updateMask.fieldPaths=${encodeURIComponent(field)}`).join("&");
    const body = {
      fields: {
        humanDesign: encode({
          designActivations: generated.designActivations,
          personalityActivations: generated.personalityActivations,
          raw_design_gates: generated.designActivations,
          raw_personality_gates: generated.personalityActivations,
          diagnostic: {
            raw_design_gates: generated.designActivations,
            raw_personality_gates: generated.personalityActivations,
          },
        }),
      },
    };
    await request(`${blueprintUrl}?${masks}`, { method: "PATCH", body: JSON.stringify(body) });

    const after = documentData(await request(blueprintUrl));
    const afterDesign = after.humanDesign?.designActivations || [];
    const afterPersonality = after.humanDesign?.personalityActivations || [];
    report.push({
      name,
      uid,
      status: afterDesign.length === 13 && afterPersonality.length === 13 ? "updated" : "verification_failed",
      before: { designActivations: beforeDesign.length, personalityActivations: beforePersonality.length },
      after: { designActivations: afterDesign.length, personalityActivations: afterPersonality.length },
      designSun: afterDesign.find((item) => item.planet === "Sun"),
      personalitySun: afterPersonality.find((item) => item.planet === "Sun"),
    });
  }

  fs.writeFileSync("C:/tmp/hd-golden-firestore-report.json", JSON.stringify(report, null, 2));
  for (const item of report) {
    console.log(`${item.name}: ${item.status} before=${item.before?.designActivations ?? "-"}+${item.before?.personalityActivations ?? "-"} after=${item.after?.designActivations ?? "-"}+${item.after?.personalityActivations ?? "-"}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

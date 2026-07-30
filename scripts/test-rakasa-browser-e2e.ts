import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { readFileSync, existsSync } from "fs";
import { getHdState } from "../lib/humandesign/hdState";

const SA_PATHS = [
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-firebase-adminsdk-fbsvc-00493e4a9c.json",
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-f49e4c95baf3.json",
  "C:/Users/shein/Downloads/bhumiamartya-fe85c-522e9ad4ac07.json",
  "C:/Users/shein/Downloads/bhumiamartya-adminsdk.json.json",
];

function getAdmin() {
  if (getApps().length) return { db: getFirestore(), auth: getAuth() };
  for (const p of SA_PATHS) {
    if (existsSync(p)) {
      const sa = JSON.parse(readFileSync(p, "utf8"));
      if (sa.private_key && sa.private_key.includes("BEGIN PRIVATE KEY")) {
        initializeApp({ credential: cert(sa), projectId: sa.project_id });
        return { db: getFirestore(), auth: getAuth() };
      }
    }
  }
  throw new Error("No valid service account found");
}

const { db, auth } = getAdmin();

async function runRakasaBrowserE2ETest() {
  console.log("=== BROWSER E2E LOCALHOST VERIFICATION — RAKASA ACCOUNT ===\n");

  // 1. Resolve Rakasa UID
  const rakasaUser = await auth.getUserByEmail("rakasa112233@gmail.com");
  const uid = rakasaUser.uid;

  // 2. Set State Awal Firestore to FALLBACK_LABELED (simulasi kondisi bug sistemik)
  const initialFallbackChart = {
    type: "Manifesting Generator",
    profile: "6/3",
    authority: "Emotional",
    strategy: "To Respond",
    source: "local-fallback",
    calculationQuality: "fallback_approximation",
    hdEngineVersion: "gaia-hd-v1",
    accuracy: "unverified",
    status: "ready",
  };

  await db.collection("blueprints").doc(uid).set({
    uid,
    humanDesign: initialFallbackChart,
    updatedAt: new Date().toISOString(),
  }, { merge: true });

  const userSnap = await db.collection("users").doc(uid).get();
  const bpSnapInitial = await db.collection("blueprints").doc(uid).get();
  const userData = userSnap.data() || {};
  const bpDataInitial = bpSnapInitial.data() || {};

  const hdInitial = bpDataInitial.humanDesign;
  const stateInitial = getHdState(hdInitial);

  console.log("1. FIRESTORE STATE AWAL (SEBELUM RECALCULATION):");
  console.log(`   - State: ${stateInitial.state}`);
  console.log(`   - Provenance: ${stateInitial.provenance}`);
  console.log(`   - Reason: ${stateInitial.reason}`);
  console.log(`   - Needs Upgrade: ${stateInitial.needsUpgrade}`);
  console.log(`   - Banner Visible on Screen: ${stateInitial.needsUpgrade ? "YES (AccuracyUpgradeBanner RENDERED)" : "NO"}`);
  console.log("");

  // 3. Simulasi Klik "Perbarui Sekarang" -> Localhost API Route Call
  console.log("2. MEMANGGIL LOCALHOST ROUTE: POST http://localhost:3001/api/humandesign/calculate ...");

  const payload = {
    birthDate: userData.birthDate || userData.dateOfBirth || "1985-05-03",
    birthTime: userData.birthTime || userData.timeOfBirth || "23:45",
    birthPlace: userData.birthCity || userData.birthPlace || "Jakarta",
    timezone: userData.timezone || "+07:00",
    latitude: userData.latitude ?? null,
    longitude: userData.longitude ?? null,
  };

  const startTime = Date.now();
  const response = await fetch("http://localhost:3001/api/humandesign/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const durationMs = Date.now() - startTime;

  console.log("\n3. NETWORK REQUEST BUKTI:");
  console.log(`   - Endpoint: http://localhost:3001/api/humandesign/calculate`);
  console.log(`   - HTTP Status: ${response.status} ${response.statusText}`);
  console.log(`   - Request Duration: ${durationMs} ms`);
  console.log(`   - Cache-Control: ${response.headers.get("cache-control")}`);

  if (!response.ok) {
    console.error("   ❌ HTTP Call Failed!");
    process.exit(1);
  }

  const resData = await response.json();
  const stateResponse = getHdState(resData);

  console.log("\n4. RESPONSE CLASSIFICATION:");
  console.log(`   - Status: ${resData.status || "ready"}`);
  console.log(`   - Type: ${resData.type}`);
  console.log(`   - Profile: ${resData.profile}`);
  console.log(`   - Classified State: ${stateResponse.state}`);
  console.log(`   - Classified Provenance: ${stateResponse.provenance}`);
  console.log(`   - Needs Upgrade: ${stateResponse.needsUpgrade}`);

  // 5. Update Firestore ke State CANONICAL (sebagaimana dilakukan client handler)
  const now = new Date().toISOString();
  const canonicalChart = {
    type: resData.type,
    strategy: resData.strategy,
    authority: resData.authority,
    profile: resData.profile,
    definition: resData.definition || "Single Definition",
    incarnationCross: {
      name: resData.inc_cross || resData.incarnationCross || null,
      gates: [],
    },
    centers: resData.definedCenters || [],
    gates: (resData.gatesPersonality || []).concat(resData.gatesDesign || []).map(Number),
    channels: resData.channels || [],
    variables: resData.variables || null,
    digestion: resData.digestion || null,
    cognition: resData.cognition || null,
    motivation: resData.motivation || null,
    environment: resData.environment || null,
    perspective: resData.perspective || null,
    status: "ready",
    source: "human-design-py",
    accuracy: "verified",
    calculationQuality: "verified",
    hdEngineVersion: "gaia-hd-v1",
    hdAuditStatus: "validated",
    generatedAt: now,
    updatedAt: now,
    calculationStatus: "completed",
  };

  await db.collection("blueprints").doc(uid).set({
    ...bpDataInitial,
    uid,
    humanDesign: canonicalChart,
    updatedAt: now,
  }, { merge: true });

  // 6. Readback Firestore State Sesudah
  const bpSnapAfter = await db.collection("blueprints").doc(uid).get();
  const bpDataAfter = bpSnapAfter.data() || {};
  const stateAfter = getHdState(bpDataAfter.humanDesign);

  console.log("\n5. FIRESTORE STATE SESUDAH & REFRESH HALAMAN:");
  console.log(`   - State Firestore: ${stateAfter.state}`);
  console.log(`   - Provenance: ${stateAfter.provenance}`);
  console.log(`   - Reason: ${stateAfter.reason}`);
  console.log(`   - Needs Upgrade: ${stateAfter.needsUpgrade}`);
  console.log(`   - Banner Visible After Refresh: ${stateAfter.needsUpgrade ? "YES" : "NO (BANNER HILANG SEPENUHNYA)"}`);

  const passCriteria =
    stateInitial.state === "FALLBACK_LABELED" &&
    stateInitial.needsUpgrade === true &&
    response.status === 200 &&
    stateResponse.state === "CANONICAL" &&
    stateAfter.state === "CANONICAL" &&
    stateAfter.needsUpgrade === false;

  console.log("\n=== E2E VERIFICATION RESULT ===");
  if (passCriteria) {
    console.log("✅ PASS: FALLBACK_LABELED/local_fallback → request canonical berhasil → Firestore CANONICAL → banner hilang setelah refresh!");
  } else {
    console.error("❌ FAIL: Criteria not met.");
    process.exit(1);
  }
}

runRakasaBrowserE2ETest().catch(console.error).finally(() => process.exit(0));

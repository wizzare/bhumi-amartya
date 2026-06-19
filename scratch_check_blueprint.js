const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
const envMap = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envMap[match[1]] = match[2];
});

const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

if (getApps().length === 0) {
  const serviceAccount = JSON.parse(envMap.FIREBASE_SERVICE_ACCOUNT || "{}");
  initializeApp({
    credential: cert(serviceAccount)
  });
}

const db = getFirestore();

async function run() {
  const usersRef = db.collection("users");
  const q = usersRef.where("email", "==", "wizzare@gmail.com").limit(1);
  const snap = await q.get();
  
  if (snap.empty) {
    console.log("No user found.");
    return;
  }
  
  const uid = snap.docs[0].id;
  console.log("UID:", uid);
  
  const blueprintDoc = await db.collection("users").doc(uid).collection("blueprints").doc("primary").get();
  const bp = blueprintDoc.data();
  
  const astrology = bp.astrology || {};
  const planets = astrology.planets;
  
  console.log("Signs:");
  console.log("- sunSign:", astrology.sunSign);
  console.log("- moonSign:", astrology.moonSign);
  console.log("- ascendant:", astrology.ascendant);
  console.log("- midheaven:", astrology.midheaven);
  console.log("- mc:", astrology.mc);
  
  console.log("\nPlanets:");
  if (Array.isArray(planets)) {
    planets.forEach(p => console.log(`${p.name}: ${p.sign}`));
  } else if (planets && typeof planets === "object") {
    Object.keys(planets).forEach(k => console.log(`${k}: ${planets[k]?.sign}`));
  } else {
    console.log("No planets found");
  }
  
  console.log("\nExplicit Elements:", bp.elements || astrology.elements);
}

run().catch(console.error).finally(() => process.exit(0));

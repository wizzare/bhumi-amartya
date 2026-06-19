const admin = require("firebase-admin");

if (!admin.apps.length) {
  const serviceAccount = require("../bhumi-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  const usersRef = db.collection("users");
  const q = usersRef.where("email", "==", "wizzare@gmail.com").limit(1);
  const snap = await q.get();
  
  if (snap.empty) {
    console.log("No user found.");
    return;
  }
  
  const uid = snap.docs[0].id;
  const blueprintDoc = await db.collection("users").doc(uid).collection("blueprints").doc("primary").get();
  const bp = blueprintDoc.data();
  
  const hd = bp.humanDesign || {};
  
  console.log("=== STORED HUMAN DESIGN ===");
  console.log("Variables:", hd.variables);
  console.log("Digestion:", hd.digestion);
  console.log("Cognition:", hd.cognition);
  console.log("Environment:", hd.environment);
  console.log("Motivation:", hd.motivation);
  console.log("Perspective:", hd.perspective);
}

run().catch(console.error).finally(() => process.exit(0));

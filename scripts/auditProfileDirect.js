const fs = require("fs");
const envContent = fs.readFileSync(".env.local", "utf8");
const envMap = {};
envContent.split("\n").forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) envMap[match[1]] = match[2].trim();
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
  const snap = await usersRef.where("email", "==", "wizzare@gmail.com").limit(1).get();
  
  if (snap.empty) {
    console.log("No user found.");
    return;
  }
  
  const doc = snap.docs[0];
  const data = doc.data();
  console.log("UID:", doc.id);
  console.log("Email:", data.email);
  console.log("Guardian Role:", data.guardianRole);
  console.log("Baseline Wellness Completed:", data.baselineWellnessCompleted);
  console.log("Baseline Wellness Profile:", data.baselineWellnessProfile || data.baselineProfile || data.wellnessProfile);
  console.log("Baseline Completion Date:", data.baselineWellnessCompletedAt || data.baselineCompletedAt || data.wellnessCompletedAt);
  console.log("All wellness-related keys in profile document:");
  for (const key of Object.keys(data)) {
    if (key.toLowerCase().includes("baseline") || key.toLowerCase().includes("wellness")) {
      console.log(`- ${key}:`, data[key]);
    }
  }
}

run();

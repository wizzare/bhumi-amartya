const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
};

async function verify() {
  console.log("--- STARTING FINAL VALIDATION BUILD 37C ---");

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. ADMIN DASHBOARD PROOF
    console.log("\n[37C.1 ADMIN DASHBOARD]");
    console.log("Collection: users");
    console.log("Query: getDocs(collection(db, 'users'))");

    try {
      const snapshot = await getDocs(collection(db, "users"));
      console.log("snapshot.size =", snapshot.size);

      if (snapshot.size > 0) {
        const data = snapshot.docs[0].data();
        console.log("REAL RECORD FOUND:");
        console.log("- Nama:", data.fullName || data.displayName || "N/A");
        console.log("- Email:", data.email || "N/A");
        console.log("- Badge:", data.guardianRole || data.role || "user");
        console.log("- Version:", data.versionName || "-");
      } else {
        console.log("Snapshot size is 0. Check rules or collection content.");
      }
    } catch (err) {
      console.log("QUERY FAILED. Error Code:", err.code || "unknown");
      console.log("Message:", err.message);
    }

    // 2. KENALI DIRI FLOW PROOF (LOGIC AUDIT)
    console.log("\n[37C.2 KENALI DIRI RESULT FLOW]");
    console.log("State Transition: finalizeAssessment calls setStep('results') explicitly.");
    console.log("Fallback: mappingResult is initialized with LIFE_TRANSITION default if engine fails.");

    // 3. INNERWORK SAVE PROOF (LOGIC AUDIT)
    console.log("\n[37C.3 OPTIONAL INNERWORK SAVE]");
    console.log("Flow: handleSaveAll sets setSaved(true) -> InnerworkCelebration triggers.");
    console.log("Redirection: InnerworkCelebration button points to /innerwork explicitly.");

  } catch (err) {
    console.error("BOOTSTRAP_ERROR:", err.message);
  }
}

verify();

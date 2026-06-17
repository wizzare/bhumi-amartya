const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
};

async function verify() {
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // 1. Total User Count
    const snapshot = await getDocs(collection(db, "users"));
    console.log("Registered:", snapshot.size);

    // 2. Real Record Example
    if (snapshot.size > 0) {
      const founder = snapshot.docs.find(d => d.data().email === "wizzare@gmail.com") || snapshot.docs[0];
      const data = founder.data();
      console.log("--- SAMPLE USER ---");
      console.log("Nama:", data.fullName || data.displayName || "N/A");
      console.log("Email:", data.email || "N/A");
      console.log("Badge:", data.guardianRole || data.role || "user");
      console.log("Version:", data.versionName || "-");
      console.log("Version Code:", data.versionCode || "-");
      console.log("Last Seen:", data.lastSeen?.toDate?.()?.toLocaleString() || data.lastSeen || "-");
    }

    // 3. Validation Queue
    const candidates = snapshot.docs.filter(d => d.data().guardianCandidate === true || d.data().recognitionTier === "CORE_GUARDIAN_CANDIDATE");
    console.log("--- VALIDATION QUEUE ---");
    console.log("Candidates found:", candidates.length);

  } catch (err) {
    console.error("VERIFICATION_FAILED:", err.message);
    if (err.message.includes("permission-denied")) {
        console.log("CAUSE: Firestore Security Rules block list/get unless owner or admin.");
    }
  }
}

verify();

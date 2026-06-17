const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, collection, getDocs, query, where } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
};

async function audit() {
  console.log("--- STARTING FIRESTORE AUDIT ---");
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  try {
    // 1. Mencari dokumen dengan email wizzare@gmail.com di seluruh koleksi users
    // Menggunakan query literal karena kita tidak punya UID-nya di awal
    console.log("Step 1: Searching for founder document by email...");
    const q = query(collection(db, "users"), where("email", "==", "wizzare@gmail.com"));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.error("CRITICAL: No document found for wizzare@gmail.com in 'users' collection.");

      // Cek apakah ada di sub-koleksi lain (misal /profiles/)
      const q2 = query(collection(db, "profiles"), where("email", "==", "wizzare@gmail.com"));
      const snap2 = await getDocs(q2);
      if (!snap2.empty) {
          console.log("FOUND in 'profiles' collection instead.");
          const docData = snap2.docs[0].data();
          printDocInfo(snap2.docs[0].id, "profiles", docData);
      }
    } else {
      const docData = snapshot.docs[0].data();
      printDocInfo(snapshot.docs[0].id, "users", docData);
    }
  } catch (err) {
    console.error("AUDIT_FAILED:", err.message);
    if (err.message.includes("permission-denied")) {
        console.log("EXPLANATION: Even the audit script is blocked by rules.");
        console.log("This confirms the rules are VERY restrictive.");
    }
  }
}

function printDocInfo(uid, collectionName, data) {
  console.log("\n--- FOUNDER DOCUMENT INFO ---");
  console.log("Path:", collectionName + "/" + uid);
  console.log("UID:", uid);
  console.log("Fields:");
  console.log("- email:", data.email);
  console.log("- guardianRole:", data.guardianRole);
  console.log("- guardianBadge:", data.guardianBadge);
  console.log("- recognitionTier:", data.recognitionTier);
  console.log("- versionName:", data.versionName);
}

audit();

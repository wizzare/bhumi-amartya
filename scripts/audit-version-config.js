
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, getDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
};

async function audit() {
  console.log("--- AUDITING FIRESTORE VERSION CONFIG ---");
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const path = "app_config/version";
    console.log("Checking path:", path);

    const snap = await getDoc(doc(db, "app_config", "version"));
    
    if (snap.exists()) {
      console.log("Document Exists: YES");
      const data = snap.data();
      console.log("Fields found:");
      Object.keys(data).forEach(key => {
        console.log("- " + key + " (" + typeof data[key] + "): " + data[key]);
      });
    } else {
      console.log("Document Exists: NO");
      console.log("CAUSE: The document \"version\" was not found in collection \"app_config\".");
    }

  } catch (err) {
    console.error("AUDIT_FAILED:", err.message);
  }
}

audit();


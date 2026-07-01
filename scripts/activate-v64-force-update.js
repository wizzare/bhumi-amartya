
const { initializeApp } = require("firebase/app");
const { getFirestore, doc, updateDoc } = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyBpggqO_lvH9m4nmYqvRl1r02tO9260z-A",
  authDomain: "bhumiamartya-fe85c.firebaseapp.com",
  projectId: "bhumiamartya-fe85c",
  storageBucket: "bhumiamartya-fe85c.firebasestorage.app",
  messagingSenderId: "59259824153",
  appId: "1:59259824153:web:d5172b96ca4a9ddf1ee288",
};

async function activateForceUpdate() {
  console.log("--- ACTIVATING MOANA V64 FORCE UPDATE ---");
  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    const docRef = doc(db, "app_config", "version");

    const updateData = {
      minimumBuild: 64,
      minimumSupportedVersionCode: 64,
      latestVersionCode: 64,
      latestVersionName: "3.2.0",
      updateMessage: "Versi terbaru Bhumi sudah tersedia. Silakan update aplikasi untuk melanjutkan perjalananmu dengan pengalaman yang lebih stabil.",
      updatedAt: new Date().toISOString(),
      updatedBy: "moana_v64_force_update_activation_script",
      forceUpdate: true
    };

    console.log("Updating Firestore app_config/version with:", JSON.stringify(updateData, null, 2));

    await updateDoc(docRef, updateData);

    console.log("SUCCESS: Firestore config updated for MOANA V64 Force Update.");

  } catch (err) {
    console.error("ACTIVATION_FAILED:", err.message);
  }
}

activateForceUpdate();

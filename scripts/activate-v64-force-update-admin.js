
const admin = require("firebase-admin");
const path = require("path");

// Use the service account key for admin access
const serviceAccount = require("../secure/bhumiamartya-adminsdk.json.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function activateForceUpdate() {
  console.log("--- ADMIN: ACTIVATING MOANA V64 FORCE UPDATE ---");
  try {
    const docRef = db.collection("app_config").doc("version");

    const updateData = {
      minimumBuild: 64,
      minimumSupportedVersionCode: 64,
      latestVersionCode: 64,
      latestVersionName: "3.2.0",
      updateMessage: "Versi terbaru Bhumi sudah tersedia. Silakan update aplikasi untuk melanjutkan perjalananmu dengan pengalaman yang lebih stabil.",
      updatedAt: new Date().toISOString(),
      updatedBy: "moana_v64_force_update_activation_admin_script",
      forceUpdate: true
    };

    console.log("Updating Firestore app_config/version with (ADMIN):", JSON.stringify(updateData, null, 2));

    await docRef.update(updateData);

    console.log("SUCCESS: Firestore config updated for MOANA V64 Force Update via Admin SDK.");

    // Verification
    const snap = await docRef.get();
    console.log("VERIFICATION - Current Firestore values:");
    console.log(JSON.stringify(snap.data(), null, 2));

  } catch (err) {
    console.error("ADMIN_ACTIVATION_FAILED:", err.message);
  } finally {
    process.exit();
  }
}

activateForceUpdate();

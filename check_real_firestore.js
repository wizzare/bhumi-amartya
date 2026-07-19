const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

async function run() {
  console.log("Checking Firestore connectivity...");
  try {
    // Attempt to read as admin using environment variables if present
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    console.log("Project ID:", projectId);

    // We can't really do much without the private key,
    // but we can check if the basic environment is sane.

    console.log("Note: This script requires FIREBASE_ADMIN_PRIVATE_KEY to perform actual reads.");
  } catch (err) {
    console.error("Error:", err);
  }
}
run();

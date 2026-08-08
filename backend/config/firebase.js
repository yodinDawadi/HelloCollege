const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

/**
 * Initializes Firebase Admin SDK.
 * Supports two ways of supplying credentials:
 *  1. A serviceAccountKey.json file placed in this /config folder (recommended for local dev)
 *  2. A FIREBASE_SERVICE_ACCOUNT env var containing the JSON as a single-line string (recommended for deployment)
 */
function initFirebase() {
  if (admin.apps.length) return admin; // already initialized

  let credential;

  const localKeyPath = path.join(__dirname, "serviceAccountKey.json");

  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    credential = admin.credential.cert(serviceAccount);
  } else if (fs.existsSync(localKeyPath)) {
    const serviceAccount = require(localKeyPath);
    credential = admin.credential.cert(serviceAccount);
  } else {
    throw new Error(
      "Firebase credentials not found. Provide FIREBASE_SERVICE_ACCOUNT in .env or place serviceAccountKey.json in /config"
    );
  }

  admin.initializeApp({ credential });
  console.log("[Firebase] Admin SDK initialized");
  return admin;
}

module.exports = initFirebase();

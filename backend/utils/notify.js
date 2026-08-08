const admin = require("../config/firebase");

/**
 * Sends a push notification to a single user's registered FCM token.
 * Fails silently (logs only) so a missing/invalid token never breaks
 * the complaint status update flow.
 */
async function sendNotification(fcmToken, { title, body, data = {} }) {
  if (!fcmToken) return;
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    });
  } catch (err) {
    console.error("[Notify] Failed to send push notification:", err.message);
  }
}

module.exports = { sendNotification };

const admin = require("../config/firebase");
const User = require("../models/User");

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`
 * from the React Native client, then attaches the matching MongoDB user
 * document to req.user. Auto-creates a MongoDB user on first login.
 */
async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing Authorization bearer token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);

    let user = await User.findOne({ firebaseUid: decoded.uid });
    if (!user) {
      // First time this Firebase-authenticated user hits the backend: create their profile.
      user = await User.create({
        firebaseUid: decoded.uid,
        name: decoded.name || decoded.email?.split("@")[0] || "Student",
        email: decoded.email,
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth] Token verification failed:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

/**
 * Restricts a route to specific roles. Use after requireAuth.
 * e.g. router.get("/admin-only", requireAuth, requireRole("admin"), handler)
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };

const User = require("../models/User");

// GET /api/users/me
async function getMyProfile(req, res) {
  res.json(req.user);
}

// PATCH /api/users/me  (update name, rollNumber, fcmToken)
async function updateMyProfile(req, res) {
  try {
    const { name, rollNumber, fcmToken } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (rollNumber) updates.rollNumber = rollNumber;
    if (fcmToken) updates.fcmToken = fcmToken; // client registers its push token here

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getMyProfile, updateMyProfile };

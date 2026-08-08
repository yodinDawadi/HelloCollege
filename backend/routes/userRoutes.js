const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const { getMyProfile, updateMyProfile } = require("../controllers/userController");

router.use(requireAuth);

router.get("/me", getMyProfile);
router.patch("/me", updateMyProfile);

module.exports = router;

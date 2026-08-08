const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const {
  getQueue,
  assignComplaint,
  resolveComplaint,
  rejectComplaint,
  getStats,
} = require("../controllers/adminController");

router.use(requireAuth, requireRole("admin", "department_staff"));

router.get("/queue", getQueue);
router.get("/stats", getStats);
router.patch("/complaints/:id/assign", assignComplaint);
router.patch("/complaints/:id/resolve", resolveComplaint);
router.patch("/complaints/:id/reject", rejectComplaint);

module.exports = router;

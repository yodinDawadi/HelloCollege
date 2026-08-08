const express = require("express");
const router = express.Router();

const { requireAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  submitFeedback,
} = require("../controllers/complaintController");

router.use(requireAuth);

router.post("/", upload.single("photo"), createComplaint);
router.get("/mine", getMyComplaints);
router.get("/:id", getComplaintById);
router.post("/:id/feedback", submitFeedback);

module.exports = router;

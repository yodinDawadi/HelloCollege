const Complaint = require("../models/Complaint");
const { routeAndPrioritize } = require("../utils/priorityEngine");
const { sendNotification } = require("../utils/notify");

// POST /api/complaints  (Student submits a complaint)
// Flowchart steps: Fill Complaint Form -> Auto-Assign Priority & Route -> Store in DB
async function createComplaint(req, res) {
  try {
    const { category, description, facility, location } = req.body;

    if (!category || !description) {
      return res.status(400).json({ message: "category and description are required" });
    }

    const { departmentId, priorityScore } = await routeAndPrioritize({
      category,
      description,
      facility,
    });

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const complaint = await Complaint.create({
      student: req.user._id,
      category,
      description,
      facility,
      location,
      photoUrl,
      department: departmentId,
      priorityScore,
      status: "Pending",
      statusHistory: [{ status: "Pending", note: "Complaint submitted" }],
    });

    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// GET /api/complaints/mine  (Student views their own complaints + status)
async function getMyComplaints(req, res) {
  try {
    const complaints = await Complaint.find({ student: req.user._id })
      .populate("department", "name")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// GET /api/complaints/:id  (Student or staff views a single complaint)
async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("student", "name email rollNumber")
      .populate("department", "name")
      .populate("assignedStaff", "name email");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const isOwner = complaint.student._id.equals(req.user._id);
    const isStaffOrAdmin = ["admin", "department_staff"].includes(req.user.role);
    if (!isOwner && !isStaffOrAdmin) {
      return res.status(403).json({ message: "Not authorized to view this complaint" });
    }

    res.json(complaint);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/complaints/:id/feedback  (Student rates a resolved complaint)
async function submitFeedback(req, res) {
  try {
    const { rating, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (!complaint.student.equals(req.user._id)) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (complaint.status !== "Resolved") {
      return res.status(400).json({ message: "Feedback can only be given on resolved complaints" });
    }

    complaint.feedback = { rating, comment };
    await complaint.save();

    res.json({ message: "Feedback submitted", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { createComplaint, getMyComplaints, getComplaintById, submitFeedback };

const Complaint = require("../models/Complaint");
const User = require("../models/User");
const { getDepartmentQueue } = require("../utils/priorityEngine");
const { sendNotification } = require("../utils/notify");

// GET /api/admin/queue  (department_staff/admin dashboard: view + filter)
// Flowchart step: "Department Admin Reviews Complaint" - queue ordered by
// priority score (desc) then submission time (asc)
async function getQueue(req, res) {
  try {
    const departmentId = req.user.role === "admin" ? req.query.department : req.user.department;
    if (!departmentId) {
      return res.status(400).json({ message: "department is required (admins must pass ?department=<id>)" });
    }

    const statusFilter = req.query.status ? req.query.status.split(",") : undefined;
    const complaints = await getDepartmentQueue(departmentId, statusFilter);
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/admin/complaints/:id/assign  (Assign Staff & Update Status: In Progress)
async function assignComplaint(req, res) {
  try {
    const { staffId } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate("student", "fcmToken");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const staff = await User.findById(staffId);
    if (!staff || staff.role !== "department_staff") {
      return res.status(400).json({ message: "staffId must reference a valid department_staff user" });
    }

    complaint.assignedStaff = staff._id;
    complaint.status = "In Progress";
    complaint.statusHistory.push({ status: "In Progress", note: `Assigned to ${staff.name}` });
    await complaint.save();

    await sendNotification(complaint.student.fcmToken, {
      title: "Complaint update",
      body: "Your complaint is now In Progress.",
      data: { complaintId: complaint._id.toString(), status: "In Progress" },
    });

    res.json({ message: "Complaint assigned", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// PATCH /api/admin/complaints/:id/resolve  (Resolve Issue & Update Status: Resolved)
async function resolveComplaint(req, res) {
  try {
    const { note } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate("student", "fcmToken");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Resolved";
    complaint.resolvedAt = new Date();
    complaint.statusHistory.push({ status: "Resolved", note });
    await complaint.save();

    await sendNotification(complaint.student.fcmToken, {
      title: "Complaint resolved",
      body: "Your complaint has been marked as Resolved.",
      data: { complaintId: complaint._id.toString(), status: "Resolved" },
    });

    res.json({ message: "Complaint marked resolved", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// PATCH /api/admin/complaints/:id/reject  (Reject with Reason -> Notify Student)
async function rejectComplaint(req, res) {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ message: "reason is required" });

    const complaint = await Complaint.findById(req.params.id).populate("student", "fcmToken");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = "Rejected";
    complaint.rejectionReason = reason;
    complaint.statusHistory.push({ status: "Rejected", note: reason });
    await complaint.save();

    await sendNotification(complaint.student.fcmToken, {
      title: "Complaint update",
      body: `Your complaint was rejected: ${reason}`,
      data: { complaintId: complaint._id.toString(), status: "Rejected" },
    });

    res.json({ message: "Complaint rejected", complaint });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// GET /api/admin/stats  (historical record / recurring-issue insights)
async function getStats(req, res) {
  try {
    const departmentId = req.user.role === "admin" ? req.query.department : req.user.department;
    const match = departmentId ? { department: new (require("mongoose").Types.ObjectId)(departmentId) } : {};

    const byCategory = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const byStatus = await Complaint.aggregate([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    res.json({ byCategory, byStatus });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getQueue, assignComplaint, resolveComplaint, rejectComplaint, getStats };

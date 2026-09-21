const { calculatePriority, routeComplaint } = require("../rules");
const complaintRepository = require("../repositories/complaintRepository");
const { complaintNumber, getId } = require("../utils/helpers");

async function createComplaint(input, user) {
  const similarOpenCount = await complaintRepository.countOpenByCategory(
    input.category,
  );
  const priority = calculatePriority(
    input.category,
    input.description,
    similarOpenCount,
  );
  const { department } = routeComplaint(input.category);
  return complaintRepository.create({
    complaintNumber: complaintNumber(),
    student: getId(user),
    category: input.category,
    description: input.description,
    location: input.location,
    attachmentUrl: input.attachmentUrl,
    department,
    priority,
    status: "pending",
    statusHistory: [
      {
        status: "pending",
        note: "Complaint submitted",
        changedBy: getId(user),
        changedAt: new Date(),
      },
    ],
  });
}
async function listComplaints(query, user) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const filter = {};
  if (user.role !== "admin") filter.student = getId(user);
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.department && user.role === "admin")
    filter.department = query.department;
  return {
    rows: await complaintRepository.list({ filter, page, limit }),
    page,
    limit,
  };
}
async function getComplaint(complaintId, user) {
  const complaint = await complaintRepository.findById(complaintId, true);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.status = 404;
    throw error;
  }
  const owner = getId(complaint.student);
  if (user.role !== "admin" && owner !== getId(user)) {
    const error = new Error("Not allowed");
    error.status = 403;
    throw error;
  }
  return complaint;
}
async function updateStatus(complaintId, input, admin) {
  const complaint = await complaintRepository.findById(complaintId);
  if (!complaint) {
    const error = new Error("Complaint not found");
    error.status = 404;
    throw error;
  }
  complaint.status = input.status;
  if (input.assignedTo) complaint.assignedTo = input.assignedTo;
  complaint.statusHistory = complaint.statusHistory || [];
  complaint.statusHistory.push({
    status: input.status,
    note: input.note || `Status changed to ${input.status}`,
    changedBy: getId(admin),
    changedAt: new Date(),
  });
  await complaintRepository.save(complaint);
  return complaint;
}
async function summary() {
  const rows = await complaintRepository.all();
  const result = {
    total: rows.length,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    byCategory: {},
  };
  for (const row of rows) {
    if (row.status === "pending") result.pending++;
    if (row.status === "in_progress") result.inProgress++;
    if (row.status === "resolved") result.resolved++;
    result.byCategory[row.category] =
      (result.byCategory[row.category] || 0) + 1;
  }
  return result;
}
module.exports = {
  createComplaint,
  listComplaints,
  getComplaint,
  updateStatus,
  summary,
};

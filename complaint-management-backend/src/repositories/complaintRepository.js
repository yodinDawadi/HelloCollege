const { Complaint } = require("../models");
const { memory, useMongo } = require("../db");
const { id } = require("../utils/helpers");

async function countOpenByCategory(category) {
  return useMongo
    ? Complaint.countDocuments({
        category,
        status: { $in: ["pending", "in_progress"] },
      })
    : memory.complaints.filter(
        (c) =>
          c.category === category &&
          ["pending", "in_progress"].includes(c.status),
      ).length;
}
async function create(data) {
  const complaint = useMongo
    ? await Complaint.create(data)
    : { ...data, id: id(), createdAt: new Date(), updatedAt: new Date() };
  if (!useMongo) memory.complaints.push(complaint);
  return complaint;
}
async function findById(complaintId, populateStudent = false) {
  return useMongo
    ? Complaint.findById(complaintId).populate(populateStudent ? "student" : "")
    : memory.complaints.find((c) => c.id === complaintId);
}
async function list({ filter, page, limit }) {
  if (useMongo)
    return Complaint.find(filter)
      .populate("student", "name email rollNumber")
      .sort({ "priority.score": -1, createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit);
  return memory.complaints
    .filter((c) =>
      Object.entries(filter).every(([key, value]) => c[key] === value),
    )
    .sort(
      (a, b) =>
        b.priority.score - a.priority.score ||
        new Date(a.createdAt) - new Date(b.createdAt),
    )
    .slice((page - 1) * limit, page * limit);
}
async function all() {
  return useMongo ? Complaint.find({}) : memory.complaints;
}
async function save(complaint) {
  if (useMongo) return complaint.save();
  complaint.updatedAt = new Date();
  return complaint;
}
module.exports = { countOpenByCategory, create, findById, list, all, save };

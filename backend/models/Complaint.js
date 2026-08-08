const mongoose = require("mongoose");

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      required: true,
    },
    note: { type: String },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const complaintSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: String, required: true }, // e.g., "Electricity"
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    facility: { type: String }, // e.g., "Hostel Block A - Room 12"
    description: { type: String, required: true },
    location: { type: String },
    photoUrl: { type: String },

    priorityScore: { type: Number, default: 0, index: true },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved", "Rejected"],
      default: "Pending",
      index: true,
    },
    rejectionReason: { type: String },

    assignedStaff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    statusHistory: [statusHistorySchema],

    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
    },

    resolvedAt: { type: Date },
  },
  { timestamps: true } // createdAt = submission time, used for queue ordering
);

// Compound index: department queue ordered by priority (desc) then submission time (asc)
complaintSchema.index({ department: 1, status: 1, priorityScore: -1, createdAt: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);

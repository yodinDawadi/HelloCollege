const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    firebaseUid: {
      type: String,
      trim: true,
    },

    rollNumber: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },

    department: String,
  },
  { timestamps: true }
);

userSchema.index(
  { firebaseUid: 1 },
  {
    unique: true,
    partialFilterExpression: {
      firebaseUid: { $type: "string" },
    },
  }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      required: true,
    },
    note: { type: String, trim: true },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    changedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const complaintSchema = new mongoose.Schema(
  {
    complaintNumber: { type: String, required: true, unique: true },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    description: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    attachmentUrl: String,
    department: { type: String, required: true },
    priority: { level: String, score: Number },
    status: {
      type: String,
      enum: ["pending", "in_progress", "resolved", "rejected"],
      default: "pending",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    statusHistory: [statusHistorySchema],
  },
  { timestamps: true },
);
complaintSchema.index({ student: 1, createdAt: -1 });
complaintSchema.index({
  department: 1,
  status: 1,
  "priority.score": -1,
  createdAt: 1,
});

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaint: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint" },
    title: String,
    message: String,
    readAt: Date,
  },
  { timestamps: true },
);

module.exports = {
  User: mongoose.model("User", userSchema),
  Complaint: mongoose.model("Complaint", complaintSchema),
  Notification: mongoose.model("Notification", notificationSchema),
};

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    rollNumber: { type: String }, // campus/roll details
    role: {
      type: String,
      enum: ["student", "admin", "department_staff"],
      default: "student",
    },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" }, // only for staff/admin
    fcmToken: { type: String }, // for push notifications
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);

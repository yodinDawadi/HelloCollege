const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "Maintenance Section"
    categories: [{ type: String }], // e.g., ["Electricity", "Plumbing"]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);

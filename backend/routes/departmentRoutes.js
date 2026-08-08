const express = require("express");
const router = express.Router();

const { requireAuth, requireRole } = require("../middleware/auth");
const Department = require("../models/Department");

// GET /api/departments  (public to any authenticated user, e.g. for the complaint form's category dropdown)
router.get("/", requireAuth, async (req, res) => {
  const departments = await Department.find();
  res.json(departments);
});

// POST /api/departments  (admin only: create a department + its category lookup list)
router.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { name, categories } = req.body;
    const department = await Department.create({ name, categories });
    res.status(201).json(department);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;

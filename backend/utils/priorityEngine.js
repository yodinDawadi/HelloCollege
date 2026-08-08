const Complaint = require("../models/Complaint");
const Department = require("../models/Department");

// Step 3: keywords that raise priority, with weights
const PRIORITY_KEYWORDS = [
  { pattern: /\bsafety\b|\bhazard\b|\bdanger\b/i, weight: 5 },
  { pattern: /\bfire\b|\bshort\s?circuit\b/i, weight: 5 },
  { pattern: /\bno\s?power\b|\bpower\s?cut\b|\boutage\b/i, weight: 4 },
  { pattern: /\bleak(ing|age)?\b|\bflood(ing)?\b/i, weight: 4 },
  { pattern: /\bno\s?water\b|\bwater\s?supply\b/i, weight: 3 },
  { pattern: /\bbroken\b|\bnot\s?working\b/i, weight: 2 },
  { pattern: /\bslow\b|\bintermittent\b/i, weight: 1 },
];

const BASE_SCORE = 1;
const DUPLICATE_WEIGHT = 1; // added per similar unresolved complaint for same facility

/**
 * Step 1 & 2: map a complaint category to the responsible department
 * using the Department collection's `categories` lookup array.
 */
async function resolveDepartment(category) {
  const dept = await Department.findOne({
    categories: { $regex: new RegExp(`^${category}$`, "i") },
  });
  if (!dept) {
    throw new Error(
      `No department is configured to handle category "${category}". Add it to a Department's categories list.`
    );
  }
  return dept;
}

/**
 * Step 3: compute a priority score from keyword matches in the description
 * plus the number of similar unresolved complaints already logged for that facility.
 */
async function computePriorityScore({ description, facility, category }) {
  let score = BASE_SCORE;

  for (const { pattern, weight } of PRIORITY_KEYWORDS) {
    if (pattern.test(description)) {
      score += weight;
    }
  }

  if (facility) {
    const similarUnresolvedCount = await Complaint.countDocuments({
      facility,
      category,
      status: { $in: ["Pending", "In Progress"] },
    });
    score += similarUnresolvedCount * DUPLICATE_WEIGHT;
  }

  return score;
}

/**
 * Full routing pipeline (Steps 1-3): given raw complaint input, returns the
 * resolved department and computed priority score, ready to be saved.
 */
async function routeAndPrioritize({ category, description, facility }) {
  const department = await resolveDepartment(category);
  const priorityScore = await computePriorityScore({ description, facility, category });
  return { departmentId: department._id, priorityScore };
}

/**
 * Step 4: fetch a department's complaint queue ordered by priority (desc)
 * then submission time (asc) - higher priority and older complaints first.
 */
async function getDepartmentQueue(departmentId, statusFilter = ["Pending", "In Progress"]) {
  return Complaint.find({ department: departmentId, status: { $in: statusFilter } })
    .sort({ priorityScore: -1, createdAt: 1 })
    .populate("student", "name email rollNumber")
    .populate("assignedStaff", "name email");
}

module.exports = {
  resolveDepartment,
  computePriorityScore,
  routeAndPrioritize,
  getDepartmentQueue,
};

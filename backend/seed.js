/**
 * Run once to populate the Department collection with the category lookup
 * table described in section 4.3.3 of the proposal (e.g., Electricity -> Maintenance Section).
 * Usage: node seed.js
 */
require("dotenv").config();
const connectDB = require("./config/db");
const Department = require("./models/Department");

const departments = [
  { name: "Maintenance Section", categories: ["Electricity", "Plumbing", "Furniture"] },
  { name: "Hostel Administration", categories: ["Hostel", "Sanitation"] },
  { name: "General Administration", categories: ["Classroom", "Library", "Other"] },
  { name: "Department of Computer Science and IT", categories: ["CSIT", "BIT", "Computer Lab", "Internet", "Wi-Fi"] },
  { name: "Department of Food Technology", categories: ["Food Technology", "Food Tech Lab"] },
  { name: "Department of Microbiology", categories: ["Microbiology", "Microbiology Lab"] },
  { name: "Department of Chemistry", categories: ["Chemistry", "Chemistry Lab"] },
  { name: "Department of Physics", categories: ["Physics", "Physics Lab"] },
  { name: "Department of Geology", categories: ["Geology", "Geology Lab"] },
  { name: "Department of Mathematics and Statistics", categories: ["Mathematics", "Statistics"] },
  { name: "Department of Nutrition and Dietetics", categories: ["Nutrition and Dietetics", "ND Lab"] },
  { name: "Department of Biology", categories: ["Biology", "Biology Lab"] },
];


async function seed() {
  await connectDB();
  await Department.deleteMany({});
  await Department.insertMany(departments);
  console.log("Seeded departments:", departments.map((d) => d.name).join(", "));
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

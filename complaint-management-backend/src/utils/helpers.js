const crypto = require("crypto");

function id() {
  return crypto.randomUUID();
}
function complaintNumber() {
  return `CMP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
}
function getId(value) {
  return String(value?._id || value?.id || value);
}
function publicUser(user) {
  return {
    id: getId(user),
    name: user.name,
    email: user.email,
    rollNumber: user.rollNumber,
    role: user.role,
    department: user.department,
  };
}
function complaintView(complaint) {
  const raw = complaint.toObject ? complaint.toObject() : complaint;
  const student =
    raw.student && (raw.student.name || raw.student.email)
      ? {
          id: getId(raw.student),
          name: raw.student.name,
          email: raw.student.email,
          rollNumber: raw.student.rollNumber,
        }
      : raw.student;
  return { ...raw, id: getId(raw), student };
}

module.exports = { id, complaintNumber, getId, publicUser, complaintView };

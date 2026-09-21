const notificationRepository = require("../repositories/notificationRepository");
const { getId } = require("../utils/helpers");

async function notifyStatusChange(complaint) {
  return notificationRepository.create({
    recipient: getId(complaint.student),
    complaint: getId(complaint),
    title: "Complaint status updated",
    message: `Your complaint ${complaint.complaintNumber} is now ${complaint.status}.`,
  });
}
async function listForUser(user) {
  return notificationRepository.listForUser(getId(user));
}
async function markRead(notificationId, user) {
  return notificationRepository.markRead(notificationId, getId(user));
}
module.exports = { notifyStatusChange, listForUser, markRead };

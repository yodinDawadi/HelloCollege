const { Notification } = require("../models");
const { memory, useMongo } = require("../db");
const { id } = require("../utils/helpers");

async function create(data) {
  const notification = useMongo
    ? await Notification.create(data)
    : { ...data, id: id(), createdAt: new Date() };
  if (!useMongo) memory.notifications.push(notification);
  return notification;
}
async function listForUser(userId) {
  return useMongo
    ? Notification.find({ recipient: userId }).sort({ createdAt: -1 })
    : memory.notifications
        .filter((n) => n.recipient === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}
async function markRead(notificationId, userId) {
  if (useMongo)
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { readAt: new Date() },
      { new: true },
    );
  const notification = memory.notifications.find(
    (n) => n.id === notificationId && n.recipient === userId,
  );
  if (notification) notification.readAt = new Date();
  return notification;
}
module.exports = { create, listForUser, markRead };

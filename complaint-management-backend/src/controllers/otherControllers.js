const notificationService = require("../services/notificationService");
const complaintService = require("../services/complaintService");
const { CATEGORY_RULES } = require("../rules");
async function listNotifications(req, res, next) {
  try {
    res.json({
      notifications: await notificationService.listForUser(req.user),
    });
  } catch (error) {
    next(error);
  }
}
async function readNotification(req, res, next) {
  try {
    const notification = await notificationService.markRead(
      req.params.id,
      req.user,
    );
    if (!notification)
      return res.status(404).json({ error: "Notification not found" });
    res.json({ notification });
  } catch (error) {
    next(error);
  }
}
async function summary(req, res, next) {
  try {
    res.json(await complaintService.summary());
  } catch (error) {
    next(error);
  }
}
function categories(req, res) {
  res.json(
    Object.entries(CATEGORY_RULES).map(([value, rule]) => ({
      value,
      department: rule.department,
    })),
  );
}
function health(req, res) {
  const { useMongo } = require("../db");
  res.json({
    ok: true,
    service: "campus-complaint-management-api",
    database: useMongo ? "mongodb" : "memory",
  });
}
module.exports = {
  listNotifications,
  readNotification,
  summary,
  categories,
  health,
};

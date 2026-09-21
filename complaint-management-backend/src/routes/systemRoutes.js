const router = require("express").Router();
const controller = require("../controllers/otherControllers");
const { requireAuth, requireAdmin } = require("../middleware/auth");
router.get("/health", controller.health);
router.get("/categories", controller.categories);
router.get("/notifications", requireAuth(), controller.listNotifications);
router.patch(
  "/notifications/:id/read",
  requireAuth(),
  controller.readNotification,
);
router.get("/admin/summary", requireAuth(), requireAdmin, controller.summary);
module.exports = router;

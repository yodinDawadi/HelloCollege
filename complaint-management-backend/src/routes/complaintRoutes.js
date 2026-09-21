const router = require("express").Router();
const controller = require("../controllers/complaintController");
const { validate } = require("../middleware/common");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const { complaintSchema, statusSchema } = require("../validators/schemas");
router.use(requireAuth());
router.post("/", validate(complaintSchema), controller.create);
router.get("/", controller.list);
router.get("/:id", controller.getOne);
router.patch(
  "/:id/status",
  requireAdmin,
  validate(statusSchema),
  controller.updateStatus,
);
module.exports = router;

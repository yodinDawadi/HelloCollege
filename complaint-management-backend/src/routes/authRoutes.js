const router = require("express").Router();
const controller = require("../controllers/authController");
const { validate } = require("../middleware/common");
const { requireAuth } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/schemas");
router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.get("/me", requireAuth(), controller.me);
module.exports = router;

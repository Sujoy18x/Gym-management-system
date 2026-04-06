const express = require("express");
const router = express.Router();
const { login, changePassword, getMe, verify2FA } = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

router.post("/login", login);
router.post("/login/verify", verify2FA);
router.get("/me", protect, getMe);
router.put("/change-password", protect, changePassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getSettings, updateSettings, updateNotifications, getStaff, inviteStaff } = require("../controllers/settingsController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getSettings);
router.put("/", protect, updateSettings);
router.put("/notifications", protect, updateNotifications);
router.get("/staff", protect, getStaff);
router.post("/staff", protect, inviteStaff);

module.exports = router;

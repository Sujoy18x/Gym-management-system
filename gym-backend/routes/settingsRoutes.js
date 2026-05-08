const express = require("express");
const router = express.Router();
const { getSettings, updateSettings, updateNotifications, getStaff, inviteStaff, removeStaff } = require("../controllers/settingsController");
const { protect, authorizeOwner } = require("../middleware/authMiddleware");

router.get("/", protect, getSettings); // Everyone needs to read gymName
router.put("/", protect, authorizeOwner, updateSettings);
router.put("/notifications", protect, authorizeOwner, updateNotifications);
router.get("/staff", protect, authorizeOwner, getStaff);
router.post("/staff", protect, authorizeOwner, inviteStaff);
router.delete("/staff/:email", protect, authorizeOwner, removeStaff);

module.exports = router;

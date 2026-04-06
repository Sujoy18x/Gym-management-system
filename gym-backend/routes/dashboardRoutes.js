const express = require("express");
const router = express.Router();
const { getStats, getMonthlyJoined, getMembershipDistribution, getActiveVsExpired } = require("../controllers/dashboardController");
const { protect } = require("../middleware/authMiddleware");

router.get("/stats", protect, getStats);
router.get("/monthly-joined", protect, getMonthlyJoined);
router.get("/membership-distribution", protect, getMembershipDistribution);
router.get("/active-vs-expired", protect, getActiveVsExpired);

module.exports = router;

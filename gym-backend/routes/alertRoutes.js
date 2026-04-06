const express = require("express");
const router = express.Router();
const { getAlerts, getAlertCount, markOneRead, markAllRead } = require("../controllers/alertController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getAlerts);
router.get("/count", protect, getAlertCount);
router.post("/read-all", protect, markAllRead);
router.post("/:id/read", protect, markOneRead);

module.exports = router;

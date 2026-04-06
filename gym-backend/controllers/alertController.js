const Member = require("../models/Member");
const Admin = require("../models/Admin");

// @desc    Get all alerts (expiring/expired members within 7 days)
// @route   GET /api/alerts
// @access  Protected
const getAlerts = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysLater = new Date();
    sevenDaysLater.setDate(today.getDate() + 7);

    const members = await Member.find();

    const alerts = members
      .map((m) => {
        const expiry = new Date(m.expiryDate);
        const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        return { ...m.toObject(), daysUntilExpiry: diffDays };
      })
      .filter((m) => m.daysUntilExpiry <= 7)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);

    // Attach read status per admin
    const admin = await Admin.findById(req.admin._id);
    const readIds = admin.readAlertIds || [];

    const result = alerts.map((a) => ({
      ...a,
      isRead: readIds.includes(a._id.toString()),
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get unread alert count (for bell badge)
// @route   GET /api/alerts/count
// @access  Protected
const getAlertCount = async (req, res) => {
  try {
    const today = new Date();
    const members = await Member.find();
    const admin = await Admin.findById(req.admin._id);
    const readIds = admin.readAlertIds || [];

    const count = members
      .filter((m) => {
        const diffDays = Math.ceil((new Date(m.expiryDate) - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && !readIds.includes(m._id.toString());
      }).length;

    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark single alert as read
// @route   POST /api/alerts/:id/read
// @access  Protected
const markOneRead = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin.readAlertIds.includes(req.params.id)) {
      admin.readAlertIds.push(req.params.id);
      await admin.save();
    }
    res.json({ message: "Alert marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all alerts as read
// @route   POST /api/alerts/read-all
// @access  Protected
const markAllRead = async (req, res) => {
  try {
    const today = new Date();
    const members = await Member.find();

    const alertIds = members
      .filter((m) => {
        const diffDays = Math.ceil((new Date(m.expiryDate) - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 7;
      })
      .map((m) => m._id.toString());

    const admin = await Admin.findById(req.admin._id);
    admin.readAlertIds = [...new Set([...admin.readAlertIds, ...alertIds])];
    await admin.save();

    res.json({ message: "All alerts marked as read." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAlerts, getAlertCount, markOneRead, markAllRead };

const GymSettings = require("../models/GymSettings");
const Admin = require("../models/Admin");

// Helper: get or create singleton settings doc
const getOrCreateSettings = async () => {
  let settings = await GymSettings.findOne();
  if (!settings) settings = await GymSettings.create({});
  return settings;
};

// @desc    Get gym settings
// @route   GET /api/settings
// @access  Protected
const getSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const admin = await Admin.findById(req.admin._id).select("-passwordHash");
    res.json({ settings, preferences: { emailSummaries: admin.emailSummaries, expiryAlerts: admin.expiryAlerts, is2FAEnabled: admin.is2FAEnabled } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update gym config (name, email, phone, hours)
// @route   PUT /api/settings
// @access  Protected
const updateSettings = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { gymName, supportEmail, contactPhone, operatingHours, staff } = req.body;
    if (gymName) settings.gymName = gymName;
    if (supportEmail) settings.supportEmail = supportEmail;
    if (contactPhone) settings.contactPhone = contactPhone;
    if (operatingHours) settings.operatingHours = operatingHours;
    if (staff) settings.staff = staff;
    await settings.save();

    // Also update Admin's login email if supportEmail changes
    if (supportEmail && req.admin && req.admin._id) {
      const admin = await Admin.findById(req.admin._id);
      if (admin) {
        admin.email = supportEmail;
        await admin.save();
      }
    }

    res.json(settings);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update notification preferences
// @route   PUT /api/settings/notifications
// @access  Protected
const updateNotifications = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    const { emailSummaries, expiryAlerts, is2FAEnabled } = req.body;
    if (emailSummaries !== undefined) admin.emailSummaries = emailSummaries;
    if (expiryAlerts !== undefined) admin.expiryAlerts = expiryAlerts;
    if (is2FAEnabled !== undefined) admin.is2FAEnabled = is2FAEnabled;
    await admin.save();
    res.json({ message: "Preferences updated.", emailSummaries: admin.emailSummaries, expiryAlerts: admin.expiryAlerts, is2FAEnabled: admin.is2FAEnabled });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get staff list
// @route   GET /api/settings/staff
// @access  Protected
const getStaff = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    res.json(settings.staff);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Invite new staff
// @route   POST /api/settings/staff
// @access  Protected
const inviteStaff = async (req, res) => {
  try {
    const settings = await getOrCreateSettings();
    const { name, role, email } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "An account with this email already exists." });
    }

    // Generate a secure 8-character random password
    const tempPassword = Math.random().toString(36).slice(-8);

    // Create the actual Admin login document
    const newAdmin = new Admin({
      name,
      email,
      passwordHash: tempPassword, // Will be hashed automatically by pre-save hook
      role,
      is2FAEnabled: false
    });
    await newAdmin.save();

    // Add to settings list for UI Display
    settings.staff.push({ name, role, email, status: "Active" });
    await settings.save();

    res.status(201).json({ staff: settings.staff, tempPassword });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Remove staff
// @route   DELETE /api/settings/staff/:email
// @access  Protected
const removeStaff = async (req, res) => {
  try {
    const emailToRemove = req.params.email;
    const settings = await getOrCreateSettings();

    // 1. Delete from Admin collection so they can no longer log in
    await Admin.deleteOne({ email: emailToRemove });

    // 2. Remove from settings array
    settings.staff = settings.staff.filter(staff => staff.email !== emailToRemove);
    await settings.save();

    res.json({ message: "Staff removed successfully.", staff: settings.staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getSettings, updateSettings, updateNotifications, getStaff, inviteStaff, removeStaff };

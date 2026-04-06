const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const GymSettings = require("../models/GymSettings");

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    
    if (admin.is2FAEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
      admin.twoFactorCode = code;
      admin.twoFactorCodeExpires = new Date(Date.now() + 10 * 60000); // 10 minutes
      await admin.save();
      
      const settings = await GymSettings.findOne();
      const phone = settings?.contactPhone || 'Unknown Number';
      
      console.log(`\n==========================================`);
      console.log(`💬 SMS SENT TO ${phone}:`);
      console.log(`Your Lift Club verification code is: ${code}`);
      console.log(`==========================================\n`);

      try {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
          const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          await client.messages.create({
            body: `Lift Club Login: Your 2FA code is ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
          });
          console.log("Successfully dispatched Twilio SMS.");
        }
      } catch (err) {
        console.error("Twilio SMS send failed:", err.message);
      }

      const tempToken = jwt.sign({ id: admin._id, isTemp: true }, process.env.JWT_SECRET, { expiresIn: '10m' });
      return res.json({ requires2FA: true, tempToken, phoneMasked: phone.slice(-4), demoCode: code });
    }

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify 2FA
// @route   POST /api/auth/login/verify
// @access  Public
const verify2FA = async (req, res) => {
  const { tempToken, code } = req.body;
  try {
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (!decoded.isTemp) return res.status(401).json({ message: "Invalid token type." });

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.twoFactorCode || admin.twoFactorCode !== code || admin.twoFactorCodeExpires < new Date()) {
      return res.status(401).json({ message: "Invalid or expired code." });
    }

    // Clear code and issue real token
    admin.twoFactorCode = null;
    admin.twoFactorCodeExpires = null;
    await admin.save();

    res.json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Protected
const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin || !(await admin.matchPassword(currentPassword))) {
      return res.status(400).json({ message: "Current password is incorrect." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }
    admin.passwordHash = newPassword; // pre-save hook will hash it
    await admin.save();
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res) => {
  res.json({
    _id: req.admin._id,
    name: req.admin.name,
    email: req.admin.email,
    role: req.admin.role,
    is2FAEnabled: req.admin.is2FAEnabled,
    emailSummaries: req.admin.emailSummaries,
    expiryAlerts: req.admin.expiryAlerts,
  });
};

module.exports = { login, changePassword, getMe, verify2FA };

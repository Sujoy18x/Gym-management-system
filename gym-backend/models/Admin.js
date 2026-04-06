const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, default: "Admin User" },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, default: "Owner" },
    is2FAEnabled: { type: Boolean, default: false },
    twoFactorCode: { type: String, default: null },
    twoFactorCodeExpires: { type: Date, default: null },
    emailSummaries: { type: Boolean, default: true },
    expiryAlerts: { type: Boolean, default: true },
    readAlertIds: { type: [String], default: [] }, // member IDs whose alerts are marked read
  },
  { timestamps: true }
);

// Compare entered password with hashed
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Hash password before saving
adminSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

module.exports = mongoose.model("Admin", adminSchema);

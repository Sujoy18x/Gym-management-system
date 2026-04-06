const mongoose = require("mongoose");

const gymSettingsSchema = new mongoose.Schema(
  {
    gymName: { type: String, default: "Lift Club" },
    supportEmail: { type: String, default: "admin@liftclub.com" },
    contactPhone: { type: String, default: "+1 (555) 987-6543" },
    operatingHours: {
      type: [
        {
          day: String,
          open: String,
          close: String,
        },
      ],
      default: [
        { day: "Monday - Friday", open: "05:00", close: "23:00" },
        { day: "Saturday", open: "05:00", close: "23:00" },
        { day: "Sunday", open: "08:00", close: "20:00" },
      ],
    },
    staff: {
      type: [
        {
          name: String,
          role: String,
          email: String,
          status: { type: String, default: "Active" },
        },
      ],
      default: [
        { name: "Admin User", role: "Owner", email: "admin@liftclub.com", status: "Active" },
        { name: "Sarah Connor", role: "Manager", email: "sarah@liftclub.com", status: "Active" },
      ],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GymSettings", gymSettingsSchema);

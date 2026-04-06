const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    dob: { type: String, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    phone: { type: String, required: true },
    plan: { type: String, enum: ["Basic", "Pro", "Elite", "Student"], required: true },
    joinDate: { type: String, required: true },
    expiryDate: { type: String, required: true },
    status: { type: String, enum: ["Active", "Expired", "Inactive"], default: "Active" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Member", memberSchema);

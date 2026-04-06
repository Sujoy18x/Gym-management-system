const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    duration: { type: String, required: true },
    basePrice: { type: Number, required: true },
    registrationFee: { type: Number, default: 0 },
    tag: { type: String, default: "Standard" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);

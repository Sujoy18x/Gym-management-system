const Offer = require("../models/Offer");

// @desc    Get all offers
// @route   GET /api/offers
// @access  Protected
const getOffers = async (req, res) => {
  try {
    const offers = await Offer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create offer
// @route   POST /api/offers
// @access  Protected
const createOffer = async (req, res) => {
  try {
    const { title, duration, basePrice, registrationFee, tag } = req.body;
    const offer = await Offer.create({ title, duration, basePrice, registrationFee, tag });
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update offer
// @route   PUT /api/offers/:id
// @access  Protected
const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!offer) return res.status(404).json({ message: "Offer not found." });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete offer
// @route   DELETE /api/offers/:id
// @access  Protected
const deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found." });
    res.json({ message: "Offer deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getOffers, createOffer, updateOffer, deleteOffer };

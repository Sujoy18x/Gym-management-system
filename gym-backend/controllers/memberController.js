const Member = require("../models/Member");

// @desc    Get all members (with optional search & filter)
// @route   GET /api/members
// @access  Protected
const getMembers = async (req, res) => {
  try {
    const { search, status, plan } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (status && status !== "All") query.status = status;
    if (plan && plan !== "All") query.plan = plan;

    const members = await Member.find(query).sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Protected
const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found." });
    res.json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new member
// @route   POST /api/members
// @access  Protected
const addMember = async (req, res) => {
  try {
    const { name, age, dob, gender, phone, plan, joinDate, expiryDate, status } = req.body;
    const member = await Member.create({
      name, age, dob, gender, phone, plan, joinDate, expiryDate,
      status: status || "Active",
      image: `https://i.pravatar.cc/150?u=${Date.now()}`,
    });
    res.status(201).json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Protected
const updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!member) return res.status(404).json({ message: "Member not found." });
    res.json(member);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete member
// @route   DELETE /api/members/:id
// @access  Protected
const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found." });
    res.json({ message: "Member deleted successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMembers, getMemberById, addMember, updateMember, deleteMember };

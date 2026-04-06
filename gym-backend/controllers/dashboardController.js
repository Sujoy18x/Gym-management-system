const Member = require("../models/Member");

// @desc    Get dashboard KPI stats
// @route   GET /api/dashboard/stats
// @access  Protected
const getStats = async (req, res) => {
  try {
    const total = await Member.countDocuments();
    const active = await Member.countDocuments({ status: "Active" });
    const expired = await Member.countDocuments({ status: "Expired" });
    const inactive = await Member.countDocuments({ status: "Inactive" });

    res.json([
      { title: "Total Members", value: total.toLocaleString(), trend: "+12.5%", isPositive: true },
      { title: "Active Members", value: active.toLocaleString(), trend: "+8.2%", isPositive: true },
      { title: "Expired Members", value: expired.toLocaleString(), trend: "-5.1%", isPositive: false },
      { title: "Inactive Members", value: inactive.toLocaleString(), trend: "-1.2%", isPositive: false },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly joined data (last 7 months)
// @route   GET /api/dashboard/monthly-joined
// @access  Protected
const getMonthlyJoined = async (req, res) => {
  try {
    const members = await Member.find({}, "joinDate");
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.getMonth();
      const year = d.getFullYear();
      const count = members.filter((m) => {
        const jd = new Date(m.joinDate);
        return jd.getMonth() === month && jd.getFullYear() === year;
      }).length;
      result.push({ name: monthNames[month], joined: count });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get membership plan distribution
// @route   GET /api/dashboard/membership-distribution
// @access  Protected
const getMembershipDistribution = async (req, res) => {
  try {
    const plans = ["Basic", "Pro", "Elite", "Student"];
    const colors = ["#3b82f6", "#10b981", "#f97316", "#8b5cf6"];
    const result = await Promise.all(
      plans.map(async (plan, i) => ({
        name: plan,
        value: await Member.countDocuments({ plan }),
        color: colors[i],
      }))
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get active vs expired weekly data
// @route   GET /api/dashboard/active-vs-expired
// @access  Protected
const getActiveVsExpired = async (req, res) => {
  try {
    const members = await Member.find();
    const now = new Date();
    const result = [];

    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - i * 7);

      const weekMembers = members.filter((m) => {
        const jd = new Date(m.joinDate);
        return jd >= weekStart && jd < weekEnd;
      });

      result.push({
        name: `Week ${4 - i}`,
        active: weekMembers.filter((m) => m.status === "Active").length,
        expired: weekMembers.filter((m) => m.status === "Expired").length,
        inactive: weekMembers.filter((m) => m.status === "Inactive").length,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats, getMonthlyJoined, getMembershipDistribution, getActiveVsExpired };

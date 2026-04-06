import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, MoreHorizontal, UserPlus, TrendingUp, Users, Trash2, Loader2, AlertTriangle, X } from "lucide-react";
import { getMembers, deleteMember } from "../services/api";
import AddMemberModal from "../components/AddMemberModal";
import MemberDetailsModal from "../components/MemberDetailsModal";

// ── Custom in-page delete confirmation dialog ──────────────────────────────────
function DeleteConfirmDialog({ member, onConfirm, onCancel, isDeleting }) {
  if (!member) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-sm bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden"
        >
          {/* Red top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

          <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-full text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors">
            <X className="w-4 h-4" />
          </button>

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center gap-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-1">Delete Member?</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                You are about to permanently delete{" "}
                <span className="font-semibold text-black dark:text-white">{member.name}</span>.
                This action <span className="text-red-500 font-semibold">cannot be undone</span>.
              </p>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black/80 dark:text-white/80 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</> : "Yes, Delete"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

export default function Members() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // Delete confirmation state
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (activeFilter !== "All") params.plan = activeFilter;
      const { data } = await getMembers(params);
      setMembers(data);
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter]);

  useEffect(() => {
    const delay = setTimeout(fetchMembers, 300);
    return () => clearTimeout(delay);
  }, [fetchMembers]);

  const handleDeleteClick = (member, e) => {
    e.stopPropagation();
    setDeleteError("");
    setMemberToDelete(member);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteMember(memberToDelete._id);
      setMembers(prev => prev.filter(m => m._id !== memberToDelete._id));
      setMemberToDelete(null);
    } catch (err) {
      console.error("Delete failed:", err);
      const msg = err.response?.data?.message || "Failed to delete member. Please try again.";
      setDeleteError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) setMemberToDelete(null);
  };

  const stats = [
    { title: "Total Roster",   value: members.length,                                              icon: Users },
    { title: "Active",         value: members.filter(m => m.status === "Active").length,           icon: TrendingUp },
    { title: "Avg Age",        value: members.length ? Math.round(members.reduce((a, c) => a + c.age, 0) / members.length) : 0, icon: Users },
    { title: "Female Ratio",   value: members.length ? Math.round((members.filter(m => m.gender === "Female").length / members.length) * 100) + "%" : "0%", icon: Users },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-10 relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Members Registry</h1>
          <p className="text-black/60 dark:text-white/60">Manage your entire gym roster and their details.</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" /> Add Member
        </motion.button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="glass p-6 rounded-2xl relative overflow-hidden group border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40"
          >
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-black/60 dark:text-white/60 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-black dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md bg-black/5 dark:bg-white/10">
                <stat.icon className="w-6 h-6 text-black dark:text-white opacity-80" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Error banner if delete fails */}
      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between"
          >
            <span>{deleteError}</span>
            <button onClick={() => setDeleteError("")}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="glass rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 overflow-hidden"
      >
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 dark:text-white/50" />
              <input
                type="text" placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm rounded-lg py-2 pl-10 pr-4 outline-none focus:border-green-500/50 transition-all text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 w-full sm:w-64"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 border py-2 px-4 rounded-lg text-sm transition-colors ${
                  activeFilter !== "All"
                    ? "bg-green-500 text-black border-green-500/50 shadow-[0_0_10px_rgba(57,255,20,0.3)] font-medium"
                    : "bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/10 dark:border-white/10 text-black/80 dark:text-white/80"
                }`}
              >
                <Filter className="w-4 h-4" />
                {activeFilter !== "All" ? activeFilter : "Filter"}
              </button>
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1a1a] border border-black/10 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                  >
                    {["All", "Basic", "Pro", "Elite", "Student"].map(opt => (
                      <button key={opt} onClick={() => { setActiveFilter(opt); setShowFilters(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                          activeFilter === opt ? "bg-green-500/10 text-green-600 dark:text-[#39ff14] font-medium" : "text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5"
                        }`}
                      >
                        {opt === "All" ? "All Members" : opt}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Member</th>
                <th className="px-6 py-4 font-medium">Demographics</th>
                <th className="px-6 py-4 font-medium">Plan</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-black/30 dark:text-white/30" />
                </td></tr>
              ) : (
                <AnimatePresence>
                  {members.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, x: -20, scale: 0.95 }}
                      transition={{ duration: 0.2, delay: (index % 10) * 0.02 }}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="group transition-colors relative cursor-pointer"
                      onClick={() => setSelectedMember(member)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={member.image || `https://i.pravatar.cc/150?u=${member._id}`} alt={member.name} className="w-10 h-10 rounded-full border border-black/10 dark:border-white/10" />
                          <div>
                            <p className="font-semibold text-black dark:text-white group-hover:text-green-600 dark:group-hover:text-[#39ff14] transition-colors">{member.name}</p>
                            <p className="text-xs text-black/50 dark:text-white/50">{member.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-black/80 dark:text-white/80 font-medium">{member.age} yrs • {member.gender}</span>
                          <span className="text-xs text-black/50 dark:text-white/50">DOB: {member.dob}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-black/80 dark:text-white/80 font-medium">{member.plan}</td>
                      <td className="px-6 py-4 text-black/60 dark:text-white/60">
                        <div className="flex flex-col gap-1">
                          <span>{member.joinDate}</span>
                          <span className="text-xs text-black/50 dark:text-white/50">to {member.expiryDate}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === "Active" ? "bg-green-500/10 text-green-600 dark:text-[#39ff14] border border-green-500/20 shadow-[0_0_10px_rgba(57,255,20,0.2)]" :
                          member.status === "Expired" ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" :
                          "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border border-black/20 dark:border-white/20"
                        }`}>{member.status}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white p-2 transition-colors rounded-lg hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(member, e)}
                            className="text-black/40 dark:text-white/40 hover:text-red-500 p-2 transition-colors rounded-lg hover:bg-red-500/10"
                            title="Delete member"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
              {!loading && members.length === 0 && (
                <tr><td colSpan="6" className="px-6 py-12 text-center text-black/50 dark:text-white/50">No members matching your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <AddMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onMemberAdded={fetchMembers} />
      <MemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember ? { ...selectedMember, id: selectedMember._id } : null}
        onClose={() => setSelectedMember(null)}
      />

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        member={memberToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}

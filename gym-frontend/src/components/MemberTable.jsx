import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MoreHorizontal, Loader2 } from "lucide-react";
import { getMembers } from "../services/api";
import MemberDetailsModal from "./MemberDetailsModal";

export default function MemberTable() {
  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchRecent = async () => {
      setLoading(true);
      try {
        const { data } = await getMembers({ search: searchTerm });
        setMembers(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (err) {
        console.error("MemberTable fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    const delay = setTimeout(fetchRecent, 300);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleOpenDetails = (member) => {
    // Normalize _id -> id for the modal
    setSelectedMember({ ...member, id: member._id || member.id });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="glass rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 overflow-hidden mt-8"
      >
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white">Recent Members</h3>
            <p className="text-sm text-black/60 dark:text-white/60">Click a name to view full details.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/50 dark:text-white/50" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm rounded-lg py-2 pl-10 pr-4 outline-none focus:border-green-500/50 transition-all text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 w-full sm:w-auto"
            />
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-black/5 dark:bg-white/5 text-black/60 dark:text-white/60 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Name</th>
                <th className="px-6 py-4 font-medium">Profile Plan</th>
                <th className="px-6 py-4 font-medium">Join Date</th>
                <th className="px-6 py-4 font-medium">Expiry Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-black/30 dark:text-white/30" />
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {members.map((member, index) => (
                    <motion.tr
                      key={member._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                      className="group transition-colors"
                    >
                      {/* Clickable name cell */}
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleOpenDetails(member)}
                          className="flex items-center gap-3 text-left w-full group/btn"
                        >
                          <img
                            src={member.image || `https://i.pravatar.cc/150?u=${member._id}`}
                            alt={member.name}
                            className="w-8 h-8 rounded-full flex-shrink-0 ring-2 ring-transparent group-hover/btn:ring-[#39ff14]/40 transition-all"
                          />
                          <div>
                            <p className="font-medium text-black dark:text-white group-hover:text-green-600 dark:group-hover:text-[#39ff14] transition-colors hover:underline underline-offset-2">
                              {member.name}
                            </p>
                            <p className="text-xs text-black/50 dark:text-white/50">{member.phone}</p>
                          </div>
                        </button>
                      </td>

                      <td className="px-6 py-4 text-black/80 dark:text-white/80 font-medium">{member.plan}</td>
                      <td className="px-6 py-4 text-black/60 dark:text-white/60">{member.joinDate}</td>
                      <td className="px-6 py-4 text-black/60 dark:text-white/60">{member.expiryDate}</td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            member.status === "Active"
                              ? "bg-green-500/10 text-green-600 dark:text-[#39ff14] border border-green-500/20 shadow-[0_0_10px_rgba(57,255,20,0.2)]"
                              : member.status === "Expired"
                              ? "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              : "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border border-black/20 dark:border-white/20"
                          }`}
                        >
                          {member.status}
                        </span>
                      </td>

                      {/* Action button also opens details */}
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(member)}
                          title="View member details"
                          className="text-black/60 dark:text-white/60 hover:text-[#39ff14] p-2 transition-colors rounded-full hover:bg-[#39ff14]/10"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}

              {!loading && members.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-black/50 dark:text-white/50">
                    No members matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Member Details Modal */}
      <MemberDetailsModal
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </>
  );
}

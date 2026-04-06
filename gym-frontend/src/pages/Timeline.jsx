import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, Filter, UserCheck, UserX, UserMinus, Loader2 } from "lucide-react";
import { getMembers } from "../services/api";
import MemberDetailsModal from "../components/MemberDetailsModal";

export default function Timeline() {
  const [filter, setFilter] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const { data } = await getMembers();
        // Sort by joinDate descending (newest first)
        setMembers([...data].sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate)));
      } catch (err) {
        console.error("Timeline fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredTimeline = filter === "All"
    ? members
    : members.filter(m => m.status === filter);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Active":   return <UserCheck className="w-5 h-5 text-green-500" />;
      case "Expired":  return <UserX className="w-5 h-5 text-red-500" />;
      case "Inactive": return <UserMinus className="w-5 h-5 text-black/40 dark:text-white/40" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":   return "border-green-500/50 shadow-[0_0_15px_rgba(57,255,20,0.15)]";
      case "Expired":  return "border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
      case "Inactive": return "border-black/20 dark:border-white/20";
      default: return "";
    }
  };

  const MemberCard = ({ member }) => (
    <div
      onClick={() => setSelectedMember(member)}
      className={`w-full glass p-5 rounded-2xl border ${getStatusColor(member.status)} bg-white/80 dark:bg-black/60 transition-all hover:-translate-y-1 ml-[76px] md:ml-0 mt-4 md:mt-0 cursor-pointer shadow-sm hover:shadow-md`}
    >
      <div className="flex items-center gap-4 mb-4">
        <img
          src={member.image || `https://i.pravatar.cc/150?u=${member._id}`}
          alt={member.name}
          className="w-14 h-14 rounded-full border-2 border-black/10 dark:border-white/10 object-cover"
        />
        <div>
          <h3 className="text-lg font-bold text-black dark:text-white">{member.name}</h3>
          <p className="text-sm text-black/50 dark:text-white/50">{member.phone}</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-4">
        <div className="flex flex-col">
          <span className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Plan</span>
          <span className="text-black dark:text-white font-medium">{member.plan}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-semibold uppercase tracking-wider text-black/40 dark:text-white/40">Status</span>
          <span className={`text-sm font-bold ${
            member.status === "Active" ? "text-green-500" :
            member.status === "Expired" ? "text-red-500" :
            "text-black/50 dark:text-white/50"
          }`}>{member.status}</span>
        </div>
      </div>
    </div>
  );

  const DateBadge = ({ date }) => (
    <div className="glass px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 flex items-center gap-2 mb-4 md:mb-0 drop-shadow-sm self-start md:self-auto ml-[76px] md:ml-0">
      <CalendarDays className="w-4 h-4 text-black/50 dark:text-white/50" />
      <span className="font-semibold text-black dark:text-white tracking-wide text-sm">{date}</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16 relative w-full"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Member Timeline</h1>
          <p className="text-black/60 dark:text-white/60">A chronological history of member join events.</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 w-full md:w-auto overflow-x-auto">
          {["All", "Active", "Expired", "Inactive"].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-6 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                filter === tab
                  ? "bg-white text-black dark:bg-black dark:text-white shadow-md border border-black/10 dark:border-white/10"
                  : "text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-10 h-10 animate-spin text-black/20 dark:text-white/20" />
        </div>
      ) : (
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[38px] md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-[#39ff14] to-red-500 opacity-20 -translate-x-1/2 rounded-full" />

          <div className="space-y-12">
            <AnimatePresence>
              {filteredTimeline.map((member, index) => {
                const isEven = index % 2 === 0;
                return (
                  <motion.div
                    key={member._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 30 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
                    transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                    className="relative flex flex-col md:flex-row items-start md:items-center w-full"
                  >
                    {/* Left Side */}
                    <div className={`w-full md:w-[45%] flex ${isEven ? "md:justify-end md:pr-10" : "md:justify-end md:pr-10 md:order-1"}`}>
                      {isEven
                        ? <DateBadge date={member.joinDate} />
                        : <MemberCard member={member} />
                      }
                    </div>

                    {/* Center Node */}
                    <div className="absolute left-[38px] md:left-1/2 -translate-x-1/2 top-0 md:top-auto w-12 h-12 rounded-full glass border border-black/10 dark:border-white/10 bg-white dark:bg-black flex items-center justify-center z-10 shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.05)] md:order-2">
                      {getStatusIcon(member.status)}
                    </div>

                    {/* Right Side */}
                    <div className={`w-full md:w-[45%] flex ${isEven ? "md:justify-start md:pl-10 md:order-3" : "md:justify-start md:pl-10 md:order-3"}`}>
                      {!isEven
                        ? <DateBadge date={member.joinDate} />
                        : <MemberCard member={member} />
                      }
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredTimeline.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="w-full py-20 flex flex-col items-center justify-center text-center"
              >
                <Filter className="w-16 h-16 text-black/10 dark:text-white/10 mb-4" />
                <h2 className="text-xl font-bold text-black/40 dark:text-white/40">No records found</h2>
                <p className="text-black/30 dark:text-white/30 mt-2">Try switching the filter to another status category.</p>
              </motion.div>
            )}
          </div>
        </div>
      )}

      <MemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </motion.div>
  );
}

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { getAlerts } from "../services/api";
import MemberDetailsModal from "../components/MemberDetailsModal";

export default function Alerts() {
  const [selectedMember, setSelectedMember] = useState(null);
  const [alertsData, setAlertsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const { data } = await getAlerts();
        setAlertsData(data);
      } catch (err) {
        console.error("Failed to fetch alerts:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const expiredList = alertsData.filter(m => m.daysUntilExpiry < 0);
  const expiringSoonList = alertsData.filter(m => m.daysUntilExpiry >= 0 && m.daysUntilExpiry <= 7);

  const renderAlertCard = (member, isExpired) => (
    <motion.div
      key={member._id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => setSelectedMember(member)}
      className={`glass p-5 rounded-2xl border cursor-pointer transition-all ${
        isExpired
          ? "border-red-500/30 bg-red-500/5 hover:bg-red-500/10 hover:shadow-[0_0_20px_rgba(239,68,68,0.15)]"
          : "border-yellow-500/30 bg-yellow-500/5 hover:bg-yellow-500/10 hover:shadow-[0_0_20px_rgba(234,179,8,0.15)]"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={member.image || `https://i.pravatar.cc/150?u=${member._id}`}
              alt={member.name}
              className="w-12 h-12 rounded-full border border-black/10 dark:border-white/10"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-white dark:bg-black border border-black/10 dark:border-white/10">
              {isExpired
                ? <AlertCircle className="w-3 h-3 text-red-500" />
                : <Clock className="w-3 h-3 text-yellow-500" />
              }
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-black dark:text-white">{member.name}</h3>
            <p className="text-sm font-medium text-black/50 dark:text-white/50">{member.phone}</p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-black/5 dark:border-white/5">
          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${
            isExpired
              ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
              : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20"
          }`}>
            {isExpired
              ? `Expired ${Math.abs(member.daysUntilExpiry)} days ago`
              : `Expires in ${member.daysUntilExpiry} ${member.daysUntilExpiry === 1 ? "day" : "days"}`
            }
          </span>
          <p className="text-xs text-black/40 dark:text-white/40 mt-1.5 font-medium uppercase tracking-wider">Plan: {member.plan}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16 relative"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          Action Center
        </h1>
        <p className="text-black/60 dark:text-white/60">Real-time alerts for expiring memberships and overdue accounts.</p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Expiring Soon */}
        <div className="glass p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2 text-yellow-500">
              <Clock className="w-5 h-5" /> Expiring Within 7 Days
            </h2>
            <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full">
              {expiringSoonList.length} Action Needed
            </span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <div className="py-12 text-center text-black/40 dark:text-white/40 text-sm">Loading...</div>
              ) : expiringSoonList.length > 0 ? (
                expiringSoonList.map(m => renderAlertCard(m, false))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center opacity-60"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#39ff14] mb-3 opacity-50" />
                  <p className="font-semibold text-black dark:text-white">All Clear</p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">No upcoming expirations in the next 7 days.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Already Expired */}
        <div className="glass p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/20">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" /> Overdue & Expired
            </h2>
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.4)]">
              {expiredList.length} Critical
            </span>
          </div>
          <div className="space-y-4">
            <AnimatePresence>
              {loading ? (
                <div className="py-12 text-center text-black/40 dark:text-white/40 text-sm">Loading...</div>
              ) : expiredList.length > 0 ? (
                expiredList.map(m => renderAlertCard(m, true))
              ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="py-12 flex flex-col items-center justify-center text-center opacity-60"
                >
                  <CheckCircle2 className="w-12 h-12 text-[#39ff14] mb-3 opacity-50" />
                  <p className="font-semibold text-black dark:text-white">Inbox Zero</p>
                  <p className="text-sm text-black/50 dark:text-white/50 mt-1">No overdue memberships detected.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <MemberDetailsModal
        isOpen={!!selectedMember}
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </motion.div>
  );
}

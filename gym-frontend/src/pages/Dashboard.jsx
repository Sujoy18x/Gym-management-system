import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Key } from "lucide-react";
import DashboardCards from "../components/DashboardCards";
import Charts from "../components/Charts";
import MemberTable from "../components/MemberTable";
import AddMemberModal from "../components/AddMemberModal";
import UpdatePasswordModal from "../components/UpdatePasswordModal";
import { getDashboardStats, getMonthlyJoined, getMembershipDist, getActiveVsExpired } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { getAdmin } = useAuth();
  const admin = getAdmin();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState({ monthly: [], distribution: [], activeExpired: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, monthlyRes, distRes, activeRes] = await Promise.all([
          getDashboardStats(),
          getMonthlyJoined(),
          getMembershipDist(),
          getActiveVsExpired(),
        ]);
        setStats(statsRes.data);
        setChartData({
          monthly: monthlyRes.data,
          distribution: distRes.data,
          activeExpired: activeRes.data,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-10"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Overview</h1>
          <p className="text-black/60 dark:text-white/60">Welcome back, {admin?.name || "Team"}.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {admin?.role !== "Owner" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-black dark:text-white border border-black/10 dark:border-white/10 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
            >
              <Key className="w-4 h-4 text-green-500" />
              Update Password
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-colors flex items-center gap-2 flex-1 sm:flex-none justify-center"
          >
            <span className="text-lg">+</span>
            New Member
          </motion.button>
        </div>
      </div>

      <DashboardCards stats={stats} loading={loading} />
      <Charts chartData={chartData} loading={loading} />
      <MemberTable />
      
      <AddMemberModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onMemberAdded={() => window.location.reload()} 
      />

      <UpdatePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </motion.div>
  );
}

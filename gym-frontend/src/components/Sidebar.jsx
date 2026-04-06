import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  Settings, 
  Ticket,
  Calendar,
  Sun,
  Moon,
  LogOut
} from "lucide-react";
import clsx from "clsx";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { getSettings } from "../services/api";
import logoImg from "../assets/logo.png";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Members", icon: Users, path: "/members" },
  { name: "Offers", icon: Ticket, path: "/offers" },
  { name: "Timeline", icon: Calendar, path: "/timeline" },
  { name: "Alerts", icon: AlertTriangle, path: "/alerts" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { getAdmin, logout } = useAuth();
  const admin = getAdmin();

  const [gymName, setGymName] = useState(() => localStorage.getItem("gymName") || "Lift Club");

  useEffect(() => {
    const fetchGymName = async () => {
      try {
        const { data } = await getSettings();
        if (data.settings?.gymName) {
          setGymName(data.settings.gymName);
          localStorage.setItem("gymName", data.settings.gymName);
        }
      } catch (error) {}
    };
    fetchGymName();

    const handleUpdate = () => {
      const updatedName = localStorage.getItem("gymName");
      if (updatedName) setGymName(updatedName);
    };
    window.addEventListener("gymConfigUpdated", handleUpdate);
    return () => window.removeEventListener("gymConfigUpdated", handleUpdate);
  }, []);

  return (
    <div className="w-64 h-screen border-r border-black/10 dark:border-white/10 glass flex flex-col items-center py-8 z-50 fixed left-0 top-0 bg-white/70 dark:bg-black/40">
      <div className="flex items-center gap-2 mb-12">
        <img src={logoImg} alt={`${gymName} Logo`} className="w-12 h-12 object-contain" />
        <h1 className="text-xl font-bold tracking-wider text-black dark:text-white uppercase truncate max-w-[150px]">{gymName}</h1>
      </div>

      <nav className="flex-1 w-full px-4 space-y-2">
        {navItems.filter(item => item.name !== "Settings" || admin.role === "Owner").map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.name} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.02, x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 mt-1",
                  isActive 
                    ? "bg-green-500/10 dark:bg-white/10 text-green-600 dark:text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(57,255,20,0.2)]" 
                    : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </motion.div>
            </Link>
          );
        })}

        {/* Theme Toggle Bar */}
        <div className="mt-8 pt-4 border-t border-black/10 dark:border-white/10 w-full">
          <div className="bg-black/5 dark:bg-white/5 rounded-xl p-1 flex items-center justify-between relative overflow-hidden transition-colors w-full">
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all z-10",
                theme === 'light' 
                  ? "bg-white text-black shadow-sm" 
                  : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
              )}
            >
              <Sun className="w-4 h-4" />
              Light
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all z-10",
                theme === 'dark' 
                  ? "bg-black text-white shadow-[0_0_10px_rgba(57,255,20,0.2)] border border-green-500/30" 
                  : "text-black/50 hover:text-black dark:text-white/50 dark:hover:text-white"
              )}
            >
              <Moon className="w-4 h-4" />
              Dark
            </button>
          </div>
        </div>
      </nav>

      <div className="px-4 w-full mt-auto mb-4 space-y-2">
        <button 
          onClick={logout} 
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-bold text-red-500 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors border border-red-500/20"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
        <div className="w-full glass p-4 rounded-xl border border-green-500/20 shadow-[0_0_15px_rgba(57,255,20,0.1)] flex items-center gap-3 cursor-pointer transition-all duration-300 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:-translate-y-1">
           <img src={`https://ui-avatars.com/api/?name=${admin.name || 'Admin'}&background=000&color=39ff14`} alt="Admin" className="w-10 h-10 rounded-full" />
           <div className="overflow-hidden">
             <p className="text-sm font-semibold text-black dark:text-white truncate">{admin.name || 'Admin User'}</p>
             <p className="text-xs text-black/60 dark:text-white/60 truncate">{admin.role || 'Gym Manager'}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

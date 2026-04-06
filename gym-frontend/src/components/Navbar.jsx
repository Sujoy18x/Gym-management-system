import { useState, useRef, useEffect } from "react";
import { Bell, Clock, AlertCircle, CheckCircle2, X, CheckCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getAlerts, getAlertCount, markAlertRead, markAllRead } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch unread count for badge
  const fetchCount = async () => {
    try {
      const { data } = await getAlertCount();
      setUnreadCount(data.count);
    } catch (err) {
      console.error("Alert count error:", err);
    }
  };

  // Fetch full notifications when dropdown opens
  const fetchNotifications = async () => {
    try {
      const { data } = await getAlerts();
      setNotifications(data);
    } catch (err) {
      console.error("Alerts fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, []);

  const handleOpen = () => {
    setIsOpen(prev => {
      if (!prev) fetchNotifications();
      return !prev;
    });
  };

  const handleMarkOne = async (id, e) => {
    e.stopPropagation();
    try {
      await markAlertRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Mark read error:", err);
    }
  };

  const handleMarkAll = async () => {
    try {
      await markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Mark all read error:", err);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <header className="h-20 border-b border-black/10 dark:border-white/10 glass px-8 flex items-center justify-between sticky top-0 z-40 bg-white/60 dark:bg-black/60 backdrop-blur-xl">
      <div>
        <h2 className="text-2xl font-bold text-black dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:to-neutral-400">
          Admin Overview
        </h2>
        <p className="text-sm text-black/60 dark:text-white/60">Welcome back, monitor your gym's performance.</p>
      </div>

      <div className="flex items-center gap-6">

        {/* Bell with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={handleOpen}
            className="relative p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          >
            <Bell className={`w-5 h-5 transition-colors ${isOpen ? "text-red-500" : "text-black/60 dark:text-white/60"}`} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 shadow-[0_0_8px_rgba(239,68,68,0.8)] animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-96 rounded-2xl border border-black/10 dark:border-white/10 bg-white/90 dark:bg-[#0f0f0f]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-red-500" />
                    <span className="font-bold text-black dark:text-white text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAll}
                        className="flex items-center gap-1 text-xs text-black/50 dark:text-white/50 hover:text-[#39ff14] transition-colors font-medium"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        Mark all read
                      </button>
                    )}
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <X className="w-3.5 h-3.5 text-black/50 dark:text-white/50" />
                    </button>
                  </div>
                </div>

                {/* List */}
                <div className="max-h-80 overflow-y-auto divide-y divide-black/5 dark:divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center opacity-60">
                      <CheckCircle2 className="w-10 h-10 text-[#39ff14] mb-3 opacity-50" />
                      <p className="font-semibold text-black dark:text-white text-sm">All Clear!</p>
                      <p className="text-xs text-black/50 dark:text-white/50 mt-1">No alerts right now.</p>
                    </div>
                  ) : (
                    notifications.map(n => {
                      const isExpired = n.daysUntilExpiry < 0;
                      return (
                        <div
                          key={n._id}
                          className={`flex items-start gap-3 px-5 py-3.5 transition-colors ${
                            n.isRead ? "opacity-50" : "hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="relative shrink-0 mt-0.5">
                            <img
                              src={n.image || `https://i.pravatar.cc/150?u=${n._id}`}
                              alt={n.name}
                              className="w-9 h-9 rounded-full border border-black/10 dark:border-white/10 object-cover"
                            />
                            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-[#0f0f0f] flex items-center justify-center ${isExpired ? "bg-red-500" : "bg-yellow-400"}`}>
                              {isExpired
                                ? <AlertCircle className="w-2 h-2 text-white" />
                                : <Clock className="w-2 h-2 text-black" />
                              }
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-black dark:text-white truncate">{n.name}</p>
                            <p className={`text-xs mt-0.5 font-medium ${isExpired ? "text-red-500" : "text-yellow-500"}`}>
                              {isExpired
                                ? `Expired ${Math.abs(n.daysUntilExpiry)} day${Math.abs(n.daysUntilExpiry) !== 1 ? "s" : ""} ago`
                                : `Expires in ${n.daysUntilExpiry} day${n.daysUntilExpiry !== 1 ? "s" : ""}`
                              }
                            </p>
                            <p className="text-xs text-black/40 dark:text-white/40 mt-0.5">Plan: {n.plan}</p>
                          </div>

                          {!n.isRead && (
                            <button
                              onClick={(e) => handleMarkOne(n._id, e)}
                              title="Mark as read"
                              className="shrink-0 mt-1 p-1.5 rounded-full hover:bg-[#39ff14]/10 text-black/30 dark:text-white/30 hover:text-[#39ff14] transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="px-5 py-3 border-t border-black/10 dark:border-white/10">
                    <button
                      onClick={() => { setIsOpen(false); navigate("/alerts"); }}
                      className="w-full text-center text-xs font-semibold text-red-500 hover:text-red-400 transition-colors py-1"
                    >
                      View all in Action Center →
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

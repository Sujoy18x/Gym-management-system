import { motion } from "framer-motion";
import { Users, UserCheck, UserMinus, UserX, TrendingUp, TrendingDown } from "lucide-react";

const icons = [Users, UserCheck, UserX, UserMinus];
const glowColors = [
  "rgba(57,255,20,0.3)",
  "rgba(57,255,20,0.3)",
  "rgba(57,255,20,0.3)",
  "rgba(57,255,20,0.3)",
];

const SkeletonCard = () => (
  <div className="glass p-6 rounded-2xl border border-black/5 dark:border-white/5 bg-white/70 dark:bg-slate-900/40 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="space-y-2">
        <div className="h-3 w-24 bg-black/10 dark:bg-white/10 rounded" />
        <div className="h-8 w-16 bg-black/10 dark:bg-white/10 rounded" />
      </div>
      <div className="w-12 h-12 rounded-xl bg-black/10 dark:bg-white/10" />
    </div>
    <div className="mt-6 h-4 w-28 bg-black/10 dark:bg-white/10 rounded" />
  </div>
);

export default function DashboardCards({ stats, loading }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => {
        const Icon = icons[i];
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-2xl relative overflow-hidden group border border-black/5 dark:border-white/5 bg-white/70 dark:bg-slate-900/40"
            style={{ "--glow": glowColors[i] }}
          >
            {/* Hover Glow */}
            <div 
              className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl z-0"
              style={{ background: `radial-gradient(circle at center, ${glowColors[i]} 0%, transparent 70%)` }}
            />
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-md bg-slate-200/50 dark:bg-white/10">
                <Icon className="w-6 h-6 text-slate-700 dark:text-white opacity-80" />
              </div>
            </div>

            <div className="relative z-10 mt-6 flex items-center gap-2">
              <span className={`flex items-center gap-1 text-sm font-semibold px-2 py-1 rounded-full ${
                stat.isPositive ? "text-green-600 dark:text-[#39ff14] bg-green-500/10" : "text-red-500 dark:text-red-400 bg-red-500/10"
              }`}>
                {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.trend}
              </span>
              <span className="text-xs text-black/50 dark:text-white/50">vs last month</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

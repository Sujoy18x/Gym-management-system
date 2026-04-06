import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
  PieChart, Pie, Cell, Legend
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 rounded-xl border border-black/10 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-black/60">
        <p className="text-black/80 dark:text-white/80 font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SkeletonBox = ({ className }) => (
  <div className={`animate-pulse bg-black/10 dark:bg-white/10 rounded-xl ${className}`} />
);

export default function Charts({ chartData, loading }) {
  const monthly     = chartData?.monthly     || [];
  const distribution = chartData?.distribution || [];
  const activeExpired = chartData?.activeExpired || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 lg:grid-rows-2 gap-6 mt-8 h-[900px] lg:h-[700px]">
      
      {/* Area Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="glass rounded-2xl p-6 lg:col-span-2 lg:row-span-1 border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 relative group"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#39ff14]/5 blur-[100px] pointer-events-none rounded-full" />
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Monthly Member Growth</h3>
        <div className="h-[calc(100%-40px)] w-full">
          {loading ? <SkeletonBox className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJoined" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="joined" stroke="#39ff14" strokeWidth={3} fillOpacity={1} fill="url(#colorJoined)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 relative overflow-hidden"
      >
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#39ff14]/10 blur-[80px] pointer-events-none rounded-full" />
        <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Active vs Expired (Weekly)</h3>
        <div className="h-[calc(100%-40px)] w-full">
          {loading ? <SkeletonBox className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeExpired} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
                <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} iconType="circle" />
                <Bar dataKey="active" fill="#39ff14" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expired" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="glass rounded-2xl p-6 border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[80px] pointer-events-none rounded-full" />
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Plan Distribution</h3>
        <div className="h-[calc(100%-40px)] w-full flex items-center justify-center">
          {loading ? <SkeletonBox className="h-full w-full" /> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%" cy="50%"
                  innerRadius={70} outerRadius={100}
                  paddingAngle={5} dataKey="value" stroke="none"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: "14px" }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

    </div>
  );
}

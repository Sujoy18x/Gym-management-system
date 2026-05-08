import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Key, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { changePassword } from "../services/api";

export default function UpdatePasswordModal({ isOpen, onClose }) {
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const calcStrength = (pw) => {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };
  const strengthLabel = (s) => ["Too short", "Weak", "Fair", "Good", "Strong", "Very Strong"][s];
  const strengthColor = (s) => ["bg-red-500", "bg-red-400", "bg-yellow-400", "bg-lime-400", "bg-green-400", "bg-[#39ff14]"][s];

  const handlePassChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (passError) setPassError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError(""); setPassSuccess(false);
    if (passwords.new !== passwords.confirm) return setPassError("New passwords do not match!");
    if (passwords.new.length < 6) return setPassError("Password must be at least 6 characters.");
    setPassLoading(true);
    try {
      await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
      setPassSuccess(true);
      setPasswords({ current: "", new: "", confirm: "" });
      setTimeout(() => {
        setPassSuccess(false);
        onClose();
      }, 2000);
    } catch (err) {
      setPassError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 to-blue-500" />
          
          <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
               <Key className="w-5 h-5 text-green-500" /> Update Password
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-black/50 hover:text-red-500 dark:text-white/50 dark:hover:text-red-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <form onSubmit={handlePasswordSubmit} className="space-y-5">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Current Password</label>
                <div className="relative">
                  <input
                    type={showPass.current ? "text" : "password"}
                    required
                    value={passwords.current}
                    onChange={(e) => handlePassChange("current", e.target.value)}
                    placeholder="Enter current password"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:border-green-500/50 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, current: !p.current }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1">
                    {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password + Strength Meter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">New Password</label>
                <div className="relative">
                  <input
                    type={showPass.new ? "text" : "password"}
                    required
                    value={passwords.new}
                    onChange={(e) => handlePassChange("new", e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:border-green-500/50 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1">
                    {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwords.new && (() => {
                  const s = calcStrength(passwords.new);
                  return (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1">
                        {[1,2,3,4,5].map(i => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= s ? strengthColor(s) : "bg-black/10 dark:bg-white/10"}`} />
                        ))}
                      </div>
                      <p className={`text-xs font-semibold ${
                        s <= 1 ? "text-red-400" : s <= 2 ? "text-yellow-400" : s <= 3 ? "text-lime-400" : "text-green-400"
                      }`}>{strengthLabel(s)}</p>
                    </div>
                  );
                })()}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPass.confirm ? "text" : "password"}
                    required
                    value={passwords.confirm}
                    onChange={(e) => handlePassChange("confirm", e.target.value)}
                    placeholder="Re-enter new password"
                    className={`w-full bg-black/5 dark:bg-white/5 border text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none transition-colors ${
                      passwords.confirm && passwords.new !== passwords.confirm
                        ? "border-red-500/60"
                        : passwords.confirm && passwords.new === passwords.confirm
                        ? "border-green-500/60"
                        : "border-black/10 dark:border-white/10 focus:border-green-500/50"
                    }`}
                  />
                  <button type="button" onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors p-1">
                    {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {passwords.confirm && (
                    <span className={`absolute right-9 top-1/2 -translate-y-1/2 ${
                      passwords.new === passwords.confirm ? "text-green-500" : "text-red-400"
                    }`}>
                      {passwords.new === passwords.confirm ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {passError && (
                  <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {passError}
                  </motion.div>
                )}
                {passSuccess && (
                  <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-center gap-2 text-[#39ff14] text-sm font-medium bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                    <CheckCircle2 className="w-4 h-4" /> Password changed successfully!
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={passLoading || Boolean(passwords.confirm && passwords.new !== passwords.confirm)}
                  className="w-full px-6 py-3 bg-green-500 hover:bg-[#39ff14] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Key className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

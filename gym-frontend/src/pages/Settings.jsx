import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Key, Bell, Building2, Download, LogOut, CheckCircle2, AlertCircle, Smartphone, Loader2, Pencil, Trash2, X, Eye, EyeOff } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import InviteStaffModal from "../components/InviteStaffModal";
import Papa from "papaparse";
import { getSettings, updateSettings, updateNotifications, inviteStaff, getStaff, getMembers, removeStaff } from "../services/api";
import { changePassword } from "../services/api";

// ─── Edit Staff Inline Modal ───────────────────────────────────────────────────
function EditStaffModal({ staff, onClose, onSave }) {
  const [form, setForm] = useState({ name: staff.name, role: staff.role, email: staff.email });
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#111] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-6 z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-[#39ff14] to-red-500 rounded-t-2xl" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-black dark:text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-[#39ff14]" /> Edit Staff
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-black/50 dark:text-white/50" />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { label: "Full Name", key: "name", type: "text" },
            { label: "Email", key: "email", type: "email" },
            { label: "Role", key: "role", type: "text" },
          ].map(({ label, key, type }) => (
            <div key={key} className="space-y-1.5">
              <label className="text-xs font-semibold text-black/60 dark:text-white/60 uppercase tracking-wider">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={e => setForm({ ...form, [key]: e.target.value })}
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-3 py-2.5 text-sm outline-none focus:border-green-500/50 transition-colors"
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 py-2.5 bg-green-500 hover:bg-[#39ff14] text-black text-sm font-bold rounded-lg shadow-[0_0_10px_rgba(57,255,20,0.4)] transition-all"
          >
            Save Changes
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Staff Credentials Modal ───────────────────────────────────────────────────
function StaffCredentialsModal({ credentials, onClose }) {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#111] rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(57,255,20,0.2)] p-6 z-10"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20">
            <CheckCircle2 className="w-8 h-8 text-[#39ff14]" />
          </div>
          <h3 className="text-xl font-bold text-black dark:text-white">Staff Created!</h3>
          <p className="text-sm text-black/70 dark:text-white/70">
            Securely share these login credentials with <strong className="text-black dark:text-white">{credentials?.name}</strong>. They can log in immediately.
          </p>
          
          <div className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-4 mt-4 space-y-3 text-left">
            <div>
              <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wider font-semibold mb-1">Email / Username</p>
              <p className="text-sm font-medium text-black dark:text-white bg-black/5 dark:bg-white/5 py-1.5 px-3 rounded-lg select-all">
                {credentials?.email}
              </p>
            </div>
            <div>
              <p className="text-xs text-black/50 dark:text-white/50 uppercase tracking-wider font-semibold mb-1">Temporary Password</p>
              <p className="text-lg font-mono font-bold text-[#39ff14] bg-black/90 py-2 px-3 rounded-lg select-all text-center tracking-widest border border-green-500/30">
                {credentials?.tempPassword}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 mt-4 bg-green-500 hover:bg-[#39ff14] text-black text-sm font-bold rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all"
          >
            I have copied the credentials
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Confirm Delete Inline Modal ───────────────────────────────────────────────
function ConfirmDeleteModal({ staff, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        className="relative w-full max-w-sm bg-white dark:bg-[#111] rounded-2xl border border-black/10 dark:border-white/10 shadow-2xl p-6 z-10"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-[#39ff14] to-red-500 rounded-t-2xl" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-red-600 dark:text-red-500 flex items-center gap-2">
            <Trash2 className="w-5 h-5" /> Delete Staff
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <X className="w-4 h-4 text-black/50 dark:text-white/50" />
          </button>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-black/70 dark:text-white/70">
            Are you sure you want to delete <strong className="text-black dark:text-white">{staff?.name}</strong>?
          </p>
          <p className="text-xs text-red-500/80 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
            This will permanently revoke their login access to the dashboard. This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-black/10 dark:border-white/10 text-sm font-medium text-black/70 dark:text-white/70 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-[0_0_10px_rgba(220,38,38,0.4)] transition-all"
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Main Settings Page ────────────────────────────────────────────────────────
export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { getAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const admin = getAdmin();

  // Redirect if not Owner
  useEffect(() => {
    if (admin.role && admin.role !== "Owner") {
      navigate("/");
    }
  }, [admin.role, navigate]);

  // Remote state
  const [gymConfig, setGymConfig] = useState({ gymName: "Lift Club", supportEmail: "", contactPhone: "" });
  const [prefs, setPrefs] = useState({ emailSummaries: true, expiryAlerts: true, is2FAEnabled: false });
  const [staffList, setStaffList] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Edit staff
  const [editingStaff, setEditingStaff] = useState(null); // {index, staff}
  const [deletingStaff, setDeletingStaff] = useState(null); // {index, staff}
  const [newCredentials, setNewCredentials] = useState(null); // {name, email, tempPassword}

  // Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  // Password
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

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(""), 3000); };

  // Load settings from backend
  useEffect(() => {
    const load = async () => {
      setLoadingSettings(true);
      try {
        const { data } = await getSettings();
        setGymConfig({
          gymName: data.settings?.gymName || "Lift Club",
          supportEmail: data.settings?.supportEmail || "",
          contactPhone: data.settings?.contactPhone || "",
        });
        setPrefs({
          emailSummaries: data.preferences?.emailSummaries ?? true,
          expiryAlerts: data.preferences?.expiryAlerts ?? true,
          is2FAEnabled: data.preferences?.is2FAEnabled ?? false,
        });
        setStaffList(data.settings?.staff || []);
      } catch (err) {
        console.error("Settings load error:", err);
      } finally {
        setLoadingSettings(false);
      }
    };
    load();
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleSaveConfig = async () => {
    try {
      await updateSettings(gymConfig);
      localStorage.setItem("gymName", gymConfig.gymName);
      window.dispatchEvent(new Event("gymConfigUpdated"));
      showToast("Configuration saved!");
    } catch (err) {
      showToast("Failed to save configuration.");
    }
  };

  const handleTogglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    try {
      await updateNotifications(updated);
      showToast(`${key === "emailSummaries" ? "Email Summaries" : key === "expiryAlerts" ? "Expiry Alerts" : "2FA"} ${updated[key] ? "enabled" : "disabled"}.`);
    } catch (err) {
      setPrefs(prefs); // rollback
    }
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
      showToast("Password updated successfully.");
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err) {
      setPassError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPassLoading(false);
    }
  };

  const handlePassChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
    if (passError) setPassError("");
  };

  const handleInviteStaff = async (newStaff) => {
    try {
      const resp = await inviteStaff(newStaff);
      const data = resp.data;
      
      // Update local state with the actual remote state that includes the new staff
      if (data && data.staff) {
        setStaffList(data.staff);
      } else {
        setStaffList(prev => [...prev, { ...newStaff, status: "Active" }]);
      }

      showToast(`Invited ${newStaff.name} as ${newStaff.role}`);
      
      // Provide the temporary password securely via custom modal
      if (data && data.tempPassword) {
        setNewCredentials({
          name: newStaff.name,
          email: newStaff.email,
          tempPassword: data.tempPassword
        });
      }

    } catch (err) {
      showToast(err.response?.data?.message || "Failed to invite staff.");
    }
  };

  const handleSaveStaffEdit = async (updatedFields) => {
    const updated = staffList.map((s, i) =>
      i === editingStaff.index ? { ...s, ...updatedFields } : s
    );
    try {
      await updateSettings({ staff: updated });
      setStaffList(updated);
      setEditingStaff(null);
      showToast(`${updatedFields.name}'s details updated.`);
    } catch (err) {
      showToast("Failed to update staff.");
    }
  };

  const handleRemoveStaffClick = (index) => {
    setDeletingStaff({ index, staff: staffList[index] });
  };

  const confirmRemoveStaff = async () => {
    if (!deletingStaff) return;
    const { index, staff } = deletingStaff;
    if (!staff || !staff.email) {
      showToast("Error: Missing staff data.");
      setDeletingStaff(null);
      return;
    }
    try {
      await removeStaff(staff.email);
      const updated = staffList.filter((_, i) => i !== index);
      setStaffList(updated);
      showToast("Staff member removed.");
    } catch (err) {
      console.error("removeStaff error:", err);
      showToast("Failed to remove staff.");
    } finally {
      setDeletingStaff(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      showToast("Initiating secure member download...");
      const { data: members } = await getMembers();
      
      const csvData = members.map(m => ({
        "Name": m.name,
        "Phone": m.phone || "N/A",
        "Gender": m.gender || "Unknown",
        "Age": m.age || "N/A",
        "Plan": m.plan,
        "Status": m.status,
        "Join Date": new Date(m.joinDate).toLocaleDateString(),
        "Expiry Date": new Date(m.expiryDate).toLocaleDateString()
      }));

      const csvString = Papa.unparse(csvData);
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `liftclub_members_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast("Download completed successfully.");
    } catch (err) {
      console.error(err);
      showToast("Failed to export members.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center py-32 h-full">
        <Loader2 className="w-10 h-10 animate-spin text-black/20 dark:text-white/20" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16 relative max-w-6xl mx-auto"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Platform Settings</h1>
        <p className="text-black/60 dark:text-white/60">Manage your system preferences, security, and administrative details.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Left Column ── */}
        <div className="lg:col-span-2 space-y-8">

          {/* Change Password */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 relative overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <Key className="w-6 h-6 text-black dark:text-white" />
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white">Security & Password</h2>
            </div>

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
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
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
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30"
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
                    className={`w-full bg-black/5 dark:bg-white/5 border text-black dark:text-white rounded-xl px-4 py-3 pr-11 outline-none transition-colors placeholder:text-black/30 dark:placeholder:text-white/30 ${
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
                {passwords.confirm && passwords.new !== passwords.confirm && (
                  <p className="text-xs text-red-400 font-medium">Passwords do not match</p>
                )}
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

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passLoading || Boolean(passwords.confirm && passwords.new !== passwords.confirm)}
                  className="px-6 py-3 bg-green-500 hover:bg-[#39ff14] disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold rounded-xl shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  {passLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</> : <><Key className="w-4 h-4" /> Update Password</>}
                </button>
              </div>
            </form>

            {/* 2FA Toggle */}
            <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-black dark:text-white mb-1 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-500" /> Two-Factor Authentication
                </h3>
                <p className="text-sm text-black/50 dark:text-white/50">Add an extra layer of security to your admin account.</p>
              </div>
              <button onClick={() => handleTogglePref("is2FAEnabled")}
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer border ${prefs.is2FAEnabled ? "bg-green-500 border-green-400 shadow-[0_0_10px_rgba(57,255,20,0.5)]" : "bg-black/20 dark:bg-white/20 border-black/30 dark:border-white/30"}`}>
                <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-5 h-5 bg-white rounded-full shadow-sm"
                  style={{ marginLeft: prefs.is2FAEnabled ? "auto" : "0" }} />
              </button>
            </div>
          </div>

          {/* Gym Configuration */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10">
                <Building2 className="w-6 h-6 text-black dark:text-white" />
              </div>
              <h2 className="text-xl font-bold text-black dark:text-white">Gym Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Organization Name</label>
                <input type="text" value={gymConfig.gymName} onChange={e => setGymConfig({...gymConfig, gymName: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:border-green-500/50 transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Support Email</label>
                <input type="email" value={gymConfig.supportEmail} onChange={e => setGymConfig({...gymConfig, supportEmail: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:border-green-500/50 transition-colors" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Contact Phone</label>
                <input type="tel" value={gymConfig.contactPhone} onChange={e => setGymConfig({...gymConfig, contactPhone: e.target.value})}
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:border-green-500/50 transition-colors" />
              </div>
            </div>
            <div className="pt-6 mt-6 border-t border-black/10 dark:border-white/10 flex justify-end">
              <button type="button" onClick={handleSaveConfig}
                className="px-6 py-2.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-black dark:text-white transition-colors font-medium rounded-xl">
                Save Changes
              </button>
            </div>
          </div>

          {/* Staff Management */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-3">
                <span className="p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">👥</span>
                Staff Management
              </h2>
              <button onClick={() => setIsInviteModalOpen(true)}
                className="px-4 py-2 bg-green-500 hover:bg-[#39ff14] text-black font-semibold rounded-lg shadow-[0_0_10px_rgba(57,255,20,0.3)] transition-colors text-sm">
                + Invite Staff
              </button>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {staffList.map((staff, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, scale: 0.95 }}
                    className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-xl border border-black/10 dark:border-white/10 group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                        {staff.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-black dark:text-white flex items-center gap-2">
                          {staff.name}
                          <span className="text-xs px-2.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60">{staff.role}</span>
                          {staff.status === "Invited" && (
                            <span className="text-xs px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20">Pending</span>
                          )}
                        </p>
                        <p className="text-xs text-black/50 dark:text-white/50 mt-0.5">{staff.email}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingStaff({ index: i, staff })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white border border-black/10 dark:border-white/10 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-all"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </button>
                      {i !== 0 && ( // prevent deleting the owner
                        <button
                          onClick={() => handleRemoveStaffClick(i)}
                          className="p-1.5 text-black/30 dark:text-white/30 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-8">

          {/* Preferences */}
          <div className="glass p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40">
            <h2 className="text-xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <Bell className="w-5 h-5 text-black/50 dark:text-white/50" /> Preferences
            </h2>
            <div className="space-y-5">
              {[
                { key: "emailSummaries", label: "Email Summaries", desc: "Receive daily member stats" },
                { key: "expiryAlerts", label: "Expiry Alerts", desc: "Notify 7 days before expiration" },
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                  <div>
                    <h3 className="font-semibold text-black dark:text-white text-sm">{label}</h3>
                    <p className="text-xs text-black/50 dark:text-white/50">{desc}</p>
                  </div>
                  <button onClick={() => handleTogglePref(key)}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center px-1 cursor-pointer border ${prefs[key] ? "bg-green-500 border-green-400" : "bg-black/20 dark:bg-white/20 border-black/30"}`}>
                    <motion.div layout transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="w-4 h-4 bg-white rounded-full shadow-sm"
                      style={{ marginLeft: prefs[key] ? "auto" : "0" }} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Data */}
          <div className="glass p-6 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40">
            <h2 className="text-lg font-bold text-black dark:text-white mb-2">Data Export</h2>
            <p className="text-sm text-black/50 dark:text-white/50 mb-4">Download a copy of your entire member roster securely as a CSV file.</p>
            <button onClick={handleExportCSV}
              className="w-full py-3 flex items-center justify-center gap-2 border border-black/20 dark:border-white/20 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-black dark:text-white font-semibold transition-colors">
              <Download className="w-5 h-5" /> Export Member CSV
            </button>
          </div>

          {/* Session / Danger Zone */}
          <div className="p-6 rounded-3xl border border-red-500/30 bg-red-500/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-red-500/20 transition-colors" />
            <h2 className="text-lg font-bold text-red-600 dark:text-red-500 mb-2 flex items-center gap-2">
              <Smartphone className="w-5 h-5" /> Active Session
            </h2>
            <p className="text-sm text-red-600/70 dark:text-red-400/70 mb-6">Terminate your current admin session securely.</p>
            <button
              onClick={() => {
                showToast("Securely logging out...");
                setTimeout(() => { logout(); navigate("/login"); }, 1500);
              }}
              className="w-full py-3 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)] rounded-xl font-bold transition-all hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" /> Terminate Session
            </button>
          </div>
        </div>
      </div>

      {/* Edit Staff Modal */}
      <AnimatePresence>
        {editingStaff && (
          <EditStaffModal
            staff={editingStaff.staff}
            onClose={() => setEditingStaff(null)}
            onSave={handleSaveStaffEdit}
          />
        )}
      </AnimatePresence>

      {/* Confirm Delete Staff Modal */}
      <AnimatePresence>
        {deletingStaff && (
          <ConfirmDeleteModal
            staff={deletingStaff.staff}
            onClose={() => setDeletingStaff(null)}
            onConfirm={confirmRemoveStaff}
          />
        )}
      </AnimatePresence>

      {/* Staff Credentials Modal */}
      <AnimatePresence>
        {newCredentials && (
          <StaffCredentialsModal
            credentials={newCredentials}
            onClose={() => setNewCredentials(null)}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 max-w-sm left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-white dark:bg-black border border-black/10 dark:border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.3)] rounded-full text-black dark:text-white font-medium flex items-center gap-3 text-sm"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <InviteStaffModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInvite={handleInviteStaff}
      />
    </motion.div>
  );
}

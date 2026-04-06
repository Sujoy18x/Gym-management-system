import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { addMember } from "../services/api";

export default function AddMemberModal({ isOpen, onClose, onMemberAdded }) {
  const [form, setForm] = useState({
    name: "", phone: "", dob: "", age: "", gender: "Male",
    plan: "Basic", joinDate: "", expiryDate: "", status: "Active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const calcAge = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birth = new Date(dob);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age > 0 ? String(age) : "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "dob") {
      setForm((prev) => ({ ...prev, dob: value, age: calcAge(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await addMember({ ...form, age: Number(form.age) });
      if (onMemberAdded) onMemberAdded();
      setForm({ name: "", phone: "", dob: "", age: "", gender: "Male", plan: "Basic", joinDate: "", expiryDate: "", status: "Active" });
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add member. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30";
  const labelClass = "text-sm font-medium text-black/80 dark:text-white/80";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }} transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-2xl bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#39ff14] to-red-500" />
          
          <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold text-black dark:text-white">Add New Member</h2>
            <button onClick={onClose} className="p-2 text-black/50 hover:text-red-500 dark:text-white/50 dark:hover:text-red-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto w-full">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="text-red-500 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-lg">{error}</div>
              )}

              {/* Name + Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Full Name</label>
                  <input required type="text" name="name" value={form.name} onChange={handleChange} placeholder="John Doe" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Phone Number</label>
                  <input required type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 234-567-8900" className={inputClass} />
                </div>
              </div>

              {/* DOB, Age, Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Date of Birth</label>
                  <input required type="date" name="dob" value={form.dob} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Age <span className="text-[10px] text-black/40 dark:text-white/40 font-normal">(auto)</span></label>
                  <input
                    readOnly
                    type="number"
                    name="age"
                    value={form.age}
                    placeholder="Auto-calculated"
                    className={`${inputClass} cursor-not-allowed opacity-70 select-none`}
                    tabIndex={-1}
                  />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Plan, Join Date, Expiry Date, Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelClass}>Membership Plan</label>
                  <select name="plan" value={form.plan} onChange={handleChange} className={inputClass}>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Elite">Elite</option>
                    <option value="Student">Student</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Status</label>
                  <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Join Date</label>
                  <input required type="date" name="joinDate" value={form.joinDate} onChange={handleChange} className={inputClass} />
                </div>
                <div className="space-y-2">
                  <label className={labelClass}>Expiry Date</label>
                  <input required type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-4 mt-8">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors font-medium rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-green-500 hover:bg-[#39ff14] disabled:opacity-60 text-black font-semibold rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

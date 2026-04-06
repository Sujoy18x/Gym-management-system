import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Loader2 } from "lucide-react";
import { createOffer } from "../services/api";

export default function AddOfferModal({ isOpen, onClose, onOfferAdded }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.target);
    try {
      await createOffer({
        title: formData.get("title"),
        duration: formData.get("duration"),
        basePrice: Number(formData.get("basePrice")),
        registrationFee: Number(formData.get("registrationFee")),
        tag: formData.get("tag"),
      });
      if (onOfferAdded) onOfferAdded();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-lg bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          {/* Top Decorative Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-[#39ff14] to-red-500" />
          
          <div className="flex items-center justify-between p-6 border-b border-black/10 dark:border-white/10">
            <h2 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
              <Tag className="w-5 h-5 text-green-500" />
              Create New Plan
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-black/50 hover:text-red-500 dark:text-white/50 dark:hover:text-red-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto w-full custom-scrollbar">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Offer Title</label>
                <input required name="title" type="text" placeholder="e.g. Summer Special" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/80 dark:text-white/80">Duration (String)</label>
                  <input required name="duration" type="text" placeholder="e.g. 3 Months" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/80 dark:text-white/80">Tag Type</label>
                  <select name="tag" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors appearance-none cursor-pointer">
                    <option value="Standard" className="bg-white dark:bg-black text-black dark:text-white">Standard</option>
                    <option value="No Reg Fee" className="bg-white dark:bg-black text-black dark:text-white">No Reg Fee</option>
                    <option value="Couple" className="bg-white dark:bg-black text-black dark:text-white">Couple</option>
                    <option value="Festive" className="bg-white dark:bg-black text-black dark:text-white">Festive</option>
                    <option value="Premium" className="bg-white dark:bg-black text-black dark:text-white">Premium</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/80 dark:text-white/80">Base Price (₹)</label>
                  <input required name="basePrice" type="number" min="0" placeholder="1500" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black/80 dark:text-white/80">Registration Fee (₹)</label>
                  <input required name="registrationFee" type="number" min="0" defaultValue="0" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
                  <p className="text-xs text-black/40 dark:text-white/40 mt-1">Set to 0 if not applicable</p>
                </div>
              </div>

              <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-4 mt-8">
                {error && <p className="text-red-500 text-sm mr-auto">{error}</p>}
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors font-medium rounded-lg">
                  Cancel
                </button>
                <button type="submit" disabled={loading}
                  className="px-6 py-2.5 bg-green-500 hover:bg-[#39ff14] disabled:opacity-60 text-black font-semibold rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

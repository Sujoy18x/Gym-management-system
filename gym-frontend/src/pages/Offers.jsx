import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, CheckCircle2, Loader2, AlertTriangle, X } from "lucide-react";
import { getOffers, deleteOffer } from "../services/api";
import AddOfferModal from "../components/AddOfferModal";

// ── Custom delete confirmation dialog ──────────────────────────────────────────
function DeleteConfirmDialog({ offer, onConfirm, onCancel, isDeleting }) {
  if (!offer) return null;
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onCancel}
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
        />
        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-sm bg-white dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.25)] overflow-hidden"
        >
          {/* Red top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

          <button
            onClick={onCancel}
            className="absolute top-4 right-4 p-1.5 rounded-full text-black/40 dark:text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-8 pt-10 pb-8 flex flex-col items-center text-center gap-4">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.3)]">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-black dark:text-white mb-1">Delete Plan?</h3>
              <p className="text-sm text-black/60 dark:text-white/60">
                You are about to permanently delete the{" "}
                <span className="font-semibold text-black dark:text-white">"{offer.title}"</span>{" "}
                plan. This action{" "}
                <span className="text-red-500 font-semibold">cannot be undone</span>.
              </p>
            </div>

            <div className="flex gap-3 w-full mt-2">
              <button
                onClick={onCancel}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-black/10 dark:border-white/10 text-black/80 dark:text-white/80 font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                ) : (
                  "Yes, Delete"
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
// ──────────────────────────────────────────────────────────────────────────────

export default function Offers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Delete state
  const [offerToDelete, setOfferToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const { data } = await getOffers();
      setOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleDeleteClick = (offer) => {
    setDeleteError("");
    setOfferToDelete(offer);
  };

  const handleDeleteConfirm = async () => {
    if (!offerToDelete) return;
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteOffer(offerToDelete._id);
      setOffers(prev => prev.filter(o => o._id !== offerToDelete._id));
      setOfferToDelete(null);
    } catch (err) {
      console.error("Delete offer failed:", err);
      setDeleteError(err.response?.data?.message || "Failed to delete plan. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    if (!isDeleting) setOfferToDelete(null);
  };

  const getTagColor = (tag) => {
    switch (tag) {
      case 'Festive':   return 'bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
      case 'No Reg Fee': return 'bg-green-500/10 text-[#39ff14] border-green-500/20 shadow-[0_0_10px_rgba(57,255,20,0.2)]';
      case 'Couple':    return 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'Premium':   return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.2)]';
      default:          return 'bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border-black/20 dark:border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-10 relative"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-bold text-black dark:text-white mb-2">Pricing &amp; Offers</h1>
          <p className="text-black/60 dark:text-white/60">Manage your subscription tiers and seasonal gym plans.</p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg font-medium shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Plan
        </motion.button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {deleteError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center justify-between"
          >
            <span>{deleteError}</span>
            <button onClick={() => setDeleteError("")}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="flex justify-center items-center py-20 col-span-full">
            <Loader2 className="w-8 h-8 animate-spin text-black/30 dark:text-white/30" />
          </div>
        ) : (
          <AnimatePresence>
            {offers.map((offer, i) => (
              <motion.div
                layout
                key={offer._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, delay: (i % 10) * 0.05 }}
                className="glass p-6 rounded-3xl relative overflow-hidden group border border-black/5 dark:border-white/5 bg-white/70 dark:bg-black/40 hover:border-green-500/30 transition-all flex flex-col hover:shadow-[0_0_30px_rgba(57,255,20,0.1)] hover:-translate-y-1"
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-green-500/10 blur-[50px] pointer-events-none rounded-full" />

                <div className="flex justify-between items-start mb-6 z-10">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTagColor(offer.tag)}`}>
                    {offer.tag}
                  </span>
                  <button
                    onClick={() => handleDeleteClick(offer)}
                    className="text-black/30 hover:text-red-500 dark:text-white/30 dark:hover:text-red-500 p-2 transition-colors rounded-lg bg-black/5 hover:bg-red-500/10 dark:bg-white/5 dark:hover:bg-red-500/10 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title="Delete plan"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-6 z-10 flex-1">
                  <h3 className="text-xl font-bold text-black dark:text-white mb-1">{offer.title}</h3>
                  <p className="text-sm font-medium text-black/50 dark:text-white/50">{offer.duration}</p>

                  <div className="mt-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-black dark:text-white">₹{offer.basePrice.toLocaleString()}</span>
                    </div>

                    {offer.registrationFee > 0 ? (
                      <div className="mt-2 text-sm font-medium text-[#39ff14] bg-green-500/10 inline-block px-3 py-1 rounded-lg border border-green-500/20">
                        + ₹{offer.registrationFee.toLocaleString()} Reg Fee
                      </div>
                    ) : (
                      <div className="mt-2 text-sm font-medium text-black/50 dark:text-white/50 bg-black/5 dark:bg-white/5 inline-block px-3 py-1 rounded-lg border border-black/10 dark:border-white/10">
                        No Reg Fee
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-black/10 dark:border-white/10 z-10 mt-auto">
                  <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    Full Gym Access
                  </div>
                  {offer.tag === 'Couple' && (
                    <div className="flex items-center gap-2 text-sm text-black/70 dark:text-white/70 mt-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      Valid for Two Persons
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Add New Offer Card Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setIsModalOpen(true)}
          className="p-6 rounded-3xl border-2 border-dashed border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex flex-col items-center justify-center cursor-pointer min-h-[350px] group"
        >
          <div className="w-16 h-16 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-red-500/20 transition-all">
            <Plus className="w-8 h-8 text-black/50 dark:text-white/50 group-hover:text-red-500 transition-colors" />
          </div>
          <h3 className="text-lg font-bold text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors">Create Custom Plan</h3>
          <p className="text-sm text-black/40 dark:text-white/40 mt-1 text-center">Deploy a new pricing model instantly</p>
        </motion.div>
      </div>

      <AddOfferModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOfferAdded={fetchOffers}
      />

      {/* Custom Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        offer={offerToDelete}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isDeleting={isDeleting}
      />
    </motion.div>
  );
}

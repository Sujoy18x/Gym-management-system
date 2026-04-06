import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus } from "lucide-react";

export default function InviteStaffModal({ isOpen, onClose, onInvite }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Trainer');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onInvite) {
      onInvite({ name, email, role, status: 'Invited' });
    }
    // Reset fields
    setName('');
    setEmail('');
    setRole('Trainer');
    onClose();
  };

  if (!isOpen) return null;

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
               <UserPlus className="w-5 h-5" /> Invite Staff
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
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Full Name</label>
                <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. John Smith" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Email Address</label>
                <input required value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="john@liftclub.com" className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors placeholder:text-black/30 dark:placeholder:text-white/30" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black/80 dark:text-white/80">Assigned Role</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-lg px-4 py-2.5 outline-none focus:border-green-500/50 transition-colors appearance-none">
                  <option value="Trainer" className="bg-white dark:bg-black text-black dark:text-white">Trainer</option>
                  <option value="Manager" className="bg-white dark:bg-black text-black dark:text-white">Manager</option>
                  <option value="Front Desk" className="bg-white dark:bg-black text-black dark:text-white">Front Desk</option>
                </select>
                <p className="text-xs text-black/50 dark:text-white/50 mt-1 pl-1">This determines their access level in the dashboard.</p>
              </div>

              <div className="pt-6 border-t border-black/10 dark:border-white/10 flex items-center justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 text-black/80 dark:text-white/80 hover:text-black dark:hover:text-white transition-colors font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-500 hover:bg-[#39ff14] text-black font-semibold rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.4)] transition-all transform hover:scale-105"
                >
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

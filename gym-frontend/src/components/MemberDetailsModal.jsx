import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Phone, Activity, CreditCard, User, Clock } from "lucide-react";

export default function MemberDetailsModal({ member, isOpen, onClose }) {
  if (!isOpen || !member) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Panel */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh]"
        >
          {/* Top Decorative Glow based on status */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${
            member.status === 'Active' ? 'bg-gradient-to-r from-green-400 via-[#39ff14] to-green-600' :
            member.status === 'Expired' ? 'bg-gradient-to-r from-red-400 via-red-500 to-red-600' :
            'bg-gradient-to-r from-gray-400 via-gray-500 to-gray-600'
          }`} />
          
          {/* Header section with curve */}
          <div className="relative pt-12 pb-6 px-6 bg-black/5 dark:bg-white/5 border-b border-black/10 dark:border-white/10 flex flex-col items-center">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-black/50 hover:text-red-500 dark:text-white/50 dark:hover:text-red-500 transition-colors rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative">
              <img src={member.image} alt={member.name} className="w-28 h-28 rounded-full border-4 border-white dark:border-black shadow-xl object-cover" />
              <div className={`absolute bottom-0 right-2 w-5 h-5 rounded-full border-2 border-white dark:border-black ${
                member.status === 'Active' ? 'bg-[#39ff14] shadow-[0_0_10px_rgba(57,255,20,0.8)]' :
                member.status === 'Expired' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' :
                'bg-gray-400'
              }`} />
            </div>
            
            <h2 className="text-2xl font-bold text-black dark:text-white mt-4">{member.name}</h2>
            <p className="text-black/50 dark:text-white/50 font-medium mb-3">ID: #{String(member.id || member._id).slice(-6).toUpperCase()}</p>
            
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${
                member.status === 'Active' ? 'bg-green-500/10 text-green-600 dark:text-[#39ff14] border-green-500/20 shadow-[0_0_10px_rgba(57,255,20,0.2)]' :
                member.status === 'Expired' ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                'bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60 border-black/20 dark:border-white/20'
            }`}>
              {member.status} Member
            </span>
          </div>

          {/* Details Scrollable Area */}
          <div className="p-6 overflow-y-auto w-full custom-scrollbar flex flex-col gap-6">
            
            {/* Grid 1: Personal Info */}
            <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/10 dark:border-white/10">
              <h3 className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider mb-4">Personal Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-black/40 dark:text-white/40 mt-0.5" />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Demographics</p>
                    <p className="font-semibold text-black dark:text-white">{member.age} yrs • {member.gender}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-black/40 dark:text-white/40 mt-0.5" />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Date of Birth</p>
                    <p className="font-semibold text-black dark:text-white">{member.dob}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 col-span-2 mt-2">
                  <Phone className="w-5 h-5 text-black/40 dark:text-white/40 mt-0.5" />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Contact Number</p>
                    <p className="font-semibold text-black dark:text-white">{member.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 2: Membership Info */}
            <div className="bg-black/5 dark:bg-white/5 p-5 rounded-2xl border border-black/10 dark:border-white/10">
              <h3 className="text-xs font-bold text-black/40 dark:text-white/40 uppercase tracking-wider mb-4">Membership Package</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="w-5 h-5 text-black/40 dark:text-white/40 mt-0.5" />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Current Plan</p>
                    <p className="font-semibold text-black dark:text-white">{member.plan}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Activity className="w-5 h-5 text-black/40 dark:text-white/40 mt-0.5" />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Join Date</p>
                    <p className="font-semibold text-black dark:text-white">{member.joinDate}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 col-span-2 mt-2">
                  <Clock className={`w-5 h-5 mt-0.5 ${member.status === 'Expired' ? 'text-red-500' : 'text-black/40 dark:text-white/40'}`} />
                  <div>
                    <p className="text-xs text-black/50 dark:text-white/50">Expiration Date</p>
                    <p className={`font-semibold ${member.status === 'Expired' ? 'text-red-500' : 'text-black dark:text-white'}`}>
                      {member.expiryDate} 
                      {member.status === 'Expired' && <span className="text-xs ml-2 uppercase font-bold tracking-wider">(Past Due)</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
          
          <div className="p-6 border-t border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 flex justify-end">
             <button
                onClick={onClose}
                className="px-6 py-2.5 bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-black dark:text-white transition-colors font-medium rounded-lg w-full sm:w-auto"
              >
                Close Profile
              </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

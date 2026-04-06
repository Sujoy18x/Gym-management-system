import { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, KeyRound, Mail, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("admin@liftclub.com");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  
  // 2FA state
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState("");
  const [code, setCode] = useState("");
  const [phoneMasked, setPhoneMasked] = useState("");
  const [demoCode, setDemoCode] = useState("");

  const { login, verify2falogin, authError, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLocalError("");
    const result = await login(email, password);
    if (result.success) {
      if (result.requires2FA) {
        setTempToken(result.tempToken);
        setPhoneMasked(result.phoneMasked);
        setDemoCode(result.demoCode);
        setStep(2);
      } else {
        navigate("/");
      }
    } else {
      setLocalError(result.message);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setLocalError("");
    const result = await verify2falogin(tempToken, code);
    if (result.success) {
      navigate("/");
    } else {
      setLocalError(result.message);
    }
  };

  const errorMsg = localError || authError;

  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-red-500/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#39ff14]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 md:p-10 rounded-3xl border border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/40 shadow-2xl backdrop-blur-xl">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-black dark:bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(57,255,20,0.3)] transform -rotate-6">
              <span className="text-[#39ff14] text-3xl font-black italic">LC</span>
            </div>
            <h1 className="text-3xl font-black text-black dark:text-white uppercase tracking-tight">Lift Club</h1>
            <p className="text-black/60 dark:text-white/60 font-medium mt-1">Authorized Access Only</p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-black/80 dark:text-white/80 uppercase tracking-wider">Admin Email</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@liftclub.com"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-[#39ff14]/50 focus:bg-white dark:focus:bg-black transition-all font-medium placeholder:text-black/30 dark:placeholder:text-white/30" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black/80 dark:text-white/80 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black/40 dark:text-white/40">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl pl-12 pr-4 py-4 outline-none focus:border-[#39ff14]/50 focus:bg-white dark:focus:bg-black transition-all font-medium placeholder:text-black/30 dark:placeholder:text-white/30" 
                  />
                </div>
              </div>

              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Authenticating...</>
                ) : (
                  <><LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> Sign In</>
                )}
              </button>
            </form>
          ) : (
            <motion.form initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleVerify2FA} className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-sm text-black/70 dark:text-white/70 mb-2">
                  We sent a 6-digit verification code to the number ending in <strong className="text-black dark:text-white">**{phoneMasked}</strong>.
                </p>
                {demoCode && (
                  <div className="inline-block px-3 py-1.5 bg-[#39ff14]/10 border border-[#39ff14]/30 rounded-lg text-[#00ff00] text-xs font-bold tracking-widest mt-2 shadow-[0_0_10px_rgba(57,255,20,0.1)]">
                    [DEMO] MOCK SMS CODE: {demoCode}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-black/80 dark:text-white/80 uppercase tracking-wider text-center block">Enter 6-Digit Code</label>
                <input 
                  type="text" 
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center text-3xl tracking-[10px] bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-black dark:text-white rounded-xl py-4 outline-none focus:border-[#39ff14]/50 focus:bg-white dark:focus:bg-black transition-all font-black placeholder:text-black/30 dark:placeholder:text-white/30" 
                />
              </div>

              {errorMsg && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full py-4 mt-4 bg-[#39ff14] hover:bg-green-400 text-black disabled:opacity-60 disabled:cursor-not-allowed font-black uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & Enter <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                )}
              </button>
              
              <button 
                type="button"
                onClick={() => { setStep(1); setCode(""); }}
                className="w-full mt-2 py-2 text-xs font-bold text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white uppercase tracking-wider transition-colors"
               >
                Back to Login
              </button>
            </motion.form>
          )}

        </div>
      </motion.div>
    </div>
  );
}

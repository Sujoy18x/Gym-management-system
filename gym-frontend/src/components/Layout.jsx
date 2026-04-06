import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import bannerImg from "../assets/banner.png";

export default function Layout() {
  return (
    <div className="flex bg-neutral-100 dark:bg-black min-h-screen relative overflow-hidden text-black dark:text-white transition-colors duration-300">
      {/* Background Particles/Glow Effects */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-600/5 dark:bg-red-600/10 blur-[150px] rounded-full pointer-events-none transition-colors duration-300" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 dark:bg-[#39ff14]/5 blur-[120px] rounded-full pointer-events-none transition-colors duration-300" />
      
      <Sidebar />
      <div className="ml-64 flex-1 flex flex-col min-h-screen z-10 w-[calc(100%-16rem)] relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto w-full flex flex-col items-center">
          <div className="w-full h-48 md:h-64 lg:h-80 relative overflow-hidden flex-shrink-0">
            <img src={bannerImg} alt="Site Banner" className="w-full h-full object-cover border-b border-black/10 dark:border-white/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
          </div>
          <div className="w-full max-w-7xl mx-auto p-8 flex-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { 
  Wifi, 
  Battery, 
  Signal, 
  Smartphone, 
  Monitor, 
  Maximize, 
  BookOpen, 
  GraduationCap
} from "lucide-react";

interface AndroidFrameProps {
  children: React.ReactNode;
}

export default function AndroidFrame({ children }: AndroidFrameProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sysTime, setSysTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // 12 instead of 0
      setSysTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F4FA] flex flex-col items-center justify-start p-2 sm:p-6 transition-all duration-300">
      {/* Top Controller Bar - Polished Studio Nexus Utility */}
      <div className="w-full max-w-md bg-white border border-[#D9E3F3] rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-tight text-[#121C28]">
              Study Tutor Mobile
            </h1>
            <p className="text-xs text-[#6D7A8A]">
              Interactive Android App Companion
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFBFD] hover:bg-[#F0F4FA] text-xs font-semibold text-blue-600 border border-[#D9E3F3] rounded-xl transition-all"
          title={isFullscreen ? "Switch to Phone Mockup View" : "Maximize Screen View"}
        >
          {isFullscreen ? (
            <>
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Mobile Nest</span>
            </>
          ) : (
            <>
              <Monitor className="w-4 h-4 text-blue-600" />
              <span>Full Screen</span>
            </>
          )}
        </button>
      </div>

      {/* Main Container */}
      {isFullscreen ? (
        /* Fullscreen Web App View */
        <div className="w-full max-w-5xl bg-white border border-[#D9E3F3] rounded-3xl h-[86vh] overflow-hidden flex flex-col shadow-sm">
          {children}
        </div>
      ) : (
        /* Highly Realistic Pixel Mockup Frame */
        <div className="relative mx-auto w-full max-w-[400px] h-[820px] bg-[#121C28] rounded-[52px] p-3.5 shadow-2xl border-4 border-[#121C28]/95 overflow-hidden ring-12 ring-[#BAC8D9]/20">
          
          {/* Speaker, Front Camera and Sensor Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6.5 bg-[#121C28] rounded-b-[20px] z-50 flex items-center justify-center gap-3 px-4">
            <div className="w-12 h-1 bg-neutral-800 rounded-full" />
            <div className="w-3.5 h-3.5 bg-neutral-900 rounded-full border border-neutral-700/50 flex items-center justify-center">
              <div className="w-1 h-0.5 bg-blue-900/60 rounded-full" />
            </div>
          </div>

          {/* Volume and Power Buttons */}
          <div className="absolute right-0 top-32 w-[3px] h-14 bg-neutral-800 rounded-l cursor-pointer hover:bg-neutral-700" />
          <div className="absolute right-0 top-48 w-[3px] h-10 bg-neutral-800 rounded-l cursor-pointer hover:bg-neutral-700" />

          {/* Simulated Inner Android Area */}
          <div className="relative w-full h-full bg-white rounded-[38px] overflow-hidden flex flex-col shadow-inner">
            
            {/* Android Status Bar */}
            <div className="bg-[#FAFBFD] px-6 pt-7 pb-1.5 flex justify-between items-center text-[#121C28] text-xs font-semibold select-none z-40">
              {/* Left Content: Live Clock */}
              <span className="font-display tracking-tight">{sysTime}</span>

              {/* Right Content: Wifi, Connection, and Battery level */}
              <div className="flex items-center gap-1.5 text-[#121C28]">
                <Signal className="w-3.5 h-3.5 stroke-[2.5]" />
                <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-bold">100%</span>
                  <Battery className="w-4 h-4 fill-current stroke-[2]" />
                </div>
              </div>
            </div>

            {/* Live Client App Sandbox */}
            <div className="flex-1 overflow-hidden flex flex-col bg-[#FAFBFD]">
              {children}
            </div>

            {/* Android Bottom Navigation Gestures */}
            <div className="bg-[#FAFBFD] pb-3 pt-1 flex justify-center items-center z-40 select-none">
              <div className="w-28 h-1 bg-[#121C28]/80 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

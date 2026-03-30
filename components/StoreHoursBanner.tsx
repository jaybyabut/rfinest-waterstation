"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function StoreHoursBanner() {
  const [isOpen, setIsOpen] = useState(true);
  const [todaySchedule, setTodaySchedule] = useState("");

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();
      const day = now.getDay(); 
      const hour = now.getHours();
      const minutes = now.getMinutes();
      
      const currentTime = hour + minutes / 60;

      if (day === 0) {
        setTodaySchedule("6:00 AM - 12:00 PM");
        setIsOpen(currentTime >= 6 && currentTime < 12);
      } else {
        setTodaySchedule("6:30 AM - 6:00 PM");
        setIsOpen(currentTime >= 6.5 && currentTime < 18);
      }
    };

    checkStoreStatus();
    
    const interval = setInterval(checkStoreStatus, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-3 mb-8">
      
      {/* STATUS BADGE - Fixed for tiny screens */}
      <div className="bg-[#e8eef1]/60 p-3 sm:p-4 rounded-[20px] flex flex-col sm:flex-row items-center justify-center border-2 border-[#1e3d58]/10 shadow-sm gap-1 sm:gap-2 text-center">
        <div className="flex items-center justify-center gap-1.5">
          <Clock size={16} strokeWidth={2.5} className="text-[#1e3d58]" />
          <span className="font-bold text-xs sm:text-sm text-[#1e3d58]">Today's Hours:</span>
        </div>
        <span className="font-black text-[#43b0f1] text-xs sm:text-sm">
          {todaySchedule}
        </span>
      </div>

      {/* LATE ORDER WARNING PROMPT */}
      {!isOpen && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-[20px] flex items-start gap-3 text-left shadow-sm animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={24} strokeWidth={2.5} />
          <div>
            <h3 className="text-amber-800 font-black text-sm sm:text-base leading-tight mb-1">
              Station is currently closed.
            </h3>
            <p className="text-amber-700 text-xs sm:text-sm font-medium leading-snug">
              You can still place an order, but it will be processed and delivered <span className="font-bold">tomorrow morning</span>.
            </p>
          </div>
        </div>
      )}
      
    </div>
  );
}

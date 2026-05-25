"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";

export default function StoreHoursBanner() {
  const [todaySchedule, setTodaySchedule] = useState("");
  const [cutoffText, setCutoffText] = useState("");
  const [noticeType, setNoticeType] = useState<"none" | "lunch" | "cutoff" | "closed">("none");

  useEffect(() => {
    const checkStoreStatus = () => {
      const now = new Date();
      const day = now.getDay(); 
      const hour = now.getHours();
      const minutes = now.getMinutes();
      const currentTime = hour + minutes / 60;

      // SUNDAY LOGIC
      if (day === 0) {
        setTodaySchedule("6:00 AM - 12:00 PM");
        setCutoffText("We will accept orders until 10:00 AM");
        
        if (currentTime < 6) {
          setNoticeType("closed");
        } else if (currentTime >= 10) {
          // Sunday cut-off is 11 AM
          setNoticeType("cutoff");
        } else {
          setNoticeType("none");
        }
      } 
      // MONDAY - SATURDAY LOGIC
      else {
        setTodaySchedule("6:30 AM - 6:00 PM");
        setCutoffText("We will accept orders until 4:00 PM");
        
        if (currentTime < 6.5) {
          setNoticeType("closed");
        } else if (currentTime >= 12 && currentTime < 13) {
          // Lunch break from 12:00 PM to 1:00 PM
          setNoticeType("lunch");
        } else if (currentTime >= 16) {
          // Mon-Sat cut-off is 4:00 PM (16:00)
          setNoticeType("cutoff");
        } else {
          setNoticeType("none");
        }
      }
    };

    checkStoreStatus();
    
    // Mag-u-update every minute para accurate sa live time
    const interval = setInterval(checkStoreStatus, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full space-y-3 mb-8">
      
      {/* STATUS BADGE WITH SUBTEXT */}
      <div className="bg-[#e8eef1]/60 p-3 sm:p-4 rounded-[20px] flex flex-col items-center justify-center border-2 border-[#1e3d58]/10 shadow-sm text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <Clock size={16} strokeWidth={2.5} className="text-[#1e3d58]" />
            <span className="font-bold text-xs sm:text-sm text-[#1e3d58]">Today's Hours:</span>
          </div>
          <span className="font-black text-[#43b0f1] text-xs sm:text-sm">
            {todaySchedule}
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-[#1e3d58]/60 mt-1 sm:mt-0.5">
          {cutoffText}
        </span>
      </div>

      {/* DYNAMIC NOTICES (LUNCH / CUTOFF / CLOSED) */}
      {noticeType !== "none" && (
        <div className="bg-amber-50 border-2 border-amber-400 p-4 rounded-[20px] flex items-start gap-3 text-left shadow-sm animate-in fade-in slide-in-from-top-2">
          {noticeType === "lunch" ? (
            <Clock className="text-amber-600 shrink-0 mt-0.5" size={24} strokeWidth={2.5} />
          ) : (
            <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={24} strokeWidth={2.5} />
          )}
          
          <div>
            {noticeType === "lunch" && (
              <>
                <h3 className="text-amber-800 font-black text-sm sm:text-base leading-tight mb-1">
                  Employees are on lunch break.
                </h3>
                <p className="text-amber-700 text-xs sm:text-sm font-medium leading-snug">
                  You can still place an order, and the process will continue at <span className="font-bold">1:00 PM</span>.
                </p>
              </>
            )}

            {noticeType === "cutoff" && (
              <>
                <h3 className="text-amber-800 font-black text-sm sm:text-base leading-tight mb-1">
                  Orders for today are now cut off.
                </h3>
                <p className="text-amber-700 text-xs sm:text-sm font-medium leading-snug">
                  Sorry, you can still place an order but it will be processed and delivered <span className="font-bold">tomorrow morning</span>.
                </p>
              </>
            )}

            {noticeType === "closed" && (
              <>
                <h3 className="text-amber-800 font-black text-sm sm:text-base leading-tight mb-1">
                  Station is currently closed.
                </h3>
                <p className="text-amber-700 text-xs sm:text-sm font-medium leading-snug">
                  You can still place an order, but it will be processed and delivered <span className="font-bold">tomorrow morning</span>.
                </p>
              </>
            )}
          </div>
        </div>
      )}
      
    </div>
  );
}

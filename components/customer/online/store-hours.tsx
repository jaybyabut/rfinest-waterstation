"use client";

import Link from "next/link";
import { ChevronLeft, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const SCHEDULE = [
  { day: "Monday", hours: "6:30 AM - 6:00 PM" },
  { day: "Tuesday", hours: "6:30 AM - 6:00 PM" },
  { day: "Wednesday", hours: "6:30 AM - 6:00 PM" },
  { day: "Thursday", hours: "6:30 AM - 6:00 PM" },
  { day: "Friday", hours: "6:30 AM - 6:00 PM" },
  { day: "Saturday", hours: "6:30 AM - 6:00 PM" },
  { day: "Sunday", hours: "6:00 AM - 12:00 PM" },
];

export default function StoreHoursPage() {
  const [currentDay, setCurrentDay] = useState("");

  useEffect(() => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    setCurrentDay(days[new Date().getDay()]);
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in slide-in-from-right-8 duration-300 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">
        
        {/* OUTER CONTAINER - Same as Home */}
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl overflow-hidden">

          {/* HEADER SECTION - Matched sizing with Home & Order pages */}
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/home" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Store Hours
            </h1>
          </div>

          {/* INNER CONTAINER - Same as Home */}
          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 w-full overflow-hidden text-left">
            
            <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b-2 border-dashed border-gray-200">
              <div className="w-16 h-16 bg-[#e8eef1] rounded-full flex items-center justify-center text-[#43b0f1] shadow-inner shrink-0">
                <Clock size={32} strokeWidth={2.5} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[#1e3d58] font-black text-2xl sm:text-3xl tracking-tight leading-none truncate">RFinest</h2>
                <p className="text-gray-500 font-bold text-xs sm:text-sm tracking-widest uppercase mt-1">Operating Hours</p>
              </div>
            </div>

            <div className="space-y-3 w-full">
              {SCHEDULE.map((item) => {
                const isToday = currentDay === item.day;
                
                return (
                  <div 
                    key={item.day} 
                    className={cn(
                      "flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-[20px] transition-colors border-2 gap-1 sm:gap-0",
                      isToday 
                        ? 'bg-[#43b0f1] text-white shadow-md border-[#43b0f1]' 
                        : 'bg-[#e8eef1]/40 text-[#1e3d58] border-transparent hover:bg-[#e8eef1]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className={cn("text-base sm:text-lg font-bold", isToday ? 'text-white' : 'text-[#1e3d58]')}>
                        {item.day}
                      </span>
                      {isToday && (
                        <span className="text-[10px] sm:text-xs bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-black shrink-0">
                          Today
                        </span>
                      )}
                    </div>
                    <span className={cn("text-sm sm:text-base font-black tracking-wide", isToday ? 'text-white' : 'text-[#43b0f1]')}>
                      {item.hours}
                    </span>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
} 

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, CalendarClock, User, Tag, ArrowUp } from "lucide-react";
import { getActivityLogs } from "@/app/actions/getActivityLogs";

interface ActivityLog {
  id: number;
  timestamp: string;
  user_name: string;
  activity: string;
}

export default function ActivityLogs() {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setGlobalError(null);

      try {
        const { logs: fetchedLogs, error } = await getActivityLogs();
        if (error) {
          setGlobalError(error);
        } else if (fetchedLogs) {
          setLogs(fetchedLogs.map((log: any) => ({
            id: log.id,
            timestamp: log.created_at,
            user_name: log.user_name || "Unknown User",
            activity: log.activity || ""
          })));
        }
      } catch (error) {
        console.error(error);
        setGlobalError("Failed to load activity logs. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    const handleWindowScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">

          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Activity <br className="sm:hidden" /> Logs
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left relative min-h-[500px]">

            {globalError && (
              <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            <div className="space-y-4 pb-4">
              {loading ? (
                <div className="space-y-4 w-full animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-[#e8eef1] rounded-[25px] p-4 sm:p-5 border border-[#1e3d58]/10 shadow-sm">
                      <div className="flex justify-between items-start mb-3 border-b border-white/50 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                          <div className="h-3 w-32 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                          <div className="h-5 w-20 bg-slate-300 rounded"></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full bg-slate-300"></div>
                          <div className="h-4 w-24 bg-slate-300 rounded"></div>
                        </div>
                      </div>
                      <div className="mt-4 border-2 border-[#cdd9e0] rounded-[15px] bg-white p-3 shadow-sm h-[72px] w-full flex flex-col gap-2 justify-center">
                        <div className="h-3 w-full bg-slate-200 rounded"></div>
                        <div className="h-3 w-2/3 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-center py-20 font-bold text-gray-400 italic">
                  No logs found.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="bg-[#e8eef1] rounded-[25px] p-4 sm:p-5 border border-[#1e3d58]/10 shadow-sm">

                    <div className="flex justify-between items-start mb-3 border-b border-white/50 pb-3">
                      <div className="flex items-center gap-2 text-[#1e3d58]">
                        <CalendarClock size={16} strokeWidth={3} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} • {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Tag size={16} className="text-[#43b0f1] shrink-0" />
                        <span className="text-lg font-black text-[#1e3d58] leading-tight">Activity</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-bold text-gray-500">{log.user_name}</span>
                      </div>
                    </div>

                    <div className="mt-4 border-2 border-[#cdd9e0] rounded-[15px] bg-white p-3 text-sm font-bold text-[#1e3d58] leading-snug shadow-sm">
                      {log.activity}
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}

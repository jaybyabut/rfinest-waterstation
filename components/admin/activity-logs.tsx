"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, CalendarClock, User, Tag } from "lucide-react";
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
  }, []);

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter w-full text-center px-12 leading-[0.9]">
              Activity <br className="sm:hidden" /> Logs
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-4 relative min-h-[500px]">
            
            {globalError && (
              <div className="mb-2 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            {loading && !globalError && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-[40px]">
                 <span className="text-[#1e3d58] font-bold text-lg animate-pulse">Loading logs...</span>
              </div>
            )}

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-4">
              {!loading && logs.length === 0 ? (
                <div className="text-center py-10 font-bold text-gray-400">
                  No logs found.
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="bg-[#e8eef1] rounded-[25px] p-4 sm:p-5 border border-gray-200 shadow-sm">
                    
                    <div className="flex justify-between items-start mb-3 border-b border-gray-300 pb-3">
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

                    <div className="mt-4 border border-black rounded-[15px] bg-white p-3 text-sm font-bold text-[#1e3d58] leading-snug">
                      {log.activity}
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

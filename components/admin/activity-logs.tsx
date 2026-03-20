"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, CalendarClock, User, Tag } from "lucide-react";

interface ActivityLog {
  id: string;
  timestamp: string;
  user_name: string;
  role: "Admin" | "Employee";
  action: string;
  details: string;
}

export default function ActivityLogs() {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [roleFilter, setRoleFilter] = useState<"All" | "Admin" | "Employee">("All");

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setGlobalError(null);

      try {
        // TODO: BACKEND - Fetch actual logs from the 'activity_logs' database table here.
        await new Promise((resolve) => setTimeout(resolve, 800)); 

        const dummyLogs: ActivityLog[] = [
          { id: "LOG-101", timestamp: "2024-03-20T08:15:00", user_name: "Juan Employee", role: "Employee", action: "Logged In", details: "Started shift via Tablet Kiosk" },
          { id: "LOG-102", timestamp: "2024-03-20T08:45:22", user_name: "Juan Employee", role: "Employee", action: "Updated Order", details: "Order ORD-9912 marked as 'Processing'" },
          { id: "LOG-103", timestamp: "2024-03-20T09:10:05", user_name: "Maria Admin", role: "Admin", action: "Updated Price", details: "Changed Zone 'Bulaon' price from ₱30 to ₱35" },
          { id: "LOG-104", timestamp: "2024-03-20T10:05:11", user_name: "Juan Employee", role: "Employee", action: "Cancelled Order", details: "Order ORD-9915 cancelled (Customer requested)" },
        ];
        
        setLogs(dummyLogs);
      } catch (error) {
        console.error(error);
        setGlobalError("Failed to load activity logs. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const filteredLogs = roleFilter === "All" ? logs : logs.filter(log => log.role === roleFilter);

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

            <div className="bg-[#e8eef1] rounded-[20px] p-1.5 flex gap-1 mb-6">
              {(["All", "Admin", "Employee"] as const).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleFilter(role)}
                  className={`flex-1 py-2.5 rounded-[15px] text-xs font-black uppercase tracking-wider transition-all ${
                    roleFilter === role 
                      ? "bg-[#1e3d58] text-white shadow-md" 
                      : "text-[#1e3d58]/60 hover:text-[#1e3d58]"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-4">
              {!loading && filteredLogs.length === 0 ? (
                <div className="text-center py-10 font-bold text-gray-400">
                  No logs found.
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="bg-[#e8eef1] rounded-[25px] p-4 sm:p-5 border border-gray-200 shadow-sm">
                    
                    <div className="flex justify-between items-start mb-3 border-b border-gray-300 pb-3">
                      <div className="flex items-center gap-2 text-[#1e3d58]">
                        <CalendarClock size={16} strokeWidth={3} />
                        <span className="text-xs font-black uppercase tracking-widest">
                          {new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} • {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                        log.role === 'Admin' ? 'bg-purple-200 text-purple-700' : 'bg-blue-200 text-blue-700'
                      }`}>
                        {log.role}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Tag size={16} className="text-[#43b0f1] shrink-0" />
                        <span className="text-lg font-black text-[#1e3d58] leading-tight">{log.action}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User size={16} className="text-gray-400 shrink-0" />
                        <span className="text-sm font-bold text-gray-500">{log.user_name}</span>
                      </div>
                    </div>

                    <div className="mt-4 border border-black rounded-[15px] bg-white p-3 text-sm font-bold text-[#1e3d58] leading-snug">
                      {log.details}
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

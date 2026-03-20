"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AnalyticsAndReports() {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [selectedMonth, setSelectedMonth] = useState("");

  // TODO: BACKEND - Fetch daily stats from database (orders table)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gallons, setGallons] = useState({
    slim: 0,
    round: 0,
    total: 0,
  });

  // TODO: BACKEND - Fetch earnings breakdown
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [earnings, setEarnings] = useState({
    walkIn: 0,
    online: 0,
    cash: 0,
    eBank: 0,
    total: 0,
  });

  // TODO: BACKEND - Fetch monthly aggregation based on selectedMonth
  const [monthlyStats, setMonthlyStats] = useState({
    month: "Loading...",
    days: 0,
    earnings: 0,
  });

  useEffect(() => {
    if (!selectedMonth) {
      const now = new Date();
      setSelectedMonth(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
      return;
    }

    const fetchAnalytics = async () => {
      setLoading(true);
      setGlobalError(null);

      try {
        // TODO: BACKEND - Implement actual API call here passing selectedMonth
        await new Promise((resolve) => setTimeout(resolve, 800)); 

        const dateObj = new Date(selectedMonth + "-01");
        const monthName = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
        const daysInMonth = new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0).getDate();

        setMonthlyStats({
          month: monthName,
          days: daysInMonth,
          earnings: Math.floor(Math.random() * 50000) + 10000, 
        });

      } catch (error) {
        console.error(error);
        setGlobalError("Failed to load analytics data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedMonth]);

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter w-full text-center px-12">
            Analytics & Report
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 shadow-inner border border-gray-100 text-left space-y-8 relative">
            
            {globalError && (
              <div className="mb-2 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            {loading && !globalError && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex items-center justify-center rounded-[40px]">
                 <span className="text-[#1e3d58] font-bold text-lg animate-pulse">Loading data...</span>
              </div>
            )}

            <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
              <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-6 tracking-tight">Today&apos;s Summary</h2>
             
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1e3d58] text-center mb-3">Gallons Processed:</h3>
                <div className="border border-black rounded-[20px] bg-white p-4 space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xl text-[#1e3d58]">Slim:</span>
                    <span className="text-2xl font-medium text-[#1e3d58]">{gallons.slim}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xl text-[#1e3d58]">Round:</span>
                    <span className="text-2xl font-medium text-[#1e3d58]">{gallons.round}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 pt-2 border-t border-gray-300">
                    <span className="text-xl font-bold text-[#1e3d58]">Total:</span>
                    <span className="text-2xl font-bold text-[#43b0f1]">{gallons.total}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1e3d58] text-center mb-3">Earnings:</h3>
                <div className="border border-black rounded-[20px] bg-white p-4 space-y-2">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg text-[#1e3d58]">Walk-in:</span>
                    <span className="text-xl font-medium text-[#1e3d58]">₱{earnings.walkIn}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg text-[#1e3d58]">Online:</span>
                    <span className="text-xl font-medium text-[#1e3d58]">₱{earnings.online}</span>
                  </div>
                  <div className="w-full h-px bg-gray-200 my-2"></div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg text-[#1e3d58]">Cash:</span>
                    <span className="text-xl font-medium text-[#1e3d58]">₱{earnings.cash}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg text-[#1e3d58]">E-bank:</span>
                    <span className="text-xl font-medium text-[#1e3d58]">₱{earnings.eBank}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 pt-3 mt-1 border-t border-gray-300">
                    <span className="text-xl font-bold text-[#1e3d58]">Total:</span>
                    <span className="text-2xl font-bold text-[#43b0f1]">₱{earnings.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
              <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-4 tracking-tight">Monthly Earnings:</h2>
              <h3 className="text-3xl font-bold text-[#43b0f1] text-center mb-4">{monthlyStats.month}</h3>
              
              <div className="mb-4">
                <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Number of days:</p>
                <div className="border border-black rounded-[20px] bg-white py-3 text-center">
                  <span className="text-3xl text-[#43b0f1]">{monthlyStats.days}</span>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Earnings:</p>
                <div className="border border-black rounded-[20px] bg-white py-3 text-center">
                  <span className="text-3xl text-[#43b0f1]">₱{monthlyStats.earnings.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-center relative w-full h-14">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button className="absolute inset-0 w-3/4 mx-auto h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 pointer-events-none">
                  Select Month
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

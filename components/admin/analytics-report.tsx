"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ArrowUp } from "lucide-react";

export default function AnalyticsAndReports() {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // TODO: BACKEND - Fetch daily stats from database (orders table)
  const [gallons, setGallons] = useState({
    slim: 0,
    round: 0,
    total: 0,
  });

  // TODO: BACKEND - Fetch earnings breakdown
  const [earnings, setEarnings] = useState({
    walkIn: 0,
    online: 0,
    cash: 0,
    eBank: 0,
    total: 0,
  });

  const [monthlyStats, setMonthlyStats] = useState({
    month: "Loading...",
    days: 0,
    earnings: 0,
  });

  useEffect(() => {
    const handleWindowScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        const response = await getAnalyticsData(selectedMonth);

        if (!response.success || !response.data) {
          throw new Error(response.error || "Unknown error fetching data");
        }

        setGallons(response.data.today.gallons);
        setEarnings(response.data.today.earnings);

        const [yearStr, monthStr] = selectedMonth.split('-');
        const year = parseInt(yearStr);
        const monthIndex = parseInt(monthStr) - 1;

        const dateObj = new Date(year, monthIndex, 1);
        const monthName = dateObj.toLocaleString("default", { month: "long", year: "numeric" });
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

        setMonthlyStats({
          month: monthName,
          days: daysInMonth,
          earnings: response.data.monthly.earnings,
        });

        console.log("Analytics data fetched successfully:", response.data);

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
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter w-full text-center px-12 leading-tight">
              Analytics & <br className="sm:hidden" /> Report
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-6 relative min-h-[400px]">

            {globalError && (
              <div className="mb-2 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            {loading && !globalError && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[40px]">
                <span className="text-[#1e3d58] font-black text-lg animate-pulse">Loading data...</span>
              </div>
            )}

            <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
              <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-6 tracking-tight">Today&apos;s Summary</h2>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-[#1e3d58] text-center mb-3">Gallons Processed:</h3>
                <div className="border-2 border-[#1e3d58]/20 rounded-[20px] bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xl font-medium text-[#1e3d58]">Slim:</span>
                    <span className="text-2xl font-black text-[#1e3d58]">{gallons.slim}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-xl font-medium text-[#1e3d58]">Round:</span>
                    <span className="text-2xl font-black text-[#1e3d58]">{gallons.round}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 pt-2 border-t-2 border-[#e8eef1]">
                    <span className="text-xl font-black text-[#1e3d58]">Total:</span>
                    <span className="text-2xl font-black text-[#43b0f1]">{gallons.total}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-[#1e3d58] text-center mb-3">Earnings:</h3>
                <div className="border-2 border-[#1e3d58]/20 rounded-[20px] bg-white p-4 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg font-medium text-[#1e3d58]">Walk-in:</span>
                    <span className="text-xl font-bold text-[#1e3d58]">₱{earnings.walkIn}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg font-medium text-[#1e3d58]">Online:</span>
                    <span className="text-xl font-bold text-[#1e3d58]">₱{earnings.online}</span>
                  </div>
                  <div className="w-full h-0.5 bg-[#e8eef1] my-2"></div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg font-medium text-[#1e3d58]">Cash:</span>
                    <span className="text-xl font-bold text-[#1e3d58]">₱{earnings.cash}</span>
                  </div>
                  <div className="flex justify-between items-center px-4">
                    <span className="text-lg font-medium text-[#1e3d58]">E-bank:</span>
                    <span className="text-xl font-bold text-[#1e3d58]">₱{earnings.eBank}</span>
                  </div>
                  <div className="flex justify-between items-center px-4 pt-3 mt-1 border-t-2 border-[#e8eef1]">
                    <span className="text-xl font-black text-[#1e3d58]">Total:</span>
                    <span className="text-2xl font-black text-[#43b0f1]">₱{earnings.total}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
              <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-2 tracking-tight">Monthly Earnings:</h2>
              <h3 className="text-2xl font-black text-[#43b0f1] text-center mb-6">{monthlyStats.month}</h3>

              <div className="mb-4">
                <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Number of days:</p>
                <div className="border-2 border-[#1e3d58]/20 rounded-[20px] bg-white py-3 text-center shadow-sm">
                  <span className="text-3xl font-black text-[#43b0f1]">{monthlyStats.days}</span>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Earnings:</p>
                <div className="border-2 border-[#1e3d58]/20 rounded-[20px] bg-white py-3 text-center shadow-sm">
                  <span className="text-3xl font-black text-[#43b0f1]">₱{monthlyStats.earnings.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-center relative w-full h-14">
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <Button className="absolute inset-0 w-full max-w-[200px] mx-auto h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-white shadow-md hover:bg-[#1e3d58] transition-all pointer-events-none active:scale-95">
                  Select Month
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}
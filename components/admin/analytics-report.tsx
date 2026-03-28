"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X, ArrowUp, Download } from "lucide-react";
import { getAnalyticsData } from "@/app/actions/getReport";
import { getOrdersForExport } from "@/app/actions/getOrdersForExport";

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AnalyticsAndReports() {
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [selectedMonth, setSelectedMonth] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempYear, setTempYear] = useState(2026);
  const [tempMonth, setTempMonth] = useState(1);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [gallons, setGallons] = useState({
    slim: 0,
    round: 0,
    total: 0,
  });

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

      } catch (error) {
        console.error(error);
        setGlobalError("Failed to load analytics data. Please try refreshing.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [selectedMonth]);

  const handleOpenModal = () => {
    if (selectedMonth) {
      const [yearStr, monthStr] = selectedMonth.split('-');
      setTempYear(parseInt(yearStr));
      setTempMonth(parseInt(monthStr));
    } else {
      const now = new Date();
      setTempYear(now.getFullYear());
      setTempMonth(now.getMonth() + 1);
    }
    setIsModalOpen(true);
  };

  const handleConfirmMonth = () => {
    const formatted = `${tempYear}-${String(tempMonth).padStart(2, '0')}`;
    setSelectedMonth(formatted);
    setIsModalOpen(false);
  };

  // ================= EXPORT TO CSV LOGIC =================
 const handleExportToCSV = async () => {
    if (!selectedMonth) return;
    setIsExporting(true);

    try {
      // TINAWAG NA NATIN YUNG TOTOONG DATABASE DATA!
      const orders = await getOrdersForExport(selectedMonth);
      
      if (!orders || orders.length === 0) {
        alert("No orders found for this month to export.");
        setIsExporting(false);
        return;
      }

      // 1. Setup the CSV Header
      const headers = ["Order ID", "Date", "Customer Name", "Zone", "Slim Gallons", "Round Gallons", "Total Amount (PHP)", "Type", "Payment Mode", "Status"];
      
      // 2. Map the data rows
      const rows = orders.map((order: any) => [
        order.id,
        order.date,
        `"${order.name}"`, // Encapsulate in quotes in case of commas in names
        order.zone,
        order.slim,
        order.round,
        order.total,
        order.type,
        order.payment,
        order.status
      ]);

      // 3. Combine headers and rows with newlines
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      // 4. Create a Blob and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Sales_Report_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export data. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };
  // =======================================================

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">

          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Sales Report
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 shadow-inner border border-gray-100 text-left space-y-8 relative min-h-[500px]">

            {globalError && (
              <div className="mb-2 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            {loading && !globalError ? (
              // ================= SKELETON LOADER =================
              <div className="space-y-8 w-full animate-pulse">
                {/* Skeleton for Today's Summary */}
                <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
                  <div className="h-8 w-48 bg-slate-300 rounded-full mx-auto mb-6"></div>
                  
                  <div className="mb-6">
                    <div className="h-6 w-32 bg-slate-300 rounded mx-auto mb-3"></div>
                    <div className="border border-gray-300 rounded-[20px] bg-white p-4 space-y-4">
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-8 bg-slate-200 rounded"></div></div>
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-8 bg-slate-200 rounded"></div></div>
                      <div className="flex justify-between items-center px-4 pt-4 border-t border-gray-200"><div className="h-6 w-16 bg-slate-300 rounded"></div><div className="h-8 w-12 bg-slate-300 rounded"></div></div>
                    </div>
                  </div>

                  <div>
                    <div className="h-6 w-24 bg-slate-300 rounded mx-auto mb-3"></div>
                    <div className="border border-gray-300 rounded-[20px] bg-white p-4 space-y-4">
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-16 bg-slate-200 rounded"></div></div>
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-16 bg-slate-200 rounded"></div></div>
                      <div className="w-full h-px bg-gray-200 my-2"></div>
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-16 bg-slate-200 rounded"></div></div>
                      <div className="flex justify-between items-center px-4"><div className="h-5 w-16 bg-slate-200 rounded"></div><div className="h-6 w-16 bg-slate-200 rounded"></div></div>
                      <div className="flex justify-between items-center px-4 pt-4 mt-2 border-t border-gray-200"><div className="h-6 w-16 bg-slate-300 rounded"></div><div className="h-8 w-20 bg-slate-300 rounded"></div></div>
                    </div>
                  </div>
                </div>

                {/* Skeleton for Monthly Summary */}
                <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
                  <div className="h-8 w-48 bg-slate-300 rounded-full mx-auto mb-4"></div>
                  <div className="h-10 w-32 bg-[#43b0f1]/30 rounded-full mx-auto mb-6"></div>

                  <div className="mb-4">
                    <div className="h-6 w-32 bg-slate-300 rounded mx-auto mb-2"></div>
                    <div className="border border-gray-300 rounded-[20px] bg-white py-3 flex justify-center"><div className="h-8 w-12 bg-slate-200 rounded"></div></div>
                  </div>

                  <div className="mb-6">
                    <div className="h-6 w-24 bg-slate-300 rounded mx-auto mb-2"></div>
                    <div className="border border-gray-300 rounded-[20px] bg-white py-3 flex justify-center"><div className="h-8 w-32 bg-slate-200 rounded"></div></div>
                  </div>

                  <div className="flex flex-col gap-3 justify-center w-full">
                    <div className="w-full h-14 bg-slate-300 rounded-full"></div>
                    <div className="w-full h-14 bg-slate-300 rounded-full"></div>
                  </div>
                </div>
              </div>
              // ================= END SKELETON LOADER =================

            ) : (
              <>
                {/* TODAY'S SUMMARY */}
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

                {/* MONTHLY SUMMARY */}
                <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
                  <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-4 tracking-tight">Monthly Earnings:</h2>
                  <h3 className="text-3xl font-bold text-[#43b0f1] text-center mb-4 leading-tight break-words">{monthlyStats.month}</h3>

                  <div className="mb-4">
                    <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Number of days:</p>
                    <div className="border border-black rounded-[20px] bg-white py-3 text-center">
                      <span className="text-3xl text-[#43b0f1]">{monthlyStats.days}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xl font-bold text-[#1e3d58] text-center mb-2">Earnings:</p>
                    <div className="border border-black rounded-[20px] bg-white py-3 text-center px-2">
                      <span className="text-3xl text-[#43b0f1] break-all">₱{monthlyStats.earnings.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                    <Button 
                      onClick={handleOpenModal} 
                      disabled={loading || isExporting} 
                      className="w-full sm:flex-1 h-14 text-lg font-bold rounded-full bg-[#1e3d58] text-white hover:bg-[#2a5175] transition-all active:scale-95 shadow-md"
                    >
                      Select Month
                    </Button>
                    <Button 
                      onClick={handleExportToCSV} 
                      disabled={loading || isExporting} 
                      className="w-full sm:flex-1 h-14 text-lg font-bold rounded-full bg-green-600 text-white hover:bg-green-700 transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                      {isExporting ? <span className="animate-pulse">Exporting...</span> : <><Download size={20} strokeWidth={3} /> Download File</>}
                    </Button>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>

      {/* CUSTOM MONTH & YEAR SELECTOR MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/80 backdrop-blur-sm animate-in fade-in p-4 min-w-0">
          <div className="bg-white rounded-3xl p-5 w-full max-w-[300px] shadow-2xl border-4 border-[#e8eef1] animate-in zoom-in-95 duration-200 relative min-w-0">
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-3 top-3 p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <h2 className="text-xl font-black text-[#1e3d58] text-center mb-4 tracking-tight pr-6">
              Select Month
            </h2>

            <div className="flex justify-between items-center bg-[#e8eef1] rounded-xl p-1.5 mb-5 border-2 border-white shadow-inner min-w-0">
              <button 
                onClick={() => setTempYear(y => y - 1)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#1e3d58] shrink-0"
              >
                <ChevronLeft size={20} strokeWidth={3} />
              </button>
              <span className="text-lg font-black text-[#1e3d58] tabular-nums">{tempYear}</span>
              <button 
                onClick={() => setTempYear(y => y + 1)}
                className="p-1.5 hover:bg-white rounded-lg transition-colors text-[#1e3d58] shrink-0"
              >
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {MONTHS.map((month, idx) => {
                const monthNumber = idx + 1;
                const isSelected = tempMonth === monthNumber;
                return (
                  <button
                    key={month}
                    onClick={() => setTempMonth(monthNumber)}
                    className={`py-2 rounded-lg font-bold text-sm transition-all active:scale-95 ${
                      isSelected 
                        ? 'bg-[#43b0f1] text-white shadow-md border-2 border-[#43b0f1]' 
                        : 'bg-slate-50 text-[#1e3d58] hover:bg-[#e8eef1] border-2 border-transparent'
                    }`}
                  >
                    {month}
                  </button>
                );
              })}
            </div>

            <Button 
              onClick={handleConfirmMonth}
              className="w-full h-12 text-base font-bold rounded-xl bg-[#1e3d58] hover:bg-[#2a5175] text-white transition-all active:scale-95 shadow-lg"
            >
              Confirm
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}

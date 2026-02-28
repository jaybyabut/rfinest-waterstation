"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";

const FILTERS = ["Today", "Yesterday", "Last Week", "Custom"];

export default function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState("Today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // [BACKEND TODO]: Replace this dummy data with database fetch based on the selected date filter
  const [orders] = useState([
    { id: "ORD-1020", name: "Januard Esguerra", zone: "Bulaon", slim: 5, round: 6, total: 330, status: "Completed", date: "2026-02-17" },
    { id: "ORD-1021", name: "Jayb Yabut", zone: "Calulut", slim: 2, round: 0, total: 60, status: "Completed", date: "2026-02-16" },
    { id: "ORD-1022", name: "Kenneth Peralta", zone: "Montana", slim: 0, round: 3, total: 135, status: "Cancelled", date: "2026-02-10" },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-700 border-green-500";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-500";
      default:
        return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          
          <div className="flex items-center mb-6 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Order History
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left">
            
            <div className="grid grid-cols-2 gap-2 pb-4">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`w-full px-2 py-2.5 rounded-full text-sm sm:text-base font-bold border-2 transition-all ${
                    activeFilter === filter
                      ? "bg-[#1e3d58] text-white border-[#1e3d58]"
                      : "bg-[#e8eef1] text-[#1e3d58] border-transparent hover:border-[#1e3d58]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {activeFilter === "Custom" && (
              <div className="flex items-center justify-between gap-2 mb-4 bg-gray-50 p-3 rounded-2xl border border-gray-200">
                <Calendar size={20} className="text-[#1e3d58] shrink-0" />
                <input 
                  type="date" 
                  value={startDate}
                  onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                  onKeyDown={(e) => e.preventDefault()}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-transparent text-center text-sm font-bold text-[#1e3d58] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                />
                <span className="font-bold text-gray-400 shrink-0">-</span>
                <input 
                  type="date" 
                  value={endDate}
                  onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()}
                  onKeyDown={(e) => e.preventDefault()}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-transparent text-center text-sm font-bold text-[#1e3d58] focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden"
                />
              </div>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  No orders found for this date range.
                </div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border-2 border-[#1e3d58] rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-[#1e3d58]">{order.id}</h3>
                        <p className="text-sm font-bold text-gray-500">
                          {order.name} • {order.zone}
                        </p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">{order.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px]">
                      <div className="text-sm font-semibold text-[#1e3d58]">
                        Slim: <span className="text-[#43b0f1] font-black">{order.slim}</span> | Round:{" "}
                        <span className="text-[#43b0f1] font-black">{order.round}</span>
                      </div>
                      <div className="text-lg font-black text-[#43b0f1]">₱{order.total}</div>
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

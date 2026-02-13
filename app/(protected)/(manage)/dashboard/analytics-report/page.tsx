"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AnalyticsReportPage() {
  // Dummy data for UI presentation
  const [gallons] = useState({ slim: 45, round: 62, total: 107 });
  const [earnings] = useState({
    walkIn: 1500,
    online: 1710,
    cash: 2000,
    eBank: 1210,
    total: 3210,
  });
  
  const [monthlyStats] = useState({
    month: "February",
    days: 28,
    earnings: 85400,
  });

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        <div className="flex w-full mb-6 rounded-full overflow-hidden border-2 border-[#1e3d58] shadow-sm">
          <Link href="/dashboard/order" className="flex-1 py-3 text-center text-lg font-bold bg-[#1e3d58] text-white hover:bg-[#152c40] transition-colors">
            Order
          </Link>
          <button className="flex-1 py-3 text-lg font-bold bg-[#43b0f1] text-white">
            Manage
          </button>
        </div>

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter w-full text-center ml-6">
              Analytics & Report
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 shadow-inner border border-gray-100 text-left space-y-8">
            
            <div className="bg-[#e8eef1] rounded-[30px] p-5 border border-gray-200 shadow-sm">
              <h2 className="text-3xl font-black text-[#1e3d58] text-center mb-6 tracking-tight">Today's Summary</h2>
              
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

              <div className="flex justify-center">
                <Button className="w-3/4 h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95">
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

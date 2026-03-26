"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";
import AdminTabs from "@/components/admin/tabs"; 

export default function DashboardManage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  
  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      setCurrentDateTime(formatted);
    };

    updateDateTime();
    const timer = setInterval(updateDateTime, 1000);

    return () => clearInterval(timer);
  }, []);

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

  return (
    <div className={cn("flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden", className)} {...props}>
      <div className="w-full max-w-md mx-auto">
    
        <AdminTabs active="manage" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl overflow-hidden">
          
          <h1 className="text-5xl sm:text-6xl font-black mb-8 text-black tracking-tighter break-words px-2">Manage</h1>
          
          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 w-full overflow-hidden">
            
            {/* Added break-words and leading-tight so the long date string wraps safely on tiny screens */}
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-10 text-[#1e3d58] min-h-[40px] break-words leading-tight">
                {currentDateTime}
            </h2>
            
            <div className="flex flex-col gap-4 w-full">
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/edit-order" className="w-full text-center">Edit Order</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/order-status" className="w-full text-center">Order Status</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/order-history" className="w-full text-center">Order History</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/manage-prices" className="w-full text-center">Manage Prices</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/analytics-report" className="w-full text-center">Analytics & Report</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words">
                <Link href="/dashboard/activity-logs" className="w-full text-center">Activity Logs</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>
    </div>
  );
}

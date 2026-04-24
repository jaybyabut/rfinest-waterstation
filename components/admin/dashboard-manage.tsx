"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminTabs from "@/components/admin/tabs";
import { ArrowUp } from "lucide-react"; // Binalik natin yung ArrowUp icon

export default function DashboardManage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {

  const [currentDateTime, setCurrentDateTime] = useState<string>("");
  const [showScrollTop, setShowScrollTop] = useState(false); // State para sa scroll button

  // Date and Time Clock
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

  // Scroll listener para lumabas yung button kapag bumaba na
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

  // Common styles para sa lahat ng buttons para uniform at safe sa long text
  const buttonClasses = "w-full h-auto min-h-[64px] py-3 px-4 text-base sm:text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal leading-tight text-center flex items-center justify-center";

  return (
    <div className={cn("flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden", className)} {...props}>
      <div className="w-full max-w-md relative">

        <AdminTabs active="manage" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl">

          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">Manage</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100">

            <h2 className="text-2xl sm:text-3xl font-extrabold mb-8 text-[#1e3d58] min-h-[40px]">
              {currentDateTime}
            </h2>

            <div className="flex flex-col gap-3 sm:gap-4">
              
              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/announce">Make an Announcement</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/edit-order">Edit Order</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/order-status">Order Status</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/order-history">Order History</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/manage-prices">Manage Prices</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/analytics-report">Sales Report</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/activity-logs">Activity Logs</Link>
              </Button>

              <Button asChild variant="outline" className={buttonClasses}>
                <Link href="/dashboard/account">Account Settings</Link>
              </Button>
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

"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import { useUser } from "@/app/(protected)/(customer)/home/user-provider";

export default function CustomerHome({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const userData = useUser();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  /**
   * [GET] Active Order Check: 
   * I-query ang 'orders' table kung saan user_id == auth.uid() at status != 'Delivered'.
   * I-set ang 'hasActiveOrder' sa true kung may nahanap na record.
   */
  const hasActiveOrder = true;

  useEffect(() => {
    const handleWindowScroll = () => {
      lastKnownScrollPosition.current = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(lastKnownScrollPosition.current > 300);
          ticking.current = false;
        });

        ticking.current = true;
      }
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

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl overflow-hidden">

          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter w-full text-center px-2 sm:px-12 break-words leading-tight">Home</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 w-full overflow-hidden">

            <h2 className="text-4xl font-extrabold mb-2 text-[#1e3d58] break-words leading-tight">
              {/* [GET] User Profile: I-fetch ang 'first_name' mula sa 'profiles' table gamit ang ID mula sa supabase.auth.getUser() */}
              Hello, {userData?.first_name || 'user'}!
            </h2>

            <p className="text-gray-600 font-medium mb-8 px-2 leading-relaxed text-sm break-words">
              Stay hydrated! We are ready to deliver fresh water to your doorstep.
            </p>

            {hasActiveOrder && (
              <div className="mb-8 p-4 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-2 text-left shadow-sm w-full overflow-hidden">
                <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider flex-1 min-w-0 break-words leading-tight">Current Order</span>

                  {/**
                   * [REAL-TIME] Order Subscription:
                   * Gamitin ang supabase.channel() para mag-listen sa 'status' changes ng order na ito.
                   * Ang label na ito ay dapat mag-update base sa value ng 'status' column (ex: 'Refilled').
                   */}
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 animate-pulse shrink-0">
                    Refilled 💧
                  </span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <div className="flex-1 min-w-0">
                    {/* [GET] I-display ang dynamic order_id, slim_count, at round_count mula sa fetched order details */}
                    <p className="text-lg font-black text-[#1e3d58] break-words">ORD-1025</p>
                    <p className="text-xs text-gray-500 font-semibold break-words">2 Slim • 1 Round</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight">
                <Link href="/home/order" className="w-full text-center">Place Order</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight">
                <Link href="/home/order-status" className="w-full text-center">Check Orders</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight">
                <Link href="/home/account" className="w-full text-center">Account Settings</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
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
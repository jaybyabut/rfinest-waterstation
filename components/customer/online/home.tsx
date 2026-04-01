"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ArrowUp } from "lucide-react";

import { useUser } from "@/app/(protected)/(customer)/home/user-provider";
import { getCurrentOrder } from "@/app/actions/getCurrentOrder";

// Siguraduhing tama ang import path ng banner mo
import StoreHoursBanner from "@/components/StoreHoursBanner"; 

export default function CustomerHome({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const userData = useUser();
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [isLoadingOrder, setIsLoadingOrder] = useState(true);

  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoadingOrder(true);
      const res = await getCurrentOrder();
      if (res && !('error' in res)) {
        setActiveOrder(res);
      } else {
        setActiveOrder(null);
      }
      setIsLoadingOrder(false);
    }
    fetchOrder();
  }, []);

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

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 w-full overflow-hidden text-center">

            {/* ================= GREETING WITH SKELETON ================= */}
            <h2 className="text-4xl font-extrabold mb-2 text-[#1e3d58] break-words leading-tight">
              Hello, {userData === undefined ? (
                <span className="h-9 w-32 bg-slate-200 rounded-xl animate-pulse inline-block align-middle mb-1"></span>
              ) : (
                `${userData?.first_name || 'user'}!`
              )}
            </h2>

            <p className="text-gray-600 font-medium mb-6 px-2 sm:px-0 leading-relaxed text-sm break-words">
              Stay hydrated! We are ready to deliver fresh water to your doorstep.
            </p>

            {/* ================= BINALIK YUNG BANNER DITO ================= */}
            <StoreHoursBanner />

            {/* ================= CURRENT ORDER WITH SKELETON ================= */}
            {isLoadingOrder ? (
              <div className="mb-8 p-4 rounded-[25px] bg-[#e8eef1]/40 border-2 border-transparent flex flex-col gap-2 text-left shadow-sm w-full overflow-hidden">
                <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse shrink-0"></div>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1">
                    <div className="h-6 w-28 bg-slate-300 rounded animate-pulse"></div>
                    <div className="h-4 w-36 bg-slate-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ) : activeOrder ? (
              <div className="mb-8 p-4 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-2 text-left shadow-sm w-full overflow-hidden">
                <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider flex-1 min-w-0 break-words leading-tight">Current Order</span>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 animate-pulse shrink-0">
                    {activeOrder.current_status} 💧
                  </span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-black text-[#1e3d58] break-words">ORD-{activeOrder.order_id.split('-')[0].toUpperCase()}</p>
                    <p className="text-xs text-gray-500 font-semibold break-words">
                      {activeOrder.order_items.map((item: any) => `${item.quantity} ${item.products.product_name}`).join(' • ')}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-8 p-6 rounded-[25px] bg-[#e8eef1]/30 border-2 border-dashed border-[#1e3d58]/10 flex flex-col items-center justify-center gap-1 text-center w-full">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Current Order</p>
                <p className="text-lg font-black text-[#1e3d58]/40 italic">No current order</p>
              </div>
            )}

            <div className="flex flex-col gap-4 w-full">
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight shadow-sm">
                <Link href="/home/order" className="w-full text-center">Place Order</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight shadow-sm">
                <Link href="/home/order-status" className="w-full text-center">Check Orders</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight shadow-sm">
                <Link href="/home/account" className="w-full text-center">Account Settings</Link>
              </Button>

              {/* ================= BAGONG BUTTON PARA SA STORE HOURS ================= */}
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all whitespace-normal break-words leading-tight shadow-sm">
                <Link href="/home/store-hours" className="w-full text-center">Store Hours</Link>
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

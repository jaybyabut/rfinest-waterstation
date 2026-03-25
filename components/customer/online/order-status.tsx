"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, Package, Droplets, Truck, ReceiptText, CalendarClock, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { getCustomerOrders } from "@/app/actions/getCustomerOrders";

export interface Order {
  id: string;
  date: string;
  totalAmount: number;
  items: string;
  currentStep: number;
  statusText: string;
}

const STATUSES = [
  { title: "Pending", desc: "Your order has been received and is waiting to be processed.", icon: Clock },
  { title: "Processing", desc: "We are currently processing your containers.", icon: Package },
  { title: "Refilled", desc: "Your containers are freshly refilled and sealed.", icon: Droplets },
  { title: "Out for Delivery", desc: "Your order is on its way to you.", icon: Truck },
];

interface BackendOrderItem {
  quantity: number;
  products: {
    product_name: string;
  } | {
    product_name: string;
  }[] | null;
}

interface BackendOrder {
  order_id: number;
  order_dt: string;
  total_amount: number;
  current_status: string;
  payment_mode: string;
  order_items: BackendOrderItem[];
}

export default function CustomerOrderStatus() {
  const [view, setView] = useState<"list" | "detail">("list");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

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

  useEffect(() => {
    const fetchOrders = async () => {
      const result = await getCustomerOrders();
      if (result && !('error' in result)) {
        const fetchedOrders = result as BackendOrder[];
        
        const formattedOrders = fetchedOrders.map((order) => {
          let slim = 0;
          let round = 0;
          
          order.order_items.forEach((item) => {
            const product = Array.isArray(item.products) ? item.products[0] : item.products;
            const productName = product?.product_name?.toLowerCase() || "";
            if (productName.includes("slim")) slim += item.quantity;
            else if (productName.includes("round")) round += item.quantity;
          });

          let currentStep = -1;
          if (order.current_status === "Pending") currentStep = 0;
          else if (order.current_status === "Picked-up" || order.current_status === "Processing") currentStep = 1;
          else if (order.current_status === "Refilled") currentStep = 2;
          else if (order.current_status === "Delivered" || order.current_status === "Out for Delivery") currentStep = 3;

          const itemsStr: string[] = [];
          if (slim > 0) itemsStr.push(`${slim} Slim`);
          if (round > 0) itemsStr.push(`${round} Round`);
          itemsStr.push(order.payment_mode || "COD");

          return {
            id: `ORD-${order.order_id}`,
            date: new Date(order.order_dt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
            totalAmount: order.total_amount,
            items: itemsStr.join(" • "),
            currentStep,
            statusText: order.current_status || "Pending",
          };
        });
        setOrders(formattedOrders);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setView("list");
  };

  if (view === "list") {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center justify-center mb-8 relative w-full px-2">
              <Link href="/home" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
                <ChevronLeft size={44} strokeWidth={3} />
              </Link>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight break-words">
                Check Orders
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-4 w-full overflow-hidden">
              <h2 className="text-[#1e3d58] font-black text-2xl tracking-tight ml-2 mb-2">Recent Orders</h2>
              <div className="space-y-3 w-full">
                {loading ? (
                  <div className="text-center py-4 text-gray-500 font-bold">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 font-bold">No orders found.</div>
                ) : orders.map((order) => (
                  <button 
                    key={order.id}
                    onClick={() => handleOrderClick(order)} 
                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3"
                  >
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0 mt-1 sm:mt-0",
                        order.currentStep === 2 ? "bg-[#1e3d58] text-white" : "bg-white text-[#43b0f1]"
                      )}>
                        {order.currentStep === 2 ? <CheckCircle2 size={24} /> : <ReceiptText size={24} />}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        {/* Status/Date Wrapper - Flexible to wrap when squeezed */}
                        <div className="flex justify-between items-start sm:items-center mb-1 gap-2 flex-wrap sm:flex-nowrap">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest flex-1 min-w-0 break-words leading-tight">{order.date}</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap",
                            order.currentStep === 2 ? "bg-green-100 text-green-700" : "bg-[#43b0f1]/20 text-[#1e3d58]"
                          )}>
                            {order.statusText}
                          </span>
                        </div>
                        {/* FIXED: Removed truncate, added whitespace-normal break-words */}
                        <p className="text-lg font-black text-[#1e3d58] break-words whitespace-normal leading-tight">{order.id}</p>
                        <p className="text-sm font-bold text-gray-500 break-words whitespace-normal leading-tight mt-0.5">₱{order.totalAmount} • {order.items.split('•')[0]}</p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-400 shrink-0 self-center" />
                  </button>
                ))}
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

  // TRACKING UI (Detail View)
  if (view === "detail" && selectedOrder) {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in slide-in-from-right-8 duration-300 mb-24 relative overflow-x-hidden">
        <div className="w-full max-w-md mx-auto">
          
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center justify-center mb-8 relative w-full px-2">
              <button onClick={handleBackToList} className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
                <ChevronLeft size={44} strokeWidth={3} />
              </button>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 break-words leading-tight">
                Track Order
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left w-full overflow-hidden">
 
              <div className="mb-8 p-4 sm:p-5 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-1 text-left shadow-sm w-full overflow-hidden">
                <div className="flex justify-between items-start sm:items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider flex-1 min-w-0 break-words leading-tight">Order ID</span>
                  <span className="text-2xl font-black text-[#43b0f1] shrink-0">₱{selectedOrder.totalAmount}</span>
                </div>
                {/* FIXED: Removed truncate, added whitespace-normal break-words */}
                <p className="text-2xl font-black text-[#1e3d58] break-words whitespace-normal leading-tight">{selectedOrder.id}</p>
                <div className="flex items-start sm:items-center gap-2 mt-2">
                  <CalendarClock size={16} className="text-gray-500 shrink-0 mt-0.5 sm:mt-0" />
                  <p className="text-sm text-gray-500 font-bold break-words whitespace-normal leading-tight">{selectedOrder.date}</p>
                </div>
                <p className="text-sm text-gray-500 font-bold mt-1 break-words whitespace-normal leading-tight">{selectedOrder.items}</p>
              </div>

              <div className="space-y-6 px-2 w-full">
                <h2 className="text-2xl font-extrabold text-[#1e3d58] mb-4">Delivery Status</h2>
                
                {/* TODO: BACKEND - [REAL-TIME] Real-time Status Tracker
                  Gamitin ang supabase.channel() para mag-subscribe sa 'UPDATE' events ng 'orders' table.
                  I-filter ang subscription para sa selectedOrder.id lang.
                  I-update ang selectedOrder.currentStep gamit ang state kapag may pumasok na update.
                */}
                <div className="relative border-l-4 border-gray-200 ml-5 space-y-10">
                  {STATUSES.map((step, index) => {
                    const isCompleted = index < selectedOrder.currentStep;
                    const isActive = index === selectedOrder.currentStep;
                    const Icon = step.icon;

                    return (
                      <div key={index} className="relative pl-8">
                        <div className={cn(
                          "absolute -left-[22px] top-0 p-2 rounded-full border-4 border-white shadow-sm flex items-center justify-center",
                          isActive ? "bg-[#43b0f1] text-white animate-pulse" : 
                          isCompleted ? "bg-[#1e3d58] text-white" : "bg-gray-200 text-gray-400"
                        )}>
                          {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
                        </div>

                        <div className="min-w-0">
                          <h3 className={cn(
                            "text-xl font-bold break-words leading-tight",
                            isActive ? "text-[#43b0f1]" : 
                            isCompleted ? "text-[#1e3d58]" : "text-gray-400"
                          )}>
                            {step.title}
                          </h3>
                          <p className={cn(
                            "text-sm font-medium break-words leading-tight mt-1",
                            isActive || isCompleted ? "text-gray-500" : "text-gray-300"
                          )}>
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-10 w-full">
                <Button onClick={handleBackToList} className="w-full h-16 text-xl sm:text-2xl font-bold rounded-full bg-[#1e3d58] text-white hover:bg-black transition-all shadow-lg">
                  Back to List
                </Button>
              </div>

            </div>
          </div>
        </div>

        {/* Floating Scroll to Top Button for Detail View */}
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

  return null;
}

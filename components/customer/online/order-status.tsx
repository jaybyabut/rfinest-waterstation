"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CheckCircle2, Package, Droplets, MapPin, ReceiptText, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// TODO: BACKEND - Tanggalin itong dummy data kapag nakakabit na sa Supabase
const DUMMY_ORDERS = [
  {
    id: "ORD-2026-003",
    date: "Mar 08, 2026",
    totalAmount: 300,
    items: "2 Slim • 5 Round • COD",
    currentStep: 1, // 0 = Picked Up, 1 = Refilled, 2 = Delivered
    statusText: "Refilled",
  },
  {
    id: "ORD-2026-002",
    date: "Mar 05, 2026",
    totalAmount: 150,
    items: "1 Slim • 2 Round • GCash",
    currentStep: 2,
    statusText: "Delivered",
  },
  {
    id: "ORD-2026-001",
    date: "Mar 01, 2026",
    totalAmount: 450,
    items: "5 Slim • 5 Round • COD",
    currentStep: 2,
    statusText: "Delivered",
  },
];

const STATUSES = [
  { title: "Picked Up", desc: "Your empty containers have been collected.", icon: Package },
  { title: "Refilled", desc: "Your containers are freshly refilled and sealed.", icon: Droplets },
  { title: "Delivered", desc: "Your order has been safely delivered.", icon: MapPin },
];

export default function CustomerOrderStatus() {
  // BAGONG STATE: Para mag-toggle between listahan at tracking UI
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedOrder, setSelectedOrder] = useState<typeof DUMMY_ORDERS[0] | null>(null);

  const handleOrderClick = (order: typeof DUMMY_ORDERS[0]) => {
    setSelectedOrder(order);
    setView("detail");
  };

  const handleBackToList = () => {
    setSelectedOrder(null);
    setView("list");
  };

  /**
   * TODO: BACKEND - [GET] Fetch Active & Past Order Details
   * I-fetch ang lahat ng order records kung saan auth.uid() == user_id.
   * I-map ang data papunta sa structure ng DUMMY_ORDERS sa itaas.
   */

  if (view === "list") {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-10">
        <div className="w-full max-w-md">
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">
            
            <div className="flex items-center justify-center mb-8 relative w-full">
              <Link href="/home" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
                <ChevronLeft size={44} strokeWidth={3} />
              </Link>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter text-center px-10 leading-none">
                Check Orders
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-4">
              <h2 className="text-[#1e3d58] font-black text-2xl tracking-tight ml-2 mb-2">Recent Orders</h2>
              
              <div className="space-y-3">
                {DUMMY_ORDERS.map((order) => (
                  <button 
                    key={order.id}
                    onClick={() => handleOrderClick(order)} 
                    className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center shadow-sm shrink-0",
                        order.currentStep === 2 ? "bg-[#1e3d58] text-white" : "bg-white text-[#43b0f1]"
                      )}>
                        {order.currentStep === 2 ? <CheckCircle2 size={24} /> : <ReceiptText size={24} />}
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{order.date}</p>
                          <span className={cn(
                            "text-[10px] font-black uppercase px-2 py-0.5 rounded-full",
                            order.currentStep === 2 ? "bg-green-100 text-green-700" : "bg-[#43b0f1]/20 text-[#1e3d58]"
                          )}>
                            {order.statusText}
                          </span>
                        </div>
                        <p className="text-lg font-black text-[#1e3d58] truncate">{order.id}</p>
                        <p className="text-sm font-bold text-gray-500 truncate">₱{order.totalAmount} • {order.items.split('•')[0]}</p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-gray-400 shrink-0" />
                  </button>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // TRACKING UI (Detail View)
  if (view === "detail" && selectedOrder) {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in slide-in-from-right-8 duration-300 mb-10">
        <div className="w-full max-w-md">
          
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">
            
            <div className="flex items-center justify-center mb-8 relative w-full px-2">
              <button onClick={handleBackToList} className="absolute left-2 text-black hover:scale-110 transition-transform">
                <ChevronLeft size={44} strokeWidth={3} />
              </button>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
                Track Order
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
 
              <div className="mb-8 p-5 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-1 text-left shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider">Order ID</span>
                  <span className="text-2xl font-black text-[#43b0f1]">₱{selectedOrder.totalAmount}</span>
                </div>
                <p className="text-2xl font-black text-[#1e3d58]">{selectedOrder.id}</p>
                <div className="flex items-center gap-2 mt-2">
                  <CalendarClock size={16} className="text-gray-500" />
                  <p className="text-sm text-gray-500 font-bold">{selectedOrder.date}</p>
                </div>
                <p className="text-sm text-gray-500 font-bold mt-1">{selectedOrder.items}</p>
              </div>

              <div className="space-y-6 px-2">
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

                        <div>
                          <h3 className={cn(
                            "text-xl font-bold",
                            isActive ? "text-[#43b0f1]" : 
                            isCompleted ? "text-[#1e3d58]" : "text-gray-400"
                          )}>
                            {step.title}
                          </h3>
                          <p className={cn(
                            "text-sm font-medium",
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

              <div className="pt-10">
                <Button onClick={handleBackToList} className="w-full h-16 text-2xl font-bold rounded-full bg-[#1e3d58] text-white hover:bg-black transition-all shadow-lg">
                  Back to List
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

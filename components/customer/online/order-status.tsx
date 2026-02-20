"use client";

import Link from "next/link";
import { ChevronLeft, CheckCircle2, Package, Droplets, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CustomerOrderStatus() {
  /**
   * [GET] Fetch Active Order Details:
   * 1. I-fetch ang pinakabagong order record kung saan auth.uid() == user_id.
   * 2. Kunin ang mga sumusunod na columns: id (orderId), total_amount, slim_count, round_count, at status.
   * * [GET] Status Mapping:
   * I-convert ang 'status' string mula sa database (enum) patungo sa currentStep index:
   * - 'Picked Up' -> 0
   * - 'Refilled' -> 1
   * - 'Delivered' -> 2
   */
  const orderId = "ORD-2026-001";
  const totalAmount = 300;
  
  /**
   * [REAL-TIME] Real-time Status Tracker:
   * 1. Gamitin ang supabase.channel() para mag-subscribe sa 'UPDATE' events ng 'orders' table.
   * 2. I-filter ang subscription para sa order ID lang na ito.
   * 3. Kapag nag-update ang Admin, kusa dapat mag-trigger ang 'currentStep' animation nang walang refresh.
   */
  const currentStep = 2; 

  const statuses = [
    { title: "Picked Up", desc: "Your empty containers have been collected.", icon: Package },
    { title: "Refilled", desc: "Your containers are freshly refilled and sealed.", icon: Droplets },
    { title: "Delivered", desc: "Your order has been safely delivered.", icon: MapPin },
  ];

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-10">
      <div className="w-full max-w-md">
        
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">
          
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/home" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Track Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
 
            <div className="mb-8 p-4 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-1 text-left shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider">Order ID</span>
                <span className="text-lg font-black text-[#43b0f1]">₱{totalAmount}</span>
              </div>
              <p className="text-2xl font-black text-[#1e3d58]">{orderId}</p>
              {/* [GET] I-display dito ang dynamic counts at payment method mula sa database */}
              <p className="text-sm text-gray-500 font-bold mt-1">2 Slim • 5 Round • COD</p>
            </div>

            <div className="space-y-6 px-2">
              <h2 className="text-2xl font-extrabold text-[#1e3d58] mb-4">Delivery Status</h2>
              
              <div className="relative border-l-4 border-gray-200 ml-5 space-y-10">
                {statuses.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isActive = index === currentStep;
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
              <Button asChild className="w-full h-16 text-2xl font-bold rounded-full bg-[#1e3d58] text-white hover:bg-black transition-all shadow-lg">
                <Link href="/home">Back to Home</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

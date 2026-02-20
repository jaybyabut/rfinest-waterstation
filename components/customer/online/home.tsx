"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CustomerHome({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  
  // [BACKEND TODO]: Fetch active order status of the logged-in user
  const hasActiveOrder = true; 

  return (
    <div className={cn("flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500", className)} {...props}>
      <div className="w-full max-w-md">

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl">
          
          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">Home</h1>
          
          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100">
            
            <h2 className="text-4xl font-extrabold mb-2 text-[#1e3d58]">
                Hello, user!
            </h2>
            
            <p className="text-gray-600 font-medium mb-8 px-2 leading-relaxed text-sm">
              Stay hydrated! We are ready to deliver fresh water to your doorstep.
            </p>

            {hasActiveOrder && (
              <div className="mb-8 p-4 rounded-[25px] bg-[#e8eef1]/50 border-2 border-[#1e3d58]/10 flex flex-col gap-2 text-left shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-wider">Current Order</span>
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200 animate-pulse">
                    Out for Delivery 🚚
                  </span>
                </div>
                <div className="flex justify-between items-end mt-1">
                  <div>
                    <p className="text-lg font-black text-[#1e3d58]">ORD-1025</p>
                    <p className="text-xs text-gray-500 font-semibold">2 Slim • 1 Round</p>
                  </div>
                  {/* Nag-update ang link para mag-match sa base path */}
                  <Link href="/order-status" className="text-xs font-bold text-[#43b0f1] hover:underline">
                    Track &rarr;
                  </Link>
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-4">
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                {/* Papalitan ang link base sa folder name sa app directory mo */}
                <Link href="/home/order">Place Order</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/home/edit-order">Edit Order</Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/order-status">Order Status</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/account">Account Settings</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

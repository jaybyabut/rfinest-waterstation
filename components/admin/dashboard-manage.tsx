"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import AdminTabs from "@/components/admin/tabs"; 

export default function DashboardManage({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  
  return (
    <div className={cn("flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500", className)} {...props}>
      <div className="w-full max-w-md">
    
        <AdminTabs active="manage" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl">
          
          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">Manage</h1>
          
          <div className="bg-white rounded-[40px] p-8 shadow-inner border border-gray-100">
            
            {/* [BACKEND TODO]: Fetch and display current server date here */}
            <h2 className="text-3xl font-extrabold mb-10 text-[#1e3d58] min-h-[40px]">
                February 17, 2026
            </h2>
            
            <div className="flex flex-col gap-4">
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/dashboard/edit-order">Edit Order</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/dashboard/order-status">Order Status</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/dashboard/manage-prices">Manage Prices</Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                <Link href="/dashboard/analytics-report">Analytics & Report</Link>
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

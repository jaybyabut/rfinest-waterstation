"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

// Mga possible na status ng order
const STATUS_OPTIONS = ["Pending", "Picked-up", "Refilled", "Delivered"];
const FILTERS = ["All", ...STATUS_OPTIONS];

export default function OrderStatusPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  // Dummy data para may makita tayong listahan sa UI
  const [orders, setOrders] = useState([
    { id: "ORD-1024", name: "Januard Esguerra", zone: "Bulaon", slim: 5, round: 6, total: 330, status: "Pending" },
    { id: "ORD-1025", name: "Juan Dela Cruz", zone: "Calulut", slim: 2, round: 0, total: 60, status: "Picked-up" },
    { id: "ORD-1026", name: "Maria Clara", zone: "Montana", slim: 0, round: 3, total: 135, status: "Refilled" },
    { id: "ORD-1027", name: "Pedro Penduko", zone: "Lakeshore", slim: 1, round: 1, total: 90, status: "Delivered" },
  ]);

  const filteredOrders = activeFilter === "All" 
    ? orders 
    : orders.filter(order => order.status === activeFilter);

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Pending": return "bg-gray-200 text-gray-700 border-gray-400";
      case "Picked-up": return "bg-orange-100 text-orange-700 border-orange-400";
      case "Refilled": return "bg-blue-100 text-[#43b0f1] border-[#43b0f1]";
      case "Delivered": return "bg-green-100 text-green-700 border-green-500";
      default: return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

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
          <div className="flex items-center mb-6 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Order Status
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left">
            
            <div className="grid grid-cols-2 gap-2 pb-4 mb-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`w-full px-2 py-2.5 rounded-full text-sm sm:text-base font-bold border-2 transition-all ${
                    filter === "All" ? "col-span-2" : ""
                  } ${
                    activeFilter === filter 
                      ? "bg-[#1e3d58] text-white border-[#1e3d58]" 
                      : "bg-[#e8eef1] text-[#1e3d58] border-transparent hover:border-[#1e3d58]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 pb-2">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  No orders found for "{activeFilter}".
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="border-2 border-[#1e3d58] rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3">
                    
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-[#1e3d58]">{order.id}</h3>
                        <p className="text-sm font-bold text-gray-500">{order.name} • {order.zone}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px]">
                      <div className="text-sm font-semibold text-[#1e3d58]">
                        Slim: <span className="text-[#43b0f1] font-black">{order.slim}</span> | Round: <span className="text-[#43b0f1] font-black">{order.round}</span>
                      </div>
                      <div className="text-lg font-black text-[#43b0f1]">
                        ₱{order.total}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-[#1e3d58]">Update Status:</span>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="bg-[#1e3d58] text-white text-sm font-bold rounded-full px-4 py-2 focus:outline-none cursor-pointer appearance-none text-center"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                ))
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

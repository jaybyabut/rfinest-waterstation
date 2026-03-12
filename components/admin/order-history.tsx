"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar } from "lucide-react";
import { getOrderHistory } from "@/app/actions/getOrderHistory";

const FILTERS = ["Today", "Yesterday", "Last Week", "Custom"];

interface OrderItem {
  quantity: number;
  products: {
    product_name: string;
  } | {
    product_name: string;
  }[] | null;
}

interface FetchedOrder {
  order_id: number;
  order_dt: string; 
  name: string;
  total_amount: number;
  current_status: string;
  location_pricing: {
    location_name: string;
  } | {
    location_name: string;
  }[] | null;
  order_items: OrderItem[];
}

interface DisplayOrder {
  id: string;
  name: string;
  zone: string;
  slim: number;
  round: number;
  total: number;
  status: string;
  date: string;
}

export default function OrderHistory() {
  const [activeFilter, setActiveFilter] = useState("Today");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [orders, setOrders] = useState<DisplayOrder[]>([]);

  useEffect(() => {
    setGlobalError(null);

    if (activeFilter === "Custom") {
      if (startDate && endDate) {
        if (new Date(startDate) > new Date(endDate)) {
          setGlobalError("Start date cannot be later than end date.");
          return; 
        }
      } else {
        return; 
      }
    }

    const fetchHistory = async () => {
      setLoading(true);
      try {
        const result = await getOrderHistory(activeFilter, startDate, endDate);
        if (result && !('error' in result)) {
          const fetchedOrders = result as FetchedOrder[];
          
          const mappedOrders: DisplayOrder[] = fetchedOrders.map((order) => {
            let slim = 0;
            let round = 0;

            order.order_items.forEach((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              const productName = product?.product_name?.toLowerCase() || "";
              
              if (productName.includes("slim")) slim += item.quantity;
              else if (productName.includes("round")) round += item.quantity;
            });

            const location = Array.isArray(order.location_pricing) ? order.location_pricing[0] : order.location_pricing;

            return {
              id: `ORD-${order.order_id}`,
              name: order.name,
              zone: location?.location_name || "Unknown",
              slim,
              round,
              total: order.total_amount,
              status: order.current_status || "Pending",
              date: new Date(order.order_dt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            };
          });

          setOrders(mappedOrders);
        } else {
          setGlobalError("Failed to load order history.");
          console.error("Error fetching order history:", result?.error);
        }
      } catch (error) {
        console.error(error);
        setGlobalError("Failed to load order history. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [activeFilter, startDate, endDate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700 border-green-500";
      case "Cancelled": return "bg-red-100 text-red-700 border-red-500";
      default: return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-6 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">Order History</h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left">
            {globalError && (
              <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">⚠️ {globalError}</div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-4">
              {FILTERS.map((filter) => (
                <button key={filter} onClick={() => { setActiveFilter(filter); if (filter !== "Custom") { setStartDate(""); setEndDate(""); } }}
                  className={`w-full px-2 py-2.5 rounded-full text-sm sm:text-base font-bold border-2 transition-all ${activeFilter === filter ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent hover:border-[#1e3d58]"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {activeFilter === "Custom" && (
              <div className={`flex items-center justify-between gap-2 mb-4 bg-gray-50 p-3 rounded-2xl border-2 transition-colors ${globalError ? 'border-red-400' : 'border-gray-200'}`}>
                <Calendar size={20} className="text-[#1e3d58] shrink-0" />
                <input type="date" value={startDate} onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()} onKeyDown={(e) => e.preventDefault()} onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full bg-transparent text-center text-sm font-bold focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${globalError ? 'text-red-600' : 'text-[#1e3d58]'}`}
                />
                <span className="font-bold text-gray-400 shrink-0">-</span>
                <input type="date" value={endDate} onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()} onKeyDown={(e) => e.preventDefault()} onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full bg-transparent text-center text-sm font-bold focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${globalError ? 'text-red-600' : 'text-[#1e3d58]'}`}
                />
              </div>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {loading ? ( <div className="text-center py-10 text-gray-400 font-medium">Loading history...</div> ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">{globalError ? "Invalid date range." : "No orders found for this date range."}</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border-2 border-[#1e3d58] rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black text-[#1e3d58]">{order.id}</h3>
                        <p className="text-sm font-bold text-gray-500">{order.name} • {order.zone}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">{order.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-bold ${getStatusColor(order.status)}`}>{order.status}</div>
                    </div>
                    <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px]">
                      <div className="text-sm font-semibold text-[#1e3d58]">Slim: <span className="text-[#43b0f1] font-black">{order.slim}</span> | Round: <span className="text-[#43b0f1] font-black">{order.round}</span></div>
                      <div className="text-lg font-black text-[#43b0f1]">₱{order.total}</div>
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

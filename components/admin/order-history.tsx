"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Calendar, ArrowUp } from "lucide-react";
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
  const [showScrollTop, setShowScrollTop] = useState(false);

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
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-6 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Order History
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left relative min-h-[400px] w-full overflow-hidden">
            {globalError && (
              <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200 break-words">⚠️ {globalError}</div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-4">
              {FILTERS.map((filter) => (
                <button key={filter} onClick={() => { setActiveFilter(filter); if (filter !== "Custom") { setStartDate(""); setEndDate(""); } }}
                  className={`w-full px-2 py-2.5 rounded-full text-sm sm:text-base font-bold border-2 transition-all leading-tight break-words ${activeFilter === filter ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent hover:border-[#1e3d58]"}`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* ================= BAGONG RESPONSIVE DATE PICKER ================= */}
            {activeFilter === "Custom" && (
              <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4 bg-[#f8fbfd] p-4 rounded-[20px] border-2 transition-colors ${globalError ? 'border-red-400' : 'border-[#1e3d58]/10'}`}>
                
                <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 mb-1 sm:mb-0">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100">
                    <Calendar size={20} className="text-[#43b0f1]" />
                  </div>
                  <span className="text-sm font-black text-[#1e3d58] uppercase tracking-widest sm:hidden">Select Date</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 w-full">
                  
                  {/* Start Date Input */}
                  <div className="flex items-center w-full bg-white h-12 px-4 rounded-full border border-gray-200 shadow-sm focus-within:border-[#43b0f1] transition-colors">
                    <span className="text-[10px] font-black text-gray-400 uppercase mr-3 shrink-0">From</span>
                    <input 
                      type="date" 
                      value={startDate} 
                      onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()} 
                      onKeyDown={(e) => e.preventDefault()} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className={`w-full min-w-0 bg-transparent text-sm font-bold focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${globalError ? 'text-red-600' : 'text-[#1e3d58]'}`}
                    />
                  </div>
                  
                  {/* Dash (Lilitaw lang sa malaking screen) */}
                  <span className="hidden sm:block font-black text-gray-300">-</span>
                  
                  {/* End Date Input */}
                  <div className="flex items-center w-full bg-white h-12 px-4 rounded-full border border-gray-200 shadow-sm focus-within:border-[#43b0f1] transition-colors">
                    <span className="text-[10px] font-black text-gray-400 uppercase mr-3 shrink-0">To</span>
                    <input 
                      type="date" 
                      value={endDate} 
                      onClick={(e) => e.currentTarget.showPicker && e.currentTarget.showPicker()} 
                      onKeyDown={(e) => e.preventDefault()} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className={`w-full min-w-0 bg-transparent text-sm font-bold focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:hidden ${globalError ? 'text-red-600' : 'text-[#1e3d58]'}`}
                    />
                  </div>

                </div>
              </div>
            )}
            {/* ================= END NG BAGONG DATE PICKER ================= */}

            <div className="space-y-4 pb-4 w-full">
              {loading ? (
                // ================= SKELETON LOADER =================
                <div className="space-y-4 w-full animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border-2 border-gray-100 rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3 w-full overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0 flex-1 pt-0.5">
                          <div className="h-6 w-32 bg-slate-200 rounded mb-1"></div>
                          <div className="h-4 w-48 bg-slate-200 rounded mb-1"></div>
                          <div className="h-3 w-24 bg-slate-200 rounded mt-2"></div>
                        </div>
                        <div className="h-6 w-16 bg-slate-200 rounded-full mt-0.5 shrink-0"></div>
                      </div>
                      <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px] gap-2 w-full mt-1">
                        <div className="h-4 w-40 bg-slate-200 rounded flex-1"></div>
                        <div className="h-6 w-16 bg-slate-200 rounded shrink-0"></div>
                      </div>
                    </div>
                  ))}
                </div>
                // ================= END SKELETON LOADER =================
              ) : orders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-bold italic">{globalError ? "Invalid date range." : "No orders found."}</div>
              ) : (
                orders.map((order) => (
                  <div key={order.id} className="border-2 border-[#1e3d58] rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3 w-full overflow-hidden">

                    {/* Top Row: Flexbox logic to prevent badge/text overflow */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1 pt-0.5">
                        <h3 className="text-lg font-black text-[#1e3d58] break-words leading-tight">{order.id}</h3>
                        <p className="text-sm font-bold text-gray-500 whitespace-normal break-words leading-tight mt-0.5">{order.name} • {order.zone}</p>
                        <p className="text-xs font-semibold text-gray-400 mt-1">{order.date}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs font-black shrink-0 whitespace-nowrap mt-0.5 ${getStatusColor(order.status)}`}>
                        {order.status}
                      </div>
                    </div>

                    {/* Bottom Row: Flexbox logic to keep prices aligned securely */}
                    <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px] gap-2 w-full">
                      <div className="text-sm font-bold text-[#1e3d58] min-w-0 flex-1 whitespace-normal break-words leading-tight">
                        Slim: <span className="text-[#43b0f1] font-black">{order.slim}</span> | Round: <span className="text-[#43b0f1] font-black">{order.round}</span>
                      </div>
                      <div className="text-lg font-black text-[#43b0f1] shrink-0">₱{order.total}</div>
                    </div>

                  </div>
                ))
              )}
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

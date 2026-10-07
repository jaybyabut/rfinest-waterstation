"use client";

import React, { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import QueueCard, { QueueOrder } from "./queue-card"; 
import { getQueueOrders } from "@/app/actions/getQueueOrders";
import { createClient } from "@/lib/supabase/client";

const ITEMS_PER_PAGE = 4;

interface OrderItemRecord {
  quantity: number;
  products?: { product_name: string } | null;
}

interface RawOrderRecord {
  order_id: string;
  transaction_type: string;
  current_status: string;
  name: string;
  address: string | null;
  location_pricing?: { location_name: string } | null;
  note?: string | null;
  order_items?: OrderItemRecord[] | null;
}

export default function LiveQueueDisplay() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [orders, setOrders] = useState<RawOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageResetToken, setPageResetToken] = useState(0); 

  const prevOrderCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isInitialLoad = useRef(true); // Safety guard for initial refresh

  const fetchOrders = async () => {
    const data = await getQueueOrders();
    if (data && !('error' in data)) {
      const fetchedOrders = data as unknown as RawOrderRecord[];
      const currentCount = fetchedOrders.length;
      const newTotalPages = Math.ceil(currentCount / ITEMS_PER_PAGE);

      // JUMP LOGIC: Tatalon lang kung hindi ito ang unang load AT nadagdagan ang orders
      if (!isInitialLoad.current && currentCount > prevOrderCount.current) {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.log("Audio play blocked by browser:", err);
          });
        }
        
        // Explicit jump to the last page
        const targetPage = newTotalPages > 0 ? newTotalPages - 1 : 0;
        setCurrentPage(targetPage);
        setPageResetToken(Date.now()); // Restart pagination timer from 0
      } 
      else if (mounted) {
        // Auto-adjust page index if items were deleted or marked done
        setCurrentPage(prev => {
          if (prev >= newTotalPages && newTotalPages > 0) return newTotalPages - 1;
          if (newTotalPages === 0) return 0;
          return prev;
        });
      }
      
      prevOrderCount.current = currentCount;
      setOrders(fetchedOrders);
      isInitialLoad.current = false; // Initial load is finished
    } else {
      console.error("Failed to fetch orders:", data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    setTime(new Date()); 

    audioRef.current = new Audio("/bell.wav");
    
    fetchOrders();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const pollingTimer = setInterval(() => {
      fetchOrders();
    }, 10000);

    const supabase = createClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders(); 
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      clearInterval(pollingTimer);
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) {
      setCurrentPage(0);
      return;
    }
    
    // 7 SECONDS INTERVAL + RESET TOKEN DEPENDENCY
    const pageTimer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 7000); 

    return () => clearInterval(pageTimer);
  }, [totalPages, pageResetToken]); 

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const visibleOrdersData = orders.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const mappedOrders: QueueOrder[] = visibleOrdersData.map((order) => {
    let qtySlim = 0;
    let qtyRound = 0;

    order.order_items?.forEach((item) => {
      const productName = (Array.isArray(item.products) ? item.products[0]?.product_name : item.products?.product_name || "").toLowerCase();
      if (productName.includes("slim")) {
        qtySlim += item.quantity;
      } else if (productName.includes("round")) {
        qtyRound += item.quantity;
      }
    });

    let status = (order.current_status || "Pending").toUpperCase();
    
    if (status === "OUT FOR DELIVERY") status = "DELIVER";
    if (status === "PROCESSING") status = "REFILL";
    if (status === "PICK-UP" || status === "PICK UP") status = "PICKUP";

    const isWalkIn = order.transaction_type?.toLowerCase().includes("walk-in") || order.name?.toLowerCase().includes("walk-in");
    if (isWalkIn && (status === "PENDING" || status === "PICKUP")) status = "REFILL";

    const locName = order.location_pricing?.location_name || "";
    const rawAddress = order.address || "No Address Provided";
    const rawId = order.order_id?.toString() || "";
    const idParts = rawId.split('-');
    const displayId = idParts.length > 1 ? idParts[0].substring(0, 8).toUpperCase() : rawId.substring(0, 8).toUpperCase();

    return {
      id: displayId,
      status: status,
      name: order.name,
      address: rawAddress,
      zone: locName,
      qtySlim,
      qtyRound,
      notes: order.note || ""
    };
  });

  return (
    <div className="h-[100dvh] w-full bg-slate-50 p-4 sm:p-6 lg:p-8 2xl:p-12 flex flex-col relative overflow-hidden">
      
      <button
        onClick={toggleFullscreen}
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 2xl:top-12 2xl:right-12 z-50 p-2 sm:p-3 2xl:p-4 rounded-full transition-all duration-300 shadow-md ${
          isFullscreen 
            ? "opacity-0 hover:opacity-100 bg-black/50 text-white" 
            : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
        }`}
        title={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
      >
        {isFullscreen ? <Minimize size={24} className="sm:w-7 sm:h-7 2xl:w-10 2xl:h-10" strokeWidth={2.5} /> : <Maximize size={24} className="sm:w-7 sm:h-7 2xl:w-10 2xl:h-10" strokeWidth={2.5} />}
      </button>

      <div className="mb-4 sm:mb-6 2xl:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 border-b-2 border-slate-200 pb-3 sm:pb-4 2xl:pb-6 shrink-0">
        <div className="w-full sm:w-auto flex flex-row items-baseline gap-3 sm:gap-4 2xl:gap-6 flex-wrap">
          {mounted && time ? (
            <>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-7xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl 2xl:text-3xl font-bold text-slate-500 uppercase tracking-widest leading-none">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </>
          ) : (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl 2xl:text-7xl font-black text-slate-300 uppercase leading-none">LOADING TIME...</h1>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-200 px-4 sm:px-6 2xl:px-8 py-2 sm:py-3 2xl:py-4 rounded-xl 2xl:rounded-2xl self-end sm:self-auto mt-2 sm:mt-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl 2xl:text-4xl font-black text-slate-700 tracking-widest leading-none">
              PAGE {currentPage + 1} OF {totalPages}
            </h2>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 w-full flex flex-col gap-4 sm:gap-6 lg:gap-8 transition-all duration-500 pb-2 sm:pb-4 2xl:pb-0">
        {mappedOrders.map((order) => (
          <QueueCard key={order.id} order={order} />
        ))}

        {mappedOrders.length > 0 && mappedOrders.length < ITEMS_PER_PAGE && (
          Array.from({ length: ITEMS_PER_PAGE - mappedOrders.length }).map((_, i) => (
            <div key={`spacer-${i}`} style={{ flex: 1 }} className="min-h-0 w-full invisible pointer-events-none"></div>
          ))
        )}

        {!loading && orders.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 px-4 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl 2xl:text-8xl font-black uppercase">No Active Orders</h1>
            <p className="text-lg sm:text-xl lg:text-2xl 2xl:text-4xl font-bold mt-2 sm:mt-4 2xl:mt-6">Waiting for new requests...</p>
          </div>
        )}

        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 px-4 text-center">
             <span className="text-2xl sm:text-3xl lg:text-4xl 2xl:text-6xl animate-pulse uppercase font-black">Updating Queue...</span>
          </div>
        )}
      </div>
    </div>
  );
}

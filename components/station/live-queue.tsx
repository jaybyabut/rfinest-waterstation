"use client";

import React, { useState, useEffect, useRef } from "react";
import { Maximize, Minimize } from "lucide-react";
import QueueCard, { QueueOrder } from "./queue-card"; 
import { getQueueOrders } from "@/app/actions/getQueueOrders";
import { createClient } from "@/lib/supabase/client";

const ITEMS_PER_PAGE = 5;

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

  // Ginamit para i-trigger ang pag-reset ng 7-second timer kapag may bagong order
  const [pageResetToken, setPageResetToken] = useState(0); 

  const prevOrderCount = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchOrders = async () => {
    const data = await getQueueOrders();
    if (data && !('error' in data)) {
      const fetchedOrders = data as unknown as RawOrderRecord[];
      const newTotalPages = Math.ceil(fetchedOrders.length / ITEMS_PER_PAGE);

      // KAPAG MAY BAGONG ORDER LANG TAYO MAG-JUJUMP
      if (mounted && fetchedOrders.length > prevOrderCount.current) {
        if (audioRef.current) {
          audioRef.current.play().catch((err) => {
            console.log("Audio play blocked by browser:", err);
          });
        }
        
        // Jump to the latest page
        if (newTotalPages > 0) {
          setCurrentPage(newTotalPages - 1); 
        } else {
          setCurrentPage(0);
        }

        // Trigger the 7-second timer reset!
        setPageResetToken(prev => prev + 1); 
      } 
      // KUNG NORMAL UPDATE LANG (eg. nag-mark as delivered/na-delete ang order)
      else if (mounted) {
        // Prevent blank pages if orders are reduced and current page is now empty
        if (currentPage >= newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages - 1);
        } else if (newTotalPages === 0) {
          setCurrentPage(0);
        }
      }
      
      prevOrderCount.current = fetchedOrders.length;
      setOrders(fetchedOrders);
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
          // Removed the reload logic so the TV can show the latest order for exactly 7 seconds.
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

    // Kapag nagbago ang pageResetToken (dahil may new order), ma-ki-clear ang timer na ito 
    // at magsisimula ulit ng fresh 7 seconds, then babalik siya sa Page 1 (index 0).
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
    
    // BACKEND SYNC: Map based on user's simplified labels
    if (status === "OUT FOR DELIVERY") status = "DELIVER";
    if (status === "PROCESSING") status = "REFILL";
    if (status === "PICK-UP" || status === "PICK UP") status = "PICKUP";

    // BULLETPROOF WALK-IN CHECK
    const isWalkIn = 
      order.transaction_type?.toLowerCase().includes("walk-in") || 
      order.name?.toLowerCase().includes("walk-in");

    // FORCING WALK-IN ORDERS TO REFILL
    if (isWalkIn && (status === "PENDING" || status === "PICKUP")) {
      status = "REFILL";
    }

    const locName = order.location_pricing?.location_name || "";
    const fullAddress = [order.address, locName].filter(Boolean).join(" | ");

    const rawId = order.order_id?.toString() || "";
    const idParts = rawId.split('-');
    
    const displayId = idParts.length > 1 
      ? idParts[0].substring(0, 8).toUpperCase() 
      : rawId.substring(0, 8).toUpperCase();

    return {
      id: displayId,
      status: status,
      name: order.name,
      address: fullAddress || "No Address Provided",
      qtySlim,
      qtyRound,
      notes: order.note || ""
    };
  });

  return (
    <div className="h-screen w-full bg-slate-50 p-4 sm:p-6 lg:p-8 max-h-[900px]:p-4 flex flex-col relative overflow-hidden">
      
      <button
        onClick={toggleFullscreen}
        className={`absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 max-h-[900px]:top-4 max-h-[900px]:right-4 z-50 p-2 sm:p-3 rounded-full transition-all duration-300 shadow-md ${
          isFullscreen 
            ? "opacity-0 hover:opacity-100 bg-black/50 text-white" 
            : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
        }`}
        title={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
      >
        {isFullscreen ? <Minimize size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} /> : <Maximize size={24} className="sm:w-7 sm:h-7" strokeWidth={2.5} />}
      </button>

      {/* Responsive One-Liner Header */}
      <div className="mb-4 sm:mb-6 max-h-[900px]:mb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-0 border-b-2 border-slate-200 pb-3 sm:pb-4 max-h-[900px]:pb-2 shrink-0">
        <div className="w-full sm:w-auto flex flex-row items-baseline gap-3 sm:gap-4 flex-wrap">
          {mounted && time ? (
            <>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl max-h-[900px]:text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl max-h-[900px]:text-base font-bold text-slate-500 uppercase tracking-widest leading-none">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </>
          ) : (
            <h1 className="text-3xl sm:text-4xl lg:text-5xl max-h-[900px]:text-3xl font-black text-slate-300 uppercase leading-none">LOADING TIME...</h1>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-200 px-4 sm:px-6 py-2 sm:py-3 rounded-xl self-end sm:self-auto mt-2 sm:mt-0">
            <h2 className="text-lg sm:text-xl lg:text-2xl max-h-[900px]:text-lg font-black text-slate-700 tracking-widest leading-none">
              PAGE {currentPage + 1} OF {totalPages}
            </h2>
          </div>
        )}
      </div>

      <div className="flex-1 w-full grid grid-rows-5 gap-3 sm:gap-4 lg:gap-6 max-h-[900px]:gap-2 transition-all duration-500 pb-2 sm:pb-4">
        {mappedOrders.map((order) => (
          <QueueCard key={order.id} order={order} />
        ))}

        {!loading && orders.length === 0 && (
          <div className="row-span-5 flex flex-col items-center justify-center text-slate-300 px-4 text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase">No Active Orders</h1>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold mt-2 sm:mt-4">Waiting for new requests...</p>
          </div>
        )}

        {loading && (
          <div className="row-span-5 flex flex-col items-center justify-center text-slate-300 px-4 text-center">
             <span className="text-2xl sm:text-3xl lg:text-4xl animate-pulse uppercase font-black">Updating Queue...</span>
          </div>
        )}
      </div>
    </div>
  );
}

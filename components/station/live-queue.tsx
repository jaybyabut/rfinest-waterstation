"use client";

import React, { useState, useEffect } from "react";
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

  const fetchOrders = async () => {
    const data = await getQueueOrders();
    if (data && !('error' in data)) {
      setOrders(data as unknown as RawOrderRecord[]);
    } else {
      console.error("Failed to fetch orders:", data.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
    setTime(new Date()); 
    
    fetchOrders();

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    const supabase = createClient();
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchOrders();

          window.location.reload();
          
        }
      )
      .subscribe();

    return () => {
      clearInterval(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);

  useEffect(() => {
    if (totalPages <= 1) {
      setCurrentPage(0);
      return;
    }
    
    const pageTimer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000); 

    return () => clearInterval(pageTimer);
  }, [totalPages]);

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

  // Map DB orders to strictly typed QueueCard format
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
    if (status === "PICK-UP") status = "PICKUP";

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
    <div className="h-screen w-full bg-slate-50 p-8 max-h-[900px]:p-4 flex flex-col relative overflow-hidden">
      
      <button
        onClick={toggleFullscreen}
        className={`absolute top-8 right-8 max-h-[900px]:top-4 max-h-[900px]:right-4 z-50 p-3 rounded-full transition-all duration-300 shadow-md ${
          isFullscreen 
            ? "opacity-0 hover:opacity-100 bg-black/50 text-white" 
            : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
        }`}
        title={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
      >
        {isFullscreen ? <Minimize size={28} strokeWidth={2.5} /> : <Maximize size={28} strokeWidth={2.5} />}
      </button>

      <div className="mb-6 max-h-[900px]:mb-3 flex justify-between items-end border-b-2 border-slate-200 pb-4 max-h-[900px]:pb-2 shrink-0">
        <div>
          {mounted && time ? (
            <>
              <h1 className="text-6xl max-h-[900px]:text-4xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-2xl max-h-[900px]:text-sm font-bold text-slate-500 uppercase mt-2 max-h-[900px]:mt-1 tracking-widest">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </>
          ) : (
            <h1 className="text-6xl max-h-[900px]:text-4xl font-black text-slate-300 uppercase">LOADING TIME...</h1>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-200 px-6 max-h-[900px]:px-4 py-3 max-h-[900px]:py-2 rounded-xl">
            <h2 className="text-3xl max-h-[900px]:text-xl font-black text-slate-700 tracking-widest leading-none">
              PAGE {currentPage + 1} OF {totalPages}
            </h2>
          </div>
        )}
      </div>

      <div className="flex-1 w-full grid grid-rows-5 gap-6 max-h-[900px]:gap-2 transition-all duration-500 pb-4">
        {mappedOrders.map((order) => (
          <QueueCard key={order.id} order={order} />
        ))}

        {!loading && orders.length === 0 && (
          <div className="row-span-5 flex flex-col items-center justify-center text-slate-300">
            <h1 className="text-6xl font-black uppercase">No Active Orders</h1>
            <p className="text-2xl font-bold mt-4">Waiting for new requests...</p>
          </div>
        )}

        {loading && (
          <div className="row-span-5 flex flex-col items-center justify-center text-slate-300">
             <span className="text-3xl animate-pulse uppercase font-black">Updating Queue...</span>
          </div>
        )}
      </div>
    </div>
  );
}

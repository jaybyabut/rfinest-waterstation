"use client";

import React, { useState, useEffect } from "react";
import { Maximize, Minimize } from "lucide-react";
import QueueCard from "./queue-card";

// TODO: BACKEND - Burahin itong mockOrders kapag connected na sa Supabase.
const mockOrders = [
  { id: "101", location: "Block 1 Lot 8 Bulaon", status: "PICKUP", qtyRound: 5, qtySlim: 7 },
  { id: "102", location: "Walk-in", status: "REFILL", qtyRound: 5, qtySlim: 7 },
  { id: "103", location: "Block 1 Lot 8 Mexico", status: "DELIVER", qtyRound: 3, qtySlim: 0, notes: "Paki-iwan sa gate perds." },
  { id: "104", location: "Block 1 Lot 8 Calulut", status: "PICKUP", qtyRound: 0, qtySlim: 10 },
  { id: "105", location: "Walk-in", status: "REFILL", qtyRound: 2, qtySlim: 0 },
  { id: "106", location: "Golden Haven", status: "DELIVER", qtyRound: 8, qtySlim: 2 },
  { id: "107", location: "Block 1 Lot 8 Montana", status: "PICKUP", qtyRound: 4, qtySlim: 0 },
  { id: "108", location: "Walk-in", status: "REFILL", qtyRound: 1, qtySlim: 1 },
];

const ITEMS_PER_PAGE = 5;

export default function LiveQueueDisplay() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const totalPages = Math.ceil(mockOrders.length / ITEMS_PER_PAGE);

  useEffect(() => {
    setMounted(true);
    setTime(new Date()); 
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (totalPages <= 1) return; 
    
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

  const visibleOrders = mockOrders.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

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

      <div className="mb-6 max-h-[900px]:mb-3 flex justify-between items-end border-b-2 border-slate-200 pb-4 max-h-[900px]:pb-2 pr-20 shrink-0">
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

      {/* FIX: Ginamitan na natin ng CSS Grid na may fixed 5 rows. Kahit ilan pa ang laman, naka-lock sa 5 slots! */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-rows-5 gap-4 max-h-[900px]:gap-2 transition-all duration-500 pb-4">
        {visibleOrders.map((order) => (
          <QueueCard key={order.id} order={order} />
        ))}

        {mockOrders.length === 0 && (
          <div className="row-span-5 flex flex-col items-center justify-center text-slate-300">
            <h1 className="text-6xl font-black uppercase">No Active Orders</h1>
            <p className="text-2xl font-bold mt-4">Waiting for new requests...</p>
          </div>
        )}
      </div>
    </div>
  );
}

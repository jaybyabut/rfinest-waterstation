"use client";

import React, { useState, useEffect } from "react";
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
  
  // FIX: Ginawa nating "null" sa simula para hindi magalit si Next.js
  const [time, setTime] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(mockOrders.length / ITEMS_PER_PAGE);

  // CLOCK LOGIC
  useEffect(() => {
    setMounted(true);
    setTime(new Date()); // Dito natin unang ibibigay yung totoong oras
    
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // AUTO-PAGINATION LOGIC
  useEffect(() => {
    if (totalPages <= 1) return; 
    
    const pageTimer = setInterval(() => {
      setCurrentPage((prevPage) => (prevPage + 1) % totalPages);
    }, 10000); 

    return () => clearInterval(pageTimer);
  }, [totalPages]);

  const visibleOrders = mockOrders.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col">
      
      {/* HEADER SECTION */}
      <div className="mb-8 flex justify-between items-end border-b-2 border-slate-200 pb-4">
        <div>
          {/* FIX: Iche-check kung may laman na yung 'time' bago ipakita */}
          {mounted && time ? (
            <>
              <h1 className="text-6xl font-black text-slate-900 tracking-tight uppercase">
                {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </h1>
              <p className="text-2xl font-bold text-slate-500 uppercase mt-2 tracking-widest">
                {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </>
          ) : (
            <h1 className="text-6xl font-black text-slate-300 uppercase">LOADING TIME...</h1>
          )}
        </div>

        {totalPages > 1 && (
          <div className="bg-slate-200 px-6 py-3 rounded-xl">
            <h2 className="text-3xl font-black text-slate-700 tracking-widest">
              PAGE {currentPage + 1} OF {totalPages}
            </h2>
          </div>
        )}
      </div>

      {/* LIST SECTION */}
      <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col transition-all duration-500">
        
        {visibleOrders.map((order) => (
          <QueueCard key={order.id} order={order} />
        ))}

        {mockOrders.length === 0 && (
          <div className="py-32 flex flex-col items-center justify-center text-slate-300">
            <h1 className="text-6xl font-black uppercase">No Active Orders</h1>
            <p className="text-2xl font-bold mt-4">Waiting for new requests...</p>
          </div>
        )}
      </div>
    </div>
  );
}

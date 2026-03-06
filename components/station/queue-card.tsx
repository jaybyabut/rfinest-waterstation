"use client";

import React from "react";
import { Bike, Droplets, MapPin } from "lucide-react";

// TODO: BACKEND - Gumawa ng TypeScript Interface para sa 'order' prop 
// base sa schema ng 'ORDERS' at 'ORDER_ITEMS' tables niyo sa Supabase.
export default function QueueCard({ order }: { order: any }) {
  let borderColor = "";
  let textColor = "";
  let icon = null;
  let statusLabel = "";
  let mainInstruction = "";

  // TODO: BACKEND - Siguraduhing tumutugma ang string values sa baba
  // (e.g., "PICKUP", "REFILL") sa kung ano man ang naka-save sa database niyo.
  switch (order.status) {
    case "PICKUP":
      borderColor = "border-l-orange-500";
      textColor = "text-orange-600";
      icon = <Bike size={56} strokeWidth={2.5} />;
      statusLabel = "PICKUP";
      mainInstruction = order.location;
      break;

    case "REFILL":
      borderColor = "border-l-blue-500";
      textColor = "text-blue-600";
      icon = <Droplets size={56} strokeWidth={2.5} />;
      statusLabel = "REFILL";
      
      // TODO: BACKEND - I-map ito nang tama kung naka-hiwalay sa 'ORDER_ITEMS' table.
      const items = [
        order.qtySlim > 0 ? `${order.qtySlim} SLIM` : null,
        order.qtyRound > 0 ? `${order.qtyRound} ROUND` : null
      ].filter(Boolean).join(" & ");
      mainInstruction = items;
      break;

    case "DELIVER":
      borderColor = "border-l-green-500";
      textColor = "text-green-600";
      icon = <MapPin size={56} strokeWidth={2.5} />;
      statusLabel = "DELIVER";
      mainInstruction = order.location;
      break;
  }

  return (
    <div className={`flex items-center w-full p-6 mb-4 bg-white rounded-2xl border border-slate-200 border-l-[16px] shadow-sm transition-all hover:shadow-md ${borderColor}`}>
      
      {/* 1. Status & Icon (Left) */}
      <div className={`flex flex-col items-center justify-center w-48 border-r-2 border-slate-100 pr-6 mr-6 ${textColor}`}>
        {icon}
        <span className="font-bold text-2xl uppercase tracking-widest mt-2">{statusLabel}</span>
      </div>

      {/* 2. Main Instruction (Center - Pinakamalaki) */}
      <div className="flex-1">
        <p className="text-6xl font-black text-slate-800 tracking-tight uppercase">
          {mainInstruction}
        </p>
        
        {/* CONDITIONAL RENDERING: Lilitaw lang kung Deliver ang status AT may notes */}
        {/* TODO: BACKEND - I-connect sa 'Customer_Notes' column niyo */}
        {order.status === "DELIVER" && order.notes && (
          <p className="text-3xl font-bold text-slate-500 italic mt-3 flex items-center gap-3">
            <span className="bg-slate-100 px-4 py-1 rounded-md not-italic text-xl">NOTE</span> 
            "{order.notes}"
          </p>
        )}
      </div>

      {/* 3. Order ID (Right - Pinalaki at inalis ang name) */}
      <div className="w-64 text-right pl-6 border-l-2 border-slate-100 flex flex-col justify-center">
        <span className="text-2xl font-bold text-slate-400 uppercase tracking-widest mb-1">Order No.</span>
        
        {/* TODO: BACKEND - Palitan ng actual 'Order_ID' galing database */}
        <span className="text-7xl font-black text-slate-900 tracking-tighter">#{order.id}</span>
      </div>

    </div>
  );
}

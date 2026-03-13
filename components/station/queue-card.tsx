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
  switch (order.status) {
    case "PICKUP":
      borderColor = "border-l-orange-500";
      textColor = "text-orange-600";
      icon = <Bike className="w-[5vh] h-[5vh]" strokeWidth={2.5} />;
      statusLabel = "PICKUP";
      mainInstruction = order.location;
      break;

    case "REFILL": {
      borderColor = "border-l-blue-500";
      textColor = "text-blue-600";
      icon = <Droplets className="w-[5vh] h-[5vh]" strokeWidth={2.5} />;
      statusLabel = "REFILL";
      
      // TODO: BACKEND - I-map ito nang tama kung naka-hiwalay sa 'ORDER_ITEMS' table.
      const items = [
        order.qtySlim > 0 ? `${order.qtySlim} SLIM` : null,
        order.qtyRound > 0 ? `${order.qtyRound} ROUND` : null
      ].filter(Boolean).join(" & ");
      mainInstruction = items;
      break;
    }

    case "DELIVER":
      borderColor = "border-l-green-500";
      textColor = "text-green-600";
      icon = <MapPin className="w-[5vh] h-[5vh]" strokeWidth={2.5} />;
      statusLabel = "DELIVER";
      mainInstruction = order.location;
      break;
  }

  return (

    <div className={`flex items-center w-full p-[2vh] bg-white rounded-2xl border border-slate-200 border-l-[1.2vh] shadow-sm transition-all h-full ${borderColor}`}>
      
      <div className={`flex flex-col items-center justify-center w-[15vw] max-w-[200px] border-r-2 border-slate-100 pr-[2vw] mr-[2vw] ${textColor}`}>
        {icon}
        <span className="font-bold text-[1.8vh] uppercase tracking-widest mt-[1vh]">{statusLabel}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <p className="text-[4vh] font-black text-slate-800 tracking-tight uppercase leading-none">
          {mainInstruction}
        </p>
   
        {order.status === "DELIVER" && order.notes && (
          <p className="text-[2.2vh] font-bold text-slate-500 italic mt-[1vh] flex items-center gap-[1vw]">
            <span className="bg-slate-100 px-[1vw] py-[0.5vh] rounded-md not-italic text-[1.8vh]">NOTE</span> 
            `{order.notes}`
          </p>
        )}
      </div>

      <div className="w-[15vw] max-w-[220px] text-right pl-[2vw] border-l-2 border-slate-100 flex flex-col justify-center">
        <span className="text-[1.5vh] font-bold text-slate-400 uppercase tracking-widest mb-[0.5vh]">Order No.</span>
        
        {/* TODO: BACKEND - Palitan ng actual 'Order_ID' galing database */}
        <span className="text-[6vh] font-black text-slate-900 tracking-tighter leading-none">#{order.id}</span>
      </div>

    </div>
  );
}

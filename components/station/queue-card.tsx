"use client";

import React from "react";
import { Bike, Droplets, MapPin } from "lucide-react";

export interface QueueOrder {
  id: string;
  status: "PICKUP" | "REFILL" | "DELIVER" | string;
  location: string;
  qtySlim: number;
  qtyRound: number;
  notes: string;
}

export default function QueueCard({ order }: { order: QueueOrder }) {
  let borderColor = "";
  let textColor = "";
  let icon = null;
  let statusLabel = "";
  let mainInstruction = "";

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
      
      <div className={`flex flex-col items-center justify-center w-[20vw] max-w-[300px] border-r-4 border-slate-100 pr-[3vw] mr-[3vw] shrink-0 ${textColor}`}>
        {icon}
        <span className="font-bold text-[1.8vh] uppercase tracking-widest mt-[1vh]">{statusLabel}</span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-[1vh] overflow-hidden">
        <p className="text-[4.5vh] font-black text-slate-800 tracking-tight uppercase leading-none truncate w-full">
          {mainInstruction}
        </p>
   
        {order.status === "DELIVER" && order.notes && (
          <p className="text-[2.2vh] font-bold text-slate-500 italic mt-[1vh] flex items-center gap-[1vw] truncate w-full">
            <span className="bg-slate-100 px-[1vw] py-[0.5vh] rounded-md not-italic text-[1.8vh] shrink-0">NOTE</span> 
            <span className="truncate">{order.notes}</span>
          </p>
        )}
      </div>

      <div className="w-[25vw] max-w-[400px] text-right pl-[2vw] border-l-4 border-slate-100 flex flex-col justify-center shrink-0 overflow-hidden">
        <span className="text-[1.5vh] font-bold text-slate-400 uppercase tracking-widest mb-[0.5vh]">Order ID</span>
        <span 
          className="text-[4vh] 2xl:text-[5vh] font-black text-slate-900 tracking-tighter leading-none truncate w-full"
          title={order.id}
        >
          {order.id}
        </span>
      </div>

    </div>
  );
}

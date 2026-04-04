"use client";

import React from "react";
import { Bike, Droplets, MapPin, ShoppingBag } from "lucide-react";

export interface QueueOrder {
  id: string;
  status: string;
  name: string;
  address: string;
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
  let subInstruction = "";

  const currentStatus = order.status.toUpperCase();

  switch (currentStatus) {
    case "PENDING":
    case "PICKUP":
      borderColor = "border-l-orange-500";
      textColor = "text-orange-600";
      icon = <ShoppingBag className="w-[4vh] h-[4vh]" strokeWidth={2.5} />;
      statusLabel = "PICKUP";
      mainInstruction = order.address;
      subInstruction = order.name;
      break;

    case "REFILL":
    case "PROCESSING":
    case "REFILLED":
      borderColor = "border-l-blue-500";
      textColor = "text-blue-600";
      icon = <Droplets className="w-[4vh] h-[4vh]" strokeWidth={2.5} />;
      statusLabel = "REFILL";
      
      const itemsArr = [];
      if (order.qtySlim > 0) itemsArr.push(`${order.qtySlim} SLIM`);
      if (order.qtyRound > 0) itemsArr.push(`${order.qtyRound} ROUND`);
      
      mainInstruction = itemsArr.length > 0 ? itemsArr.join(" | ") : "Containers";
      subInstruction = order.name; // Keep name as secondary for refill
      break;

    case "DELIVER":
    case "OUT FOR DELIVERY":
      borderColor = "border-l-green-500";
      textColor = "text-green-600";
      icon = <MapPin className="w-[4vh] h-[4vh]" strokeWidth={2.5} />;
      statusLabel = "DELIVER";
      mainInstruction = order.address;
      subInstruction = order.name;
      break;
      
    default:
      borderColor = "border-l-slate-500";
      textColor = "text-slate-600";
      icon = <Bike className="w-[4vh] h-[4vh]" strokeWidth={2.5} />;
      statusLabel = currentStatus;
      mainInstruction = order.name;
      subInstruction = order.address;
      break;
  }

  return (
    <div className={`flex items-stretch w-full p-[2vh] bg-white rounded-2xl border border-slate-200 border-l-[1vh] shadow-sm transition-all h-full ${borderColor}`}>
      
      {/* STATUS ICON COLUMN */}
      <div className={`flex flex-col items-center justify-center w-[12vw] max-w-[180px] border-r-4 border-slate-100 pr-[1.5vw] mr-[1.5vw] shrink-0 ${textColor}`}>
        {icon}
        <span className="font-bold text-[1.5vh] uppercase tracking-widest mt-[0.5vh] leading-none text-center">
          {statusLabel}
        </span>
      </div>

      {/* MAIN CONTENT COLUMN */}
      <div className="flex-1 flex flex-col justify-center py-[0.5vh] pr-[3vw] min-w-0">
        <p className="text-[3.6vh] 2xl:text-[4.2vh] font-black text-slate-800 tracking-tight uppercase leading-tight line-clamp-1 w-full">
          {mainInstruction}
        </p>
        
        {subInstruction && (
          <div className="flex items-center gap-[0.5vw] mt-[0.5vh] w-full">
             <span className="text-[2vh] font-bold text-slate-500 uppercase tracking-tight truncate w-full leading-none">
              {subInstruction}
            </span>
          </div>
        )}
   
        {(currentStatus === "OUT FOR DELIVERY" || currentStatus === "DELIVER") && order.notes && (
          <div className="flex items-center gap-[1vw] mt-[1vh] w-full">
            <span className="bg-slate-100 px-[1vw] py-[0.5vh] rounded-md font-bold text-slate-500 text-[1.5vh] tracking-wider shrink-0 leading-none">
              NOTE
            </span> 
            <p className="text-[2vh] font-bold text-slate-500 italic truncate w-full leading-none mt-[0.2vh]">
              {order.notes}
            </p>
          </div>
        )}
      </div>

      {/* ORDER ID COLUMN */}
      <div className="w-[25vw] max-w-[400px] text-right pl-[2vw] border-l-4 border-slate-100 flex flex-col justify-center shrink-0">
        <span className="block text-[1.5vh] font-bold text-slate-400 uppercase tracking-widest mb-[0.5vh]">
          Order No.
        </span>
        <span 
          className="text-[3vh] 2xl:text-[3.8vh] font-black text-slate-900 tracking-tighter leading-none break-all whitespace-normal block w-full"
        >
          ORD-{order.id}
        </span>
      </div>

    </div>
  );
}

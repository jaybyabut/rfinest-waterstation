"use client";

import React, { useEffect, useRef, useState } from "react";
import { Bike, Droplets, MapPin, ShoppingBag } from "lucide-react";

export interface QueueOrder {
  id: string;
  status: string;
  name: string;
  address: string;
  zone?: string;
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
  const isWalkIn = 
    order.name.toLowerCase().includes("walk-in") || 
    order.address.toLowerCase().includes("walk-in") || 
    (order.zone?.toLowerCase().includes("walk-in") ?? false);

  const hasNotes = !isWalkIn && order.notes && order.notes.toLowerCase() !== "ordered via kiosk" && order.notes.trim() !== "";

  switch (currentStatus) {
    case "PENDING":
    case "PICKUP":
      borderColor = "border-l-orange-500";
      textColor = "text-orange-600";
      icon = <ShoppingBag className="w-[8vh] h-[8vh]" strokeWidth={2.5} />;
      statusLabel = "PICKUP";
      mainInstruction = order.address;
      subInstruction = order.name;
      break;

    case "REFILL":
    case "PROCESSING":
    case "REFILLED":
      borderColor = "border-l-blue-500";
      textColor = "text-blue-600";
      icon = <Droplets className="w-[8vh] h-[8vh]" strokeWidth={2.5} />;
      statusLabel = "REFILL";
      const itemsArr = [];
      if (order.qtySlim > 0) itemsArr.push(`${order.qtySlim} SLIM`);
      if (order.qtyRound > 0) itemsArr.push(`${order.qtyRound} ROUND`);
      mainInstruction = itemsArr.length > 0 ? itemsArr.join(" | ") : "Containers";
      subInstruction = order.name;
      break;

    case "DELIVER":
    case "OUT FOR DELIVERY":
      borderColor = "border-l-green-500";
      textColor = "text-green-600";
      icon = <MapPin className="w-[8vh] h-[8vh]" strokeWidth={2.5} />;
      statusLabel = "DELIVER";
      mainInstruction = order.address;
      subInstruction = order.name;
      break;
      
    default:
      borderColor = "border-l-slate-500";
      textColor = "text-slate-600";
      icon = <Bike className="w-[8vh] h-[8vh]" strokeWidth={2.5} />;
      statusLabel = currentStatus;
      mainInstruction = order.name;
      subInstruction = order.address;
      break;
  }

  if (!isWalkIn && order.zone && order.zone.trim() !== "") {
    subInstruction = `${order.name} | ${order.zone}`;
  }

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const mainTextRef = useRef<HTMLDivElement>(null);
  const [mainScale, setMainScale] = useState(1);

  const subContainerRef = useRef<HTMLDivElement>(null);
  const subTextRef = useRef<HTMLDivElement>(null);
  const [subScale, setSubScale] = useState(1);

  const noteContainerRef = useRef<HTMLDivElement>(null);
  const noteTextRef = useRef<HTMLDivElement>(null);
  const [noteScale, setNoteScale] = useState(1);

  useEffect(() => {
    const calculateScales = () => {
      if (mainContainerRef.current && mainTextRef.current) {
        const available = mainContainerRef.current.offsetWidth;
        const needed = mainTextRef.current.scrollWidth;
        setMainScale(needed > available && available > 0 ? Math.min(1, (available / needed) * 0.98) : 1);
      }
      if (subContainerRef.current && subTextRef.current) {
        const availableSub = subContainerRef.current.offsetWidth;
        const neededSub = subTextRef.current.scrollWidth;
        setSubScale(neededSub > availableSub && availableSub > 0 ? Math.min(1, (availableSub / neededSub) * 0.98) : 1);
      }
      if (noteContainerRef.current && noteTextRef.current) {
        const availableNote = noteContainerRef.current.offsetWidth;
        const neededNote = noteTextRef.current.scrollWidth;
        setNoteScale(neededNote > availableNote && availableNote > 0 ? Math.min(1, (availableNote / neededNote) * 0.98) : 1);
      }
    };
    calculateScales();
    window.addEventListener("resize", calculateScales);
    const timeout = setTimeout(calculateScales, 100);
    return () => {
      window.removeEventListener("resize", calculateScales);
      clearTimeout(timeout);
    };
  }, [mainInstruction, subInstruction, order.notes, isWalkIn]);

  return (
    <div 
      className={`flex items-stretch w-full p-[1.5vh] bg-white rounded-[2vh] border border-slate-200 border-l-[1.5vh] shadow-sm transition-all overflow-hidden ${borderColor}`}
      style={{ flex: isWalkIn ? 1 : 1.3 }}
    >
      <div className={`flex flex-col items-center justify-center w-[12vw] min-w-[120px] max-w-[200px] border-r-[0.3vh] border-slate-100 pr-[1.5vw] mr-[1.5vw] shrink-0 ${textColor}`}>
        {icon}
        <span className="font-black text-[2.2vh] uppercase tracking-widest mt-[1vh] leading-none text-center whitespace-nowrap">
          {statusLabel}
        </span>
      </div>

      <div className="flex-1 flex flex-col justify-center py-[0.5vh] pr-[2vw] min-w-0 w-full">
        
        {isWalkIn ? (
          <div ref={mainContainerRef} className="w-full flex items-center min-w-0">
            <div 
              ref={mainTextRef}
              className="flex flex-row items-center gap-[1vw] w-max whitespace-nowrap origin-left pb-[0.5vh]"
              style={{ transform: `scale(${mainScale})` }}
            >
              <span className="text-[7.5vh] font-black text-slate-800 tracking-tight uppercase leading-tight">
                {mainInstruction}
              </span>
              
              {subInstruction && (
                <>
                  <span className="text-[5vh] text-slate-300 font-black leading-tight">|</span>
                  <span className="text-[5vh] font-bold text-slate-500 uppercase tracking-tight leading-tight">
                    {subInstruction}
                  </span>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center w-full min-w-0 h-full gap-[0.5vh]">
            {/* INALIS ANG MGA HARDCODED HEIGHTS AT FLEX PROPORTIONS PARA HINDI MAPUTOL ANG BUNTOT NG LETTERS */}
            <div ref={mainContainerRef} className="w-full min-w-0 shrink-0 flex items-center">
              <div 
                ref={mainTextRef}
                className="w-max whitespace-nowrap origin-left pb-[0.3vh]"
                style={{ transform: `scale(${mainScale})` }}
              >
                <span className="text-[5vh] font-black text-slate-800 tracking-tight uppercase leading-tight">
                  {mainInstruction}
                </span>
              </div>
            </div>

            {subInstruction && (
              <div ref={subContainerRef} className="w-full min-w-0 shrink-0 flex items-center">
                <div 
                  ref={subTextRef}
                  className="w-max whitespace-nowrap origin-left pb-[0.3vh]"
                  style={{ transform: `scale(${subScale})` }}
                >
                  <span className="text-[3vh] font-bold text-slate-500 uppercase tracking-tight leading-tight">
                    {subInstruction}
                  </span>
                </div>
              </div>
            )}
            
            {hasNotes && (
              <div ref={noteContainerRef} className="w-full min-w-0 shrink-0 flex items-center mt-[0.5vh]">
                <div 
                  ref={noteTextRef}
                  className="flex items-center gap-[0.8vw] w-max whitespace-nowrap origin-left pb-[0.3vh]"
                  style={{ transform: `scale(${noteScale})` }}
                >
                  <span className="bg-slate-100 px-[0.8vw] py-[0.4vh] rounded-[0.6vh] font-black text-slate-500 text-[1.8vh] tracking-wider shrink-0 leading-normal whitespace-nowrap">
                    NOTE
                  </span> 
                  <span className="text-[2.2vh] font-bold text-slate-500 italic leading-normal">
                    {order.notes}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-[18vw] min-w-[150px] max-w-[250px] text-right pl-[2vw] border-l-[0.3vh] border-slate-100 flex flex-col justify-center shrink-0">
        <span className="block text-[2vh] font-bold text-slate-400 uppercase tracking-widest mb-[0.8vh] whitespace-nowrap">
          Order No.
        </span>
        <span className="text-[6.5vh] font-black text-slate-900 tracking-tighter leading-none whitespace-nowrap block w-full">
          #{order.id.slice(-5)}
        </span>
      </div>

    </div>
  );
}

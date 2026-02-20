"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, Search } from "lucide-react";

export default function EditOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [slimCount, setSlimCount] = useState(5);
  const [roundCount, setRoundCount] = useState(6);
  
  // sample onleh
  const name = "Januard Esguerra"; 
  const contact = "09123456789";
  const previousAmount = 300;
  const pricePerUnit = 30; 
  const newAmount = (slimCount + roundCount) * pricePerUnit;

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        <div className="flex w-full mb-6 rounded-full overflow-hidden border-2 border-[#1e3d58] shadow-sm">
          <Link href="/dashboard/order" className="flex-1 py-3 text-center text-lg font-bold bg-[#43b0f1] text-white hover:bg-[#3ba0db] transition-colors">
            Order
          </Link>
          <button className="flex-1 py-3 text-lg font-bold bg-[#1e3d58] text-white">
            Manage
          </button>
        </div>

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Edit Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="space-y-5">
              
              <div className="relative">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Order ID:</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. ORD-1024"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-white text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal" 
                  />
                  <button className="absolute right-2 top-2 bottom-2 bg-[#1e3d58] text-white px-4 rounded-full hover:bg-[#43b0f1] transition-colors flex items-center justify-center">
                    <Search size={20} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 opacity-80">
                <div>
                  <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Name:</label>
                  <input 
                    type="text" 
                    value={name}
                    readOnly
                    className="w-full h-14 px-6 rounded-full border-2 border-gray-400 bg-gray-100 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Contact:</label>
                  <input 
                    type="text" 
                    value={contact}
                    readOnly
                    className="w-full h-14 px-6 rounded-full border-2 border-gray-400 bg-gray-100 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none" 
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4">
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58]">
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58] border-t border-gray-100 pt-3">
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center pt-2">
                <span className="text-lg font-medium text-[#1e3d58] mb-1">
                  Previous Amount: ₱{previousAmount}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-medium text-[#1e3d58]">New Amount:</span>
                  <span className="text-4xl font-black text-[#43b0f1]">₱{newAmount}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-center">
                <Button className="w-5/6 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95">
                  Confirm Edit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

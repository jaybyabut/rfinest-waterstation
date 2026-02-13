"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminPlaceOrderPage() {
  const [slimCount, setSlimCount] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const totalAmount = (slimCount + roundCount) * 30 // palitan nyan to depende sa location dapat;

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        <div className="flex w-full mb-8 rounded-full overflow-hidden border-2 border-[#1e3d58] shadow-sm">
          <button className="flex-1 py-3 text-lg font-bold bg-[#1e3d58] text-white">
            Order
          </button>
          <Link href="/dashboard" className="flex-1 py-3 text-center text-lg font-bold bg-[#43b0f1] text-white hover:bg-[#3ba0db] transition-colors">
            Manage
          </Link>
        </div>

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white shadow-xl text-[#1e3d58]">
          <h1 className="text-5xl font-black mb-10 text-black tracking-tighter">Place Order</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="space-y-5">
              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Name:</label>
                <input type="text" className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Location:</label>
                <textarea 
                  className="w-full h-28 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] focus:outline-none resize-none" 
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Mobile Number:</label>
                <input type="text" className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] focus:outline-none" />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold">-</button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-3">
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold">-</button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 px-2">
                <span className="text-xl font-bold">Total Amount:</span>
                <span className="text-4xl font-black text-[#43b0f1]">₱{totalAmount}</span>
              </div>

              <div className="pt-4">
                <Button className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] transition-all active:scale-95">
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

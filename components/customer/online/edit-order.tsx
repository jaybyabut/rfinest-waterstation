"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

import ConfirmationModal from "@/components/ui/confirmation-modal"; 

export default function CustomerEditOrder() {
  /**
   * [GET] Fetch Existing Order: 
   * 1. I-fetch ang pinakabagong order ng user kung saan ang status ay 'Pending'.
   * 2. Kung walang 'Pending' order, i-redirect ang user pabalik sa /home o magpakita ng empty state.
   * 3. I-set ang initial states ng slimCount, roundCount, at previousAmount base sa data mula sa Supabase.
   */
  const userZone = "Bulaon"; 
  const pricePerGallon = 40; 
  const previousAmount = 400; 
  
  const [slimCount, setSlimCount] = useState(5); 
  const [roundCount, setRoundCount] = useState(6); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  const newAmount = (slimCount + roundCount) * pricePerGallon;

  const handleConfirmEdit = async () => {
    /**
     * [UPDATE] Update Order Details:
     * 1. I-update ang record sa 'orders' table gamit ang bagong slim_count, round_count, at total_amount.
     * 2. [VALIDATION]: Bago i-update, i-check muna sa server-side kung 'Pending' pa rin ang status.
     * - Kapag ang status ay naging 'Picked Up' na habang ine-edit ito, dapat mag-error at hindi ituloy ang update.
     * 3. Mag-trigger ng success notification pagkatapos ng successful update.
     */
    console.log("Order Updated to ₱" + newAmount);
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-10">
      <div className="w-full max-w-md">
        
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">
          
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/home" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Edit Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="space-y-5">
              
              <div>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Deliver to:</label>
                <div className="w-full h-14 px-6 flex items-center rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg">
                  {userZone}
                </div>
              </div>

              <div className="space-y-1 ml-2">
                <div className="text-xl font-bold text-[#1e3d58]">
                  Price per gallon: <span className="text-[#43b0f1]">₱{pricePerGallon}</span>
                </div>
                <div className="text-xl font-bold text-[#1e3d58]">
                  {/* [GET] I-display ang Payment Method na ginamit sa original order */}
                  Payment Method: <span className="text-[#43b0f1]">COD</span>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4 shadow-sm">
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

              <div className="flex flex-col items-center justify-center pt-2 space-y-1">
                <span className="text-lg font-bold text-gray-500">Previous Amount: ₱{previousAmount}</span>
                <div className="text-2xl font-bold text-[#1e3d58]">
                  New Amount: <span className="text-5xl font-black text-[#43b0f1] ml-2">₱{newAmount}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg"
                >
                  Confirm Edit
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmEdit}
        title="Update Order Details"
        message={`Are you sure you want to update your order? The new total amount will be ₱${newAmount}.`}
        confirmText="Save Changes"
      />

    </div>
  );
}

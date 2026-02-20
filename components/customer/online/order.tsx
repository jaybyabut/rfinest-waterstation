"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Upload } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import ConfirmationModal from "@/components/ui/confirmation-modal"; 

export default function CustomerPlaceOrder() {
  const [slimCount, setSlimCount] = useState(5);
  const [roundCount, setRoundCount] = useState(5);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "E-Bank">("COD");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  /**
   * [GET] User Zone Fetching: 
   * 1. Gamitin ang supabase.auth.getUser() para makuha ang ID ng logged-in user.
   * 2. I-fetch ang 'zone' (o zone_id) mula sa 'profiles' table.
   * 3. I-update ang state na ito base sa result.
   */
  const userZone = "Bulaon"; 

  /**
   * [GET] Centralized Pricing:
   * Mas mainam na i-fetch ang listahang ito mula sa 'locations' o 'zones' table 
   * sa database para kapag nag-update ang Admin ng presyo, mag-re-reflect agad dito.
   */
  const zonePrices: Record<string, number> = {
    "Bulaon": 30, "Calulut": 30, "Hauslands": 30, "Royal Residences": 30, "Malpitic": 30,
    "Maimpis": 35, "Mexico": 35, "Golden Haven": 35,
    "Montana": 45, "Lakeshore": 45
  };

  const pricePerGallon = zonePrices[userZone] || 30; 
  const totalAmount = (slimCount + roundCount) * pricePerGallon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handlePlaceOrder = async () => {
    /**
     * [POST] Create Order Record: 
     * 1. Mag-insert sa 'orders' table. Columns: user_id, slim_count, round_count, 
     * total_amount, payment_method, zone, status (default: 'Pending').
     * * [STORAGE] Receipt Upload (Conditional):
     * 2. Kung paymentMethod === 'E-Bank', i-upload ang 'receipt' file 
     * sa supabase.storage.from('receipts').
     * 3. Kunin ang public URL at i-update ang 'receipt_url' column sa order record.
     * * [NOTIFICATION]:
     * 4. Mag-trigger ng success toast o i-redirect ang user sa /home.
     */
    console.log("Order Placed!");
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">
    
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/home" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Place Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="space-y-5">
   
              <div>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Deliver to:</label>
                <div className="w-full p-4 rounded-3xl bg-[#e8eef1] border-2 border-transparent text-[#1e3d58] font-bold text-lg">
                  {userZone}
                </div>
              </div>

              <div className="text-xl font-bold ml-2 text-[#1e3d58]">
                Price per gallon: <span className="text-[#43b0f1]">₱{pricePerGallon}</span>
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4 shadow-sm">
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58]">
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1]">-</button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1]">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58] border-t border-gray-100 pt-3">
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1]">-</button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1]">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Payment Method:</label>
                <div className="flex items-center justify-center gap-3 mb-2">
                  <button
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "flex-1 h-14 rounded-full text-xl font-bold transition-all border-2",
                      paymentMethod === "COD" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >COD</button>
                  <span className="text-2xl font-black text-[#1e3d58]">|</span>
                  <button
                    onClick={() => setPaymentMethod("E-Bank")}
                    className={cn(
                      "flex-1 h-14 rounded-full text-xl font-bold transition-all border-2",
                      paymentMethod === "E-Bank" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >E-Bank</button>
                </div>

                {paymentMethod === "E-Bank" && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-300">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#43b0f1] rounded-[25px] bg-[#e8eef1]/30 cursor-pointer hover:bg-[#e8eef1]/50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 text-[#43b0f1] mb-2" />
                        <p className="text-sm font-bold text-[#1e3d58] px-4 text-center">
                          {receipt ? receipt.name : "Insert Receipt Photo"}
                        </p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 px-2">
                <span className="text-xl font-bold text-[#1e3d58]">Total Amount:</span>
                <span className="text-5xl font-black text-[#43b0f1]">₱{totalAmount}</span>
              </div>

              <div className="pt-4">
                <Button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg"
                >
                  Place Order
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePlaceOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${userZone}? The total amount is ₱${totalAmount}.`}
        confirmText="Yes, Proceed"
      />

    </div>
  );
}

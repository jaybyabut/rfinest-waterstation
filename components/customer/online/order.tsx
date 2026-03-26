"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createOnlineOrder } from "@/app/actions/createOnlineOrder";
import { useUser } from "@/app/(protected)/(customer)/home/user-provider";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function CustomerPlaceOrder() {
  const userData = useUser();
  const [slimCount, setSlimCount] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "E-Bank">("COD");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  const [userZone, setUserZone] = useState<string>("Loading...");
  const [pricePerGallon, setPricePerGallon] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (userData) {
      const pricingInfo = Array.isArray(userData.location_pricing)
        ? userData.location_pricing[0]
        : userData.location_pricing;

      if (pricingInfo) {
        setUserZone(pricingInfo.location_name || "Unknown Zone");
        setPricePerGallon(pricingInfo.location_price || 0);
      }
    }
  }, [userData]);

  // Window scroll listener for floating button
  useEffect(() => {
    const handleWindowScroll = () => {
      lastKnownScrollPosition.current = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setShowScrollTop(lastKnownScrollPosition.current > 300);
          ticking.current = false;
        });

        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const totalAmount = (slimCount + roundCount) * pricePerGallon;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceipt(e.target.files[0]);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setIsModalOpen(false);
    try {
      if (paymentMethod === 'E-Bank' && !receipt) {
        alert("Please upload your receipt for E-Bank payment.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('slimCount', slimCount.toString());
      formData.append('roundCount', roundCount.toString());
      formData.append('paymentMethod', paymentMethod);
      formData.append('userZone', userZone);
      formData.append('pricePerGallon', pricePerGallon.toString());
      formData.append('totalAmount', totalAmount.toString());
      formData.append('transaction_type', "Online");
      formData.append('payment_mode', paymentMethod);

      if (receipt) {
        formData.append('receipt', receipt);
      }

      const data = await createOnlineOrder(formData);

      if (data.success === true) {
        alert(data.data || "Order placed successfully!");
        window.location.href = '/home';
      } else {
        alert(data.error || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative overflow-hidden">

          <div className="flex items-center mb-8 relative px-2 w-full">
            <Link href="/home" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 break-words leading-tight">
              Place Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 text-left w-full overflow-hidden">
            <div className="space-y-5 w-full">

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Deliver to:</label>
                <div className="w-full p-4 rounded-3xl bg-[#e8eef1] border-2 border-transparent text-[#1e3d58] font-bold text-lg break-words leading-tight">
                  {userZone}
                </div>
              </div>

              <div className="text-xl font-bold ml-2 text-[#1e3d58] break-words leading-tight w-full">
                Price per gallon: <span className="text-[#43b0f1]">₱{pricePerGallon}</span>
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4 shadow-sm">
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58] gap-2">
                    <span className="flex-1 whitespace-normal break-words leading-tight">Slim Gallon:</span>
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">-</button>
                      <span className="w-8 text-center text-2xl font-black">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58] border-t border-gray-100 pt-3 gap-2">
                    <span className="flex-1 whitespace-normal break-words leading-tight">Round Gallon:</span>
                    <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">-</button>
                      <span className="w-8 text-center text-2xl font-black">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Payment Method:</label>
                <div className="flex items-center justify-center gap-3 mb-2 w-full">
                  <button
                    onClick={() => setPaymentMethod("COD")}
                    className={cn(
                      "flex-1 h-14 rounded-full text-lg sm:text-xl font-bold transition-all border-2 min-w-0 break-words",
                      paymentMethod === "COD" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >COD</button>
                  <span className="text-2xl font-black text-[#1e3d58] shrink-0">|</span>
                  <button
                    onClick={() => setPaymentMethod("E-Bank")}
                    className={cn(
                      "flex-1 h-14 rounded-full text-lg sm:text-xl font-bold transition-all border-2 min-w-0 break-words",
                      paymentMethod === "E-Bank" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >E-Bank</button>
                </div>

                {paymentMethod === "E-Bank" && (
                  <div className="mt-4 animate-in slide-in-from-top-2 duration-300 w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#43b0f1] rounded-[25px] bg-[#e8eef1]/30 cursor-pointer hover:bg-[#e8eef1]/50 transition-all overflow-hidden">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6 px-2 w-full">
                        <Upload className="w-8 h-8 text-[#43b0f1] mb-2 shrink-0" />
                        <p className="text-sm font-bold text-[#1e3d58] px-2 text-center break-words whitespace-normal line-clamp-2 w-full">
                          {receipt ? receipt.name : "Insert Receipt Photo"}
                        </p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-2 px-2 flex-wrap gap-2 w-full">
                <span className="text-xl font-bold text-[#1e3d58] flex-1 whitespace-nowrap">Total Amount:</span>
                <span className="text-4xl sm:text-5xl font-black text-[#43b0f1] shrink-0">₱{totalAmount}</span>
              </div>

              <div className="pt-4 w-full">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  disabled={loading || (slimCount === 0 && roundCount === 0)}
                  className="w-full h-16 text-xl sm:text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Floating Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handlePlaceOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${userZone}? The total amount is ₱${totalAmount}.`}
        confirmText={loading ? "Processing..." : "Yes, Proceed"}
      />

    </div>
  );
}
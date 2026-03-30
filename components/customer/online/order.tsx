"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Upload, ArrowUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createOnlineOrder } from "@/app/actions/createOnlineOrder";
import { useUser } from "@/app/(protected)/(customer)/home/user-provider";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function CustomerPlaceOrder() {
  const userData = useUser();
  const [slimCount, setSlimCount] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "G-Cash">("COD");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);

  // Default to empty strings/0 instead of "Loading..." text
  const [userZone, setUserZone] = useState<string>("");
  const [pricePerGallon, setPricePerGallon] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  
  const [error, setError] = useState<string | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  const [isCopied, setIsCopied] = useState(false);

  // CHECKER KUNG NAGLO-LOAD PA YUNG DATA
  const isFetchingData = !userData || pricePerGallon === 0;

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
      setError(null); 
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("09553466544");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); 
  };

  const handlePreSubmit = () => {
    if (paymentMethod === 'G-Cash' && !receipt) {
      setError("Please upload your G-Cash receipt to proceed.");
      return;
    }
    setError(null);
    setIsModalOpen(true);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    setIsModalOpen(false);
    setError(null);

    try {
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
        window.location.href = '/home';
      } else {
        setError(data.error || "An unexpected error occurred. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
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
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Place Order
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 text-left w-full overflow-hidden">
            <div className="space-y-5 w-full">

              {/* ================= ZONE & PRICE WITH SKELETON LOADERS ================= */}
              <div className="w-full">
                <label className="block text-lg sm:text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Deliver to:</label>
                <div className="w-full p-4 rounded-3xl bg-[#e8eef1] border-2 border-transparent text-[#1e3d58] font-bold text-base sm:text-lg break-words leading-tight flex items-center min-h-[60px]">
                  {isFetchingData ? (
                    <div className="h-5 w-3/4 bg-slate-300 rounded-full animate-pulse"></div>
                  ) : (
                    userZone
                  )}
                </div>
              </div>

              <div className="text-lg sm:text-xl font-bold ml-2 text-[#1e3d58] break-words leading-tight w-full flex items-center gap-2">
                Price per gallon: 
                {isFetchingData ? (
                  <div className="h-6 w-16 bg-slate-300 rounded-full animate-pulse"></div>
                ) : (
                  <span className="text-[#43b0f1]">₱{pricePerGallon}</span>
                )}
              </div>

              {/* ================= DETAILS ================= */}
              <div className="w-full">
                <label className="block text-lg sm:text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className="w-full p-4 rounded-[24px] sm:rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4 shadow-sm">
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-[#1e3d58] gap-2">
                    <span className="flex-1 whitespace-normal break-words leading-tight">Slim Gallon:</span>
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">-</button>
                      <span className="w-6 sm:w-8 text-center text-2xl font-black">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-lg sm:text-xl font-bold text-[#1e3d58] border-t border-gray-100 pt-3 gap-2">
                    <span className="flex-1 whitespace-normal break-words leading-tight">Round Gallon:</span>
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">-</button>
                      <span className="w-6 sm:w-8 text-center text-2xl font-black">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors shrink-0 w-8 h-8 flex items-center justify-center">+</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ================= PAYMENT METHOD ================= */}
              <div className="w-full">
                <label className="block text-lg sm:text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Payment Method:</label>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 w-full">
                  <button
                    onClick={() => {
                      setPaymentMethod("COD");
                      setError(null); 
                    }}
                    className={cn(
                      "flex-1 h-12 sm:h-14 rounded-full text-base sm:text-xl font-bold transition-all border-2 min-w-0 break-words",
                      paymentMethod === "COD" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >COD</button>
                  <span className="text-xl sm:text-2xl font-black text-[#1e3d58] shrink-0">|</span>
                  <button
                    onClick={() => setPaymentMethod("G-Cash")}
                    className={cn(
                      "flex-1 h-12 sm:h-14 rounded-full text-base sm:text-xl font-bold transition-all border-2 min-w-0 break-words",
                      paymentMethod === "G-Cash" ? "bg-[#1e3d58] text-white border-[#1e3d58]" : "bg-[#e8eef1] text-[#1e3d58] border-transparent shadow-sm"
                    )}
                  >G-Cash</button>
                </div>

                {paymentMethod === "G-Cash" && (
                  <div className="mt-3 animate-in slide-in-from-top-2 duration-300 w-full space-y-3">
                    
                    <div className="w-full p-3 sm:p-4 rounded-[20px] bg-[#e8eef1] border-2 border-[#43b0f1]/30 flex flex-col items-center justify-center gap-2">
                      <p className="text-[#1e3d58] font-bold text-xs sm:text-sm uppercase tracking-widest">Send payment to:</p>
                      
                      <div className="flex items-center justify-between bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 w-full max-w-[240px] sm:max-w-[260px]">
                        <span className="text-lg sm:text-xl font-black text-[#43b0f1] tracking-wider flex-1 text-center">09553466544</span>
                        <button 
                          onClick={handleCopyNumber} 
                          className="p-2 bg-[#e8eef1] hover:bg-[#43b0f1] hover:text-white rounded-full transition-colors text-[#1e3d58] shrink-0 outline-none focus:ring-2 focus:ring-[#1e3d58]" 
                          title="Copy Number"
                        >
                          {isCopied ? <Check size={18} strokeWidth={3} className="text-green-500" /> : <Copy size={18} strokeWidth={2.5} />}
                        </button>
                      </div>

                      <div className="h-4 flex items-center justify-center">
                        <p className={`text-[10px] sm:text-xs font-bold transition-opacity duration-300 ${isCopied ? "opacity-100 text-green-500" : "opacity-0"}`}>
                          Number copied to clipboard!
                        </p>
                      </div>
                    </div>

                    <label className={cn(
                      "flex flex-col items-center justify-center w-full h-24 sm:h-28 border-2 border-dashed rounded-[20px] sm:rounded-[25px] cursor-pointer transition-all overflow-hidden",
                      error && !receipt ? "border-red-500 bg-red-50 hover:bg-red-100" : "border-[#43b0f1] bg-[#e8eef1]/30 hover:bg-[#e8eef1]/50"
                    )}>
                      <div className="flex flex-col items-center justify-center pt-3 pb-4 px-2 w-full">
                        <Upload className={cn("w-6 h-6 sm:w-8 sm:h-8 mb-1 sm:mb-2 shrink-0", error && !receipt ? "text-red-500" : "text-[#43b0f1]")} />
                        <p className={cn("text-xs sm:text-sm font-bold px-2 text-center break-words whitespace-normal line-clamp-2 w-full", error && !receipt ? "text-red-600" : "text-[#1e3d58]")}>
                          {receipt ? receipt.name : "Upload G-Cash Receipt"}
                        </p>
                      </div>
                      <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                    </label>
                  </div>
                )}
              </div>

              {/* ================= TOTAL AMOUNT WITH SKELETON ================= */}
              <div className="flex justify-between items-center pt-2 px-2 flex-wrap gap-2 w-full border-t-2 border-dashed border-gray-100 mt-2 min-h-[50px]">
                <span className="text-lg sm:text-xl font-bold text-[#1e3d58] flex-1 whitespace-nowrap pt-2">Total Amount:</span>
                <span className="text-3xl sm:text-5xl font-black text-[#43b0f1] shrink-0 pt-2 flex items-center h-full">
                  {isFetchingData ? (
                    <div className="h-10 sm:h-12 w-20 sm:w-28 bg-slate-300 rounded-2xl animate-pulse"></div>
                  ) : (
                    `₱${totalAmount}`
                  )}
                </span>
              </div>

              {/* ================= ACTIONS ================= */}
              <div className="pt-2 w-full">
                {error && (
                  <p className="text-sm font-bold text-red-500 text-center px-4 py-3 bg-red-50 rounded-xl border border-red-200 mb-4 animate-in fade-in zoom-in duration-300">
                    ⚠️ {error}
                  </p>
                )}

                <Button
                  onClick={handlePreSubmit}
                  // BUTTON IS NOW DISABLED IF DATA IS FETCHING
                  disabled={loading || isFetchingData || (slimCount === 0 && roundCount === 0)}
                  className="w-full h-14 sm:h-16 text-xl sm:text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </div>

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

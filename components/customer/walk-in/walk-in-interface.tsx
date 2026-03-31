"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, CheckCircle2, QrCode, Wallet, CreditCard, RotateCcw, Maximize, Minimize, AlertCircle, X } from "lucide-react";
import { createOrder } from "@/app/actions/createOrder";

const PRICE_PER_GALLON = 30;

const CONTAINER_TYPES = {
  ROUND: 'ROUND CONTAINER',
  SLIM: 'SLIM CONTAINER'
} as const;

const PAYMENT_METHODS = {
  CASH: 'CASH',
  GCASH: 'GCASH'
} as const;

interface RefillItemProps {
  label: string;
  count: number;
  setCount: (value: number | ((prev: number) => number)) => void;
  borderColor: string;
}

interface TerminalButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactElement<React.SVGProps<SVGSVGElement>>;
}

// SUB-COMPONENT: KIOSK-SIZED CONFIRMATION
function WalkInConfirmation({
  isOpen,
  onClose,
  onConfirm,
  total,
  method
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  total: number;
  method: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/90 backdrop-blur-md animate-in fade-in duration-200 p-4 sm:p-8">
      <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-8 sm:p-12 2xl:p-16 w-full max-w-[900px] shadow-2xl animate-in zoom-in-95 duration-200 relative border-[8px] sm:border-[12px] border-[#e8eef1] my-auto">
        <button onClick={onClose} className="absolute right-4 top-4 sm:right-8 sm:top-8 p-3 sm:p-4 bg-[#e8eef1] hover:bg-gray-200 rounded-full active:scale-90 transition-all">
          <X size={32} className="text-[#1e3d58] sm:w-10 sm:h-10" />
        </button>

        <div className="text-center mt-8 sm:mt-0">
          <div className="mx-auto w-24 h-24 sm:w-32 sm:h-32 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-6 sm:mb-8">
            <AlertCircle size={64} className="sm:w-20 sm:h-20" strokeWidth={2.5} />
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-[#1e3d58] mb-4 uppercase tracking-tighter break-words leading-tight">
            CONFIRM ORDER
          </h2>

          <p className="text-xl sm:text-3xl font-bold text-gray-500 mb-8 sm:mb-12 uppercase tracking-wide leading-tight break-words whitespace-normal">
            YOU ARE PLACING AN ORDER FOR <span className="text-[#43b0f1]">₱{total.toLocaleString()}</span><br />
            VIA <span className="text-[#43b0f1]">{method}</span>. IS THIS CORRECT?
          </p>

          <div className="flex flex-col gap-4 sm:gap-6 w-full">
            <Button
              onClick={onConfirm}
              className="w-full h-24 sm:h-32 text-2xl sm:text-4xl font-black rounded-3xl bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-xl uppercase tracking-widest active:scale-95 whitespace-normal break-words leading-tight border-2 border-[#43b0f1]"
            >
              YES, PLACE ORDER
            </Button>
            <Button
              onClick={onClose}
              className="w-full h-16 sm:h-24 text-xl sm:text-2xl font-black rounded-3xl border-4 border-[#e8eef1] bg-white text-gray-400 hover:bg-[#e8eef1] hover:text-[#1e3d58] transition-all uppercase tracking-widest active:scale-95 whitespace-normal break-words leading-tight"
            >
              NO, GO BACK
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RefillItem({ label, count, setCount, borderColor }: RefillItemProps) {
  const handleDecrease = () => setCount(Math.max(0, count - 1));
  const handleIncrease = () => setCount(count + 1);

  return (
    <div className={`flex-1 flex flex-col sm:flex-row items-center justify-between w-full p-6 2xl:p-10 bg-white rounded-3xl border-y border-r border-[#e8eef1] border-l-[16px] 2xl:border-l-[24px] shadow-sm transition-all gap-6 sm:gap-4 ${borderColor}`}>
      <div className="flex-1 w-full text-center sm:text-left min-w-0 pr-0 sm:pr-4">
        <h3 className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-[#1e3d58] tracking-tight uppercase leading-tight whitespace-normal break-words">
          {label}
        </h3>
      </div>
      <div className="flex items-center justify-center gap-4 2xl:gap-8 shrink-0 w-full sm:w-auto">
        <button onClick={handleDecrease} disabled={count === 0} className="w-16 h-16 2xl:w-24 2xl:h-24 bg-red-50 disabled:bg-gray-100 disabled:text-gray-300 rounded-2xl flex items-center justify-center active:scale-95 shadow-inner shrink-0 transition-colors border-2 border-red-100 disabled:border-gray-200">
          <Minus className="w-8 h-8 2xl:w-10 2xl:h-10 text-red-500" strokeWidth={3} />
        </button>
        <span className="text-5xl sm:text-6xl 2xl:text-7xl font-black w-20 sm:w-16 2xl:w-28 text-center text-[#1e3d58] tracking-tighter shrink-0">
          {count}
        </span>
        <button onClick={handleIncrease} className="w-16 h-16 2xl:w-24 2xl:h-24 bg-green-50 rounded-2xl flex items-center justify-center active:scale-95 shadow-inner shrink-0 transition-colors border-2 border-green-100">
          <Plus className="w-8 h-8 2xl:w-10 2xl:h-10 text-green-500" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function TerminalButton({ active, onClick, label, icon }: TerminalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 p-4 2xl:p-6 rounded-2xl 2xl:rounded-3xl font-black transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-2 text-lg sm:text-xl 2xl:text-2xl uppercase tracking-widest min-w-0 break-words leading-tight w-full h-full border-2 ${active
        ? "border-[#43b0f1] bg-[#e8eef1] text-[#1e3d58] shadow-md"
        : "border-[#e8eef1] bg-white text-gray-400 hover:bg-gray-50"
        }`}
    >
      {icon && React.cloneElement(icon, { className: "w-8 h-8 2xl:w-10 2xl:h-10 shrink-0", strokeWidth: 2.5 })}
      <span className="truncate w-full whitespace-normal">{label}</span>
    </button>
  );
}

function SuccessModal({ isOpen, onNextCustomer }: { isOpen: boolean; onNextCustomer: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#1e3d58]/90 backdrop-blur-md z-[110] p-4">
      <div className="bg-white w-full max-w-[800px] p-8 sm:p-12 2xl:p-16 rounded-[2rem] sm:rounded-[3rem] text-center animate-in fade-in zoom-in duration-200 shadow-2xl border-t-[16px] sm:border-t-[24px] border-green-500 my-auto">
        <div className="w-24 h-24 sm:w-32 sm:h-32 2xl:w-40 2xl:h-40 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 2xl:mb-10">
          <CheckCircle2 className="w-16 h-16 sm:w-20 sm:h-20 2xl:w-24 2xl:h-24 text-green-600" strokeWidth={3} />
        </div>
        <h2 className="text-4xl sm:text-5xl 2xl:text-6xl font-black mb-4 2xl:mb-6 text-[#1e3d58] uppercase tracking-tight break-words leading-tight">ORDER PLACED!</h2>
        <p className="text-xl sm:text-2xl 2xl:text-3xl font-bold text-gray-500 mb-8 sm:mb-12 uppercase leading-relaxed break-words whitespace-normal">PLEASE PROCEED TO THE COUNTER<br />TO HAND OVER YOUR CONTAINERS.</p>
        <Button onClick={onNextCustomer} className="w-full h-20 sm:h-24 2xl:h-28 text-2xl sm:text-3xl 2xl:text-4xl font-black bg-[#43b0f1] hover:bg-[#1e3d58] text-white rounded-2xl 2xl:rounded-3xl uppercase tracking-widest active:scale-95 shadow-xl whitespace-normal break-words leading-tight border-2 border-[#43b0f1]">DONE</Button>
      </div>
    </div>
  );
}

export default function WalkInInterface() {
  const [roundGallons, setRoundGallons] = useState<number>(0);
  const [slimGallons, setSlimGallons] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.CASH);
  const [showOrderConfirmation, setShowOrderConfirmation] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(false);

  // New State for "SURE?" confirmation
  const [confirmClear, setConfirmClear] = useState<boolean>(false);

  const total = (roundGallons + slimGallons) * PRICE_PER_GALLON;
  const hasItems = total > 0;

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Timer to automatically reset "SURE?" back to "CLEAR" after 3 seconds of inactivity
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmClear) {
      timer = setTimeout(() => {
        setConfirmClear(false);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [confirmClear]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleClearOrder = () => {
    setRoundGallons(0);
    setSlimGallons(0);
    setPaymentMethod(PAYMENT_METHODS.CASH);
    setConfirmClear(false); // Reset confirmation state just in case
  };

  const handleClearClick = () => {
    if (confirmClear) {
      handleClearOrder(); // Actually clear the items on the second tap
    } else {
      setConfirmClear(true); // Trigger the "SURE?" prompt on the first tap
    }
  };

  const handleNextCustomer = () => {
    handleClearOrder();
    setShowSuccessModal(false);
  };

  const executeTransaction = async () => {
    setLoading(true);
    const orderParams = {
      name: "Walk-in",
      mobileNumber: "N/A",
      location: "Bulaon", // Default for walk-in/kiosk
      locationId: 1, // Bulaon
      selectedZone: "Bulaon",
      slimCount: slimGallons,
      roundCount: roundGallons,
      pricePerUnit: PRICE_PER_GALLON,
      transaction_type: "Walk-in",
      payment_mode: paymentMethod === "CASH" ? "Cash" : "E-Bank",
      note: "Ordered via Kiosk"
    };

    try {
      if (navigator.onLine) {
        const result = await createOrder(orderParams);

        if (result?.error) {
          console.error("Error creating walk-in order:", result.error);
          alert("Something went wrong. Please try again or call for assistance.");
        } else {
          setShowOrderConfirmation(false);
          setShowSuccessModal(true);
        }
      } else {
        // Offline Flow
        const { createOfflineOrder } = await import('@/lib/offline/offlineOrderService');
        await createOfflineOrder(orderParams);
        
        setShowOrderConfirmation(false);
        setShowSuccessModal(true);
        // Note: SuccessModal will show "ORDER PLACED!" which is fine.
        // We could add a toast or indicator that it will sync later.
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#f4f7f9] flex flex-col p-4 sm:p-6 2xl:p-12 relative overflow-hidden font-sans select-none">

      <button onClick={toggleFullscreen} className={`absolute top-4 right-4 sm:top-6 sm:right-6 2xl:top-8 2xl:right-8 z-50 p-3 sm:p-4 rounded-full transition-all duration-300 shadow-sm ${isFullscreen ? "opacity-0 hover:opacity-100 bg-black/50 text-white" : "opacity-100 bg-white text-[#1e3d58] border border-[#e8eef1]"}`}>
        {isFullscreen ? <Minimize className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} /> : <Maximize className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />}
      </button>

      <div className="flex justify-between items-end border-b-4 border-[#e8eef1] pb-4 2xl:pb-6 shrink-0 pr-16 sm:pr-20 2xl:pr-24 w-full">
        <div className="min-w-0">
          <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-black text-[#1e3d58] tracking-tight uppercase leading-tight whitespace-normal break-words">REFILL STATION</h1>
          <p className="text-lg sm:text-xl 2xl:text-2xl font-bold text-gray-400 uppercase mt-1 tracking-widest whitespace-normal break-words leading-tight">SELF-SERVICE KIOSK • ₱{PRICE_PER_GALLON} PER GALLON</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row items-stretch gap-6 2xl:gap-12 mt-6 2xl:mt-8 w-full min-h-0">

        {/* Left Column */}
        <div className="w-full lg:w-[55%] 2xl:w-[60%] flex flex-col gap-6 2xl:gap-8 h-full min-h-0">
          <RefillItem label={CONTAINER_TYPES.ROUND} count={roundGallons} setCount={setRoundGallons} borderColor="border-l-[#1e3d58]" />
          <RefillItem label={CONTAINER_TYPES.SLIM} count={slimGallons} setCount={setSlimGallons} borderColor="border-l-[#43b0f1]" />
        </div>

        {/* Right Column */}
        <div className="w-full lg:w-[45%] 2xl:w-[40%] bg-white rounded-[2rem] 2xl:rounded-[3rem] border-2 border-[#e8eef1] shadow-xl p-6 sm:p-8 2xl:p-10 flex flex-col shrink-0 h-full min-h-0">
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-black mb-6 2xl:mb-8 text-[#1e3d58] flex items-center gap-3 2xl:gap-4 uppercase tracking-tight shrink-0 whitespace-normal break-words leading-tight">
            <Wallet className="w-8 h-8 2xl:w-10 2xl:h-10 text-[#43b0f1] shrink-0" strokeWidth={3} /> PAYMENT
          </h2>

          <div className="flex-1 flex flex-col gap-4 w-full min-h-0">
            <div className="grid grid-cols-2 gap-4 shrink-0 min-h-[100px] 2xl:min-h-[140px] w-full">
              <TerminalButton active={paymentMethod === PAYMENT_METHODS.CASH} onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)} label={PAYMENT_METHODS.CASH} icon={<CreditCard />} />
              <TerminalButton active={paymentMethod === PAYMENT_METHODS.GCASH} onClick={() => setPaymentMethod(PAYMENT_METHODS.GCASH)} label={PAYMENT_METHODS.GCASH} icon={<QrCode />} />
            </div>

            {paymentMethod === PAYMENT_METHODS.GCASH && (
              <div className="bg-[#e8eef1]/50 border-2 border-[#43b0f1]/30 rounded-xl py-3 px-2 text-center shrink-0 animate-in fade-in slide-in-from-top-2 w-full">
                <p className="text-sm sm:text-base font-bold text-[#1e3d58] uppercase tracking-widest whitespace-normal break-words leading-tight">SCAN QR CODE AT THE COUNTER</p>
              </div>
            )}

            <div className="bg-[#f4f7f9] rounded-2xl 2xl:rounded-3xl p-4 sm:p-6 2xl:p-8 text-center border-2 border-[#e8eef1] flex-1 flex flex-col items-center justify-center min-h-[100px] w-full">
              <p className="text-sm sm:text-lg 2xl:text-xl font-bold text-gray-500 mb-1 uppercase tracking-widest mt-auto whitespace-normal break-words leading-tight w-full">TOTAL AMOUNT</p>
              <p className="text-5xl sm:text-6xl 2xl:text-7xl font-black text-[#1e3d58] tracking-tighter mb-auto whitespace-normal break-words leading-tight w-full">₱{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6 2xl:mt-8 shrink-0 w-full h-[80px] sm:h-[100px] 2xl:h-[120px]">
            {hasItems && (
              <button
                onClick={handleClearClick}
                className={`w-full sm:w-[120px] 2xl:w-[140px] h-full flex sm:flex-col flex-row items-center justify-center gap-2 sm:gap-1 border-2 rounded-2xl 2xl:rounded-3xl active:scale-95 shrink-0 transition-colors shadow-sm ${confirmClear
                  ? "text-white bg-red-500 hover:bg-red-600 border-red-500"
                  : "text-red-500 bg-red-50 hover:bg-red-100 border-red-200"
                  }`}
              >
                <RotateCcw className="w-6 h-6 sm:w-8 sm:h-8 2xl:w-10 2xl:h-10 shrink-0" strokeWidth={3} />
                <span className="text-base sm:text-sm 2xl:text-lg font-black tracking-widest whitespace-normal break-words leading-tight">
                  {confirmClear ? "SURE?" : "CLEAR"}
                </span>
              </button>
            )}
            <button
              onClick={() => setShowOrderConfirmation(true)}
              disabled={!hasItems || loading}
              className={`flex-1 w-full h-full text-2xl sm:text-3xl 2xl:text-4xl font-black transition-all active:scale-95 uppercase tracking-widest rounded-2xl 2xl:rounded-3xl whitespace-normal break-words leading-tight border-2 ${hasItems
                ? "bg-[#43b0f1] hover:bg-[#1e3d58] text-white border-[#43b0f1] shadow-xl"
                : "bg-gray-200 text-gray-400 border-gray-200 cursor-not-allowed"
                }`}
            >
              {loading ? "PLACING..." : hasItems ? "PLACE ORDER" : "ADD ITEMS"}
            </button>
          </div>
        </div>
      </div>

      <WalkInConfirmation
        isOpen={showOrderConfirmation}
        onClose={() => !loading && setShowOrderConfirmation(false)}
        onConfirm={executeTransaction}
        total={total}
        method={paymentMethod}
      />

      <SuccessModal isOpen={showSuccessModal} onNextCustomer={handleNextCustomer} />
    </div>
  );
}
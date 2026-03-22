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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/80 backdrop-blur-md animate-in fade-in duration-200 p-8">
      <div className="bg-white rounded-[3rem] p-12 2xl:p-16 w-full max-w-[900px] shadow-2xl animate-in zoom-in-95 duration-200 relative border-[12px] border-slate-100">
        <button onClick={onClose} className="absolute right-8 top-8 p-4 bg-slate-100 rounded-full active:scale-90">
          <X size={40} className="text-slate-400" />
        </button>

        <div className="text-center">
          <div className="mx-auto w-32 h-32 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mb-8">
            <AlertCircle size={80} strokeWidth={2.5} />
          </div>

          <h2 className="text-6xl font-black text-[#1e3d58] mb-4 uppercase tracking-tighter">
            CONFIRM ORDER
          </h2>
          
          <p className="text-3xl font-bold text-slate-500 mb-12 uppercase tracking-wide leading-tight">
            YOU ARE PLACING AN ORDER FOR <span className="text-blue-500">₱{total.toLocaleString()}</span><br/>
            VIA <span className="text-blue-500">{method}</span>. IS THIS CORRECT?
          </p>

          <div className="flex flex-col gap-6">
            <Button
              onClick={onConfirm}
              className="h-32 text-4xl font-black rounded-3xl bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-xl uppercase tracking-widest active:scale-95"
            >
              YES, PLACE ORDER
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="h-24 text-2xl font-black rounded-3xl border-4 border-slate-200 bg-white text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest active:scale-95"
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
    <div className={`flex items-center justify-between w-full p-6 2xl:p-10 bg-white rounded-3xl border-y border-r border-slate-200 border-l-[16px] 2xl:border-l-[24px] shadow-sm transition-all h-full max-h-[250px] 2xl:max-h-[300px] ${borderColor}`}>
      <div className="flex-1 pr-4">
        <h3 className="text-4xl 2xl:text-6xl font-black text-slate-800 tracking-tight uppercase leading-none">
          {label}
        </h3>
      </div>
      <div className="flex items-center gap-4 2xl:gap-8">
        <button onClick={handleDecrease} disabled={count === 0} className="w-16 h-16 2xl:w-28 2xl:h-28 bg-red-50 disabled:bg-slate-50 rounded-2xl 2xl:rounded-3xl flex items-center justify-center active:scale-95 shadow-inner">
          <Minus className="w-8 h-8 2xl:w-12 2xl:h-12 text-red-500" strokeWidth={3} />
        </button>
        <span className="text-6xl 2xl:text-8xl font-black w-16 2xl:w-28 text-center text-slate-900 tracking-tighter">
          {count}
        </span>
        <button onClick={handleIncrease} className="w-16 h-16 2xl:w-28 2xl:h-28 bg-green-50 rounded-2xl 2xl:rounded-3xl flex items-center justify-center active:scale-95 shadow-inner">
          <Plus className="w-8 h-8 2xl:w-12 2xl:h-12 text-green-500" strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}

function TerminalButton({ active, onClick, label, icon }: TerminalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-4 2xl:p-8 rounded-2xl 2xl:rounded-3xl font-black transition-all duration-200 active:scale-95 flex flex-col items-center justify-center gap-2 2xl:gap-4 text-xl 2xl:text-3xl uppercase tracking-widest ${active ? "border-4 border-blue-500 bg-blue-50 text-blue-700 shadow-md" : "border-4 border-slate-100 bg-white text-slate-400"}`}
    >
      {icon && React.cloneElement(icon, { className: "w-8 h-8 2xl:w-12 2xl:h-12", strokeWidth: 2.5 })}
      {label}
    </button>
  );
}

function SuccessModal({ isOpen, onNextCustomer }: { isOpen: boolean; onNextCustomer: () => void; }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-[110] p-4">
      <div className="bg-white w-full max-w-[800px] p-12 2xl:p-16 rounded-[3rem] text-center animate-in fade-in zoom-in duration-200 shadow-2xl border-t-[24px] border-green-500">
        <div className="w-32 h-32 2xl:w-40 2xl:h-40 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 2xl:mb-10">
          <CheckCircle2 size={80} strokeWidth={3} className="text-green-600" />
        </div>
        <h2 className="text-5xl 2xl:text-6xl font-black mb-4 2xl:mb-6 text-slate-900 uppercase tracking-tight">ORDER PLACED!</h2>
        <p className="text-2xl 2xl:text-3xl font-bold text-slate-500 mb-12 uppercase leading-relaxed">PLEASE PROCEED TO THE COUNTER<br/>TO HAND OVER YOUR CONTAINERS.</p>
        <Button onClick={onNextCustomer} className="w-full h-24 2xl:h-28 text-3xl 2xl:text-4xl font-black bg-blue-500 hover:bg-blue-600 rounded-2xl 2xl:rounded-3xl uppercase tracking-widest active:scale-95 shadow-xl">DONE</Button>
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

  const total = (roundGallons + slimGallons) * PRICE_PER_GALLON;
  const hasItems = total > 0;

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

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
  };

  const handleNextCustomer = () => {
    handleClearOrder();
    setShowSuccessModal(false);
  };

  const executeTransaction = async () => {
    setLoading(true);
    try {
      const result = await createOrder({
        name: "Walk-in",
        mobileNumber: "N/A",
        location: "Bulaon", // Default for walk-in/kiosk
        locationId: 1, // Bulaon
        selectedZone: "Bulaon",
        slimCount: slimGallons,
        roundCount: roundGallons,
        pricePerUnit: PRICE_PER_GALLON,
        transaction_type: "Walk-in",
        payment_mode: paymentMethod === "CASH" ? "Cash" : "GCash",
        note: "Ordered via Kiosk" 
      });

      if (result?.error) {
        console.error("Error creating walk-in order:", result.error);
        alert("Something went wrong. Please try again or call for assistance.");
      } else {
        setShowOrderConfirmation(false);
        setShowSuccessModal(true);
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex flex-col p-6 2xl:p-12 relative overflow-hidden font-sans select-none">
      
      <button onClick={toggleFullscreen} className={`absolute top-6 right-6 2xl:top-8 2xl:right-8 z-50 p-4 rounded-full transition-all duration-300 shadow-lg ${isFullscreen ? "opacity-0 hover:opacity-100 bg-black/50 text-white" : "opacity-100 bg-slate-200 text-slate-700"}`}>
        {isFullscreen ? <Minimize size={28} strokeWidth={3} /> : <Maximize size={28} strokeWidth={3} />}
      </button>

      <div className="flex justify-between items-end border-b-4 border-slate-200 pb-4 2xl:pb-6 shrink-0 pr-20 2xl:pr-24">
        <div>
          <h1 className="text-4xl 2xl:text-6xl font-black text-slate-900 tracking-tight uppercase leading-none">REFILL STATION</h1>
          <p className="text-xl 2xl:text-3xl font-bold text-slate-500 uppercase mt-2 tracking-widest">SELF-SERVICE KIOSK • ₱{PRICE_PER_GALLON} PER GALLON</p>
        </div>
      </div>

      <div className="flex-1 flex flex-row gap-6 2xl:gap-12 mt-6 2xl:mt-8 h-full overflow-hidden pb-4">
        <div className="w-[55%] 2xl:w-[60%] flex flex-col justify-center gap-6 2xl:gap-8 h-full">
          <RefillItem label={CONTAINER_TYPES.ROUND} count={roundGallons} setCount={setRoundGallons} borderColor="border-l-[#1e3d58]" />
          <RefillItem label={CONTAINER_TYPES.SLIM} count={slimGallons} setCount={setSlimGallons} borderColor="border-l-[#43b0f1]" />
        </div>

        <div className="w-[45%] 2xl:w-[40%] bg-white rounded-[2rem] 2xl:rounded-[3rem] border-2 border-slate-100 shadow-xl p-8 2xl:p-10 flex flex-col shrink-0 h-full">
          <h2 className="text-3xl 2xl:text-4xl font-black mb-6 2xl:mb-8 text-slate-900 flex items-center gap-3 2xl:gap-4 uppercase tracking-tight shrink-0">
            <Wallet className="w-8 h-8 2xl:w-10 2xl:h-10 text-blue-500" strokeWidth={3} /> PAYMENT
          </h2>

          <div className="flex-1 flex flex-col gap-4 2xl:gap-6 min-h-0">
            <div className="grid grid-cols-2 gap-4 2xl:gap-6 shrink-0 h-[120px] 2xl:h-[160px]">
              <TerminalButton active={paymentMethod === PAYMENT_METHODS.CASH} onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)} label={PAYMENT_METHODS.CASH} icon={<CreditCard />} />
              <TerminalButton active={paymentMethod === PAYMENT_METHODS.GCASH} onClick={() => setPaymentMethod(PAYMENT_METHODS.GCASH)} label={PAYMENT_METHODS.GCASH} icon={<QrCode />} />
            </div>

            {paymentMethod === PAYMENT_METHODS.GCASH && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl py-3 text-center shrink-0 animate-in fade-in slide-in-from-top-2">
                <p className="text-sm 2xl:text-lg font-bold text-blue-600 uppercase tracking-widest">SCAN QR CODE AT THE COUNTER</p>
              </div>
            )}

            <div className="bg-slate-50 rounded-2xl 2xl:rounded-3xl p-6 2xl:p-8 text-center border-4 border-slate-100 flex-1 flex flex-col items-center justify-center min-h-0">
              <p className="text-xl 2xl:text-2xl font-bold text-slate-500 mb-2 uppercase tracking-widest mt-auto">TOTAL AMOUNT</p>
              <p className="text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tighter mb-auto">₱{total.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-4 2xl:gap-6 mt-6 2xl:mt-8 shrink-0">
            {hasItems && (
              <Button onClick={handleClearOrder} variant="outline" className="w-[100px] 2xl:w-[140px] h-24 2xl:h-32 flex flex-col items-center justify-center gap-1 text-red-500 border-4 border-red-100 rounded-2xl 2xl:rounded-3xl active:scale-95">
                <RotateCcw className="w-8 h-8 2xl:w-10 2xl:h-10" strokeWidth={3} />
                <span className="text-sm 2xl:text-lg font-black tracking-widest">CLEAR</span>
              </Button>
            )}
            <Button
              onClick={() => setShowOrderConfirmation(true)}
              disabled={!hasItems || loading}
              className={`flex-1 h-24 2xl:h-32 text-3xl 2xl:text-4xl font-black transition-all active:scale-95 uppercase tracking-widest rounded-2xl 2xl:rounded-3xl ${hasItems ? "bg-blue-500 shadow-xl" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              {loading ? "PLACING..." : hasItems ? "PLACE ORDER" : "ADD ITEMS"}
            </Button>
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

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Minus, Plus, X, CheckCircle2, QrCode, Wallet, CreditCard } from "lucide-react";
import Header from "../../Header";
import Footer from "../../Footer";

// ----------------------------------------------------------------------------
// CONSTANTS
// ----------------------------------------------------------------------------

const PRICE_PER_GALLON = 30;

const CONTAINER_TYPES = {
  ROUND: 'Round Container',
  SLIM: 'Slim Container'
} as const;

const PAYMENT_METHODS = {
  CASH: 'Cash',
  GCASH: 'GCash'
} as const;

// ----------------------------------------------------------------------------
// TYPES
// ----------------------------------------------------------------------------

interface RefillItemProps {
  label: string;
  count: number;
  setCount: (value: number | ((prev: number) => number)) => void;
}

interface TerminalButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
}

// ----------------------------------------------------------------------------
// HELPER FUNCTIONS
// ----------------------------------------------------------------------------

const generateOrderId = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  const randomStr = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();
  
  return `RF-${dateStr}-${randomStr}`;
};

// ----------------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------------

function RefillItem({ label, count, setCount }: RefillItemProps) {
  const handleDecrease = () => setCount(Math.max(0, count - 1));
  const handleIncrease = () => setCount(count + 1);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-8 md:p-10 bg-white border-2 border-slate-100 rounded-3xl shadow-lg hover:border-blue-200 transition-all duration-200">
      <div className="w-full md:w-auto">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800">
          {label}
        </h3>
        <p className="text-lg md:text-xl text-slate-500 mt-2">
          ₱{PRICE_PER_GALLON} each
        </p>
      </div>

      <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-4 md:gap-8">
        <button
          onClick={handleDecrease}
          disabled={count === 0}
          className="w-20 h-20 md:w-24 md:h-24 bg-red-50 hover:bg-red-100 disabled:bg-slate-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-colors group"
          aria-label="Decrease quantity"
        >
          <Minus size={32} className={count === 0 ? "text-slate-300" : "text-red-500 group-hover:text-red-600"} />
        </button>

        <span className="text-5xl md:text-6xl font-bold w-20 md:w-24 text-center text-slate-800">
          {count}
        </span>

        <button
          onClick={handleIncrease}
          className="w-20 h-20 md:w-24 md:h-24 bg-green-50 hover:bg-green-100 rounded-2xl flex items-center justify-center transition-colors group"
          aria-label="Increase quantity"
        >
          <Plus size={32} className="text-green-500 group-hover:text-green-600" />
        </button>
      </div>
    </div>
  );
}

function TerminalButton({ active, onClick, label, icon }: TerminalButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        p-6 md:p-8 rounded-xl font-bold border-2 transition-all duration-200
        flex items-center justify-center gap-3 md:gap-4 text-xl md:text-2xl
        ${active 
          ? "border-blue-500 bg-blue-50 text-blue-700 shadow-md"
          : "border-slate-200 hover:border-slate-300 bg-white text-slate-600"
        }
      `}
      aria-pressed={active}
    >
      {icon && <span className="text-current">{icon}</span>}
      {label}
    </button>
  );
}

function GCashModal({ isOpen, onClose, onConfirm }: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void;
}) {
  const [showSecondConfirm, setShowSecondConfirm] = useState(false);

  if (!isOpen) return null;

  const handleFirstConfirm = () => {
    setShowSecondConfirm(true);
  };

  const handleFinalConfirm = () => {
    setShowSecondConfirm(false);
    onConfirm();
  };

  const handleClose = () => {
    setShowSecondConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <Card className="w-full max-w-[600px] p-8 md:p-12 text-center relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={handleClose}
          className="absolute right-4 md:right-6 top-4 md:top-6 p-2 md:p-3 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X size={24} className="text-slate-500" />
        </button>

        {!showSecondConfirm ? (
          // FIRST SCREEN - QR CODE
          <>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
              Pay with GCash
            </h2>
            
            <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10">
              Scan the QR code using your GCash app
            </p>

            <div className="w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center mx-auto mb-8 md:mb-10 rounded-2xl border-2 border-dashed border-blue-200">
              <div className="text-center">
                <QrCode size={100} className="mx-auto text-blue-500 mb-3" />
                <p className="text-sm text-slate-400">QR Code Placeholder</p>
              </div>
            </div>

            <Button
              onClick={handleFirstConfirm}
              className="w-full h-16 md:h-20 text-xl md:text-2xl font-bold bg-blue-500 hover:bg-blue-600"
            >
              Payment Received
            </Button>

            <p className="text-xs md:text-sm text-slate-400 mt-5">
              Only click after customer completes payment
            </p>
          </>
        ) : (
          // SECOND SCREEN - DOUBLE CHECK
          <>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-3xl md:text-4xl">⚠️</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
              Double Check Payment
            </h2>
            
            <p className="text-lg md:text-xl text-slate-500 mb-8 md:mb-10">
              Have you confirmed the GCash payment went through?
            </p>

            <div className="space-y-4">
              <Button
                onClick={handleFinalConfirm}
                className="w-full h-16 md:h-20 text-xl md:text-2xl font-bold bg-green-500 hover:bg-green-600"
              >
                Yes, Payment is Confirmed
              </Button>

              <Button
                onClick={() => setShowSecondConfirm(false)}
                variant="outline"
                className="w-full h-16 md:h-20 text-xl md:text-2xl font-bold border-2"
              >
                No, Go Back to QR
              </Button>
            </div>

            <p className="text-sm text-orange-500 mt-5">
              ⚠️ Please verify the payment in your GCash app before confirming
            </p>
          </>
        )}
      </Card>
    </div>
  );
}

function SuccessModal({ isOpen, orderId, onNextCustomer }: {
  isOpen: boolean;
  orderId: string;
  onNextCustomer: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4">
      <Card className="w-full max-w-[600px] p-8 md:p-12 text-center animate-in fade-in zoom-in duration-200">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={56} className="text-green-600" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-slate-800">
          Transaction Complete!
        </h2>
        
        <p className="text-lg md:text-xl text-slate-500 mb-6">
          Customer ID
        </p>
        
        <div className="bg-slate-100 p-4 md:p-6 rounded-xl mb-8 md:mb-10">
          <p className="text-2xl md:text-3xl font-mono font-bold text-blue-600 tracking-wider break-all">
            {orderId}
          </p>
        </div>

        <Button
          onClick={onNextCustomer}
          className="w-full h-16 md:h-20 text-xl md:text-2xl font-bold bg-blue-500 hover:bg-blue-600"
        >
          Next Customer
        </Button>
      </Card>
    </div>
  );
}

// ----------------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------------

export default function WalkInInterface() {
  const [roundGallons, setRoundGallons] = useState<number>(0);
  const [slimGallons, setSlimGallons] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.CASH);
  const [showGCashModal, setShowGCashModal] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");

  const total = (roundGallons + slimGallons) * PRICE_PER_GALLON;
  const hasItems = total > 0;

  const generateNewId = useCallback(() => {
    setOrderId(generateOrderId());
  }, []);

  const handleNextCustomer = () => {
    setRoundGallons(0);
    setSlimGallons(0);
    setShowConfirmModal(false);
    generateNewId();
  };

  const handleTransaction = () => {
    if (paymentMethod === PAYMENT_METHODS.GCASH) {
      setShowGCashModal(true);
    } else {
      setShowConfirmModal(true);
    }
  };

  useEffect(() => {
    generateNewId();
  }, [generateNewId]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 lg:p-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-8 md:mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 tracking-tight">
              REFILL STATION
            </h1>
            <p className="text-lg md:text-xl text-slate-500 mt-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Walk-In Terminal
            </p>
          </div>

          <div className="bg-white px-6 md:px-8 py-3 md:py-4 rounded-2xl border-2 border-slate-200 shadow-sm">
            <p className="text-xs md:text-sm text-slate-500 font-medium">Customer ID</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-blue-600 tracking-wider">
              {orderId}
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 md:gap-10">
          <div className="flex-1 space-y-6 md:space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-semibold text-slate-700">
                Select Containers
              </h2>
            </div>

            <RefillItem
              label={CONTAINER_TYPES.ROUND}
              count={roundGallons}
              setCount={setRoundGallons}
            />

            <RefillItem
              label={CONTAINER_TYPES.SLIM}
              count={slimGallons}
              setCount={setSlimGallons}
            />
          </div>

          <Card className="w-full lg:w-[600px] p-6 md:p-10 rounded-3xl border-2 shadow-lg bg-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-slate-800 flex items-center gap-3">
              <Wallet size={24} className="text-blue-500" />
              Payment Details
            </h2>

            <div className="mb-8 md:mb-10">
              <p className="text-sm md:text-base font-medium text-slate-600 mb-3 md:mb-4">
                Payment Method
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-5">
                <TerminalButton
                  active={paymentMethod === PAYMENT_METHODS.CASH}
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)}
                  label={PAYMENT_METHODS.CASH}
                  icon={<CreditCard size={24} />}
                />
                <TerminalButton
                  active={paymentMethod === PAYMENT_METHODS.GCASH}
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.GCASH)}
                  label={PAYMENT_METHODS.GCASH}
                  icon={<QrCode size={24} />}
                />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 md:p-10 text-center mb-8 md:mb-10 border-2 border-blue-100">
              <p className="text-lg md:text-xl font-medium text-slate-600 mb-2 md:mb-3">
                Total Amount
              </p>
              <p className="text-5xl md:text-7xl font-bold text-blue-600 tracking-tight">
                ₱{total.toLocaleString()}
              </p>
            </div>

            <Button
              onClick={handleTransaction}
              disabled={!hasItems}
              className={`
                w-full h-20 md:h-28 text-xl md:text-2xl font-bold transition-all duration-200
                ${hasItems 
                  ? "bg-blue-500 hover:bg-blue-600 shadow-lg hover:shadow-xl" 
                  : "bg-slate-200 cursor-not-allowed"
                }
              `}
            >
              {hasItems ? "Process Transaction" : "Select Items First"}
            </Button>
          </Card>
        </div>
      </main>

      <GCashModal
        isOpen={showGCashModal}
        onClose={() => setShowGCashModal(false)}
        onConfirm={() => {
          setShowGCashModal(false);
          setShowConfirmModal(true);
        }}
      />

      <SuccessModal
        isOpen={showConfirmModal}
        orderId={orderId}
        onNextCustomer={handleNextCustomer}
      />

      <Footer />
    </div>
  );
}
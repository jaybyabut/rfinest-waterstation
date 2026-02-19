<<<<<<< HEAD
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, SquarePen } from "lucide-react";

export default function ManagePricesPage() {
  const [prices, setPrices] = useState([
    { id: 1, name: "Bulaon", price: 30 },
    { id: 2, name: "Calulut", price: 30 },
    { id: 3, name: "Maimpis", price: 35 },
    { id: 4, name: "Mexico", price: 35 },
    { id: 5, name: "Montana", price: 45 },
    { id: 6, name: "Lakeshore", price: 45 },
    { id: 7, name: "Golden Haven", price: 35 },
    { id: 8, name: "Hauslands", price: 30 },
    { id: 9, name: "Royal Residences", price: 30 },
    { id: 10, name: "Malpitic", price: 30 },
  ]);

  const [increaseAmount, setIncreaseAmount] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const applyGlobalIncrease = () => {
    const amount = parseInt(increaseAmount);
    if (!isNaN(amount) && amount !== 0) {
      setPrices(prices.map((p) => ({ ...p, price: p.price + amount })));
      setIncreaseAmount("");
    }
  };

  const updatePrice = (id: number, newPrice: string) => {
    const amount = parseInt(newPrice) || 0;
    setPrices(prices.map((p) => (p.id === id ? { ...p, price: amount } : p)));
  };

  const handleEditClick = (id: number) => {
    setEditingId(id);
    setTimeout(() => {
      document.getElementById(`price-input-${id}`)?.focus();
    }, 10);
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        <div className="flex w-full mb-6 rounded-full overflow-hidden border-2 border-[#1e3d58] shadow-sm">
          <Link href="/dashboard/order" className="flex-1 py-3 text-center text-lg font-bold bg-[#1e3d58] text-white hover:bg-[#152c40] transition-colors">
            Order
          </Link>
          <button className="flex-1 py-3 text-lg font-bold bg-[#43b0f1] text-white">
            Manage
          </button>
        </div>

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
              Manage Prices
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-6 shadow-inner border border-gray-100 text-left">
            <div className="flex items-center justify-between mb-6 px-2">
              <span className="text-xl font-medium text-[#1e3d58]">Increase all by: ₱</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={increaseAmount}
                  onChange={(e) => setIncreaseAmount(e.target.value)}
                  className="w-14 border-b-2 border-black text-xl font-medium text-center focus:outline-none text-[#1e3d58] bg-transparent"
                />
                <Button 
                  onClick={applyGlobalIncrease}
                  className="rounded-full bg-[#43b0f1] hover:bg-[#1e3d58] text-white px-5 font-bold h-9"
                >
                  OK
                </Button>
              </div>
            </div>

            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 pb-2">
              {prices.map((location) => (
                <div key={location.id} className="flex justify-between items-center p-4 border border-black rounded-[20px] bg-white">
                  <span className="text-2xl font-medium text-[#1e3d58]">{location.name}</span>
                  <div className="flex items-center gap-1">
                    <span className={`text-2xl font-medium ${editingId === location.id ? "text-[#43b0f1]" : "text-[#1e3d58]"}`}>
                      ₱
                    </span>
                    <input
                      id={`price-input-${location.id}`}
                      type="number"
                      value={location.price || ""}
                      onChange={(e) => updatePrice(location.id, e.target.value)}
                      readOnly={editingId !== location.id}
                      onBlur={() => setEditingId(null)}
                      className={`w-12 text-2xl font-medium text-right bg-transparent focus:outline-none transition-colors ${
                        editingId === location.id ? "text-[#43b0f1] border-b-2 border-[#43b0f1]" : "text-[#1e3d58]"
                      }`}
                    />
                    <SquarePen 
                      onClick={() => handleEditClick(location.id)}
                      size={28} 
                      strokeWidth={1.5} 
                      className={`ml-2 cursor-pointer transition-all ${
                        editingId === location.id ? "text-[#43b0f1] scale-110" : "text-[#1e3d58] hover:text-[#43b0f1] hover:scale-110"
                      }`} 
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 flex justify-center">
              <Button className="w-3/4 h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] transition-all active:scale-95">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
=======
import ManagePricesForm from "@/components/admin/manage-prices"

export default function ManagePrices(){
    return(
        <div className="flex-1 w-full flex flex-col items-center justify-center">
            <ManagePricesForm />
        </div>
    );
>>>>>>> 95f8ca87f23649e6f12b864762860517e6a46861
}

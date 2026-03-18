"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, SquarePen, Plus, Search } from "lucide-react";
import ConfirmationModal from "@/components/ui/confirmation-modal"; 

type PriceItem = {
  id: number;
  name: string;
  price: number | "";
};

export default function ManagePricesPage() {
  // TODO: BACKEND - Fetch this initial data from the 'zones' table in the database
  const [prices, setPrices] = useState<PriceItem[]>([
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
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const applyGlobalIncrease = () => {
    setGlobalError(null);
    setSuccessMessage(null);
    
    const amount = parseInt(increaseAmount);
    
    if (isNaN(amount) || amount === 0) {
      setGlobalError("Please enter a valid amount to increase or decrease.");
      return;
    }

    const wouldBeInvalid = prices.some((p) => {
      const currentPrice = typeof p.price === "number" ? p.price : 0;
      return currentPrice + amount <= 0;
    });

    if (wouldBeInvalid) {
      setGlobalError("Bulk update cannot result in a price of ₱0 or below.");
      return;
    }

    setPrices(prices.map((p) => ({ 
      ...p, 
      price: typeof p.price === "number" ? p.price + amount : amount 
    })));
    setIncreaseAmount("");
  };

  const updatePrice = (id: number, newPrice: string) => {
    // Allows clearing the input to type a new number
    const amount = newPrice === "" ? "" : parseInt(newPrice);
    setPrices(prices.map((p) => (p.id === id ? { ...p, price: amount } : p)));
  };

  const handleEditClick = (id: number) => {
    setEditingId(id);
    setTimeout(() => {
      document.getElementById(`price-input-${id}`)?.focus();
    }, 10);
  };

  const validateForm = () => {
    const invalidPrices = prices.filter(p => p.price === "" || p.price <= 0);
    
    if (invalidPrices.length > 0) {
      setGlobalError("All locations must have a valid price greater than ₱0. Please check the highlighted fields.");
      return false;
    }
    return true;
  };

  const handleSaveClick = () => {
    setGlobalError(null);
    setSuccessMessage(null);

    if (validateForm()) {
      setIsModalOpen(true);
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setGlobalError(null);

    try {
      // TODO: BACKEND - Implement API call (POST/PUT) to batch update these prices in the database
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Prices updated successfully!");
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (e) {
      console.error(e);
      setGlobalError("An unexpected error occurred while saving prices.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const filteredPrices = prices.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          <div className="flex items-center mb-8 relative px-2">
          <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
            <ChevronLeft size={44} strokeWidth={3} />
          </Link>
         <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-12">
          Manage Prices
        </h1>
          </div>
          <div className="bg-white rounded-[40px] p-5 sm:p-6 shadow-inner border border-gray-100 text-left">
            
            {globalError && (
                <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                    ⚠️ {globalError}
                </div>
            )}
            
            {successMessage && (
                <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200">
                    ✅ {successMessage}
                </div>
            )}

            <div className="bg-[#eef2f5] rounded-[20px] p-3 mb-4 border border-[#1e3d58]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-bold text-[#1e3d58] uppercase tracking-widest whitespace-nowrap pl-1">
                Bulk Increase:
              </label>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <div className="relative w-28 sm:w-28">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1e3d58] font-black text-lg">₱</span>
                  <input
                    type="number"
                    placeholder="0"
                    value={increaseAmount}
                    onChange={(e) => setIncreaseAmount(e.target.value)}
                    className="w-full h-10 rounded-lg border-2 border-[#1e3d58] bg-white pl-7 pr-2 text-lg font-bold text-[#1e3d58] placeholder-[#1e3d58]/30 focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                  />
                </div>
                <Button 
                  onClick={applyGlobalIncrease}
                  className="h-10 w-10 rounded-lg bg-[#43b0f1] text-white hover:bg-[#1e3d58] p-0 flex items-center justify-center transition-colors shadow-sm"
                >
                  <Plus size={20} strokeWidth={4} />
                </Button>
              </div>
            </div>

            <hr className="border-dashed border-gray-300 mb-4" />

            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-gray-200 bg-gray-50 text-[#1e3d58] font-bold focus:outline-none focus:border-[#43b0f1] focus:ring-1 focus:ring-[#43b0f1] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={3} />
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {filteredPrices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-bold italic">
                  No locations found.
                </div>
              ) : (
                filteredPrices.map((location) => {
                  const isInvalid = location.price === "" || location.price <= 0;

                  return (
                    <div key={location.id} className={`flex justify-between items-center p-4 border-2 rounded-[20px] bg-white transition-colors ${isInvalid ? 'border-red-400 bg-red-50' : 'border-[#1e3d58]/20'}`}>
                      <span className={`text-xl sm:text-2xl font-medium ${isInvalid ? 'text-red-600 font-bold' : 'text-[#1e3d58]'}`}>
                        {location.name}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className={`text-xl sm:text-2xl font-medium ${isInvalid ? 'text-red-500' : editingId === location.id ? "text-[#43b0f1]" : "text-[#1e3d58]"}`}>
                          ₱
                        </span>
                        <input
                          id={`price-input-${location.id}`}
                          type="number"
                          value={location.price}
                          onChange={(e) => updatePrice(location.id, e.target.value)}
                          readOnly={editingId !== location.id}
                          onBlur={() => setEditingId(null)}
                          className={`w-12 text-xl sm:text-2xl font-medium text-right bg-transparent focus:outline-none transition-colors ${
                            isInvalid 
                              ? "text-red-600 border-b-2 border-red-500" 
                              : editingId === location.id 
                                ? "text-[#43b0f1] border-b-2 border-[#43b0f1]" 
                                : "text-[#1e3d58]"
                          }`}
                        />
                        <SquarePen 
                          onClick={() => handleEditClick(location.id)}
                          size={24} 
                          strokeWidth={1.5} 
                          className={`ml-2 cursor-pointer transition-all ${
                            isInvalid 
                              ? "text-red-400 hover:text-red-600" 
                              : editingId === location.id 
                                ? "text-[#43b0f1] scale-110" 
                                : "text-[#1e3d58] hover:text-[#43b0f1] hover:scale-110"
                          }`} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-6 flex justify-center">
              <Button 
                onClick={handleSaveClick}
                disabled={loading}
                className="w-3/4 h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        onConfirm={handleSave}
        title="Save Price Updates?"
        message="Are you sure you want to apply these new prices? This will reflect on all future orders."
        confirmText={loading ? "Saving..." : "Save Prices"}
      />

    </div>
  );
}

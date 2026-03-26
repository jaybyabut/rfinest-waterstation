"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import AdminTabs from "@/components/admin/tabs";
import { getLocations } from "@/app/actions/locations";
import { createOrder } from "@/app/actions/createOrder";
import ConfirmationModal from "@/components/ui/confirmation-modal"; 
import { ArrowUp } from "lucide-react";

interface Location {
  location_id: number;
  location_name: string;
  location_price: number;
}

export default function PlaceOrderForm() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [location, setLocation] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [slimCount, setSlimCount] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [note, setNote] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Use a ref to prevent excessive rerendering during scroll checks
  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  // Error handling states
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: boolean;
    location?: boolean;
    zone?: boolean;
    items?: boolean;
  }>({});

  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getLocations();
      if (Array.isArray(data)) {
        setLocations(data);
        if (data.length > 0) {
          setSelectedZone(data[0].location_name);
        }
      } else {
        console.error("Failed to fetch locations:", data);
      }
    };
    fetchLocations();

    const handleWindowScroll = () => {
      lastKnownScrollPosition.current = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (lastKnownScrollPosition.current > 300) {
            setShowScrollTop(true);
          } else {
            setShowScrollTop(false);
          }
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

  const selectedLocation = locations.find((l) => l.location_name === selectedZone);
  const pricePerUnit = selectedLocation ? selectedLocation.location_price : 0;
  const totalAmount = (slimCount + roundCount) * pricePerUnit;

  const handlePlaceOrderClick = () => {
    setGlobalError(null);
    setSuccessMessage(null);
    
    let hasError = false;
    const newErrors: typeof fieldErrors = {};

    if (!selectedLocation) {
      newErrors.zone = true;
      hasError = true;
    }
    if (!name.trim()) {
      newErrors.name = true;
      hasError = true;
    }
    if (!location.trim()) {
      newErrors.location = true;
      hasError = true;
    }

    if (slimCount === 0 && roundCount === 0) {
      newErrors.items = true;
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      setGlobalError("Please fill in all required fields highlighted in red.");
      // We do not need a smooth scroll here as the page will naturally be long, 
      // but we will keep it simple as it was not the source of the main issue.
      return;
    }

    setFieldErrors({});
    setIsModalOpen(true);
  };

  const confirmAndProcessOrder = async () => {
    setLoading(true);
    setGlobalError(null);

    try {
      const result = await createOrder({
        name: name,
        mobileNumber: mobileNumber,
        location: location, 
        locationId: selectedLocation?.location_id,
        slimCount,
        roundCount,
        pricePerUnit,
        note, 
        transaction_type: "Call",
        payment_mode: "Cash"
      });

      if (result?.error) {
        setGlobalError("Error creating order: " + result.error);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setSuccessMessage("Order placed successfully!");
        window.scrollTo({ top: 0, behavior: "smooth" });
        
        setName("");
        setMobileNumber("");
        setLocation("");
        setSlimCount(0);
        setRoundCount(0);
        setNote(""); 
        
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("An unexpected error occurred while placing the order.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">

        <AdminTabs active="order" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white shadow-xl text-[#1e3d58]">
          <h1 className="text-5xl font-black mb-10 text-black tracking-tighter break-words px-2">Place Order</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left w-full overflow-hidden">
            
            {globalError && (
              <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200 break-words">
                  ⚠️ {globalError}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200 break-words">
                  ✅ {successMessage}
              </div>
            )}

            <div className="space-y-5 w-full">
              
              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[a-zA-ZñÑ\s]*$/.test(val)) {
                      setName(val);
                      if (val) setFieldErrors(prev => ({ ...prev, name: false }));
                    }
                  }}
                  placeholder="e.g. Juan Dela Cruz"
                  className={`w-full h-14 px-6 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors ${
                    fieldErrors.name 
                      ? "border-red-400 bg-red-50 text-red-700" 
                      : "border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]"
                  }`}
                />
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Zone:</label>
                <div className="relative w-full">
                  <select
                    value={selectedZone}
                    onChange={(e) => {
                      setSelectedZone(e.target.value);
                      if (e.target.value) setFieldErrors(prev => ({ ...prev, zone: false }));
                    }}
                    className={`w-full h-14 px-6 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer transition-colors pr-10 ${
                      fieldErrors.zone 
                        ? "border-red-400 bg-red-50 text-red-700" 
                        : "border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]"
                    }`}
                    disabled={locations.length === 0}
                  >
                    {locations.length === 0 ? (
                      <option>Loading locations...</option>
                    ) : (
                      locations.map((loc) => (
                        <option key={loc.location_id} value={loc.location_name}>
                          {loc.location_name} (₱{loc.location_price}/pc)
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Location:</label>
                <textarea
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value);
                    if (e.target.value) setFieldErrors(prev => ({ ...prev, location: false }));
                  }}
                  placeholder="Block, Lot, Street, etc."
                  className={`w-full h-28 p-4 px-6 rounded-[30px] border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none transition-colors ${
                    fieldErrors.location 
                      ? "border-red-400 bg-red-50 text-red-700" 
                      : "border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]"
                  }`}
                />
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Mobile Number:</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  maxLength={11}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^[0-9]*$/.test(val)) {
                      setMobileNumber(val);
                    }
                  }}
                  placeholder="09..."
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className={`w-full p-4 rounded-[30px] border-2 bg-white space-y-4 transition-colors overflow-hidden ${
                  fieldErrors.items 
                    ? "border-red-400 bg-red-50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                    : "border-[#1e3d58]"
                }`}>
                  <div className={`flex justify-between items-center text-xl font-bold gap-2 ${fieldErrors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                    <span className="flex-1 whitespace-normal break-words leading-tight">Slim Gallon:</span>
                    <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors w-8 h-8 flex items-center justify-center shrink-0">-</button>
                      <span className="w-8 text-center text-2xl font-black">{slimCount}</span>
                      <button onClick={() => { setSlimCount(slimCount + 1); setFieldErrors(prev => ({ ...prev, items: false })); }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors w-8 h-8 flex items-center justify-center shrink-0">+</button>
                    </div>
                  </div>
                  <div className={`flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-3 gap-2 ${fieldErrors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                    <span className="flex-1 whitespace-normal break-words leading-tight">Round Gallon:</span>
                    <div className="flex items-center gap-2 sm:gap-5 shrink-0">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors w-8 h-8 flex items-center justify-center shrink-0">-</button>
                      <span className="w-8 text-center text-2xl font-black">{roundCount}</span>
                      <button onClick={() => { setRoundCount(roundCount + 1); setFieldErrors(prev => ({ ...prev, items: false })); }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors w-8 h-8 flex items-center justify-center shrink-0">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Note: <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-medium text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none placeholder:text-gray-400"
                  placeholder="Any special instructions..."
                />
              </div>

              <div className="flex justify-between items-center pt-4 px-2 flex-wrap gap-2 w-full">
                <span className="text-xl font-bold text-[#1e3d58] flex-1 whitespace-nowrap">Total Amount:</span>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-gray-400">Rate: ₱{pricePerUnit}/pc</p>
                  <span className="text-4xl font-black text-[#43b0f1]">₱{totalAmount}</span>
                </div>
              </div>

              <div className="pt-4 pb-2 w-full">
                <Button
                  onClick={handlePlaceOrderClick} 
                  disabled={loading}
                  className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
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
        className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${
          showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAndProcessOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${name}? Total amount is ₱${totalAmount}.`}
        confirmText={loading ? "Processing..." : "Yes, Place Order"}
      />

    </div>
  );
}

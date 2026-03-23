"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AdminTabs from "@/components/admin/tabs";
import { getLocations } from "@/app/actions/locations";
import { createOrder } from "@/app/actions/createOrder";
import ConfirmationModal from "@/components/ui/confirmation-modal"; 

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
  
  // Removed orderType state as it's now exclusively Call/Delivery here
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, []);

  const selectedLocation = locations.find((l) => l.location_name === selectedZone);
  const pricePerUnit = selectedLocation ? selectedLocation.location_price : 0;
  const totalAmount = (slimCount + roundCount) * pricePerUnit;

  // Validation function
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
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // If no errors, clear field errors and open modal
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
        selectedZone: selectedZone,
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
        
        // Reset form
        setName("");
        setMobileNumber("");
        setLocation("");
        setSlimCount(0);
        setRoundCount(0);
        setNote(""); 
        
        // Clear success message after 5 seconds
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
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 relative">
      <div className="w-full max-w-md">

        <AdminTabs active="order" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white shadow-xl text-[#1e3d58]">
          <h1 className="text-5xl font-black mb-10 text-black tracking-tighter">Place Order</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            
            {globalError && (
              <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                 {globalError}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200">
                 {successMessage}
              </div>
            )}

            <div className="space-y-5">
              

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    const val = e.target.value;
                    // FIX: Only allow letters and spaces (pati ñ/Ñ)
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

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Zone:</label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    setSelectedZone(e.target.value);
                    if (e.target.value) setFieldErrors(prev => ({ ...prev, zone: false }));
                  }}
                  className={`w-full h-14 px-6 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer transition-colors ${
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

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Location:</label>
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

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Mobile Number:</label>
                <input
                  type="tel"
                  value={mobileNumber}
                  maxLength={11} // Limits to 11 digits
                  onChange={(e) => {
                    const val = e.target.value;
                    // FIX: Only allow numbers
                    if (/^[0-9]*$/.test(val)) {
                      setMobileNumber(val);
                    }
                  }}
                  placeholder="09..."
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Details:</label>
                <div className={`w-full p-4 rounded-[30px] border-2 space-y-4 transition-colors ${
                  fieldErrors.items 
                    ? "border-red-400 bg-red-50" 
                    : "border-[#1e3d58] bg-white"
                }`}>
                  <div className={`flex justify-between items-center text-xl font-bold ${fieldErrors.items ? 'text-red-700' : 'text-black'}`}>
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => {
                        setSlimCount(Math.max(0, slimCount - 1));
                      }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button onClick={() => {
                        setSlimCount(slimCount + 1);
                        setFieldErrors(prev => ({ ...prev, items: false }));
                      }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                  <div className={`flex justify-between items-center text-xl font-bold border-t ${fieldErrors.items ? 'border-red-200 text-red-700' : 'border-gray-100 text-black'} pt-3`}>
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => {
                        setRoundCount(Math.max(0, roundCount - 1));
                      }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button onClick={() => {
                        setRoundCount(roundCount + 1);
                        setFieldErrors(prev => ({ ...prev, items: false }));
                      }} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Note: <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-medium text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none placeholder:text-gray-400"
                />
              </div>

              <div className="flex justify-between items-center pt-4 px-2">
                <span className="text-xl font-bold">Total Amount:</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-400">Rate: ₱{pricePerUnit}/pc</p>
                  <span className="text-4xl font-black text-[#43b0f1]">₱{totalAmount}</span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handlePlaceOrderClick} 
                  disabled={loading}
                  className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmAndProcessOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${name}? Total amount is ₱${totalAmount}.`}
        confirmText={loading ? "Processing..." : "Yes, Place Order"}
      />

    </div >
  );
}

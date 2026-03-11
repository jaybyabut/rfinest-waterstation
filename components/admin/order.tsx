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
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!name.trim()) newErrors.name = "Customer name is required.";
    else if (!nameRegex.test(name)) newErrors.name = "Letters and spaces only.";

    if (!selectedZone) newErrors.selectedZone = "Please select a zone.";

    const locRegex = /^[A-Za-z0-9\s,\.-]*$/;
    if (!location.trim()) newErrors.location = "Delivery location/address is required.";
    else if (!locRegex.test(location)) newErrors.location = "Invalid symbols used. Allowed: ( , - . )";

    const phoneRegex = /^(09)\d{9}$/;
    if (!mobileNumber.trim()) newErrors.mobileNumber = "Mobile number is required.";
    else if (!phoneRegex.test(mobileNumber)) newErrors.mobileNumber = "Must be an 11-digit number starting with 09.";

    if (slimCount === 0 && roundCount === 0) {
      newErrors.items = "Please add at least one item (Slim or Round gallon).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrderClick = () => {
    setGlobalError(null);
    setSuccessMessage(null);

    if (validateForm()) {
      setIsModalOpen(true);
    } else {
      setGlobalError("Please check the highlighted fields and fix the errors.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const confirmAndProcessOrder = async () => {
    setLoading(true);
    setGlobalError(null);

    try {
      const result = await createOrder({
        name,
        mobileNumber,
        location: location, 
        locationId: selectedLocation?.location_id,
        selectedZone,
        slimCount,
        roundCount,
        pricePerUnit,
        // TODO: BACKEND - Ensure 'note' is saved in the database
        note 
      });

      if (result?.error) {
        setGlobalError("Error creating order: " + result.error);
      } else {
        setSuccessMessage("Order placed successfully!");
        setName("");
        setMobileNumber("");
        setLocation("");
        setSlimCount(0);
        setRoundCount(0);
        setNote(""); 
        setErrors({});
        
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    } catch (e) {
      console.error(e);
      setGlobalError("An unexpected error occurred while placing the order.");
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
                ⚠️ {globalError}
              </div>
            )}
            
            {successMessage && (
              <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200">
                ✅ {successMessage}
              </div>
            )}

            <div className="space-y-5">
              
              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.name ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.name && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Zone:</label>
                <div className="relative">
                  <select
                    value={selectedZone}
                    onChange={(e) => { setSelectedZone(e.target.value); }}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer disabled:opacity-50 ${errors.selectedZone ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    disabled={locations.length === 0}
                  >
                    {locations.length === 0 ? (
                      <option>Loading locations...</option>
                    ) : (
                      <>
                        <option value="" disabled>Select Zone</option>
                        {locations.map((loc) => (
                          <option key={loc.location_id} value={loc.location_name}>
                            {loc.location_name} (₱{loc.location_price}/pc)
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none">
                    <svg className="w-5 h-5 text-[#1e3d58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.selectedZone && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.selectedZone}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Location/Address:</label>
                <textarea
                  placeholder="e.g. Blk 1 Lot 8, San Juan St."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full h-28 p-4 px-6 rounded-[30px] border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none placeholder:text-gray-400 placeholder:font-normal ${errors.location ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.location && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Mobile Number:</label>
                <input
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.mobileNumber ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.mobileNumber && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.mobileNumber}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Note: <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
                <textarea
                  placeholder="Any special instructions for the rider?"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full h-24 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-medium text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Details:</label>
                <div className={`w-full p-4 rounded-[30px] border-2 bg-white space-y-4 ${errors.items ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-[#1e3d58]'}`}>
                  
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => {
                          setSlimCount(Math.max(0, slimCount - 1));
                          if (errors.items) setErrors(prev => ({...prev, items: ""}));
                        }} 
                        className="text-3xl font-bold hover:text-[#43b0f1] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button 
                        onClick={() => {
                          setSlimCount(slimCount + 1);
                          if (errors.items) setErrors(prev => ({...prev, items: ""}));
                        }} 
                        className="text-3xl font-bold hover:text-[#43b0f1] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-3">
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button 
                        onClick={() => {
                          setRoundCount(Math.max(0, roundCount - 1));
                          if (errors.items) setErrors(prev => ({...prev, items: ""}));
                        }} 
                        className="text-3xl font-bold hover:text-[#43b0f1] transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button 
                        onClick={() => {
                          setRoundCount(roundCount + 1);
                          if (errors.items) setErrors(prev => ({...prev, items: ""}));
                        }} 
                        className="text-3xl font-bold hover:text-[#43b0f1] transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>
                {errors.items && <p className="text-red-500 text-sm font-bold mt-2 ml-2 text-center">{errors.items}</p>}
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
                  className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
        onClose={() => !loading && setIsModalOpen(false)}
        onConfirm={confirmAndProcessOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${name}? Total amount is ₱${totalAmount}.`}
        confirmText={loading ? "Processing..." : "Yes, Place Order"}
      />

    </div >
  );
}

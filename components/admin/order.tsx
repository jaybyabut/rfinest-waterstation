"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import AdminTabs from "@/components/admin/tabs";
import { getLocations } from "@/app/actions/locations";
import { createOrder } from "@/app/actions/createOrder";

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
  const [loading, setLoading] = useState(false);

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

  const handlePlaceOrder = async () => {
    if (!selectedLocation) {
      alert("Please select a location/zone.");
      return;
    }

    if (slimCount === 0 && roundCount === 0) {
      alert("Please select at least one item (Slim or Round gallon).");
      return;
    }

    if (!name || !location) {
      alert("Please fill in Name and Location/Address.");
      return;
    }

    setLoading(true);

    try {
      const result = await createOrder({
        name,
        mobileNumber,
        location: location, // Address text
        locationId: selectedLocation?.location_id,
        selectedZone,
        slimCount,
        roundCount,
        pricePerUnit
      });

      if (result?.error) {
        alert("Error creating order: " + result.error);
      } else {
        alert("Order placed successfully!");
        // Reset form
        setName("");
        setMobileNumber("");
        setLocation("");
        setSlimCount(0);
        setRoundCount(0);
      }
    } catch (e) {
      console.error(e);
      alert("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">

        <AdminTabs active="order" />

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white shadow-xl text-[#1e3d58]">
          <h1 className="text-5xl font-black mb-10 text-black tracking-tighter">Place Order</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="space-y-5">
              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Zone:</label>
                <select
                  value={selectedZone}
                  onChange={(e) => { setSelectedZone(e.target.value); console.log(e.target.value); }}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer"
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
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-28 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none"
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Mobile Number:</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold mb-1 ml-2">Details:</label>
                <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span>Slim Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{slimCount}</span>
                      <button onClick={() => setSlimCount(slimCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-xl font-bold border-t border-gray-100 pt-3">
                    <span>Round Gallon:</span>
                    <div className="flex items-center gap-5">
                      <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">-</button>
                      <span className="w-8 text-center text-2xl">{roundCount}</span>
                      <button onClick={() => setRoundCount(roundCount + 1)} className="text-3xl font-bold hover:text-[#43b0f1] transition-colors">+</button>
                    </div>
                  </div>
                </div>
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
                  onClick={handlePlaceOrder}
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
    </div >
  );
}

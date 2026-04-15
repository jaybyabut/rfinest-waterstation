"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import AdminTabs from "@/components/admin/tabs";
import { getLocations } from "@/app/actions/locations";
import { createOrder } from "@/app/actions/createOrder";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { ArrowUp, Minus, Plus, Check, Search, X } from "lucide-react"; 

interface Location {
  location_id: number;
  location_name: string;
  location_price: number;
}

// TODO: BACKEND - Tanggalin itong dummy data at palitan ng actual API call sa Supabase
// na kumukuha ng listahan ng mga nakaraang customers base sa name o mobile number.
const DUMMY_CUSTOMERS = [
  { id: 1, first_name: "Juan", last_name: "Dela Cruz", mi: "M", mobile_no: "09123456789", house_no: "Blk 1 Lot 2", street_name: "San Juan St.", zone_name: "Mexico" },
  { id: 2, first_name: "Maria", last_name: "Santos", mi: "", mobile_no: "09987654321", house_no: "", street_name: "Mabini St.", zone_name: "Bulaon" },
  { id: 3, first_name: "Pedro", last_name: "Penduko", mi: "P", mobile_no: "09551234567", house_no: "Apt 4", street_name: "Rizal Ave.", zone_name: "Calulut" },
];

export default function PlaceOrderForm() {
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<typeof DUMMY_CUSTOMERS>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [mi, setMi] = useState("");
  const [lastName, setLastName] = useState("");

  const [mobileNumber, setMobileNumber] = useState("");
  
  const [houseNo, setHouseNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  
  const [slimCount, setSlimCount] = useState(0);
  const [roundCount, setRoundCount] = useState(0);
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const lastKnownScrollPosition = useRef(0);
  const ticking = useRef(false);

  const nameRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const numberRef = useRef<HTMLDivElement>(null);

  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: boolean;
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
          setShowScrollTop(lastKnownScrollPosition.current > 300);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };
    window.addEventListener("scroll", handleWindowScroll);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleWindowScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Search Logic
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);

    if (val.trim().length > 1) {
      // TODO: BACKEND - Dito papalitan ng actual API call `await supabase.from('proxy_customers').select(...)`
      const filtered = DUMMY_CUSTOMERS.filter(c => 
        c.first_name.toLowerCase().includes(val.toLowerCase()) ||
        c.last_name.toLowerCase().includes(val.toLowerCase()) ||
        c.mobile_no.includes(val)
      );
      setSearchResults(filtered);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  // Auto-fill Logic
  const handleSelectCustomer = (customer: typeof DUMMY_CUSTOMERS[0]) => {
    setFirstName(customer.first_name || "");
    setLastName(customer.last_name || "");
    setMi(customer.mi || "");
    setMobileNumber(customer.mobile_no || "");
    setHouseNo(customer.house_no || "");
    setStreetName(customer.street_name || "");
    
    if (customer.zone_name) {
      setSelectedZone(customer.zone_name);
    }

    // Clear search and hide dropdown
    setSearchQuery("");
    setShowSearchDropdown(false);

    // Clear any existing errors for these fields
    setFieldErrors(prev => ({
      ...prev,
      firstName: false,
      zone: false
    }));
  };

  const selectedLocation = locations.find((l) => l.location_name === selectedZone);
  const pricePerUnit = selectedLocation ? selectedLocation.location_price : 0;
  const totalAmount = (slimCount + roundCount) * pricePerUnit;

  const handlePlaceOrderClick = () => {
    setGlobalError(null);

    let hasError = false;
    const newErrors: typeof fieldErrors = {};
    
    let firstErrorElement: HTMLDivElement | null = null;

    if (!firstName.trim()) {
      newErrors.firstName = true;
      hasError = true;
      if (!firstErrorElement) firstErrorElement = nameRef.current;
    }
    
    if (!selectedLocation) {
      newErrors.zone = true;
      hasError = true;
      if (!firstErrorElement) firstErrorElement = zoneRef.current;
    }
    
    if (slimCount === 0 && roundCount === 0) {
      newErrors.items = true;
      hasError = true;
      if (!firstErrorElement) firstErrorElement = itemsRef.current;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      setGlobalError("Please fill in all required fields highlighted in red.");
      
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setFieldErrors({});
    setIsModalOpen(true);
  };

  const confirmAndProcessOrder = async () => {
    setLoading(true);
    setGlobalError(null);

    const fullName = [firstName.trim(), mi.trim() ? mi.trim() + '.' : '', lastName.trim()].filter(Boolean).join(" ");
    const fullAddress = [houseNo.trim(), streetName.trim()].filter(Boolean).join(", ");

    try {
      const result = await createOrder({
        name: fullName,
        mobileNumber: mobileNumber,
        location: fullAddress,
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
        window.scrollTo({ top: 0, behavior: "smooth" });

        setFirstName("");
        setMi("");
        setLastName("");
        setMobileNumber("");
        setHouseNo("");
        setStreetName("");
        setSlimCount(0);
        setRoundCount(0);
        setNote("");
        setSearchQuery("");

        setIsSuccessModalOpen(true);
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
              <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200 break-words animate-in fade-in zoom-in">
                ⚠️ {globalError}
              </div>
            )}

            <div className="space-y-5 w-full">

              {/* ================= SEARCH EXISTING CUSTOMER ================= */}
              <div className="w-full bg-[#f4f7f9] p-4 rounded-[25px] border-2 border-[#1e3d58]/10 mb-2 relative" ref={searchRef}>
                {/* Changed to text-center and removed ml-2 */}
                <label className="block text-center text-sm font-bold mb-2 text-[#43b0f1] uppercase tracking-wider">Search Existing Customer</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Juan"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => { if (searchResults.length > 0) setShowSearchDropdown(true) }}
                    className="w-full h-12 pl-12 pr-10 rounded-full border-2 border-transparent bg-white text-[#1e3d58] font-bold text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] focus:border-transparent transition-all shadow-sm"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => { setSearchQuery(""); setShowSearchDropdown(false); }}
                      className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Dropdown Results */}
                {showSearchDropdown && (
                  <div className="absolute z-50 w-full left-0 mt-2 bg-white border-2 border-[#e8eef1] rounded-[20px] shadow-xl max-h-60 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
                    {searchResults.length > 0 ? (
                      <div className="flex flex-col p-2 gap-1">
                        {searchResults.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => handleSelectCustomer(customer)}
                            className="flex flex-col items-start w-full p-3 rounded-xl hover:bg-[#e8eef1] transition-colors text-left"
                          >
                            <span className="font-bold text-[#1e3d58] text-base">{customer.first_name} {customer.last_name}</span>
                            <span className="text-xs font-semibold text-gray-500">
                              {customer.mobile_no} • {customer.zone_name}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-400 font-semibold text-sm">
                        No customers found.
                      </div>
                    )}
                  </div>
                )}
              </div>
              {/* ========================================================= */}

              <div className="space-y-3 w-full" ref={nameRef}>
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">First Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Juan"
                      value={firstName}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-ZñÑ\s]*$/.test(val)) {
                          setFirstName(val);
                          if (val) setFieldErrors(prev => ({ ...prev, firstName: false }));
                        }
                      }}
                      className={`w-full h-14 px-6 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors ${fieldErrors.firstName ? "border-red-400 bg-red-50 text-red-700" : "border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]"}`}
                    />
                  </div>
                  <div className="w-full sm:w-24 shrink-0">
                    <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">M.I.:</label>
                    <input
                      type="text"
                      maxLength={1}
                      placeholder="A"
                      value={mi}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^[a-zA-ZñÑ\s]*$/.test(val)) setMi(val);
                      }}
                      className="w-full h-14 px-4 text-center rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors"
                    />
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Last Name: <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. Dela Cruz"
                    value={lastName}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^[a-zA-ZñÑ\s]*$/.test(val)) {
                        setLastName(val);
                      }
                    }}
                    className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors"
                  />
                </div>
              </div>

              <div className="w-full" ref={zoneRef}>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Zone:</label>
                <div className="relative w-full">
                  <select
                    value={selectedZone}
                    onChange={(e) => {
                      setSelectedZone(e.target.value);
                      if (e.target.value) setFieldErrors(prev => ({ ...prev, zone: false }));
                    }}
                    className={`w-full h-14 px-6 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer transition-colors pr-10 ${fieldErrors.zone
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

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <div className="w-full sm:w-1/3 shrink-0 flex flex-col justify-end">
                  <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58] leading-tight">
                    House No.: <span className="text-[11px] sm:text-xs font-normal text-gray-400 block mt-0.5">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Blk 1"
                    value={houseNo}
                    onChange={(e) => setHouseNo(e.target.value)}
                    className="w-full h-14 px-4 text-center rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors mt-auto"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-end">
                  <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58] leading-tight pb-[18px] sm:pb-0">Street Name: <span className="text-[11px] sm:text-xs font-normal text-gray-400">(Optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. San Juan St."
                    value={streetName}
                    onChange={(e) => {
                      setStreetName(e.target.value);
                    }}
                    className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors mt-auto"
                  />
                </div>
              </div>

              <div className="w-full" ref={numberRef}>
                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Mobile Number: <span className="text-sm font-normal text-gray-400">(Optional)</span></label>
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
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-colors"
                />
              </div>

              <div className="pt-2 w-full" ref={itemsRef}>
                <label className="block text-base sm:text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                <div className={`w-full p-3 sm:p-4 rounded-[30px] border-2 bg-[#e8eef1] space-y-3 sm:space-y-4 transition-colors ${fieldErrors.items ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-[#1e3d58]'}`}>

                  <div className={`flex flex-row justify-between items-center font-bold gap-1 sm:gap-2 w-full ${fieldErrors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                    <span className="text-sm sm:text-xl leading-tight">Slim Gallon:</span>
                    <div className="flex items-center justify-between w-[110px] sm:w-[160px] shrink-0 bg-white p-1 sm:p-1.5 rounded-full border-2 border-transparent focus-within:border-[#43b0f1] shadow-sm transition-colors">
                      <button 
                        onClick={() => setSlimCount(Math.max(0, slimCount - 1))} 
                        type="button" 
                        className="text-[#1e3d58] hover:bg-[#43b0f1] hover:text-white transition-colors w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#e8eef1]/50 shrink-0"
                      >
                        <Minus className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                      </button>
                      <input 
                        type="number" 
                        value={slimCount.toString()} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setSlimCount(isNaN(val) ? 0 : Math.min(999, Math.max(0, val)));
                          if (!isNaN(val) && (val > 0 || roundCount > 0)) {
                            setFieldErrors(prev => ({ ...prev, items: false }));
                          }
                        }} 
                        className="w-8 sm:w-12 text-center text-base sm:text-2xl font-black text-[#1e3d58] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      />
                      <button 
                        onClick={() => { 
                          setSlimCount(Math.min(999, slimCount + 1)); 
                          setFieldErrors(prev => ({ ...prev, items: false })); 
                        }} 
                        type="button" 
                        className="text-[#1e3d58] hover:bg-[#43b0f1] hover:text-white transition-colors w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#e8eef1]/50 shrink-0"
                      >
                        <Plus className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                  <hr className="border-white/60 border-dashed" />

                  <div className={`flex flex-row justify-between items-center font-bold gap-1 sm:gap-2 w-full ${fieldErrors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                    <span className="text-sm sm:text-xl leading-tight">Round Gallon:</span>
                    <div className="flex items-center justify-between w-[110px] sm:w-[160px] shrink-0 bg-white p-1 sm:p-1.5 rounded-full border-2 border-transparent focus-within:border-[#43b0f1] shadow-sm transition-colors">
                      <button 
                        onClick={() => setRoundCount(Math.max(0, roundCount - 1))} 
                        type="button" 
                        className="text-[#1e3d58] hover:bg-[#43b0f1] hover:text-white transition-colors w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#e8eef1]/50 shrink-0"
                      >
                        <Minus className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                      </button>
                      <input 
                        type="number" 
                        value={roundCount.toString()} 
                        onChange={(e) => {
                          const val = parseInt(e.target.value, 10);
                          setRoundCount(isNaN(val) ? 0 : Math.min(999, Math.max(0, val)));
                          if (!isNaN(val) && (val > 0 || slimCount > 0)) {
                            setFieldErrors(prev => ({ ...prev, items: false }));
                          }
                        }} 
                        className="w-8 sm:w-12 text-center text-base sm:text-2xl font-black text-[#1e3d58] bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                      />
                      <button 
                        onClick={() => { 
                          setRoundCount(Math.min(999, roundCount + 1)); 
                          setFieldErrors(prev => ({ ...prev, items: false })); 
                        }} 
                        type="button" 
                        className="text-[#1e3d58] hover:bg-[#43b0f1] hover:text-white transition-colors w-7 h-7 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#e8eef1]/50 shrink-0"
                      >
                        <Plus className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                      </button>
                    </div>
                  </div>

                </div>
                {fieldErrors.items && <p className="text-red-500 text-sm font-bold mt-2 ml-2 text-center break-words">Order must have at least one item.</p>}
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
        onConfirm={confirmAndProcessOrder}
        title="Confirm Order"
        message={`Are you sure you want to place this order for ${firstName}${lastName ? ' ' + lastName : ''}? Total amount is ₱${totalAmount}.`}
        confirmText={loading ? "Processing..." : "Yes, Place Order"}
      />

      {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
              <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl">
                  <div className="bg-white rounded-[30px] p-8 text-center border border-gray-100 flex flex-col items-center">
                      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                          <Check size={40} strokeWidth={4} />
                      </div>
                      <h2 className="text-3xl font-black text-[#1e3d58] mb-3 tracking-tight">Success!</h2>
                      <p className="mb-8 text-gray-500 font-bold text-base leading-snug">
                          Order placed successfully!
                      </p>
                      <Button 
                          onClick={() => setIsSuccessModalOpen(false)} 
                          className="w-full h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-md active:scale-95"
                      >
                          Continue
                      </Button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}

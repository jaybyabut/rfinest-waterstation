"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft, SquarePen, Plus, Search, RefreshCw, ArrowUp, Check, MapPin, Trash2, RotateCcw, Eye, EyeOff } from "lucide-react";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { getLocations, batchUpdatePrices, addLocation, deactivateLocation, getRemovedLocations, restoreLocation } from "@/app/actions/locations";

type PriceItem = {
  id: number;
  name: string;
  price: number | "";
};

interface DBLocation {
  location_id: number;
  location_name: string;
  location_price: number;
}

export default function ManagePricesPage() {
  const [prices, setPrices] = useState<PriceItem[]>([]);
  const [removedPrices, setRemovedPrices] = useState<PriceItem[]>([]); // NEW STATE PARA SA REMOVED ZONES
  const [initialLoading, setInitialLoading] = useState(true);

  const [increaseAmount, setIncreaseAmount] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [walkInPrice, setWalkInPrice] = useState<number | "">("");
  const [walkInId, setWalkInId] = useState<number | null>(null);
  const [editingWalkIn, setEditingWalkIn] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkIncreaseModalOpen, setIsBulkIncreaseModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const [isAddZoneModalOpen, setIsAddZoneModalOpen] = useState(false);
  const [newZoneName, setNewZoneName] = useState("");
  const [newZonePrice, setNewZonePrice] = useState("");
  const [addingZoneLoading, setAddingZoneLoading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [zoneToDelete, setZoneToDelete] = useState<{ id: number; name: string } | null>(null);
  const [deletingLoading, setDeletingLoading] = useState(false);

  // NEW STATES PARA SA RESTORE FEATURE
  const [showRemovedZones, setShowRemovedZones] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [zoneToRestore, setZoneToRestore] = useState<{ id: number; name: string } | null>(null);
  const [restoringLoading, setRestoringLoading] = useState(false);

  const fetchPrices = async () => {
    setInitialLoading(true);
    try {
      // SABAY NA KUKUNIN ANG ACTIVE AT INACTIVE ZONES
      const [data, removedData] = await Promise.all([
          getLocations(),
          getRemovedLocations()
      ]);

      if (Array.isArray(data)) {
        const walkInLocation = data.find((l: DBLocation) => l.location_name.toLowerCase() === 'walk-in');
        if (walkInLocation) {
          setWalkInPrice(walkInLocation.location_price);
          setWalkInId(walkInLocation.location_id);
        } else {
          setWalkInPrice(35);
        }

        const filteredData = data.filter((l: DBLocation) => l.location_name.toLowerCase() !== 'walk-in');
        setPrices(filteredData.map((l: DBLocation) => ({
          id: l.location_id,
          name: l.location_name,
          price: l.location_price
        })));
      } else {
        setGlobalError("Failed to fetch prices from database.");
      }

      if (Array.isArray(removedData)) {
         setRemovedPrices(removedData.map((l: DBLocation) => ({
             id: l.location_id,
             name: l.location_name,
             price: l.location_price
         })));
      }

    } catch (err) {
      console.error(err);
      setGlobalError("An error occurred while fetching prices.");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();

    const handleWindowScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, []);

  const handleBulkIncreaseClick = () => {
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

    if (wouldBeInvalid || (typeof walkInPrice === "number" && walkInPrice + amount <= 0)) {
      setGlobalError("Bulk update cannot result in a price of ₱0 or below.");
      return;
    }

    setIsBulkIncreaseModalOpen(true);
  };

  const confirmBulkIncrease = () => {
    const amount = parseInt(increaseAmount);
    
    setPrices(prices.map((p) => ({
      ...p,
      price: typeof p.price === "number" ? p.price + amount : amount
    })));

    setWalkInPrice(typeof walkInPrice === "number" ? walkInPrice + amount : amount);
    setIncreaseAmount("");
    setIsBulkIncreaseModalOpen(false);
  };

  const updatePrice = (id: number, newPrice: string) => {
    const amount = newPrice === "" ? "" : parseInt(newPrice);
    setPrices(prices.map((p) => (p.id === id ? { ...p, price: amount } : p)));
  };

  const handleEditClick = (id: number) => {
    if (editingId === id) {
       setEditingId(null);
    } else {
       setEditingId(id);
       setTimeout(() => {
         document.getElementById(`price-input-${id}`)?.focus();
       }, 10);
    }
  };

  const handleEditWalkInClick = () => {
    setEditingWalkIn(!editingWalkIn);
    if (!editingWalkIn) {
        setTimeout(() => {
          document.getElementById(`walk-in-price-input`)?.focus();
        }, 10);
    }
  };

  const validateForm = () => {
    const invalidPrices = prices.filter(p => p.price === "" || p.price <= 0);
    const isWalkInInvalid = walkInPrice === "" || walkInPrice <= 0;

    if (invalidPrices.length > 0 || isWalkInInvalid) {
      setGlobalError("All locations and Walk-ins must have a valid price greater than ₱0.");
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
      const updates = prices.map(p => ({
        id: p.id,
        price: Number(p.price)
      }));

      if (walkInId !== null && walkInPrice !== "") {
        updates.push({ id: walkInId, price: Number(walkInPrice) });
      }

      const result = await batchUpdatePrices(updates);

      if (result.success) {
        setIsSuccessModalOpen(true);
        setEditingId(null); 
      } else {
        setGlobalError(result.error || "Failed to update prices.");
      }
    } catch (e) {
      console.error(e);
      setGlobalError("An unexpected error occurred while saving prices.");
    } finally {
      setLoading(false);
      setIsModalOpen(false);
    }
  };

  const handleSaveNewZone = async () => {
    setGlobalError(null);
    setSuccessMessage(null);

    if (!newZoneName.trim() || !newZonePrice || Number(newZonePrice) <= 0) {
      setGlobalError("Please provide a valid zone name and a price greater than ₱0.");
      setIsAddZoneModalOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setAddingZoneLoading(true);
    try {
      const result = await addLocation({ 
        location_name: newZoneName.trim(), 
        location_price: Number(newZonePrice) 
      });

      if (result && result.success) {
        setSuccessMessage(`Zone "${newZoneName}" added successfully!`);
        fetchPrices(); 
        setNewZoneName("");
        setNewZonePrice("");
      } else {
        setGlobalError(result?.error || "Failed to add new zone.");
      }
    } catch (e) {
      console.error(e);
      setGlobalError("An unexpected error occurred while adding the new zone.");
    } finally {
      setAddingZoneLoading(false);
      setIsAddZoneModalOpen(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleDeleteZoneClick = (id: number, name: string) => {
      setZoneToDelete({ id, name });
      setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
      if (!zoneToDelete) return;
      
      setDeletingLoading(true);
      setGlobalError(null);
      
      try {
          const result = await deactivateLocation(zoneToDelete.id);

          if (result.success) {
              setSuccessMessage(`Zone "${zoneToDelete.name}" has been removed.`);
              fetchPrices(); // REFRESH DATA TO UPDATE BOTH LISTS
              setEditingId(null);
          } else {
              setGlobalError(result.error || "Failed to remove zone.");
          }
      } catch (e) {
          console.error(e);
          setGlobalError("An unexpected error occurred while removing the zone.");
      } finally {
          setDeletingLoading(false);
          setIsDeleteModalOpen(false);
          setZoneToDelete(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
  };

  // RESTORE HANDLERS
  const handleRestoreZoneClick = (id: number, name: string) => {
      setZoneToRestore({ id, name });
      setIsRestoreModalOpen(true);
  };

  const handleConfirmRestore = async () => {
      if (!zoneToRestore) return;
      
      setRestoringLoading(true);
      setGlobalError(null);
      
      try {
          const result = await restoreLocation(zoneToRestore.id);

          if (result.success) {
              setSuccessMessage(`Zone "${zoneToRestore.name}" has been restored.`);
              fetchPrices(); // REFRESH DATA TO UPDATE BOTH LISTS
          } else {
              setGlobalError(result.error || "Failed to restore zone.");
          }
      } catch (e) {
          console.error(e);
          setGlobalError("An unexpected error occurred while restoring the zone.");
      } finally {
          setRestoringLoading(false);
          setIsRestoreModalOpen(false);
          setZoneToRestore(null);
          window.scrollTo({ top: 0, behavior: "smooth" });
      }
  };

  const filteredPrices = prices.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isWalkInInvalid = walkInPrice === "" || walkInPrice <= 0;

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">

          <div className="flex items-center mb-8 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
              Manage Prices
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 text-left relative overflow-hidden">

            {globalError && (
              <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200 animate-in fade-in">
                ⚠️ {globalError}
              </div>
            )}

            {successMessage && (
              <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200 animate-in fade-in">
                ✅ {successMessage}
              </div>
            )}

            <div className="bg-[#eef2f5] rounded-[20px] p-3 mb-4 border border-[#1e3d58]/10 flex flex-col sm:flex-row items-center justify-between gap-3">
              <label className="text-xs sm:text-sm font-bold text-[#1e3d58] uppercase tracking-widest whitespace-nowrap pl-1">
                Bulk Increase:
              </label>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end">
                <div className="relative w-28">
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
                  onClick={handleBulkIncreaseClick}
                  className="h-10 w-10 rounded-lg bg-[#43b0f1] text-white hover:bg-[#1e3d58] p-0 flex items-center justify-center transition-colors shadow-sm shrink-0"
                >
                  <Plus size={20} strokeWidth={4} />
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <div className={`flex flex-col p-4 border-2 rounded-[20px] bg-white transition-colors gap-2 ${isWalkInInvalid ? 'border-red-400 bg-red-50' : 'border-[#43b0f1] bg-[#e8eef1]/30'}`}>
                <div className="flex flex-row justify-between items-center w-full gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0 pr-2">
                    <span className={`text-lg sm:text-2xl font-bold whitespace-normal break-words block leading-tight ${isWalkInInvalid ? 'text-red-600' : 'text-[#1e3d58]'}`}>
                        Walk-in
                    </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                    <span className={`text-xl sm:text-2xl font-bold ${isWalkInInvalid ? 'text-red-500' : editingWalkIn ? "text-[#43b0f1]" : "text-[#1e3d58]"}`}>
                        ₱
                    </span>
                    <input
                        id="walk-in-price-input"
                        type="number"
                        value={walkInPrice}
                        onChange={(e) => setWalkInPrice(e.target.value === "" ? "" : parseInt(e.target.value))}
                        readOnly={!editingWalkIn}
                        className={`w-12 sm:w-14 text-xl sm:text-2xl font-black text-left pl-1 bg-transparent focus:outline-none transition-colors ${isWalkInInvalid
                            ? "text-red-600 border-b-2 border-red-500"
                            : editingWalkIn
                            ? "text-[#43b0f1] border-b-2 border-[#43b0f1]"
                            : "text-[#1e3d58]"
                        }`}
                    />
                    <SquarePen
                        onClick={handleEditWalkInClick}
                        size={22}
                        className={`ml-1 sm:ml-2 cursor-pointer transition-all shrink-0 ${isWalkInInvalid
                            ? "text-red-400 hover:text-red-600"
                            : editingWalkIn
                            ? "text-[#43b0f1] scale-110"
                            : "text-[#1e3d58] hover:text-[#43b0f1] hover:scale-110"
                        }`}
                    />
                    </div>
                </div>
              </div>
            </div>

            <hr className="border-dashed border-gray-300 mb-6" />

            <div className="flex justify-center mb-6">
              <Button
                onClick={() => setIsAddZoneModalOpen(true)}
                className="h-12 px-6 rounded-[15px] bg-[#eef2f5] text-[#1e3d58] border border-[#1e3d58]/10 hover:bg-[#1e3d58] hover:text-white transition-all font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <MapPin size={20} strokeWidth={2.5} />
                <span>Add New Zone</span>
              </Button>
            </div>

            <div className="relative mb-6">
              <input
                type="text"
                placeholder="Search location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-12 rounded-full border-2 border-gray-200 bg-gray-50 text-[#1e3d58] font-bold focus:outline-none focus:border-[#43b0f1] focus:ring-1 focus:ring-[#43b0f1] transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={3} />
              <button
                onClick={fetchPrices}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#43b0f1] hover:text-[#1e3d58] transition-colors"
                title="Refresh Prices"
              >
                <RefreshCw size={20} className={initialLoading ? "animate-spin" : ""} />
              </button>
            </div>

            <div className="space-y-3 pb-2">
              {initialLoading ? (
                <div className="space-y-3 w-full animate-pulse">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center p-4 border-2 border-gray-100 rounded-[20px] bg-white gap-3">
                      <div className="h-6 w-32 sm:w-48 bg-slate-200 rounded"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-16 bg-slate-200 rounded"></div>
                        <div className="h-6 w-6 bg-slate-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPrices.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-bold italic">
                  No locations found.
                </div>
              ) : (
                filteredPrices.map((location) => {
                  const isInvalid = location.price === "" || location.price <= 0;
                  const isEditing = editingId === location.id;

                  return (
                    <div key={location.id} className={`flex flex-col p-4 border-2 rounded-[20px] bg-white transition-colors gap-2 sm:gap-3 ${isInvalid ? 'border-red-400 bg-red-50' : 'border-[#1e3d58]/20'}`}>
                      <div className="flex flex-row justify-between items-center w-full gap-2">
                          <div className="flex-1 min-w-0 pr-2">
                            <span className={`text-lg sm:text-2xl font-bold whitespace-normal break-words block leading-tight ${isInvalid ? 'text-red-600' : 'text-[#1e3d58]'}`}>
                              {location.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-xl sm:text-2xl font-bold ${isInvalid ? 'text-red-500' : isEditing ? "text-[#43b0f1]" : "text-[#1e3d58]"}`}>
                              ₱
                            </span>
                            <input
                              id={`price-input-${location.id}`}
                              type="number"
                              value={location.price}
                              onChange={(e) => updatePrice(location.id, e.target.value)}
                              readOnly={!isEditing}
                              className={`w-12 sm:w-14 text-xl sm:text-2xl font-black text-left pl-1 bg-transparent focus:outline-none transition-colors ${isInvalid
                                  ? "text-red-600 border-b-2 border-red-500"
                                  : isEditing
                                    ? "text-[#43b0f1] border-b-2 border-[#43b0f1]"
                                    : "text-[#1e3d58]"
                                }`}
                            />
                            <SquarePen
                              onClick={() => handleEditClick(location.id)}
                              size={22}
                              className={`ml-1 sm:ml-2 cursor-pointer transition-all shrink-0 ${isInvalid
                                  ? "text-red-400 hover:text-red-600"
                                  : isEditing
                                    ? "text-[#43b0f1] scale-110"
                                    : "text-[#1e3d58] hover:text-[#43b0f1] hover:scale-110"
                                }`}
                            />
                          </div>
                      </div>
                      
                      {isEditing && (
                          <div className="w-full pt-3 mt-1 border-t border-gray-100 flex justify-end animate-in fade-in slide-in-from-top-2">
                             <Button
                                onClick={() => handleDeleteZoneClick(location.id, location.name)}
                                variant="ghost"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                             >
                                 <Trash2 size={14} strokeWidth={3} />
                                 Remove Zone
                             </Button>
                          </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

            {/* ============================== */}
            {/* VIEW REMOVED ZONES SECTION     */}
            {/* ============================== */}
            <div className="pt-4 pb-2 flex flex-col items-center border-t border-dashed border-gray-200 mt-4">
              <button
                onClick={() => setShowRemovedZones(!showRemovedZones)}
                className="flex items-center gap-2 text-gray-400 hover:text-[#1e3d58] transition-colors font-bold text-xs uppercase tracking-widest py-2 px-4 rounded-full hover:bg-gray-50"
              >
                {showRemovedZones ? <EyeOff size={16} /> : <Eye size={16} />}
                {showRemovedZones ? "Hide Removed Zones" : "View Removed Zones"}
              </button>

              {showRemovedZones && (
                <div className="w-full mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                  {removedPrices.length === 0 ? (
                    <div className="text-center py-4 text-gray-400 font-bold italic text-sm">
                      No removed zones found.
                    </div>
                  ) : (
                    removedPrices.map((zone) => (
                      <div key={zone.id} className="flex flex-row justify-between items-center p-3 sm:p-4 border-2 border-dashed border-gray-300 rounded-[20px] bg-gray-50/50 gap-2">
                        <div className="flex-1 min-w-0 pr-2">
                          {/* MODIFIED: Tinanggal ang truncate, idinagdag ang whitespace-normal break-words leading-tight */}
                          <span className="text-base sm:text-lg font-bold text-gray-400 line-through block whitespace-normal break-words leading-tight">
                            {zone.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-base sm:text-lg font-bold text-gray-400 line-through">
                            ₱{zone.price}
                          </span>
                          <Button
                            onClick={() => handleRestoreZoneClick(zone.id, zone.name)}
                            variant="ghost"
                            className="bg-green-100 text-green-700 hover:bg-green-200 hover:text-green-800 h-8 px-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 shrink-0"
                          >
                            <RotateCcw size={14} strokeWidth={3} />
                            Restore
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="pt-8 flex justify-center">
              <Button
                onClick={handleSaveClick}
                disabled={loading}
                className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`fixed bottom-24 right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          }`}
      >
        <ArrowUp size={24} strokeWidth={3} />
      </button>

      {/* MODAL PARA SA BAGONG ZONE */}
      {isAddZoneModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#e8eef1] rounded-[40px] p-2 w-full max-w-sm shadow-2xl">
            <div className="bg-white rounded-[30px] p-6 text-center border border-gray-100 flex flex-col items-center">
              <div className="w-16 h-16 bg-[#eef2f5] text-[#43b0f1] rounded-full flex items-center justify-center mb-4 shadow-sm">
                <MapPin size={32} strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-black text-[#1e3d58] mb-5 tracking-tight">Add New Zone</h2>
              
              <div className="w-full space-y-4 mb-6">
                <div className="text-left">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Zone Name</label>
                  <input
                    type="text"
                    placeholder="e.g., San Jose"
                    value={newZoneName}
                    maxLength={50}
                    onChange={(e) => {
                      const restrictedValue = e.target.value.replace(/[^a-zA-Z0-9\s,-]/g, '');
                      setNewZoneName(restrictedValue);
                    }}
                    className="w-full h-12 rounded-[15px] border-2 border-gray-200 bg-gray-50 px-4 text-lg font-bold text-[#1e3d58] focus:outline-none focus:border-[#43b0f1] transition-all"
                  />
                </div>
                
                <div className="text-left relative">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Total Price (₱) per container</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1e3d58] font-black text-xl">₱</span>
                    <input
                      type="text" 
                      inputMode="numeric" 
                      placeholder="0"
                      maxLength={5}
                      value={newZonePrice}
                      onChange={(e) => {
                        const restrictedValue = e.target.value.replace(/[^0-9]/g, '');
                        setNewZonePrice(restrictedValue);
                      }}
                      className="w-full h-12 rounded-[15px] border-2 border-gray-200 bg-gray-50 pl-10 pr-4 text-xl font-bold text-[#1e3d58] focus:outline-none focus:border-[#43b0f1] transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full">
                <Button 
                  onClick={() => setIsAddZoneModalOpen(false)} 
                  disabled={addingZoneLoading}
                  className="flex-1 h-12 text-lg font-bold rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all shadow-sm"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleSaveNewZone} 
                  disabled={addingZoneLoading}
                  className="flex-1 h-12 text-lg font-bold rounded-xl bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {addingZoneLoading ? "Saving..." : "Save Zone"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        onConfirm={handleSave}
        title="Save Price Updates?"
        message="Are you sure you want to apply these new prices? This will reflect on all future orders."
        confirmText={loading ? "Saving..." : "Save Prices"}
      />

      <ConfirmationModal
        isOpen={isBulkIncreaseModalOpen}
        onClose={() => setIsBulkIncreaseModalOpen(false)}
        onConfirm={confirmBulkIncrease}
        title="Confirm Bulk Update"
        message={`Are you sure you want to apply a bulk update of ₱${increaseAmount} to all items? You still need to click "Save Changes" afterwards to update the database.`}
        confirmText="Yes, Apply"
      />

      {/* DELETE MODAL */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => !deletingLoading && setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Zone?"
        message={`Are you sure you want to remove "${zoneToDelete?.name}"? It will no longer be available for new orders.`}
        confirmText={deletingLoading ? "Removing..." : "Yes, Remove"}
      />

      {/* RESTORE MODAL */}
      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => !restoringLoading && setIsRestoreModalOpen(false)}
        onConfirm={handleConfirmRestore}
        title="Restore Zone?"
        message={`Are you sure you want to restore "${zoneToRestore?.name}"? It will be available again for new orders.`}
        confirmText={restoringLoading ? "Restoring..." : "Yes, Restore"}
      />

      {/* SUCCESS MODAL */}
      {isSuccessModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
              <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl">
                  <div className="bg-white rounded-[30px] p-8 text-center border border-gray-100 flex flex-col items-center">
                      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                          <Check size={40} strokeWidth={4} />
                      </div>
                      <h2 className="text-3xl font-black text-[#1e3d58] mb-3 tracking-tight">Success!</h2>
                      <p className="mb-8 text-gray-500 font-bold text-base leading-snug">
                          Prices updated successfully!
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

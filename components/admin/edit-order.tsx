"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Search, Minus, Plus, MapPin, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";

export default function EditOrderForm() {
    // [BACKEND TODO]: Replace these static values with data fetched from the database
    const [orderId, setOrderId] = useState("ORD-2026-001");
    const [customerName] = useState("Januard D. Esguerra");
    const [contactNumber] = useState("09610123193");
    const [customerZone] = useState("Bulaon");
    const [pricePerUnit] = useState(30);

    const [slimCount, setSlimCount] = useState(5);
    const [roundCount, setRoundCount] = useState(0);

    const [isModalOpen, setIsModalOpen] = useState(false);

    // [BACKEND TODO]: Ensure this calculation logic matches the server-side validation
    const newTotal = (slimCount + roundCount) * pricePerUnit;

    const handleSave = () => {
        // [BACKEND TODO]: Implement API call to update the order details
        console.log("Saving...", orderId);
    };

    return (
        <div className="w-full max-w-md mx-auto mb-24 animate-in fade-in zoom-in duration-500 relative">

            <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl mt-6">
                
                <div className="flex items-center mb-8 relative px-2">
                    <Link
                        href="/dashboard"
                        className="absolute left-2 text-[#1e3d58] transition-transform hover:scale-110"
                    >
                        <ChevronLeft size={44} strokeWidth={3} />
                    </Link>
                    <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center ml-4">
                        Edit Order
                    </h1>
                </div>

                <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
                    
                    <div className="mb-6">
                        <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Order ID:</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                // [BACKEND TODO]: Trigger search fetch on enter/click
                                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-white text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                            />
                            <button className="absolute right-2 top-2 bottom-2 bg-[#1e3d58] text-white px-4 rounded-full hover:bg-[#43b0f1] transition-colors flex items-center justify-center">
                               <Search size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-5">
                        
                        <div className="grid grid-cols-1 gap-4 opacity-80">
                            <div>
                                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Name:</label>
                                <input 
                                    type="text" 
                                    value={customerName} 
                                    readOnly 
                                    className="w-full h-14 px-6 rounded-full border-2 border-gray-400 bg-gray-100 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none" 
                                />
                            </div>

                            <div>
                                <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Contact:</label>
                                <input 
                                    type="text" 
                                    value={contactNumber} 
                                    readOnly 
                                    className="w-full h-14 px-6 rounded-full border-2 border-gray-400 bg-gray-100 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none" 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                 <div>
                                    <label className="block text-sm font-bold mb-1 ml-2 text-[#1e3d58]">Zone:</label>
                                    <div className="flex h-12 items-center px-4 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-600 font-bold">
                                        <MapPin size={16} className="mr-2"/> {customerZone}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1 ml-2 text-[#1e3d58]">Price/Gal:</label>
                                    <div className="flex h-12 items-center px-4 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-600 font-bold justify-between">
                                        <Tag size={16} className="mr-2"/> ₱{pricePerUnit}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                            <div className="w-full p-4 rounded-[30px] border-2 border-[#1e3d58] bg-white space-y-4">
                                
                                <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58]">
                                    <span>Slim Gallon:</span>
                                    <div className="flex items-center gap-5">
                                        <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center">
                                            <Minus size={28} strokeWidth={3} />
                                        </button>
                                        <span className="w-8 text-center text-2xl">{slimCount}</span>
                                        <button onClick={() => setSlimCount(slimCount + 1)} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center">
                                            <Plus size={28} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-xl font-bold text-[#1e3d58] border-t border-gray-100 pt-3">
                                    <span>Round Gallon:</span>
                                    <div className="flex items-center gap-5">
                                        <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center">
                                            <Minus size={28} strokeWidth={3} />
                                        </button>
                                        <span className="w-8 text-center text-2xl">{roundCount}</span>
                                        <button onClick={() => setRoundCount(roundCount + 1)} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center">
                                            <Plus size={28} strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center pt-2">
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-medium text-[#1e3d58]">New Amount:</span>
                                <span className="text-5xl font-black text-[#43b0f1]">₱{newTotal}</span>
                            </div>
                        </div>

                        <div className="pt-4 flex justify-center">
                            <Button 
                                onClick={() => setIsModalOpen(true)}
                                className="w-full h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-md"
                            >
                                Confirm Edit
                            </Button>
                        </div>

                    </div>
                </div>
            </div>

            <ConfirmationModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleSave}
                title="Update Order Details"
                message={`Are you sure you want to update ${orderId}? The new total amount will be ₱${newTotal}.`} // pwede pa palitan to ng mas magandang message 
                confirmText="Save Changes"
            />

        </div>
    );
}

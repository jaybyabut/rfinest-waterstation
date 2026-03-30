"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Minus, Plus, RefreshCw, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { getOrderForEdit } from "@/app/actions/getOrderForEdit";
import { saveOrderEdit } from "@/app/actions/saveOrderEdit";
import OrderSelection from "./order-selection";

export default function EditOrderForm() {
    const [viewState, setViewState] = useState<"selection" | "editing">("selection");

    const [selectedOrderId, setSelectedOrderId] = useState("");
    const [orderId, setOrderId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [customerZone, setCustomerZone] = useState("");
    const [pricePerUnit, setPricePerUnit] = useState(0);

    const [slimCount, setSlimCount] = useState(0);
    const [roundCount, setRoundCount] = useState(0);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingSave, setLoadingSave] = useState(false);
    
    // DINAGDAG: Bagong state para sa Skeleton Loader
    const [isFetching, setIsFetching] = useState(false);
    
    const [showScrollTop, setShowScrollTop] = useState(false);

    const newTotal = (slimCount + roundCount) * pricePerUnit;

    useEffect(() => {
        const handleWindowScroll = () => {
            setShowScrollTop(window.scrollY > 200);
        };
        window.addEventListener("scroll", handleWindowScroll);
        return () => window.removeEventListener("scroll", handleWindowScroll);
    }, []);

    const loadOrderDetails = async (id: string) => {
        setSelectedOrderId(id);
        setGlobalError(null);
        setSuccessMessage(null);
        setErrors({});
        setViewState("editing");
        
        // Gagamitin natin ito para i-trigger ang Skeleton Loader
        setIsFetching(true);

        try {
            const result = await getOrderForEdit(id);

            if ('error' in result) {
                setGlobalError(result.error || "Order not found.");
                setViewState("selection");
                return;
            }

            const { order } = result;
            setOrderId(order.displayId);
            setCustomerName(order.customerName);
            setContactNumber(order.contactNumber);
            setCustomerZone(order.zone);
            setPricePerUnit(order.pricePerUnit);
            setSlimCount(order.slimCount);
            setRoundCount(order.roundCount);
        } catch (e) {
            console.error(e);
            setGlobalError("Failed to fetch order details.");
            setViewState("selection");
        } finally {
            // Papatayin ang Skeleton Loader kapag tapos na
            setIsFetching(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (slimCount === 0 && roundCount === 0) {
            newErrors.items = "Order must have at least one item (Slim or Round gallon).";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleConfirmClick = () => {
        setGlobalError(null);
        setSuccessMessage(null);
        if (validateForm()) {
            setIsModalOpen(true);
        } else {
            setGlobalError("Please check the highlighted fields and fix the errors.");
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleSave = async () => {
        setLoadingSave(true);
        setGlobalError(null);

        try {
            const result = await saveOrderEdit({
                orderId: selectedOrderId,
                slimCount,
                roundCount,
                pricePerUnit,
            });

            if ('error' in result) {
                setGlobalError(result.error || "Failed to update order.");
            } else {
                setSuccessMessage("Order updated successfully!");
                setErrors({});
                setTimeout(() => {
                    setSuccessMessage(null);
                    setViewState("selection");
                }, 3000);
            }
        } catch (e) {
            console.error("An error occurred", e);
            setGlobalError("An unexpected error occurred while updating the order.");
        } finally {
            setLoadingSave(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
            <div className="w-full max-w-md mx-auto">
                <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-8 text-center border-2 border-white shadow-xl mt-6">

                    <div className="flex items-center mb-8 relative px-2">
                        {viewState === "selection" ? (
                            <Link href="/dashboard" className="absolute left-2 text-[#1e3d58] transition-transform hover:scale-110">
                                <ChevronLeft size={44} strokeWidth={3} />
                            </Link>
                        ) : (
                            <button
                                onClick={() => setViewState("selection")}
                                className="absolute left-2 text-[#1e3d58] transition-transform hover:scale-110"
                            >
                                <ChevronLeft size={44} strokeWidth={3} />
                            </button>
                        )}

                        <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 leading-tight">
                            {viewState === "selection" ? "Select Order" : "Edit Order"}
                        </h1>
                    </div>

                    {/* INAYOS: Tinanggal ang overflow-hidden dito para hindi ma-trap ang scroll sa loob */}
                    <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left relative min-h-[400px] w-full">

                        {globalError && (
                            <div className="mb-6 bg-red-100 text-red-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-red-200 break-words">⚠️ {globalError}</div>
                        )}
                        {successMessage && (
                            <div className="mb-6 bg-green-100 text-green-700 p-4 rounded-xl text-center font-bold text-sm border-2 border-green-200 break-words">✅ {successMessage}</div>
                        )}

                        {viewState === "selection" ? (
                            <OrderSelection onSelectOrder={loadOrderDetails} />
                        ) : isFetching ? (
                            
                            // ================= SKELETON LOADER =================
                            <div className="space-y-5 w-full animate-pulse">
                                <div className="grid grid-cols-1 gap-4 w-full">
                                    <div className="w-full">
                                        <div className="h-6 w-24 bg-slate-200 rounded mb-2 ml-2"></div>
                                        <div className="h-14 w-full bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-6 w-20 bg-slate-200 rounded mb-2 ml-2"></div>
                                        <div className="h-14 w-full bg-slate-200 rounded-full"></div>
                                    </div>
                                    <div className="w-full">
                                        <div className="h-6 w-24 bg-slate-200 rounded mb-2 ml-2"></div>
                                        <div className="h-14 w-full bg-slate-200 rounded-full"></div>
                                    </div>
                                </div>

                                <hr className="border-dashed border-gray-200" />

                                <div className="pt-2 w-full">
                                    <div className="h-6 w-24 bg-slate-200 rounded mb-2 ml-2"></div>
                                    <div className="w-full h-32 bg-slate-200 rounded-[30px]"></div>
                                </div>

                                <div className="flex flex-col items-center pt-2 w-full">
                                    <div className="h-10 w-48 bg-slate-200 rounded-full"></div>
                                </div>

                                <div className="pt-4 flex justify-center w-full">
                                    <div className="w-full h-16 bg-slate-300 rounded-full"></div>
                                </div>
                            </div>
                            // ================= END SKELETON LOADER =================

                        ) : (
                            <div className={`space-y-5 animate-in slide-in-from-right-4 duration-300 w-full ${loadingSave ? "opacity-50 pointer-events-none" : ""}`}>

                                {loadingSave && (
                                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center rounded-[40px]">
                                        <RefreshCw className="animate-spin text-[#1e3d58] mb-2" size={40} />
                                        <span className="text-[#1e3d58] font-black uppercase tracking-widest text-sm">Processing...</span>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4 opacity-90 w-full">
                                    <div className="w-full">
                                        <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Order ID:</label>
                                        <input type="text" value={orderId} readOnly className="w-full h-14 px-6 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-400 font-bold text-lg cursor-not-allowed focus:outline-none truncate" />
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Name:</label>
                                        <input type="text" value={customerName} readOnly className="w-full h-14 px-6 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none truncate" />
                                    </div>

                                    <div className="w-full">
                                        <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Contact:</label>
                                        <input type="text" value={contactNumber} readOnly className="w-full h-14 px-6 rounded-full border-2 border-gray-300 bg-gray-50 text-gray-500 font-bold text-lg cursor-not-allowed focus:outline-none truncate" />
                                    </div>
                                </div>

                                <hr className="border-dashed border-gray-200" />

                                <div className="pt-2 w-full">
                                    <label className="block text-xl font-bold mb-1 ml-2 text-[#1e3d58]">Details:</label>
                                    <div className={`w-full p-4 rounded-[30px] border-2 bg-[#e8eef1] space-y-4 transition-colors ${errors.items ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' : 'border-[#1e3d58]'}`}>

                                        <div className={`flex justify-between items-center text-xl font-bold gap-2 ${errors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                                            <span className="flex-1 whitespace-normal leading-tight break-words">Slim Gallon:</span>
                                            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                                                <button onClick={() => setSlimCount(Math.max(0, slimCount - 1))} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm shrink-0"><Minus size={24} strokeWidth={3} /></button>
                                                <span className="w-6 sm:w-8 text-center text-2xl font-black">{slimCount}</span>
                                                <button onClick={() => setSlimCount(slimCount + 1)} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm shrink-0"><Plus size={24} strokeWidth={3} /></button>
                                            </div>
                                        </div>

                                        <div className={`flex justify-between items-center text-xl font-bold border-t border-white/60 pt-3 gap-2 ${errors.items ? 'text-red-700' : 'text-[#1e3d58]'}`}>
                                            <span className="flex-1 whitespace-normal leading-tight break-words">Round Gallon:</span>
                                            <div className="flex items-center gap-3 sm:gap-5 shrink-0">
                                                <button onClick={() => setRoundCount(Math.max(0, roundCount - 1))} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm shrink-0"><Minus size={24} strokeWidth={3} /></button>
                                                <span className="w-6 sm:w-8 text-center text-2xl font-black">{roundCount}</span>
                                                <button onClick={() => setRoundCount(roundCount + 1)} className="text-[#1e3d58] hover:text-[#43b0f1] transition-colors w-10 h-10 flex items-center justify-center bg-white rounded-full shadow-sm shrink-0"><Plus size={24} strokeWidth={3} /></button>
                                            </div>
                                        </div>

                                    </div>
                                    {errors.items && <p className="text-red-500 text-sm font-bold mt-2 ml-2 text-center break-words">{errors.items}</p>}
                                </div>

                                <div className="flex flex-col items-center pt-2 w-full">
                                    <div className="flex items-center justify-center gap-2 flex-wrap">
                                        <span className="text-xl sm:text-2xl font-medium text-[#1e3d58]">New Amount:</span>
                                        <span className="text-4xl sm:text-5xl font-black text-[#43b0f1]">₱{newTotal}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-center w-full">
                                    <Button onClick={handleConfirmClick} disabled={loadingSave} className="w-full h-16 text-xl sm:text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 shadow-md">
                                        {loadingSave ? "Processing..." : "Confirm Edit"}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className={`fixed bottom-24 right-4 sm:right-6 p-3 bg-[#43b0f1] text-white rounded-full shadow-lg hover:bg-[#3298d4] hover:scale-110 transition-all duration-300 z-40 ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
                    }`}
            >
                <ArrowUp size={24} strokeWidth={3} />
            </button>

            <ConfirmationModal
                isOpen={isModalOpen} onClose={() => !loadingSave && setIsModalOpen(false)} onConfirm={handleSave} title="Update Order Details"
                message={`Are you sure you want to update ${orderId}? The new total amount will be ₱${newTotal}.`}
                confirmText={loadingSave ? "Saving..." : "Save Changes"}
            />
        </div>
    );
}

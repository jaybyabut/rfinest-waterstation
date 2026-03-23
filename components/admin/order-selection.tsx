"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, ShoppingBag, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// FIX: Ginawan ng strict Interface imbes na 'any'
interface PendingOrder {
    order_id: string;
    name: string;
    transaction_type: string;
    total_amount: number;
    order_dt: string;
    location_pricing?: { location_name: string }[] | { location_name: string } | null;
}

interface OrderSelectionProps {
    onSelectOrder: (orderId: string) => void;
}

export default function OrderSelection({ onSelectOrder }: OrderSelectionProps) {
    // FIX: Best practice para hindi nagre-render nang paulit-ulit
    const [supabase] = useState(() => createClient());
    
    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

    // FIX: Ginamit natin ang useCallback para pumasa nang 100% sa strict linter
    const fetchPendingOrders = useCallback(async () => {
        setLoadingList(true);
        setError(null);
        
        try {
            const { data, error: fetchError } = await supabase
                .from("orders")
                .select(`
                    order_id,
                    name,
                    transaction_type,
                    total_amount,
                    order_dt,
                    location_pricing ( location_name )
                `)
                .eq("current_status", "Pending")
                .order("order_dt", { ascending: false });

            if (fetchError) throw fetchError;
            // FIX: Force natin as PendingOrder[] gamit ang unknown technique
            setPendingOrders((data as unknown as PendingOrder[]) || []);
        } catch (e) {
            console.error(e);
            setError("Failed to fetch pending orders list.");
        } finally {
            setLoadingList(false);
        }
    }, [supabase]);

    useEffect(() => {
        fetchPendingOrders();
    // FIX: Wala nang eslint-disable-next-line comment! Malinis na malinis na.
    }, [fetchPendingOrders]);

    const filteredOrders = pendingOrders.filter((order) => {
        const query = searchQuery.toLowerCase();
        const shortId = order.order_id?.toString().substring(0,8).toLowerCase() || "";
        const name = (order.name || "").toLowerCase();
        return shortId.includes(query) || name.includes(query);
    });

    return (
        <div className="space-y-4 animate-in slide-in-from-left-4 duration-300">
            {error && (
                <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                    ⚠️ {error}
                </div>
            )}

            <div className="relative mb-4">
                <input
                    type="text"
                    placeholder="Search ID or Name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-full border-2 border-gray-200 bg-gray-50 text-[#1e3d58] font-bold focus:outline-none focus:border-[#43b0f1] focus:ring-1 focus:ring-[#43b0f1] transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={3} />
            </div>

            <div className="flex justify-between items-center px-2 mb-2">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending Orders</span>
                <button onClick={fetchPendingOrders} className="text-[#43b0f1] hover:text-[#1e3d58] transition-colors">
                    <RefreshCw size={16} className={loadingList ? "animate-spin" : ""} />
                </button>
            </div>

            <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar pb-4">
                {loadingList ? (
                    <div className="flex flex-col items-center justify-center py-10 opacity-50">
                        <RefreshCw className="animate-spin text-[#1e3d58] mb-2" size={32} />
                        <p className="font-bold text-sm text-[#1e3d58]">Loading orders...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold italic">
                        No pending orders found.
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const shortId = order.order_id?.toString().substring(0,8).toUpperCase();
                        const locData = Array.isArray(order.location_pricing) ? order.location_pricing[0] : order.location_pricing;
                        const locName = locData?.location_name || order.transaction_type || "N/A";
                        
                        return (
                            <button 
                                key={order.order_id} 
                                onClick={() => onSelectOrder(order.order_id)}
                                className="w-full bg-[#f8fbfd] hover:bg-[#e8eef1] border-2 border-[#1e3d58]/10 hover:border-[#43b0f1] transition-all rounded-[20px] p-4 text-left group"
                            >
                                <div className="flex justify-between items-start mb-2 border-b border-gray-200 pb-2">
                                    <span className="text-lg font-black text-[#1e3d58] group-hover:text-[#43b0f1] transition-colors">
                                        #{shortId}
                                    </span>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full bg-orange-100 text-orange-600">
                                        PENDING
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                    <ShoppingBag size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-sm font-bold text-gray-700 truncate">{order.name === "Walk-in" ? "Walk-in Customer" : order.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin size={14} className="text-gray-400 shrink-0" />
                                    <span className="text-xs font-bold text-gray-500 truncate">{locName}</span>
                                </div>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}

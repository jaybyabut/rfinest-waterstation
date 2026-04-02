"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, RefreshCw, ShoppingBag, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface PendingOrder {
    order_id: string;
    name: string;
    transaction_type: string;
    total_amount: number;
    order_dt: string;
    current_status?: string;
    location_pricing?: { location_name: string }[] | { location_name: string } | null;
}

interface OrderSelectionProps {
    onSelectOrder: (orderId: string) => void;
}

export default function OrderSelection({ onSelectOrder }: OrderSelectionProps) {
    const [supabase] = useState(() => createClient());

    const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
    const [loadingList, setLoadingList] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [error, setError] = useState<string | null>(null);

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
                    current_status,
                    location_pricing ( location_name )
                `)
                .in("current_status", ["Pending", "Pickup"])
                .order("order_dt", { ascending: false });

            if (fetchError) throw fetchError;
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
    }, [fetchPendingOrders]);

    const filteredOrders = pendingOrders.filter((order) => {
        const query = searchQuery.toLowerCase();
        const shortId = order.order_id?.toString().substring(0, 8).toLowerCase() || "";
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
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Order to Edit</span>
                <button onClick={fetchPendingOrders} className="text-[#43b0f1] hover:text-[#1e3d58] transition-colors outline-none">
                    <RefreshCw size={16} className={loadingList ? "animate-spin" : ""} strokeWidth={3} />
                </button>
            </div>

            <div className="space-y-3 pb-4 w-full">
                {loadingList ? (
                    <div className="space-y-3 w-full animate-pulse">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-full bg-[#f8fbfd] border-2 border-[#1e3d58]/5 rounded-[20px] p-4">
                                <div className="flex justify-between items-start mb-2 border-b border-gray-100 pb-2">
                                    <div className="h-6 w-24 bg-slate-200 rounded"></div>
                                    <div className="h-5 w-16 bg-orange-100 rounded-full"></div>
                                </div>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                                    <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-slate-200 shrink-0"></div>
                                    <div className="h-3 w-1/3 bg-slate-200 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 font-bold italic bg-gray-50 rounded-[20px] border-2 border-dashed border-gray-200">
                        No editable orders found.
                    </div>
                ) : (
                    filteredOrders.map((order) => {
                        const shortId = order.order_id?.toString().substring(0, 8).toUpperCase();
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
                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                                        order.current_status === 'Pending' ? 'bg-orange-100 text-orange-600' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                        {order.current_status || "PENDING"}
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

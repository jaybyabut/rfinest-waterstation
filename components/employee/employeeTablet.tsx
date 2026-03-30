"use client";

import React, { useState, useEffect } from 'react';
import { 
  LayoutGrid, 
  Package, 
  X, 
  Bike, 
  ShoppingBag, 
  Droplets, 
  CheckCircle2, 
  Maximize, 
  Minimize, 
  History, 
  Clock, 
  Image as ImageIcon,
  Loader2 
} from 'lucide-react';
import { getWalkInOrders } from "@/app/actions/getWalkInOrders";
import { getOnlineOrders } from "@/app/actions/getOnlineOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";
import { getActivityLogs } from "@/app/actions/getActivityLogs";
import { createClient } from "@/lib/supabase/client";
import { cacheWalkInOrders, getCachedWalkInOrders, cacheOnlineOrders, getCachedOnlineOrders } from "@/lib/offline/orderCacheService";
import { queueStatusUpdate } from "@/lib/offline/offlineStatusService";

const mapWalkIn = (data: any[]) => data.map(o => ({
  id: o.order_id.toString(),
  status: o.current_status,
  items: o.order_items.map((i: any) => ({
    type: i.products.product_name.includes('Slim') ? 'SLIM' : 'ROUND',
    quantity: i.quantity
  }))
}));

type OrderItem = { type: string; quantity: number };
type WalkInOrder = { id: string; items: OrderItem[]; status: string };

// TODO: BACKEND - I-align ang status strings sa actual database values niyo, at siguraduhing nafe-fetch ang payment_method at receipt_url
type OnlineOrder = {
  id: string;
  items: OrderItem[];
  status: string;
  name: string;
  address: string;
  notes?: string;
  payment_method: 'cash' | 'ebank' | string;
  receipt_url?: string;
};

interface EmployeeLog {
  id: string;
  timestamp: string;
  action: string;
  details: string;
}

export default function EmployeeTablet() {
  const [activeTab, setActiveTab] = useState<'walkin' | 'online'>('walkin');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [logs, setLogs] = useState<EmployeeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logError, setLogError] = useState<string | null>(null);

  const [viewingReceipt, setViewingReceipt] = useState<string | null>(null);

  const [walkInOrders, setWalkInOrders] = useState<WalkInOrder[]>([]);
  const [loadingWalkIn, setLoadingWalkIn] = useState(true);

  const fetchWalkIn = async () => {
    try {
      if (navigator.onLine) {
        const data = await getWalkInOrders();
        if (Array.isArray(data)) {
          setWalkInOrders(mapWalkIn(data));
          await cacheWalkInOrders(data);
        }
      } else {
        const cached = await getCachedWalkInOrders();
        if (cached.length > 0) {
          // Re-map cached items back to component state format
          setWalkInOrders(cached.map(o => ({
            id: o.id,
            status: o.current_status,
            items: o.items || []
          })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch walk-in orders:", error);
    } finally {
      setLoadingWalkIn(false);
    }
  };

  useEffect(() => {
    fetchWalkIn();
    const interval = setInterval(fetchWalkIn, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([]);
  const [loadingOnline, setLoadingOnline] = useState(true);

  const fetchOnline = async () => {
    const supabase = createClient();
    try {
      if (navigator.onLine) {
        const data = await getOnlineOrders();
        if (Array.isArray(data)) {
          const mappedData = await Promise.all(
            data.map(async (o) => {
              let receipt_url = undefined;
              if (o.proof_payment) {
                const { data: signedUrlData } = await supabase.storage.from('proof_payment').createSignedUrl(o.proof_payment, 60 * 60 * 24);
                if (signedUrlData) receipt_url = signedUrlData.signedUrl;
              }

              return {
                id: o.order_id.toString(),
                status: o.current_status.toLowerCase(),
                name: o.name,
                address: o.address,
                notes: o.note,
                payment_method: o.payment_mode,
                receipt_url: receipt_url,
                items: o.order_items.map((i: any) => ({
                  type: i.products.product_name.includes('Slim') ? 'SLIM' : 'ROUND',
                  quantity: i.quantity
                }))
              };
            })
          );
          setOnlineOrders(mappedData);
          await cacheOnlineOrders(data);
        }
      } else {
        const cached = await getCachedOnlineOrders();
        if (cached.length > 0) {
          setOnlineOrders(cached.map(o => ({
            id: o.id,
            status: o.current_status.toLowerCase(),
            name: o.customer_name,
            address: o.address || 'N/A',
            notes: o.notes,
            payment_method: o.payment_mode || 'N/A',
            items: o.items || []
          })));
        }
      }
    } catch (error) {
      console.error("Failed to fetch online orders:", error);
    } finally {
      setLoadingOnline(false);
    }
  };

  useEffect(() => {
    fetchOnline();
    const interval = setInterval(fetchOnline, 10000); // 10s refresh
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => console.error(err));
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  const handleRefill = async (id: any) => {
    if (navigator.onLine) {
      const res = await updateOrderStatus(id, 'Delivered');
      if (res.success) {
        setWalkInOrders(prev => prev.filter(o => o.id !== id));
        setConfirmingId(null);
      }
    } else {
      // Offline Flow
      await queueStatusUpdate(id, 'Delivered');
      setWalkInOrders(prev => prev.filter(o => o.id !== id));
      setConfirmingId(null);
    }
  };

  const cycleOnlineStatus = async (id: any) => {
    const currentOrder = onlineOrders.find(o => o.id === id);
    if (!currentOrder) return;

    let nextStatus = '';
    if (currentOrder.status === 'pending') nextStatus = 'Pick-up';
    else if (currentOrder.status === 'pick-up') nextStatus = 'Processing';
    else if (currentOrder.status === 'processing') nextStatus = 'Refilled';
    else if (currentOrder.status === 'refilled') nextStatus = 'Out for Delivery';
    else if (currentOrder.status === 'out for delivery') nextStatus = 'Delivered';

    if (nextStatus) {
      if (navigator.onLine) {
        const res = await updateOrderStatus(id, nextStatus);
        if (res.success) {
          setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus.toLowerCase() } : o));
          if (nextStatus === 'Delivered') {
            setOnlineOrders(prev => prev.filter(o => o.id !== id));
          }
          setConfirmingId(null);
        }
      } else {
        // Offline Flow
        await queueStatusUpdate(id, nextStatus);
        setOnlineOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus.toLowerCase() } : o));
        if (nextStatus === 'Delivered') {
          setOnlineOrders(prev => prev.filter(o => o.id !== id));
        }
        setConfirmingId(null);
      }
    }
  };

  const fetchMyLogs = async () => {
    setLoadingLogs(true);
    setLogError(null);
    try {
      const result = await getActivityLogs();
      if (result && 'logs' in result && Array.isArray(result.logs)) {
        setLogs(result.logs.map((log: any) => ({
          id: log.log_id.toString(),
          timestamp: log.created_at,
          action: log.activity,
          details: `Performed by ${log.user_name || 'Staff'}`
        })));
      } else {
        setLogError("Failed to load your history data.");
      }
    } catch (error) {
      console.error(error);
      setLogError("Failed to load your history.");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isHistoryOpen) {
      fetchMyLogs();
    }
  }, [isHistoryOpen]);

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans relative">

      {/* MODAL: VIEW RECEIPT - PERFECTLY CENTERED */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300 p-4 md:p-12">
          <div className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#e8eef1]">
              <h2 className="text-3xl font-black text-[#1e3d58] tracking-tight flex items-center gap-3">
                <ImageIcon size={32} className="text-[#43b0f1]" /> PROOF OF PAYMENT
              </h2>
              <button
                onClick={() => setViewingReceipt(null)}
                className="bg-red-500 text-white p-3 rounded-xl hover:bg-red-600 transition-colors active:scale-95 shadow-md"
              >
                <X size={28} strokeWidth={3} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 flex justify-center items-center bg-slate-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={viewingReceipt}
                alt="Payment Receipt"
                className="max-w-full max-h-[60vh] object-contain rounded-2xl shadow-sm border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* HEADER CONTROLS */}
      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex gap-3 md:gap-4">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-3 md:p-4 rounded-full transition-all duration-300 shadow-md opacity-100 bg-[#43b0f1] hover:bg-[#1e3d58] text-white"
        >
          <History size={28} strokeWidth={2.5} />
        </button>
        <button
          onClick={toggleFullscreen}
          className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-md ${isFullscreen ? "opacity-0 hover:opacity-100 bg-black/50 text-white" : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
        >
          {isFullscreen ? <Minimize size={28} strokeWidth={2.5} /> : <Maximize size={28} strokeWidth={2.5} />}
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex w-full bg-white border-b-4 border-slate-200 h-24 md:h-32 flex-none shadow-sm pr-32 md:pr-48">
        <button
          onClick={() => { setActiveTab('walkin'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-black transition-all ${activeTab === 'walkin' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
            }`}
        >
          <LayoutGrid className="w-8 h-8 md:w-12 md:h-12" /> WALK-IN
        </button>
        <button
          onClick={() => { setActiveTab('online'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-black transition-all ${activeTab === 'online' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
            }`}
        >
          <Package className="w-8 h-8 md:w-12 md:h-12" /> ONLINE
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {activeTab === 'walkin' && (
          loadingWalkIn ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Loader2 className="w-16 h-16 animate-spin text-[#43b0f1]" />
              <span className="font-black text-2xl uppercase tracking-widest text-slate-400">Loading Walk-In Orders...</span>
            </div>
          ) : (
            walkInOrders.length > 0 ? (
              walkInOrders.map((order) => (
                <div key={order.id} className="flex items-stretch w-full p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-l-[16px] md:border-l-[24px] border-l-[#1e3d58] shadow-sm hover:shadow-md transition-all">
                  
                  {/* LEFT COLUMN: STATUS ICON */}
                  <div className="flex flex-col items-center justify-center w-24 md:w-40 border-r-4 border-slate-100 pr-4 md:pr-8 mr-4 md:mr-8 text-slate-400 shrink-0">
                    <CheckCircle2 className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />
                    <span className="font-bold text-sm md:text-xl uppercase tracking-widest mt-2 text-center">WALK-IN</span>
                  </div>

                  {/* MIDDLE COLUMN: ITEMS (No Truncation, Clean Wrapping) */}
                  <div className="flex-1 flex flex-col justify-center py-2">
                    <div className="flex flex-wrap gap-6 md:gap-12 w-full">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-2 md:gap-4 shrink-0">
                          <span className="text-5xl md:text-7xl font-black text-slate-800 leading-none">{item.quantity}</span>
                          <span className="text-2xl md:text-4xl font-bold text-slate-500 uppercase italic">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ID & CONTROLS (Unified Width) */}
                  <div className="flex flex-col items-end justify-center gap-4 md:gap-8 pl-4 md:pl-8 border-l-4 border-slate-100 shrink-0 min-w-[200px] md:min-w-[400px]">
                    <div className="text-right w-full">
                      <span className="block text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="block text-4xl md:text-6xl font-black text-slate-900 break-all whitespace-normal leading-none w-full">ORD-{order.id.split('-')[0]}</span>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      {confirmingId === order.id ? (
                        <div className="flex gap-2 md:gap-4 items-stretch bg-slate-50 p-2 md:p-4 rounded-2xl md:rounded-3xl border-2 border-[#43b0f1] w-full">
                          <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg active:scale-90 shrink-0">
                            <X className="w-8 h-8 md:w-12 md:h-12" strokeWidth={4} />
                          </button>
                          <button onClick={() => handleRefill(order.id)} className="flex-1 bg-green-500 text-white py-3 md:py-6 rounded-xl md:rounded-2xl font-black text-xl md:text-4xl shadow-xl animate-pulse active:scale-95">
                            SURE?
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(order.id)}
                          className="bg-[#1e3d58] text-white w-full px-6 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl shadow-lg active:scale-95 transition-transform text-center"
                        >
                          MARK DELIVERED
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-300 h-full">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-center">No Walk-In Orders</h1>
                <p className="text-lg md:text-2xl font-bold mt-4 text-center">Good job! Everything is cleared.</p>
              </div>
            )
          )
        )}

        {activeTab === 'online' && (
          loadingOnline ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Loader2 className="w-16 h-16 animate-spin text-[#43b0f1]" />
              <span className="font-black text-2xl uppercase tracking-widest text-slate-400">Loading Online Orders...</span>
            </div>
          ) : (
            onlineOrders.length > 0 ? (
              onlineOrders.map((order) => (
                <div key={order.id}
                  className={`flex items-stretch w-full p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-l-[16px] md:border-l-[24px] shadow-sm hover:shadow-md transition-all duration-500 ${order.status === 'pending' ? 'border-l-orange-500' :
                    order.status === 'processing' ? 'border-l-sky-500' :
                      order.status === 'refilled' ? 'border-l-blue-500' :
                        'border-l-purple-500'
                    }`}
                >
                  {/* LEFT COLUMN: STATUS ICON */}
                  <div className={`flex flex-col items-center justify-center w-24 md:w-40 border-r-4 border-slate-100 pr-4 md:pr-8 mr-4 md:mr-8 shrink-0 ${order.status === 'pending' ? 'text-orange-600' :
                    order.status === 'processing' ? 'text-sky-600' :
                      order.status === 'refilled' ? 'text-blue-600' :
                        'text-purple-600'
                    }`}>
                    {order.status === 'pending' && <ShoppingBag className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />}
                    {['pick-up', 'processing', 'refilled'].includes(order.status) && <Droplets className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />}
                    {order.status === 'out for delivery' && <Bike className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />}
                    <span className="font-bold text-sm md:text-xl uppercase tracking-widest mt-2 text-center leading-none">
                      {order.status === 'pending' && 'PENDING'}
                      {order.status === 'pick-up' && 'PICK-UP'}
                      {order.status === 'processing' && 'QUEUED'}
                      {order.status === 'refilled' && 'REFILLED'}
                      {order.status === 'out for delivery' && 'DELIVERY'}
                    </span>
                  </div>

                  {/* MIDDLE COLUMN: NAME, ADDRESS & ITEMS */}
                  <div className="flex-1 flex flex-col justify-center py-2">
                    <p className="text-3xl md:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight mb-1 break-words whitespace-normal w-full">
                      {order.name}
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-slate-500 uppercase italic mb-4 break-words whitespace-normal w-full">
                      {order.address}
                    </p>
                    <div className="flex flex-wrap gap-4 md:gap-8 mb-2 w-full">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-2 md:gap-3 shrink-0">
                          <span className="text-3xl md:text-5xl font-black text-[#43b0f1] leading-none">{item.quantity}</span>
                          <span className="text-lg md:text-2xl font-bold text-slate-500 uppercase italic">{item.type}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="flex items-start gap-2 md:gap-4 mt-2 w-full">
                        <span className="bg-slate-100 px-3 py-1 rounded-md font-bold text-slate-500 text-xs md:text-lg shrink-0 mt-1">NOTE</span>
                        <p className="text-lg md:text-2xl font-bold text-slate-500 italic break-words whitespace-normal leading-tight w-full">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: ID & CONTROLS (Unified Width) */}
                  <div className="flex flex-col items-end justify-center gap-4 md:gap-8 pl-4 md:pl-8 border-l-4 border-slate-100 shrink-0 min-w-[200px] md:min-w-[400px]">
                    <div className="text-right w-full">
                      <span className="block text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="block text-4xl md:text-6xl font-black text-slate-900 break-all whitespace-normal leading-none w-full">ORD-{order.id.split('-')[0]}</span>
                    </div>

                    <div className="flex flex-col gap-3 w-full">
                      {/* VIEW RECEIPT - Preserved precise E-Bank condition */}
                      {order.payment_method === 'E-Bank' && order.receipt_url && (
                        <button
                          onClick={() => setViewingReceipt(order.receipt_url || null)}
                          className="flex items-center justify-center gap-2 bg-[#e8eef1] text-[#1e3d58] border-2 border-[#1e3d58]/20 hover:border-[#43b0f1] hover:text-[#43b0f1] px-4 py-3 rounded-2xl font-black text-lg md:text-xl shadow-sm transition-all active:scale-95 w-full"
                        >
                          <ImageIcon size={24} strokeWidth={2.5} /> VIEW RECEIPT
                        </button>
                      )}

                      {confirmingId === order.id ? (
                        <div className="flex gap-2 md:gap-4 items-stretch bg-slate-50 p-2 md:p-4 rounded-2xl md:rounded-3xl border-2 border-slate-200 w-full">
                          <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg active:scale-90 shrink-0">
                            <X className="w-8 h-8 md:w-12 md:h-12" strokeWidth={4} />
                          </button>
                          <button onClick={() => cycleOnlineStatus(order.id)} className="flex-1 bg-green-500 text-white px-4 md:px-10 py-3 md:py-6 rounded-xl md:rounded-2xl font-black text-xl md:text-4xl shadow-xl animate-pulse active:scale-95">
                            SURE?
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(order.id)}
                          className={`w-full px-6 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-lg md:text-2xl shadow-lg transition-all text-white active:scale-95 text-center ${order.status === 'pending' ? 'bg-orange-500' :
                             order.status === 'pick-up' ? 'bg-amber-600' :
                            order.status === 'processing' ? 'bg-sky-600' :
                              order.status === 'refilled' ? 'bg-blue-600' :
                                'bg-purple-600'
                            }`}
                        >
                          {order.status === 'pending' && "MARK FOR PICK-UP"}
                          {order.status === 'pick-up' && "MARK PROCESSING"}
                          {order.status === 'processing' && "MARK REFILLED"}
                          {order.status === 'refilled' && "MARK FOR DELIVERY"}
                          {order.status === 'out for delivery' && "MARK DELIVERED"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-300 h-full">
                <h1 className="text-4xl md:text-6xl font-black uppercase text-center">No Online Orders</h1>
                <p className="text-lg md:text-2xl font-bold mt-4 text-center">All set! Waiting for new requests...</p>
              </div>
            )
          )
        )}
      </div>


      {/* HISTORY SIDEBAR & BACKDROP */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#e8eef1] shadow-2xl z-[70] transform transition-transform duration-500 flex flex-col ${isHistoryOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-6 md:p-8 bg-white shadow-sm border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <History className="text-[#43b0f1]" size={32} strokeWidth={3} />
            <h2 className="text-3xl font-black text-[#1e3d58] uppercase tracking-tighter">My History</h2>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 rounded-xl transition-colors"
          >
            <X size={32} strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
          {logError && (
            <div className="bg-red-100 text-red-700 p-4 rounded-2xl text-center font-bold">
              ⚠️ {logError}
            </div>
          )}

          {loadingLogs && !logError ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Clock className="text-[#43b0f1] animate-spin" size={32} />
              <span className="text-[#1e3d58] font-black tracking-widest uppercase text-sm animate-pulse">Loading actions...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <History size={60} strokeWidth={2} className="mb-4 text-[#1e3d58]" />
              <p className="font-black uppercase tracking-widest text-sm text-[#1e3d58]">No actions yet today.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-3xl p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#43b0f1]/50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#43b0f1] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="pl-3">
                  <div className="text-xl font-black text-[#1e3d58] flex items-center gap-2 mb-2">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" strokeWidth={3} />
                    {log.action}
                  </div>
                  <div className="text-base font-bold text-gray-500 leading-snug mb-4">
                    {log.details}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 border-t border-gray-100 pt-3">
                    <Clock size={16} strokeWidth={3} />
                    <span className="text-xs font-black uppercase tracking-widest">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

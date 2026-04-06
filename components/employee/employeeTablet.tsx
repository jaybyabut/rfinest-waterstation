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
    const interval = setInterval(fetchWalkIn, 10000); 
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
                id: o.order_id?.toString(),
                status: o.current_status?.toLowerCase() || 'pickup',
                name: o.name || 'Unknown Customer',
                address: o.address || 'N/A',
                notes: o.note || '',
                payment_method: o.payment_mode || 'Cash',
                receipt_url: receipt_url,
                
                items: (o.order_items || []).map((i: any) => ({
                  type: i.products?.product_name?.toLowerCase().includes('slim') ? 'SLIM' : 'ROUND',
                  quantity: i.quantity || 0
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
    const interval = setInterval(fetchOnline, 10000); 
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
      await queueStatusUpdate(id, 'Delivered');
      setWalkInOrders(prev => prev.filter(o => o.id !== id));
      setConfirmingId(null);
    }
  };

  const cycleOnlineStatus = async (id: any) => {
    const currentOrder = onlineOrders.find(o => o.id === id);
    if (!currentOrder) return;

    let nextStatus = '';
    if (currentOrder.status === 'pending') nextStatus = 'Pickup';
    else if (currentOrder.status === 'pickup') nextStatus = 'Processing';
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
          id: log.id?.toString() || Math.random().toString(), 
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

      {/* MODAL: VIEW RECEIPT */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in duration-300 p-4 sm:p-12">
          <div className="relative w-full max-w-2xl bg-white rounded-[30px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-[#e8eef1]">
              <h2 className="text-xl sm:text-3xl font-black text-[#1e3d58] tracking-tight flex items-center gap-3">
                <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 text-[#43b0f1]" /> PROOF OF PAYMENT
              </h2>
              <button
                onClick={() => setViewingReceipt(null)}
                className="bg-red-500 text-white p-2 sm:p-3 rounded-xl hover:bg-red-600 transition-colors active:scale-95 shadow-md"
              >
                <X className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 sm:p-6 flex justify-center items-center bg-slate-50">
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
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 lg:top-8 lg:right-8 z-50 flex gap-2 sm:gap-3 lg:gap-4">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 shadow-md opacity-100 bg-[#43b0f1] hover:bg-[#1e3d58] text-white"
        >
          <History className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />
        </button>
        <button
          onClick={toggleFullscreen}
          className={`p-2 sm:p-3 lg:p-4 rounded-full transition-all duration-300 shadow-md ${isFullscreen ? "opacity-0 hover:opacity-100 bg-black/50 text-white" : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
            }`}
        >
          {isFullscreen ? <Minimize className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} /> : <Maximize className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" strokeWidth={2.5} />}
        </button>
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex w-full bg-white border-b-4 border-slate-200 h-20 sm:h-24 lg:h-32 flex-none shadow-sm pr-24 sm:pr-32 lg:pr-48">
        <button
          onClick={() => { setActiveTab('walkin'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-2xl sm:text-3xl lg:text-5xl font-black transition-all ${activeTab === 'walkin' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
            }`}
        >
          <LayoutGrid className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12" /> WALK-IN
        </button>
        <button
          onClick={() => { setActiveTab('online'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-3 sm:gap-4 lg:gap-6 text-2xl sm:text-3xl lg:text-5xl font-black transition-all ${activeTab === 'online' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
            }`}
        >
          <Package className="w-6 h-6 sm:w-8 sm:h-8 lg:w-12 lg:h-12" /> ONLINE
        </button>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5 lg:space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {activeTab === 'walkin' && (
          loadingWalkIn ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Loader2 className="w-12 h-12 lg:w-16 lg:h-16 animate-spin text-[#43b0f1]" />
              <span className="font-black text-xl lg:text-2xl uppercase tracking-widest text-slate-400">Loading Walk-In Orders...</span>
            </div>
          ) : (
            walkInOrders.length > 0 ? (
              walkInOrders.map((order) => (
                <div key={order.id} className="flex flex-col sm:flex-row items-start sm:items-stretch w-full p-4 sm:p-5 lg:p-8 bg-white rounded-2xl sm:rounded-[1.5rem] lg:rounded-3xl border border-slate-200 border-l-[12px] sm:border-l-[16px] lg:border-l-[24px] border-l-[#1e3d58] shadow-sm hover:shadow-md transition-all">
                  
                  {/* LEFT COLUMN: STATUS ICON */}
                  <div className="flex flex-row sm:flex-col items-center justify-start sm:justify-center w-full sm:w-20 lg:w-40 border-b-4 sm:border-b-0 sm:border-r-4 border-slate-100 pb-3 sm:pb-0 pr-0 sm:pr-4 lg:pr-8 mb-3 sm:mb-0 mr-0 sm:mr-4 lg:mr-8 text-slate-400 shrink-0 gap-2 sm:gap-0">
                    <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 shrink-0" strokeWidth={2.5} />
                    <span className="font-bold text-base sm:text-xs lg:text-xl uppercase tracking-widest mt-0 sm:mt-2 text-left sm:text-center">WALK-IN</span>
                  </div>

                  {/* MIDDLE COLUMN: ITEMS */}
                  <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 w-full min-w-0">
                    <div className="flex flex-wrap gap-4 sm:gap-6 lg:gap-12 w-full">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-2 lg:gap-4 shrink-0">
                          <span className="text-4xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-slate-800 leading-none">{item.quantity}</span>
                          <span className="text-xl sm:text-xl md:text-2xl lg:text-4xl font-bold text-slate-500 uppercase italic">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT COLUMN: ID & CONTROLS */}
                  <div className="flex flex-col items-start sm:items-end justify-center gap-3 sm:gap-3 lg:gap-8 pt-3 sm:pt-0 pl-0 sm:pl-4 lg:pl-8 border-t-4 sm:border-t-0 sm:border-l-4 border-slate-100 shrink-0 w-full sm:w-1/3 lg:w-[350px] mt-3 sm:mt-0">
                    <div className="text-left sm:text-right w-full">
                      <span className="block text-xs sm:text-[10px] md:text-xs lg:text-xl font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="block text-3xl sm:text-2xl md:text-3xl lg:text-6xl font-black text-slate-900 break-all whitespace-normal leading-none w-full">ORD-{order.id.split('-')[0]}</span>
                    </div>

                    <div className="flex flex-col w-full">
                      {confirmingId === order.id ? (
                        <div className="flex gap-2 lg:gap-4 items-stretch bg-slate-50 p-2 lg:p-4 rounded-xl lg:rounded-3xl border-2 border-[#43b0f1] w-full">
                          <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-10 h-10 lg:w-20 lg:h-20 rounded-lg lg:rounded-2xl flex items-center justify-center shadow-md active:scale-90 shrink-0">
                            <X className="w-6 h-6 lg:w-12 lg:h-12" strokeWidth={4} />
                          </button>
                          <button onClick={() => handleRefill(order.id)} className="flex-1 bg-green-500 text-white py-2 lg:py-6 rounded-lg lg:rounded-2xl font-black text-lg lg:text-4xl shadow-md animate-pulse active:scale-95">
                            SURE?
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(order.id)}
                          className="bg-[#1e3d58] text-white w-full px-4 sm:px-4 lg:px-6 py-3 sm:py-3 lg:py-8 rounded-xl lg:rounded-3xl font-black text-xl sm:text-base md:text-xl lg:text-3xl shadow-md active:scale-95 transition-transform text-center"
                        >
                          MARK REFILLED
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-32 flex flex-col items-center justify-center text-slate-300 h-full">
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase text-center">No Walk-In Orders</h1>
                <p className="text-base sm:text-lg lg:text-2xl font-bold mt-3 lg:mt-4 text-center">Good job! Everything is cleared.</p>
              </div>
            )
          )
        )}

        {activeTab === 'online' && (
          loadingOnline ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
              <Loader2 className="w-12 h-12 lg:w-16 lg:h-16 animate-spin text-[#43b0f1]" />
              <span className="font-black text-xl lg:text-2xl uppercase tracking-widest text-slate-400">Loading Online Orders...</span>
            </div>
          ) : (
            onlineOrders.length > 0 ? (
              onlineOrders.map((order) => (
                <div key={order.id}
                  className={`flex flex-col sm:flex-row items-start sm:items-stretch w-full p-4 sm:p-5 lg:p-8 bg-white rounded-2xl sm:rounded-[1.5rem] lg:rounded-3xl border border-slate-200 border-l-[12px] sm:border-l-[16px] lg:border-l-[24px] shadow-sm hover:shadow-md transition-all duration-500 ${order.status === 'pending' ? 'border-l-orange-500' :
                    order.status === 'processing' ? 'border-l-sky-500' :
                      order.status === 'refilled' ? 'border-l-blue-500' :
                        'border-l-purple-500'
                    }`}
                >
                  {/* LEFT COLUMN: STATUS ICON */}
                  <div className={`flex flex-row sm:flex-col items-center justify-start sm:justify-center w-full sm:w-20 lg:w-40 border-b-4 sm:border-b-0 sm:border-r-4 border-slate-100 pb-3 sm:pb-0 pr-0 sm:pr-4 lg:pr-8 mb-3 sm:mb-0 mr-0 sm:mr-4 lg:mr-8 shrink-0 gap-2 sm:gap-0 ${order.status === 'pending' ? 'text-orange-600' :
                    order.status === 'processing' ? 'text-sky-600' :
                      order.status === 'refilled' ? 'text-blue-600' :
                        'text-purple-600'
                    }`}>
                    {order.status === 'pending' && <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 shrink-0" strokeWidth={2.5} />}
                    {['pickup', 'processing', 'refilled'].includes(order.status) && <Droplets className="w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 shrink-0" strokeWidth={2.5} />}
                    {order.status === 'out for delivery' && <Bike className="w-8 h-8 sm:w-10 sm:h-10 lg:w-16 lg:h-16 shrink-0" strokeWidth={2.5} />}
                    <span className="font-bold text-base sm:text-[10px] md:text-xs lg:text-xl uppercase tracking-widest mt-0 sm:mt-2 text-left sm:text-center leading-none">
                      {order.status === 'pending' && 'PENDING'}
                      {order.status === 'pickup' && 'PICK-UP'}
                      {order.status === 'processing' && 'QUEUED'}
                      {order.status === 'refilled' && 'REFILLED'}
                      {order.status === 'out for delivery' && 'DELIVERY'}
                    </span>
                  </div>

                  {/* MIDDLE COLUMN: NAME, ADDRESS & ITEMS */}
                  <div className="flex-1 flex flex-col justify-center py-1 sm:py-2 w-full min-w-0">
                    <p className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-slate-800 tracking-tight uppercase leading-tight mb-1 break-words whitespace-normal w-full">
                      {order.name}
                    </p>
                    <p className="text-base sm:text-sm lg:text-2xl font-bold text-slate-500 uppercase italic mb-3 lg:mb-4 break-words whitespace-normal w-full">
                      {order.address}
                    </p>
                    <div className="flex flex-wrap gap-3 sm:gap-4 lg:gap-8 mb-2 w-full">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-baseline gap-1.5 sm:gap-2 lg:gap-3 shrink-0">
                          <span className="text-2xl sm:text-2xl md:text-3xl lg:text-5xl font-black text-[#43b0f1] leading-none">{item.quantity}</span>
                          <span className="text-base sm:text-base lg:text-2xl font-bold text-slate-500 uppercase italic">{item.type}</span>
                        </div>
                      ))}
                    </div>
                    {order.notes && (
                      <div className="flex items-start gap-2 lg:gap-4 mt-2 w-full">
                        <span className="bg-slate-100 px-2 py-1 rounded-md font-bold text-slate-500 text-[10px] lg:text-lg shrink-0 mt-1">NOTE</span>
                        <p className="text-sm sm:text-xs lg:text-2xl font-bold text-slate-500 italic break-words whitespace-normal leading-tight w-full">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* RIGHT COLUMN: ID & CONTROLS */}
                  <div className="flex flex-col items-start sm:items-end justify-center gap-3 sm:gap-3 lg:gap-8 pt-3 sm:pt-0 pl-0 sm:pl-4 lg:pl-8 border-t-4 sm:border-t-0 sm:border-l-4 border-slate-100 shrink-0 w-full sm:w-1/3 lg:w-[350px] mt-3 sm:mt-0">
                    <div className="text-left sm:text-right w-full">
                      <span className="block text-xs sm:text-[10px] md:text-xs lg:text-xl font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</span>
                      <span className="block text-3xl sm:text-2xl md:text-3xl lg:text-6xl font-black text-slate-900 break-all whitespace-normal leading-none w-full">ORD-{order.id.split('-')[0]}</span>
                    </div>

                    <div className="flex flex-col gap-2 lg:gap-3 w-full">
                      {order.payment_method === 'E-Bank' && order.receipt_url && (
                        <button
                          onClick={() => setViewingReceipt(order.receipt_url || null)}
                          className="flex items-center justify-center gap-2 bg-[#e8eef1] text-[#1e3d58] border-2 border-[#1e3d58]/20 hover:border-[#43b0f1] hover:text-[#43b0f1] px-3 lg:px-4 py-2 lg:py-3 rounded-xl lg:rounded-2xl font-black text-sm sm:text-xs md:text-sm lg:text-xl shadow-sm transition-all active:scale-95 w-full"
                        >
                          <ImageIcon className="w-4 h-4 lg:w-6 lg:h-6" strokeWidth={2.5} /> VIEW RECEIPT
                        </button>
                      )}

                      {confirmingId === order.id ? (
                        <div className="flex gap-2 lg:gap-4 items-stretch bg-slate-50 p-2 lg:p-4 rounded-xl lg:rounded-3xl border-2 border-slate-200 w-full">
                          <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-10 h-10 lg:w-20 lg:h-20 rounded-lg lg:rounded-2xl flex items-center justify-center shadow-md active:scale-90 shrink-0">
                            <X className="w-6 h-6 lg:w-12 lg:h-12" strokeWidth={4} />
                          </button>
                          <button onClick={() => cycleOnlineStatus(order.id)} className="flex-1 bg-green-500 text-white px-3 lg:px-10 py-2 lg:py-6 rounded-lg lg:rounded-2xl font-black text-lg sm:text-base lg:text-4xl shadow-md animate-pulse active:scale-95">
                            SURE?
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingId(order.id)}
                          className={`w-full px-4 lg:px-6 py-3 sm:py-3 lg:py-8 rounded-xl lg:rounded-3xl font-black text-xl sm:text-sm md:text-base lg:text-2xl shadow-md transition-all text-white active:scale-95 text-center ${order.status === 'pending' ? 'bg-orange-500' :
                             order.status === 'pickup' ? 'bg-amber-600' :
                            order.status === 'processing' ? 'bg-sky-600' :
                              order.status === 'refilled' ? 'bg-blue-600' :
                                'bg-purple-600'
                            }`}
                        >
                          {order.status === 'pending' && "MARK FOR PICK-UP"}
                          {order.status === 'pickup' && "MARK PROCESSING"}
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
                <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black uppercase text-center">No Online Orders</h1>
                <p className="text-base sm:text-lg lg:text-2xl font-bold mt-3 lg:mt-4 text-center">All set! Waiting for new requests...</p>
              </div>
            )
          )
        )}
      </div>

      {/* HISTORY SIDEBAR */}
      {isHistoryOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[350px] lg:w-[450px] bg-[#e8eef1] shadow-2xl z-[70] transform transition-transform duration-500 flex flex-col ${isHistoryOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-5 lg:p-8 bg-white shadow-sm border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 lg:gap-3">
            <History className="text-[#43b0f1] w-7 h-7 lg:w-8 lg:h-8" strokeWidth={3} />
            <h2 className="text-2xl lg:text-3xl font-black text-[#1e3d58] uppercase tracking-tighter">My History</h2>
          </div>
          <button
            onClick={() => setIsHistoryOpen(false)}
            className="p-2 bg-slate-100 hover:bg-red-100 hover:text-red-500 text-slate-400 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 lg:w-8 lg:h-8" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-3 lg:space-y-4 custom-scrollbar">
          {logError && (
            <div className="bg-red-100 text-red-700 p-3 lg:p-4 rounded-xl lg:rounded-2xl text-center font-bold text-sm lg:text-base">
              ⚠️ {logError}
            </div>
          )}

          {loadingLogs && !logError ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3">
              <Clock className="text-[#43b0f1] animate-spin w-6 h-6 lg:w-8 lg:h-8" />
              <span className="text-[#1e3d58] font-black tracking-widest uppercase text-xs lg:text-sm animate-pulse">Loading actions...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 opacity-30">
              <History className="w-12 h-12 lg:w-16 lg:h-16 mb-4 text-[#1e3d58]" strokeWidth={2} />
              <p className="font-black uppercase tracking-widest text-xs lg:text-sm text-[#1e3d58]">No actions yet today.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-5 border-2 border-slate-100 shadow-sm relative overflow-hidden group hover:border-[#43b0f1]/50 transition-colors">
                <div className="absolute left-0 top-0 bottom-0 w-1.5 lg:w-2 bg-[#43b0f1] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="pl-3">
                  <div className="text-lg lg:text-xl font-black text-[#1e3d58] flex items-center gap-2 mb-1 lg:mb-2">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-green-500 shrink-0" strokeWidth={3} />
                    {log.action}
                  </div>
                  <div className="text-sm lg:text-base font-bold text-gray-500 leading-snug mb-3 lg:mb-4">
                    {log.details}
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 border-t border-gray-100 pt-2 lg:pt-3">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4" strokeWidth={3} />
                    <span className="text-[10px] lg:text-xs font-black uppercase tracking-widest">
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

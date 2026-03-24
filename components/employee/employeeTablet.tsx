"use client";

import React, { useState, useEffect } from 'react';
import { LayoutGrid, Package, X, Bike, ShoppingBag, Droplets, CheckCircle2, Maximize, Minimize, History, Clock, Image as ImageIcon, Loader2 } from 'lucide-react';
import { getWalkInOrders } from "@/app/actions/getWalkInOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";

type OrderItem = { type: string; quantity: number };
type WalkInOrder = { id: string; items: OrderItem[]; status: string };

// TODO: BACKEND - I-align ang status strings sa actual database values niyo, at siguraduhing nafe-fetch ang payment_method at receipt_url
type OnlineOrder = { 
  id: string; 
  items: OrderItem[]; 
  status: 'pending' | 'picked-up' | 'refilled'; 
  location: string;
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

export default function SeniorFriendlyTablet() {
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
      const data = await getWalkInOrders();
      if (Array.isArray(data)) {
        setWalkInOrders(data.map(o => ({
          id: o.order_id.toString(),
          status: o.current_status,
          items: o.order_items.map((i: any) => ({
            type: i.products.product_name.includes('Slim') ? 'SLIM' : 'ROUND',
            quantity: i.quantity
          }))
        })));
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

  // TODO: BACKEND - Fetch actual online orders and their receipt_url from Supabase Storage
  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([
    { id: '201', status: 'pending', location: 'Block 1 Lot 8 Bulaon', payment_method: 'ebank', receipt_url: 'https://placehold.co/600x800/e8eef1/1e3d58?text=Sample+Receipt', items: [{ type: 'SLIM', quantity: 2 }, { type: 'ROUND', quantity: 3 }] },
    { id: '202', status: 'picked-up', location: 'Walk-in Online', payment_method: 'cash', items: [{ type: 'SLIM', quantity: 4 }] },
    { id: '203', status: 'refilled', location: 'Block 1 Lot 8 Mexico', notes: 'Paki-iwan sa gate perds.', payment_method: 'ebank', receipt_url: 'https://placehold.co/600x800/e8eef1/1e3d58?text=GCash+Receipt', items: [{ type: 'ROUND', quantity: 3 }] },
  ]);

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
    const res = await updateOrderStatus(id, 'Delivered');
    if (res.success) {
      setWalkInOrders(prev => prev.filter(o => o.id !== id));
      setConfirmingId(null);
    }
  };

  const cycleOnlineStatus = (id: string) => {
    const currentOrder = onlineOrders.find(o => o.id === id);
    if (!currentOrder) return;

    // TODO: BACKEND - I-update ang bagong status ng online order sa Supabase
    if (currentOrder.status === 'refilled') {
      setOnlineOrders(prev => prev.filter(o => o.id !== id));
    } else {
      setOnlineOrders(prev => prev.map(o => {
        if (o.id !== id) return o;
        const nextStatus: OnlineOrder['status'] = 
          o.status === 'pending' ? 'picked-up' : 'refilled';
        return { ...o, status: nextStatus };
      }));
    }
    setConfirmingId(null);
  };

  const fetchMyLogs = async () => {
    setLoadingLogs(true);
    setLogError(null);
    try {
      // TODO: BACKEND - Fetch logs specifically for this tablet/employee for TODAY
      await new Promise((resolve) => setTimeout(resolve, 800)); 
      const dummyLogs: EmployeeLog[] = [
        { id: "LOG-1", timestamp: new Date().toISOString(), action: "Marked as Delivered", details: "Order ORD-9918 has been delivered to customer." },
        { id: "LOG-2", timestamp: new Date(Date.now() - 1800000).toISOString(), action: "Updated Status", details: "Order ORD-9919 marked as 'Out for Delivery'." },
        { id: "LOG-3", timestamp: new Date(Date.now() - 3600000).toISOString(), action: "Order Refilled", details: "Completed refill for 5 Round Containers (ORD-9920)." },
      ];
      setLogs(dummyLogs);
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

      <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 flex gap-3 md:gap-4">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="p-3 md:p-4 rounded-full transition-all duration-300 shadow-md opacity-100 bg-[#43b0f1] hover:bg-[#1e3d58] text-white"
        >
          <History size={28} strokeWidth={2.5} />
        </button>
        <button
          onClick={toggleFullscreen}
          className={`p-3 md:p-4 rounded-full transition-all duration-300 shadow-md ${
            isFullscreen ? "opacity-0 hover:opacity-100 bg-black/50 text-white" : "opacity-100 bg-slate-200 hover:bg-slate-300 text-slate-700"
          }`}
        >
          {isFullscreen ? <Minimize size={28} strokeWidth={2.5} /> : <Maximize size={28} strokeWidth={2.5} />}
        </button>
      </div>

      <div className="flex w-full bg-white border-b-4 border-slate-200 h-24 md:h-32 flex-none shadow-sm pr-32 md:pr-48">
        <button 
          onClick={() => { setActiveTab('walkin'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-black transition-all ${
            activeTab === 'walkin' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
          }`}
        >
          <LayoutGrid className="w-8 h-8 md:w-12 md:h-12" /> WALK-IN
        </button>
        <button 
          onClick={() => { setActiveTab('online'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-4 md:gap-6 text-3xl md:text-5xl font-black transition-all ${
            activeTab === 'online' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
          }`}
        >
          <Package className="w-8 h-8 md:w-12 md:h-12" /> ONLINE
        </button>
      </div>

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
                <div key={order.id} className="flex items-center w-full p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-l-[16px] md:border-l-[24px] border-l-[#1e3d58] shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col items-center justify-center w-24 md:w-40 border-r-2 border-slate-100 pr-4 md:pr-8 mr-4 md:mr-8 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5} />
                    <span className="font-bold text-sm md:text-xl uppercase tracking-widest mt-2 text-center">WALK-IN</span>
                  </div>

                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex flex-wrap gap-6 md:gap-12">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 md:gap-4">
                          <span className="text-5xl md:text-7xl font-black text-slate-800">{item.quantity}</span>
                          <span className="text-2xl md:text-4xl font-bold text-slate-400 uppercase italic">{item.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end md:flex-row md:items-center gap-4 md:gap-8 pl-4 md:pl-8 border-l-2 border-slate-100">
                    <div className="text-right">
                        <span className="block text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                        <span className="text-4xl md:text-6xl font-black text-slate-900">ORD-{order.id.split('-')[0]}</span>
                    </div>

                    {confirmingId === order.id ? (
                      <div className="flex gap-2 md:gap-4 items-center bg-slate-50 p-2 md:p-4 rounded-2xl md:rounded-3xl border-2 border-[#43b0f1]">
                        <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                          <X className="w-8 h-8 md:w-12 md:h-12" strokeWidth={4} />
                        </button>
                        <button onClick={() => handleRefill(order.id)} className="bg-green-500 text-white px-4 md:px-10 py-3 md:py-6 rounded-xl md:rounded-2xl font-black text-xl md:text-4xl shadow-xl animate-pulse active:scale-95">
                          SURE?
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setConfirmingId(order.id)}
                        className="bg-[#1e3d58] text-white px-6 md:px-12 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-xl md:text-3xl shadow-lg active:scale-95 transition-transform"
                      >
                        MARK DELIVERED
                      </button>
                    )}
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
          onlineOrders.length > 0 ? onlineOrders.map((order) => (
            <div key={order.id} 
              className={`flex items-center w-full p-4 md:p-8 bg-white rounded-2xl md:rounded-3xl border border-slate-200 border-l-[16px] md:border-l-[24px] shadow-sm hover:shadow-md transition-all duration-500 ${
                order.status === 'pending' ? 'border-l-orange-500' : 
                order.status === 'picked-up' ? 'border-l-blue-500' : 
                'border-l-green-500'
              }`}
            >
              <div className={`flex flex-col items-center justify-center w-24 md:w-40 border-r-2 border-slate-100 pr-4 md:pr-8 mr-4 md:mr-8 ${
                order.status === 'pending' ? 'text-orange-600' : 
                order.status === 'picked-up' ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {order.status === 'pending' && <ShoppingBag className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5}/>}
                {order.status === 'picked-up' && <Droplets className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5}/>}
                {order.status === 'refilled' && <Bike className="w-10 h-10 md:w-16 md:h-16" strokeWidth={2.5}/>}
                <span className="font-bold text-sm md:text-xl uppercase tracking-widest mt-2 text-center">
                    {order.status === 'pending' && 'PICKUP'}
                    {order.status === 'picked-up' && 'REFILL'}
                    {order.status === 'refilled' && 'DELIVER'}
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                {order.status === 'picked-up' ? (
                  <div className="flex flex-wrap gap-6 md:gap-12">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 md:gap-4">
                        <span className="text-5xl md:text-7xl font-black text-slate-800">{item.quantity}</span>
                        <span className="text-2xl md:text-4xl font-bold text-slate-400 uppercase italic">{item.type}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <>
                    <p className="text-3xl md:text-6xl font-black text-slate-800 tracking-tight uppercase leading-none">
                      {order.location}
                    </p>
                    {order.status === 'refilled' && order.notes && (
                      <p className="text-lg md:text-3xl font-bold text-slate-500 italic mt-2 md:mt-4 flex items-center gap-2 md:gap-4">
                        <span className="bg-slate-100 px-3 py-1 rounded-md not-italic text-xs md:text-xl">NOTE</span> 
                        `{order.notes}`
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex flex-col items-end md:flex-row md:items-center gap-4 md:gap-8 pl-4 md:pl-8 border-l-2 border-slate-100">
                <div className="text-right">
                    <span className="block text-sm md:text-xl font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                    <span className="text-4xl md:text-6xl font-black text-slate-900">ORD-{order.id.split('-')[0]}</span>
                </div>

                <div className="flex flex-col gap-3">
                  {order.payment_method?.toLowerCase() === 'ebank' && order.receipt_url && (
                    <button 
                      onClick={() => setViewingReceipt(order.receipt_url || null)}
                      className="flex items-center justify-center gap-2 bg-[#e8eef1] text-[#1e3d58] border-2 border-[#1e3d58]/20 hover:border-[#43b0f1] hover:text-[#43b0f1] px-4 py-3 rounded-2xl font-black text-lg md:text-xl shadow-sm transition-all active:scale-95"
                    >
                      <ImageIcon size={24} strokeWidth={2.5}/> VIEW RECEIPT
                    </button>
                  )}

                  {confirmingId === order.id ? (
                    <div className="flex gap-2 md:gap-4 items-center bg-slate-50 p-2 md:p-4 rounded-2xl md:rounded-3xl border-2 border-slate-200">
                      <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-12 h-12 md:w-20 md:h-20 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                        <X className="w-8 h-8 md:w-12 md:h-12" strokeWidth={4} />
                      </button>
                      <button onClick={() => cycleOnlineStatus(order.id)} className="bg-green-500 text-white px-4 md:px-10 py-3 md:py-6 rounded-xl md:rounded-2xl font-black text-xl md:text-4xl shadow-xl animate-pulse active:scale-95">
                        SURE?
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setConfirmingId(order.id)}
                      className={`min-w-[150px] md:min-w-[350px] px-6 py-4 md:py-8 rounded-2xl md:rounded-3xl font-black text-lg md:text-2xl shadow-lg transition-all text-white active:scale-95 text-center ${
                        order.status === 'pending' ? 'bg-orange-500' : 
                        order.status === 'picked-up' ? 'bg-blue-600' : 
                        'bg-green-600'
                      }`}
                    >
                      {order.status === 'pending' && "MARK PICKED-UP"}
                      {order.status === 'picked-up' && "MARK REFILLED"}
                      {order.status === 'refilled' && "MARK OUT FOR DELIVERY"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )) : (
            <div className="py-32 flex flex-col items-center justify-center text-slate-300 h-full">
              <h1 className="text-4xl md:text-6xl font-black uppercase text-center">No Online Orders</h1>
              <p className="text-lg md:text-2xl font-bold mt-4 text-center">All set! Waiting for new requests...</p>
            </div>
          )
        )}
      </div>

      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] animate-in fade-in duration-300"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      <div 
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#e8eef1] shadow-2xl z-[70] transform transition-transform duration-500 flex flex-col ${
          isHistoryOpen ? "translate-x-0" : "translate-x-full"
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

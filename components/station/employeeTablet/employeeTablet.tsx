"use client";

import React, { useState } from 'react';
import { LayoutGrid, Package, X, Bike, ShoppingBag, Droplets, CheckCircle2 } from 'lucide-react';

type OrderItem = { type: string; quantity: number };
type WalkInOrder = { id: string; items: OrderItem[] };
type OnlineOrder = { id: string; items: OrderItem[]; status: 'picked-up' | 'refilled' | 'delivery' };

export default function SeniorFriendlyTablet() {
  const [activeTab, setActiveTab] = useState<'walkin' | 'online'>('walkin');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const [walkInOrders, setWalkInOrders] = useState<WalkInOrder[]>([
    { id: '101', items: [{ type: 'SLIM', quantity: 1 }, { type: 'ROUND', quantity: 1 }] },
    { id: '102', items: [{ type: 'ROUND', quantity: 5 }] },
  ]);

  const [onlineOrders, setOnlineOrders] = useState<OnlineOrder[]>([
    { id: '201', status: 'picked-up', items: [{ type: 'SLIM', quantity: 2 }, { type: 'ROUND', quantity: 3 }] },
    { id: '202', status: 'picked-up', items: [{ type: 'SLIM', quantity: 4 }] },
  ]);

  const handleRefill = (id: string) => {
    setWalkInOrders(prev => prev.filter(o => o.id !== id));
    setConfirmingId(null);
  };

  const cycleOnlineStatus = (id: string) => {
    const currentOrder = onlineOrders.find(o => o.id === id);
    if (!currentOrder) return;

    if (currentOrder.status === 'delivery') {
      setOnlineOrders(prev => prev.filter(o => o.id !== id));
    } else {
      setOnlineOrders(prev => prev.map(o => {
        if (o.id !== id) return o;
        const nextStatus: OnlineOrder['status'] = 
          o.status === 'picked-up' ? 'refilled' : 'delivery';
        return { ...o, status: nextStatus };
      }));
    }
    setConfirmingId(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      
      {/* TABS SECTION - Styled like your Live Queue Header */}
      <div className="flex w-full bg-white border-b-4 border-slate-200 h-32 flex-none shadow-sm">
        <button 
          onClick={() => { setActiveTab('walkin'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-6 text-5xl font-black transition-all ${
            activeTab === 'walkin' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
          }`}
        >
          <LayoutGrid size={50} /> WALK-IN
        </button>
        <button 
          onClick={() => { setActiveTab('online'); setConfirmingId(null); }}
          className={`flex-1 flex items-center justify-center gap-6 text-5xl font-black transition-all ${
            activeTab === 'online' ? 'bg-[#43b0f1] text-white' : 'bg-white text-slate-400'
          }`}
        >
          <Package size={50} /> ONLINE
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {activeTab === 'walkin' ? (
          walkInOrders.map((order) => (
            /* MODERN CARD DESIGN */
            <div key={order.id} className="flex items-center w-full p-8 bg-white rounded-3xl border border-slate-200 border-l-[24px] border-l-[#1e3d58] shadow-md">
              
              {/* Left Side: Status Icon */}
              <div className="flex flex-col items-center justify-center w-48 border-r-2 border-slate-100 pr-8 mr-8 text-slate-400">
                <CheckCircle2 size={64} strokeWidth={2.5} />
                <span className="font-bold text-xl uppercase tracking-widest mt-2">WALK-IN</span>
              </div>

              {/* Center: Quantities (Main Instruction) */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-12">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-8xl font-black text-slate-800">{item.quantity}</span>
                      <span className="text-4xl font-bold text-slate-400 uppercase italic">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: ID & Actions */}
              <div className="flex items-center gap-8 pl-8 border-l-2 border-slate-100">
                <div className="text-right">
                    <span className="block text-xl font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                    <span className="text-6xl font-black text-slate-900">#{order.id}</span>
                </div>

                {confirmingId === order.id ? (
                  <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border-2 border-[#43b0f1]">
                    <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                      <X size={50} strokeWidth={4} />
                    </button>
                    <button onClick={() => handleRefill(order.id)} className="bg-green-500 text-white px-10 py-6 rounded-2xl font-black text-4xl shadow-xl animate-pulse active:scale-95">
                      SURE?
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmingId(order.id)}
                    className="bg-[#1e3d58] text-white px-12 py-8 rounded-3xl font-black text-4xl shadow-lg active:scale-95 transition-transform"
                  >
                    REFILL
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          onlineOrders.map((order) => (
            /* MODERN ONLINE CARD DESIGN */
            <div key={order.id} 
              className={`flex items-center w-full p-8 bg-white rounded-3xl border border-slate-200 border-l-[24px] shadow-md transition-all duration-500 ${
                order.status === 'picked-up' ? 'border-l-orange-500' : 
                order.status === 'refilled' ? 'border-l-blue-500' : 
                'border-l-green-500'
              }`}
            >
              {/* Left Side: Dynamic Status Icon */}
              <div className={`flex flex-col items-center justify-center w-48 border-r-2 border-slate-100 pr-8 mr-8 ${
                order.status === 'picked-up' ? 'text-orange-600' : 
                order.status === 'refilled' ? 'text-blue-600' : 
                'text-green-600'
              }`}>
                {order.status === 'picked-up' && <ShoppingBag size={64} strokeWidth={2.5}/>}
                {order.status === 'refilled' && <Droplets size={64} strokeWidth={2.5}/>}
                {order.status === 'delivery' && <Bike size={64} strokeWidth={2.5}/>}
                <span className="font-bold text-xl uppercase tracking-widest mt-2">
                    {order.status === 'delivery' ? 'DELIVERY' : order.status}
                </span>
              </div>

              {/* Center: Quantities */}
              <div className="flex-1">
                <div className="flex flex-wrap gap-12">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="text-8xl font-black text-slate-800">{item.quantity}</span>
                      <span className="text-4xl font-bold text-slate-400 uppercase italic">{item.type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: ID & Multi-Stage Button */}
              <div className="flex items-center gap-8 pl-8 border-l-2 border-slate-100">
                <div className="text-right">
                    <span className="block text-xl font-bold text-slate-400 uppercase tracking-widest">Order ID</span>
                    <span className="text-6xl font-black text-slate-900">#{order.id}</span>
                </div>

                {confirmingId === order.id ? (
                  <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-3xl border-2 border-slate-200">
                    <button onClick={() => setConfirmingId(null)} className="bg-red-500 text-white w-24 h-24 rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
                      <X size={50} strokeWidth={4} />
                    </button>
                    <button onClick={() => cycleOnlineStatus(order.id)} className="bg-green-500 text-white px-10 py-6 rounded-2xl font-black text-4xl shadow-xl animate-pulse active:scale-95">
                      SURE?
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmingId(order.id)}
                    className={`min-w-[400px] py-8 rounded-3xl font-black text-4xl shadow-lg transition-all text-white active:scale-95 ${
                      order.status === 'picked-up' ? 'bg-orange-500' : 
                      order.status === 'refilled' ? 'bg-blue-600' : 
                      'bg-green-600'
                    }`}
                  >
                    {order.status === 'picked-up' && "PICKED UP"}
                    {order.status === 'refilled' && "REFILLED"}
                    {order.status === 'delivery' && "OUT FOR DELIVERY"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
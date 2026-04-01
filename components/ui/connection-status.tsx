'use client';

import { useState, useEffect } from 'react';
import { WifiOff, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { db } from '@/lib/offline/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  const pendingOrdersCount = useLiveQuery(() => db.pendingOrders.where('status').equals('pending').count()) || 0;
  const pendingUpdatesCount = useLiveQuery(() => db.pendingStatusUpdates.where('status').equals('pending').count()) || 0;
  const isSyncingOrders = useLiveQuery(() => db.pendingOrders.where('status').equals('syncing').count()) || 0;
  const isSyncingUpdates = useLiveQuery(() => db.pendingStatusUpdates.where('status').equals('syncing').count()) || 0;

  const totalPending = pendingOrdersCount + pendingUpdatesCount;
  const isSyncing = isSyncingOrders > 0 || isSyncingUpdates > 0;

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && totalPending === 0 && !isSyncing) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] flex justify-center pointer-events-none">
      <div className="mt-2 px-4 py-2 rounded-full shadow-lg border flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-2 duration-300">
        {!isOnline ? (
          <div className="bg-orange-500 text-white flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            <WifiOff size={16} />
            Offline — {totalPending} items queued
          </div>
        ) : isSyncing ? (
          <div className="bg-blue-500 text-white flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            <RefreshCcw size={16} className="animate-spin" />
            Syncing {totalPending} items...
          </div>
        ) : totalPending > 0 ? (
          <div className="bg-green-500 text-white flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
            <CheckCircle2 size={16} />
            Online — {totalPending} items ready to sync
          </div>
        ) : null}
      </div>
    </div>
  );
}

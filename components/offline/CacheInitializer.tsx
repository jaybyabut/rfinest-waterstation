'use client';

import { useEffect } from 'react';
import { refreshCache } from '@/lib/offline/cacheService';
import { syncPendingOrders, syncPendingStatusUpdates } from '@/lib/offline/syncEngine';

export function CacheInitializer() {
  useEffect(() => {
    // Initial cache refresh and sync if online
    const init = async () => {
      await refreshCache();
      if (navigator.onLine) {
        syncPendingOrders();
        syncPendingStatusUpdates();
      }
    };
    init();

    const handleOnline = () => {
      console.log('App is online. Refreshing cache and starting sync...');
      refreshCache();
      syncPendingOrders();
      syncPendingStatusUpdates();
    };

    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  return null; // This component doesn't render anything
}

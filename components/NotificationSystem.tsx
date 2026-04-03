"use client";

import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from "next/navigation";

export function NotificationSystem() {
  const pathname = usePathname();
  const supabase = useMemo(() => createClient(), []);
  const roleRef = useRef<string | null>(null);

  useEffect(() => {
    // Fetch the user role
    const getRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        roleRef.current = user.app_metadata?.role || user.user_metadata?.role || null;
        
        // Request notification permission if admin
        if (roleRef.current === "admin") {
          if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
          }
        }
      }
    };

    getRole();

    const playLoudSound = () => {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextClass) return;
        
        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        // Create an attention-grabbing, loud sound (e.g., siren/beep pattern)
        oscillator.type = "square";
        
        // Frequency shifts
        oscillator.frequency.setValueAtTime(440, context.currentTime); // Beep
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.1); 
        oscillator.frequency.setValueAtTime(440, context.currentTime + 0.2); 
        oscillator.frequency.setValueAtTime(880, context.currentTime + 0.3);

        // Max volume
        gainNode.gain.setValueAtTime(1.0, context.currentTime); 
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.5);
      } catch (err) {
        console.error("Failed to play notification sound", err);
      }
    };

    // Subscribing to orders table
    const channel = supabase
      .channel("orders-notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          if (roleRef.current === "admin") {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("New Order Received!", {
                body: `A new order was just placed.`,
                icon: "/icon.png"
              });
            }
          }
          
          if ((roleRef.current === "employee" || roleRef.current === "station") && pathname === "/queueDisplay") {
            playLoudSound();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          // Check if status actually changed to prevent spam
          if (payload.old && payload.new && payload.old.status === payload.new.status) {
            return;
          }

          if (roleRef.current === "admin") {
            if ("Notification" in window && Notification.permission === "granted") {
              const status = payload.new.status || "updated";
              new Notification("Order Status Updated", {
                body: `An order status changed to ${status}.`,
                icon: "/icon.png"
              });
            }
          }
          
          if ((roleRef.current === "employee" || roleRef.current === "station") && pathname === "/queueDisplay") {
            playLoudSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pathname, supabase]);

  // This component doesn't render any visible UI
  return null;
}

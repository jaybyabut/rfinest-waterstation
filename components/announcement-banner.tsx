"use client";

import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // TODO: BACKEND - FETCH ACTIVE ANNOUNCEMENT
  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        // Dito mo ilalagay yung fetch logic. Example:
        // const { data, error } = await supabase
        //   .from('announcements')
        //   .select('message, is_active')
        //   .eq('id', 1) 
        //   .single();
        //
        // if (data?.is_active) {
        //   setAnnouncement(data.message);
        // } else {
        //   setAnnouncement(null);
        // }

        // MOCK DATA PARA MA-TEST MO YUNG UI NGAYON (Burahin mo ito pag may backend na)
        setAnnouncement("Please be advised that we will be closed tomorrow due to maintenance. Regular operations will resume the following day.");
        
        // Simulating no announcement default state (Naka-comment muna para ma-test mo yung may laman)
        // setAnnouncement(null); 
      } catch (error) {
        console.error("Error fetching announcement:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncement();
  }, []);

  if (loading || !announcement) return null; // Wag i-render kung walang active announcement

  return (
    <div className="w-full px-4 mt-4 animate-in slide-in-from-top-4 fade-in duration-500">
      <div className="bg-[#e8eef1] border-2 border-[#43b0f1]/30 rounded-[25px] p-4 flex gap-3 sm:gap-4 shadow-sm items-start sm:items-center">
        <div className="bg-white p-2 rounded-full shrink-0 text-[#43b0f1] shadow-sm">
          <Megaphone size={24} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-black text-[#1e3d58] uppercase tracking-wider mb-0.5">Store Announcement</h3>
          <p className="text-sm sm:text-base font-bold text-gray-600 leading-snug break-words">
            {announcement}
          </p>
        </div>
      </div>
    </div>
  );
}

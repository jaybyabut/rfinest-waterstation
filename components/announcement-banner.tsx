"use client";

import { useState, useEffect } from "react";
import { Megaphone } from "lucide-react";
import { getAnnouncement } from "@/app/actions/getAnnouncement";

export default function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const data = await getAnnouncement();
        if (data) {
           const today = new Date().toISOString().split('T')[0];
           if (data.expires_at >= today) {
              setAnnouncement({ title: data.title || "Announcement", content: data.content });
           } else {
              setAnnouncement(null);
           }
        }
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
      <div className="bg-[#e8eef1] border-2 border-[#43b0f1]/30 rounded-[25px] p-4 flex gap-3 sm:gap-4 shadow-sm items-start sm:items-center w-full overflow-hidden">
        <div className="bg-white p-2 rounded-full shrink-0 text-[#43b0f1] shadow-sm">
          <Megaphone size={24} strokeWidth={2.5} />
        </div>
        <div className="flex-1 min-w-0 w-full">
          {/* MODIFIED: Pinalitan ng break-words para hindi maputol ang salita */}
          <h3 className="text-sm font-black text-[#1e3d58] uppercase tracking-wider mb-0.5 break-words">
            {announcement.title}
          </h3>
          {/* MODIFIED: Idinagdag ang whitespace-pre-wrap para basahin ang line breaks at pinalitan ng break-words */}
          <p className="text-sm sm:text-base font-bold text-gray-600 leading-snug break-words whitespace-pre-wrap">
            {announcement.content}
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Megaphone, Check, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAnnouncement } from "@/app/actions/getAnnouncement";
import { saveAnnouncement } from "@/app/actions/saveAnnouncement";
import { useRouter } from "next/navigation";

export default function ManageAnnouncements() {
  const router = useRouter();
  const [announcementTitle, setAnnouncementTitle] = useState("");
  const [announcementText, setAnnouncementText] = useState("");
  const [isAnnouncementActive, setIsAnnouncementActive] = useState(false);
  const [expirationDate, setExpirationDate] = useState(""); // Stores "YYYY-MM-DD"
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      const data = await getAnnouncement();
      if (data) {
        setAnnouncementTitle(data.title || "");
        setAnnouncementText(data.content || "");
        
        const today = new Date().toISOString().split('T')[0];
        setIsAnnouncementActive(data.expires_at > today || data.expires_at === '2099-12-31');
        setExpirationDate(data.expires_at === '2099-12-31' || data.expires_at <= today ? "" : data.expires_at); 
      }
    };
    fetchAnnouncement();
  }, []);

  const handleSaveAnnouncement = async () => {
    setIsSaving(true);
    
    const result = await saveAnnouncement(
      announcementTitle,
      announcementText, 
      isAnnouncementActive, 
      expirationDate || null
    );

    setIsSaving(false);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/dashboard");
      }, 1500);
    } else {
      console.error(result.error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl relative">

          {/* SUCCESS TOAST */}
          {showSuccess && (
            <div className="absolute -top-12 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="bg-green-100 text-green-700 px-6 py-3 rounded-full shadow-lg border-2 border-green-200 font-bold flex items-center gap-2">
                <Check size={20} strokeWidth={3} /> Saved successfully!
              </div>
            </div>
          )}

          {/* HEADER */}
          <div className="flex items-center justify-center mb-8 relative w-full">
            <Link href="/dashboard" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-14 leading-tight">
              Announce
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left relative w-full overflow-hidden flex flex-col items-center">

            <div className="w-20 h-20 bg-[#43b0f1]/10 text-[#43b0f1] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#43b0f1]/20">
              <Megaphone size={40} strokeWidth={2.5} />
            </div>

            <p className="mb-6 text-gray-500 font-bold text-sm text-center px-2">
              This message will be displayed on the home page of all customers.
            </p>

            <div className="w-full space-y-5">
              
              {/* TITLE INPUT */}
              <div className="w-full">
                <label className="block text-lg font-bold mb-2 ml-2 text-[#1e3d58]">Announcement Title</label>
                <input
                  type="text"
                  value={announcementTitle}
                  onChange={(e) => setAnnouncementTitle(e.target.value)}
                  placeholder="e.g. System Maintenance"
                  className="w-full h-14 px-6 rounded-[25px] border-2 border-[#1e3d58]/10 bg-[#f8fbfd] text-[#1e3d58] font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] focus:border-[#43b0f1] transition-all"
                />
              </div>

              {/* MESSAGE TEXTAREA */}
              <div className="w-full">
                <label className="block text-lg font-bold mb-2 ml-2 text-[#1e3d58]">Announcement Message</label>
                <textarea
                  value={announcementText}
                  onChange={(e) => setAnnouncementText(e.target.value)}
                  placeholder="e.g. Please be advised that we will be closed tomorrow due to maintenance..."
                  className="w-full h-40 p-5 rounded-[25px] border-2 border-[#1e3d58]/10 bg-[#f8fbfd] text-[#1e3d58] font-semibold text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] focus:border-[#43b0f1] resize-none transition-all"
                />
              </div>

              {/* EXPIRATION DATE PICKER - UPDATED TO JUST "DATE" */}
              <div className="w-full">
                <label className="flex items-center gap-2 text-lg font-bold mb-2 ml-2 text-[#1e3d58]">
                  <Calendar size={20} className="text-[#43b0f1]" strokeWidth={2.5} />
                  Auto-Remove On (Optional)
                </label>
                <input
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58]/10 bg-[#f8fbfd] text-[#1e3d58] font-bold text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#43b0f1] focus:border-[#43b0f1] transition-all cursor-pointer"
                />
                <p className="text-xs text-gray-500 font-semibold mt-2 ml-2 leading-snug">
                  If set, the announcement will automatically hide after this date. Leave blank to keep it visible indefinitely.
                </p>
              </div>

              {/* TOGGLE STATUS */}
              <div className="flex items-center justify-between bg-[#e8eef1]/50 p-5 rounded-[25px] border border-gray-200 mt-2">
                <div className="flex flex-col pr-4">
                  <span className="font-black text-[#1e3d58] text-lg">Display Status</span>
                  <span className="text-xs sm:text-sm text-gray-500 font-medium mt-0.5">Turn on to make the banner visible to customers</span>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isAnnouncementActive}
                    onChange={(e) => setIsAnnouncementActive(e.target.checked)}
                  />
                  <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#43b0f1]"></div>
                </label>
              </div>

            </div>

            <div className="w-full pt-8">
              <Button
                onClick={handleSaveAnnouncement}
                disabled={isSaving}
                className="w-full h-16 text-xl font-bold rounded-full bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-md flex items-center justify-center"
              >
                {isSaving ? "Saving..." : "Save & Publish"}
              </Button>
            </div>

          </div>
        </div>
      </div>
      
    </div>
  );
}
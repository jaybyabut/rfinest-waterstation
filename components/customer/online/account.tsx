"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, MapPin, Phone, Lock, LogOut, Eye, EyeOff } from "lucide-react"; // DINAGDAG: Eye, EyeOff
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { useUser } from "@/app/(protected)/(customer)/home/user-provider";
import { updateCustomerName } from "@/app/actions/updateCustomerName";
import { updateCustomerLocation } from "@/app/actions/updateCustomerLocation";
import { updateCustomerPassword } from "@/app/actions/updateCustomerPassword";
import { updateCustomerNumber } from "@/app/actions/updateCustomerNumber";
import { getLocations } from "@/app/actions/locations";
import { createClient } from "@/lib/supabase/client";


export default function CustomerAccount() {
  const router = useRouter();
  const userData = useUser();
  const [view, setView] = useState<"menu" | "name" | "location" | "number" | "password">("menu");

  interface LocationItem { location_id: string; location_name: string; }
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getLocations().then((res) => {
      if (Array.isArray(res)) setLocations(res as LocationItem[]);
    });
  }, []);

  const [firstName, setFirstName] = useState(userData?.first_name || "");
  const [lastName, setLastName] = useState(userData?.last_name || "");
  const [middleInitial, setMiddleInitial] = useState(userData?.middle_initial || "");

  const defaultAddress = userData?.address || "";
  const addressParts = defaultAddress.split(",").map(str => str.trim());
  const defaultHouseNo = addressParts[0] || "";
  const defaultStreetName = addressParts.slice(1).join(", ") || "";

  const defaultZoneId = userData?.location_id || "";
  const defaultZoneName = Array.isArray(userData?.location_pricing)
    ? userData?.location_pricing[0]?.location_name
    : userData?.location_pricing?.location_name || "";

  const [houseNo, setHouseNo] = useState(defaultHouseNo);
  const [streetName, setStreetName] = useState(defaultStreetName);
  const [zoneId, setZoneId] = useState(defaultZoneId);
  const [zoneName, setZoneName] = useState(defaultZoneName);

  const [mobileNo, setMobileNo] = useState(userData?.mobile_no || "");
  const [mobileVerifyPassword, setMobileVerifyPassword] = useState("");
  const [showMobileVerifyPassword, setShowMobileVerifyPassword] = useState(false);

  const [locationVerifyPassword, setLocationVerifyPassword] = useState("");
  const [showLocationVerifyPassword, setShowLocationVerifyPassword] = useState(false);

  const [tempFirstName, setTempFirstName] = useState(firstName);
  const [tempLastName, setTempLastName] = useState(lastName);
  const [tempMI, setTempMI] = useState(middleInitial);

  const [tempHouseNo, setTempHouseNo] = useState(houseNo);
  const [tempStreetName, setTempStreetName] = useState(streetName);
  const [tempZoneId, setTempZoneId] = useState(zoneId);

  const [tempMobileNo, setTempMobileNo] = useState(mobileNo);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // DINAGDAG: States for showing passwords
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (view === "name") {
      const nameRegex = /^[A-Za-z\s]+$/;

      if (!tempFirstName.trim()) newErrors.firstName = "First name is required.";
      else if (!nameRegex.test(tempFirstName)) newErrors.firstName = "Letters and spaces only.";

      if (!tempLastName.trim()) newErrors.lastName = "Last name is required.";
      else if (!nameRegex.test(tempLastName)) newErrors.lastName = "Letters and spaces only.";

      if (tempMI && !/^[A-Za-z\s]*$/.test(tempMI)) newErrors.mi = "Letters only.";
    }

    if (view === "location") {
      const locRegex = /^[A-Za-z0-9\s,\.-]*$/;

      if (!tempHouseNo.trim()) newErrors.houseNo = "House number is required.";
      else if (!locRegex.test(tempHouseNo)) newErrors.houseNo = "Invalid symbols used.";

      if (!tempStreetName.trim()) newErrors.streetName = "Street name is required.";
      else if (!locRegex.test(tempStreetName)) newErrors.streetName = "Invalid symbols used.";

      if (!tempZoneId) newErrors.zoneId = "Please select a zone.";

      if (!locationVerifyPassword) newErrors.locationVerifyPassword = "Current password is required to save changes.";
    }

    if (view === "number") {
      const phoneRegex = /^(09)\d{9}$/;
      if (!tempMobileNo.trim()) newErrors.mobileNo = "Mobile number is required.";
      else if (!phoneRegex.test(tempMobileNo)) newErrors.mobileNo = "Must be an 11-digit number starting with 09.";
      
      if (!mobileVerifyPassword) newErrors.mobileVerifyPassword = "Current password is required to save changes.";
    }

    if (view === "password") {
      if (!oldPassword) newErrors.oldPassword = "Old password is required.";

      if (!newPassword) newErrors.newPassword = "New password is required.";
      else if (newPassword.length < 8) newErrors.newPassword = "Must be at least 8 characters.";

      if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      if (view === "name") {
        const res = await updateCustomerName(tempFirstName, tempMI, tempLastName);
        if (res.success) {
          setFirstName(tempFirstName);
          setLastName(tempLastName);
          setMiddleInitial(tempMI);
          router.refresh();
          setView("menu");
        } else {
          setErrors({ submit: res.error || "Failed to update name" });
        }
      }

      if (view === "location") {
        const fullAddress = `${tempHouseNo}, ${tempStreetName}`;
        const res = await updateCustomerLocation(fullAddress, tempZoneId, locationVerifyPassword);
        if (res.success) {
          setHouseNo(tempHouseNo);
          setStreetName(tempStreetName);
          setZoneId(tempZoneId);
          const chosenLoc = locations.find(l => l.location_id === tempZoneId);
          if (chosenLoc) setZoneName(chosenLoc.location_name);
          router.refresh();
          setView("menu");
        } else {
          setErrors({ submit: res.error || "Failed to update location" });
        }
      }

      if (view === "number") {
        const res = await updateCustomerNumber(tempMobileNo, mobileVerifyPassword);
        if (res.success) {
          setMobileNo(tempMobileNo);
          setMobileVerifyPassword("");
          router.refresh();
          setView("menu");
        } else {
          setErrors({ submit: res.error || "Failed to update mobile number" });
        }
      }

      if (view === "password") {
        const res = await updateCustomerPassword(oldPassword, newPassword);
        if (res.success) {
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setView("menu");
        } else {
          setErrors({ submit: res.error || "Failed to update password" });
        }
      }

    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsLogoutModalOpen(false);
    router.push("/auth/login");
  };

  const resetTempStates = () => {
    setTempFirstName(firstName);
    setTempLastName(lastName);
    setTempMI(middleInitial);
    setTempHouseNo(houseNo);
    setTempStreetName(streetName);
    setTempZoneId(zoneId);
    setTempMobileNo(mobileNo);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setMobileVerifyPassword("");
    setLocationVerifyPassword("");
    // DINAGDAG: Reset show password toggles pag nag-back
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setShowMobileVerifyPassword(false);
    setShowLocationVerifyPassword(false);
    setErrors({});
  };

  const handleBack = () => {
    resetTempStates();
    setView("menu");
  };

  const fullName = [firstName, middleInitial ? middleInitial + '.' : '', lastName].filter(Boolean).join(" ");
  const fullAddress = [houseNo, streetName, zoneName].filter(Boolean).join(", ");

  if (view === "menu") {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-10 relative overflow-x-hidden">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">

            <div className="flex items-center justify-center mb-8 relative w-full px-2">
              <Link href="/home" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
                <ChevronLeft size={44} strokeWidth={3} />
              </Link>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 break-words leading-tight">
                Account
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-4 w-full overflow-hidden">

              <h2 className="text-[#1e3d58] font-black text-2xl tracking-tight ml-2 mb-2">Profile Details</h2>

              <button onClick={() => setView("name")} className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#43b0f1] shadow-sm shrink-0"><User size={24} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Name</p>
                    <p className="text-lg font-black text-[#1e3d58] truncate">{fullName}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 shrink-0" />
              </button>

              <button onClick={() => setView("location")} className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#43b0f1] shadow-sm shrink-0"><MapPin size={24} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Location</p>
                    <p className="text-sm font-black text-[#1e3d58] line-clamp-2 leading-tight">{fullAddress}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 shrink-0" />
              </button>

              <button onClick={() => setView("number")} className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#43b0f1] shadow-sm shrink-0"><Phone size={24} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Mobile Number</p>
                    <p className="text-lg font-black text-[#1e3d58] truncate">{mobileNo}</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 shrink-0" />
              </button>

              <div className="border-t-2 border-dashed border-gray-200 my-5"></div>

              <h2 className="text-[#1e3d58] font-black text-2xl tracking-tight ml-2 mb-2">Security</h2>

              <button onClick={() => setView("password")} className="w-full flex items-center justify-between p-4 rounded-3xl bg-[#e8eef1]/60 hover:bg-[#e8eef1] transition-colors border-2 border-transparent hover:border-[#43b0f1]/30 shadow-sm gap-3">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#43b0f1] shadow-sm shrink-0"><Lock size={24} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-0.5">Password</p>
                    <p className="text-xl font-black text-[#1e3d58] tracking-widest leading-none translate-y-1 truncate">••••••••</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-gray-400 shrink-0" />
              </button>

              <button onClick={() => setIsLogoutModalOpen(true)} className="w-full flex items-center justify-between p-4 rounded-3xl bg-red-50 hover:bg-red-100 transition-colors border-2 border-transparent hover:border-red-200 shadow-sm gap-3 mt-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-500 shadow-sm shrink-0"><LogOut size={24} /></div>
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-lg font-black text-red-600 truncate">Log Out</p>
                  </div>
                </div>
                <ChevronRight size={24} className="text-red-400 shrink-0" />
              </button>

            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleLogout}
          title="Log Out"
          message="Are you sure you want to log out of your account?"
          confirmText="Yes, Log Out"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in slide-in-from-right-8 duration-300 mb-10 relative overflow-x-hidden">
      <div className="w-full max-w-md mx-auto">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">

          <div className="flex items-center justify-center mb-8 relative w-full px-2">
            <button onClick={handleBack} className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
              <ChevronLeft size={44} strokeWidth={3} />
            </button>
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tighter text-center px-10 capitalize leading-tight break-words w-full">
              Change {view === 'number' ? 'Number' : view}
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 text-left space-y-5 w-full overflow-hidden">

            {errors.submit && (
              <div className="bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm break-words">
                {errors.submit}
              </div>
            )}

            {view === "name" && (
              <div className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">First Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. Juan"
                      value={tempFirstName}
                      onChange={(e) => setTempFirstName(e.target.value)}
                      className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.firstName ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.firstName}</p>}
                  </div>
                  <div className="w-full sm:w-24 shrink-0">
                    <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">M.I.:</label>
                    <input
                      type="text"
                      maxLength={1}
                      placeholder="A"
                      value={tempMI}
                      onChange={(e) => setTempMI(e.target.value)}
                      className={`w-full h-14 px-4 text-center rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.mi ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    {errors.mi && <p className="text-red-500 text-xs font-bold mt-1 text-center break-words">{errors.mi}</p>}
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">Last Name:</label>
                  <input
                    type="text"
                    placeholder="e.g. Dela Cruz"
                    value={tempLastName}
                    onChange={(e) => setTempLastName(e.target.value)}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.lastName ? 'border-red-500' : 'border-[#1e3d58]'}`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.lastName}</p>}
                </div>
              </div>
            )}

            {view === "location" && (
              <div className="space-y-4 w-full">
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <div className="flex-1 min-w-0">
                    <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">House No.:</label>
                    <input
                      type="text"
                      placeholder="e.g. Blk 1 Lot 8"
                      value={tempHouseNo}
                      onChange={(e) => setTempHouseNo(e.target.value)}
                      className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.houseNo ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    {errors.houseNo && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.houseNo}</p>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">Street Name:</label>
                    <input
                      type="text"
                      placeholder="e.g. San Juan St."
                      value={tempStreetName}
                      onChange={(e) => setTempStreetName(e.target.value)}
                      className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.streetName ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    {errors.streetName && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.streetName}</p>}
                  </div>
                </div>
                <div className="w-full">
                  <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">Zone:</label>
                  <div className="relative w-full">
                    <select
                      value={tempZoneId}
                      onChange={(e) => setTempZoneId(e.target.value)}
                      className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer min-w-0 pr-10 ${errors.zoneId ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    >
                      <option value="" disabled>Select a valid zone</option>
                      {locations.map((loc) => (
                        <option key={loc.location_id} value={loc.location_id}>{loc.location_name}</option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none">
                      <svg className="w-6 h-6 text-[#1e3d58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                  </div>
                  {errors.zoneId && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.zoneId}</p>}
                </div>

                <div className="w-full">
                  <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Current Password:</label>
                  <div className="relative w-full">
                    <input
                      type={showLocationVerifyPassword ? "text" : "password"}
                      placeholder="Enter password to verify"
                      value={locationVerifyPassword}
                      onChange={(e) => setLocationVerifyPassword(e.target.value)}
                      className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.locationVerifyPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowLocationVerifyPassword(!showLocationVerifyPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    >
                      {showLocationVerifyPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                    </button>
                  </div>
                  {errors.locationVerifyPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.locationVerifyPassword}</p>}
                </div>
              </div>
            )}

            {view === "number" && (
              <div className="space-y-4 w-full">
                <div className="w-full">
                  <label className="block text-lg font-bold mb-2 ml-2 text-[#1e3d58]">New Mobile Number:</label>
                  <input
                    type="tel"
                    placeholder="09XXXXXXXXX"
                    value={tempMobileNo}
                    onChange={(e) => setTempMobileNo(e.target.value)}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal min-w-0 ${errors.mobileNo ? 'border-red-500' : 'border-[#1e3d58]'}`}
                  />
                  {errors.mobileNo && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.mobileNo}</p>}
                </div>

                <div className="w-full">
                  <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Current Password:</label>
                  <div className="relative w-full">
                    <input
                      type={showMobileVerifyPassword ? "text" : "password"}
                      placeholder="Enter password to verify"
                      value={mobileVerifyPassword}
                      onChange={(e) => setMobileVerifyPassword(e.target.value)}
                      className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.mobileVerifyPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowMobileVerifyPassword(!showMobileVerifyPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    >
                      {showMobileVerifyPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                    </button>
                  </div>
                  {errors.mobileVerifyPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.mobileVerifyPassword}</p>}
                </div>
              </div>
            )}

            {view === "password" && (
              <div className="space-y-4 w-full">
                
                {/* OLD PASSWORD */}
                <div className="w-full">
                  <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Old Password:</label>
                  <div className="relative w-full">
                    <input
                      type={showOldPassword ? "text" : "password"}
                      placeholder="Enter current password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.oldPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    >
                      {showOldPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                    </button>
                  </div>
                  {errors.oldPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.oldPassword}</p>}
                </div>

                {/* NEW PASSWORD */}
                <div className="w-full">
                  <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">New Password:</label>
                  <div className="relative w-full">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Min. 8 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.newPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    >
                      {showNewPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.newPassword}</p>}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="w-full">
                  <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Confirm Password:</label>
                  <div className="relative w-full">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.confirmPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    >
                      {showConfirmPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.confirmPassword}</p>}
                </div>

              </div>
            )}

            <div className="pt-6 w-full">
              <Button
                onClick={() => {
                  if (validateForm()) {
                    setIsModalOpen(true);
                  }
                }}
                className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg"
              >
                Save
              </Button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        onConfirm={handleSaveChanges}
        title={`Update ${view === 'number' ? 'mobile number' : view}?`}
        message={isSaving ? "Saving changes..." : `Are you sure you want to save your new ${view === 'number' ? 'mobile number' : view}?`}
        confirmText={isSaving ? "Saving..." : "Yes, Save"}
      />

    </div>
  );
}
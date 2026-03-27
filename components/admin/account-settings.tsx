"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { createClient } from "@/lib/supabase/client";

export default function AdminAccount() {
  const router = useRouter();
  const [view, setView] = useState<"menu" | "password">("menu");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!oldPassword) newErrors.oldPassword = "Old password is required.";
    if (!newPassword) newErrors.newPassword = "New password is required.";
    else if (newPassword.length < 8) newErrors.newPassword = "Must be at least 8 characters.";
    if (newPassword !== confirmPassword) newErrors.confirmPassword = "Passwords do not match.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // FULLY FUNCTIONAL BACKEND LOGIC PARA SA SUPABASE
  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrors({});
    const supabase = createClient();

    try {
      // 1. Kunin ang current user para makuha ang email niya
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user?.email) throw new Error("Session expired. Please log in again.");

      // 2. I-verify ang Old Password sa pamamagitan ng pag-sign in ulit (Security measure)
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPassword,
      });

      if (signInError) {
        throw new Error("Incorrect old password.");
      }

      // 3. Kung tama ang old password, i-update na sa New Password
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      
      if (updateError) {
        throw new Error(updateError.message);
      }

      // 4. Reset states kapag successful!
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setView("menu");

    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to update password." });
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
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleBack = () => {
    resetTempStates();
    setView("menu");
  };

  if (view === "menu") {
    return (
      <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-10 relative overflow-x-hidden">
        <div className="w-full max-w-md mx-auto">
          <div className="w-full bg-[#e8eef1] rounded-[50px] p-4 sm:p-5 pt-10 text-center border-2 border-white/50 shadow-xl relative">

            <div className="flex items-center justify-center mb-8 relative w-full px-2">
              <Link href="/dashboard" className="absolute left-0 text-black hover:scale-110 transition-transform z-10">
                <ChevronLeft size={44} strokeWidth={3} />
              </Link>
              <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-10 break-words leading-tight">
                Account
              </h1>
            </div>

            <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left space-y-4 w-full overflow-hidden">

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
          message="Are you sure you want to log out of your admin account?"
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
              Update Password
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-5 sm:p-8 shadow-inner border border-gray-100 text-left space-y-5 w-full overflow-hidden">

            {errors.submit && (
              <div className="bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm break-words">
                {errors.submit}
              </div>
            )}

            <div className="space-y-4 w-full">
              
              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Old Password:</label>
                <div className="relative w-full">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-all min-w-0 ${errors.oldPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
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

              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">New Password:</label>
                <div className="relative w-full">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-all min-w-0 ${errors.newPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
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

              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Confirm Password:</label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-all min-w-0 ${errors.confirmPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
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

            <div className="pt-6 w-full">
              <Button
                onClick={() => {
                  if (validateForm()) {
                    setIsModalOpen(true);
                  }
                }}
                disabled={isSaving}
                className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 shadow-lg"
              >
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>

          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        onConfirm={handleSaveChanges}
        title="Update Password?"
        message={isSaving ? "Updating your password..." : "Are you sure you want to change your password?"}
        confirmText={isSaving ? "Saving..." : "Yes, Update"}
      />

    </div>
  );
}

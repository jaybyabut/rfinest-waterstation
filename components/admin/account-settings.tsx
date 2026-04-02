"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock, LogOut, Eye, EyeOff, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { createClient } from "@/lib/supabase/client";
import { updatePassword as updatePasswordAction } from "@/app/actions/updatePassword";

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
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const isLengthValid = newPassword.length >= 8;
  const isUpperValid = /[A-Z]/.test(newPassword);
  const isLowerValid = /[a-z]/.test(newPassword);
  const isNumberValid = /[0-9]/.test(newPassword);
  
  const isPasswordStrong = isLengthValid && isUpperValid && isLowerValid && isNumberValid;
  
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!oldPassword) newErrors.oldPassword = "Old password is required.";
    
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (!isPasswordStrong) {
      newErrors.newPassword = "Please complete all password requirements.";
    }
    
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    setErrors({});

    try {
      const res = await updatePasswordAction(oldPassword, newPassword);

      if (res.success) {
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setIsSuccessModalOpen(true);
      } else {
        setErrors({ submit: res.error || "Failed to update password" });
      }
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to save changes." });
    } finally {
      setIsSaving(false);
      setIsModalOpen(false);
    }
  };

  const handleSuccessClose = () => {
    setIsSuccessModalOpen(false);
    setView("menu");
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

              <h2 className="text-[#1e3d58] font-black text-2xl tracking-tight ml-2 mb-2">Security & Access</h2>

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
                    placeholder="Enter current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.oldPassword ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]'}`}
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
                <div className="relative w-full mb-3">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="e.g. Abcd@1234"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.newPassword ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                  >
                    {showNewPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
                
                {newPassword.length > 0 && (
                  <div className="pl-2 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${isLengthValid ? 'text-green-600' : 'text-gray-400'}`}>
                      {isLengthValid ? <Check size={18} strokeWidth={4} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${isUpperValid ? 'text-green-600' : 'text-gray-400'}`}>
                      {isUpperValid ? <Check size={18} strokeWidth={4} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5" />}
                      One uppercase letter (A-Z)
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${isLowerValid ? 'text-green-600' : 'text-gray-400'}`}>
                      {isLowerValid ? <Check size={18} strokeWidth={4} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5" />}
                      One lowercase letter (a-z)
                    </div>
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${isNumberValid ? 'text-green-600' : 'text-gray-400'}`}>
                      {isNumberValid ? <Check size={18} strokeWidth={4} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300 ml-0.5" />}
                      One number (0-9)
                    </div>
                  </div>
                )}
                {errors.newPassword && <p className="text-red-500 text-xs sm:text-sm font-bold mt-2 ml-2 break-words leading-snug">{errors.newPassword}</p>}
              </div>

              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]">Confirm Password:</label>
                <div className="relative w-full">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.confirmPassword ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
                
                {confirmPassword.length > 0 && (
                  <div className="pl-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordsMatch ? <Check size={18} strokeWidth={4} /> : <X size={18} strokeWidth={4} />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </div>
                  </div>
                )}
                {errors.confirmPassword && !confirmPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.confirmPassword}</p>}
              </div>

            </div>

            <div className="pt-6 w-full">
              <Button
                onClick={() => {
                  if (validateForm()) {
                    setIsModalOpen(true);
                  }
                }}
                disabled={isSaving || (confirmPassword.length > 0 && !passwordsMatch)}
                className="w-full h-16 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-50 shadow-lg"
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
        title="Update Password?"
        message={isSaving ? "Saving changes..." : "Are you sure you want to save your new password?"}
        confirmText={isSaving ? "Saving..." : "Yes, Save"}
      />

      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl">
            <div className="bg-white rounded-[30px] p-8 text-center border border-gray-100 flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Check size={40} strokeWidth={4} />
              </div>
              <h2 className="text-3xl font-black text-[#1e3d58] mb-3 tracking-tight">Success!</h2>
              <p className="mb-8 text-gray-500 font-bold text-base leading-snug">
                Your password has been successfully updated.
              </p>
              <Button 
                onClick={handleSuccessClose} 
                className="w-full h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-md active:scale-95"
              >
                Continue
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

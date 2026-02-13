"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function RegisterPage() {
  const [mobileNumber, setMobileNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-10 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-md bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">Register</h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-[#1e3d58] tracking-tight mb-3">Help Us Reach You</h2>
              <p className="text-sm text-[#1e3d58] leading-relaxed">Please ensure all details are accurate. We use this information to coordinate riders and delivery routes.</p>
            </div>

            <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Mobile Number:</label>
                <input
                  type="text"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Full name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Delivery Location:</label>
                <textarea
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full h-28 p-4 px-6 rounded-[30px] border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] resize-none"
                />
              </div>

              <div className="pt-4">
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Create Password:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Confirm Password:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>

              <div className="flex items-start gap-3 px-2 pt-4">
                <input 
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="w-6 h-6 mt-1 rounded border-2 border-[#1e3d58] accent-[#43b0f1] cursor-pointer shrink-0" 
                />
                <span className="text-base font-medium text-[#1e3d58] leading-tight">I hereby confirm that all the details above are correct and valid for delivery.</span>
              </div>

              <div className="pt-8 flex justify-center">
                <Button type="submit" className="w-2/3 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] transition-all active:scale-95">
                  Register
                </Button>
              </div>

              <div className="text-center pt-4 pb-2">
                <span className="text-[#1e3d58] text-lg">Already have an account? </span>
                <Link href="/auth/login" className="text-[#43b0f1] font-bold text-lg hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

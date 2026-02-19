<<<<<<< HEAD
"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
=======
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import ForgotPasswordForm from "@/components/forgot-password-form";
>>>>>>> 95f8ca87f23649e6f12b864762860517e6a46861

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
<<<<<<< HEAD
      
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-md bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
          <h1 className="text-5xl sm:text-6xl font-black mb-8 text-black tracking-tighter">
            Recovery
          </h1>

          <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-[#1e3d58] tracking-tight mb-2">
                Forgot Password?
              </h2>
              <p className="text-sm text-[#1e3d58]">
                Enter your registered email address and we'll send you a link to reset your password.
              </p>
            </div>

            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-2 ml-2">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                  required
                />
              </div>

              <div className="pt-6 flex justify-center">
                <Button 
                  type="submit"
                  className="w-full sm:w-5/6 h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95"
                >
                  Send Reset Link
                </Button>
              </div>

              <div className="text-center pt-6 pb-2">
                <span className="text-[#1e3d58] text-lg">Remember your password? </span>
                <Link href="/auth/login" className="text-[#43b0f1] font-bold text-lg hover:underline">
                  Log in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>

=======
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
        <ForgotPasswordForm />
      </div>
>>>>>>> 95f8ca87f23649e6f12b864762860517e6a46861
      <Footer />
    </main>
  );
}

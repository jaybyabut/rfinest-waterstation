"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`, 
      });
      if (error) throw error;
      setSuccess(true); 
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="w-full max-w-md mx-auto bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
        <h1 className="text-5xl sm:text-6xl font-black mb-8 text-black tracking-tighter">
          Recovery
        </h1>

        <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
          
          {success ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              </div>
              <h2 className="text-2xl font-black text-[#1e3d58] tracking-tight mb-4">
                Check Your Email
              </h2>
              <p className="text-md text-[#1e3d58] mb-8 leading-relaxed">
                If you registered using your email and password, you will receive a password reset email shortly.
              </p>
              <Link href="/auth/login">
                <Button className="w-full h-14 text-xl font-bold rounded-full bg-[#1e3d58] text-white border-2 border-[#1e3d58] hover:bg-[#43b0f1] hover:border-[#43b0f1] transition-all">
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-[#1e3d58] tracking-tight mb-2">
                  Forgot Password?
                </h2>
                <p className="text-sm text-[#1e3d58]">
                  Type in your email and we&apos;ll send you a link to reset your password.
                </p>
              </div>

              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xl font-bold text-[#1e3d58] mb-2 ml-2">
                    Email Address:
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                  />
                </div>

                {error && (
                  <p className="text-sm font-bold text-red-500 px-2 text-center">
                    {error}
                  </p>
                )}

                <div className="pt-6 flex justify-center">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full sm:w-5/6 h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </Button>
                </div>

                <div className="text-center pt-6 pb-2">
                  <span className="text-[#1e3d58] text-lg">Remember your password? </span>
                  <Link 
                    href="/auth/login" 
                    className="text-[#43b0f1] font-bold text-lg hover:underline"
                  >
                    Log in
                  </Link>
                </div>
              </form>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

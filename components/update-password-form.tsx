"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Check, X as XIcon } from "lucide-react";
import { getPasswordChecks, validatePasswordStrength } from "@/lib/validatePassword";

export default function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  
  // DINAGDAG: States for showing passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const pwError = validatePasswordStrength(password);
    if (pwError) {
      setError(pwError);
      setIsLoading(false);
      return;
    }

    const supabase = createClient();

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="w-full max-w-md mx-auto bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
        <h1 className="text-5xl font-black mb-8 text-black tracking-tighter">
          New Password
        </h1>

        <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
          <div className="text-center mb-6">
            <p className="text-sm text-[#1e3d58]">
              Please enter your new password below.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleUpdatePassword}>
            {/* NEW PASSWORD FIELD */}
            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-2 ml-2">
                New Password:
              </label>
              <div className="relative w-full">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-14 pl-6 pr-14 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={24} strokeWidth={2.5} />
                  ) : (
                    <Eye size={24} strokeWidth={2.5} />
                  )}
                </button>
              </div>
              
              {/* Password Strength Checklist */}
              {password.length > 0 && (
                <div className="mt-3 ml-2 space-y-1">
                  {getPasswordChecks(password).map((check) => (
                    <div key={check.label} className="flex items-center gap-2">
                      {check.pass ? (
                        <Check size={14} className="text-green-500 shrink-0" strokeWidth={3} />
                      ) : (
                        <XIcon size={14} className="text-red-400 shrink-0" strokeWidth={3} />
                      )}
                      <span className={`text-xs font-bold ${check.pass ? 'text-green-600' : 'text-gray-400'}`}>
                        {check.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-2 ml-2">
                Confirm Password:
              </label>
              <div className="relative w-full">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-14 pl-6 pr-14 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                  title={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={24} strokeWidth={2.5} />
                  ) : (
                    <Eye size={24} strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 px-2 text-center">
                {error}
              </p>
            )}

            <div className="pt-4 flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleInitial, setMiddleInitial] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [streetName, setStreetName] = useState("");
  const [barangay, setBarangay] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const barangays = [
    "Bulaon", "Calulut", "Maimpis", "Mexico", "Montana",
    "Lakeshore", "Golden Haven", "Hauslands", "Royal Residences", "Malpitic",
  ];

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }
    if (!barangay) {
      setError("Please select a barangay");
      setIsLoading(false);
      return;
    }
    if (!isConfirmed) {
      setError("Please confirm your details first.");
      setIsLoading(false);
      return;
    }

    const address = `${houseNo}, ${streetName}`;
    const location_id = barangays.indexOf(barangay) + 1;

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`, 
          data: {
            mobile_no: mobileNo,
            first_name: firstName,
            last_name: lastName,
            middle_initial: middleInitial,
            address: address,
            location_id: location_id,
          },
        },
      });
      if (error) throw error;
      
      router.push("/auth/sign-up-success"); 
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="w-full max-w-lg mx-auto bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
        <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">
          Register
        </h1>

        <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
          <div className="mb-8">
            <h2 className="text-3xl font-black text-[#1e3d58] tracking-tight mb-3">
              Help Us Reach You
            </h2>
            <p className="text-sm text-[#1e3d58] leading-relaxed">
              Please ensure all details are accurate. We use this information to coordinate riders and delivery routes.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSignUp}>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">First Name:</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>
              <div className="w-24">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">M.I.:</label>
                <input
                  type="text"
                  maxLength={1}
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className="w-full h-14 px-4 text-center rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Last Name:</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Mobile Number:</label>
              <input
                type="text"
                required
                placeholder="09..."
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Email Address:</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            <div className="flex gap-3">
              <div className="w-1/3">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">House No.:</label>
                <input
                  type="text"
                  required
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className="w-full h-14 px-4 text-center rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">Street Name:</label>
                <input
                  type="text"
                  required
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Barangay:</label>
            
              <div className="relative">
                <select
                  required
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select Barangay</option>
                  {barangays.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              
                <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none">
                  <svg className="w-5 h-5 text-[#1e3d58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Create Password:</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Confirm Password:</label>
              <input
                type="password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 text-center px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                ⚠️ {error}
              </p>
            )}

            <div className="flex items-start gap-3 px-2 pt-2">
              <input 
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => setIsConfirmed(e.target.checked)}
                className="w-6 h-6 mt-1 rounded border-2 border-[#1e3d58] accent-[#43b0f1] cursor-pointer shrink-0" 
              />
              <span className="text-base font-medium text-[#1e3d58] leading-tight">
                I hereby confirm that all the details above are correct and valid for delivery.
              </span>
            </div>

            <div className="pt-6 flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-2/3 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing up..." : "Register"}
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
  );
}

"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react"; // DINAGDAG: Import icons

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
  
  // DINAGDAG: States for showing passwords
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const barangays = [
    "Bulaon", "Calulut", "Maimpis", "Mexico", "Montana",
    "Lakeshore", "Golden Haven", "Hauslands", "Royal Residences", "Malpitic",
  ];

  const validateForm = () => {
    let newErrors: Record<string, string> = {};

    const nameRegex = /^[A-Za-z\s]+$/;
    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    else if (!nameRegex.test(firstName)) newErrors.firstName = "Letters and spaces only.";

    if (!lastName.trim()) newErrors.lastName = "Last name is required.";
    else if (!nameRegex.test(lastName)) newErrors.lastName = "Letters and spaces only.";

    if (middleInitial && !/^[A-Za-z\s]*$/.test(middleInitial)) newErrors.middleInitial = "Letters only.";

    const phoneRegex = /^(09)\d{9}$/;
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile number is required.";
    else if (!phoneRegex.test(mobileNo)) newErrors.mobileNo = "Must be an 11-digit number starting with 09.";

    if (!email.trim()) newErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email format.";

    const locRegex = /^[A-Za-z0-9\s,\.-]*$/;
    if (!houseNo.trim()) newErrors.houseNo = "House number is required.";
    else if (!locRegex.test(houseNo)) newErrors.houseNo = "Invalid symbols used.";

    if (!streetName.trim()) newErrors.streetName = "Street name is required.";
    else if (!locRegex.test(streetName)) newErrors.streetName = "Invalid symbols used.";

    if (!barangay) newErrors.barangay = "Please select a barangay.";

    if (!password) newErrors.password = "Password is required.";
    else if (password.length < 8) newErrors.password = "Must be at least 8 characters.";

    if (password !== repeatPassword) newErrors.repeatPassword = "Passwords do not match.";

    if (!isConfirmed) newErrors.isConfirmed = "Please confirm your details first.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    if (!validateForm()) {
      return; 
    }

    setIsLoading(true);
    const supabase = createClient();

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
      setGlobalError(error instanceof Error ? error.message : "An error occurred");
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

          <form className="space-y-5" onSubmit={handleSignUp} noValidate>

            <div className="flex gap-3">
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">First Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Juan"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.firstName ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.firstName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.firstName}</p>}
              </div>
              <div className="w-24">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">M.I.:</label>
                <input
                  type="text"
                  maxLength={1}
                  placeholder="A"
                  value={middleInitial}
                  onChange={(e) => setMiddleInitial(e.target.value)}
                  className={`w-full h-14 px-4 text-center rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.middleInitial ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.middleInitial && <p className="text-red-500 text-xs font-bold mt-1 text-center">{errors.middleInitial}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Last Name:</label>
              <input
                type="text"
                placeholder="e.g. Dela Cruz"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.lastName ? 'border-red-500' : 'border-[#1e3d58]'}`}
              />
              {errors.lastName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.lastName}</p>}
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Mobile Number:</label>
              <input
                type="tel"
                placeholder="09XXXXXXXXX"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.mobileNo ? 'border-red-500' : 'border-[#1e3d58]'}`}
              />
              {errors.mobileNo && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.mobileNo}</p>}
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Email Address:</label>
              <input
                type="email"
                placeholder="e.g. sample@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.email ? 'border-red-500' : 'border-[#1e3d58]'}`}
              />
              {errors.email && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.email}</p>}
            </div>

            <div className="flex gap-3">
              <div className="w-1/3">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">House No.:</label>
                <input
                  type="text"
                  placeholder="e.g. Blk 1"
                  value={houseNo}
                  onChange={(e) => setHouseNo(e.target.value)}
                  className={`w-full h-14 px-4 text-center rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.houseNo ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.houseNo && <p className="text-red-500 text-xs font-bold mt-1 ml-2">{errors.houseNo}</p>}
              </div>
              <div className="flex-1">
                <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2">Street Name:</label>
                <input
                  type="text"
                  placeholder="e.g. San Juan St."
                  value={streetName}
                  onChange={(e) => setStreetName(e.target.value)}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.streetName ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                {errors.streetName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.streetName}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Barangay:</label>
              <div className="relative">
                <select
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer ${errors.barangay ? 'border-red-500' : 'border-[#1e3d58]'}`}
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
              {errors.barangay && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.barangay}</p>}
            </div>

            {/* FIRST PASSWORD INPUT */}
            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Create Password:</label>
              <div className="relative w-full">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all ${errors.password ? 'border-red-500' : 'border-[#1e3d58]'}`}
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
              {errors.password && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.password}</p>}
            </div>

            {/* SECOND PASSWORD INPUT (REPEAT) */}
            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2">Confirm Password:</label>
              <div className="relative w-full">
                <input
                  type={showRepeatPassword ? "text" : "password"}
                  placeholder="Re-enter password"
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all ${errors.repeatPassword ? 'border-red-500' : 'border-[#1e3d58]'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                  title={showRepeatPassword ? "Hide password" : "Show password"}
                >
                  {showRepeatPassword ? (
                    <EyeOff size={24} strokeWidth={2.5} />
                  ) : (
                    <Eye size={24} strokeWidth={2.5} />
                  )}
                </button>
              </div>
              {errors.repeatPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.repeatPassword}</p>}
            </div>

            {/* TODO: BACKEND - Review error handling for Supabase auth exceptions here */}
            {globalError && (
              <p className="text-sm font-bold text-red-500 text-center px-4 py-3 bg-red-50 rounded-xl border border-red-200">
                ⚠️ {globalError}
              </p>
            )}

            <div className="flex flex-col gap-1 px-2 pt-2">
              <div className="flex items-start gap-3">
                <input 
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className={`w-6 h-6 mt-1 rounded border-2 accent-[#43b0f1] cursor-pointer shrink-0 ${errors.isConfirmed ? 'border-red-500' : 'border-[#1e3d58]'}`} 
                />
                <span className="text-base font-medium text-[#1e3d58] leading-tight">
                  I hereby confirm that all the details above are correct and valid for delivery.
                </span>
              </div>
              {errors.isConfirmed && <p className="text-red-500 text-sm font-bold ml-9">{errors.isConfirmed}</p>}
            </div>

            <div className="pt-6 flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-2/3 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
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

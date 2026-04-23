"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Check, X as XIcon, User, MapPin, Lock, ArrowUp } from "lucide-react"; 

import { getLocations } from "@/app/actions/locations";
interface Location {
  location_id: number;
  location_name: string;
  location_price: number;
}

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
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState(""); 
  
  const [isConfirmed, setIsConfirmed] = useState(false); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [globalError, setGlobalError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const isLengthValid = password.length >= 8;
  const isUpperValid = /[A-Z]/.test(password);
  const isLowerValid = /[a-z]/.test(password);
  const isNumberValid = /[0-9]/.test(password);
  
  const isPasswordStrong = isLengthValid && isUpperValid && isLowerValid && isNumberValid;
  const passwordsMatch = password.length > 0 && password === repeatPassword;

  useEffect(() => {
    const fetchLocations = async () => {
      const data = await getLocations();
      if (Array.isArray(data)) {
        setLocations(data);
      } else {
        console.error("Failed to fetch locations:", data);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required.";
    if (!lastName.trim()) newErrors.lastName = "Last name is required.";

    const phoneRegex = /^(09)\d{9}$/;
    if (!mobileNo.trim()) newErrors.mobileNo = "Mobile number is required.";
    else if (!phoneRegex.test(mobileNo)) newErrors.mobileNo = "Must start with 09 and be 11 digits.";

    if (!email.trim()) newErrors.email = "Email address is required.";
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email format.";

    if (!streetName.trim()) newErrors.streetName = "Street name is required.";
    if (!barangay.trim()) newErrors.barangay = "Barangay is required.";
    if (!selectedZoneId) newErrors.zone = "Please select a delivery zone.";

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (!isPasswordStrong) {
      newErrors.password = "Please complete all password requirements.";
    }

    if (password !== repeatPassword) {
      newErrors.repeatPassword = "Passwords do not match.";
    }

    if (!isConfirmed) newErrors.isConfirmed = "Please confirm your details first.";

    setErrors(newErrors);
    return newErrors; 
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setErrors({});

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      const firstErrorField = Object.keys(validationErrors)[0];
      const errorElement = document.getElementById(firstErrorField);
      
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
        errorElement.focus();
      }
      return; 
    }

    setIsLoading(true);
    const supabase = createClient();

    const address = [houseNo.trim(), streetName.trim(), barangay.trim()].filter(Boolean).join(", ");
    
    // Convert string ID back to number for database
    const location_id = Number(selectedZoneId);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
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
    <div className={cn("flex flex-col gap-6 relative", className)} {...props}>
      <div className="w-full max-w-md mx-auto bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
        <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">
          Register
        </h1>

        <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-black text-[#1e3d58] tracking-tight mb-3">
              Help Us Reach You
            </h2>
            <p className="text-sm text-[#1e3d58] leading-relaxed">
              Please ensure all details are accurate. We use this information to coordinate riders and delivery routes.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSignUp} noValidate>

            <div className="space-y-5">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2 mb-2">
                <User className="text-[#43b0f1] w-5 h-5" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-[#43b0f1] tracking-widest uppercase">Personal Info</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-3">
                <div className="flex-1 min-w-0">
                  <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="firstName">First Name:</label>
                  <input
                    id="firstName" 
                    type="text"
                    placeholder="e.g. Juan"
                    value={firstName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                      setFirstName(val);
                      if (val.trim()) clearError("firstName"); 
                    }}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.firstName ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.firstName}</p>}
                </div>
                <div className="w-full sm:w-24 shrink-0">
                  <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="middleInitial">M.I.:</label>
                  <input
                    id="middleInitial"
                    type="text"
                    maxLength={1}
                    placeholder="A"
                    value={middleInitial}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z]/g, '');
                      setMiddleInitial(val);
                      clearError("middleInitial"); 
                    }}
                    className={`w-full h-14 px-4 text-center rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.middleInitial ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  />
                  {errors.middleInitial && <p className="text-red-500 text-xs font-bold mt-1 text-center">{errors.middleInitial}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="lastName">Last Name:</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="e.g. Dela Cruz"
                  value={lastName}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z\s]/g, '');
                    setLastName(val);
                    if (val.trim()) clearError("lastName"); 
                  }}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.lastName ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                />
                {errors.lastName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.lastName}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="mobileNo">Mobile Number:</label>
                <input
                  id="mobileNo"
                  type="tel"
                  placeholder="09XXXXXXXXX"
                  value={mobileNo}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                    setMobileNo(val);
                    if (/^(09)\d{9}$/.test(val)) clearError("mobileNo"); 
                  }}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.mobileNo ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                />
                {errors.mobileNo && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.mobileNo}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="email">Email Address:</label>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. sample@email.com"
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);
                    if (/^\S+@\S+\.\S+$/.test(val)) clearError("email"); 
                  }}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.email ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                />
                {errors.email && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.email}</p>}
              </div>
            </div>

            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2 mb-2">
                <MapPin className="text-[#43b0f1] w-5 h-5" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-[#43b0f1] tracking-widest uppercase">Delivery Address</h3>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 sm:gap-3">
                <div className="w-full sm:w-1/3 shrink-0">
                  <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="houseNo">
                    House No.:
                  </label>
                  <input
                    id="houseNo"
                    type="text"
                    placeholder="e.g. Blk 1 Lot 1"
                    value={houseNo}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z0-9\s,.-]/g, '');
                      setHouseNo(val);
                    }}
                    className="w-full h-14 px-4 text-center rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal border-[#1e3d58]"
                  />
                  <p className="text-gray-400 text-xs font-semibold mt-1 ml-2 text-center sm:text-left">
                    Leave blank if none
                  </p>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="block text-lg font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="streetName">Street Name:</label>
                  <input
                    id="streetName"
                    type="text"
                    placeholder="e.g. San Juan St."
                    value={streetName}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z0-9\s,.-]/g, '');
                      setStreetName(val);
                      if (val.trim()) clearError("streetName"); 
                    }}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.streetName ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  />
                  {errors.streetName && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.streetName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="barangay">Barangay:</label>
                <input
                  id="barangay"
                  type="text"
                  placeholder="e.g. San Jose"
                  value={barangay}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^A-Za-z0-9\s,.-]/g, '');
                    setBarangay(val);
                    if (val.trim()) clearError("barangay"); 
                  }}
                  className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal ${errors.barangay ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                />
                {errors.barangay && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.barangay}</p>}
              </div>

              <div>
                <label className="block text-xl font-bold text-[#1e3d58] mb-1 ml-2" htmlFor="zone">Delivery Zone:</label>
                <div className="relative">
                  <select
                    id="zone"
                    value={selectedZoneId}
                    onChange={(e) => {
                      setSelectedZoneId(e.target.value);
                      if (e.target.value) clearError("zone"); 
                    }}
                    className={`w-full h-14 px-6 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] appearance-none cursor-pointer ${errors.zone ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  >
                    <option value="" disabled>Select Zone</option>
                    {locations.length === 0 ? (
                      <option disabled>Loading zones...</option>
                    ) : (
                      locations.map((loc) => (
                        <option key={loc.location_id} value={loc.location_id}>
                          {loc.location_name}
                        </option>
                      ))
                    )}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center px-6 pointer-events-none">
                    <svg className="w-5 h-5 text-[#1e3d58]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
                {errors.zone && <p className="text-red-500 text-sm font-bold mt-1 ml-2">{errors.zone}</p>}
              </div>
            </div>

            <div className="space-y-5 pt-4">
              <div className="flex items-center gap-2 border-b-2 border-slate-100 pb-2 mb-2">
                <Lock className="text-[#43b0f1] w-5 h-5" strokeWidth={2.5} />
                <h3 className="text-lg font-black text-[#43b0f1] tracking-widest uppercase">Security</h3>
              </div>

              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]" htmlFor="password">Create Password:</label>
                <div className="relative w-full mb-3">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="e.g. Abcd@1234"
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);
                      if (val) clearError("password");
                      if (repeatPassword === val) clearError("repeatPassword");
                    }}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.password ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
                
                {password.length > 0 && (
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
                {errors.password && <p className="text-red-500 text-xs sm:text-sm font-bold mt-2 ml-2 break-words leading-snug">{errors.password}</p>}
              </div>

              <div className="w-full">
                <label className="block text-lg font-bold mb-1 ml-2 text-[#1e3d58]" htmlFor="repeatPassword">Confirm Password:</label>
                <div className="relative w-full">
                  <input
                    id="repeatPassword"
                    type={showRepeatPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={repeatPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRepeatPassword(val);
                      if (val === password) clearError("repeatPassword");
                    }}
                    className={`w-full h-14 pl-6 pr-14 rounded-full border-2 bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1] placeholder:text-gray-400 placeholder:font-normal transition-all min-w-0 ${errors.repeatPassword ? 'border-red-400 bg-red-50 text-red-700' : 'border-[#1e3d58]'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-[#1e3d58] hover:text-[#43b0f1] transition-colors outline-none"
                    title={showRepeatPassword ? "Hide password" : "Show password"}
                  >
                    {showRepeatPassword ? <EyeOff size={22} strokeWidth={2.5} /> : <Eye size={22} strokeWidth={2.5} />}
                  </button>
                </div>
                
                {repeatPassword.length > 0 && (
                  <div className="pl-2 mt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className={`flex items-center gap-2 text-sm font-bold transition-colors duration-300 ${passwordsMatch ? 'text-green-600' : 'text-red-500'}`}>
                      {passwordsMatch ? <Check size={18} strokeWidth={4} /> : <XIcon size={18} strokeWidth={4} />}
                      {passwordsMatch ? "Passwords match" : "Passwords do not match"}
                    </div>
                  </div>
                )}
                {errors.repeatPassword && !repeatPassword && <p className="text-red-500 text-sm font-bold mt-1 ml-2 break-words">{errors.repeatPassword}</p>}
              </div>
            </div>

            <div className="pt-2">
              {globalError && (
                <p className="text-sm font-bold text-red-500 text-center px-4 py-3 bg-red-50 rounded-xl border border-red-200 mb-4">
                  ⚠️ {globalError}
                </p>
              )}

              <div className="flex flex-col gap-1 px-2 mb-6">
                <div className="flex items-start gap-3">
                  <input 
                    id="isConfirmed" 
                    type="checkbox"
                    checked={isConfirmed}
                    onChange={(e) => {
                      setIsConfirmed(e.target.checked);
                      if (e.target.checked) clearError("isConfirmed"); 
                    }}
                    className={`w-6 h-6 mt-1 rounded border-2 accent-[#43b0f1] cursor-pointer shrink-0 ${errors.isConfirmed ? 'border-red-500' : 'border-[#1e3d58]'}`} 
                  />
                  <label htmlFor="isConfirmed" className="text-base font-medium text-[#1e3d58] leading-tight cursor-pointer">
                    I hereby confirm that all the details above are correct and valid for delivery.
                  </label>
                </div>
                {errors.isConfirmed && <p className="text-red-500 text-sm font-bold ml-9">{errors.isConfirmed}</p>}
              </div>

              <div className="flex justify-center">
                <Button 
                  type="submit" 
                  disabled={isLoading || (repeatPassword.length > 0 && !passwordsMatch) || (password.length > 0 && !isPasswordStrong)}
                  className="w-2/3 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? "Signing up..." : "Register"}
                </Button>
              </div>

              <div className="text-center pt-5 pb-2">
                <span className="text-[#1e3d58] text-lg">Already have an account? </span>
                <Link href="/auth/login" className="text-[#43b0f1] font-bold text-lg hover:underline">
                  Log in
                </Link>
              </div>
            </div>

          </form>
        </div>
      </div>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-4 bg-[#43b0f1] text-white rounded-full shadow-2xl hover:bg-[#1e3d58] hover:scale-110 transition-all z-50 animate-in fade-in slide-in-from-bottom-5"
          aria-label="Scroll to top"
        >
          <ArrowUp size={28} strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

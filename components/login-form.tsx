"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      const {data} = await supabase.auth.getClaims();
      const role =  data?.claims.app_metadata?.role;
      if (role === "employee"){
        router.push("/dashboard");
      }else router.push("/home");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="w-full max-w-md bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl mx-auto">
        <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">
          Login
        </h1>

        <div className="bg-white rounded-[40px] p-6 sm:p-8 shadow-inner border border-gray-100 text-left">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-[#1e3d58] tracking-tight mb-2">
              Welcome to RFinest!
            </h2>
            <p className="text-sm text-[#1e3d58]">
              Sign in to manage your account and services.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
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

            <div>
              <label className="block text-xl font-bold text-[#1e3d58] mb-2 ml-2">
                Password:
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-6 rounded-full border-2 border-[#1e3d58] bg-[#e8eef1] text-[#1e3d58] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#43b0f1]"
              />
            </div>

            {error && (
              <p className="text-sm font-bold text-red-500 px-2 text-center">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between px-2 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-[#1e3d58] accent-[#43b0f1]" 
                />
                <span className="text-lg text-[#1e3d58]">Remember me</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-[#43b0f1] font-semibold hover:underline"
              >
                Forgot Password
              </Link>
            </div>

            <div className="pt-6 flex justify-center">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-2/3 h-14 text-2xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Log in"}
              </Button>
            </div>

            <div className="text-center pt-6 pb-2">
              <span className="text-[#1e3d58] text-lg">Don&apos;t have an account? </span>
              <Link 
                href="/auth/sign-up" 
                className="text-[#43b0f1] font-bold text-lg hover:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

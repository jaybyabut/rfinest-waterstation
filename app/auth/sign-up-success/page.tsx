import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SignUpSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
        <div className="w-full max-w-md bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-[#e8eef1] shadow-xl">
          <h1 className="text-5xl font-black mb-8 text-black tracking-tighter">
            Success!
          </h1>
          <div className="bg-white rounded-[40px] p-8 shadow-inner border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>

            <h2 className="text-2xl font-black text-[#1e3d58] mb-4">
              Thank you for signing up!
            </h2>

            <p className="text-lg text-[#1e3d58] mb-8 leading-relaxed">
              You&apos;ve successfully signed up. Please check your email to confirm your account before signing in.
            </p>

            <Link href="/auth/login">
              <Button className="w-full h-14 text-xl font-bold rounded-full bg-[#43b0f1] text-white border-2 border-[#43b0f1] hover:bg-[#1e3d58] hover:border-[#1e3d58] transition-all active:scale-95">
                  Back to Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

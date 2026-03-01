import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Droplets, ArrowRight } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-[#43b0f1]/20">
      <Header />

      <main className="flex-1 flex flex-col">
        <section className="relative bg-gradient-to-b from-[#43b0f1] to-[#2c88d1] text-white pt-20 pb-32 px-6 lg:pt-32 lg:pb-48 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
            <Droplets className="absolute top-10 right-10 w-64 h-64 text-white animate-pulse" />
            <div className="absolute bottom-0 left-[-20%] w-[50%] h-[50%] bg-white rounded-full blur-[100px]" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
            <h5 className="text-sky-100 font-bold tracking-widest uppercase text-sm lg:text-base mb-4">
              RFinest Water Refilling Station
            </h5>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight drop-shadow-sm">
              Skip the Text. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200 italic">
                Just Tap.
              </span>
            </h1>
            <p className="text-lg lg:text-2xl font-medium text-sky-50 max-w-2xl mx-auto leading-relaxed opacity-95">
              Tired of waiting for a reply? Order instantly through our portal and get live updates on your delivery status—no calls needed.
            </p>
          </div>

          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none rotate-180">
              <svg className="relative block w-[calc(100%+1.3px)] h-[70px] lg:h-[120px]" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
                  <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" className="fill-[#1e3d58]"></path>
              </svg>
          </div>
        </section>

        <section className="bg-[#1e3d58] text-white py-16 px-6 lg:py-24 relative z-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl lg:text-5xl font-black uppercase tracking-tight">
                Why Switch to Digital?
              </h2>
              <p className="text-sky-200 text-lg lg:text-xl font-medium italic">
                Stop wondering, "Did they get my text?"
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              <BenefitCard 
                title="One-Tap Ordering"
                description="Don't type your name and address every single time. Set it up once, order forever."
              />
              <BenefitCard 
                title="Direct to Station"
                description="Orders go straight to our main dashboard, avoiding the risk of buried text messages."
              />
              <BenefitCard 
                title="Better Service"
                description="Using the app helps us organize our delivery routes, meaning we can serve the whole community faster."
              />
            </div>
          </div>
        </section>

        <section className="bg-white py-20 px-6 lg:py-32 text-center">
          <div className="max-w-3xl mx-auto space-y-10">
            <h3 className="text-4xl lg:text-6xl font-black text-[#1e3d58] leading-tight tracking-tighter">
              Experience a <br className="lg:hidden" />
              <span className="text-[#43b0f1] italic">smarter way to refill.</span>
            </h3>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 lg:gap-6 w-full max-w-md mx-auto">
 
              <Button asChild className="w-full h-16 text-xl font-bold rounded-full bg-[#43b0f1] hover:bg-[#1e3d58] text-white shadow-xl shadow-[#43b0f1]/30 transition-all active:scale-95">
                <Link href="/auth/sign-up">
                  Create My Account <ArrowRight className="ml-2 w-6 h-6" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full h-16 text-xl font-bold rounded-full border-2 border-[#1e3d58] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all active:scale-95">
                <Link href="/auth/login">
                  Login
                </Link>
              </Button>
            </div>

            <p className="text-slate-400 font-bold italic text-sm tracking-widest uppercase pt-8">
              #LiveBetterWithQualityWater
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left p-6 rounded-[30px] bg-[#264a6a] border border-[#43b0f1]/20 shadow-lg transition-transform hover:-translate-y-1">
      <div className="mb-4 p-3 bg-[#43b0f1]/20 rounded-full text-[#43b0f1]">
        <CheckCircle2 size={32} strokeWidth={3} />
      </div>
      <h4 className="text-2xl font-black mb-3 tracking-tight">{title}</h4>
      <p className="text-sky-100 leading-relaxed font-medium opacity-90">
        {description}
      </p>
    </div>
  );
}

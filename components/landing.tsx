import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Header from "./Header";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    // for mobile access
    <div className="flex flex-col min-h-screen bg-[#f8fafc] font-sans selection:bg-[#43b0f1]/30">
      <Header />

      <main className="flex-1 flex flex-col lg:flex-row p-4 lg:p-10 gap-0">
        
        {/* shrinks on mobile*/}
        <section className="relative flex-[1.2] bg-gradient-to-br from-[#43b0f1] to-[#1e3d58] text-white p-8 lg:p-20 flex flex-col justify-center space-y-8 rounded-[40px] lg:rounded-b-none lg:rounded-l-[60px] lg:rounded-r-[100px] shadow-[20px_0_60px_-15px_rgba(0,0,0,0.3)] z-20 overflow-hidden">
          
          <div className="space-y-4">
            <h1 className="text-5xl lg:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase drop-shadow-2xl">
              Skip the <br /> 
              <span className="text-sky-200">Text.</span>
            </h1>
            <p className="text-lg lg:text-2xl font-bold opacity-90 max-w-md leading-tight text-sky-100 italic">
              order in one tap. get live updates. <br/> no more waiting for a reply.
            </p>
          </div>

          <div className="space-y-4 max-w-sm">
            <FeatureRow title="one-tap magic" />
            <FeatureRow title="direct to station" />
          </div>

          {/* mobile background flare */}
          <div className="absolute top-0 -left-10 w-40 h-40 bg-white/10 rounded-full blur-[80px]" />
        </section>

        {/* right panel: authentication */}
        <section className="relative flex-1 bg-white flex flex-col justify-center items-center p-8 lg:p-20 rounded-[40px] lg:rounded-l-none lg:rounded-r-[60px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] lg:shadow-[30px_30px_80px_-20px_rgba(67,176,241,0.3)] z-10 -mt-8 lg:mt-0 lg:-ml-12">
          
          <div className="w-full max-w-sm space-y-10 py-10 lg:py-0">
            <div className="space-y-2 text-center lg:text-left">
              <h3 className="text-4xl lg:text-6xl font-black text-[#1e3d58] leading-tight italic tracking-tighter">
                it's time for a <br/> 
                <span className="text-[#43b0f1]">smarter refill.</span>
              </h3>
              <p className="text-slate-400 font-bold italic text-lg tracking-tight">ready to join the neighborhood?</p>
            </div>

            <div className="flex flex-col gap-4">
              <PrimaryButton href="/auth/login">login</PrimaryButton>
              <PrimaryButton href="/auth/sign-up">register</PrimaryButton>
            </div>
            
            <p className="text-center text-slate-400 font-bold italic text-xs tracking-widest uppercase">
              #livebetterwithqualitywater
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

/* ============================= */
/* reusable components           */
/* ============================= */

function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Button
      asChild
      className="h-16 lg:h-20 text-xl lg:text-2xl font-black rounded-[28px] bg-[#43b0f1] hover:bg-[#1e3d58] 
                 shadow-lg transition-all duration-500 
                 active:scale-95 text-white border-none uppercase italic tracking-widest"
    >
      <Link href={href} className="w-full text-center">
        {children}
      </Link>
    </Button>
  );
}

function FeatureRow({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xl">✅</span>
      <h4 className="text-xl lg:text-2xl font-black tracking-tighter italic uppercase opacity-90">
        {title}
      </h4>
    </div>
  );
}

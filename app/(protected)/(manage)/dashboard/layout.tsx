  import Header from "@/components/Header";
  import Footer from "@/components/Footer";

  export default function Protectedlayout({
      children,
    }: {
      children: React.ReactNode;
    }
  ) {
    return (
      <main className="min-h-screen flex flex-col bg-[#e8eef1]">

      <Header />

      <div className="flex-1 w-full flex flex-col items-center p-4 md:p-8">
        <div className="w-full max-w-5xl">
          {children}
        </div>
      </div>
      
      <Footer />

      </main>
    );
  }

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <div className="w-full">
        <Header />
      </div>
      <div className="flex-1 w-full flex flex-col items-center justify-start pt-10 px-4">
        {children}
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </main>
  );
}

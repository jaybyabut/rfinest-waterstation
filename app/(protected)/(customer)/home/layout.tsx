import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { UserProvider } from "./user-provider";
import { getCustomerAddy } from "@/app/actions/getCustomerAddy";

async function UserDataLoader({ children }: { children: React.ReactNode }) {
  const data = await getCustomerAddy();
  const userData = data && !('error' in data) ? data as any : null;
  return <UserProvider userData={userData}>{children}</UserProvider>;
}

export default function CustomerLayout({
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
        <Suspense fallback={<div className="text-xl font-bold text-[#1e3d58] animate-pulse pb-10">Loading...</div>}>
          <UserDataLoader>
            {children}
          </UserDataLoader>
        </Suspense>
      </div>
      <div className="w-full">
        <Footer />
      </div>
    </main>
  );
}

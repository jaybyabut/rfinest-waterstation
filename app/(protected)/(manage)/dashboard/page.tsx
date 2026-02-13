import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminManagePage() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md">
        <div className="flex w-full mb-6 rounded-full overflow-hidden border-2 border-[#1e3d58] shadow-sm">
          <Link href="/dashboard/order" className="flex-1 py-3 text-center text-lg font-bold bg-[#43b0f1] text-white hover:bg-[#3ba0db] transition-colors">
            Order
          </Link>
          <button className="flex-1 py-3 text-lg font-bold bg-[#1e3d58] text-white">
            Manage
          </button>
        </div>

        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-10 text-center border-2 border-white/50 shadow-xl">
          <h1 className="text-6xl font-black mb-8 text-black tracking-tighter">Manage</h1>
          <div className="bg-white rounded-[40px] p-8 shadow-inner border border-gray-100">
            <h2 className="text-3xl font-extrabold mb-10 text-[#1e3d58]">{today}</h2>
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                Edit Order
              </Button>
              <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                Order Status
              </Button>
              <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                Manage Prices
              </Button>
              <Button variant="outline" className="w-full h-16 text-xl font-bold border-2 border-[#1e3d58] rounded-[20px] bg-[#e8eef1] text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all">
                Analytics & Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminTabsProps {
  active: "order" | "manage";
}

export default function AdminTabs({ active }: AdminTabsProps) {
  return (
    <div className="flex w-full gap-3 mb-8">
      <Link href="/dashboard/order" className="flex-1">
        <div
          className={cn(
            "py-3 text-center text-xl font-bold rounded-[20px] transition-all shadow-md",
            active === "order"
              ? "bg-[#1e3d58] text-white"
              : "bg-[#43b0f1] text-white hover:opacity-90"
          )}
        >
          Order
        </div>
      </Link>

      <Link href="/dashboard" className="flex-1">
        <div
          className={cn(
            "py-3 text-center text-xl font-bold rounded-[20px] transition-all shadow-md",
            active === "manage"
              ? "bg-[#1e3d58] text-white"
              : "bg-[#43b0f1] text-white hover:opacity-90"
          )}
        >
          Manage
        </div>
      </Link>
    </div>
  );
}

import OrderHistory from "@/components/admin/order-history";

export default function DashboardPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center">
      <OrderHistory />
    </div>
  );
}

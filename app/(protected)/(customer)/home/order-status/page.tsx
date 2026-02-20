import CustomerOrderStatus from "@/components/customer/online/order-status";

export default function CustomerPage() {
  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <CustomerOrderStatus />
    </div>
  );
}

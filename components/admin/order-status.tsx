"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Copy, Check, X } from "lucide-react";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import { Button } from "@/components/ui/button";
import { getAllOrders } from "@/app/actions/getAllOrders";
import { updateOrderStatus } from "@/app/actions/updateOrderStatus";

const status_options = ["Pending", "Processing", "Refilled", "Out for Delivery", "Delivered", "Cancelled"];
const FILTERS = ["All", ...status_options];

interface OrderItem {
  quantity: number;
  products: {
    product_name: string;
  } | {
    product_name: string;
  }[] | null;
}

interface FetchedOrder {
  order_id: number;
  order_dt: string; 
  name: string;
  total_amount: number;
  transaction_type: string; 
  current_status: string;
  location_pricing: {
    location_name: string;
  } | {
    location_name: string;
  }[] | null;
  order_items: OrderItem[];
}

interface DisplayOrder {
  id: string;
  rawId: number;
  name: string;
  zone: string;
  slim: number;
  round: number;
  total: number;
  status: string;
  date: string;
  transactionType: string;
}

export default function OrderStatus() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [orders, setOrders] = useState<DisplayOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);
  
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setGlobalError(null);
        const result = await getAllOrders();
        
        if (result && !('error' in result)) {
          const fetchedOrders = result as FetchedOrder[];
          
          const mappedOrders: DisplayOrder[] = fetchedOrders.map((order) => {
            let slim = 0;
            let round = 0;

            order.order_items.forEach((item) => {
              const product = Array.isArray(item.products) ? item.products[0] : item.products;
              const productName = product?.product_name?.toLowerCase() || "";
              
              if (productName.includes("slim")) {
                slim += item.quantity;
              } else if (productName.includes("round")) {
                round += item.quantity;
              }
            });

            const location = Array.isArray(order.location_pricing) ? order.location_pricing[0] : order.location_pricing;

            let statusString = order.current_status || "Pending";
            if (statusString === "Picked-up") statusString = "Processing";

            return {
              id: `ORD-${order.order_id}`,
              rawId: order.order_id,
              name: order.name,
              zone: location?.location_name || "Unknown",
              slim,
              round,
              total: order.total_amount,
              status: statusString,
              date: new Date(order.order_dt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
              transactionType: order.transaction_type || "N/A",
            };
          });

          setOrders(mappedOrders);
        } else {
          setGlobalError("Failed to load orders. Please try refreshing the page.");
          console.error("Error fetching orders:", result?.error);
        }
      } catch (error) {
        setGlobalError("An unexpected error occurred while connecting to the server.");
        console.error("Unexpected error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // modals for details and status updates
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<DisplayOrder | null>(null);
  const [statusChangeOrder, setStatusChangeOrder] = useState<DisplayOrder | null>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleCardClick = (order: DisplayOrder) => {
    setSelectedOrderDetails(order);
  };

  const handleStatusClick = (e: React.MouseEvent, order: DisplayOrder) => {
    e.stopPropagation();
    if (order.status === "Cancelled") return;
    setStatusChangeOrder(order);
    setNewStatus(order.status === "Pending" ? "Processing" : order.status);
  };

  const confirmStatusChange = async () => {
    if (!statusChangeOrder || !newStatus || statusChangeOrder.status === newStatus) {
      setStatusChangeOrder(null);
      return;
    }

    setIsUpdatingStatus(true);
    try {
      const result = await updateOrderStatus(statusChangeOrder.rawId, newStatus);
      if (result && !('error' in result)) {
        setOrders(orders.map(o => o.id === statusChangeOrder.id ? { ...o, status: newStatus } : o));
        if (selectedOrderDetails?.id === statusChangeOrder.id) {
          setSelectedOrderDetails({ ...selectedOrderDetails, status: newStatus });
        }
      } else {
        alert(result?.error || "Failed to update status.");
      }
    } catch (e) {
      console.error("Error updating status:", e);
      alert("Error updating status.");
    } finally {
      setIsUpdatingStatus(false);
      setStatusChangeOrder(null);
    }
  };

  const filteredOrders = activeFilter === "All" ? orders : orders.filter((order) => order.status === activeFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-gray-200 text-gray-700 border-gray-400";
      case "Processing":
        return "bg-orange-100 text-orange-700 border-orange-400";
      case "Refilled":
        return "bg-blue-100 text-[#43b0f1] border-[#43b0f1]";
      case "Out for Delivery":
        return "bg-teal-100 text-teal-700 border-teal-400";
      case "Delivered":
        return "bg-green-100 text-green-700 border-green-500";
      case "Cancelled":
        return "bg-red-100 text-red-700 border-red-500";
      default:
        return "bg-gray-100 text-gray-700 border-gray-400";
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelClick = (id: string) => {
    setOrderToCancel(id);
    setIsModalOpen(true);
  };

  const confirmCancellation = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);

    try {
      // TODO: BACKEND - Add API call to update order status to "Cancelled" in the database
      await new Promise(resolve => setTimeout(resolve, 1000));

      setOrders(
        orders.map((order) =>
          order.id === orderToCancel ? { ...order, status: "Cancelled" } : order
        )
      );
    } catch (error) {
       console.error("Failed to cancel order:", error);
       alert("Failed to cancel order. Please try again."); 
    } finally {
      setIsCancelling(false);
      setIsModalOpen(false);
      setOrderToCancel(null);
    }
  };

  return (
    <div className="flex flex-col items-center w-full px-4 py-6 animate-in fade-in zoom-in duration-500 mb-24 relative">
      <div className="w-full max-w-md">
        <div className="w-full bg-[#e8eef1] rounded-[50px] p-5 pt-8 text-center border-2 border-white shadow-xl">
          
          <div className="flex items-center mb-6 relative px-2">
            <Link href="/dashboard" className="absolute left-2 text-black hover:scale-110 transition-transform">
              <ChevronLeft size={44} strokeWidth={3} />
            </Link>
            <h1 className="text-4xl sm:text-5xl font-black text-black tracking-tighter w-full text-center px-12">  
              Order Status
            </h1>
          </div>

          <div className="bg-white rounded-[40px] p-4 sm:p-6 shadow-inner border border-gray-100 text-left">
            
            {globalError && (
              <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-xl text-center font-bold text-sm border-2 border-red-200">
                ⚠️ {globalError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pb-4 mb-2">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2 py-2.5 rounded-full text-sm sm:text-base font-bold border-2 transition-all ${
                    filter === "All" ? "col-span-2 w-full" : 
                    "w-full"
                  } ${
                    activeFilter === filter
                      ? "bg-[#1e3d58] text-white border-[#1e3d58]"
                      : "bg-[#e8eef1] text-[#1e3d58] border-transparent hover:border-[#1e3d58]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 pb-2 custom-scrollbar">
              {loading ? (
                 <div className="text-center py-10 text-gray-400 font-medium">
                   Loading orders...
                 </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-10 text-gray-400 font-medium">
                  {globalError ? "Cannot load data." : `No orders found for "${activeFilter}".`}
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div 
                    key={order.id} 
                    onClick={() => handleCardClick(order)}
                    className="border-2 border-[#1e3d58] rounded-[25px] p-4 bg-white shadow-sm flex flex-col gap-3 cursor-pointer hover:border-[#43b0f1] transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-[#1e3d58]">{order.id}</h3>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleCopyId(order.id); }}
                            className="text-gray-400 hover:text-[#43b0f1] transition-colors focus:outline-none"
                            title="Copy Order ID"
                          >
                            {copiedId === order.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-500">
                          {order.name} • {order.zone}
                        </p>
                      </div>
                      <button 
                        onClick={(e) => handleStatusClick(e, order)}
                        disabled={order.status === "Cancelled"}
                        className={`px-3 py-1 rounded-full border text-xs font-bold transition-all ${
                          order.status === "Cancelled" 
                            ? "opacity-50 cursor-not-allowed" 
                            : "hover:opacity-80 cursor-pointer"
                        } ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </button>
                    </div>

                    <div className="flex justify-between items-center bg-[#e8eef1] p-3 rounded-[15px]">
                      <div className="text-sm font-semibold text-[#1e3d58]">
                        Slim: <span className="text-[#43b0f1] font-black">{order.slim}</span> | Round:{" "}
                        <span className="text-[#43b0f1] font-black">{order.round}</span>
                      </div>
                      <div className="text-lg font-black text-[#43b0f1]">₱{order.total}</div>
                    </div>

                    {order.status === "Pending" && (
                      <div className="flex justify-end mt-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleCancelClick(order.id); }}
                          className="text-red-500 hover:text-red-700 text-sm font-bold transition-colors"
                        >
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isCancelling) {
             setIsModalOpen(false);
             setOrderToCancel(null);
          }
        }}
        onConfirm={confirmCancellation}
        title="Cancel Order?"
        message={`Are you sure you want to cancel ${orderToCancel}? This action cannot be undone.`}
        confirmText={isCancelling ? "Cancelling..." : "Yes, Cancel Order"}
      />

      {/* Details Modal */}
      {selectedOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200" onClick={() => setSelectedOrderDetails(null)}>
          <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="bg-white rounded-[30px] p-6 relative border border-gray-100">
              <button onClick={() => setSelectedOrderDetails(null)} className="absolute top-5 right-5 text-gray-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black text-[#1e3d58] mb-6 pr-8">Order Details</h2>
              
              <div className="space-y-4 text-sm sm:text-base">
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Order ID</span>
                  <span className="text-[#1e3d58] font-black">{selectedOrderDetails.id}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Name</span>
                  <span className="text-[#1e3d58] font-bold text-right">{selectedOrderDetails.name}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Date</span>
                  <span className="text-[#1e3d58] font-bold text-right">{selectedOrderDetails.date}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Zone</span>
                  <span className="text-[#1e3d58] font-bold">{selectedOrderDetails.zone}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Type</span>
                  <span className="text-[#1e3d58] font-bold">{selectedOrderDetails.transactionType}</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Items</span>
                  <span className="text-[#43b0f1] font-black">{selectedOrderDetails.slim} Slim • {selectedOrderDetails.round} Round</span>
                </div>
                <div className="flex justify-between border-b border-gray-100 pb-2">
                  <span className="text-gray-500 font-bold">Total</span>
                  <span className="text-[#43b0f1] font-black text-lg">₱{selectedOrderDetails.total}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-gray-500 font-bold">Status</span>
                  <button 
                    onClick={(e) => handleStatusClick(e, selectedOrderDetails)}
                    disabled={selectedOrderDetails.status === "Cancelled"}
                    className={`px-4 py-1.5 rounded-full border text-xs font-black shadow-sm transition-all ${
                      selectedOrderDetails.status === "Cancelled"
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:opacity-80 cursor-pointer"
                    } ${getStatusColor(selectedOrderDetails.status)}`}
                  >
                    {selectedOrderDetails.status}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {statusChangeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e3d58]/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="bg-[#e8eef1] rounded-[40px] p-2 sm:p-3 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-[30px] p-6 text-center border border-gray-100">
              <h2 className="text-2xl font-black text-[#1e3d58] mb-2 tracking-tight">Update Status</h2>
              <p className="mb-6 text-gray-500 font-medium text-sm">Change status for <span className="text-[#43b0f1] font-black">{statusChangeOrder.id}</span></p>
              
              <div className="relative">
                <select 
                  className="w-full p-4 mb-8 border-2 border-gray-200 rounded-2xl font-bold text-[#1e3d58] outline-none focus:border-[#43b0f1] appearance-none bg-gray-50/50"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  {status_options.filter(opt => opt !== "Pending").map(opt => (
                    <option key={opt} value={opt} className="font-bold">{opt}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-gray-400">
                  <ChevronLeft size={24} className="-rotate-90" />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3">
                <Button 
                  onClick={() => setStatusChangeOrder(null)} 
                  variant="outline" 
                  className="flex-1 h-12 text-lg font-bold rounded-full border-2 border-[#1e3d58] bg-white text-[#1e3d58] hover:bg-[#1e3d58] hover:text-white transition-all shadow-md"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmStatusChange} 
                  className="flex-1 h-12 text-lg font-bold rounded-full bg-[#43b0f1] text-white hover:bg-[#1e3d58] transition-all shadow-md"
                >
                  {isUpdatingStatus ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

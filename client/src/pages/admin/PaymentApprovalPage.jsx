import { useEffect, useState } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import { getOrders, updateOrder } from "../../services/orderServices";
import { ClipboardList, Check, X, Eye, FileText } from "lucide-react";

export function PaymentApprovalPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeSlipUrl, setActiveSlipUrl] = useState(null);

  const fetchPendingOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getOrders();
      const allOrders = res?.data || res || [];
      if (Array.isArray(allOrders)) {
        // Filter: Placed order status and has a payment slip
        const pending = allOrders.filter(
          (o) => o.status === "Placed" && o.paymentSlipUrl
        );
        setOrders(pending);
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
      setErrorMsg("Failed to load payment approvals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const handleApprove = async (id) => {
    if (!window.confirm("Are you sure you want to approve this payment slip?")) return;
    try {
      await updateOrder(id, {
        status: "Confirmed",
        paymentSlipStatus: "Approved",
      });
      alert("Payment approved successfully! Order status updated to Confirmed.");
      fetchPendingOrders();
    } catch (err) {
      alert("Failed to approve order: " + err.message);
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Are you sure you want to reject this payment slip? This will cancel the order.")) return;
    try {
      await updateOrder(id, {
        status: "Cancelled",
        paymentSlipStatus: "Rejected",
      });
      alert("Payment rejected. Order status updated to Cancelled.");
      fetchPendingOrders();
    } catch (err) {
      alert("Failed to reject order: " + err.message);
    }
  };

  return (
    <AdminShell
      activeSection="payment-approval"
      action={
        <button type="button" onClick={fetchPendingOrders} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black cursor-pointer">
          Refresh
        </button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Payment Approvals
          </h1>
          <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
            Review bank transfer slips uploaded by customers and approve their payments.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 border border-red-200 text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-sm text-neutral-500">
          Loading pending payments...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-neutral-900">
            All Caught Up!
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            There are no pending bank payment slips to review.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#d8d8d8] text-[11px] font-bold uppercase tracking-wide text-red-500 border-b border-neutral-200">
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Placed At</th>
                <th className="px-6 py-3 text-right">Amount</th>
                <th className="px-6 py-3 text-center">Payment Slip</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {orders.map((order) => {
                const name = order.deliveryAddress
                  ? `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}`
                  : "Unknown Customer";
                const total = order.totalAmount || 0;

                return (
                  <tr key={order._id || order.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">{name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {order.deliveryAddress?.city || "Unknown City"}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#ef2027]">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {order.placedAt}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-[#ef2027]">
                      Rs. {total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setActiveSlipUrl(order.paymentSlipUrl)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-neutral-50 hover:text-black transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        View Slip
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(order.orderId || order._id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer shadow-xs"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(order.orderId || order._id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition cursor-pointer shadow-xs"
                          title="Reject"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Slip Preview Modal */}
      {activeSlipUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-neutral-900">Payment Slip Proof</h3>
              <button
                type="button"
                onClick={() => setActiveSlipUrl(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-black transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex max-h-[60vh] items-center justify-center overflow-auto rounded-lg bg-slate-50 border border-slate-100 p-2">
              <img
                src={activeSlipUrl}
                alt="Payment Receipt"
                className="max-h-full max-w-full rounded object-contain"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&w=600&q=80";
                }}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveSlipUrl(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-black text-white hover:bg-black/90 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

export default PaymentApprovalPage;

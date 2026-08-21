import { useEffect, useState } from "react";
import { AdminShell } from "../../components/admin/AdminShell";
import { getOrders, updateOrder } from "../../services/orderServices";
import { ClipboardList, ShieldCheck, Truck, Check, RefreshCw } from "lucide-react";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchConfirmedOrders = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await getOrders();
      const allOrders = res?.data || res || [];
      if (Array.isArray(allOrders)) {
        // Only show confirmed, proceeded, delivered, or cancelled orders (skip placed)
        const filtered = allOrders.filter((o) => o.status !== "Placed");
        setOrders(filtered);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setErrorMsg("Failed to load approved orders list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfirmedOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrder(id, { status: newStatus });
      alert(`Order status updated to ${newStatus} successfully.`);
      fetchConfirmedOrders();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  return (
    <AdminShell activeSection="orders">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            Order Management
          </h1>
          <p className="mt-1.5 text-xs text-neutral-500 sm:text-sm">
            Track customer orders and update their delivery statuses.
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
          Loading approved orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
            <ClipboardList className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-bold text-neutral-900">
            No Confirmed Orders
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Approved orders will appear here once payment is confirmed.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Placed Date</th>
                <th className="px-6 py-4 text-right">Total Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-150">
              {orders.map((order) => {
                const name = order.deliveryAddress
                  ? `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}`
                  : "Unknown Customer";
                const total = order.totalAmount || 0;

                // Pill styling for current status
                let pillStyle = "bg-neutral-100 text-neutral-850 border border-neutral-200";
                if (order.status === "Confirmed") pillStyle = "bg-blue-50 text-blue-600 border border-blue-100 font-semibold";
                if (order.status === "Proceeded") pillStyle = "bg-amber-50 text-amber-600 border border-amber-100 font-semibold";
                if (order.status === "Delivered") pillStyle = "bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold";
                if (order.status === "Cancelled" || order.status === "Canceled") {
                  pillStyle = "bg-rose-50 text-rose-600 border border-rose-100 font-semibold";
                }

                return (
                  <tr key={order._id || order.id} className="hover:bg-neutral-50/50">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-neutral-900">{name}</p>
                      <p className="text-[11px] text-neutral-500">
                        {order.deliveryAddress?.streetAddress}, {order.deliveryAddress?.city}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-neutral-600">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {order.placedAt}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-neutral-900">
                      Rs. {total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block rounded-full px-2.5 py-1 text-xs ${pillStyle}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.orderId || order._id, e.target.value)}
                        className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 bg-white hover:bg-neutral-50 hover:text-black outline-none transition cursor-pointer"
                      >
                        <option value="Confirmed">Confirmed</option>
                        <option value="Proceeded">Proceeded</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  );
}

export default AdminOrdersPage;

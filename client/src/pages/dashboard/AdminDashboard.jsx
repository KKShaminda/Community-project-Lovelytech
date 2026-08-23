import { Link } from "react-router-dom";
import { CirclePlus, Ellipsis, Receipt, TriangleAlert, TrendingUp, Wrench } from "lucide-react";
import { AdminShell } from '../../components/admin/AdminShell'
import { useEffect, useState, useMemo } from "react";
import { getSales } from "../../services/saleServices";
import { getRepairs } from "../../services/repairServices";
import { getProducts } from "../../services/productServices";
import { getOrders } from "../../services/orderServices";

const formatLKR = (value = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export function AdminDashboard() {
  const [sales, setSales] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("6M"); // "1M", "6M", "1Y"

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [salesRes, repairsRes, productsRes, ordersRes] = await Promise.all([
          getSales(),
          getRepairs(),
          getProducts({ limit: 1000 }),
          getOrders(),
        ]);

        setSales(salesRes.sales || salesRes || []);
        setRepairs(repairsRes.data || repairsRes.repairs || repairsRes || []);
        setProducts(productsRes.products || productsRes || []);
        setOrders(ordersRes.data || ordersRes.orders || ordersRes || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statsKPIs = useMemo(() => {
    const totalSalesLKR = formatLKR(sales.reduce((sum, s) => sum + (s.total || 0), 0));
    const totalOrdersLKR = orders.reduce((sum, o) => sum + (o.totalAmount || o.products.reduce((acc, p) => acc + p.price * p.qty, 0)), 0);
    const revenueSum = sales.reduce((sum, s) => sum + (s.total || 0), 0) + totalOrdersLKR;

    const lowStockCount = products.filter(p => p.stock <= 5).length;

    return [
      {
        label: "TOTAL SALES",
        value: totalSalesLKR,
        badge: `+${sales.length} items`,
        badgeClass: "bg-red-100 text-red-500",
        icon: Receipt,
      },
      {
        label: "REVENUE",
        value: formatLKR(revenueSum),
        badge: "TOTAL",
        badgeClass: "bg-red-100 text-red-500",
        icon: TrendingUp,
      },
      {
        label: "REPAIR REQUESTS",
        value: String(repairs.length),
        badge: "ACTIVE",
        badgeClass: "bg-red-200 text-red-700",
        icon: Wrench,
      },
      {
        label: "LOW STOCK",
        value: `${lowStockCount} Items`,
        badge: lowStockCount > 0 ? "CRITICAL" : "OK",
        badgeClass: lowStockCount > 0 ? "bg-rose-200 text-rose-700" : "bg-green-200 text-green-700",
        icon: TriangleAlert,
      },
    ];
  }, [sales, orders, repairs, products]);

  const chartData = useMemo(() => {
    const list = [];
    const now = new Date();

    if (timeFrame === "1M") {
      // Group last 28 days into 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        list.push({
          name: `WEEK ${4 - i}`,
          startDate: start,
          endDate: end,
          amount: 0,
        });
      }

      sales.forEach((sale) => {
        if (!sale.createdAt) return;
        const saleDate = new Date(sale.createdAt);
        const idx = list.findIndex(
          (w) => saleDate >= w.startDate && saleDate < w.endDate
        );
        if (idx !== -1) {
          list[idx].amount += sale.total || 0;
        }
      });

      orders.forEach((order) => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return;
        const idx = list.findIndex(
          (w) => orderDate >= w.startDate && orderDate < w.endDate
        );
        if (idx !== -1) {
          const orderAmt = order.totalAmount || order.products.reduce((sum, p) => sum + p.price * p.qty, 0);
          list[idx].amount += orderAmt || 0;
        }
      });

    } else if (timeFrame === "1Y") {
      // Last 12 months
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push({
          name: d.toLocaleString("default", { month: "short" }).toUpperCase(),
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          amount: 0,
        });
      }

      sales.forEach((sale) => {
        if (!sale.createdAt) return;
        const saleDate = new Date(sale.createdAt);
        const idx = list.findIndex(
          (m) => m.year === saleDate.getFullYear() && m.monthIndex === saleDate.getMonth()
        );
        if (idx !== -1) {
          list[idx].amount += sale.total || 0;
        }
      });

      orders.forEach((order) => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return;
        const idx = list.findIndex(
          (m) => m.year === orderDate.getFullYear() && m.monthIndex === orderDate.getMonth()
        );
        if (idx !== -1) {
          const orderAmt = order.totalAmount || order.products.reduce((sum, p) => sum + p.price * p.qty, 0);
          list[idx].amount += orderAmt || 0;
        }
      });

    } else {
      // 6M (Default)
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        list.push({
          name: d.toLocaleString("default", { month: "short" }).toUpperCase(),
          year: d.getFullYear(),
          monthIndex: d.getMonth(),
          amount: 0,
        });
      }

      sales.forEach((sale) => {
        if (!sale.createdAt) return;
        const saleDate = new Date(sale.createdAt);
        const idx = list.findIndex(
          (m) => m.year === saleDate.getFullYear() && m.monthIndex === saleDate.getMonth()
        );
        if (idx !== -1) {
          list[idx].amount += sale.total || 0;
        }
      });

      orders.forEach((order) => {
        const orderDate = order.createdAt ? new Date(order.createdAt) : null;
        if (!orderDate) return;
        const idx = list.findIndex(
          (m) => m.year === orderDate.getFullYear() && m.monthIndex === orderDate.getMonth()
        );
        if (idx !== -1) {
          const orderAmt = order.totalAmount || order.products.reduce((sum, p) => sum + p.price * p.qty, 0);
          list[idx].amount += orderAmt || 0;
        }
      });
    }

    const maxAmount = Math.max(...list.map((m) => m.amount), 0);
    return list.map((m) => ({
      name: m.name,
      amount: m.amount,
      height: maxAmount > 0 ? (m.amount / maxAmount) * 100 : 0,
    }));
  }, [sales, orders, timeFrame]);

  const recentTransactions = useMemo(() => {
    const list = [];

    sales.forEach((s) => {
      list.push({
        id: s._id || s.id,
        customer: s.customerName || "Walk-in Customer",
        product: s.items && s.items.length > 0 ? s.items.map(i => i.productName || i.name).join(", ") : "Product Sale",
        date: s.createdAt ? new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
        rawDate: s.createdAt ? new Date(s.createdAt) : new Date(0),
        status: s.status || "complete",
        statusClass: s.status === "complete" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500",
        total: formatLKR(s.total || 0),
      });
    });

    orders.forEach((o) => {
      const orderTotal = o.totalAmount || o.products.reduce((sum, p) => sum + p.price * p.qty, 0);
      list.push({
        id: o.orderId || o._id,
        customer: "Online Customer",
        product: o.products && o.products.length > 0 ? o.products.map(p => p.name).join(", ") : "Online Order",
        date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A",
        rawDate: o.createdAt ? new Date(o.createdAt) : new Date(0),
        status: o.status || "Placed",
        statusClass: o.status === "Delivered" ? "bg-emerald-100 text-emerald-700" : "bg-yellow-100 text-yellow-700",
        total: formatLKR(orderTotal || 0),
      });
    });

    return list.sort((a, b) => b.rawDate - a.rawDate).slice(0, 5);
  }, [sales, orders]);

  if (loading) {
    return (
      <AdminShell activeSection="dashboard">
        <div className="flex h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      activeSection="dashboard"
      action={
        <Link
          to="/login"
          className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
        >
          Sign In
        </Link>
      }
    >
      <div id="dashboard" className="space-y-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xl font-bold text-neutral-900">Overview</p>
            <p className="mt-1 text-sm text-neutral-700">Real-time performance analytics for Lovely Tech Precision.</p>
          </div>
        </div>

        <section className="grid gap-4 xl:grid-cols-4">
          {statsKPIs.map((item) => (
            <article key={item.label} className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
              <div className="flex items-start justify-between gap-3">
                <item.icon aria-hidden="true" className="text-red-500" size={20} strokeWidth={2} />
                <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.badgeClass}`}>{item.badge}</span>
              </div>
              <p className="mt-7 text-sm font-medium tracking-wide text-neutral-800">{item.label}</p>
              <p className="mt-2 text-lg font-medium text-neutral-900">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-5">
          <article className="rounded-2xl bg-[#efefef] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900">Monthly Sales Revenue</h2>
              <div className="flex items-center gap-2 text-[10px] font-semibold">
                <button
                  type="button"
                  onClick={() => setTimeFrame("1M")}
                  className={`rounded-full px-3 py-1 cursor-pointer transition-colors ${timeFrame === "1M" ? "bg-red-500 text-white font-bold" : "border border-neutral-400 text-neutral-700 hover:bg-neutral-200"}`}
                >
                  1M
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFrame("6M")}
                  className={`rounded-full px-3 py-1 cursor-pointer transition-colors ${timeFrame === "6M" ? "bg-red-500 text-white font-bold" : "border border-neutral-400 text-neutral-700 hover:bg-neutral-200"}`}
                >
                  6M
                </button>
                <button
                  type="button"
                  onClick={() => setTimeFrame("1Y")}
                  className={`rounded-full px-3 py-1 cursor-pointer transition-colors ${timeFrame === "1Y" ? "bg-red-500 text-white font-bold" : "border border-neutral-400 text-neutral-700 hover:bg-neutral-200"}`}
                >
                  1Y
                </button>
              </div>
            </div>

            <div className="mt-8 flex h-[260px] items-end gap-4 px-4 pb-2 lg:px-8">
              {chartData.map((item) => (
                <div key={item.name} className="flex flex-1 flex-col items-center justify-end gap-3 font-semibold">
                  <div className="group relative w-full h-[180px] flex flex-col items-center justify-end">
                    <div className="absolute -top-7 hidden group-hover:block rounded bg-red-500 px-2 py-0.5 text-[9px] text-white whitespace-nowrap z-10">
                      {formatLKR(item.amount)}
                    </div>
                    <div
                      className="w-full rounded-t-md bg-[#ef8d94] transition-all duration-300 hover:bg-red-400"
                      style={{ height: `${item.height}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-neutral-700">{item.name}</span>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section id="revenue" className="rounded-2xl bg-[#efefef]">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-medium text-neutral-900">Recent Orders</h2>
            <button type="button" aria-label="More order options" className="text-neutral-900">
              <Ellipsis aria-hidden="true" size={20} />
            </button>
          </div>

          <div className="overflow-hidden rounded-b-2xl">
            <div className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_1fr_1fr] bg-[#9a9a9a] px-6 py-3 text-[10px] font-bold uppercase text-neutral-900">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Product</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
            </div>

            {recentTransactions.map((order) => (
              <div key={order.id} className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_1fr_1fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
                <span className="text-neutral-700 truncate mr-2" title={order.id}>{order.id}</span>
                <span className="text-neutral-900">{order.customer}</span>
                <span className="text-neutral-900 truncate mr-2" title={order.product}>{order.product}</span>
                <span className="text-neutral-700">{order.date}</span>
                <span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${order.statusClass}`}>{order.status}</span>
                </span>
                <span className="font-bold text-neutral-900">{order.total}</span>
              </div>
            ))}

            <Link to="/receptionist/sales-log" className="block bg-[#6f7684] py-3 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-neutral-900 hover:bg-[#5e6573] transition-colors">
              View All Transactions
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export default AdminDashboard;

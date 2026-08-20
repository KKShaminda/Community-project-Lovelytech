import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminShell } from "../../components/admin/AdminShell";
import { getSales } from "../../services/saleServices";
import { getProducts } from "../../services/productServices";
import { getRepairs } from "../../services/repairServices";

// ── Helpers ────────────────────────────────────────────────────────────────────

const formatLKR = (value = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const SALE_STATUS_BADGE = {
  complete: "bg-green-100 text-green-700",
  processing: "bg-blue-100 text-blue-700",
  refunded: "bg-red-100 text-red-600",
};

const SALE_STATUS_LABEL = {
  complete: "Complete",
  processing: "Processing",
  refunded: "Refunded",
};

// ── Component ──────────────────────────────────────────────────────────────────

export function AdminDashboard() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [salesRes, productsRes, repairsRes] = await Promise.all([
          getSales(),
          getProducts({ limit: 500, page: 1 }),
          getRepairs(),
        ]);
        setSales(salesRes?.sales || []);
        setProducts(productsRes?.products || []);
        const fetchedRepairs = (repairsRes?.data || repairsRes?.repairs || []).map((r) => ({
          ...r,
          customerName: r.customer || r.customerName || "",
          customerPhone: r.phone || r.customerPhone || "",
          customerEmail: r.email || r.customerEmail || "",
          customerAddress: r.address || r.customerAddress || "",
        }));
        setRepairs(fetchedRepairs);
      } catch (err) {
        setError(err.message || "Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // ── Stats Cards ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const now = new Date();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    const completedSales = sales.filter((s) => s.status === "complete");

    const totalRevenue = completedSales.reduce((sum, s) => sum + (Number(s.total) || 0), 0);

    const monthlyRevenue = completedSales
      .filter((s) => {
        const d = new Date(s.createdAt || s.date || "");
        return d.getFullYear() === thisYear && d.getMonth() === thisMonth;
      })
      .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

    const openRepairs = repairs.filter(
      (r) => r.status !== "completed" && r.status !== "cancelled"
    ).length;

    const lowStockCount = products.filter(
      (p) => Number(p.stock ?? p.stockQty ?? 0) <= 5
    ).length;

    return [
      {
        label: "TOTAL REVENUE",
        value: formatLKR(totalRevenue),
        badge: `${formatLKR(monthlyRevenue)} this month`,
        badgeClass: "bg-red-100 text-red-500",
        icon: "↗",
        link: "/admin/sales-log",
      },
      {
        label: "TOTAL SALES",
        value: `${completedSales.length} Orders`,
        badge: `${sales.length} total`,
        badgeClass: "bg-red-100 text-red-500",
        icon: "◫",
        link: "/admin/sales-log",
      },
      {
        label: "REPAIR REQUESTS",
        value: `${openRepairs} Open`,
        badge: `${repairs.length} total`,
        badgeClass: "bg-red-200 text-red-700",
        icon: "✳",
        link: "/admin/repair-orders",
      },
      {
        label: "LOW STOCK",
        value: `${lowStockCount} Items`,
        badge: lowStockCount > 0 ? "NEEDS ATTENTION" : "OK",
        badgeClass: lowStockCount > 0 ? "bg-rose-200 text-rose-700" : "bg-green-100 text-green-700",
        icon: "△",
        link: "/admin/inventory",
      },
    ];
  }, [sales, products, repairs]);

  // ── Chart bars — per-month revenue (last 6 months) ─────────────────────────

  const chartData = useMemo(() => {
    const now = new Date();
    const labels = [];
    const values = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      labels.push(d.toLocaleString("default", { month: "short" }).toUpperCase());

      const monthTotal = sales
        .filter((s) => {
          if (s.status !== "complete") return false;
          const sd = new Date(s.createdAt || s.date || "");
          return sd.getFullYear() === year && sd.getMonth() === month;
        })
        .reduce((sum, s) => sum + (Number(s.total) || 0), 0);

      values.push(monthTotal);
    }

    const maxVal = Math.max(...values, 1);
    const heights = values.map((v) => Math.max(6, Math.round((v / maxVal) * 100)));

    return { labels, values, heights };
  }, [sales]);

  // ── Recent Sales table (last 5) ────────────────────────────────────────────

  const recentSales = useMemo(
    () =>
      [...sales]
        .sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0))
        .slice(0, 5),
    [sales]
  );

  return (
    <AdminShell
      activeSection="dashboard"
      action={
        <Link
          to="/login"
          className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
        >
          Sign Out
        </Link>
      }
    >
      <div id="dashboard" className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200">
            <p className="font-semibold">{error}</p>
          </div>
        )}
        {/* Header */}
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <p className="text-xl font-bold text-neutral-900">Overview</p>
            <p className="mt-1 text-sm text-neutral-700">
              Live performance analytics for Lovely Tech.
            </p>
          </div>

          <Link
            to="/repair/book"
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-b from-[#ff4c4f] to-[#e01c23] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(224,28,35,0.32)]"
          >
            <span className="text-base leading-none">⊕</span>
            New Repair Ticket
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <article key={i} className="h-28 animate-pulse rounded-2xl border border-neutral-200 bg-[#efefef]" />
            ))
            : stats.map((item) => (
              <Link to={item.link} key={item.label}>
                <article className="rounded-2xl border border-red-400 bg-[#efefef] p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-lg text-red-500">{item.icon}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.badgeClass}`}>
                      {item.badge}
                    </span>
                  </div>
                  <p className="mt-7 text-sm font-medium tracking-wide text-neutral-800">{item.label}</p>
                  <p className="mt-2 text-lg font-medium text-neutral-900">{item.value}</p>
                </article>
              </Link>
            ))}
        </section>

        {/* Revenue Chart */}
        <section className="grid gap-5">
          <article className="rounded-2xl bg-[#efefef] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-neutral-900">Monthly Sales Revenue</h2>
              <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-semibold text-white">
                Last 6 months
              </span>
            </div>

            {loading ? (
              <div className="mt-8 flex h-[260px] items-end gap-4 px-4 pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center justify-end gap-3">
                    <div className="w-full animate-pulse rounded-t-md bg-neutral-300" style={{ height: `${40 + i * 8}%` }} />
                    <span className="h-2 w-6 animate-pulse rounded bg-neutral-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 flex h-[260px] items-end gap-4 px-4 pb-2 lg:px-8">
                {chartData.labels.map((label, index) => (
                  <div key={label} className="group flex flex-1 flex-col items-center justify-end gap-3">
                    <div className="relative w-full">
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-neutral-800 px-2 py-1 text-[10px] text-white group-hover:block">
                        {formatLKR(chartData.values[index])}
                      </div>
                      <div
                        className="w-full rounded-t-md bg-[#ef8d94] transition-all duration-500 hover:bg-[#ef2027]"
                        style={{ height: `${chartData.heights[index]}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-neutral-700">{label}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>

        {/* Recent Sales Table */}
        <section id="revenue" className="rounded-2xl bg-[#efefef]">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-sm font-medium text-neutral-900">Recent Sales</h2>
            <Link to="/admin/sales-log" className="text-xs font-semibold text-[#ef2027] hover:underline">
              View All →
            </Link>
          </div>

          <div className="overflow-hidden rounded-b-2xl">
            <div className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_1fr_1fr] bg-[#9a9a9a] px-6 py-3 text-[10px] font-bold uppercase text-neutral-900">
              <span>Order ID</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Date</span>
              <span>Status</span>
              <span>Total</span>
            </div>

            {loading ? (
              <div className="px-6 py-8 text-center text-sm text-neutral-600">Loading...</div>
            ) : recentSales.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-neutral-600">No sales yet.</div>
            ) : (
              recentSales.map((sale) => {
                const statusClass = SALE_STATUS_BADGE[sale.status] || "bg-gray-100 text-gray-700";
                const statusLabel = SALE_STATUS_LABEL[sale.status] || sale.status;
                const dateStr = (sale.createdAt || sale.date || "").slice(0, 10);
                const itemSummary =
                  sale.items?.length > 0
                    ? sale.items
                      .slice(0, 2)
                      .map((item) => item.productName || item.productId || "—")
                      .join(", ") + (sale.items.length > 2 ? ` +${sale.items.length - 2}` : "")
                    : "—";

                return (
                  <div
                    key={sale._id || sale.id}
                    className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_1fr_1fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0"
                  >
                    <span className="font-semibold text-[#ef2027] text-xs">{(sale._id || sale.id || "").slice(-8)}</span>
                    <span className="text-neutral-900">{sale.customerName || "—"}</span>
                    <span className="truncate text-neutral-700">{itemSummary}</span>
                    <span className="text-neutral-700">{dateStr}</span>
                    <span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusClass}`}>
                        {statusLabel}
                      </span>
                    </span>
                    <span className="font-bold text-neutral-900">{formatLKR(sale.total)}</span>
                  </div>
                );
              })
            )}

            <Link
              to="/admin/sales-log"
              className="block bg-[#6f7684] py-3 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-white hover:bg-[#5a606d] transition-colors"
            >
              View All Transactions
            </Link>
          </div>
        </section>
      </div>
    </AdminShell>
  );
}

export default AdminDashboard;

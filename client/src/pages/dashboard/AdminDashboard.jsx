import { Link } from "react-router-dom";

const stats = [
  {
    label: "TOTAL SALES",
    value: "LKR 48,290.00",
    badge: "+12.5%",
    badgeClass: "bg-red-100 text-red-500",
    icon: "◫",
  },
  {
    label: "REVENUE",
    value: "LKR 124,500.00",
    badge: "+8.2%",
    badgeClass: "bg-red-100 text-red-500",
    icon: "↗",
  },
  {
    label: "REPAIR REQUESTS",
    value: "142",
    badge: "-4.1%",
    badgeClass: "bg-red-200 text-red-700",
    icon: "✳",
  },
  {
    label: "LOW STOCK",
    value: "12 Items",
    badge: "CRITICAL",
    badgeClass: "bg-rose-200 text-rose-700",
    icon: "△",
  },
];

const orders = [
  {
    id: "#LT-8842",
    customer: "Elena Vance",
    product: "Workstation X1",
    date: "Oct 12, 2024",
    status: "Delivered",
    statusClass: "bg-rose-100 text-red-500",
    total: "LKR 3,499.00",
  },
  {
    id: "#LT-8843",
    customer: "Gordon Freeman",
    product: "Neural Audio",
    date: "Oct 12, 2024",
    status: "Processing",
    statusClass: "bg-red-100 text-red-500",
    total: "LKR 599.00",
  },
  {
    id: "#LT-8844",
    customer: "Alyx Vance",
    product: "Nano-Optic Disp",
    date: "Oct 11, 2024",
    status: "Shipped",
    statusClass: "bg-amber-100 text-amber-500",
    total: "LKR 1,299.00",
  },
  {
    id: "#LT-8845",
    customer: "Isaac Kleiner",
    product: "Repair: Flux Cap",
    date: "Oct 11, 2024",
    status: "Pending",
    statusClass: "bg-rose-50 text-rose-300",
    total: "LKR 150.00",
  },
];

function Logo() {
  return (
    <div className="flex items-center gap-3">
      <img
        src="/Logo.png"
        alt="Lovely Tech"
        className="h-12 w-12 object-contain sm:h-14 sm:w-14"
      />
      <div className="hidden flex-col leading-none sm:flex">
        <span className="text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl">
          Lovely Tech
        </span>
      </div>
    </div>
  );
}

function SidebarItem({ label, active = false }) {
  return (
    <button
      type="button"
      className={`flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition ${active ? "bg-[#8F0F11] text-white" : "text-white/95 hover:bg-white/10"}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-current text-[11px]">▣</span>
      <span>{label}</span>
    </button>
  );
}

export function AdminDashboard() {
  const barHeights = [55, 72, 62, 82, 92, 76];
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

  return (
    <div className="min-h-screen bg-[#1f1f1f] p-4 text-neutral-900 lg:p-5">
      <div className="mx-auto max-w-[1280px] overflow-hidden bg-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
        <header className="border-b border-[#ff2020] bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />

          <div className="flex items-center gap-6 text-sm text-neutral-900">
            <nav className="hidden items-center gap-8 lg:flex">
              <a href="#dashboard" className="font-medium hover:text-red-500">
                Dashboard
              </a>
              <a href="#users" className="font-medium hover:text-red-500">
                Users
              </a>
              <a href="#revenue" className="font-medium hover:text-red-500">
                Revenue
              </a>
              <a href="#dispute" className="font-medium hover:text-red-500">
                Dispute
              </a>
            </nav>

            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                to="/login"
                className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] transition-colors duration-200 hover:bg-[#ff2020] hover:text-black"
              >
                Sign In
              </Link>
            </div>
          </div>
          </div>
        </header>

        <div className="flex bg-[#f4f4f4]">
          <aside className="hidden w-[210px] shrink-0 bg-[#ef2027] pb-12 lg:block">
            <div className="mt-2 space-y-1">
              <SidebarItem label="Dashboard" active />
              <SidebarItem label="Inventory" />
              <SidebarItem label="Repair Orders" />
              <SidebarItem label="Sales Log" />
              <SidebarItem label="Customers" />
              <SidebarItem label="Settings" />
            </div>
          </aside>

          <main id="dashboard" className="min-w-0 flex-1 bg-white px-5 py-6 lg:px-8">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-xl font-bold text-neutral-900">Overview</p>
                <p className="mt-1 text-sm text-neutral-700">Real-time performance analytics for Lovely Tech Precision.</p>
              </div>

              <Link
                to="/repair-ticket"
                className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-b from-[#ff4c4f] to-[#e01c23] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(224,28,35,0.32)]"
              >
                <span className="text-base leading-none">⊕</span>
                New Repair Ticket
              </Link>
            </div>

            <section className="mt-6 grid gap-4 xl:grid-cols-4">
              {stats.map((item) => (
                <article key={item.label} className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-lg text-red-500">{item.icon}</span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.badgeClass}`}>{item.badge}</span>
                  </div>
                  <p className="mt-7 text-sm font-medium tracking-wide text-neutral-800">{item.label}</p>
                  <p className="mt-2 text-lg font-medium text-neutral-900">{item.value}</p>
                </article>
              ))}
            </section>

            <section className="mt-8 grid gap-5">
              <article className="rounded-2xl bg-[#efefef] p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-neutral-900">Monthly Sales Revenue</h2>
                  <div className="flex items-center gap-2 text-[10px] font-semibold">
                    <span className="rounded-full border border-neutral-400 px-3 py-1 text-neutral-700">1M</span>
                    <span className="rounded-full bg-red-500 px-3 py-1 text-white">6M</span>
                    <span className="rounded-full border border-neutral-400 px-3 py-1 text-neutral-700">1Y</span>
                  </div>
                </div>

                <div className="mt-8 flex h-[260px] items-end gap-4 px-4 pb-2 lg:px-8">
                  {barHeights.map((height, index) => (
                    <div key={months[index]} className="flex flex-1 flex-col items-center justify-end gap-3">
                      <div className="w-full rounded-t-md bg-[#ef8d94]" style={{ height: `${height}%` }} />
                      <span className="text-[10px] text-neutral-700">{months[index]}</span>
                    </div>
                  ))}
                </div>
              </article>

            </section>

            <section id="revenue" className="mt-8 rounded-2xl bg-[#efefef]">
              <div className="flex items-center justify-between px-5 py-4">
                <h2 className="text-sm font-medium text-neutral-900">Recent Orders</h2>
                <button type="button" className="text-lg leading-none text-neutral-900">
                  ...
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

                {orders.map((order) => (
                  <div key={order.id} className="grid grid-cols-[1.1fr_1.3fr_1.4fr_1fr_1fr_1fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
                    <span className="text-neutral-700">{order.id}</span>
                    <span className="text-neutral-900">{order.customer}</span>
                    <span className="text-neutral-900">{order.product}</span>
                    <span className="text-neutral-700">{order.date}</span>
                    <span>
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${order.statusClass}`}>{order.status}</span>
                    </span>
                    <span className="font-bold text-neutral-900">{order.total}</span>
                  </div>
                ))}

                <div className="bg-[#6f7684] py-3 text-center text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-900">
                  View All Transactions
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

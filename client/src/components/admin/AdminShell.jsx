import { Link } from "react-router-dom";
import Layout from "../layout/Layout";

function SidebarItem({ label, to, active = false }) {
  return (
    <Link
      to={to}
      className={`flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition ${active ? "bg-[#8F0F11] text-white" : "text-white/95 hover:bg-white/10"}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-sm border border-current text-[11px]">▣</span>
      <span>{label}</span>
    </Link>
  );
}

export function AdminShell({ activeSection = "dashboard", children }) {
  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-10rem)] bg-[#f4f4f4] text-neutral-900">
        <aside className="hidden w-[210px] shrink-0 bg-[#ef2027] pb-12 lg:block">
          <div className="mt-2 space-y-1">
            <SidebarItem label="Dashboard" to="/admin/dashboard" active={activeSection === "dashboard"} />
            <SidebarItem label="Inventory" to="/admin/inventory" active={activeSection === "inventory"} />
            <SidebarItem label="Repair Orders" to="/admin/repair-orders" active={activeSection === "repair-orders"} />
            <SidebarItem label="Sales Log" to="/admin/sales-log" active={activeSection === "sales-log"} />
            <SidebarItem label="Customers" to="/admin/customers" active={activeSection === "customers"} />
            <SidebarItem label="Settings" to="/admin/dashboard" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </Layout>
  );
}

export default AdminShell;
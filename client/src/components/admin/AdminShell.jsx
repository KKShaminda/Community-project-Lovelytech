import { Link } from "react-router-dom";
import Layout from "../layout/Layout";
import { getCurrentUser } from "../../services/authServices";
import { LayoutDashboard, ClipboardList, Clipboard, Receipt, Users, FileCheck, ShoppingBag } from "lucide-react";

function SidebarItem({ label, to, active = false, icon: Icon }) {
  return (
    <Link
      to={to}
      className={`flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition ${active ? "bg-[#8F0F11] text-white" : "text-white/95 hover:bg-white/10"}`}
    >
  { Icon && <Icon size={18} />}
<span>{label}</span>
    </Link >
  );
}

export function AdminShell({ activeSection = "dashboard", children }) {
  const user = getCurrentUser();
  const userRole = (user?.role || "").toLowerCase();
  const isReceptionist = userRole === "receptionist";

  return (
    <Layout>
      <div className="flex min-h-[calc(100vh-10rem)] bg-[#f4f4f4] text-neutral-900">
        <aside className="hidden w-[210px] shrink-0 bg-[#ef2027] pb-12 lg:block">
          <div className="mt-2 space-y-1">
            {isReceptionist ? (
              <>
                <SidebarItem label="Dashboard" to="/receptionist/dashboard" active={activeSection === "dashboard"} icon={LayoutDashboard} />
                <SidebarItem label="Inventory" to="/receptionist/inventory" active={activeSection === "inventory"} icon={ClipboardList} />
                <SidebarItem label="Repair Orders" to="/receptionist/repair-orders" active={activeSection === "repair-orders"} icon={Clipboard} />
                <SidebarItem label="Sales Log" to="/receptionist/sales-log" active={activeSection === "sales-log"} icon={Receipt} />
              </>
            ) : (
              <>
                <SidebarItem label="Dashboard" to="/admin/dashboard" active={activeSection === "dashboard"} icon={LayoutDashboard} />
                <SidebarItem label="Inventory" to="/admin/inventory" active={activeSection === "inventory"} icon={ClipboardList} />
                <SidebarItem label="Repair Orders" to="/admin/repair-orders" active={activeSection === "repair-orders"} icon={Clipboard} />
                <SidebarItem label="Sales Log" to="/admin/sales-log" active={activeSection === "sales-log"} icon={Receipt} />
                <SidebarItem label="Payment Approval" to="/admin/payment-approval" active={activeSection === "payment-approval"} icon={FileCheck} />
                <SidebarItem label="Orders" to="/admin/orders" active={activeSection === "orders"} icon={ShoppingBag} />
                <SidebarItem label="Customers" to="/admin/customers" active={activeSection === "customers"} icon={Users} />
              </>
            )}
          </div>
        </aside>

        <main className="min-w-0 flex-1 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </Layout>
  );
}

export default AdminShell;
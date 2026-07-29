import { Link } from "react-router-dom";

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

export function AdminShell({ activeSection = "dashboard", children, action }) {
  return (
    <div className="min-h-screen bg-[#1f1f1f] text-neutral-900">
      <div className="flex min-h-screen w-full flex-col bg-white shadow-[0_18px_45px_rgba(0,0,0,0.25)]">
        <header className="border-b border-[#ff2020] bg-white/95 backdrop-blur-xl">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo />

            <div className="flex items-center gap-3 sm:gap-4">
              {action}
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef2027] text-sm font-semibold text-white">A</span>
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-neutral-600">Admin</p>
                  <p className="text-sm font-semibold text-neutral-900">Account</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex flex-1 bg-[#f4f4f4]">
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

        <footer className="border-t border-neutral-200 bg-white px-4 py-4 text-center text-xs text-neutral-500 sm:px-6 lg:px-8">
          Copyright © 2025. All Rights Reserved by LovelyTech
        </footer>
      </div>
    </div>
  );
}

export default AdminShell;
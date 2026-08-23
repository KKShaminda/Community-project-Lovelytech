import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  Wrench,
  Clock,
  ShoppingCart,
  LogOut,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { getCurrentUser, logoutUser, isAuthenticated } from "../../services/authServices";

export function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => getCurrentUser());

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    setUser(getCurrentUser());
  }, [navigate]);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  const userName = user?.name || user?.username || user?.email?.split("@")[0] || "Customer";
  const userEmail = user?.email || "customer@lovelytech.com";
  const userPhone = user?.phone || user?.contactNumber || "Not provided";

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 sm:p-8 text-white shadow-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff2020] text-2xl font-bold text-white shadow-md">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#ff4d4d]">
                      Customer Account
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                      <ShieldCheck className="h-3 w-3" /> Active
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {userName}!</h1>
                  <p className="mt-1 text-sm text-gray-300">{userEmail}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                >
                  Browse Shop
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl bg-[#ff2020] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-[#d91818]"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/orders"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#ff2020]/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3 text-[#ff2020] transition group-hover:scale-110">
                  <Package className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#ff2020]" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900">My Orders</h3>
                <p className="mt-1 text-xs text-gray-500">Track orders & view past receipts</p>
              </div>
            </Link>

            <Link
              to="/cart"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#ff2020]/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3 text-[#ff2020] transition group-hover:scale-110">
                  <ShoppingCart className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#ff2020]" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900">Shopping Cart</h3>
                <p className="mt-1 text-xs text-gray-500">Review selected tech products</p>
              </div>
            </Link>

            <Link
              to="/repair/book"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#ff2020]/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3 text-[#ff2020] transition group-hover:scale-110">
                  <Wrench className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#ff2020]" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900">Book a Repair</h3>
                <p className="mt-1 text-xs text-gray-500">Schedule hardware diagnostic & repair</p>
              </div>
            </Link>

            <Link
              to="/repair/track"
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-[#ff2020]/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-red-50 p-3 text-[#ff2020] transition group-hover:scale-110">
                  <Clock className="h-6 w-6" />
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-[#ff2020]" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold text-gray-900">Repair Status</h3>
                <p className="mt-1 text-xs text-gray-500">Live progress on active repairs</p>
              </div>
            </Link>
          </div>

          {/* Account Profile Details Section */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:col-span-2">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <User className="h-5 w-5 text-[#ff2020]" />
                  <h2 className="text-lg font-bold text-gray-900">Personal Information</h2>
                </div>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Full Name</label>
                  <p className="mt-1 text-sm font-medium text-gray-800">{userName}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Email Address</label>
                  <p className="mt-1 text-sm font-medium text-gray-800">{userEmail}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Contact Number</label>
                  <p className="mt-1 text-sm font-medium text-gray-800">{userPhone}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">Account Type</label>
                  <p className="mt-1 text-sm font-medium text-gray-800">Verified Customer</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Need Assistance?</h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  Our customer service & technician team is ready to help you with orders, returns, and repairs.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-2">
                <Link
                  to="/contact-us"
                  className="rounded-xl border border-gray-200 py-2.5 text-center text-sm font-semibold text-gray-700 hover:border-[#ff2020] hover:text-[#ff2020] transition"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default UserDashboard;

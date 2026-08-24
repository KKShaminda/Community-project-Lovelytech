import { Link } from "react-router-dom";

export function UserDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E4342F]">User Portal</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome back, customer</h1>
          </div>
          <Link to="/login" className="rounded-lg border border-[#E4342F] px-4 py-2 text-sm font-medium text-[#E4342F] hover:bg-[#E4342F] hover:text-white">
            Logout
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">My Orders</h2>
            <p className="mt-2 text-sm text-slate-600">Track your recent device repairs and purchases.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">Support Center</h2>
            <p className="mt-2 text-sm text-slate-600">Contact support and manage service requests.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;

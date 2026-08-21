import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../services/authServices";

export function ReceptionistDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-2xl bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E4342F]">Reception Desk</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Welcome, receptionist</h1>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-[#E4342F] px-4 py-2 text-sm font-medium text-[#E4342F] hover:bg-[#E4342F] hover:text-white transition"
          >
            Logout
          </button>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">Customer Check-ins</h2>
            <p className="mt-2 text-sm text-slate-600">Register arrivals and manage service queue status.</p>
          </div>
          <div className="rounded-xl border border-slate-200 p-6">
            <h2 className="text-xl font-semibold text-slate-800">Device Intake</h2>
            <p className="mt-2 text-sm text-slate-600">Capture customer devices and handoff details quickly.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;

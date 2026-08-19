import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  User,
  LogOut,
  Calendar,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  FileText,
  UserCheck,
} from "lucide-react";
import { getCurrentUser, logoutUser, updateUserProfile } from "../../services/authServices";
import { getMyRepairs } from "../../services/repairServices";

const STATUS_META = {
  pending: { label: "Pending Review", tone: "bg-yellow-100 text-yellow-700 border-yellow-200" },
  "in-progress": { label: "In Diagnosis/Repair", tone: "bg-blue-100 text-blue-700 border-blue-200" },
  ready: { label: "Ready for Pickup", tone: "bg-green-100 text-green-700 border-green-200" },
  completed: { label: "Completed", tone: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", tone: "bg-red-100 text-red-700 border-red-200" },
};

export function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getCurrentUser());
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileErr, setProfileErr] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(user?.fullname || "");
  const [phoneInput, setPhoneInput] = useState(user?.phone || "");

  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getMyRepairs();
      setRepairs(data.repairs || []);
    } catch (err) {
      setError(err.message || "Failed to load your repairs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    loadDashboardData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileErr("");

    try {
      const res = await updateUserProfile({
        fullname: nameInput,
        phone: phoneInput,
      });
      setUser(res.user);
      setIsEditing(false);
      setProfileMsg("Profile updated successfully!");
    } catch (err) {
      setProfileErr(err.message || "Failed to update profile.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4342F] text-white font-bold text-lg">LT</span>
            <span className="text-xl font-bold tracking-tight text-slate-900">Lovely Tech Portal</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_2.5fr]">
          
          {/* Left Column: User Profile Panel */}
          <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-700">
                <User size={40} />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-850">{user?.fullname}</h2>
              <p className="text-sm font-medium text-[#E4342F] uppercase tracking-wider">{user?.role || "Customer"}</p>
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6">
              {!isEditing ? (
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Email Address</span>
                    <span className="font-semibold text-slate-700">{user?.email}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 uppercase">Contact Number</span>
                    <span className="font-semibold text-slate-700">{user?.phone || "Not set"}</span>
                  </div>
                  
                  {profileMsg && <p className="text-xs text-green-600 font-medium">{profileMsg}</p>}

                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                  >
                    Edit Profile Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                    <input
                      required
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E4342F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
                    <input
                      required
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#E4342F]"
                    />
                  </div>

                  {profileErr && <p className="text-xs text-red-500 font-medium">{profileErr}</p>}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 rounded-xl bg-[#E4342F] py-2 text-xs font-bold text-white hover:bg-[#c92923]"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="mt-8 border-t border-slate-100 pt-6 space-y-3">
              <Link
                to="/repair/book"
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#ff4c4f] to-[#e01c23] py-3 text-sm font-bold text-white shadow-md hover:shadow-lg transition duration-200"
              >
                <Wrench size={16} />
                Book New Repair
              </Link>
            </div>
          </aside>

          {/* Right Column: Active Devices / Repairs */}
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">My Repair Bookings</h2>
                <button
                  onClick={loadDashboardData}
                  className="text-xs font-semibold text-[#E4342F] hover:underline"
                >
                  Refresh Live Status
                </button>
              </div>

              {error && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              {loading ? (
                <div className="py-16 text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#E4342F] border-t-transparent" />
                  <p className="mt-4 text-sm text-slate-500">Checking status details from database...</p>
                </div>
              ) : repairs.length === 0 ? (
                <div className="py-16 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                    <FileText size={28} />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-slate-800">No repairs booked yet</h3>
                  <p className="mt-1 text-sm text-slate-500">If you book a repair, it will display here automatically.</p>
                  <Link
                    to="/repair/book"
                    className="mt-6 inline-block rounded-xl bg-[#E4342F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#c92923]"
                  >
                    Submit Booking Request
                  </Link>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {repairs.map((repair) => {
                    const meta = STATUS_META[repair.status] || STATUS_META.pending;
                    return (
                      <div
                        key={repair._id || repair.id}
                        className="rounded-2xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-slate-50/80"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <span className="rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-[#E4342F]">
                              {repair.trackingId}
                            </span>
                            <h3 className="mt-2 text-lg font-bold text-slate-800">
                              {repair.brand} {repair.model}
                            </h3>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${meta.tone}`}>
                            {meta.label}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-3 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock size={16} className="text-slate-400" />
                            <span>Status: {meta.label}</span>
                          </div>
                          {repair.technician && repair.technician !== "Unassigned" && (
                            <div className="flex items-center gap-2">
                              <UserCheck size={16} className="text-slate-400" />
                              <span>Technician: {repair.technician}</span>
                            </div>
                          )}
                          {repair.estimatedCost > 0 && (
                            <div className="flex items-center gap-2">
                              <DollarSign size={16} className="text-slate-400" />
                              <span>Est. Cost: LKR {Number(repair.estimatedCost).toLocaleString()}</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                          <AlertCircle size={16} className="text-slate-400 shrink-0" />
                          <p className="truncate"><span className="font-semibold text-slate-700">Issue:</span> {repair.issue}</p>
                        </div>

                        {repair.status !== "cancelled" && (
                          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                            <Link
                              to={`/repair/track`}
                              className="text-xs font-bold text-[#E4342F] hover:underline"
                            >
                              Track Full Timeline →
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
    </div>
  );
}

export default UserDashboard;
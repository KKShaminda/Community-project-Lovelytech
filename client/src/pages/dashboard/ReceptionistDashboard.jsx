import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  User,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Loader2,
  X,
  Phone,
  AlertTriangle,
  Mail,
  MapPin,
  ClipboardList,
} from "lucide-react";
import { getCurrentUser, logoutUser } from "../../services/authServices";
import { getRepairs, createRepair, updateRepair } from "../../services/repairServices";

const DEVICE_LABELS = {
  "smart-phone": "Smart Phone",
  tablet: "Tablet",
  android: "Android",
  laptop: "Laptop",
  iphone: "iPhone",
};

const STATUS_META = {
  pending: { label: "Pending Review", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  "in-progress": { label: "In Diagnosis/Repair", className: "bg-blue-100 text-blue-800 border-blue-200" },
  ready: { label: "Ready for Pickup", className: "bg-green-100 text-green-800 border-green-200" },
  completed: { label: "Completed/Picked Up", className: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800 border-red-200" },
};

const defaultForm = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  deviceType: "smart-phone",
  brand: "",
  model: "",
  imei: "",
  issue: "",
};

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modal States
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [newTrackingId, setNewTrackingId] = useState("");
  const [formError, setFormError] = useState("");

  // Quick action update states
  const [updatingId, setUpdatingId] = useState("");

  const loadRepairs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getRepairs();
      setRepairs(res.repairs || []);
    } catch (err) {
      setError(err.message || "Failed to load repair queue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRepairs();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      navigate("/login");
    }
  };

  const handleIntakeSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    setNewTrackingId("");

    try {
      const res = await createRepair(form);
      setNewTrackingId(res.trackingId);
      setForm(defaultForm);
      loadRepairs();
    } catch (err) {
      setFormError(err.message || "Intake submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateRepair(id, { status: newStatus });
      // Update local state directly for responsive UI
      setRepairs((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingId("");
    }
  };

  // Stats Counters
  const stats = useMemo(() => {
    const pending = repairs.filter((r) => r.status === "pending").length;
    const active = repairs.filter((r) => r.status === "in-progress").length;
    const ready = repairs.filter((r) => r.status === "ready").length;
    return { pending, active, ready };
  }, [repairs]);

  // Filtered/Searched Repairs list
  const filteredRepairs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return repairs.filter((r) => {
      const matchesSearch =
        q === "" ||
        (r.trackingId || "").toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.customerPhone || "").toLowerCase().includes(q) ||
        (r.brand || "").toLowerCase().includes(q) ||
        (r.model || "").toLowerCase().includes(q);

      const matchesStatus = statusFilter === "" || r.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [repairs, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E4342F] text-white font-bold text-lg">LT</span>
            <div>
              <p className="text-xs font-bold text-[#E4342F] uppercase tracking-[0.2em] leading-none">Reception Desk</p>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">Welcome, {currentUser?.fullname || "Receptionist"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/sales-log"
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              Sales Log
            </Link>
            <Link
              to="/admin/repair-orders"
              className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-[#E4342F]"
            >
              Repair Registry
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main dashboard body */}
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Stats Counter Section */}
        <section className="grid gap-5 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Awaiting Diagnosis</p>
            <p className="mt-2 text-3xl font-extrabold text-yellow-600">{stats.pending}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Undergoing Repair</p>
            <p className="mt-2 text-3xl font-extrabold text-blue-600">{stats.active}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">Ready For Pickup</p>
            <p className="mt-2 text-3xl font-extrabold text-green-600">{stats.ready}</p>
          </article>
        </section>

        {/* Action Panel: Search + Filters + New Intake button */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-wrap gap-3">
              {/* Search */}
              <div className="relative min-w-[280px] flex-1">
                <Search size={18} className="absolute left-4 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer name, phone, or tracking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-[#E4342F] focus:ring-1 focus:ring-red-150 bg-slate-50/50"
                />
              </div>
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-slate-50/50 focus:border-[#E4342F]"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending Review</option>
                <option value="in-progress">In Diagnosis/Repair</option>
                <option value="ready">Ready for Pickup</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Book Intake Button */}
            <button
              onClick={() => {
                setForm(defaultForm);
                setNewTrackingId("");
                setFormError("");
                setIntakeModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#E4342F] px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-[#c92923] hover:shadow-lg transition duration-200"
            >
              <Plus size={18} />
              New Intake
            </button>
          </div>

          {/* Repairs List */}
          <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {error && (
              <div className="border-b border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="py-16 text-center">
                <Loader2 size={32} className="mx-auto animate-spin text-[#E4342F]" />
                <p className="mt-4 text-sm text-slate-500">Retrieving repair queue...</p>
              </div>
            ) : filteredRepairs.length === 0 ? (
              <div className="py-16 text-center">
                <ClipboardList size={40} className="mx-auto text-slate-300" />
                <p className="mt-4 text-sm text-slate-500">No active repair request matches your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-6 py-4">Tracking ID</th>
                      <th className="px-6 py-4">Customer Details</th>
                      <th className="px-6 py-4">Device Info</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Quick Update</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRepairs.map((repair) => {
                      const meta = STATUS_META[repair.status] || STATUS_META.pending;
                      const isUpdating = updatingId === repair._id;
                      return (
                        <tr key={repair._id || repair.id} className="hover:bg-slate-50/50">
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="rounded bg-red-50 border border-red-150 px-2.5 py-1 text-xs font-semibold text-[#E4342F]">
                              {repair.trackingId}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-900">{repair.customerName}</p>
                            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                              <Phone size={12} /> {repair.customerPhone}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-slate-800">
                              {repair.brand} {repair.model}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {DEVICE_LABELS[repair.deviceType] || repair.deviceType} {repair.imei ? `• IMEI: ${repair.imei}` : ""}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {isUpdating ? (
                              <Loader2 size={16} className="animate-spin text-[#E4342F]" />
                            ) : (
                              <select
                                value={repair.status}
                                onChange={(e) => handleStatusChange(repair._id, e.target.value)}
                                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:border-[#E4342F] bg-white cursor-pointer"
                              >
                                <option value="pending">Awaiting Review</option>
                                <option value="in-progress">Under Repair</option>
                                <option value="ready">Ready for Pickup</option>
                                <option value="completed">Completed / Collected</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Device Intake Modal */}
      {intakeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIntakeModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench size={24} className="text-[#E4342F]" />
              New Device Intake Check-in
            </h2>
            <p className="text-sm text-slate-500 mt-1">Submit this intake form to register a new repair ticket.</p>

            {formError && (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertTriangle size={18} />
                {formError}
              </div>
            )}

            {newTrackingId ? (
              <div className="mt-6 text-center p-8 bg-slate-50 border border-slate-100 rounded-2xl">
                <CheckCircle size={48} className="mx-auto text-green-500" />
                <h3 className="text-lg font-bold text-slate-800 mt-4">Intake Form Registered Successfully</h3>
                <p className="text-sm text-slate-500 mt-1">A unique tracking code has been generated:</p>
                <div className="mt-4 inline-block rounded-xl border border-dashed border-[#E4342F] bg-red-50/50 px-8 py-3.5">
                  <span className="text-2xl font-mono font-extrabold tracking-widest text-[#E4342F]">
                    {newTrackingId}
                  </span>
                </div>
                <p className="mt-4 text-xs text-slate-400">Provide this tracking ID to the customer for status lookups.</p>
                <div className="mt-6">
                  <button
                    onClick={() => {
                      setNewTrackingId("");
                      setForm(defaultForm);
                    }}
                    className="rounded-xl bg-[#E4342F] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#c92923]"
                  >
                    Register Another Device
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleIntakeSubmit} className="mt-6 space-y-5">
                {/* Customer Contact */}
                <fieldset className="space-y-4">
                  <legend className="text-sm font-bold text-slate-400 uppercase tracking-wider">1. Customer Information</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Customer Full Name</span>
                      <input
                        required
                        type="text"
                        value={form.customerName}
                        onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</span>
                      <input
                        required
                        type="text"
                        value={form.customerPhone}
                        onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Email Address</span>
                      <input
                        required
                        type="email"
                        value={form.customerEmail}
                        onChange={(e) => setForm((prev) => ({ ...prev, customerEmail: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Home Address</span>
                      <input
                        type="text"
                        value={form.customerAddress}
                        onChange={(e) => setForm((prev) => ({ ...prev, customerAddress: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                  </div>
                </fieldset>

                {/* Device Info */}
                <fieldset className="space-y-4 pt-2 border-t border-slate-100">
                  <legend className="text-sm font-bold text-slate-400 uppercase tracking-wider">2. Device Specifications</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Device Category</span>
                      <select
                        value={form.deviceType}
                        onChange={(e) => setForm((prev) => ({ ...prev, deviceType: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      >
                        {Object.entries(DEVICE_LABELS).map(([key, val]) => (
                          <option key={key} value={key}>{val}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Brand Name</span>
                      <input
                        required
                        type="text"
                        placeholder="Ex: Apple, Samsung, Asus"
                        value={form.brand}
                        onChange={(e) => setForm((prev) => ({ ...prev, brand: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">Model Name</span>
                      <input
                        required
                        type="text"
                        placeholder="Ex: iPhone 15 Pro, ROG Phone 8"
                        value={form.model}
                        onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                    <label>
                      <span className="block text-xs font-semibold text-slate-600 mb-1">IMEI or Serial No (Optional)</span>
                      <input
                        type="text"
                        value={form.imei}
                        onChange={(e) => setForm((prev) => ({ ...prev, imei: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F]"
                      />
                    </label>
                  </div>
                  <label className="block">
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Defect / Symptom Description</span>
                    <textarea
                      required
                      rows={3}
                      placeholder="Ex: Device does not boot up. Broken screen glass. Water damage diagnostics requested."
                      value={form.issue}
                      onChange={(e) => setForm((prev) => ({ ...prev, issue: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#E4342F] resize-none"
                    />
                  </label>
                </fieldset>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIntakeModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-[#E4342F] px-6 py-3 text-sm font-bold text-white hover:bg-[#c92923] disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Register Intake
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReceptionistDashboard;
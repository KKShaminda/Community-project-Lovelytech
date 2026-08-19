import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import { CheckIcon, SearchIcon, XCircleIcon, Loader2Icon } from "lucide-react";
import { trackRepair } from "../../services/repairServices";

const STATUS_STEPS = [
  { key: "pending", label: "Request Submitted", detail: "Your repair request has been received." },
  { key: "in-progress", label: "Diagnosing & Repair", detail: "Technician is working on your device." },
  { key: "ready", label: "Ready for Pickup", detail: "Your device is repaired and ready to collect." },
  { key: "completed", label: "Completed", detail: "Repair completed. Thank you!" },
];

const STATUS_ORDER = ["pending", "in-progress", "ready", "completed"];

const isStepDone = (stepKey, currentStatus) => {
  return STATUS_ORDER.indexOf(stepKey) <= STATUS_ORDER.indexOf(currentStatus);
};

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABEL = {
  pending: "Pending",
  "in-progress": "In Progress",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function RepairTrackingPage() {
  const [inputId, setInputId] = useState("");
  const [repair, setRepair] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async (e) => {
    e?.preventDefault();
    const id = inputId.trim();
    if (!id) return;
    setLoading(true);
    setError("");
    setRepair(null);

    try {
      const data = await trackRepair(id);
      setRepair(data.repair);
    } catch (err) {
      setError(err.message || "Repair not found. Please check your tracking ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <main className="min-h-screen bg-white">

        {/* Hero */}
        <section className="bg-[#3E0F0F] py-16 text-center">
          <h1 className="text-5xl font-bold text-white">
            Track <span className="text-[#EC1C24]">Repair</span>
          </h1>
          <p className="mt-3 text-red-200 text-lg">Enter your tracking ID to get a live status update.</p>
        </section>

        <section className="max-w-3xl mx-auto px-5 py-10">

          {/* Search box */}
          <form onSubmit={handleTrack} className="flex gap-3">
            <input
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className="flex-1 rounded-full border border-neutral-300 px-6 py-3 text-sm outline-none focus:border-[#EC1C24] focus:ring-2 focus:ring-red-100"
              placeholder="Enter Tracking ID e.g. LT-2026-123456"
            />
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#EC1C24] text-white px-8 rounded-full font-semibold disabled:opacity-60"
            >
              {loading ? <Loader2Icon size={18} className="animate-spin" /> : <SearchIcon size={18} />}
              Track
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <XCircleIcon size={18} />
              {error}
            </div>
          )}

          {/* Results */}
          {repair && (
            <div className="mt-8 rounded-3xl shadow-md border border-neutral-200 overflow-hidden">

              {/* Header */}
              <div className="bg-[#3E0F0F] px-8 py-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-red-300">Tracking ID</p>
                  <p className="text-2xl font-bold text-white mt-1">{repair.trackingId}</p>
                </div>
                {repair.status === "cancelled" ? (
                  <span className="rounded-full bg-red-100 text-red-700 px-4 py-2 text-sm font-semibold">Cancelled</span>
                ) : (
                  <span className={`rounded-full px-4 py-2 text-sm font-semibold ${STATUS_BADGE[repair.status] || "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABEL[repair.status] || repair.status}
                  </span>
                )}
              </div>

              {/* Device Info */}
              <div className="px-8 py-6 grid gap-3 sm:grid-cols-2 text-sm text-neutral-700 border-b border-neutral-200">
                <p><span className="font-semibold text-neutral-900">Device:</span> {repair.brand} {repair.model}</p>
                <p><span className="font-semibold text-neutral-900">Type:</span> {repair.deviceType}</p>
                <p className="sm:col-span-2"><span className="font-semibold text-neutral-900">Issue:</span> {repair.issue}</p>
                {repair.technician && repair.technician !== "Unassigned" && (
                  <p><span className="font-semibold text-neutral-900">Technician:</span> {repair.technician}</p>
                )}
                {repair.estimatedCost > 0 && (
                  <p><span className="font-semibold text-neutral-900">Est. Cost:</span> LKR {Number(repair.estimatedCost).toLocaleString()}</p>
                )}
              </div>

              {/* Progress Steps */}
              {repair.status !== "cancelled" && (
                <div className="px-8 py-6">
                  <p className="text-sm font-semibold text-neutral-900 mb-6">Repair Progress</p>
                  <div className="space-y-6">
                    {STATUS_STEPS.map((step) => {
                      const done = isStepDone(step.key, repair.status);
                      const active = step.key === repair.status;
                      return (
                        <div key={step.key} className="flex gap-4 items-start">
                          <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center text-white text-sm font-bold
                            ${done ? "bg-[#EC1C24]" : "bg-neutral-200"}`}>
                            {done ? <CheckIcon size={16} /> : ""}
                          </div>
                          <div>
                            <p className={`font-semibold ${done ? "text-neutral-900" : "text-neutral-400"}`}>{step.label}</p>
                            <p className={`text-sm ${done ? "text-neutral-600" : "text-neutral-300"}`}>{step.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

        </section>
      </main>
    </Layout>
  );
}

export default RepairTrackingPage;
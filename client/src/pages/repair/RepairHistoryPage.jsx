import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Wrench,
  DollarSign,
  AlertCircle,
  Loader2,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import { getMyRepairs } from "../../services/repairServices";
import { isAuthenticated } from "../../services/authServices";

const badgeStyles = {
  pending: "bg-yellow-100 text-yellow-700",
  "in-progress": "bg-blue-100 text-blue-700",
  ready: "bg-green-100 text-green-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const statusLabels = {
  pending: "Pending Review",
  "in-progress": "In Progress",
  ready: "Ready for Pickup",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

const getInitials = (brand, model) => {
  const name = `${brand} ${model}`.trim();
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase() || "EQ";
};

export function RepairHistoryPage() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isAuth = isAuthenticated();

  useEffect(() => {
    if (!isAuth) return;

    const fetchRepairs = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getMyRepairs();
        setRepairs(data.repairs || []);
      } catch (err) {
        setError(err.message || "Failed to fetch repair history.");
      } finally {
        setLoading(false);
      }
    };

    fetchRepairs();
  }, [isAuth]);

  return (
    <Layout>
      <main className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-14 min-h-[70vh]">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[#EC1C24]">
                Repair History
              </h1>
              <p className="mt-2 text-lg text-neutral-500">
                All your past repair requests and repair details.
              </p>
            </div>

            {isAuth && !loading && (
              <span className="rounded-xl bg-[#EC1C24] px-4 py-2 text-sm font-semibold text-white">
                {repairs.length} Repairs
              </span>
            )}
          </div>

          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-neutral-500">Repair</span>
            <ChevronRight className="h-4 w-4 text-neutral-400" />
            <span className="font-semibold">Repair History</span>
          </div>
        </div>

        {/* Content */}
        {!isAuth ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-300 p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-xl font-bold text-neutral-800">Authentication Required</h2>
            <p className="mt-2 text-neutral-500 max-w-md mx-auto">
              Please sign in to view your complete repair history connected to your email address.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                to="/login"
                className="rounded-xl bg-[#EC1C24] px-6 py-3 font-semibold text-white hover:bg-[#cf1414]"
              >
                Sign In
              </Link>
              <Link
                to="/repair/track"
                className="rounded-xl border border-neutral-350 px-6 py-3 font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                Track Single Repair
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="mt-20 text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#EC1C24]" />
            <p className="mt-4 text-sm text-neutral-500">Retrieving repair requests...</p>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-xl bg-red-50 border border-red-200 p-5 text-sm text-red-700 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : repairs.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-neutral-350 p-12 text-center">
            <Wrench className="mx-auto h-12 w-12 text-neutral-400" />
            <h2 className="mt-4 text-xl font-bold text-neutral-850">No Repair Records Found</h2>
            <p className="mt-2 text-neutral-500 max-w-md mx-auto">
              We couldn't find any repair tickets registered under your account email.
            </p>
            <Link
              to="/repair/book"
              className="mt-6 inline-block rounded-xl bg-[#EC1C24] px-6 py-3 font-semibold text-white hover:bg-[#cf1414]"
            >
              Book New Repair
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-7">
            {repairs.map((repair) => {
              const statusClass = badgeStyles[repair.status] || "bg-gray-150 text-gray-700";
              const statusLabel = statusLabels[repair.status] || repair.status;

              return (
                <div
                  key={repair._id || repair.id}
                  className="flex flex-col gap-6 rounded-2xl border-t-4 border-[#EC1C24] bg-white p-7 shadow-md transition-all duration-300 md:flex-row md:items-center"
                >
                  {/* Avatar */}
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black text-xl font-bold text-white">
                    {getInitials(repair.brand, repair.model)}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-neutral-800">
                        {repair.brand} {repair.model}
                      </h2>

                      <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-[#EC1C24]">
                        {repair.trackingId}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 text-[15px] text-[#777b93] md:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <CalendarDays className="h-5 w-5 text-[#6e7788]" />
                        Created: {formatDate(repair.createdAt)}
                      </div>

                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-[#6e7788]" />
                        Device Type: {repair.deviceType}
                      </div>

                      <div className="flex items-center gap-3">
                        <Wrench className="h-5 w-5 text-[#6e7788]" />
                        Issue: {repair.issue}
                      </div>

                      {repair.estimatedCost > 0 && (
                        <div className="flex items-center gap-3">
                          <DollarSign className="h-5 w-5 text-[#6e7788]" />
                          Cost: LKR {Number(repair.estimatedCost).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {isAuth && (
          <div className="mt-14 rounded-3xl bg-[#3E0F0F] p-10 text-center">
            <h2 className="text-3xl font-bold text-white">
              Need Another Repair?
            </h2>
            <p className="mt-3 text-red-100">
              Book a new repair request and track its progress online.
            </p>
            <Link
              to="/repair/book"
              className="mt-6 inline-flex rounded-lg bg-[#EC1C24] px-7 py-3 font-semibold text-white transition hover:bg-[#cf1414]"
            >
              Book New Repair
            </Link>
          </div>
        )}
      </main>
    </Layout>
  );
}

export default RepairHistoryPage;
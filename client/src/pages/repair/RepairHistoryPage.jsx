import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  User,
  Clock3,
  Wrench,
  DollarSign,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import { repairs as mockRepairs, statusMeta, currency } from "../../data/repairData";
import { getRepairs } from "../../services/repairServices";

const badgeStyles = {
  slate: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-700",
  amber: "bg-yellow-100 text-yellow-700",
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-green-100 text-green-700",
  red: "bg-red-100 text-red-700",
};

const formatDate = (date) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (isNaN(parsed.getTime())) return String(date);
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getInitials = (device = "Repair") =>
  device
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export function RepairHistoryPage() {
  const [repairList, setRepairList] = useState(mockRepairs);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getRepairs();
        const data = res?.data || res;
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.trackingId || item._id,
            trackingId: item.trackingId || item._id,
            device: item.device || `${item.brand || ""} ${item.model || ""}`.trim() || "Device",
            brand: item.brand || "N/A",
            issue: item.issue,
            status: item.status || "received",
            createdAt: item.createdAt || item.submitted || new Date().toISOString(),
            updatedAt: item.updatedAt || new Date().toISOString(),
            estimate: item.amount || item.estimate || 0,
            technician: item.technician || "Unassigned",
            eta: item.estimatedCompletion || item.eta || "Pending",
          }));
          setRepairList(mapped);
        }
      } catch (err) {
        console.error("Error loading repair history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <Layout>
      <main className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-14">
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

            <span className="rounded-xl bg-[#EC1C24] px-4 py-2 text-sm font-semibold text-white">
              {repairList.length} Repairs
            </span>
          </div>

          <div className="hidden items-center gap-2 text-sm sm:flex">
            <span className="text-neutral-500">Repair</span>

            <ChevronRight className="h-4 w-4 text-neutral-400" />

            <span className="font-semibold">
              Repair History
            </span>
          </div>
        </div>

        {/* Cards */}

        <div className="mt-10 space-y-7">
          {repairList.map((repair) => {
            const meta = statusMeta[repair.status] || { label: repair.status || "Received", tone: "blue" };
            const trackingId = repair.trackingId || repair.id;

            return (
              <Link
                key={repair.id}
                to={`/repair/track?id=${encodeURIComponent(trackingId)}`}
                state={{ trackingId }}
                className="group flex flex-col gap-6 rounded-2xl border-t-4 border-[#EC1C24] bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:flex-row md:items-center"
              >
                {/* Avatar */}

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-black text-xl font-bold text-white">
                  {getInitials(repair.device)}
                </div>

                {/* Details */}

                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold text-[#444]">
                      {repair.device}
                    </h2>

                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-[#EC1C24]">
                      {trackingId}
                    </span>

                    <span
                      className={`rounded-full px-3 py-1 text-sm font-medium ${badgeStyles[meta.tone]}`}
                    >
                      {meta.label}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 text-[15px] text-[#777b93] md:grid-cols-2">
                    <div className="flex items-center gap-3">
                      <CalendarDays className="h-5 w-5 text-[#6e7788]" />
                      Created : {formatDate(repair.createdAt)}
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock3 className="h-5 w-5 text-[#6e7788]" />
                      ETA : {formatDate(repair.eta)}
                    </div>

                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-[#6e7788]" />
                      Issue : {repair.issue}
                    </div>

                    <div className="flex items-center gap-3">
                      <Wrench className="h-5 w-5 text-[#6e7788]" />
                      Brand : {repair.brand}
                    </div>
                  </div>
                </div>

                {/* Action CTA & Arrow */}

                <div className="flex items-center gap-2 text-sm font-semibold text-[#EC1C24] transition group-hover:translate-x-1">
                  <span className="hidden md:inline">Track Progress</span>
                  <ChevronRight className="h-6 w-6 text-[#EC1C24]" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* CTA */}

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
      </main>
    </Layout>
  );
}
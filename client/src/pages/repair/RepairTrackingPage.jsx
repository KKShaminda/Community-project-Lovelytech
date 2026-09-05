import React, { useState, useEffect } from "react";
import { useSearchParams, useParams, useLocation, Link } from "react-router-dom";
import {
    CalendarDays,
    Check,
    ChevronRight,
    CircleAlert,
    ClipboardCheck,
    Info,
    Search,
    Loader2,
    Wrench,
    Plus,
} from "lucide-react";

import Layout from "../../components/layout/Layout";
import {
    TRACKING_STEPS,
    REPAIR_UPDATES,
} from "../../data/repairData";
import { getRepairByTrackingId } from "../../services/repairServices";

export function RepairTrackingPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const params = useParams();
    const location = useLocation();

    const initialTrackingId =
        searchParams.get("id") ||
        searchParams.get("trackingId") ||
        params.id ||
        location.state?.trackingId ||
        "";

    const [query, setQuery] = useState(initialTrackingId);
    const [repair, setRepair] = useState(null);
    const [trackingSteps, setTrackingSteps] = useState(TRACKING_STEPS);
    const [repairUpdates, setRepairUpdates] = useState(REPAIR_UPDATES);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const fetchRepair = async (searchQuery) => {
        if (!searchQuery || !searchQuery.trim()) {
            setRepair(null);
            setError(false);
            setHasSearched(false);
            return;
        }
        const cleanQuery = searchQuery.trim();
        setLoading(true);
        setHasSearched(true);
        try {
            const res = await getRepairByTrackingId(cleanQuery);
            const data = res?.data || res;
            if (data && (data._id || data.id || data.trackingId)) {
                setRepair({
                    id: data._id || data.id,
                    trackingId: data.trackingId || data._id || cleanQuery,
                    deviceName: data.device || data.deviceName || `${data.brand || ""} ${data.model || ""}`.trim() || "Device Repair",
                    brandModel: `${data.brand || ""} ${data.model || ""}`.trim() || data.device || "Electronic Device",
                    submitted: data.submitted || data.createdAt ? new Date(data.createdAt || data.submitted).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Recently",
                    estimatedCompletion: data.estimatedCompletion || data.eta || "Pending",
                    issue: data.issue || "General Diagnosis",
                });
                if (data.trackingSteps && data.trackingSteps.length > 0) {
                    setTrackingSteps(data.trackingSteps);
                } else {
                    setTrackingSteps(TRACKING_STEPS);
                }
                if (data.updates && data.updates.length > 0) {
                    setRepairUpdates(data.updates);
                } else {
                    setRepairUpdates(REPAIR_UPDATES);
                }
                setError(false);
            } else {
                setRepair(null);
                setError(true);
            }
        } catch (err) {
            console.error("Error searching repair:", err);
            setRepair(null);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const targetId =
            searchParams.get("id") ||
            searchParams.get("trackingId") ||
            params.id ||
            location.state?.trackingId ||
            "";

        if (targetId) {
            setQuery(targetId);
            fetchRepair(targetId);
        }
    }, [searchParams, params.id, location.state]);

    const handleTrack = (e) => {
        e.preventDefault();
        if (query.trim()) {
            setSearchParams({ id: query.trim() });
            fetchRepair(query.trim());
        }
    };

    return (
        <Layout>
            <main className="min-h-screen bg-white">
                {/* Header */}
                <section className="bg-[#3E0F0F] py-16">
                    <div className="mx-auto max-w-[1280px] px-5 sm:px-8">
                        <h1 className="text-4xl font-bold text-white sm:text-5xl">
                            Repair
                            <span className="text-[#EC1C24]"> Tracking</span>
                        </h1>
                        <p className="mt-4 text-lg text-red-100">
                            Track your repair progress in real-time
                        </p>
                        <div className="mt-5 flex items-center gap-2 text-sm text-red-100">
                            <span>Repair</span>
                            <ChevronRight size={16} />
                            <span className="font-semibold text-white">Repair Tracking</span>
                        </div>
                    </div>
                </section>

                {/* Search Section */}
                <section className="mx-auto max-w-[1080px] px-5 py-10">
                    <form
                        onSubmit={handleTrack}
                        className="rounded-2xl bg-[#fbdfe1] p-5"
                    >
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Enter your repair tracking ID (e.g. PR124596 or RPR-...)"
                                    className="w-full rounded-xl bg-white px-5 py-4 outline-none focus:ring-2 focus:ring-[#EC1C24]"
                                />
                                <Search className="absolute right-5 top-4 text-gray-400" />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#EC1C24] px-8 py-3 font-bold text-white transition hover:bg-[#cf1414] disabled:opacity-60 cursor-pointer"
                            >
                                {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                                <span>Track Repair</span>
                            </button>
                        </div>

                        <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <CircleAlert size={18} className="text-[#EC1C24] shrink-0" />
                            Your Tracking ID was generated and provided upon booking your repair request.
                        </p>
                    </form>

                    {error && (
                        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">
                            <div className="flex items-center gap-3">
                                <CircleAlert className="h-6 w-6 text-red-600 shrink-0" />
                                <div>
                                    <h4 className="font-bold text-red-800">Repair Tracking ID Not Found</h4>
                                    <p className="mt-1 text-sm text-red-600">
                                        We couldn't find any repair record matching "<span className="font-mono font-bold">{query}</span>". Please verify the tracking code or book a new repair.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Loading State */}
                {loading && (
                    <div className="mx-auto max-w-[1080px] px-5 py-12 text-center">
                        <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#EC1C24]" />
                        <p className="mt-4 text-base font-semibold text-neutral-600">Fetching repair details...</p>
                    </div>
                )}

                {/* Details & Timeline */}
                {!loading && repair && (
                    <>
                        <section className="mx-auto max-w-[1080px] px-5 pb-10">
                            <div className="grid gap-10 rounded-2xl border-t-4 border-[#EC1C24] bg-white p-8 shadow-md lg:grid-cols-2">
                                {/* Details */}
                                <div>
                                    <div className="flex items-center gap-4">
                                        <h2 className="text-2xl font-bold">Repair Details</h2>
                                        <span className="rounded-full bg-red-100 px-3 py-1 font-mono text-sm font-bold text-[#EC1C24]">
                                            {repair.trackingId}
                                        </span>
                                    </div>

                                    <h3 className="mt-8 text-xl font-semibold text-neutral-900">
                                        {repair.deviceName}
                                    </h3>

                                    <ul className="mt-5 space-y-4 text-gray-600">
                                        <li className="flex items-center gap-3">
                                            <CalendarDays className="h-5 w-5 text-[#EC1C24]" />
                                            <span><strong>Submitted:</strong> {repair.submitted}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <ClipboardCheck className="h-5 w-5 text-[#EC1C24]" />
                                            <span><strong>Estimated Completion:</strong> {repair.estimatedCompletion}</span>
                                        </li>
                                        <li className="flex items-center gap-3">
                                            <Info className="h-5 w-5 text-[#EC1C24]" />
                                            <span><strong>Issue:</strong> {repair.issue}</span>
                                        </li>
                                    </ul>
                                </div>

                                {/* Timeline */}
                                <div>
                                    <h3 className="mb-6 text-xl font-bold text-neutral-900">Repair Progress</h3>
                                    {trackingSteps.map((step, index) => (
                                        <div
                                            key={step.label || index}
                                            className="relative flex gap-5 pb-8"
                                        >
                                            {index !== trackingSteps.length - 1 && (
                                                <span className="absolute left-3.5 top-7 h-full w-[2px] bg-gray-200" />
                                            )}

                                            <div
                                                className={`z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                                                    step.status === "complete"
                                                        ? "bg-green-500 text-white"
                                                        : "bg-gray-200 text-gray-500"
                                                }`}
                                            >
                                                {step.status === "complete" ? (
                                                    <Check size={16} />
                                                ) : (
                                                    <span>{index + 1}</span>
                                                )}
                                            </div>

                                            <div>
                                                <h4 className="font-semibold text-neutral-900">{step.label}</h4>
                                                <p className="text-sm text-gray-500">{step.detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>

                        {/* Updates */}
                        {repairUpdates && repairUpdates.length > 0 && (
                            <section className="mx-auto max-w-[1080px] px-5 pb-16">
                                <h2 className="mb-6 text-2xl font-bold">Repair Updates Log</h2>
                                <div className="space-y-5">
                                    {repairUpdates.map((update, index) => (
                                        <div
                                            key={update.id || index}
                                            className="rounded-2xl border-t-4 border-[#EC1C24] bg-white p-6 shadow-md"
                                        >
                                            <h3 className="text-lg font-semibold text-neutral-900">{update.title}</h3>
                                            <p className="mt-2 text-gray-600">{update.description}</p>
                                            <p className="mt-2 text-sm text-gray-400">
                                                {update.timeAgo}
                                                {update.date ? ` • ${update.date}` : ""}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </>
                )}

                {/* Empty State when no search done */}
                {!loading && !repair && !hasSearched && (
                    <section className="mx-auto max-w-[1080px] px-5 pb-16">
                        <div className="rounded-3xl border border-neutral-200 bg-neutral-50/50 p-12 text-center">
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-[#EC1C24]">
                                <Wrench className="h-10 w-10" />
                            </div>
                            <h3 className="mt-6 text-2xl font-bold text-neutral-900">Track Any Repair Ticket</h3>
                            <p className="mx-auto mt-2 max-w-md text-base text-neutral-500">
                                Enter your Tracking ID in the search bar above to view real-time diagnostics, technician updates, and status.
                            </p>
                            <Link
                                to="/repair/book"
                                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#EC1C24] px-7 py-3 font-bold text-white shadow-md transition hover:bg-[#cf1414]"
                            >
                                <Plus className="h-5 w-5" />
                                <span>Book New Repair</span>
                            </Link>
                        </div>
                    </section>
                )}
            </main>
        </Layout>
    );
}

export default RepairTrackingPage;


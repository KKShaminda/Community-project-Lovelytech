import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
    CheckCircle2,
    CircleAlert,
    ChevronRight,
    Copy,
    Check,
    ArrowRight,
    Loader2,
    X,
} from "lucide-react";
import Layout from "../../components/layout/Layout";
import { DEVICE_CATEGORIES } from "../../data/repairData";
import { createRepairRequest } from "../../services/repairServices";

const inputClass =
    "mt-1.5 w-full rounded-[14px] border border-[#ff8b92] bg-white px-4 py-3 text-[16px] text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-[#ef1d2c] focus:ring-2 focus:ring-red-100 disabled:bg-gray-100 disabled:cursor-not-allowed";

export function BookRepairPage() {
    const alertRef = useRef(null);

    const [device, setDevice] = useState("smart-phone");

    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [imei, setImei] = useState("");
    const [issue, setIssue] = useState("");

    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");

    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState("");
    const [successData, setSuccessData] = useState(null);
    const [copied, setCopied] = useState(false);

    // Populate user details if logged in
    useEffect(() => {
        try {
            const rawUser = localStorage.getItem("user") || sessionStorage.getItem("user");
            if (rawUser) {
                const user = JSON.parse(rawUser);
                if (user.fullName || user.name) setName(user.fullName || user.name);
                if (user.email) setEmail(user.email);
                if (user.phone) setPhone(user.phone);
                if (user.address) {
                    setAddress(
                        typeof user.address === "string"
                            ? user.address
                            : `${user.address.street || ""}, ${user.address.city || ""}`.replace(/^,\s*|,\s*$/g, "")
                    );
                }
            }
        } catch (e) {
            console.error("Failed to load user info:", e);
        }
    }, []);

    const handleCopyTrackingId = (id) => {
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopied(true);
        toast.success("Tracking ID copied to clipboard!");
        setTimeout(() => setCopied(false), 2500);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            brand.trim() &&
            model.trim() &&
            issue.trim() &&
            name.trim() &&
            phone.trim() &&
            email.trim()
        ) {
            try {
                setLoading(true);
                setApiError("");
                
                const response = await createRepairRequest({
                    deviceCategory: device,
                    brand: brand.trim(),
                    model: model.trim(),
                    imei: imei.trim(),
                    issue: issue.trim(),
                    name: name.trim(),
                    phone: phone.trim(),
                    email: email.trim(),
                    address: address.trim(),
                });

                const trackingId =
                    response?.trackingId ||
                    response?.data?.trackingId ||
                    response?.data?.data?.trackingId ||
                    "PR" + Math.floor(100000 + Math.random() * 900000);

                setSuccessData({
                    trackingId,
                    deviceName: `${brand} ${model}`.trim(),
                });

                toast.success(`Repair booked successfully! Tracking ID: ${trackingId}`);

                // Clear device/issue fields while keeping the user on the page
                setBrand("");
                setModel("");
                setImei("");
                setIssue("");

                // Scroll to success alert
                setTimeout(() => {
                    alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 100);
            } catch (err) {
                console.error("Failed to submit repair request:", err);
                const errorMsg = err.message || "Failed to submit repair request. Please try again.";
                setApiError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <Layout>
            <main className="min-h-screen bg-white">
                {/* Heading */}
                <section className="mx-auto max-w-[1320px] px-6 pb-10 pt-10 sm:px-10 lg:px-14">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-[#EC1C24]">
                                Book a Repair
                            </h1>
                            <p className="mt-2 text-lg text-neutral-500">
                                Fill out the form below with details about your device and issue
                            </p>
                        </div>

                        <div className="hidden items-center gap-2 text-sm sm:flex">
                            <span className="text-gray-500">Repair</span>
                            <ChevronRight size={16} />
                            <span className="font-semibold">Book Repair</span>
                        </div>
                    </div>
                </section>

                {/* Device Categories */}
                <section className="bg-[#3E0F0F] py-14">
                    <div className="mx-auto grid max-w-full gap-6 px-6 sm:grid-cols-2 lg:grid-cols-5">
                        {DEVICE_CATEGORIES.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setDevice(item.id)}
                                className={`overflow-hidden rounded-[15px] bg-white text-left shadow-lg transition hover:-translate-y-1 ${
                                    device === item.id ? "ring-4 ring-[#EC1C24]" : ""
                                }`}
                            >
                                <div className="border-[#EC1C24]">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-44 w-full object-contain"
                                    />
                                </div>

                                <div className="px-5 pb-5 pt-3">
                                    <h2 className="font-bold text-[#EC1C24]">
                                        {item.name}
                                    </h2>
                                    <p className="mt-2 whitespace-pre-line text-sm text-gray-500">
                                        {item.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* FORM & ALERTS */}
                <section className="mx-auto max-w-[1320px] px-6 py-12 sm:px-10 lg:px-14">
                    <div ref={alertRef} className="space-y-6">
                        {/* Success Alert */}
                        {successData && (
                            <div
                                role="alert"
                                className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 bg-emerald-50/90 p-6 shadow-md transition-all duration-300 sm:p-8"
                            >
                                <button
                                    type="button"
                                    onClick={() => setSuccessData(null)}
                                    aria-label="Dismiss alert"
                                    className="absolute right-4 top-4 rounded-lg p-1.5 text-emerald-700 transition hover:bg-emerald-100"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                                        <CheckCircle2 className="h-7 w-7" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-xl font-bold text-emerald-900">
                                            Repair Request Booked Successfully!
                                        </h3>
                                        <p className="mt-1 text-sm text-emerald-800">
                                            Your repair request has been registered. Our technicians will inspect your device and keep you updated on progress.
                                        </p>

                                        {/* Tracking ID details & Action buttons */}
                                        <div className="mt-4 flex flex-wrap items-center gap-3">
                                            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 shadow-xs">
                                                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                                                    Tracking ID:
                                                </span>
                                                <span className="font-mono text-base font-bold text-emerald-950">
                                                    {successData.trackingId}
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleCopyTrackingId(successData.trackingId)}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-xs transition hover:bg-emerald-100"
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                        <span>Copied</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="h-4 w-4" />
                                                        <span>Copy ID</span>
                                                    </>
                                                )}
                                            </button>

                                            <Link
                                                to={`/repair/track?id=${encodeURIComponent(successData.trackingId)}`}
                                                state={{ trackingId: successData.trackingId }}
                                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-800"
                                            >
                                                <span>Track Repair Status</span>
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Error Alert */}
                        {apiError && (
                            <div
                                role="alert"
                                className="relative flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 shadow-xs"
                            >
                                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                                <div className="flex-1 font-medium">{apiError}</div>
                                <button
                                    type="button"
                                    onClick={() => setApiError("")}
                                    className="rounded-lg p-1 text-red-600 hover:bg-red-100"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="rounded-2xl border-t-4 border-[#EC1C24] bg-white p-6 shadow-lg sm:p-10"
                        >
                            <div className="grid gap-12 md:grid-cols-2">
                                {/* Device */}
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Device Information
                                    </h2>

                                    <div className="mt-8 space-y-6">
                                        <label className="block text-gray-500">
                                            Brand Name <span className="text-[#EC1C24]">*</span>
                                            <input
                                                className={inputClass}
                                                placeholder="e.g. Apple, Samsung, Dell"
                                                value={brand}
                                                onChange={(e) => setBrand(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            Model Name <span className="text-[#EC1C24]">*</span>
                                            <input
                                                className={inputClass}
                                                placeholder="e.g. iPhone 14 Pro, Galaxy S23, XPS 15"
                                                value={model}
                                                onChange={(e) => setModel(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            IMEI / Serial No (Optional)
                                            <input
                                                className={inputClass}
                                                placeholder="Enter 15-digit IMEI or Serial number"
                                                value={imei}
                                                onChange={(e) => setImei(e.target.value)}
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            Description of issue <span className="text-[#EC1C24]">*</span>
                                            <textarea
                                                rows="4"
                                                placeholder="Describe the issue in detail (e.g. broken screen, battery drains quickly, won't turn on)..."
                                                className={`${inputClass} resize-none`}
                                                value={issue}
                                                onChange={(e) => setIssue(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* Contact */}
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        Contact Information
                                    </h2>

                                    <div className="mt-8 space-y-6">
                                        <label className="block text-gray-500">
                                            Your Name <span className="text-[#EC1C24]">*</span>
                                            <input
                                                className={inputClass}
                                                placeholder="Full Name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            Phone Number <span className="text-[#EC1C24]">*</span>
                                            <input
                                                className={inputClass}
                                                placeholder="e.g. 0771234567"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            Email Address <span className="text-[#EC1C24]">*</span>
                                            <input
                                                className={inputClass}
                                                placeholder="name@example.com"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={loading}
                                            />
                                        </label>

                                        <label className="block text-gray-500">
                                            Address (Optional)
                                            <textarea
                                                className={`${inputClass} resize-none`}
                                                rows="4"
                                                placeholder="Delivery or pickup address..."
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex items-center gap-3 rounded-xl bg-red-50 px-5 py-4 text-sm text-gray-700">
                                <CircleAlert className="h-5 w-5 shrink-0 text-[#EC1C24]" />
                                <span>
                                    Once submitted, our technicians will review your request and contact you with updates and quote.
                                </span>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mx-auto mt-8 flex w-full max-w-xl items-center justify-center gap-2 rounded-xl bg-black px-6 py-4 font-bold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        <span>Submitting Repair Request...</span>
                                    </>
                                ) : (
                                    <span>Submit Repair Request</span>
                                )}
                            </button>
                        </form>
                    </div>
                </section>
            </main>
        </Layout>
    );
}

export default BookRepairPage;
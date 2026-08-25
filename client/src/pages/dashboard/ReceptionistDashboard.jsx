import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Wrench,
  CheckCircle,
  Plus,
  Loader2,
  X,
  AlertTriangle,
  Printer,
  CreditCard,
  CircleDollarSign,
  Trash2,
  LayoutDashboard,
  ClipboardList,
  Clipboard,
  Receipt,
} from "lucide-react";
import { getCurrentUser, logoutUser } from "../../services/authServices";
import { getRepairs, createRepair, updateRepair } from "../../services/repairServices";
import { getProducts } from "../../services/productServices";
import { createSale } from "../../services/saleServices";
import Layout from "../../components/layout/Layout";

const DEVICE_LABELS = {
  "smart-phone": "Smart Phone",
  tablet: "Tablet",
  android: "Android",
  laptop: "Laptop",
  iphone: "iPhone",
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

const formatLKR = (value = 0) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export function ReceptionistDashboard() {
  const navigate = useNavigate();
  const [currentUser] = useState(getCurrentUser());
  const [repairs, setRepairs] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeQueueTab, setActiveQueueTab] = useState("ALL"); // ALL, PENDING, IN-PROGRESS

  // Selected Ticket for Checkout
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CASH"); // CASH, TRANSFER

  // Checkout Items (Dynamic invoice list)
  const [invoiceItems, setInvoiceItems] = useState([]);
  // laborFee removed — Labor Fee price is managed directly inside invoiceItems
  const [searchProductQuery, setSearchProductQuery] = useState("");

  // Modal States
  const [intakeModalOpen, setIntakeModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [newTrackingId, setNewTrackingId] = useState("");
  const [formError, setFormError] = useState("");

  // Edit Ticket Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTicket, setEditingTicket] = useState(null);
  const [editForm, setEditForm] = useState({
    status: "",
    technician: "",
    estimatedCost: "",
    notes: "",
  });

  // Loading state during checkouts
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [repairRes, productRes] = await Promise.all([
        getRepairs(),
        getProducts({ limit: 100 }),
      ]);

      const fetchedRepairs = (repairRes.data || repairRes.repairs || []).map((r) => ({
        ...r,
        customerName: r.customer || r.customerName || "",
        customerPhone: r.phone || r.customerPhone || "",
        customerEmail: r.email || r.customerEmail || "",
        customerAddress: r.address || r.customerAddress || "",
      }));
      setRepairs(fetchedRepairs);
      setProducts(productRes.products || []);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    // Initialize checkout list with both repair part and labor fee as standard editable/removable items
    setInvoiceItems([
      {
        id: "part-cost",
        name: `${ticket.brand} ${ticket.model} Repair Part`,
        price: ticket.estimatedCost || 189,
        quantity: 1,
        isPart: true,
      },
      {
        id: "labor-fee",
        name: "Labor Fee (Level 2)",
        price: 75,
        quantity: 1,
        isLabor: true,
      },
    ]);
  };

  const handleStartDirectSale = () => {
    setSelectedTicket({
      id: "direct-sale",
      trackingId: "DIRECT",
      customerName: "Walk-in Customer",
      customerPhone: "N/A",
      estimatedCost: 0
    });
    setInvoiceItems([]);
  };

  const handleAddProductToInvoice = (product) => {
    const exists = invoiceItems.find((item) => item.id === product.id || item.id === product._id);
    if (exists) {
      setInvoiceItems((prev) =>
        prev.map((item) =>
          (item.id === product.id || item.id === product._id)
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setInvoiceItems((prev) => [
        ...prev,
        {
          id: product.id || product._id,
          name: product.name,
          price: product.sellPrice || product.price || 0,
          quantity: 1,
          isPart: false,
        },
      ]);
    }
    setSearchProductQuery("");
  };

  const handleRemoveInvoiceItem = (id) => {
    setInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleQuantityChange = (id, newQty) => {
    if (newQty <= 0) return;
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: Number(newQty) } : item))
    );
  };

  const handlePriceChange = (id, newPrice) => {
    if (newPrice < 0) return;
    setInvoiceItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, price: Number(newPrice) } : item))
    );
  };

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
      loadData();
    } catch (err) {
      setFormError(err.message || "Intake registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTicket = (ticket) => {
    setEditingTicket(ticket);
    setEditForm({
      status: ticket.status || "pending",
      technician: ticket.technician || "",
      estimatedCost: ticket.estimatedCost || 0,
      notes: ticket.notes || "",
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      await updateRepair(editingTicket._id || editingTicket.id, editForm);
      setEditModalOpen(false);
      setEditingTicket(null);
      loadData();
    } catch (err) {
      setFormError(err.message || "Failed to update repair order.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintAndClose = async () => {
    if (!selectedTicket) return;
    setCheckoutLoading(true);

    try {
      const totalAmount = invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      // 1. Submit completed Sale record to update POS logs & inventory stock levels
      const saleItems = invoiceItems.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
      }));

      await createSale({
        customerName: selectedTicket.customerName,
        paymentMethod: paymentMethod === "CASH" ? "Cash" : "Bank Transfer", // Map state dynamically
        status: "complete",
        total: totalAmount,
        items: saleItems,
      });

      // 2. Mark repair ticket as completed (picked up) - only if it is a real repair ticket
      if (selectedTicket.id !== "direct-sale") {
        await updateRepair(selectedTicket._id || selectedTicket.id, {
          status: "completed",
          estimatedCost: invoiceItems.find(i => i.isPart)?.price || selectedTicket.estimatedCost,
        });
      }

      // 3. Trigger native print popup
      window.print();

      // 4. Reset billing checkout panel states
      setSelectedTicket(null);
      setInvoiceItems([]);

      alert(`Sale registered and checkout completed for ${selectedTicket.trackingId}`);
      loadData();
    } catch (err) {
      alert("Checkout failed: " + err.message);
    } finally {
      setCheckoutLoading(false);
    }
  };

  // Filter queue by active tab (ALL, PENDING, IN-PROGRESS) and search query
  const filteredRepairs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return repairs.filter((r) => {
      const matchesSearch =
        q === "" ||
        (r.trackingId || "").toLowerCase().includes(q) ||
        (r.customerName || "").toLowerCase().includes(q) ||
        (r.brand || "").toLowerCase().includes(q) ||
        (r.model || "").toLowerCase().includes(q);

      let matchesTab = true;
      if (activeQueueTab === "PENDING") {
        matchesTab = r.status === "pending";
      } else if (activeQueueTab === "IN-PROGRESS") {
        matchesTab = r.status === "in-progress";
      }

      return matchesSearch && matchesTab;
    });
  }, [repairs, searchQuery, activeQueueTab]);

  // Invoice calculations
  const invoiceSubtotal = useMemo(() => {
    return invoiceItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [invoiceItems]);

  // Filtered inventory products for search dropdown
  const filteredProducts = useMemo(() => {
    const q = searchProductQuery.toLowerCase().trim();
    if (!q) return [];
    return products.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      (p.brand || "").toLowerCase().includes(q)
    ).slice(0, 5);
  }, [products, searchProductQuery]);

  // Daily stats calculation from database
  const dailyStats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const todayRepairs = repairs.filter(
      (r) => r.createdAt && r.createdAt.slice(0, 10) === today
    ).length;
    const completedVal = repairs
      .filter((r) => r.status === "completed")
      .reduce((sum, r) => sum + (r.estimatedCost || 0), 0);

    return {
      booked: todayRepairs,
      invoiced: completedVal ? `${(completedVal / 1000).toFixed(1)}k` : "0",
    };
  }, [repairs]);

  return (
    <Layout>
      <div className="min-h-screen bg-[#1f1f1f] font-sans text-neutral-900">
        {/* ── Sidebar + Content Body ── */}
        <div className="flex flex-1 bg-[#f4f4f4] print:bg-white">
          {/* Sidebar */}
          <aside className="hidden w-[210px] shrink-0 bg-gradient-to-b from-[#e01c23] to-[#8f0f11] pb-12 lg:block print:hidden">
            <div className="mt-2 space-y-1">
              <button
                type="button"
                className="flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition bg-[#8F0F11] text-white"
              >
                <LayoutDashboard size={18} />
                <span>Dashboard</span>
              </button>
              <Link
                to="/receptionist/inventory"
                className="flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition text-white/95 hover:bg-white/10"
              >
                <ClipboardList size={18} />
                <span>Inventory</span>
              </Link>
              <Link
                to="/receptionist/repair-orders"
                className="flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition text-white/95 hover:bg-white/10"
              >
                <Clipboard size={18} />
                <span>Repair Orders</span>
              </Link>
              <Link
                to="/receptionist/sales-log"
                className="flex w-full items-center gap-3 rounded-r-md px-3 py-3 text-left text-sm font-medium transition text-white/95 hover:bg-white/10"
              >
                <Receipt size={18} />
                <span>Sales Log</span>
              </Link>
            </div>
          </aside>

          {/* Main workspace container */}
          <main className="min-w-0 flex-1 bg-white px-4 py-6 sm:px-6 lg:px-8 xl:px-10 print:px-0 print:py-0">

            {/* Real Printable Invoice Layout (Hidden except when printing) */}
            <div className="hidden print:block font-mono text-xs w-[80mm] p-4 bg-white text-black space-y-4">
              <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                  body, html, #root {
                    background: white !important;
                    color: black !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    height: auto !important;
                    min-height: 0 !important;
                  }
                  .print\\:hidden {
                    display: none !important;
                  }
                  div, main, header, footer, aside {
                    box-shadow: none !important;
                    border: none !important;
                    background: transparent !important;
                  }
                  @page {
                    margin: 0;
                  }
                }
              `}} />
              <div className="text-center">
                <h1 className="text-lg font-bold">LOVELY TECH PRECISION</h1>
                <p className="text-[10px]">Service Receipt & Bill Invoice</p>
                <p className="text-[10px] mt-1">Date: {new Date().toLocaleString()}</p>
              </div>

              <div className="border-t border-dashed border-black pt-2 space-y-1 text-[10px]">
                <p><span className="font-bold">Ticket:</span> {selectedTicket?.trackingId}</p>
                <p><span className="font-bold">Customer:</span> {selectedTicket?.customerName}</p>
                <p><span className="font-bold">Contact:</span> {selectedTicket?.customerPhone}</p>
              </div>

              <div className="border-t border-dashed border-black pt-2">
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b border-dashed border-black font-bold">
                      <th>Item</th>
                      <th className="text-right">Qty</th>
                      <th className="text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item) => (
                      <tr key={item.id}>
                        <td className="truncate max-w-[40mm]">{item.name}</td>
                        <td className="text-right">x{item.quantity}</td>
                        <td className="text-right">{formatLKR(item.price * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-dashed border-black pt-2 text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Grand Total:</span>
                  <span>{formatLKR(invoiceSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span>{paymentMethod}</span>
                </div>
              </div>

              <div className="text-center pt-4 border-t border-dashed border-black text-[9px] text-neutral-500">
                <p>Thank you for choosing Lovely Tech!</p>
                <p>Visit again for precision repairs.</p>
              </div>
            </div>

            <div className="print:hidden space-y-8">
              {/* Dashboard Header Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">Operational Dashboard</h1>
                  <p className="text-neutral-500 mt-1">Manage incoming repairs and customer transactions with precision.</p>
                </div>
                <button
                  onClick={() => {
                    setForm(defaultForm);
                    setNewTrackingId("");
                    setFormError("");
                    setIntakeModalOpen(true);
                  }}
                  className="bg-[#ef2027] text-white px-6 py-3.5 rounded-xl font-bold hover:bg-[#d61219] transition flex items-center gap-2 shadow-md"
                >
                  <Plus size={18} />
                  New Repair Ticket
                </button>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 flex items-center gap-3">
                  <AlertTriangle className="shrink-0" size={20} />
                  <p className="font-semibold">{error}</p>
                </div>
              )}

              <div className="mb-8 bg-gradient-to-tr from-slate-50 to-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#ef2027]">Daily Operational Stats</h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-md">Live Data</span>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Repairs Booked</p>
                      <p className="text-2xl font-extrabold text-slate-800">{dailyStats.booked}</p>
                    </div>
                    <div className="p-3 bg-red-50 text-[#ef2027] rounded-xl shadow-inner">
                      <Clipboard size={20} />
                    </div>
                  </div>
                  
                  <div className="p-5 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoiced Revenue</p>
                      <p className="text-2xl font-extrabold text-emerald-600">LKR {dailyStats.invoiced}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shadow-inner">
                      <CircleDollarSign size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr]">

                {/* ── Left Column: Active Repair Queue ── */}
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md shadow-slate-100/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-slate-50/40">
                      <div>
                        <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#ef2027]">Active Repair Queue</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">Real-time status updates and checkouts</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search customer, device..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold outline-none focus:border-[#ef2027] shadow-inner transition-all duration-300 w-44 focus:w-56"
                          />
                          <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                        </div>

                        {/* Tabs */}
                        <div className="flex bg-slate-100 rounded-xl p-1 text-xs font-bold text-neutral-500 shadow-inner">
                          <button
                            onClick={() => setActiveQueueTab("ALL")}
                            className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${activeQueueTab === "ALL" ? "bg-white text-[#ef2027] shadow-sm" : "hover:text-neutral-800"}`}
                          >
                            ALL
                          </button>
                          <button
                            onClick={() => setActiveQueueTab("PENDING")}
                            className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${activeQueueTab === "PENDING" ? "bg-white text-[#ef2027] shadow-sm" : "hover:text-neutral-800"}`}
                          >
                            PENDING
                          </button>
                          <button
                            onClick={() => setActiveQueueTab("IN-PROGRESS")}
                            className={`px-3 py-1.5 rounded-lg transition-all duration-300 ${activeQueueTab === "IN-PROGRESS" ? "bg-white text-[#ef2027] shadow-sm" : "hover:text-neutral-800"}`}
                          >
                            IN-PROGRESS
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Repair Queue Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-slate-50/20 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                            <th className="px-6 py-4">Ticket</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Device</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-neutral-400">
                                <Loader2 size={24} className="animate-spin mx-auto text-[#ef2027]" />
                                <p className="mt-2 text-xs">Loading queue details...</p>
                              </td>
                            </tr>
                          ) : filteredRepairs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-neutral-400 text-xs italic">
                                No repairs found matching this category.
                              </td>
                            </tr>
                          ) : (
                            filteredRepairs.map((item) => (
                              <tr key={item._id || item.id} className="hover:bg-slate-50/40 border-b border-slate-100 last:border-0 transition-colors">
                                <td className="px-6 py-4">
                                  <span className="px-2.5 py-1 bg-red-50 text-red-600 font-mono font-bold text-xs rounded-lg border border-red-100/50">
                                    {item.trackingId}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-slate-800 text-sm">{item.customerName}</p>
                                  {item.customerPhone && (
                                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">{item.customerPhone}</p>
                                  )}
                                </td>
                                <td className="px-6 py-4 text-slate-700 text-sm font-semibold">
                                  {item.brand} {item.model}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                      item.status === "ready"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : item.status === "in-progress" || item.status === "repairing" || item.status === "diagnosing"
                                          ? "bg-blue-50 text-blue-700 border-blue-200"
                                          : item.status === "completed"
                                            ? "bg-slate-100 text-slate-600 border-slate-200"
                                            : "bg-amber-50 text-amber-700 border-amber-200"
                                    }`}
                                  >
                                    {item.status === "in-progress" ? "IN PROGRESS" : item.status || "PENDING"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <button
                                    onClick={() => {
                                      if (item.status === "ready") {
                                        handleSelectTicket(item);
                                      } else {
                                        handleEditTicket(item);
                                      }
                                    }}
                                    className={`inline-flex items-center gap-1 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] active:scale-95 cursor-pointer ${
                                      item.status === "ready"
                                        ? "text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-100"
                                        : "text-slate-700 bg-slate-100 hover:bg-slate-200 shadow-slate-100"
                                    }`}
                                  >
                                    {item.status === "ready" ? "Invoice" : "Details"}
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* ── Right Column: Billing / Waiting / Stats ── */}
                <div className="space-y-8">
                  {/* Billing & Invoice Interactive Checkout Panel */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md shadow-slate-100/50 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#ef2027]">Billing & Invoice</h2>
                      {!selectedTicket && (
                        <button
                          onClick={handleStartDirectSale}
                          className="text-xs font-bold text-slate-500 hover:text-[#ef2027] border border-slate-200 rounded-lg px-2.5 py-1 hover:border-[#ef2027] transition-all duration-300"
                        >
                          + Direct POS Sale
                        </button>
                      )}
                    </div>

                    {/* Search and Add accessories dropdown */}
                    <div className="relative">
                      <label className="block text-xs font-bold text-neutral-500 mb-1">Add Accessory/Product to Invoice</label>
                      <input
                        type="text"
                        disabled={!selectedTicket}
                        placeholder={selectedTicket ? "Type casing, charger, tools..." : "Select a ready ticket first"}
                        value={searchProductQuery}
                        onChange={(e) => setSearchProductQuery(e.target.value)}
                        className="w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-[#ef2027] bg-neutral-50/50 disabled:cursor-not-allowed disabled:opacity-55"
                      />
                      {selectedTicket && filteredProducts.length > 0 && (
                        <div className="absolute left-0 right-0 mt-1 z-30 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-neutral-100">
                          {filteredProducts.map((p) => (
                            <button
                              key={p._id || p.id}
                              onClick={() => handleAddProductToInvoice(p)}
                              className="w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-neutral-50 transition"
                            >
                              {p.name} - {formatLKR(p.sellPrice || p.price || 0)} ({p.stock} left)
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Invoice Checkout List */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-white space-y-4 shadow-lg">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Selected Ticket</span>
                        <span className="font-extrabold text-[#ef2027]">
                          {selectedTicket ? (selectedTicket.trackingId || "—") : "No Ticket"}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {selectedTicket ? (
                          invoiceItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div className="space-y-0.5">
                                <p className="font-semibold truncate max-w-[150px]">{item.name}</p>
                                {(item.isPart || item.isLabor) ? (
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className="w-20 bg-slate-800 text-white text-[10px] rounded px-1.5 py-0.5 outline-none border border-slate-700 focus:border-[#ef2027]"
                                  />
                                ) : (
                                  <p className="text-[10px] text-slate-400">{formatLKR(item.price)} each</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!item.isPart && !item.isLabor && (
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    className="w-10 bg-slate-800 text-white text-center rounded px-1 py-0.5 outline-none border border-slate-700 focus:border-[#ef2027]"
                                  />
                                )}
                                <span className="font-bold text-slate-200">{formatLKR(item.price * item.quantity)}</span>
                                <button
                                  onClick={() => handleRemoveInvoiceItem(item.id)}
                                  className="text-slate-400 hover:text-red-500 transition ml-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic text-center py-4">
                            Select a "Ready" ticket in the queue to load checkout items.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-slate-800 pt-3">
                        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Amount</span>
                        <span className="text-xl font-extrabold text-emerald-400">
                          {selectedTicket ? formatLKR(invoiceSubtotal) : formatLKR(0)}
                        </span>
                      </div>

                      {/* Payment Options */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                          disabled={!selectedTicket}
                          onClick={() => setPaymentMethod("CASH")}
                          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border disabled:opacity-50 disabled:cursor-not-allowed ${selectedTicket && paymentMethod === "CASH"
                            ? "bg-white text-slate-900 border-white shadow-md shadow-white/10"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                            }`}
                        >
                          <CircleDollarSign size={16} />
                          CASH
                        </button>
                        <button
                          disabled={!selectedTicket}
                          onClick={() => setPaymentMethod("TRANSFER")}
                          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border disabled:opacity-50 disabled:cursor-not-allowed ${selectedTicket && paymentMethod === "TRANSFER"
                            ? "bg-white text-slate-900 border-white shadow-md shadow-white/10"
                            : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
                            }`}
                        >
                          <CreditCard size={16} />
                          TRANSFER
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handlePrintAndClose}
                      disabled={!selectedTicket || checkoutLoading}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-red-500/10 hover:shadow-red-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {checkoutLoading ? <Loader2 className="animate-spin" size={18} /> : <Printer size={18} />}
                      Print Receipt & Close
                    </button>
                  </div>

                  {/* Daily Stats Widget */}
                  {/* <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                    <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#ef2027]">Daily Stats</h2>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <p className="text-xs text-neutral-400 font-bold uppercase">Repairs Booked</p>
                        <p className="text-3xl font-extrabold text-neutral-800 mt-2">{dailyStats.booked}</p>
                      </div>
                      <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
                        <p className="text-xs text-neutral-400 font-bold uppercase">Invoiced</p>
                        <p className="text-3xl font-extrabold text-[#ef2027] mt-2">LKR {dailyStats.invoiced}</p>
                      </div>
                    </div>
                  </div> */}

                </div>
              </div>
            </div>
          </main >
        </div >
      </div >

      {/* Intake / New Ticket Modal */}
      {
        intakeModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto print:hidden">
            <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => setIntakeModalOpen(false)}
                className="absolute right-6 top-6 rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench size={24} className="text-[#ef2027]" />
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
                  <div className="mt-4 inline-block rounded-xl border border-dashed border-[#ef2027] bg-red-50/50 px-8 py-3.5">
                    <span className="text-2xl font-mono font-extrabold tracking-widest text-[#ef2027]">
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
                      className="rounded-xl bg-[#ef2027] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#d61219]"
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
                        />
                      </label>
                      <label>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">Mobile Number</span>
                        <input
                          required
                          type="text"
                          value={form.customerPhone}
                          onChange={(e) => setForm((prev) => ({ ...prev, customerPhone: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
                        />
                      </label>
                      <label>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">Home Address</span>
                        <input
                          type="text"
                          value={form.customerAddress}
                          onChange={(e) => setForm((prev) => ({ ...prev, customerAddress: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
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
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
                        />
                      </label>
                      <label>
                        <span className="block text-xs font-semibold text-slate-600 mb-1">IMEI or Serial No (Optional)</span>
                        <input
                          type="text"
                          value={form.imei}
                          onChange={(e) => setForm((prev) => ({ ...prev, imei: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
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
                        className="w-full rounded-xl border border-[#ef2027] px-4 py-2.5 text-sm outline-none focus:border-[#ef2027] resize-none"
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
                      className="flex items-center gap-2 rounded-xl bg-[#ef2027] px-6 py-3 text-sm font-bold text-white hover:bg-[#d61219] disabled:opacity-50"
                    >
                      {submitting && <Loader2 size={16} className="animate-spin" />}
                      Register Intake
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      }

      {/* Edit Repair Order / Status Change Modal */}
      {
        editModalOpen && editingTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto print:hidden">
            <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingTicket(null);
                }}
                className="absolute right-6 top-6 rounded-full p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Wrench size={24} className="text-[#ef2027]" />
                Edit Repair Order Details
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Update the active diagnostic status, technician assignment, or pricing parameters.
              </p>

              {formError && (
                <div className="mt-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertTriangle size={18} />
                  {formError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Diagnostic Status</span>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027] bg-white"
                    >
                      <option value="pending">Pending Diagnostics</option>
                      <option value="in-progress">In Progress / Repairing</option>
                      <option value="ready">Ready for Pickup (Invoicing)</option>
                      <option value="completed">Completed / Dispatched</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </label>

                  <label>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Assigned Technician</span>
                    <input
                      type="text"
                      placeholder="Ex: Nimal Perera, Unassigned"
                      value={editForm.technician}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, technician: e.target.value }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="block text-xs font-semibold text-slate-600 mb-1">Repair Cost (LKR)</span>
                    <input
                      type="number"
                      value={editForm.estimatedCost}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, estimatedCost: Number(e.target.value) }))}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027]"
                    />
                  </label>
                  <div>
                    <span className="block text-xs font-semibold text-slate-400 mb-1">Ticket Tracking Reference</span>
                    <p className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-600">
                      {editingTicket.trackingId}
                    </p>
                  </div>
                </div>

                <label className="block">
                  <span className="block text-xs font-semibold text-slate-600 mb-1">Diagnostic & Technician Notes</span>
                  <textarea
                    rows={4}
                    placeholder="Details regarding part availability, specific defects found, or customer communication logs."
                    value={editForm.notes}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, notes: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#ef2027] resize-none"
                  />
                </label>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setEditingTicket(null);
                    }}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 rounded-xl bg-[#ef2027] px-6 py-3 text-sm font-bold text-white hover:bg-[#d61219] disabled:opacity-50"
                  >
                    {submitting && <Loader2 size={16} className="animate-spin" />}
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
    </Layout >

  );
}

export default ReceptionistDashboard;
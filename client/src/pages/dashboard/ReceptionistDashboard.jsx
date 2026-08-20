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
  const [laborFee, setLaborFee] = useState(75);
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
      }
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
      booked: todayRepairs || repairs.length,
      invoiced: completedVal ? `${(completedVal / 1000).toFixed(1)}k` : "2.4k",
    };
  }, [repairs]);

  return (
    <Layout>
      <div className="min-h-screen bg-[#1f1f1f] font-sans text-neutral-900">
        {/* ── Sidebar + Content Body ── */}
        <div className="flex flex-1 bg-[#f4f4f4] print:bg-white">
          {/* Sidebar */}
          <aside className="hidden w-[210px] shrink-0 bg-[#ef2027] pb-12 lg:block print:hidden">
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

              <div className="mb-8 bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
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
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.8fr_1.2fr]">

                {/* ── Left Column: Active Repair Queue ── */}
                <div className="space-y-8">
                  <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#ef2027]">Active Repair Queue</h2>
                      {/* Tabs */}
                      <div className="flex bg-neutral-100 rounded-lg p-1 text-xs font-bold text-neutral-500">
                        <button
                          onClick={() => setActiveQueueTab("ALL")}
                          className={`px-4 py-2 rounded-md transition ${activeQueueTab === "ALL" ? "bg-[#ef2027] text-white" : "hover:text-neutral-800"}`}
                        >
                          ALL
                        </button>
                        <button
                          onClick={() => setActiveQueueTab("PENDING")}
                          className={`px-4 py-2 rounded-md transition ${activeQueueTab === "PENDING" ? "bg-[#ef2027] text-white" : "hover:text-neutral-800"}`}
                        >
                          PENDING
                        </button>
                        <button
                          onClick={() => setActiveQueueTab("IN-PROGRESS")}
                          className={`px-4 py-2 rounded-md transition ${activeQueueTab === "IN-PROGRESS" ? "bg-[#ef2027] text-white" : "hover:text-neutral-800"}`}
                        >
                          IN-PROGRESS
                        </button>
                      </div>
                    </div>

                    {/* Repair Queue Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm border-collapse">
                        <thead>
                          <tr className="bg-neutral-50/50 text-xs font-bold uppercase tracking-wider text-neutral-400 border-b border-neutral-100">
                            <th className="px-6 py-4">Ticket</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Device</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100 font-medium">
                          {loading ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-neutral-400">
                                <Loader2 size={24} className="animate-spin mx-auto text-[#ef2027]" />
                                <p className="mt-2 text-xs">Loading queue details...</p>
                              </td>
                            </tr>
                          ) : filteredRepairs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-12 text-center text-neutral-400">
                                No repairs found matching this category.
                              </td>
                            </tr>
                          ) : (
                            filteredRepairs.map((item) => (
                              <tr key={item._id || item.id} className="hover:bg-neutral-50/40">
                                <td className="px-6 py-4 text-xs font-bold text-neutral-500">
                                  #{item.trackingId ? item.trackingId.slice(-4) : "—"}
                                </td>
                                <td className="px-6 py-4">
                                  <p className="font-bold text-neutral-900">{item.customerName}</p>
                                </td>
                                <td className="px-6 py-4 text-neutral-700">
                                  {item.brand} {item.model}
                                </td>
                                <td className="px-6 py-4">
                                  <span
                                    className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${item.status === "ready"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : item.status === "in-progress"
                                          ? "bg-red-50 text-red-700 border-red-200"
                                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                      }`}
                                  >
                                    {item.status === "in-progress" ? "IN PROGRESS" : item.status || "PENDING"}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <button
                                    onClick={() => {
                                      if (item.status === "ready") {
                                        handleSelectTicket(item);
                                      } else {
                                        handleEditTicket(item);
                                      }
                                    }}
                                    className="text-xs font-bold text-[#ef2027] hover:underline"
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
                  <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-sm font-extrabold uppercase tracking-widest text-[#ef2027]">Billing & Invoice</h2>
                      {!selectedTicket && (
                        <button
                          onClick={handleStartDirectSale}
                          className="text-xs font-bold text-slate-500 hover:text-[#ef2027] border border-slate-200 rounded-lg px-2.5 py-1 hover:border-[#ef2027] transition-colors"
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
                    <div className="bg-neutral-800 rounded-2xl p-5 text-white space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-750 pb-2">
                        <span className="text-xs text-neutral-450 font-bold uppercase">Selected Ticket</span>
                        <span className="font-extrabold text-[#ef2027]">
                          {selectedTicket ? `#${selectedTicket.trackingId ? selectedTicket.trackingId.slice(-4) : "—"}` : "# —"}
                        </span>
                      </div>

                      <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {selectedTicket ? (
                          invoiceItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-xs">
                              <div className="space-y-0.5">
                                <p className="font-semibold truncate max-w-35">{item.name}</p>
                                {(item.isPart || item.isLabor) ? (
                                  <input
                                    type="number"
                                    value={item.price}
                                    onChange={(e) => handlePriceChange(item.id, e.target.value)}
                                    className="w-16 bg-neutral-700 text-white text-[10px] rounded px-1.5 py-0.5 outline-none border border-neutral-600 focus:border-[#ef2027]"
                                  />
                                ) : (
                                  <p className="text-[10px] text-neutral-400">{formatLKR(item.price)} each</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {!item.isPart && !item.isLabor && (
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.quantity}
                                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                    className="w-10 bg-neutral-700 text-white text-center rounded px-1 py-0.5 outline-none"
                                  />
                                )}
                                <span className="font-bold">{formatLKR(item.price * item.quantity)}</span>
                                <button
                                  onClick={() => handleRemoveInvoiceItem(item.id)}
                                  className="text-neutral-400 hover:text-red-500 transition ml-1"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-neutral-450 italic text-center py-4">
                            Select a "Ready" ticket in the queue to load checkout items.
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center border-t border-neutral-750 pt-3">
                        <span className="text-xs text-neutral-300 font-bold uppercase">Total Amount</span>
                        <span className="text-xl font-extrabold text-[#ef2027]">
                          {selectedTicket ? formatLKR(invoiceSubtotal) : formatLKR(0)}
                        </span>
                      </div>

                      {/* Payment Options */}
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <button
                          disabled={!selectedTicket}
                          onClick={() => setPaymentMethod("CASH")}
                          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border disabled:opacity-50 disabled:cursor-not-allowed ${selectedTicket && paymentMethod === "CASH"
                              ? "bg-white text-neutral-900 border-white"
                              : "bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600"
                            }`}
                        >
                          <CircleDollarSign size={16} />
                          CASH
                        </button>
                        <button
                          disabled={!selectedTicket}
                          onClick={() => setPaymentMethod("TRANSFER")}
                          className={`flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold transition border disabled:opacity-50 disabled:cursor-not-allowed ${selectedTicket && paymentMethod === "TRANSFER"
                              ? "bg-white text-neutral-900 border-white"
                              : "bg-neutral-700 text-neutral-300 border-neutral-600 hover:bg-neutral-600"
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
                      className="w-full bg-[#ef2027] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#d61219] transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
          </main>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;

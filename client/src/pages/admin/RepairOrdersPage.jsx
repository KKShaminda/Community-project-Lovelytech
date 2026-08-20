<<<<<<< HEAD
import { useEffect, useMemo, useState } from 'react'
import { AdminShell } from '../../components/admin/AdminShell'
import { REPAIR_STATUS_META, formatLKR } from '../../data/adminPagesData'
import { getRepairs, createRepair, updateRepair, deleteRepair } from '../../services/repairServices'

const DEVICE_LABELS = {
  'smart-phone': 'Smart Phone',
  tablet: 'Tablet',
  android: 'Android',
  laptop: 'Laptop',
  iphone: 'iPhone',
}

const defaultForm = {
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  deviceType: 'smart-phone',
  brand: '',
  model: '',
  imei: '',
  issue: '',
  technician: '',
  estimatedCost: '',
  status: 'pending',
  notes: '',
}

const normalizeRepair = (r) => ({
  id: r._id || r.id,
  trackingId: r.trackingId || '',
  customer: r.customerName,
  phone: r.customerPhone,
  device: `${DEVICE_LABELS[r.deviceType] || r.deviceType} — ${r.brand} ${r.model}`,
  deviceType: r.deviceType,
  brand: r.brand,
  model: r.model,
  imei: r.imei || '',
  issue: r.issue,
  status: r.status,
  technician: r.technician || 'Unassigned',
  amount: Number(r.estimatedCost) || 0,
  notes: r.notes || '',
  customerEmail: r.customerEmail || '',
  createdAt: (r.createdAt || '').slice(0, 10),
})

function RepairCard({ item }) {
  const status = REPAIR_STATUS_META[item.status] || REPAIR_STATUS_META.pending

  return (
    <article className="rounded-2xl border border-[#e7e7e7] bg-[#efefef] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-[#ef2027]">{item.trackingId}</span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-neutral-900">{item.device}</h3>
      <p className="mt-1 text-sm text-neutral-700">{item.issue}</p>
      <div className="mt-4 space-y-2 text-sm text-neutral-700">
        <p><span className="font-semibold text-neutral-900">Customer:</span> {item.customer}</p>
        <p><span className="font-semibold text-neutral-900">Technician:</span> {item.technician}</p>
        <p><span className="font-semibold text-neutral-900">Est. Cost:</span> {formatLKR(item.amount)}</p>
        <p><span className="font-semibold text-neutral-900">Date:</span> {item.createdAt}</p>
      </div>
    </article>
  )
}

export function RepairOrdersPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const loadRepairs = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await getRepairs()
      setItems((response?.repairs || []).map(normalizeRepair))
    } catch (err) {
      setError(err.message || 'Unable to load repair orders.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepairs()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      customerName: item.customer,
      customerPhone: item.phone,
      customerEmail: item.customerEmail || '',
      deviceType: item.deviceType,
      brand: item.brand,
      model: item.model,
      imei: item.imei || '',
      issue: item.issue,
      technician: item.technician,
      estimatedCost: String(item.amount || ''),
      status: item.status,
      notes: item.notes || '',
    })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        estimatedCost: Number(form.estimatedCost) || 0,
      }
      if (editingId) {
        await updateRepair(editingId, payload)
      } else {
        await createRepair(payload)
      }
      setModalOpen(false)
      await loadRepairs()
    } catch (err) {
      setError(err.message || 'Unable to save repair order.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this repair order?')) return
    try {
      await deleteRepair(id)
      await loadRepairs()
    } catch (err) {
      setError(err.message || 'Unable to delete repair order.')
    }
  }

  const stats = useMemo(() => [
    { label: 'OPEN ORDERS', value: String(items.filter((i) => i.status !== 'completed' && i.status !== 'cancelled').length) },
    { label: 'READY TODAY', value: String(items.filter((i) => i.status === 'ready').length) },
    { label: 'TOTAL VALUE', value: formatLKR(items.reduce((sum, i) => sum + i.amount, 0)) },
  ], [items])

  return (
    <AdminShell
      activeSection="repair-orders"
      action={
        <button type="button" onClick={openCreate} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black">
          New Order
        </button>
      }
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">Repair Orders</p>
          <p className="mt-1 text-sm text-neutral-700">Manage service tickets, technicians, and repair status.</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
            <p className="text-xs font-medium tracking-wide text-neutral-700">{item.label}</p>
            <p className="mt-2 text-lg font-medium text-neutral-900">{item.value}</p>
          </article>
        ))}
      </section>

      {error ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="mt-8 py-12 text-center text-sm text-neutral-600">Loading repair orders...</div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                <RepairCard item={item} />
                <div className="absolute right-4 top-4 hidden items-center gap-3 group-hover:flex">
                  <button type="button" onClick={() => openEdit(item)} className="text-sm font-semibold text-[#ef2027]">Edit</button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="text-sm font-semibold text-neutral-500 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <p className="col-span-3 py-8 text-center text-sm text-neutral-500">No repair orders yet.</p>
            )}
          </section>

          <section className="mt-8 rounded-2xl bg-[#efefef]">
            <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_0.7fr] bg-[#d8d8d8] px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500">
              <span>Tracking ID</span>
              <span>Customer</span>
              <span>Device</span>
              <span>Status</span>
              <span>Technician</span>
              <span>Actions</span>
            </div>
            {items.map((item) => {
              const status = REPAIR_STATUS_META[item.status] || REPAIR_STATUS_META.pending
              return (
                <div key={item.id} className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_0.7fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
                  <span className="font-semibold text-[#ef2027]">{item.trackingId}</span>
                  <span className="text-neutral-800">{item.customer}</span>
                  <span className="text-neutral-800">{item.device}</span>
                  <span><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span></span>
                  <span className="text-neutral-800">{item.technician}</span>
                  <span className="flex items-center gap-3">
                    <button type="button" onClick={() => openEdit(item)} className="font-semibold text-[#ef2027]">Edit</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="font-semibold text-neutral-500 hover:text-red-600">Delete</button>
                  </span>
                </div>
              )
            })}
            {items.length === 0 && (
              <div className="px-6 py-8 text-center text-sm text-neutral-600">No repair orders yet.</div>
            )}
          </section>
        </>
      )}

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form onSubmit={handleSave} className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Repair Order</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit order' : 'Create order'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500">×</button>
            </div>

            {error && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                <span className="text-sm font-medium text-neutral-700">Customer Name</span>
                <input required value={form.customerName} onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Customer Phone</span>
                <input required value={form.customerPhone} onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Customer Email</span>
                <input type="email" value={form.customerEmail} onChange={(e) => setForm((f) => ({ ...f, customerEmail: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Device Type</span>
                <select value={form.deviceType} onChange={(e) => setForm((f) => ({ ...f, deviceType: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]">
                  {Object.entries(DEVICE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Brand</span>
                <input required value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Model</span>
                <input required value={form.model} onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">IMEI (optional)</span>
                <input value={form.imei} onChange={(e) => setForm((f) => ({ ...f, imei: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Issue Description</span>
                <textarea required rows="3" value={form.issue} onChange={(e) => setForm((f) => ({ ...f, issue: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Technician</span>
                <input value={form.technician} onChange={(e) => setForm((f) => ({ ...f, technician: e.target.value }))} placeholder="Unassigned" className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Est. Cost (LKR)</span>
                <input type="number" min="0" value={form.estimatedCost} onChange={(e) => setForm((f) => ({ ...f, estimatedCost: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Status</span>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]">
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Notes</span>
                <textarea rows="2" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving...' : editingId ? 'Update Order' : 'Create Order'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  )
}

=======
import { useMemo, useState, useEffect } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { REPAIR_ORDERS, REPAIR_STATUS_META, formatLKR } from '../../data/adminPagesData'
import { getRepairs, createRepairRequest, updateRepair, deleteRepair } from '../../services/repairServices'

const defaultForm = {
  customer: '',
  device: '',
  issue: '',
  technician: '',
  status: 'pending',
  amount: '',
}

function RepairCard({ item }) {
  const status = REPAIR_STATUS_META[item.status] || { label: item.status || 'Pending', className: 'bg-neutral-100 text-neutral-700' }

  return (
    <article className="rounded-2xl border border-[#e7e7e7] bg-[#efefef] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-md bg-red-100 px-2.5 py-1 text-xs font-semibold text-[#ef2027]">{item.id}</span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-neutral-900">{item.device}</h3>
      <p className="mt-1 text-sm text-neutral-700">{item.issue}</p>
      <div className="mt-4 space-y-2 text-sm text-neutral-700">
        <p><span className="font-semibold text-neutral-900">Customer:</span> {item.customer}</p>
        <p><span className="font-semibold text-neutral-900">Technician:</span> {item.technician}</p>
        <p><span className="font-semibold text-neutral-900">Value:</span> {formatLKR(item.amount)}</p>
      </div>
    </article>
  )
}

export function RepairOrdersPage() {
  const [items, setItems] = useState(REPAIR_ORDERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const fetchItems = async () => {
    try {
      const res = await getRepairs()
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.trackingId || item._id,
          customer: item.customer || "Unknown",
          device: item.device || `${item.brand || ""} ${item.model || ""}`.trim() || "Device",
          issue: item.issue || "",
          technician: item.technician || "Unassigned",
          status: item.status || "pending",
          amount: Number(item.amount || item.estimate || 0),
          createdAt: item.createdAt || new Date().toISOString().slice(0, 10),
        }))
        setItems(mapped)
      }
    } catch (err) {
      console.error("Error fetching repair orders:", err)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      customer: item.customer,
      device: item.device,
      issue: item.issue,
      technician: item.technician,
      status: item.status,
      amount: String(item.amount),
    })
    setModalOpen(true)
  }

  const saveItem = async (event) => {
    event.preventDefault()
    try {
      if (editingId) {
        await updateRepair(editingId, {
          customer: form.customer,
          device: form.device,
          issue: form.issue,
          technician: form.technician,
          status: form.status,
          amount: Number(form.amount),
          estimate: Number(form.amount),
        })
      } else {
        await createRepairRequest({
          customer: form.customer,
          device: form.device,
          issue: form.issue,
          technician: form.technician,
          status: form.status,
          amount: Number(form.amount),
          estimate: Number(form.amount),
          email: `${form.customer.toLowerCase().replace(/\s+/g, '')}@example.com`,
          phone: "0770000000",
        })
      }
      fetchItems()
      setModalOpen(false)
    } catch (err) {
      console.error("Error saving repair order:", err)
      // Fallback local update
      const next = {
        id: editingId || `#LT-${Math.floor(Date.now() / 1000)}`,
        ...form,
        amount: Number(form.amount),
        createdAt: new Date().toISOString().slice(0, 10),
      }
      setItems((current) => (editingId ? current.map((item) => (item.id === editingId ? next : item)) : [next, ...current]))
      setModalOpen(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this repair order?')) return
    try {
      await deleteRepair(id)
      setItems((current) => current.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Error deleting repair order:", err)
      setItems((current) => current.filter((item) => item.id !== id))
    }
  }

  const stats = useMemo(() => [
    { label: 'OPEN ORDERS', value: String(items.filter((item) => item.status !== 'completed').length) },
    { label: 'READY TODAY', value: String(items.filter((item) => item.status === 'ready').length) },
    { label: 'TOTAL VALUE', value: formatLKR(items.reduce((sum, item) => sum + item.amount, 0)) },
  ], [items])

  return (
    <AdminShell
      activeSection="repair-orders"
      action={
        <button type="button" onClick={openCreate} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black">
          New Order
        </button>
      }
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">Repair Orders</p>
          <p className="mt-1 text-sm text-neutral-700">Manage service tickets, technicians, and repair status.</p>
        </div>
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {stats.map((item) => (
          <article key={item.label} className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
            <p className="text-xs font-medium tracking-wide text-neutral-700">{item.label}</p>
            <p className="mt-2 text-lg font-medium text-neutral-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="mt-8 grid gap-4 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <RepairCard item={item} />
            <div className="absolute right-4 top-4 hidden items-center gap-3 group-hover:flex">
              <button type="button" onClick={() => openEdit(item)} className="text-sm font-semibold text-[#ef2027]">Edit</button>
              <button type="button" onClick={() => handleDelete(item.id)} className="text-sm font-semibold text-neutral-500 hover:text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-[#efefef]">
        <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_0.7fr] bg-[#d8d8d8] px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500">
          <span>Ticket ID</span>
          <span>Customer</span>
          <span>Device</span>
          <span>Status</span>
          <span>Technician</span>
          <span>Actions</span>
        </div>
        {items.map((item) => {
          const status = REPAIR_STATUS_META[item.status]

          return (
            <div key={item.id} className="grid grid-cols-[1fr_1.2fr_1.5fr_1fr_1fr_0.7fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
              <span className="font-semibold text-[#ef2027]">{item.id}</span>
              <span className="text-neutral-800">{item.customer}</span>
              <span className="text-neutral-800">{item.device}</span>
              <span><span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span></span>
              <span className="text-neutral-800">{item.technician}</span>
              <span className="flex items-center gap-3">
                <button type="button" onClick={() => openEdit(item)} className="font-semibold text-[#ef2027]">Edit</button>
                <button type="button" onClick={() => handleDelete(item.id)} className="font-semibold text-neutral-500 hover:text-red-600">Delete</button>
              </span>
            </div>
          )
        })}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form onSubmit={saveItem} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Repair Order</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit order' : 'Create order'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500">×</button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {['customer', 'device', 'technician', 'amount'].map((field) => (
                <label key={field}>
                  <span className="text-sm font-medium text-neutral-700 capitalize">{field}</span>
                  <input
                    required
                    type={field === 'amount' ? 'number' : 'text'}
                    value={form[field]}
                    onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                  />
                </label>
              ))}
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Issue</span>
                <textarea
                  required
                  rows="4"
                  value={form.issue}
                  onChange={(event) => setForm((current) => ({ ...current, issue: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Status</span>
                <select
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                >
                  {Object.entries(REPAIR_STATUS_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white">Save Order</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  )
}

>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0
export default RepairOrdersPage
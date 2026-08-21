import { useMemo, useState, useEffect } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { SALES_STATUS_META, formatLKR } from '../../data/adminPagesData'
import { getSales, createSale, updateSale, deleteSale } from '../../services/saleServices'

const defaultForm = {
  customer: '',
  payment: 'Transfer',
  total: '',
  status: 'complete',
}

export function SalesLogPage() {
  const [items, setItems] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const fetchItems = async () => {
    try {
      const res = await getSales()
      const data = res?.sales || res
      if (Array.isArray(data)) {
        const mapped = data.map((item) => ({
          id: item._id || item.id,
          customer: item.customerName || "Unknown",
          date: (item.createdAt || new Date().toISOString()).slice(0, 10),
          total: Number(item.total || 0),
          payment: item.paymentMethod || "Cash",
          status: item.status || "complete",
        }))
        setItems(mapped)
      }
    } catch (err) {
      console.error("Error fetching sales logs:", err)
    }
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const stats = useMemo(() => {
    const dailySales = items.reduce((sum, item) => sum + item.total, 0)
    const monthlyRevenue = dailySales * 18
    const openRepairs = 10

    return [
      { label: 'DAILY SALES', value: formatLKR(dailySales) },
      { label: 'MONTHLY REVENUE', value: formatLKR(monthlyRevenue) },
      { label: 'OPEN REPAIRS', value: String(openRepairs) },
    ]
  }, [items])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      customer: item.customer,
      payment: item.payment,
      total: String(item.total),
      status: item.status,
    })
    setModalOpen(true)
  }

  const saveItem = async (event) => {
    event.preventDefault()
    
    const payload = {
      customerName: form.customer,
      paymentMethod: form.payment,
      status: form.status,
      total: Number(form.total),
      items: [
        {
          name: "Sale Transaction",
          price: Number(form.total),
          quantity: 1,
        }
      ]
    }

    try {
      if (editingId) {
        await updateSale(editingId, payload)
      } else {
        await createSale(payload)
      }
      setModalOpen(false)
      fetchItems()
    } catch (err) {
      alert("Failed to save sale: " + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sales record?')) return
    try {
      await deleteSale(id)
      fetchItems()
    } catch (err) {
      alert("Failed to delete sale: " + err.message)
    }
  }

  return (
    <AdminShell
      activeSection="sales-log"
      action={
        <button type="button" onClick={openCreate} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black">
          Add Sale
        </button>
      }
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">Sales Log</p>
          <p className="mt-1 text-sm text-neutral-700">Track payments, totals, and sales statuses in LKR.</p>
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

      <section className="mt-8 rounded-2xl bg-[#efefef]">
        <div className="grid grid-cols-[1fr_1.2fr_0.9fr_0.8fr_1fr_0.9fr] bg-[#d8d8d8] px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
        </div>
        {items.map((item) => {
          const status = SALES_STATUS_META[item.status]

          return (
            <div key={item.id} className="grid grid-cols-[1fr_1.2fr_0.9fr_0.8fr_1fr_0.9fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
              <span className="font-semibold text-[#ef2027]">{item.id}</span>
              <span className="text-neutral-800">{item.customer}</span>
              <span className="text-neutral-700">{item.date}</span>
              <span className="font-medium text-neutral-900">{formatLKR(item.total)}</span>
              <span className="text-neutral-800">{item.payment}</span>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                <button type="button" onClick={() => openEdit(item)} className="font-semibold text-[#ef2027]">Edit</button>
                <button type="button" onClick={() => handleDelete(item.id)} className="font-semibold text-neutral-500 hover:text-red-600">Delete</button>
              </div>
            </div>
          )
        })}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form onSubmit={saveItem} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Sales Entry</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit sale' : 'Create sale'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500">×</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Customer</span>
                <input
                  required
                  value={form.customer}
                  onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Payment</span>
                <input
                  required
                  value={form.payment}
                  onChange={(event) => setForm((current) => ({ ...current, payment: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>
              <label>
                <span className="text-sm font-medium text-neutral-700">Total (LKR)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total}
                  onChange={(event) => setForm((current) => ({ ...current, total: event.target.value }))}
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
                  {Object.entries(SALES_STATUS_META).map(([value, meta]) => <option key={value} value={value}>{meta.label}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white">Save Sale</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default SalesLogPage
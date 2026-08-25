import { useMemo, useState, useEffect } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { SALES_STATUS_META, formatLKR } from '../../data/adminPagesData'
import { getSales, createSale, updateSale, deleteSale } from '../../services/saleServices'
import { getRepairs } from '../../services/repairServices'

const defaultForm = {
  customer: '',
  payment: 'Transfer',
  total: '',
  status: 'complete',
}

export function SalesLogPage() {
  const [items, setItems] = useState([])
  const [repairs, setRepairs] = useState([])
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
          orderId: item.orderId || item._id?.slice(-8)?.toUpperCase() || item.id?.slice(-8)?.toUpperCase() || "N/A",
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

  const fetchRepairs = async () => {
    try {
      const res = await getRepairs()
      const data = res?.data || res?.repairs || res || []
      if (Array.isArray(data)) {
        setRepairs(data)
      }
    } catch (err) {
      console.error("Error fetching repairs for sales stats:", err)
    }
  }

  useEffect(() => {
    fetchItems()
    fetchRepairs()
  }, [])

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    const thisMonthStr = new Date().toISOString().slice(0, 7)

    const dailySales = items
      .filter((item) => item.date === todayStr)
      .reduce((sum, item) => sum + item.total, 0)

    const monthlyRevenue = items
      .filter((item) => item.date.startsWith(thisMonthStr))
      .reduce((sum, item) => sum + item.total, 0)

    const openRepairs = repairs.filter(
      (r) => r.status && r.status.toLowerCase() !== 'completed'
    ).length

    return [
      { label: 'DAILY SALES', value: formatLKR(dailySales) },
      { label: 'MONTHLY REVENUE', value: formatLKR(monthlyRevenue) },
      { label: 'OPEN REPAIRS', value: String(openRepairs) },
    ]
  }, [items, repairs])

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
      fetchRepairs()
    } catch (err) {
      alert("Failed to save sale: " + err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sales record?')) return
    try {
      await deleteSale(id)
      fetchItems()
      fetchRepairs()
    } catch (err) {
      alert("Failed to delete sale: " + err.message)
    }
  }

  return (
    <AdminShell
      activeSection="sales-log"
      action={
        <button type="button" onClick={openCreate} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black cursor-pointer">
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

      <section className="mt-8 overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#d8d8d8] text-[11px] font-bold uppercase tracking-wide text-red-500 border-b border-neutral-200">
              <th className="px-6 py-3">Order ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Payment</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => {
              const status = SALES_STATUS_META[item.status]

              return (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#ef2027]">{item.orderId}</td>
                  <td className="px-6 py-4 text-neutral-800 font-medium">{item.customer}</td>
                  <td className="px-6 py-4 text-neutral-700">{item.date}</td>
                  <td className="px-6 py-4 font-medium text-neutral-900">{formatLKR(item.total)}</td>
                  <td className="px-6 py-4 text-neutral-800">{item.payment}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button type="button" onClick={() => openEdit(item)} className="font-semibold text-[#ef2027] cursor-pointer hover:underline">Edit</button>
                      <button type="button" onClick={() => handleDelete(item.id)} className="font-semibold text-neutral-500 hover:text-red-600 cursor-pointer hover:underline">Delete</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form onSubmit={saveItem} className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Sales Entry</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit sale' : 'Create sale'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500 cursor-pointer hover:text-neutral-700">×</button>
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
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white cursor-pointer hover:bg-[#ef2027]/90">Save Sale</button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default SalesLogPage
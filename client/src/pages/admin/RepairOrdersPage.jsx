import { useMemo, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

import { AdminShell } from '../../components/admin/AdminShell'
import ConfirmModal from '../../components/common/ConfirmModal'
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

function RepairCard({ item, onEdit, onDelete }) {
  const status = REPAIR_STATUS_META[item.status] || { label: item.status || 'Pending', className: 'bg-neutral-100 text-neutral-700' }

  return (
    <article className="rounded-2xl border border-[#e7e7e7] bg-[#efefef] p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
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
      </div>
      
      <div className="mt-5 pt-4 border-t border-neutral-300 flex items-center justify-end gap-3">
        <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#ef2027] cursor-pointer hover:underline">Edit</button>
        <button type="button" onClick={onDelete} className="text-sm font-semibold text-neutral-500 hover:text-red-600 cursor-pointer hover:underline">Delete</button>
      </div>
    </article>
  )
}

export function RepairOrdersPage() {
  const [items, setItems] = useState(REPAIR_ORDERS)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [itemToDeleteId, setItemToDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchItems = async () => {
    try {
      const res = await getRepairs()
      const data = res?.data || res
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((item) => ({
          id: item.trackingId || item._id,
          customer: item.customer || item.customerName || "Unknown",
          device: item.device || `${item.brand || ""} ${item.model || ""}`.trim() || "Device",
          issue: item.issue || "",
          technician: item.technician || "Unassigned",
          status: item.status || "pending",
          amount: Number(item.amount || item.estimate || item.estimatedCost || 0),
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
        toast.success('Repair order updated successfully!')
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
        toast.success('Repair order created successfully!')
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
      toast.success(editingId ? 'Repair order updated.' : 'Repair order created.')
      setModalOpen(false)
    }
  }

  const handleDelete = (id) => {
    setItemToDeleteId(id)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDeleteId) return
    setIsDeleting(true)
    try {
      await deleteRepair(itemToDeleteId)
      setItems((current) => current.filter((item) => item.id !== itemToDeleteId))
      toast.success('Repair order deleted successfully.')
      setItemToDeleteId(null)
    } catch (err) {
      console.error("Error deleting repair order:", err)
      setItems((current) => current.filter((item) => item.id !== itemToDeleteId))
      toast.success('Repair order deleted.')
      setItemToDeleteId(null)
    } finally {
      setIsDeleting(false)
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
        <button type="button" onClick={openCreate} className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black cursor-pointer">
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
          <RepairCard
            key={item.id}
            item={item}
            onEdit={() => openEdit(item)}
            onDelete={() => handleDelete(item.id)}
          />
        ))}
      </section>

      <section className="mt-8 overflow-x-auto rounded-xl border border-neutral-300 bg-white">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-[#d8d8d8] text-[11px] font-bold uppercase tracking-wide text-red-500 border-b border-neutral-200">
              <th className="px-6 py-3">Ticket ID</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Device</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Technician</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {items.map((item) => {
              const status = REPAIR_STATUS_META[item.status] || { label: item.status || 'Pending', className: 'bg-neutral-100 text-neutral-700' }

              return (
                <tr key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-[#ef2027]">{item.id}</td>
                  <td className="px-6 py-4 text-neutral-800 font-medium">{item.customer}</td>
                  <td className="px-6 py-4 text-neutral-800">{item.device}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-800">{item.technician}</td>
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
          <form onSubmit={saveItem} className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Repair Order</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit order' : 'Create order'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500 cursor-pointer hover:text-neutral-700">×</button>
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
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50">Cancel</button>
              <button type="submit" className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white cursor-pointer hover:bg-[#ef2027]/90">Save Order</button>
            </div>
          </form>
        </div>
      ) : null}

      {/* Delete Repair Order Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDeleteId)}
        title="Delete Repair Order"
        message="Are you sure you want to delete this repair order? This record will be permanently removed."
        confirmText="Delete Order"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDeleteId(null)}
      />
    </AdminShell>
  )
}

export default RepairOrdersPage
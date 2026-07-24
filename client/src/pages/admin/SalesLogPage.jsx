import { useEffect, useMemo, useState } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { formatLKR } from '../../data/adminPagesData'
import { createSale, deleteSale, getSales, updateSale } from '../../services/saleServices'
import { getProducts } from '../../services/productServices'

const SALES_STATUS_META = {
  complete: { label: 'Complete', className: 'bg-green-100 text-green-700' },
  processing: { label: 'Processing', className: 'bg-blue-100 text-blue-700' },
  refunded: { label: 'Refunded', className: 'bg-red-100 text-red-600' },
}

const defaultItem = () => ({ productId: '', quantity: 1 })

const normalizeItems = (items) => {
  const merged = new Map()

  items.forEach((item) => {
    if (!item.productId || Number(item.quantity) <= 0) return

    const existing = merged.get(item.productId)
    merged.set(item.productId, {
      productId: item.productId,
      quantity: (existing?.quantity || 0) + Number(item.quantity),
    })
  })

  return Array.from(merged.values())
}

const defaultForm = {
  customerName: '',
  status: 'complete',
  items: [defaultItem()],
}

const normalizeSale = (sale) => ({
  id: sale._id || sale.id,
  customerName: sale.customerName,
  date: (sale.createdAt || sale.date || '').slice(0, 10),
  total: Number(sale.total) || 0,
  status: sale.status || 'complete',
  paymentMethod: sale.paymentMethod || 'Cash',
  items: sale.items || [],
  stockAdjusted: Boolean(sale.stockAdjusted),
})

export function SalesLogPage() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(defaultForm)

  const productOptions = useMemo(
    () => products.map((product) => ({
      id: product._id || product.id,
      name: product.name,
      sellPrice: Number(product.sellPrice ?? product.price) || 0,
      stock: Number(product.stock) || 0,
    })),
    [products],
  )

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [salesResponse, productsResponse] = await Promise.all([
        getSales(),
        getProducts({ limit: 500, page: 1 }),
      ])

      setSales((salesResponse?.sales || []).map(normalizeSale))
      setProducts(productsResponse?.products || [])
    } catch (err) {
      setError(err.message || 'Unable to load sales data.')
      setSales([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const openCreate = () => {
    setEditingId(null)
    setForm(defaultForm)
    setModalOpen(true)
  }

  const openEdit = (sale) => {
    setEditingId(sale.id)
    setForm({
      customerName: sale.customerName,
      status: sale.status,
      items: sale.items?.length
        ? sale.items.map((item) => ({
          productId: item.product || item.productId,
          quantity: Number(item.quantity) || 1,
        }))
        : [defaultItem()],
    })
    setModalOpen(true)
  }

  const saleSubtotal = useMemo(() => {
    return form.items.reduce((sum, item) => {
      const product = productOptions.find((entry) => entry.id === item.productId)
      return sum + (Number(product?.sellPrice) || 0) * (Number(item.quantity) || 0)
    }, 0)
  }, [form.items, productOptions])

  const updateItem = (index, key, value) => {
    setForm((current) => {
      const nextItems = [...current.items]
      nextItems[index] = { ...nextItems[index], [key]: value }
      return { ...current, items: nextItems }
    })
  }

  const addItem = () => setForm((current) => ({ ...current, items: [...current.items, defaultItem()] }))

  const removeItem = (index) => {
    setForm((current) => ({
      ...current,
      items: current.items.length === 1 ? [defaultItem()] : current.items.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  const saveSale = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const normalizedItems = normalizeItems(form.items)

      const payload = {
        customerName: form.customerName,
        status: form.status,
        total: saleSubtotal,
        items: normalizedItems,
      }

      if (payload.items.length === 0) {
        throw new Error('Add at least one valid product to the sale.')
      }

      if (editingId) {
        await updateSale(editingId, payload)
      } else {
        await createSale(payload)
      }

      setModalOpen(false)
      setEditingId(null)
      setForm(defaultForm)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to save sale.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (saleId) => {
    if (!window.confirm('Delete this sales record? Inventory will be restored if stock was adjusted.')) return

    try {
      await deleteSale(saleId)
      await loadData()
    } catch (err) {
      setError(err.message || 'Unable to delete sale.')
    }
  }

  const stats = useMemo(() => {
    const completedSales = sales.filter((sale) => sale.status === 'complete')
    const dailySales = completedSales.reduce((sum, sale) => sum + sale.total, 0)
    const monthlyRevenue = dailySales * 18
    const totalItemsSold = completedSales.reduce((sum, sale) => sum + sale.items.reduce((count, item) => count + Number(item.quantity || 0), 0), 0)

    return [
      { label: 'DAILY SALES', value: formatLKR(dailySales) },
      { label: 'MONTHLY REVENUE', value: formatLKR(monthlyRevenue) },
      { label: 'ITEMS SOLD', value: String(totalItemsSold) },
    ]
  }, [sales])

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
          <p className="mt-1 text-sm text-neutral-700">Cash sales only. Stock is reduced when a sale is marked Complete.</p>
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

      <section className="mt-8 rounded-2xl bg-[#efefef]">
        <div className="grid grid-cols-[0.9fr_1.2fr_0.9fr_0.9fr_1fr_1fr_0.9fr] bg-[#d8d8d8] px-6 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500">
          <span>Order ID</span>
          <span>Customer</span>
          <span>Date</span>
          <span>Total</span>
          <span>Payment</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-center text-sm text-neutral-600">Loading sales...</div>
        ) : sales.length > 0 ? (
          sales.map((sale) => {
            const status = SALES_STATUS_META[sale.status] || SALES_STATUS_META.complete

            return (
              <div key={sale.id} className="grid grid-cols-[0.9fr_1.2fr_0.9fr_0.9fr_1fr_1fr_0.9fr] items-center border-b border-neutral-200 px-6 py-4 text-sm last:border-b-0">
                <span className="font-semibold text-[#ef2027]">{sale.id}</span>
                <span className="text-neutral-800">{sale.customerName}</span>
                <span className="text-neutral-700">{sale.date}</span>
                <span className="font-medium text-neutral-900">{formatLKR(sale.total)}</span>
                <span className="text-neutral-800">{sale.paymentMethod}</span>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${status.className}`}>{status.label}</span>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => openEdit(sale)} className="font-semibold text-[#ef2027]">Edit</button>
                  <button type="button" onClick={() => handleDelete(sale.id)} className="font-semibold text-neutral-500 hover:text-red-600">Delete</button>
                </div>
              </div>
            )
          })
        ) : (
          <div className="px-6 py-8 text-center text-sm text-neutral-600">No sales recorded yet.</div>
        )}
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <form onSubmit={saveSale} className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">Sales Entry</p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">{editingId ? 'Edit sale' : 'Create sale'}</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} className="text-2xl leading-none text-neutral-500">×</button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Customer Name</span>
                <input
                  required
                  value={form.customerName}
                  onChange={(event) => setForm((current) => ({ ...current, customerName: event.target.value }))}
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
                  {Object.entries(SALES_STATUS_META).map(([value, meta]) => (
                    <option key={value} value={value}>{meta.label}</option>
                  ))}
                </select>
              </label>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-neutral-700">Sale Items</p>
                  <button type="button" onClick={addItem} className="rounded-lg bg-[#ef2027] px-3 py-2 text-xs font-semibold text-white">Add Item</button>
                </div>

                <div className="mt-3 space-y-3">
                  {form.items.map((item, index) => (
                    <div key={`${index}-${item.productId}`} className="grid gap-3 rounded-xl border border-neutral-200 p-3 md:grid-cols-[2fr_1fr_auto]">
                      <select
                        required
                        value={item.productId}
                        onChange={(event) => updateItem(index, 'productId', event.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                      >
                        <option value="">Select product</option>
                        {productOptions.map((product) => (
                          <option key={product.id} value={product.id} disabled={product.stock <= 0}>
                            {product.name} {product.stock <= 0 ? '(Out of stock)' : `- ${product.stock} available`}
                          </option>
                        ))}
                      </select>

                      <input
                        required
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) => updateItem(index, 'quantity', event.target.value)}
                        className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                      />

                      <button type="button" onClick={() => removeItem(index)} className="rounded-xl border border-neutral-300 px-4 py-3 text-sm font-semibold text-neutral-700">
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Cash Payment</span>
                <input
                  value="Cash"
                  disabled
                  className="mt-1 w-full rounded-xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-600 outline-none"
                />
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
              <span>Subtotal</span>
              <span className="font-semibold text-neutral-900">{formatLKR(saleSubtotal)}</span>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Sale'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default SalesLogPage
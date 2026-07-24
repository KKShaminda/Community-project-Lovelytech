import { useEffect, useMemo, useState } from 'react'

import { AdminShell } from '../../components/admin/AdminShell'
import { createProduct, deleteProduct, getProducts, updateProduct } from '../../services/productServices'

const REFRESH_INTERVAL_MS = 30000
const DEFAULT_LIMIT = 500

const formatLKR = (value = 0) =>
  new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0)

const stockFillFor = (stock) => {
  if (stock <= 5) return '18%'
  if (stock <= 20) return '38%'
  if (stock <= 60) return '68%'
  if (stock <= 120) return '82%'
  return '94%'
}

const normalizeProduct = (product) => ({
  id: product._id || product.id,
  name: product.name,
  sku: product.sku || product.code || product._id?.slice(-8)?.toUpperCase() || 'N/A',
  category: product.category || 'Uncategorized',
  stock: Number(product.stock) || 0,
  buyPrice: Number(product.buyPrice) || 0,
  sellPrice: Number(product.sellPrice ?? product.price) || 0,
  brand: product.brand || '',
  description: product.description || '',
  image: product.images?.[0]?.url || '',
  isActive: product.isActive ?? true,
  status: Number(product.stock) > 0 ? 'In Stock' : 'Low Stock',
})

const CATEGORIES = [
  'Mobile Phones',
  'Laptops',
  'Desktops',
  'iPads & Tablets',
  'Speakers & Audios',
]

const emptyForm = {
  name: '',
  category: CATEGORIES[0],
  brand: '',
  description: '',
  buyPrice: '',
  sellPrice: '',
  stock: '',
  isActive: true,
  images: [],
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
      <p className="text-xs font-medium tracking-wide text-neutral-700">{label}</p>
      <p className="mt-2 text-lg font-medium text-neutral-900">{value}</p>
    </article>
  )
}

function InventoryRow({ item }) {
  return (
    <div className="grid grid-cols-[1.6fr_1fr_1fr_0.95fr_0.95fr_0.9fr_0.5fr] items-center border-b border-neutral-200 px-4 py-4 text-sm last:border-b-0 lg:px-6">
      <div className="flex items-center gap-3">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-8 w-8 rounded-md object-cover" />
        ) : (
          <div className="h-8 w-8 rounded-md bg-neutral-900/90" />
        )}
        <div>
          <p className="font-semibold text-neutral-900">{item.name}</p>
          <p className="text-[11px] text-neutral-600">SKU: {item.sku}</p>
        </div>
      </div>
      <span className="text-neutral-800">{item.category}</span>
      <span className={`inline-flex w-fit items-center gap-2 font-medium ${item.stockClass}`}>
        {item.stock} Units
        <span className="block h-1.5 w-16 rounded-full bg-neutral-900/80">
          <span className={`block h-full rounded-full ${item.barClass}`} style={{ width: item.barWidth }} />
        </span>
      </span>
      <span className="font-medium text-neutral-900">{item.buyPrice}</span>
      <span className="font-medium text-neutral-900">{item.sellPrice}</span>
      <span>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${item.statusClass}`}>{item.status}</span>
      </span>
      <button type="button" className="text-sm font-semibold text-[#ef2027]">Edit</button>
    </div>
  )
}

export function InventoryManagementPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savingError, setSavingError] = useState('')
  const [editingProduct, setEditingProduct] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const loadProducts = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await getProducts({ limit: DEFAULT_LIMIT, page: 1 })
      setProducts((response?.products || []).map(normalizeProduct))
    } catch (err) {
      setError(err.message || 'Unable to load inventory from the product catalog.')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProducts()
    const intervalId = window.setInterval(loadProducts, REFRESH_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [])

  const openCreateModal = () => {
    setEditingProduct(null)
    setSavingError('')
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    setEditingProduct(item)
    setSavingError('')
    setForm({
      name: item.name,
      category: item.category,
      brand: item.brand || '',
      description: item.description || '',
      buyPrice: String(item.buyPrice || ''),
      sellPrice: String(item.sellPrice || ''),
      stock: String(item.stock || ''),
      isActive: item.isActive ?? true,
      images: [],
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingProduct(null)
    setSavingError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSavingError('')

    try {
      const payload = {
        ...form,
        buyPrice: Number(form.buyPrice),
        sellPrice: Number(form.sellPrice),
        stock: Number(form.stock),
        isActive: Boolean(form.isActive),
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await createProduct(payload)
      }

      setModalOpen(false)
      setEditingProduct(null)
      setForm(emptyForm)
      await loadProducts()
    } catch (err) {
      setSavingError(err.message || 'Unable to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete ${item.name}?`)) return

    try {
      await deleteProduct(item.id)
      await loadProducts()
    } catch (err) {
      setError(err.message || 'Unable to delete product.')
    }
  }

  const inventoryStats = useMemo(() => {
    const totalProducts = products.length
    const lowStockCount = products.filter((product) => product.stock > 0 && product.stock <= 10).length
    const inventoryValue = products.reduce((sum, product) => sum + product.buyPrice * product.stock, 0)

    return [
      { label: 'TOTAL PRODUCTS', value: String(totalProducts) },
      { label: 'LOW STOCK ALERT', value: String(lowStockCount) },
      { label: 'INVENTORY VALUE', value: formatLKR(inventoryValue) },
    ]
  }, [products])

  const inventoryItems = useMemo(
    () =>
      products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        stock: product.stock,
        stockClass: product.stock > 10 ? 'text-emerald-700' : 'text-red-600',
        barWidth: stockFillFor(product.stock),
        barClass: product.stock > 10 ? 'bg-emerald-500' : 'bg-red-500',
        buyPrice: formatLKR(product.buyPrice),
        sellPrice: formatLKR(product.sellPrice),
        image: product.image,
        status: product.status,
        statusClass: product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-red-500',
      })),
    [products],
  )

  return (
    <AdminShell activeSection="inventory">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <p className="text-2xl font-bold text-neutral-900">Inventory Management</p>
          <p className="mt-1 text-sm text-neutral-700">Real-time tracking of accessories</p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-gradient-to-b from-[#ff4c4f] to-[#e01c23] px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(224,28,35,0.32)]"
        >
          <span className="text-base leading-none">⊕</span>
          Add Product
        </button>
      </div>

      <section className="mt-6 grid gap-4 xl:grid-cols-3">
        {inventoryStats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} />
        ))}
      </section>

      <section className="mt-8 rounded-2xl bg-[#efefef] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-w-0 flex-1 items-center rounded-lg border border-neutral-300 bg-white px-4 py-2 shadow-inner">
            <span className="mr-3 text-neutral-500">⌕</span>
            <input
              type="text"
              placeholder="Search product name, SKU, or category..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          </label>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#ef2027] px-4 py-2 text-sm font-semibold text-white">
              <span>≡</span>
              Filters
            </button>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-[#ef2027] px-4 py-2 text-sm font-semibold text-white">
              <span>⇩</span>
              Export CSV
            </button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl border border-neutral-300 bg-white">
          <div className="grid grid-cols-[1.6fr_1fr_1fr_0.95fr_0.95fr_0.9fr_0.5fr] bg-[#d8d8d8] px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-red-500 lg:px-6">
            <span>Product Name</span>
            <span>Category</span>
            <span>Stock Level</span>
            <span>Buy Price</span>
            <span>Sell Price</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center text-sm text-neutral-600 lg:px-6">Loading inventory from the product catalog...</div>
          ) : inventoryItems.length > 0 ? (
            inventoryItems.map((item) => (
              <div key={item.id} className="group relative">
                <InventoryRow item={item} />
                <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 items-center gap-3 group-hover:flex lg:right-6">
                  <button type="button" onClick={() => openEditModal(item)} className="text-sm font-semibold text-[#ef2027]">Edit</button>
                  <button type="button" onClick={() => handleDelete(item)} className="text-sm font-semibold text-neutral-500 hover:text-red-600">Delete</button>
                </div>
              </div>
            ))
          ) : (
            <div className="px-4 py-8 text-center text-sm text-neutral-600 lg:px-6">No active products found in the catalog.</div>
          )}

          <div className="flex flex-col gap-4 border-t border-neutral-200 bg-[#efefef] px-4 py-3 text-sm text-neutral-800 lg:flex-row lg:items-center lg:justify-between lg:px-6">
            <p>Showing 1-{Math.min(inventoryItems.length || 1, DEFAULT_LIMIT)} of {products.length} products</p>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white">◀</button>
              <button type="button" className="rounded-md bg-[#ef2027] px-3 py-1 text-[11px] font-semibold text-white">1</button>
              <button type="button" className="rounded-md bg-neutral-400 px-3 py-1 text-[11px] font-semibold text-white">2</button>
              <button type="button" className="rounded-md bg-neutral-400 px-3 py-1 text-[11px] font-semibold text-white">3</button>
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white">▶</button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ef2027]">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-neutral-900">
                  {editingProduct ? 'Update catalog item' : 'Add a catalog item'}
                </h3>
              </div>
              <button type="button" onClick={closeModal} className="text-2xl leading-none text-neutral-500">×</button>
            </div>

            {savingError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {savingError}
              </div>
            ) : null}

            <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Product Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-neutral-700">Category</span>
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-medium text-neutral-700">Brand</span>
                <input
                  value={form.brand}
                  onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Description</span>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-neutral-700">Buy Price (LKR)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.buyPrice}
                  onChange={(event) => setForm((current) => ({ ...current, buyPrice: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label>
                <span className="text-sm font-medium text-neutral-700">Sell Price (LKR)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.sellPrice}
                  onChange={(event) => setForm((current) => ({ ...current, sellPrice: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Stock</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={form.stock}
                  onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label className="md:col-span-2">
                <span className="text-sm font-medium text-neutral-700">Product Photos (max 5)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => {
                    const files = Array.from(event.target.files || [])
                    setForm((current) => ({ ...current, images: files }))
                  }}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none file:mr-4 file:rounded-lg file:border-0 file:bg-[#ef2027] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
                />
              </label>

              <label className="md:col-span-2 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  className="h-4 w-4 rounded border-neutral-300 text-[#ef2027] focus:ring-[#ef2027]"
                />
                <span className="text-sm font-medium text-neutral-700">Active in catalog</span>
              </label>

              <div className="md:col-span-2 mt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={closeModal} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </AdminShell>
  )
}

export default InventoryManagementPage
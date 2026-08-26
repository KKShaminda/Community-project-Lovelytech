import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { AdminShell } from '../../components/admin/AdminShell'
import ConfirmModal from '../../components/common/ConfirmModal'
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

const normalizeProduct = (product) => {
  const stock = Number(product.stock) || 0
  let status = 'In Stock'
  let statusClass = 'bg-emerald-100 text-emerald-700'
  let stockClass = 'text-emerald-700'
  let barClass = 'bg-emerald-500'

  if (stock === 0) {
    status = 'Out of Stock'
    statusClass = 'bg-red-105 text-red-600 border border-red-200'
    stockClass = 'text-red-600 font-bold'
    barClass = 'bg-red-500'
  } else if (stock <= 5) {
    status = 'Low Stock'
    statusClass = 'bg-amber-100 text-amber-750 border border-amber-200'
    stockClass = 'text-amber-600 font-bold'
    barClass = 'bg-amber-500'
  }

  return {
    id: product._id || product.id,
    name: product.name,
    sku: product.sku || product.code || product._id?.slice(-8)?.toUpperCase() || 'N/A',
    category: product.category || 'Uncategorized',
    stock,
    price: Number(product.price) || 0,
    brand: product.brand || '',
    description: product.description || '',
    isActive: product.isActive ?? true,
    images: product.images || [],
    status,
    statusClass,
    stockClass,
    barWidth: stockFillFor(stock),
    barClass,
  }
}

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
  price: '',
  stock: '',
  isActive: true,
}

function StatCard({ label, value }) {
  return (
    <article className="rounded-2xl border border-red-400 bg-[#efefef] p-4">
      <p className="text-xs font-medium tracking-wide text-neutral-700">{label}</p>
      <p className="mt-2 text-lg font-medium text-neutral-900">{value}</p>
    </article>
  )
}

function InventoryRow({ item, onEdit, onDelete }) {
  const imageUrl = item.images && item.images[0] ? item.images[0].url : ''

  return (
    <tr className="hover:bg-neutral-50 transition-colors border-b border-neutral-200 last:border-b-0">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          {imageUrl ? (
            <img src={imageUrl} alt={item.name} className="h-10 w-10 rounded-lg object-cover border border-neutral-200" />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-neutral-900/90 flex items-center justify-center text-white text-[9px] font-bold">No Image</div>
          )}
          <div>
            <p className="font-semibold text-neutral-900 leading-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-500 mt-0.5">SKU: {item.sku}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-neutral-800 font-medium">{item.category}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${item.stockClass} min-w-[65px]`}>
            {item.stock} Units
          </span>
          <div className="hidden sm:block h-1.5 w-16 rounded-full bg-neutral-200 overflow-hidden">
            <div className={`h-full rounded-full ${item.barClass}`} style={{ width: item.barWidth }} />
          </div>
        </div>
      </td>
      <td className="px-6 py-4 font-semibold text-neutral-900">{item.priceFormatted}</td>
      <td className="px-6 py-4">
        <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${item.statusClass}`}>{item.status}</span>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={onEdit} className="text-sm font-semibold text-[#ef2027] cursor-pointer hover:underline">Edit</button>
          <button type="button" onClick={onDelete} className="text-sm font-semibold text-neutral-500 hover:text-red-600 cursor-pointer hover:underline">Delete</button>
        </div>
      </td>
    </tr>
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
  const [itemToDelete, setItemToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Interactive Filters & Search State
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Product Images Upload State
  const [selectedFiles, setSelectedFiles] = useState([]) // File objects
  const [previewUrls, setPreviewUrls] = useState([]) // Preview object URLs
  const [existingImages, setExistingImages] = useState([]) // Saved image records
  const [removeImages, setRemoveImages] = useState([]) // List of image paths to remove

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
    setSelectedFiles([])
    setPreviewUrls([])
    setExistingImages([])
    setRemoveImages([])
    setModalOpen(true)
  }

  const openEditModal = (item) => {
    const origProduct = products.find(p => p.id === item.id) || item
    setEditingProduct(item)
    setSavingError('')
    setForm({
      name: item.name,
      category: item.category,
      brand: item.brand || '',
      description: item.description || '',
      price: String(item.price || ''),
      stock: String(item.stock || ''),
      isActive: item.isActive ?? true,
    })
    setSelectedFiles([])
    setPreviewUrls([])
    setExistingImages(origProduct.images || [])
    setRemoveImages([])
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    setModalOpen(false)
    setEditingProduct(null)
    setSavingError('')
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const totalCurrentImages = existingImages.length + selectedFiles.length
    if (totalCurrentImages + files.length > 5) {
      toast.error('You can only upload up to 5 images per product.')
      return
    }

    const newPreviewUrls = files.map(file => URL.createObjectURL(file))
    setSelectedFiles(prev => [...prev, ...files])
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removeSelectedFile = (index) => {
    URL.revokeObjectURL(previewUrls[index])
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (img, index) => {
    setRemoveImages(prev => [...prev, img.path])
    setExistingImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSavingError('')

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        isActive: Boolean(form.isActive),
        images: selectedFiles,
        removeImages: removeImages,
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
        toast.success('Product updated successfully!')
      } else {
        await createProduct(payload)
        toast.success('Product created successfully!')
      }

      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setModalOpen(false)
      setEditingProduct(null)
      setForm(emptyForm)
      await loadProducts()
    } catch (err) {
      const msg = err.message || 'Unable to save product.'
      setSavingError(msg)
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (item) => {
    setItemToDelete(item)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return
    setIsDeleting(true)

    try {
      await deleteProduct(itemToDelete.id)
      toast.success(`${itemToDelete.name} deleted successfully.`)
      setItemToDelete(null)
      await loadProducts()
    } catch (err) {
      const msg = err.message || 'Unable to delete product.'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExportCSV = () => {
    if (inventoryItems.length === 0) return

    const headers = ['Product Name', 'SKU', 'Category', 'Brand', 'Stock Level', 'Unit Price', 'Status']
    const rows = inventoryItems.map(p => [
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.sku}"`,
      `"${p.category}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      p.stock,
      p.price,
      `"${p.status}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `inventory_export_${new Date().toISOString().slice(0, 10)}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const inventoryStats = useMemo(() => {
    const totalProducts = products.length
    const lowStockCount = products.filter((product) => product.stock <= 5).length
    const inventoryValue = products.reduce((sum, product) => sum + product.price * product.stock, 0)

    return [
      { label: 'TOTAL PRODUCTS', value: String(totalProducts) },
      { label: 'LOW STOCK ALERT', value: String(lowStockCount) },
      { label: 'INVENTORY VALUE', value: formatLKR(inventoryValue) },
    ]
  }, [products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch =
        !search.trim() ||
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.sku.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()))

      const matchesCategory =
        categoryFilter === 'All' || product.category === categoryFilter

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'In Stock' && product.stock > 5) ||
        (statusFilter === 'Low Stock' && product.stock > 0 && product.stock <= 5) ||
        (statusFilter === 'Out of Stock' && product.stock === 0)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [products, search, categoryFilter, statusFilter])

  const inventoryItems = useMemo(
    () =>
      filteredProducts.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        stock: product.stock,
        stockClass: product.stockClass,
        barWidth: product.barWidth,
        barClass: product.barClass,
        price: product.price,
        priceFormatted: formatLKR(product.price),
        status: product.status,
        statusClass: product.statusClass,
        images: product.images,
        isActive: product.isActive,
        brand: product.brand,
        description: product.description,
      })),
    [filteredProducts],
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
          className="rounded-full border border-[#ff2020] px-5 py-2.5 text-sm font-semibold text-[#ff2020] hover:bg-[#ff2020] hover:text-black cursor-pointer"
        >
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
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name, SKU, or category..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500"
            />
          </label>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all cursor-pointer ${
                filtersOpen ? 'bg-neutral-800' : 'bg-[#ef2027] hover:bg-[#ef2027]/90'
              }`}
            >
              <span>≡</span>
              Filters
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 rounded-lg bg-[#ef2027] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ef2027]/90 cursor-pointer"
            >
              <span>⇩</span>
              Export CSV
            </button>
          </div>
        </div>

        {filtersOpen ? (
          <div className="mt-4 grid gap-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Category</p>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-[#ef2027] bg-white text-neutral-800"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Stock Status</p>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-sm outline-none focus:border-[#ef2027] bg-white text-neutral-800"
              >
                <option value="All">All Stock Statuses</option>
                <option value="In Stock">In Stock (&gt; 5 units)</option>
                <option value="Low Stock">Low Stock (1-5 units)</option>
                <option value="Out of Stock">Out of Stock (0 units)</option>
              </select>
            </div>

            <div className="flex items-end justify-end md:col-span-2 lg:col-span-1">
              <button
                type="button"
                onClick={() => {
                  setCategoryFilter('All')
                  setStatusFilter('All')
                  setSearch('')
                }}
                className="w-full lg:w-auto rounded-xl border border-neutral-300 px-5 py-2 text-sm font-semibold text-neutral-600 hover:bg-neutral-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-300 bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#d8d8d8] text-[11px] font-bold uppercase tracking-wide text-red-500 border-b border-neutral-200">
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Stock Level</th>
                <th className="px-6 py-3">Unit Price</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-neutral-600">Loading inventory from the product catalog...</td>
                </tr>
              ) : inventoryItems.length > 0 ? (
                inventoryItems.map((item) => (
                  <InventoryRow
                    key={item.id}
                    item={item}
                    onEdit={() => openEditModal(item)}
                    onDelete={() => handleDelete(item)}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-sm text-neutral-600">No active products found in the catalog.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="flex flex-col gap-4 border-t border-neutral-200 bg-[#efefef] px-6 py-3 text-sm text-neutral-800 lg:flex-row lg:items-center lg:justify-between">
            <p>Showing 1-{Math.min(inventoryItems.length || 1, DEFAULT_LIMIT)} of {products.length} products</p>
            <div className="flex items-center gap-2">
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">◀</button>
              <button type="button" className="rounded-md bg-[#ef2027] px-3 py-1 text-[11px] font-semibold text-white cursor-pointer">1</button>
              <button type="button" className="rounded-md bg-neutral-400 px-3 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">2</button>
              <button type="button" className="rounded-md bg-neutral-400 px-3 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">3</button>
              <button type="button" className="rounded-md bg-neutral-400 px-2 py-1 text-[11px] font-semibold text-white cursor-pointer hover:bg-neutral-500">▶</button>
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
              <button type="button" onClick={closeModal} className="text-2xl leading-none text-neutral-500 cursor-pointer hover:text-neutral-700">×</button>
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

              <div className="md:col-span-2 border-t border-neutral-100 pt-4 mt-2">
                <span className="text-sm font-medium text-neutral-700">Product Images (Max 5)</span>
                
                {/* Images grid for previews */}
                <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-5">
                  {/* Previews of existing images */}
                  {existingImages.map((img, idx) => (
                    <div key={`exist-${idx}`} className="relative aspect-square rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
                      <img src={img.url} alt={img.filename} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img, idx)}
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md hover:scale-105 transition-all leading-none"
                      >
                        <span className="text-xs font-bold leading-none block px-1 py-0.5">×</span>
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white text-center py-0.5 truncate">
                        Saved
                      </span>
                    </div>
                  ))}

                  {/* Previews of newly selected images */}
                  {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative aspect-square rounded-xl border border-neutral-200 overflow-hidden bg-neutral-50 group">
                      <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(idx)}
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-650 text-white rounded-full p-1 shadow-md hover:scale-105 transition-all leading-none"
                      >
                        <span className="text-xs font-bold leading-none block px-1 py-0.5">×</span>
                      </button>
                      <span className="absolute bottom-0 inset-x-0 bg-blue-500/80 text-[9px] text-white text-center py-0.5 truncate">
                        New
                      </span>
                    </div>
                  ))}

                  {/* Upload button box */}
                  {existingImages.length + selectedFiles.length < 5 ? (
                    <label className="flex aspect-square flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 cursor-pointer hover:bg-neutral-100 hover:border-[#ef2027] transition-all">
                      <span className="text-2xl text-neutral-400 font-light">+</span>
                      <span className="text-[10px] text-neutral-500 mt-1">Upload</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : null}
                </div>
                <p className="text-[11px] text-neutral-500 mt-2">
                  Add up to 5 images. You currently have {existingImages.length} saved and {selectedFiles.length} new images selected.
                </p>
              </div>

              <label>
                <span className="text-sm font-medium text-neutral-700">Price (LKR)</span>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-[#ef2027]"
                />
              </label>

              <label>
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
                <button type="button" onClick={closeModal} className="rounded-xl border border-neutral-300 px-5 py-3 text-sm font-semibold text-neutral-700 cursor-pointer hover:bg-neutral-50">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-[#ef2027] px-5 py-3 text-sm font-semibold text-white cursor-pointer hover:bg-[#ef2027]/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Delete Product Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Product"
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This product will be removed from the catalog.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setItemToDelete(null)}
      />
    </AdminShell>
  )
}

export default InventoryManagementPage
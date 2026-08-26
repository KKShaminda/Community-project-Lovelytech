import { useState, useMemo, useEffect } from 'react'
import {
  ShoppingBag,
  Search,
  Trash2,
  X,
  Check,
  Truck,
  ClipboardList,
  ArrowRight,
  Package,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import ConfirmModal from '../../components/common/ConfirmModal'
import toast from 'react-hot-toast'
import { formatPrice, resolveImageUrl, getCategoryFallbackImage } from '../../data/productsData'
import { getOrders, deleteOrder } from '../../services/orderServices'
import { isAuthenticated } from '../../services/authServices'

const STATUS_FLOW = ['Placed', 'Confirmed', 'Proceeded', 'Delivered']

const STATUS_COPY = {
  Placed: { title: 'Order Placed', hint: 'Awaiting store confirmation' },
  Confirmed: { title: 'Confirmed', hint: 'Payment verified & processing' },
  Proceeded: { title: 'Proceeded', hint: 'Handed over to courier service' },
  Delivered: { title: 'Delivered', hint: 'Package successfully delivered' },
  Cancelled: { title: 'Cancelled', hint: 'This order was cancelled' },
  Canceled: { title: 'Cancelled', hint: 'This order was cancelled' },
}

const STATUS_BADGE = {
  Placed: 'bg-[#ffeedd] text-[#d97706]',
  Confirmed: 'bg-[#dbeafe] text-[#2563eb]',
  Proceeded: 'bg-[#ffedd5] text-[#c2410c]',
  Delivered: 'bg-[#dcfce7] text-[#16a34a]',
  Cancelled: 'bg-red-100 text-red-650 font-semibold border border-red-200',
  Canceled: 'bg-red-100 text-red-650 font-semibold border border-red-200',
}

const INITIAL_ORDERS = []

function getOrderTotal(order) {
  if (order.price) return order.price
  if (!order.products || !Array.isArray(order.products)) return 0
  return order.products.reduce(
    (sum, p) => sum + (Number(p.price) || 0) * (Number(p.qty) || 1),
    0,
  )
}

function OrderDetailsModal({ order, onClose }) {
  useEffect(() => {
    if (!order) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [order, onClose])

  if (!order) return null

  const subTotal = getOrderTotal(order)
  const isCancelled = order.status === "Cancelled" || order.status === "Canceled"
  const activeFlow = isCancelled ? ["Placed", "Cancelled"] : STATUS_FLOW
  const currentIndex = activeFlow.indexOf(isCancelled ? "Cancelled" : order.status)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl transition-all sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-start justify-between border-b border-gray-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-[#E4342F]">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-[#E4342F] uppercase">
                Order Details
              </span>
              <h2 id="modal-title" className="text-xl font-bold text-gray-900 sm:text-2xl">
                #{order.id}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-6 space-y-6">
          {/* Tracking Timeline */}
          <div className="rounded-2xl border border-gray-100 bg-[#faf8f7] p-5">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Order Progress</h3>
            <ol className="relative ml-3 space-y-6 border-l-2 border-dashed border-gray-200 sm:ml-4">
              {activeFlow.map((step, idx) => {
                const done = idx <= currentIndex
                const isCurrent = idx === currentIndex
                return (
                  <li key={step} className="relative pl-6 sm:pl-8">
                    <span
                      className={`absolute -left-[11px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${
                        isCurrent
                          ? isCancelled
                            ? 'bg-red-500 text-white ring-4 ring-red-100'
                            : 'bg-[#E4342F] text-white ring-4 ring-red-100'
                          : done
                          ? isCancelled
                            ? 'bg-red-500 text-white'
                            : 'bg-emerald-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {done ? <Check className="h-3 w-3" /> : idx + 1}
                    </span>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          done ? 'text-gray-900' : 'text-gray-400'
                        }`}
                      >
                        {STATUS_COPY[step]?.title || step}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {step === 'Placed'
                          ? order.placedAt
                          : STATUS_COPY[step]?.hint}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* Products List */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-gray-900">Ordered Items</h3>
            <ul className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
              {(order.products || []).map((product, idx) => (
                <li key={product.id || idx} className="flex items-center gap-3 p-3">
                  <img
                    src={resolveImageUrl(product.image, 'Speakers & Audios')}
                    alt={product.name}
                    className="h-12 w-12 rounded-xl border border-gray-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = getCategoryFallbackImage('Speakers & Audios')
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Qty: {product.qty || 1} × {formatPrice(product.price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">
                    {formatPrice((Number(product.price) || 0) * (Number(product.qty) || 1))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Summary Details Grid */}
          <div className="grid gap-3 rounded-2xl border border-gray-100 bg-gray-50/70 p-4 text-xs sm:grid-cols-2">
            <div>
              <span className="text-gray-500">Placed On:</span>{' '}
              <strong className="text-gray-800">{order.placedAt}</strong>
            </div>
            <div>
              <span className="text-gray-500">Delivery Status:</span>{' '}
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Shipping Fee:</span>{' '}
              <strong className="text-gray-800">
                {order.shipping ? formatPrice(order.shipping) : 'Free Delivery'}
              </strong>
            </div>
            <div>
              <span className="text-gray-500">Grand Total:</span>{' '}
              <strong className="text-base font-black text-[#E4342F]">
                {formatPrice(subTotal)}
              </strong>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-[#E4342F] px-6 py-2.5 text-xs font-bold text-white transition hover:bg-[#c92923]"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  )
}

export function MyOrders() {
  const [orders, setOrders] = useState(INITIAL_ORDERS)
  const [filter, setFilter] = useState('All')
  const [query, setQuery] = useState('')
  const [detailsOrder, setDetailsOrder] = useState(null)
  const [orderToDeleteId, setOrderToDeleteId] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(isAuthenticated())
    window.addEventListener('auth-updated', syncAuth)
    window.addEventListener('storage', syncAuth)
    window.addEventListener('focus', syncAuth)
    return () => {
      window.removeEventListener('auth-updated', syncAuth)
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('focus', syncAuth)
    }
  }, [])

  // Load orders from server if authenticated
  useEffect(() => {
    if (!isAuthenticated()) return

    const loadServerOrders = async () => {
      try {
        const res = await getOrders()
        const data = res?.data || res
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item) => ({
            id: item.orderId || item.id || item._id,
            placedAt: item.placedAt || 'Recently',
            status: item.status || 'Placed',
            tags: item.tags || ['Electronics'],
            shipping: Number(item.shipping || 0),
            price: Number(item.totalAmount || item.price || 0),
            products: (item.products || []).map((p) => ({
              ...p,
              image: p.image || getCategoryFallbackImage('Speakers & Audios'),
            })),
          }))
          setOrders(mapped)
        }
      } catch {
        // Handle error silently
      }
    }

    loadServerOrders()
  }, [isLoggedIn])

  const handleDelete = (orderId) => {
    setOrderToDeleteId(orderId)
  }

  const handleConfirmDelete = async () => {
    if (!orderToDeleteId) return
    setIsDeleting(true)
    try {
      await deleteOrder(orderToDeleteId)
      setOrders((prev) => prev.filter((o) => o.id !== orderToDeleteId))
      toast.success('Order record removed.')
      setOrderToDeleteId(null)
    } catch {
      setOrders((prev) => prev.filter((o) => o.id !== orderToDeleteId))
      toast.success('Order record removed.')
      setOrderToDeleteId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const filters = ['All', 'Placed', 'Confirmed', 'Proceeded', 'Delivered']

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase()

    return orders.filter((order) => {
      const matchFilter = filter === 'All' || order.status === filter
      const matchSearch =
        !q ||
        order.id.toLowerCase().includes(q) ||
        (order.tags && order.tags.some((tag) => tag.toLowerCase().includes(q))) ||
        (order.products &&
          order.products.some((p) => p.name?.toLowerCase().includes(q)))

      return matchFilter && matchSearch
    })
  }, [orders, filter, query])

  if (!isLoggedIn) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#f4f3f2] px-4 py-12 md:px-6 lg:px-8">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#E4342F]">
              <Package className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Sign in to View Orders</h2>
            <p className="mt-2 text-sm text-gray-500">
              Please sign in to track and view your order history on LovelyTech.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#E4342F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c92923]"
              >
                Sign In
              </Link>
              <Link
                to="/products"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
              >
                Explore Products
              </Link>
            </div>
          </div>
        </main>
      </Layout>
    )
  }

  return (
    <Layout>
      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1100px]">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-7 w-7 text-black sm:h-8 sm:w-8" />
              <div>
                <h1 className="text-2xl font-bold text-[#E4342F] sm:text-3xl">
                  My Orders
                </h1>
                <p className="text-xs text-gray-500 sm:text-sm">
                  Track and manage your purchase
                </p>
              </div>
            </div>

            {/* Total Items Pill */}
            <div className="rounded-full bg-[#E4342F] px-4 py-1.5 text-xs font-semibold text-white sm:text-sm">
              {filteredOrders.length} Items
            </div>
          </div>

          {/* Search Bar & Filter Buttons Row */}
          <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search Input with Search Icon */}
            <div className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by order ID or Product..."
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-5 pr-11 text-xs text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#E4342F] focus:ring-1 focus:ring-[#E4342F] sm:text-sm"
              />
              <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
            </div>

            {/* Filter Tabs / Pills */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {filters.map((f) => {
                const active = filter === f
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? 'border border-[#E4342F] bg-[#E4342F] text-white shadow-xs'
                        : 'border border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:text-gray-900'
                    }`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Orders List / Cards */}
          <div className="mt-8 space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-12 text-center text-gray-500">
                <Package className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                <p className="text-base font-semibold text-gray-700">No orders found</p>
                <p className="mt-1 text-xs text-gray-400">
                  {orders.length === 0
                    ? "You haven't placed any orders yet."
                    : 'No orders match your filter or search query.'}
                </p>
                <Link
                  to="/products"
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E4342F] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#c92923]"
                >
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              filteredOrders.map((order) => {
                const total = getOrderTotal(order)

                return (
                  <div
                    key={order.id}
                    className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center sm:justify-between sm:p-5"
                  >
                    {/* Left: Basic Info & Tags */}
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-gray-800 sm:text-sm">
                          Order #{order.id}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-500">{order.placedAt}</span>
                      </div>

                      {/* Tag badges */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {(order.tags || []).map((t, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10px] font-medium text-gray-600"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Middle: Price & Status Badge */}
                    <div className="flex items-center justify-between gap-6 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <div className="text-[11px] text-gray-400">Total Amount</div>
                        <div className="text-sm font-black text-[#E4342F] sm:text-base">
                          {formatPrice(total)}
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          STATUS_BADGE[order.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center justify-end gap-2 border-t border-gray-100 pt-3 sm:border-t-0 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => setDetailsOrder(order)}
                        className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 transition hover:border-gray-400 hover:bg-gray-50"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(order.id)}
                        aria-label={`Delete order ${order.id}`}
                        title="Delete Order"
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-red-200 text-[#E4342F] transition hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </main>

      {/* Pop-up Modal */}
      <OrderDetailsModal
        order={detailsOrder}
        onClose={() => setDetailsOrder(null)}
      />

      {/* Delete Order Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(orderToDeleteId)}
        title="Remove Order Record"
        message="Are you sure you want to remove this order from your history? This will hide it from your order list."
        confirmText="Remove Order"
        cancelText="Cancel"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setOrderToDeleteId(null)}
      />
    </Layout>
  )
}

export default MyOrders

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
import Layout from '../../components/layout/Layout'
import { formatPrice, resolveImageUrl, getCategoryFallbackImage } from '../../data/productsData'
import { getOrders, deleteOrder } from '../../services/orderServices'

const STATUS_FLOW = ['Placed', 'Confirmed', 'Proceeded', 'Delivered']

const STATUS_COPY = {
  Placed: { title: 'Order Placed', hint: 'Awaiting store confirmation' },
  Confirmed: { title: 'Confirmed', hint: 'Payment verified & processing' },
  Proceeded: { title: 'Proceeded', hint: 'Handed over to courier service' },
  Delivered: { title: 'Delivered', hint: 'Package successfully delivered' },
}

const STATUS_PILL_STYLES = {
  Placed: 'bg-[#fff3c4] text-[#b45309]',
  Confirmed: 'bg-[#dbeafe] text-[#2563eb]',
  Proceeded: 'bg-[#ffedd5] text-[#c2410c]',
  Delivered: 'bg-[#dcfce7] text-[#16a34a]',
}

const INITIAL_ORDERS = [
  {
    id: 'ORD - 15487956',
    placedAt: '@18.45 pm 10/12/2026',
    status: 'Placed',
    tags: ['Headphone', 'Keyboard', 'Power Bank'],
    shipping: 0,
    price: 30465,
    products: [
      {
        id: 'p1',
        name: 'Premium Wireless Bluetooth Headphones',
        qty: 1,
        price: 12500,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'p2',
        name: 'RGB Mechanical Gaming Keyboard',
        qty: 1,
        price: 8950,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'p3',
        name: '20,000mAh Portable Power Bank - Fast Charger',
        qty: 1,
        price: 9015,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ORD - 16485923',
    placedAt: '@9.32 am 9/12/2026',
    status: 'Confirmed',
    tags: ['Handfree'],
    shipping: 0,
    price: 1500,
    products: [
      {
        id: 'p4',
        name: 'Handsfree Earbuds with Charging Case',
        qty: 1,
        price: 1500,
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ORD - 12649532',
    placedAt: '@13.22 pm 8/7/2026',
    status: 'Delivered',
    tags: ['Keyboard'],
    shipping: 0,
    price: 6350,
    products: [
      {
        id: 'p5',
        name: 'RGB Mechanical Gaming Keyboard',
        qty: 1,
        price: 6350,
        image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ORD - 28597460',
    placedAt: '@11.58 am 01/08/2025',
    status: 'Delivered',
    tags: ['Power Bank'],
    shipping: 0,
    price: 11800,
    products: [
      {
        id: 'p6',
        name: '20,000mAh Portable Power Bank - Fast Charger',
        qty: 2,
        price: 5900,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
  {
    id: 'ORD - 34976128',
    placedAt: '@21.14 pm 11/11/2025',
    status: 'Delivered',
    tags: ['Smart Watch', 'Mouse'],
    shipping: 0,
    price: 5450,
    products: [
      {
        id: 'p7',
        name: 'Smart Watch Series 6 AMOLED',
        qty: 1,
        price: 3950,
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=400&q=80',
      },
      {
        id: 'p8',
        name: 'Wireless Ergonomic Gaming Mouse',
        qty: 1,
        price: 1500,
        image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=400&q=80',
      },
    ],
  },
]

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
  const currentIndex = STATUS_FLOW.indexOf(order.status)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="relative my-8 w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl transition-all"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-[#E4342F]">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Order Details</h2>
              <p className="text-xs text-gray-500">{order.id}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[70vh] space-y-6 overflow-y-auto px-6 py-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-3.5">
            <span className="text-xs font-semibold text-gray-600">Current Status:</span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                STATUS_PILL_STYLES[order.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Stepper */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-gray-900">
              <Truck className="h-4 w-4 text-[#E4342F]" />
              Order Tracking Timeline
            </h3>
            <ol className="relative space-y-5 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
              {STATUS_FLOW.map((step, index) => {
                const done = index <= currentIndex
                const isLast = index === STATUS_FLOW.length - 1

                return (
                  <li key={step} className="relative flex gap-3.5">
                    {!isLast && (
                      <span
                        aria-hidden="true"
                        className={`absolute left-[11px] top-6 h-[calc(100%+0.5rem)] w-0.5 ${
                          index < currentIndex ? 'bg-emerald-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                    <span
                      className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        done
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
                      )}
                    </span>
                    <div className="pt-0.5">
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
                  <p className="text-xs font-bold text-gray-900">
                    {formatPrice((product.price || 0) * (product.qty || 1))}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Summary */}
          <div className="space-y-2 rounded-2xl bg-gray-50 p-4 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-900">{formatPrice(subTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-600">
                {(order.shipping || 0) === 0 ? 'Free Shipping' : formatPrice(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-2 text-sm font-bold text-gray-900">
              <span>Total Paid</span>
              <span className="text-[#E4342F]">
                {formatPrice(subTotal + (order.shipping || 0))}
              </span>
            </div>
          </div>
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

  // Load any newly created orders from server or keep initial
  useEffect(() => {
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
        // Fallback to rich demo orders catalog
      }
    }

    loadServerOrders()
  }, [])

  const handleDelete = async (orderId) => {
    try {
      await deleteOrder(orderId)
    } catch {
      // Local state fallback
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId))
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
              <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {filters.map((f) => {
                const isActive = filter === f
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`rounded-full px-5 py-2 text-xs font-semibold transition sm:text-sm ${
                      isActive
                        ? 'border border-[#E4342F] bg-[#E4342F] text-white shadow-xs'
                        : 'border border-[#E4342F]/50 bg-white text-black hover:border-[#E4342F]'
                    }`}
                  >
                    {f}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Orders List Cards */}
          {filteredOrders.length === 0 ? (
            <div className="my-12 rounded-3xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-base font-bold text-gray-700">No orders found</h3>
              <p className="mt-1 text-xs text-gray-500">
                Try searching for a different order ID or change your status filter.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {filteredOrders.map((order) => {
                const totalAmount = getOrderTotal(order)

                return (
                  <article
                    key={order.id}
                    className="relative overflow-hidden rounded-2xl border border-gray-200 border-t-4 border-t-[#E4342F] bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      {/* Left: Avatar & Order Info */}
                      <div className="flex items-center gap-4">
                        {/* Black PP Square */}
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-black text-base font-bold text-white sm:h-16 sm:w-16 sm:text-lg">
                          PP
                        </div>

                        {/* Order Metadata */}
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-base font-bold text-gray-900 sm:text-lg">
                              {order.id}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs ${
                                STATUS_PILL_STYLES[order.status] ||
                                'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">{order.placedAt}</p>

                          {/* Tag Pills */}
                          {order.tags && order.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                              {order.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-full border border-gray-300 bg-white px-3 py-0.5 text-[11px] font-medium text-gray-700"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Trash icon, Price, View Details */}
                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:justify-center sm:border-t-0 sm:pt-0">
                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(order.id)}
                          aria-label={`Delete order ${order.id}`}
                          title="Delete order"
                          className="rounded-lg p-1.5 text-[#E4342F] transition hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>

                        {/* Price & Action */}
                        <div className="text-right">
                          <p className="text-base font-bold text-gray-900 sm:text-lg">
                            {formatPrice(totalAmount)}
                          </p>
                          <button
                            type="button"
                            onClick={() => setDetailsOrder(order)}
                            className="mt-0.5 flex items-center justify-end gap-1 text-xs font-bold text-[#E4342F] transition hover:underline sm:text-sm"
                          >
                            View Details →
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        {/* Modal Popup */}
        <OrderDetailsModal
          order={detailsOrder}
          onClose={() => setDetailsOrder(null)}
        />
      </main>
    </Layout>
  )
}

export default MyOrders

import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ShoppingCart,
  Store,
  Trash2,
  Minus,
  Plus,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  Tag,
} from 'lucide-react'
import Layout from '../../components/layout/Layout'
import {
  formatPrice,
  resolveImageUrl,
  getCategoryFallbackImage,
  FALLBACK_PRODUCT_IMAGE,
} from '../../data/productsData'

import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from '../../utils/cartStorage'
import { isAuthenticated } from '../../services/authServices'

export function CartPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getCartItems())
  const [couponCode, setCouponCode] = useState('')
  const [discountApplied, setDiscountApplied] = useState(true)
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(10) // 10% demo discount
  const [couponMessage, setCouponMessage] = useState({ text: 'LOVELY10 applied (10% OFF)', type: 'success' })
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())

  // Listen to external cart updates and auth changes
  useEffect(() => {
    const syncCart = () => {
      setItems(getCartItems())
    }
    const syncAuth = () => {
      setIsLoggedIn(isAuthenticated())
    }
    window.addEventListener('cart-updated', syncCart)
    window.addEventListener('auth-updated', syncAuth)
    window.addEventListener('storage', syncCart)
    window.addEventListener('storage', syncAuth)
    window.addEventListener('focus', syncAuth)
    return () => {
      window.removeEventListener('cart-updated', syncCart)
      window.removeEventListener('auth-updated', syncAuth)
      window.removeEventListener('storage', syncCart)
      window.removeEventListener('storage', syncAuth)
      window.removeEventListener('focus', syncAuth)
    }
  }, [])

  const totalItemsCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity || 1), 0)
  }, [items])

  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0)
  }, [items])

  const discountAmount = useMemo(() => {
    if (!discountApplied || subTotal === 0) return 0
    return Math.round((subTotal * couponDiscountPercent) / 100)
  }, [subTotal, discountApplied, couponDiscountPercent])

  const grandTotal = useMemo(() => {
    return Math.max(0, subTotal - discountAmount)
  }, [subTotal, discountAmount])

  const handleQuantityChange = (productId, newQty) => {
    const updated = updateCartQuantity(productId, newQty)
    setItems(updated)
  }

  const handleRemove = (productId) => {
    const updated = removeFromCart(productId)
    setItems(updated)
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    const trimmed = couponCode.trim().toUpperCase()
    if (!trimmed) {
      setCouponMessage({ text: 'Please enter a coupon code.', type: 'error' })
      return
    }

    if (trimmed === 'LOVELY10' || trimmed === 'SAVE10' || trimmed === 'DEMO10') {
      setCouponDiscountPercent(10)
      setDiscountApplied(true)
      setCouponMessage({ text: 'Coupon applied! 10% discount added.', type: 'success' })
    } else if (trimmed === 'LOVELY20' || trimmed === 'SAVE20') {
      setCouponDiscountPercent(20)
      setDiscountApplied(true)
      setCouponMessage({ text: 'Coupon applied! 20% discount added.', type: 'success' })
    } else {
      setCouponMessage({ text: 'Invalid coupon code. Try "LOVELY10".', type: 'error' })
    }
  }

  const handleCheckout = () => {
    navigate('/payment')
  }

  return (
    <Layout>
      <main className="min-h-screen bg-[#faf8f7] px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1320px]">
          
          {/* Header Title Section */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-7 w-7 text-black sm:h-8 sm:w-8" />
                <h1 className="text-2xl font-bold tracking-tight text-[#E4342F] sm:text-3xl lg:text-4xl">
                  Shopping Cart
                </h1>
              </div>
              {totalItemsCount > 0 && (
                <span className="rounded-full bg-[#E4342F] px-3.5 py-1 text-xs font-bold text-white shadow-xs">
                  {totalItemsCount} {totalItemsCount === 1 ? 'Item' : 'Items'}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              Just a step before make payment...
            </p>
          </div>

          {items.length === 0 ? (
            /* Empty Cart View */
            <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-[#E4342F]">
                <ShoppingBag className="h-10 w-10" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
                Your Shopping Cart is Empty
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Looks like you haven't added any products to your cart yet.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E4342F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c92923]"
                >
                  <ArrowRight className="h-4 w-4" />
                  Explore Products
                </Link>
                {isLoggedIn && (
                  <Link
                    to="/wishlist"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
                  >
                    View Wishlist
                  </Link>
                )}
              </div>
            </div>
          ) : (
            /* Active Cart Grid Layout */
            <div className="grid gap-8 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_400px]">
              
              {/* Left Column: Cart Items List */}
              <div className="space-y-5">
                {items.map((item) => {
                  const itemTotal = (item.price || 0) * (item.quantity || 1)
                  const itemImg = resolveImageUrl(item.image)

                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-2xl border border-gray-200 border-t-4 border-t-[#E4342F] bg-white shadow-sm transition duration-200 hover:shadow-md"
                    >
                      {/* Item Top Store/Category Header */}
                      <div className="flex items-center justify-between border-b border-gray-100 bg-[#fdfdfd] px-5 py-3">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                          <Store className="h-4 w-4 text-gray-700" />
                          <span>{item.category || 'Electronics & Accessories'}</span>
                        </div>
                        <Link
                          to={`/products/${item.id}`}
                          className="flex items-center gap-1 text-xs font-semibold text-[#E4342F] transition hover:underline sm:text-sm"
                        >
                          View Details →
                        </Link>
                      </div>

                      {/* Item Content Body */}
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-5">
                        {/* Product Image Frame */}
                        <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 sm:h-32 sm:w-32">
                          <Link to={`/products/${item.id}`} className="block h-full w-full">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="h-full w-full object-cover transition duration-300 hover:scale-105"
                              onError={(event) => {
                                const fallback = getCategoryFallbackImage(item.category)
                                if (event.currentTarget.src !== fallback) {
                                  event.currentTarget.src = fallback
                                }
                              }}

                            />
                          </Link>
                        </div>


                        {/* Product Details Info */}
                        <div className="flex-1 space-y-1.5">
                          <h3 className="text-base font-bold text-[#1a1a1a] transition hover:text-[#E4342F] sm:text-lg">
                            <Link to={`/products/${item.id}`}>{item.name}</Link>
                          </h3>

                          {/* Attributes */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                            <span>
                              Color:{' '}
                              <strong className="font-semibold text-gray-800">
                                {item.color || 'Standard'}
                              </strong>
                            </span>
                            <span>
                              Size:{' '}
                              <strong className="font-semibold text-gray-800">
                                {item.size || 'Standard'}
                              </strong>
                            </span>
                          </div>

                          {/* Stock status badge */}
                          <div className="pt-1">
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3 w-3" />
                              {item.availability || 'In Stock'}
                            </span>
                          </div>

                          {/* Unit price */}
                          <div className="pt-1 text-xs text-gray-500">
                            Unit Price:{' '}
                            <span className="font-bold text-sm text-[#E4342F]">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                        </div>

                        {/* Right Controls & Subtotal */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-3 sm:flex-col sm:items-end sm:justify-between sm:self-stretch sm:border-t-0 sm:pt-0">
                          {/* Remove button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            title="Remove item"
                            className="rounded-lg p-1.5 text-[#E4342F] transition hover:bg-red-50 hover:text-red-700"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {/* Quantity Pill & Subtotal */}
                          <div className="flex flex-col items-end gap-1.5">
                            <div className="flex items-center rounded-full border border-gray-300 bg-white px-2 py-0.5 shadow-xs">
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                                className="flex h-6 w-6 items-center justify-center text-base font-bold text-gray-600 transition hover:text-black"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-[24px] text-center text-sm font-semibold text-gray-900">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                                className="flex h-6 w-6 items-center justify-center text-base font-bold text-gray-600 transition hover:text-black"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Subtotal */}
                            <div className="text-right">
                              <div className="text-[11px] text-gray-500">Sub Total</div>
                              <div className="text-sm font-bold text-[#E4342F] sm:text-base">
                                {formatPrice(itemTotal)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}

                {/* Continue Shopping Action */}
                <div className="flex items-center justify-between pt-2">
                  <Link
                    to="/products"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-[#E4342F]"
                  >
                    ← Continue Shopping
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      clearCart()
                      setItems([])
                    }}
                    className="text-xs font-semibold text-gray-400 hover:text-red-600 transition"
                  >
                    Clear All Items
                  </button>
                </div>
              </div>

              {/* Right Column: Order Summary Card */}
              <div className="lg:sticky lg:top-24 h-fit">
                <div className="rounded-2xl border border-gray-200 border-t-4 border-t-[#E4342F] bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Order Summary
                  </h2>

                  <div className="mt-5 space-y-3.5 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Sub Total</span>
                      <span className="font-bold text-gray-900">{formatPrice(subTotal)}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Shipping</span>
                      <span className="text-gray-500">Calculated at checkout</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#E4342F] font-medium">Discount</span>
                        <span className="font-bold text-[#E4342F]">
                          -{formatPrice(discountAmount)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-100 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">Total</span>
                        <span className="text-xl font-black text-gray-900">
                          {formatPrice(grandTotal)}
                        </span>
                      </div>
                    </div>

                    {/* Discount Coupon Section */}
                    <div className="border-t border-gray-100 pt-4">
                      <label className="block text-xs font-semibold text-gray-600 mb-2">
                        Discount Coupon
                      </label>
                      <form onSubmit={handleApplyCoupon} className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter Code (e.g. LOVELY10)"
                          className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-[#E4342F] focus:ring-1 focus:ring-[#E4342F]"
                        />
                        <button
                          type="submit"
                          className="rounded-xl bg-[#E4342F] px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#c92923] active:scale-95"
                        >
                          Apply
                        </button>
                      </form>
                      {couponMessage.text && (
                        <p
                          className={`mt-1.5 text-[11px] ${
                            couponMessage.type === 'success' ? 'text-emerald-600 font-medium' : 'text-red-500'
                          }`}
                        >
                          {couponMessage.text}
                        </p>
                      )}
                    </div>

                    {/* Checkout Button */}
                    <div className="border-t border-gray-100 pt-5">
                      <button
                        type="button"
                        onClick={handleCheckout}
                        className="w-full cursor-pointer rounded-xl bg-[#E4342F] py-3.5 text-center text-sm font-bold text-white shadow-[0_6px_18px_rgba(228,52,47,0.3)] transition hover:bg-[#c92923] hover:shadow-[0_8px_22px_rgba(228,52,47,0.4)] active:scale-[0.99]"
                      >
                        Proceed to Checkout
                      </button>
                    </div>

                    <div className="text-center">
                      <span className="text-[11px] text-gray-400">
                        🔒 Safe & Secure 256-Bit SSL Checkout
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </main>
    </Layout>
  )
}
export default CartPage

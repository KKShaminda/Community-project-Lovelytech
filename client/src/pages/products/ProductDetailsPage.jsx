import {
  ArrowLeft,
  Check,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
  Star,
  Truck,
  ShieldCheck,
  RotateCcw,
  Tag,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import {
  productsData,
  formatPrice,
  getMockProductById,
  resolveImageUrl,
  getCategoryFallbackImage,
  FALLBACK_PRODUCT_IMAGE,
} from '../../data/productsData'

import { getProductById } from '../../services/productServices'
import { isProductWishlisted, toggleWishlistProduct } from '../../utils/wishlistStorage'
import { addToCart } from '../../utils/cartStorage'
import { isAuthenticated } from '../../services/authServices'


function RatingStars({ rating = 5 }) {
  return (
    <div className="flex items-center gap-1 text-[13px] text-[#f2b500]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${index < Math.round(rating) ? 'fill-current' : 'text-[#c9c9c9]'}`}
        />
      ))}
    </div>
  )
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [liked, setLiked] = useState(() => isProductWishlisted(id))
  const [addedToCart, setAddedToCart] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())

  // Sync auth state
  useEffect(() => {
    const handleAuthUpdate = () => {
      setIsLoggedIn(isAuthenticated())
    }
    window.addEventListener('auth-updated', handleAuthUpdate)
    window.addEventListener('storage', handleAuthUpdate)
    window.addEventListener('focus', handleAuthUpdate)
    return () => {
      window.removeEventListener('auth-updated', handleAuthUpdate)
      window.removeEventListener('storage', handleAuthUpdate)
      window.removeEventListener('focus', handleAuthUpdate)
    }
  }, [])

  // Sync liked state when ID changes
  useEffect(() => {
    setLiked(isProductWishlisted(id))
  }, [id])

  // Scroll to top whenever ID changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])


  useEffect(() => {
    let isMounted = true

    const loadProductData = async () => {
      setLoading(true)

      // Directly load curated demo product with full images & specs
      const mockItem = getMockProductById(id) || productsData[0]
      const category = mockItem.category || 'Speakers & Audios'
      const defaultImg = getCategoryFallbackImage(category)

      const resolvedImages = (mockItem.images && mockItem.images.length > 0
        ? mockItem.images
        : [mockItem.image || defaultImg]
      ).map((img) => resolveImageUrl(img, category))

      if (isMounted) {
        setProduct({
          ...mockItem,
          id: mockItem.id || mockItem._id,
          image: resolvedImages[0],
          images: resolvedImages,
        })
        setSelectedImage(resolvedImages[0])
        setQuantity(1)
        setLoading(false)
      }
    }

    loadProductData()

    return () => {
      isMounted = false
    }
  }, [id])


  const similarProducts = useMemo(() => {
    if (!product) return productsData.slice(0, 4)
    return productsData
      .filter((item) => String(item.id) !== String(product.id))
      .slice(0, 4)
  }, [product])

  const handleAddToCart = () => {
    if (!product) return
    addToCart(product, quantity, { image: selectedImage || product.image })
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 1600)
  }


  const galleryImages = useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length > 0) return product.images
    if (product.image) return [product.image]
    return ['https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80']
  }, [product])

  if (loading) {
    return (
      <Layout>
        <main className="flex min-h-[60vh] items-center justify-center bg-[#f4f1ef] px-4 py-12">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E4342F] border-t-transparent"></div>
            <p className="text-sm font-medium text-gray-600">Loading product details...</p>
          </div>
        </main>
      </Layout>
    )
  }

  if (!product) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#f4f1ef] px-4 py-12">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
            <p className="mt-2 text-sm text-gray-500">The product you are looking for does not exist or has been removed.</p>
            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#E4342F] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#c92923]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </main>
      </Layout>
    )
  }

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null

  return (
    <Layout>
      <main className="min-h-screen bg-[#f4f1ef] px-4 py-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-[1280px] rounded-[18px] bg-[#f9f7f6] p-4 shadow-[0_0_0_1px_rgba(0,0,0,0.03)] sm:p-6 lg:p-8">

          {/* Breadcrumb Navigation */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#e8d9d7] pb-4">
            <div className="flex items-center gap-2 text-sm font-medium text-[#2f2f2f]">
              <Link
                to="/products"
                className="flex items-center gap-2 font-semibold text-[#111827] transition hover:text-[#E4342F]"
              >
                <ArrowLeft className="h-4 w-4" />
                Products
              </Link>
              <span className="text-[#a0a0a0]">/</span>
              <span className="text-xs text-[#666] sm:text-sm">{product.category || 'Category'}</span>
              <span className="text-[#a0a0a0]">/</span>
              <span className="truncate max-w-[200px] sm:max-w-xs text-xs font-semibold text-[#E4342F] sm:text-sm">
                {product.name}
              </span>
            </div>

            {isLoggedIn && (
              <Link
                to="/wishlist"
                className="flex items-center gap-1.5 rounded-lg border border-[#E4342F]/30 bg-white px-3 py-1.5 text-xs font-semibold text-[#E4342F] shadow-sm transition hover:bg-[#E4342F] hover:text-white"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
                View Wishlist
              </Link>
            )}
          </div>

          {/* Main Product Showcase Section */}
          <section className="grid gap-8 lg:grid-cols-[1.15fr_1fr]">
            {/* Gallery */}
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[22px] border-[3px] border-[#E4342F] bg-[#0e0e10] p-2 shadow-sm">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="h-[380px] w-full rounded-[18px] object-cover sm:h-[480px] transition duration-300"
                />
              </div>

              {galleryImages.length > 1 && (
                <div className="flex flex-wrap justify-center gap-3 sm:justify-start">
                  {galleryImages.map((image, index) => (
                    <button
                      key={image + index}
                      type="button"
                      onClick={() => setSelectedImage(image)}
                      className={`overflow-hidden rounded-[14px] border-2 transition ${selectedImage === image
                          ? 'border-[#E4342F] ring-2 ring-[#E4342F]/30 scale-105'
                          : 'border-[#d0d0d0] hover:border-[#E4342F]/60'
                        }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="h-16 w-16 sm:h-20 sm:w-20 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col justify-center">
              <div className="mb-3 flex items-start justify-between gap-4">
                <h1 className="text-2xl font-black leading-tight tracking-[-0.03em] text-[#1c1c1c] sm:text-4xl">
                  {product.name}
                </h1>

                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      const nextStatus = toggleWishlistProduct(product.id || product._id || id)
                      setLiked(nextStatus)
                    }}
                    className={`mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-transform hover:scale-105 ${
                      liked
                        ? 'border-[#E4342F] bg-[#E4342F] text-white shadow-md'
                        : 'border-[#E4342F] bg-white text-[#E4342F]'
                    }`}
                    aria-label={liked ? 'Remove from wishlist' : 'Add to wishlist'}
                    title={liked ? 'Saved in Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  </button>
                )}

              </div>

              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-[#4c4c4c]">
                <div className="flex items-center gap-2">
                  <RatingStars rating={product.rating || 5} />
                  <span className="font-bold text-[#111827]">{product.rating || 5.0}</span>
                </div>
                <span className="text-[#8e8e8e]">
                  {product.reviewsCount || 150} Customer Reviews
                </span>
                <span className="text-[#8e8e8e]">•</span>
                <span className="text-[#666]">{product.sold || 100}+ Sold</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${product.availability === 'Out of Stock'
                      ? 'border border-amber-300 bg-amber-50 text-amber-800'
                      : 'border border-[#7ccf94] bg-[#ebfff2] text-[#1c8d46]'
                    }`}
                >
                  {product.availability || 'In Stock'}
                </span>
              </div>

              <div className="mb-4 flex flex-wrap items-end gap-3">
                <div className="text-3xl font-black tracking-tight text-[#111111] sm:text-4xl">
                  {formatPrice(product.price)}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <div className="mb-1 text-lg font-medium text-[#9b9b9b] line-through">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
                {discountPercent && (
                  <div className="mb-1 inline-flex items-center gap-1 rounded-md bg-[#ffeae9] px-2 py-0.5 text-xs font-bold text-[#E4342F]">
                    <Tag className="h-3 w-3" />
                    Save {discountPercent}% Today
                  </div>
                )}
              </div>

              <p className="mb-6 max-w-xl text-sm leading-relaxed text-[#4f4f4f] sm:text-base">
                {product.description ||
                  'Elevate your experience with this premium product. Engineered with superior craftsmanship, durable materials, and backed by comprehensive warranty.'}
              </p>

              <div className="mb-6 grid gap-3 text-sm text-[#3f3f3f] sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#E4342F]" />
                  <span>Free Islandwide Shipping</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#E4342F]" />
                  <span>6 Months Store Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 text-[#E4342F]" />
                  <span>7-Days Easy Return Policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#E4342F]" />
                  <span>100% Genuine & Verified</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center justify-between rounded-[12px] border border-[#d8d8d8] bg-[#f2f2f2] px-4 py-3 sm:w-[170px]">
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-[#3a3a3a] transition hover:bg-white"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[30px] text-center text-lg font-bold text-[#1a1a1a]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((value) => value + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold text-[#3a3a3a] transition hover:bg-white"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={product.availability === 'Out of Stock'}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[12px] px-6 py-3.5 text-base font-semibold text-white shadow-[0_8px_18px_rgba(228,52,47,0.25)] transition ${addedToCart
                      ? 'bg-emerald-600'
                      : 'bg-[#E4342F] hover:bg-[#d62d2d] disabled:cursor-not-allowed disabled:opacity-60'
                    }`}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {product.availability === 'Out of Stock'
                    ? 'Out of Stock'
                    : addedToCart
                      ? 'Added to Cart!'
                      : 'Add to Cart'}
                </button>
              </div>
            </div>
          </section>

          {/* Highlights & Reviews Section */}
          <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[18px] border border-[#e2d8d6] bg-[#f9f4f3] p-6">
              <h2 className="mb-3 text-[26px] font-black tracking-tight text-[#1d1d1d]">
                Product Features & Highlights
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-[#4d4d4d] sm:text-base">
                {product.description}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {(product.features || [
                  { title: 'Premium Performance', desc: 'Optimized for high durability and consistent performance.' },
                  { title: 'Quality Certified', desc: 'Tested thoroughly to meet our top standard of reliability.' },
                ]).map((feat, index) => (
                  <div key={index} className="rounded-[16px] border border-[#f0d6d3] bg-[#f9eceb] p-4">
                    <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-[#E4342F]/10 text-[#E4342F]">
                      <ZapIcon />
                    </div>
                    <h3 className="mb-1 text-lg font-bold text-[#1c1c1c]">{feat.title}</h3>
                    <p className="text-xs leading-5 text-[#545454] sm:text-sm">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[18px] border border-[#e1d5d4] bg-[#f8f1f1] p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[26px] font-black tracking-tight text-[#1c1c1c]">Customer Reviews</h2>
                <span className="rounded-full bg-[#E4342F]/10 px-3 py-1 text-xs font-semibold text-[#E4342F]">
                  ★ {product.rating || 4.8} / 5
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#f0e0da] text-sm font-bold text-[#5d2a1c]">
                      KS
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#1f1f1f]">Kaveesha Shaminda</div>
                      <div className="text-xs text-[#888]">Verified Buyer • 2 days ago</div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1 text-[#f2b500]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#4f4f4f]">
                    “Super impressed with the build quality and speed of delivery. Exceeded my expectations!”
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#e3ecf8] text-sm font-bold text-[#1f3f6d]">
                      NR
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-[#1f1f1f]">Nuwan Ranasinghe</div>
                      <div className="text-xs text-[#888]">Verified Buyer • 1 week ago</div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1 text-[#f2b500]">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star key={index} className="h-3.5 w-3.5 fill-current" />
                    ))}
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#4f4f4f]">
                    “Great value for money. Exactly as described. Lovelytech always delivers authentic products.”
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Similar Products Section */}
          <section className="mt-10">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[26px] font-black tracking-tight text-[#1b1b1b]">You Might Also Like</h2>
              <Link to="/products" className="flex items-center gap-1 text-sm font-semibold text-[#E4342F] hover:underline">
                View All Products
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {similarProducts.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/products/${item.id}`)}
                  className="group cursor-pointer rounded-[18px] border border-[#e8dad9] bg-white p-2.5 shadow-sm transition hover:-translate-y-1 hover:border-[#E4342F]/50 hover:shadow-md"
                >
                  <div className="relative mb-3 overflow-hidden rounded-[14px] bg-[#f5f5f5]">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/products/${item.id}`)
                        }}
                        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E4342F] shadow-sm transition hover:bg-[#E4342F] hover:text-white"
                        aria-label="View product"
                      >
                        <Heart className="h-4 w-4 fill-current" />
                      </button>
                    )}
                  </div>

                  <h3 className="mb-2 min-h-[44px] text-[14px] font-semibold leading-5 text-[#1f1f1f] transition group-hover:text-[#E4342F]">
                    <Link to={`/products/${item.id}`} onClick={(e) => e.stopPropagation()}>
                      {item.name}
                    </Link>
                  </h3>

                  <p className="text-[16px] font-bold text-[#E4342F]">{formatPrice(item.price)}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </Layout>
  )
}

function ZapIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M13 2 4 13h5l-1 9 9-11h-5l1-9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default ProductDetailsPage


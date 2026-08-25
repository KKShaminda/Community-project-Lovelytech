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
  AlertCircle,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import Layout from '../../components/layout/Layout'
import {
  formatPrice,
  resolveImageUrl,
  getCategoryFallbackImage,
} from '../../data/productsData'

import { getProductById, getProducts } from '../../services/productServices'
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

function ZapIcon() {
  return (
    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

export function ProductDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [product, setProduct] = useState(null)
  const [similarProducts, setSimilarProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
      setError('')

      try {
        const rawData = await getProductById(id)
        if (!isMounted) return

        if (!rawData) {
          setError('Product not found')
          setProduct(null)
          return
        }

        const category = rawData.category || 'Speakers & Audios'
        const defaultImg = getCategoryFallbackImage(category)

        const rawImages = Array.isArray(rawData.images) && rawData.images.length > 0
          ? rawData.images.map((img) => (typeof img === 'string' ? img : img.url || img.path))
          : [rawData.image || defaultImg]

        const resolvedImages = rawImages.map((img) => resolveImageUrl(img, category))

        const normalizedProduct = {
          ...rawData,
          id: rawData._id || rawData.id,
          image: resolvedImages[0] || defaultImg,
          images: resolvedImages.length > 0 ? resolvedImages : [defaultImg],
          availability:
            rawData.stock > 0
              ? 'In Stock'
              : rawData.availability || (rawData.stock === 0 ? 'Out of Stock' : 'In Stock'),
        }

        setProduct(normalizedProduct)
        setSelectedImage(resolvedImages[0] || defaultImg)
        setQuantity(1)

        // Fetch similar products in the same category asynchronously
        getProducts({ category: normalizedProduct.category, limit: 5 })
          .then((res) => {
            if (isMounted) {
              const list = (res?.products || [])
                .filter((p) => String(p._id || p.id) !== String(normalizedProduct.id))
                .slice(0, 4)
                .map((p) => ({
                  ...p,
                  id: p._id || p.id,
                  image: resolveImageUrl(
                    p.images?.[0]?.url || p.images?.[0]?.path || p.images?.[0] || p.image,
                    p.category
                  ),
                }))
              setSimilarProducts(list)
            }
          })
          .catch(() => {})
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load product details:', err)
          setError(err.message || 'Product not found')
          setProduct(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadProductData()

    return () => {
      isMounted = false
    }
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to your cart')
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    addToCart(product, quantity, { image: selectedImage || product.image })
    setAddedToCart(true)
    toast.success(`${product.name || 'Product'} (${quantity}) added to cart!`)
    setTimeout(() => setAddedToCart(false), 1600)
  }

  const handleBuyNow = () => {
    if (!product) return

    if (!isAuthenticated()) {
      toast.error('Please sign in to continue')
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    addToCart(product, quantity, { image: selectedImage || product.image })
    navigate('/payment')
  }

  const handleToggleWishlist = async () => {
    if (!product) return

    if (!isAuthenticated()) {
      toast.error('Please sign in to save items to your wishlist')
      navigate('/login', { state: { from: `/products/${product.id}` } })
      return
    }

    const nextState = !liked
    setLiked(nextState)
    await toggleWishlistProduct(product.id)
    if (nextState) {
      toast.success('Added to wishlist!')
    } else {
      toast('Removed from wishlist', { icon: '🗑️' })
    }
  }

  const handleAddSimilarToCart = (item) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to add items to your cart')
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    addToCart(item, 1)
    toast.success(`${item.name || 'Product'} added to cart!`)
  }

  const galleryImages = useMemo(() => {
    if (!product) return []
    if (product.images && product.images.length > 0) return product.images
    if (product.image) return [product.image]
    return [getCategoryFallbackImage(product.category)]
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

  if (error || !product) {
    return (
      <Layout>
        <main className="min-h-screen bg-[#f4f1ef] px-4 py-12">
          <div className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-[#E4342F]">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Product Not Found</h2>
            <p className="mt-2 text-sm text-gray-500">
              The product you are looking for does not exist or has been removed from the inventory.
            </p>
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

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Brand:</span>
              <span className="rounded-md bg-gray-200/70 px-2 py-0.5 text-xs font-bold text-gray-800">
                {product.brand || 'LovelyTech Authentic'}
              </span>
            </div>
          </div>

          {/* Top Main Product Showcase */}
          <section className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">

            {/* Left Column: Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-[20px] border border-[#e4d6d4] bg-[#eae5e3] shadow-inner">
                <img
                  src={selectedImage || product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition duration-300"
                  onError={(e) => {
                    const fb = getCategoryFallbackImage(product.category)
                    if (e.currentTarget.src !== fb) e.currentTarget.src = fb
                  }}
                />

                {discountPercent && (
                  <div className="absolute left-4 top-4 rounded-xl bg-[#E4342F] px-3 py-1.5 text-xs font-black tracking-wide text-white shadow-md">
                    {discountPercent}% OFF
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  aria-label="Toggle Wishlist"
                  className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm transition hover:bg-white active:scale-95"
                >
                  <Heart
                    className={`h-5 w-5 transition ${liked ? 'fill-[#E4342F] text-[#E4342F]' : 'text-gray-600'}`}
                  />
                </button>
              </div>

              {/* Thumbnails */}
              {galleryImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {galleryImages.map((imgUrl, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedImage(imgUrl)}
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[14px] border-2 transition ${
                        (selectedImage || product.image) === imgUrl
                          ? 'border-[#E4342F] ring-2 ring-[#E4342F]/20'
                          : 'border-[#dfd3d1] hover:border-gray-400'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumb ${index + 1}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const fb = getCategoryFallbackImage(product.category)
                          if (e.currentTarget.src !== fb) e.currentTarget.src = fb
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Details & Buy Actions */}
            <div className="flex flex-col justify-between space-y-6">
              <div>
                {/* Availability Tag */}
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-xs font-bold ${
                      product.stock > 0
                        ? 'border border-emerald-300 bg-emerald-100 text-emerald-800'
                        : 'border border-red-300 bg-red-100 text-red-800'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    {product.stock > 0 ? `In Stock (${product.stock} units available)` : 'Out of Stock'}
                  </span>
                  <span className="text-xs text-gray-500">• Category: {product.category}</span>
                </div>

                <h1 className="text-2xl font-black tracking-tight text-[#161616] sm:text-3xl lg:text-4xl">
                  {product.name}
                </h1>

                {/* Rating & Sold count */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <RatingStars rating={product.rating || 5} />
                  <span className="text-sm font-bold text-gray-800">{product.rating || 5}.0</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs font-semibold text-gray-600">
                    {product.sold || 0} Sold
                  </span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs font-semibold text-emerald-600">100% Genuine</span>
                </div>

                {/* Pricing Block */}
                <div className="mt-5 rounded-[16px] border border-[#e8dedc] bg-[#faecea] p-4">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#E4342F] sm:text-4xl">
                      {formatPrice(product.price)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-lg text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs font-medium text-[#7d3c39]">
                    Includes all local taxes & guaranteed standard store warranty.
                  </p>
                </div>

                {/* Attributes: Color & Category */}
                <div className="mt-5 space-y-3">
                  {product.color && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-20 font-semibold text-gray-600">Color:</span>
                      <span className="rounded-lg border border-gray-300 bg-white px-3 py-1 font-bold text-gray-900">
                        {product.color}
                      </span>
                    </div>
                  )}

                  {product.brand && (
                    <div className="flex items-center gap-3 text-sm">
                      <span className="w-20 font-semibold text-gray-600">Brand:</span>
                      <span className="font-semibold text-gray-800">{product.brand}</span>
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-semibold text-sm text-gray-700">Quantity:</span>
                  <div className="flex items-center rounded-xl border border-gray-300 bg-white p-1 shadow-sm">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[40px] text-center font-bold text-gray-900">{quantity}</span>
                    <button
                      type="button"
                      disabled={product.stock > 0 && quantity >= product.stock}
                      onClick={() => setQuantity((q) => q + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 transition hover:bg-gray-100 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    Total: <strong className="text-gray-800">{formatPrice(product.price * quantity)}</strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className={`flex flex-1 items-center justify-center gap-2 rounded-[14px] px-6 py-4 text-base font-bold shadow-md transition ${
                      addedToCart
                        ? 'bg-emerald-600 text-white'
                        : product.stock <= 0
                          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                          : 'bg-[#E4342F] text-white hover:bg-[#c92923] active:scale-[0.99]'
                    }`}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {addedToCart ? 'Added to Cart!' : product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={product.stock <= 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-[14px] border-2 border-[#E4342F] bg-white px-6 py-4 text-base font-bold text-[#E4342F] shadow-sm transition hover:bg-red-50 active:scale-[0.99] disabled:opacity-50"
                  >
                    Buy Now
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#e2d5d3]">
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100">
                    <Truck className="h-5 w-5 text-[#E4342F] mb-1" />
                    <span className="text-[11px] font-bold text-gray-800">Islandwide Shipping</span>
                    <span className="text-[10px] text-gray-500">Fast doorstep delivery</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100">
                    <ShieldCheck className="h-5 w-5 text-[#E4342F] mb-1" />
                    <span className="text-[11px] font-bold text-gray-800">Original Guarantee</span>
                    <span className="text-[10px] text-gray-500">100% genuine tech</span>
                  </div>
                  <div className="flex flex-col items-center text-center p-2 rounded-xl bg-white border border-gray-100">
                    <RotateCcw className="h-5 w-5 text-[#E4342F] mb-1" />
                    <span className="text-[11px] font-bold text-gray-800">Easy Returns</span>
                    <span className="text-[10px] text-gray-500">7-day replacement</span>
                  </div>
                </div>
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
                {product.description || 'Premium quality technology product curated by LovelyTech.'}
              </p>

              <div className="grid gap-4 md:grid-cols-2">
                {(product.features && product.features.length > 0
                  ? product.features
                  : [
                      { title: 'Premium Performance', desc: 'Optimized for high durability and consistent performance.' },
                      { title: 'Quality Certified', desc: 'Tested thoroughly to meet our top standard of reliability.' },
                    ]
                ).map((feat, index) => (
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
                  ★ {product.rating || 5}.0 / 5
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
          {similarProducts.length > 0 && (
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
                    <div className="relative mb-3 overflow-hidden rounded-[14px] bg-[#f2f2f2]">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          const fb = getCategoryFallbackImage(item.category)
                          if (e.currentTarget.src !== fb) e.currentTarget.src = fb
                        }}
                      />
                    </div>
                    <h3 className="mb-1.5 min-h-[44px] text-sm font-bold leading-5 text-[#1e1e1e] group-hover:text-[#E4342F] transition">
                      {item.name}
                    </h3>
                    <p className="mb-2 text-base font-extrabold text-[#E4342F]">
                      {formatPrice(item.price)}
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddSimilarToCart(item)
                      }}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#E4342F] py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#c92923]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" />
                      Add to Cart
                    </button>
                  </article>
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
    </Layout>
  )
}

export default ProductDetailsPage

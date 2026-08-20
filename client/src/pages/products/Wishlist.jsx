import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, Heart, Search, ShoppingCart, ArrowRight } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import Layout from '../../components/layout/Layout'
import { formatPrice, resolveImageUrl, getCategoryFallbackImage, FALLBACK_PRODUCT_IMAGE } from '../../data/productsData'


import {
  getWishlistProducts,
  toggleWishlistProduct,
  getWishlistIds,
} from '../../utils/wishlistStorage'
import { addToCart } from '../../utils/cartStorage'


function StarRating({ value = 5 }) {
  return (
    <div className="flex items-center gap-1 text-[#f2b400]">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < Math.round(value) ? 'text-[#f2b400]' : 'text-[#d1d5db]'}>
          ★
        </span>
      ))}
    </div>
  )
}

export function WishlistPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState(() => getWishlistProducts())
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [addedIds, setAddedIds] = useState({})

  // Listen to wishlist updates
  useEffect(() => {
    const syncWishlist = () => {
      setItems(getWishlistProducts())
    }
    window.addEventListener('wishlist-updated', syncWishlist)
    window.addEventListener('storage', syncWishlist)
    return () => {
      window.removeEventListener('wishlist-updated', syncWishlist)
      window.removeEventListener('storage', syncWishlist)
    }
  }, [])

  const handleRemove = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleWishlistProduct(id)
    setItems(getWishlistProducts())
  }

  const handleAddToCart = (id, e) => {
    e.preventDefault()
    e.stopPropagation()
    const product = items.find((item) => String(item.id) === String(id) || String(item._id) === String(id))
    if (product) {
      addToCart(product, 1)
    }
    setAddedIds((prev) => ({ ...prev, [id]: true }))
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [id]: false }))
    }, 1500)
  }



  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !searchTerm.trim() ||
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory
      return matchSearch && matchCategory
    })
  }, [items, searchTerm, selectedCategory])

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [items])

  return (
    <Layout>
      <main className="min-h-screen bg-[#f4f3f2] px-4 py-6 md:px-6 lg:px-8">
        <div className="mx-auto max-w-[1320px] rounded-[22px] bg-[#f8f4f3] px-3 py-4 shadow-[0_0_0_1px_rgba(0,0,0,0.02)] md:px-6 md:py-5">
          {/* Header */}
          <div className="mb-7 flex flex-col gap-3 border-b border-[#e8d9d7] pb-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-[#E4342F] bg-white text-[#E4342F] shadow-sm">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight text-[#E4342F]">Wishlist</h1>
                <p className="text-sm text-[#6d6d6d]">
                  {items.length === 1 ? '1 saved item' : `${items.length} saved items`} for later
                </p>
              </div>
            </div>

            <div className="flex items-center text-xs font-medium text-[#3c3c3c] md:text-sm">
              <Link to="/products" className="text-[#828282] transition hover:text-[#E4342F]">
                Products
              </Link>
              <span className="mx-2 text-[#999]">›</span>
              <span className="font-semibold text-[#3b3b3b]">Wishlist</span>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-8 flex flex-col gap-3 rounded-[20px] bg-[#f8eae9] p-3 md:flex-row md:items-center">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search Wishlist Products..."
                className="h-12 w-full rounded-[14px] border border-[#e7d2d2] bg-white px-4 pr-12 text-sm text-gray-700 placeholder:text-[#7e7e7e] outline-none transition focus:border-[#E4342F] focus:ring-1 focus:ring-[#E4342F]"
              />
              <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#E4342F]" />
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  type="button"
                  className={`rounded-[14px] px-4 py-2.5 text-sm font-semibold transition ${selectedCategory === cat
                      ? 'border border-[#E4342F] bg-[#E4342F] text-white shadow-sm'
                      : 'border border-[#E4342F]/30 bg-white text-[#E4342F] hover:border-[#E4342F]'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Empty State */}
          {filteredItems.length === 0 ? (
            <div className="my-12 rounded-[20px] border border-dashed border-[#e3cecb] bg-white py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fceeee] text-[#E4342F]">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">No products found in your wishlist</h3>
              <p className="mt-1 text-sm text-gray-500">
                {items.length === 0
                  ? "You haven't saved any products yet."
                  : 'No items match your search or filter.'}
              </p>
              <div className="mt-6">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#E4342F] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d12a2a]"
                >
                  Explore Products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Wishlist Products Grid */
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredItems.map((item) => (
                <article
                  key={item.id}
                  onClick={() => navigate(`/products/${item.id}`)}
                  className="group cursor-pointer rounded-[18px] border border-[#e7d8d8] bg-white p-2.5 shadow-[0_3px_10px_rgba(0,0,0,0.02)] transition hover:-translate-y-1 hover:border-[#E4342F]/50 hover:shadow-lg"
                >
                  <div className="relative mb-3 overflow-hidden rounded-[16px] bg-[#f2f2f2]">
                    <img
                      src={resolveImageUrl(item.image, item.category)}
                      alt={item.name}
                      className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                      onError={(event) => {
                        const fallback = getCategoryFallbackImage(item.category)
                        if (event.currentTarget.src !== fallback) {
                          event.currentTarget.src = fallback
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemove(item.id, e)}
                      title="Remove from wishlist"
                      aria-label="Remove from wishlist"
                      className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#E4342F] shadow-md transition hover:bg-[#E4342F] hover:text-white"
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </button>
                  </div>


                  <h3 className="mb-2 min-h-[48px] text-[15px] font-semibold leading-5 text-[#1f1f1f] transition group-hover:text-[#E4342F]">
                    <Link
                      to={`/products/${item.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:underline"
                    >
                      {item.name}
                    </Link>
                  </h3>

                  <div className="mb-2 flex items-center gap-2 text-[11px]">
                    <StarRating value={item.rating} />
                    <span className="text-[#666]">{item.sold} Sold</span>
                  </div>

                  <p className="mb-3 text-[17px] font-bold text-[#E4342F]">{formatPrice(item.price)}</p>

                  <button
                    type="button"
                    onClick={(e) => handleAddToCart(item.id, e)}
                    className={`flex w-full items-center justify-center gap-2 rounded-[12px] px-4 py-2.5 text-sm font-semibold text-white transition ${addedIds[item.id]
                        ? 'bg-emerald-600'
                        : 'bg-[#E4342F] hover:bg-[#d12a2a]'
                      }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {addedIds[item.id] ? 'Added to Cart!' : 'Add to Cart'}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </Layout>
  )
}

export default WishlistPage


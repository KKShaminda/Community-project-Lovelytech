import { useEffect, useState } from 'react'
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'
import {
  getProducts,
  getProductFacets,
  getCachedProducts,
  getCachedFacets,
} from '../../services/productServices'
import { getWishlistIds, toggleWishlistProduct } from '../../utils/wishlistStorage'
import { isAuthenticated } from '../../services/authServices'
import {
  categories as defaultCategories,
  ratingOptions as defaultRatings,
  resolveImageUrl,
  getCategoryFallbackImage,
} from '../../data/productsData'

const ITEMS_PER_PAGE = 9
const DEFAULT_PRICE_MAX = 600000

const normalizeProduct = (product) => {
  const category = product.category || 'Speakers & Audios'
  const rawImage =
    product.images?.[0]?.url ||
    product.images?.[0]?.path ||
    product.images?.[0] ||
    product.image ||
    getCategoryFallbackImage(category)

  return {
    ...product,
    id: product._id || product.id,
    image: resolveImageUrl(rawImage, category),
    availability:
      product.stock > 0
        ? 'In Stock'
        : product.availability || (product.stock === 0 ? 'Out of Stock' : 'In Stock'),
  }
}

function ProductGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
        <div
          key={index}
          className="rounded-xl border-t-4 border-red-200 bg-white p-2.5 shadow-sm animate-pulse"
        >
          <div className="mb-2.5 aspect-[4/3.2] overflow-hidden rounded-lg bg-gray-200" />
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
          <div className="mb-3 h-5 w-1/3 rounded bg-gray-200" />
          <div className="h-9 w-full rounded-lg bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

export function Products() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: true })
  const [userPriceRange, setUserPriceRange] = useState(null)
  const [maxPriceLimit, setMaxPriceLimit] = useState(DEFAULT_PRICE_MAX)
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds())
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())
  const [page, setPage] = useState(1)

  // Real database products only (from cache or empty initial state)
  const initialCache = getCachedProducts({ page: 1, limit: ITEMS_PER_PAGE, minPrice: 0 })

  const [products, setProducts] = useState(() => {
    if (initialCache?.products?.length) {
      return initialCache.products.map(normalizeProduct)
    }
    return []
  })

  const [totalPages, setTotalPages] = useState(() => initialCache?.pagination?.totalPages || 1)
  const [totalItems, setTotalItems] = useState(() => initialCache?.pagination?.totalItems || 0)

  const [facets, setFacets] = useState(() => {
    const cached = getCachedFacets()
    if (cached && (cached.categories?.length || cached.ratings?.length)) {
      return cached
    }
    return {
      categories: (defaultCategories || []).map((c) => ({ category: c.label, count: c.count || 0 })),
      ratings: (defaultRatings || []).map((r) => ({ rating: r.value, count: r.count || 0 })),
      priceRange: { min: 0, max: DEFAULT_PRICE_MAX },
    }
  })

  const [loading, setLoading] = useState(() => !initialCache?.products?.length)
  const [error, setError] = useState('')

  // Sync auth and wishlist events
  useEffect(() => {
    const handleWishlistUpdate = () => setWishlistIds(getWishlistIds())
    const handleAuthUpdate = () => setIsLoggedIn(isAuthenticated())

    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    window.addEventListener('auth-updated', handleAuthUpdate)
    window.addEventListener('storage', handleWishlistUpdate)
    window.addEventListener('storage', handleAuthUpdate)
    window.addEventListener('focus', handleAuthUpdate)
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate)
      window.removeEventListener('auth-updated', handleAuthUpdate)
      window.removeEventListener('storage', handleWishlistUpdate)
      window.removeEventListener('storage', handleAuthUpdate)
      window.removeEventListener('focus', handleAuthUpdate)
    }
  }, [])

  // Load facets from backend API once on mount in background
  const loadFacets = async () => {
    try {
      const response = await getProductFacets()
      const serverMax = response?.priceRange?.max || DEFAULT_PRICE_MAX

      setFacets({
        categories: response?.categories?.length ? response.categories : facets.categories,
        ratings: response?.ratings?.length ? response.ratings : facets.ratings,
        priceRange: response?.priceRange || { min: 0, max: DEFAULT_PRICE_MAX },
      })
      setMaxPriceLimit(serverMax)
    } catch (err) {
      console.warn('Using fallback facets:', err)
    }
  }

  useEffect(() => {
    loadFacets()
  }, [])

  // Fetch products from backend whenever user filters, search, sort or page changes
  useEffect(() => {
    let isCurrent = true

    const fetchProducts = async () => {
      const params = {
        page,
        limit: ITEMS_PER_PAGE,
        search: searchTerm.trim() || undefined,
        category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
        minPrice: 0,
        maxPrice: userPriceRange !== null ? userPriceRange : undefined,
        minRating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : undefined,
        inStock:
          availability.inStock && availability.outOfStock
            ? undefined
            : availability.inStock
              ? 'true'
              : 'false',
        sort: sortBy !== 'none' ? sortBy : undefined,
      }

      // Check cache first for immediate display
      const cached = getCachedProducts(params)
      if (cached?.products?.length) {
        setProducts(cached.products.map(normalizeProduct))
        setTotalPages(cached.pagination?.totalPages || 1)
        setTotalItems(cached.pagination?.totalItems || cached.products.length)
        setError('')
        setLoading(false)
      } else {
        setLoading(true)
      }

      try {
        const data = await getProducts(params)

        if (isCurrent && data) {
          const rawList = data?.products || []
          if (rawList.length > 0 || !searchTerm) {
            setProducts(rawList.map(normalizeProduct))
            setTotalPages(data?.pagination?.totalPages || 1)
            setTotalItems(data?.pagination?.totalItems || rawList.length)
            setError('')
          } else if (rawList.length === 0 && searchTerm) {
            setProducts([])
            setTotalPages(1)
            setTotalItems(0)
          }
        }
      } catch (err) {
        if (isCurrent) {
          console.warn('Error loading products:', err)
          if (products.length === 0) {
            setError(err.message || 'Failed to connect to the backend server.')
          }
        }
      } finally {
        if (isCurrent) {
          setLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isCurrent = false
    }
  }, [
    page,
    searchTerm,
    selectedCategories,
    selectedRatings,
    availability,
    userPriceRange,
    sortBy,
  ])

  const updateFilterAndResetPage = (updater) => {
    updater()
    setPage(1)
  }

  const toggleCategory = (category) =>
    updateFilterAndResetPage(() =>
      setSelectedCategories((current) =>
        current.includes(category)
          ? current.filter((item) => item !== category)
          : [...current, category],
      ),
    )

  const toggleRating = (value) =>
    updateFilterAndResetPage(() =>
      setSelectedRatings((current) =>
        current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
      ),
    )

  const toggleAvailability = (key) =>
    updateFilterAndResetPage(() =>
      setAvailability((prev) => ({ ...prev, [key]: !prev[key] })),
    )

  const toggleWishlist = (productId, product) => {
    if (!isAuthenticated()) {
      toast.error('Please sign in to save items to your wishlist')
      navigate('/login', { state: { from: '/products' } })
      return
    }

    const idStr = String(productId || product?.id || product?._id || '')
    const isCurrentlyWishlisted = wishlistIds.has(idStr)

    if (!isCurrentlyWishlisted) {
      toast.success('Added to wishlist!')
    } else {
      toast('Removed from wishlist', { icon: '🗑️' })
    }

    toggleWishlistProduct(productId, product).catch((err) => {
      console.error('Failed to toggle wishlist:', err)
    })
  }

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedRatings([])
    setAvailability({ inStock: true, outOfStock: true })
    setUserPriceRange(null)
    setSearchTerm('')
    setSortBy('none')
    setPage(1)
  }

  const categoryOptions = (facets.categories || []).map(({ category, count }) => ({
    label: category,
    count: count || 0,
  }))

  const ratingOptions = (facets.ratings || []).map(({ rating, count }) => ({
    value: rating,
    count: count || 0,
  }))

  const currentPriceRangeValue = userPriceRange !== null ? userPriceRange : maxPriceLimit

  return (
    <Layout>
      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          {/* Page Header */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={28} className="text-[#E4342F]" />
              <div>
                <h1 className="text-3xl font-bold text-[#E4342F]">Products</h1>
                <p className="text-gray-500">
                  Browse {totalItems > 0 ? `${totalItems} ` : ''}products directly from our inventory
                </p>
              </div>
            </div>

            <div className="w-full sm:w-[68%] lg:w-[80%]">
              <SearchSortBar
                searchTerm={searchTerm}
                onSearchChange={(value) => updateFilterAndResetPage(() => setSearchTerm(value))}
                sortBy={sortBy}
                onSortChange={setSortBy}
                wishlistCount={wishlistIds.size}
                showWishlist={isLoggedIn}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            {/* Filter Sidebar */}
            <FilterSidebar
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              priceRange={currentPriceRangeValue}
              maxPrice={maxPriceLimit}
              onPriceRangeChange={(value) => updateFilterAndResetPage(() => setUserPriceRange(value))}
              selectedRatings={selectedRatings}
              onToggleRating={toggleRating}
              availability={availability}
              onToggleAvailability={toggleAvailability}
              onClearAll={clearAll}
              categories={categoryOptions}
              ratingOptions={ratingOptions}
            />

            {/* Products Grid Content Area */}
            <div className="flex-1">
              {loading ? (
                <ProductGridSkeleton />
              ) : error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-[#E4342F] mb-2" />
                  <h3 className="text-lg font-bold text-gray-900">Unable to Fetch Products</h3>
                  <p className="mt-1 text-sm text-red-600">{error}</p>
                  <button
                    type="button"
                    onClick={() => {
                      loadFacets()
                      setPage(1)
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E4342F] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c92923]"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Connection
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
                  <p className="text-base font-semibold text-gray-700">No products found</p>
                  <p className="mt-1 text-sm text-gray-500">
                    No products match your current search or filter criteria.
                  </p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-4 rounded-xl bg-[#E4342F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#c92923]"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={products}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={toggleWishlist}
                    showWishlist={true}
                  />
                  <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  )
}

export default Products
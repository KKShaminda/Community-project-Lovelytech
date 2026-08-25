import { useEffect, useState } from 'react'
import { ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'
import { getProducts, getProductFacets } from '../../services/productServices'
import { getWishlistIds, toggleWishlistProduct } from '../../utils/wishlistStorage'
import { isAuthenticated } from '../../services/authServices'
import { resolveImageUrl, getCategoryFallbackImage } from '../../data/productsData'

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

export function Products() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: true })
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_MAX)
  const [maxPriceLimit, setMaxPriceLimit] = useState(DEFAULT_PRICE_MAX)
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds())
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [facets, setFacets] = useState({
    categories: [],
    ratings: [],
    priceRange: { min: 0, max: DEFAULT_PRICE_MAX },
  })
  const [loading, setLoading] = useState(true)
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

  // Load facets from backend API
  const loadFacets = async () => {
    try {
      const response = await getProductFacets()
      const serverMax = response?.priceRange?.max || DEFAULT_PRICE_MAX

      setFacets({
        categories: response?.categories || [],
        ratings: response?.ratings || [],
        priceRange: response?.priceRange || { min: 0, max: DEFAULT_PRICE_MAX },
      })
      setMaxPriceLimit(serverMax)
      setPriceRange((prev) => (prev === DEFAULT_PRICE_MAX ? serverMax : Math.min(prev, serverMax)))
    } catch (err) {
      console.error('Failed to load facets:', err)
    }
  }

  useEffect(() => {
    loadFacets()
  }, [])

  // Fetch products from backend whenever filters, search, sort or page changes
  useEffect(() => {
    let isCurrent = true

    const fetchProducts = async () => {
      setLoading(true)
      setError('')

      try {
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm.trim() || undefined,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          minPrice: 0,
          maxPrice: priceRange < maxPriceLimit ? priceRange : undefined,
          minRating: selectedRatings.length > 0 ? Math.min(...selectedRatings) : undefined,
          inStock:
            availability.inStock && availability.outOfStock
              ? undefined
              : availability.inStock
                ? 'true'
                : 'false',
          sort: sortBy !== 'none' ? sortBy : undefined,
        }

        const data = await getProducts(params)

        if (isCurrent) {
          const rawList = data?.products || []
          setProducts(rawList.map(normalizeProduct))
          setTotalPages(data?.pagination?.totalPages || 1)
          setTotalItems(data?.pagination?.totalItems || rawList.length)
        }
      } catch (err) {
        if (isCurrent) {
          console.error('Error loading products:', err)
          setError(err.message || 'Failed to connect to the backend server. Please make sure the server is running.')
          setProducts([])
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
    priceRange,
    maxPriceLimit,
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

  const toggleWishlist = (productId) => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: '/products' } })
      return
    }
    toggleWishlistProduct(productId)
    setWishlistIds(getWishlistIds())
  }

  const clearAll = () => {
    setSelectedCategories([])
    setSelectedRatings([])
    setAvailability({ inStock: true, outOfStock: true })
    setPriceRange(maxPriceLimit)
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
              priceRange={priceRange}
              maxPrice={maxPriceLimit}
              onPriceRangeChange={(value) => updateFilterAndResetPage(() => setPriceRange(value))}
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
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
                  <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E4342F] border-t-transparent mb-3" />
                  <p className="text-base font-semibold text-gray-700">Loading products from server...</p>
                  <p className="mt-1 text-sm text-gray-500">Connecting to LovelyTech API</p>
                </div>
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
                    showWishlist={isLoggedIn}
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
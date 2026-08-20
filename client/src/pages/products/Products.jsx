import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'
import { getProductFacets, getProducts } from '../../services/productServices'
import {
  productsData,
  categories as defaultCategories,
  ratingOptions as defaultRatingOptions,
  resolveImageUrl,
  FALLBACK_PRODUCT_IMAGE,
} from '../../data/productsData'
import { getWishlistIds, toggleWishlistProduct } from '../../utils/wishlistStorage'

const ITEMS_PER_PAGE = 9
const DEFAULT_PRICE_MAX = 600000

const normalizeProduct = (product) => {
  const primaryImage =
    product.images?.[0]?.url ||
    product.images?.[0]?.path ||
    product.images?.[0] ||
    product.image ||
    FALLBACK_PRODUCT_IMAGE

  return {
    ...product,
    id: product._id || product.id,
    image: resolveImageUrl(primaryImage),
    availability:
      product.stock > 0
        ? 'In Stock'
        : product.availability || (product.stock === 0 ? 'Out of Stock' : 'In Stock'),
  }
}

export function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: true })
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_MAX)
  const [maxPriceLimit, setMaxPriceLimit] = useState(DEFAULT_PRICE_MAX)
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds())
  const [page, setPage] = useState(1)

  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [facets, setFacets] = useState({
    categories: defaultCategories.map((c) => ({ category: c.label, count: c.count })),
    ratings: defaultRatingOptions.map((r) => ({ rating: r.value, count: r.count })),
    priceRange: { min: 0, max: DEFAULT_PRICE_MAX },
  })
  const [loading, setLoading] = useState(true)

  // Listen to wishlist updates across the app
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistIds(getWishlistIds())
    }
    window.addEventListener('wishlist-updated', handleWishlistUpdate)
    window.addEventListener('storage', handleWishlistUpdate)
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate)
      window.removeEventListener('storage', handleWishlistUpdate)
    }
  }, [])

  useEffect(() => {
    const loadFacets = async () => {
      try {
        const response = await getProductFacets()
        const maximumPrice = response?.priceRange?.max || DEFAULT_PRICE_MAX

        setFacets({
          categories:
            response?.categories && response.categories.length > 0
              ? response.categories
              : defaultCategories.map((c) => ({ category: c.label, count: c.count })),
          ratings:
            response?.ratings && response.ratings.length > 0
              ? response.ratings
              : defaultRatingOptions.map((r) => ({ rating: r.value, count: r.count })),
          priceRange: response?.priceRange || { min: 0, max: DEFAULT_PRICE_MAX },
        })
        setMaxPriceLimit(maximumPrice)
        setPriceRange(maximumPrice)
      } catch {
        // Fallback to default facets
        setFacets({
          categories: defaultCategories.map((c) => ({ category: c.label, count: c.count })),
          ratings: defaultRatingOptions.map((r) => ({ rating: r.value, count: r.count })),
          priceRange: { min: 0, max: DEFAULT_PRICE_MAX },
        })
      }
    }

    loadFacets()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)

      try {
        const params = {
          page,
          limit: ITEMS_PER_PAGE,
          search: searchTerm.trim() || undefined,
          category: selectedCategories.length > 0 ? selectedCategories.join(',') : undefined,
          maxPrice: Math.min(priceRange, maxPriceLimit),
          minPrice: 0,
          minRating:
            selectedRatings.length > 0 ? Math.min(...selectedRatings) : undefined,
          inStock:
            availability.inStock && availability.outOfStock
              ? undefined
              : availability.inStock
                ? 'true'
                : 'false',
          sort:
            sortBy === 'price-asc'
              ? 'Price: Low to High'
              : sortBy === 'price-desc'
                ? 'Price: High to Low'
                : sortBy === 'sold-desc'
                  ? 'Best Selling'
                  : undefined,
        }

        const response = await getProducts(params)
        if (response?.products && response.products.length > 0) {
          setProducts(response.products.map(normalizeProduct))
          setTotalPages(response?.pagination?.totalPages || 1)
          setLoading(false)
          return
        }
      } catch {
        // Continue to local catalog fallback below
      }

      // Local catalog filtering
      const filtered = productsData.filter((item) => {
        const matchSearch =
          !searchTerm.trim() ||
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.category && item.category.toLowerCase().includes(searchTerm.toLowerCase()))
        const matchCategory =
          selectedCategories.length === 0 || selectedCategories.includes(item.category)
        const matchRating =
          selectedRatings.length === 0 || selectedRatings.some((r) => item.rating >= r)
        const matchPrice = item.price <= priceRange
        const isStockOk =
          (availability.inStock && item.availability !== 'Out of Stock') ||
          (availability.outOfStock && item.availability === 'Out of Stock')

        return matchSearch && matchCategory && matchRating && matchPrice && isStockOk
      })

      const sorted = [...filtered].sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'sold-desc') return (b.sold || 0) - (a.sold || 0)
        return 0
      })

      const startIndex = (page - 1) * ITEMS_PER_PAGE
      const paginated = sorted.slice(startIndex, startIndex + ITEMS_PER_PAGE)

      setProducts(paginated.map(normalizeProduct))
      setTotalPages(Math.ceil(sorted.length / ITEMS_PER_PAGE) || 1)
      setLoading(false)
    }

    loadProducts()
  }, [availability, maxPriceLimit, page, priceRange, searchTerm, selectedCategories, selectedRatings, sortBy])

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

  const categoryOptions = facets.categories.map(({ category, count }) => ({
    label: category,
    count,
  }))
  const ratingOptions = facets.ratings.map(({ rating, count }) => ({
    value: rating,
    count,
  }))

  return (
    <Layout>
      <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-[1400px]">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={28} className="text-[#E4342F]" />
              <div>
                <h1 className="text-3xl font-bold text-[#E4342F]">Products</h1>
                <p className="text-gray-500">Browse your products</p>
              </div>
            </div>

            <div className="w-full sm:w-[68%] lg:w-[80%]">
              <SearchSortBar
                searchTerm={searchTerm}
                onSearchChange={(value) => updateFilterAndResetPage(() => setSearchTerm(value))}
                sortBy={sortBy}
                onSortChange={setSortBy}
                wishlistCount={wishlistIds.size}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <FilterSidebar
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              priceRange={Math.min(priceRange, maxPriceLimit)}
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

            <div className="flex-1">
              {loading ? (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-10 text-center text-gray-600">
                  Loading products...
                </div>
              ) : products.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-12 text-center text-gray-500">
                  <p className="text-base font-semibold text-gray-700">No products found</p>
                  <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
                  <button
                    type="button"
                    onClick={clearAll}
                    className="mt-4 rounded-xl bg-[#E4342F] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#c92923]"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <>
                  <ProductGrid
                    products={products}
                    wishlistIds={wishlistIds}
                    onToggleWishlist={toggleWishlist}
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
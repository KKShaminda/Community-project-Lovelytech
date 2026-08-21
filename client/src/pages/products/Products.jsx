import { useEffect, useState, useMemo } from 'react'
import { ShoppingBag } from 'lucide-react'

import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'
import {
  productsData,
  categories as defaultCategories,
  ratingOptions as defaultRatingOptions,
  resolveImageUrl,
  getCategoryFallbackImage,
} from '../../data/productsData'
import { getWishlistIds, toggleWishlistProduct } from '../../utils/wishlistStorage'
import { isAuthenticated } from '../../services/authServices'

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
    id: product.id || product._id,
    image: resolveImageUrl(rawImage, category),
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
  const [wishlistIds, setWishlistIds] = useState(() => getWishlistIds())
  const [isLoggedIn, setIsLoggedIn] = useState(() => isAuthenticated())
  const [page, setPage] = useState(1)

  // Listen to auth and wishlist updates across the app
  useEffect(() => {
    const handleWishlistUpdate = () => {
      setWishlistIds(getWishlistIds())
    }
    const handleAuthUpdate = () => {
      setIsLoggedIn(isAuthenticated())
    }
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

  // Calculate dynamic facet counts based on demo products
  const categoryOptions = useMemo(() => {
    return defaultCategories.map(({ label }) => {
      const count = productsData.filter((item) => item.category === label).length
      return { label, count }
    })
  }, [])

  const ratingOptions = useMemo(() => {
    return defaultRatingOptions.map(({ value }) => {
      const count = productsData.filter((item) => Math.round(item.rating) >= value).length
      return { value, count }
    })
  }, [])

  // Filter and sort products from the curated catalog
  const filteredProducts = useMemo(() => {
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

    return sorted.map(normalizeProduct)
  }, [searchTerm, selectedCategories, selectedRatings, priceRange, availability, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE) || 1
  const startIndex = (page - 1) * ITEMS_PER_PAGE
  const displayedProducts = filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE)

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
    setPriceRange(DEFAULT_PRICE_MAX)
    setSearchTerm('')
    setSortBy('none')
    setPage(1)
  }

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
                showWishlist={isLoggedIn}
              />
            </div>
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <FilterSidebar
              selectedCategories={selectedCategories}
              onToggleCategory={toggleCategory}
              priceRange={priceRange}
              maxPrice={DEFAULT_PRICE_MAX}
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
              {displayedProducts.length === 0 ? (
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
                    products={displayedProducts}
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
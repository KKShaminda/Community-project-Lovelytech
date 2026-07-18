import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'
import { getProductFacets, getProducts } from '../../services/productServices'

const ITEMS_PER_PAGE = 9
const DEFAULT_PRICE_MAX = 600000

const normalizeProduct = (product) => ({
  ...product,
  id: product._id || product.id,
  image: product.images?.[0]?.url || product.image || '/placeholder-product.png',
  availability: product.stock > 0 ? 'In Stock' : 'Out of Stock',
})

export function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: true })
  const [priceRange, setPriceRange] = useState(DEFAULT_PRICE_MAX)
  const [maxPriceLimit, setMaxPriceLimit] = useState(DEFAULT_PRICE_MAX)
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [page, setPage] = useState(1)
  
  const [products, setProducts] = useState([])
  const [totalPages, setTotalPages] = useState(1)
  const [facets, setFacets] = useState({
    categories: [],
    ratings: [],
    priceRange: { min: 0, max: DEFAULT_PRICE_MAX },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadFacets = async () => {
      try {
        const response = await getProductFacets()
        const maximumPrice = response?.priceRange?.max || DEFAULT_PRICE_MAX

        setFacets({
          categories: response?.categories || [],
          ratings: response?.ratings || [],
          priceRange: response?.priceRange || { min: 0, max: DEFAULT_PRICE_MAX },
        })
        setMaxPriceLimit(maximumPrice)
        // set priceRange to the server max so we don't accidentally filter out expensive products
        setPriceRange(maximumPrice)
      } catch (err) {
        setError(err.message || 'Unable to load product filters.')
      }
    }

    loadFacets()
  }, [])

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true)
      setError('')

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
        setProducts((response?.products || []).map(normalizeProduct))
        setTotalPages(response?.pagination?.totalPages || 1)
      } catch (err) {
        setError(err.message || 'Unable to load products.')
        setProducts([])
      } finally {
        setLoading(false)
      }
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
    setWishlistIds((prev) => {
      const next = new Set(prev)
      next.has(productId) ? next.delete(productId) : next.add(productId)
      return next
    })
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
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag size={28} className="text-[#E4342F]" />
              <div>
                <h1 className="text-3xl font-bold text-[#E4342F]">Products</h1>
                <p className="text-gray-500">Browse your products</p>
              </div>
            </div>

            <div className="w-full sm:w-[60%] lg:w-[77%]">
                <SearchSortBar
                  searchTerm={searchTerm}
                  onSearchChange={(value) => updateFilterAndResetPage(() => setSearchTerm(value))}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
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
              ) : error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center text-red-600">
                  {error}
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
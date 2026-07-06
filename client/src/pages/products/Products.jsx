import { useMemo, useState } from 'react'
import { ShoppingBag } from 'lucide-react'

import { productsData } from '../../data/productsData'
import { SearchSortBar } from '../../components/products/SearchSortBar'
import { FilterSidebar } from '../../components/products/FilterSidebar'
import { ProductGrid } from '../../components/products/ProductGrid'
import { Pagination } from '../../components/products/Pagination'
import Layout from '../../components/layout/Layout'

const ITEMS_PER_PAGE = 6

export function Products() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('none')
  const [selectedCategories, setSelectedCategories] = useState(['Mobile Phones'])
  const [selectedRatings, setSelectedRatings] = useState([])
  const [availability, setAvailability] = useState({ inStock: true, outOfStock: true })
  const [priceRange, setPriceRange] = useState(600000)
  const [wishlistIds, setWishlistIds] = useState(new Set())
  const [page, setPage] = useState(1)

  const filteredProducts = useMemo(() => {
    return productsData
      .filter((product) => {
        const query = searchTerm.trim().toLowerCase()
        const matchesSearch = product.name.toLowerCase().includes(query)
        const matchesCategory =
          selectedCategories.length === 0 || selectedCategories.includes(product.category)
        const matchesRating =
          selectedRatings.length === 0 ||
          selectedRatings.some((rating) => product.rating >= rating)
        const matchesAvailability =
          (product.availability === 'In Stock' && availability.inStock) ||
          (product.availability === 'Out of Stock' && availability.outOfStock)
        const matchesPrice = product.price <= priceRange

        return matchesSearch && matchesCategory && matchesRating && matchesAvailability && matchesPrice
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price
        if (sortBy === 'price-desc') return b.price - a.price
        if (sortBy === 'sold-desc') return b.sold - a.sold
        return 0
      })
  }, [searchTerm, selectedCategories, selectedRatings, availability, priceRange, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const pagedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  )

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
    setPriceRange(600000)
    setSearchTerm('')
    setSortBy('none')
    setPage(1)
  }

  return (
    <Layout>
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        {/* Page heading + search */}
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

        {/* Sidebar + grid */}
        <div className="flex flex-col gap-8 lg:flex-row">
          <FilterSidebar
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            priceRange={priceRange}
            onPriceRangeChange={(value) => updateFilterAndResetPage(() => setPriceRange(value))}
            selectedRatings={selectedRatings}
            onToggleRating={toggleRating}
            availability={availability}
            onToggleAvailability={toggleAvailability}
            onClearAll={clearAll}
          />

          <div className="flex-1">
            <ProductGrid
              products={pagedProducts}
              wishlistIds={wishlistIds}
              onToggleWishlist={toggleWishlist}
            />
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      </div>
    </main>
    </Layout>
  )
}
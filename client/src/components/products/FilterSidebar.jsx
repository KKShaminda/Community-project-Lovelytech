import { StarRating } from './StarRating'
import { categories, ratingOptions } from '../../data/productsData'

export function FilterSidebar({
  selectedCategories,
  onToggleCategory,
  priceRange,
  onPriceRangeChange,
  selectedRatings,
  onToggleRating,
  availability,
  onToggleAvailability,
  onClearAll,
}) {
  return (
    <aside className="w-full rounded-2xl border border-gray-200 bg-[#ec1c24] p-6 lg:w-72">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Filters</h2>
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-medium text-white hover:underline"
        >
          Clear All
        </button>
      </div>

      {/* Category */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="mb-3 font-semibold text-white">Category</h3>
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.label}>
              <label className="flex items-center gap-3 text-sm text-white">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.label)}
                  onChange={() => onToggleCategory(category.label)}
                  className="h-4 w-4 rounded  text-[#E4342F] focus:ring-[#E4342F]"
                />
                <span className="flex-1">{category.label}</span>
                <span className="text-xs text-gray-300">({category.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="mb-3 font-semibold text-white">Price Range</h3>
        <input
          type="range"
          min="0"
          max="600000"
          step="1000"
          value={priceRange}
          onChange={(event) => onPriceRangeChange(Number(event.target.value))}
          className="w-full accent-[#ffffff]"
        />
        <div className="mt-2 flex justify-between text-sm text-white">
          <span>LKR 0</span>
          <span>LKR {priceRange.toLocaleString()}</span>
        </div>
      </div>

      {/* Ratings */}
      <div className="mb-6 border-b border-gray-100 pb-6">
        <h3 className="mb-3 font-semibold text-white">Ratings</h3>
        <ul className="space-y-3">
          {ratingOptions.map((rating) => (
            <li key={rating.value}>
              <label className="flex items-center gap-3 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={selectedRatings.includes(rating.value)}
                  onChange={() => onToggleRating(rating.value)}
                  className="h-4 w-4 rounded border-gray-300 text-[#E4342F] focus:ring-[#E4342F]"
                />
                <StarRating rating={rating.value} size={14} />
                <span className="text-xs text-gray-300">({rating.count})</span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div>
        <h3 className="mb-3 font-semibold text-white">Availability</h3>
        <div className="space-y-3 text-sm text-white">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={availability.inStock}
              onChange={() => onToggleAvailability('inStock')}
              className="h-4 w-4 rounded text-[#E4342F] focus:ring-[#E4342F]"
            />
            In Stock
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={availability.outOfStock}
              onChange={() => onToggleAvailability('outOfStock')}
              className="h-4 w-4 rounded text-[#E4342F] focus:ring-[#E4342F]"
            />
            Out of Stock
          </label>
        </div>
      </div>
    </aside>
  )
}
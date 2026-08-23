import { Heart, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { sortOptions } from '../../data/productsData'

export function SearchSortBar({
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
  wishlistCount = 0,
  showWishlist = false,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-red-100 p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative flex-1">
        <Search
          size={18}
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search Products..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none transition focus:border-[#E4342F] focus:ring-2 focus:ring-[#E4342F]/20"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium text-gray-600 md:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-3 text-sm font-medium text-gray-800 outline-none transition focus:border-[#E4342F] focus:ring-2 focus:ring-[#E4342F]/20"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {showWishlist && (
          <Link
            to="/wishlist"
            id="searchbar-wishlist-button"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#E4342F] bg-[#E4342F] px-4 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:bg-[#c92923] hover:shadow"
            title="View Wishlist"
          >
            <Heart size={16} className="fill-current" />
            <span>Wishlist</span>
            {wishlistCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[11px] font-bold text-[#E4342F]">
                {wishlistCount}
              </span>
            )}
          </Link>
        )}
      </div>
    </div>
  )
}
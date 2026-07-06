import { Search } from 'lucide-react'
import { sortOptions } from '../../data/productsData'

export function SearchSortBar({ searchTerm, onSearchChange, sortBy, onSortChange }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-red-100 p-4 sm:flex-row sm:items-center sm:justify-between">
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
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-[#E4342F]/30"
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600">Sort by:</span>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value)}
          className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 outline-none focus:ring-2 focus:ring-[#E4342F]/30"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
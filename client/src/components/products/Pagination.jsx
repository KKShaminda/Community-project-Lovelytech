import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null

  const pages = []
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 disabled:opacity-40"
      >
        <ChevronLeft size={16} />
      </button>

      {pages.map((p, idx) =>
        p === '...' ? (
          <span key={`gap-${idx}`} className="px-2 text-gray-400">
            ...
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium ${
              p === page
                ? 'border-[#E4342F] bg-[#E4342F] text-white'
                : 'border-gray-300 text-gray-700 hover:border-[#E4342F]'
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className="flex h-9 w-9 items-center justify-center rounded-md border border-gray-300 text-gray-600 disabled:opacity-40"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
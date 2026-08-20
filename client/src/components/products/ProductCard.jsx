import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { StarRating } from './StarRating'
import { formatPrice } from '../../data/productsData'

const FALLBACK_PRODUCT_IMAGE = '/placeholder-product.svg'

export function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  const [justAdded, setJustAdded] = useState(false)
  const outOfStock = product.availability === 'Out of Stock'

  const handleAddToCart = () => {
    if (outOfStock) return
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="rounded-xl border-t-4 border-red-600 bg-white p-2.5 shadow-sm transition hover:shadow-md">
      <div className="relative mb-2.5 aspect-[4/3.2] overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(event) => {
            if (event.currentTarget.src.endsWith(FALLBACK_PRODUCT_IMAGE)) return
            event.currentTarget.src = FALLBACK_PRODUCT_IMAGE
          }}
        />
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${isWishlisted ? 'border-white bg-[#E4342F]' : 'border-[#E4342F] bg-white'
            }`}
        >
          <Heart size={14} className={isWishlisted ? 'text-white' : 'text-[#E4342F]'} />
        </button>
      </div>

      <h3 className="mb-1 line-clamp-2 min-h-[2.4rem] text-xs font-semibold text-gray-900">
        {product.name}
      </h3>

      <div className="mb-2 flex items-center gap-2">
        <StarRating rating={product.rating} />
        <span className="text-[11px] text-gray-500">{product.sold} Sold</span>
      </div>

      <p className="mb-2 text-lg font-bold text-[#E4342F]">{formatPrice(product.price)}</p>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E4342F] py-2 text-sm font-semibold text-white transition hover:bg-[#c92923] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShoppingCart size={14} />
        {outOfStock ? 'Out of Stock' : justAdded ? 'Added!' : 'Add to Cart'}
      </button>
    </article>
  )
}
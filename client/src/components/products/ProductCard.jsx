import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { StarRating } from './StarRating'
import { formatPrice } from '../../data/productsData'

export function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  const [justAdded, setJustAdded] = useState(false)
  const outOfStock = product.availability === 'Out of Stock'

  const handleAddToCart = () => {
    if (outOfStock) return
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1200)
  }

  return (
    <article className="rounded-xl border-t-4 border-red-600 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="relative mb-4 aspect-square overflow-hidden rounded-lg bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
          <button
            type="button"
            onClick={() => onToggleWishlist(product.id)}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
              isWishlisted ? 'bg-[#E4342F] border-white' : 'bg-white border-[#E4342F]'
            }`}
          >
            <Heart size={16} className={isWishlisted ? 'text-white' : 'text-[#E4342F]'} />
          </button>
      </div>

      <h3 className="mb-1 line-clamp-2 min-h-[2.75rem] text-sm font-semibold text-gray-900">
        {product.name}
      </h3>

      <div className="mb-2 flex items-center gap-2">
        <StarRating rating={product.rating} />
        <span className="text-xs text-gray-500">{product.sold} Sold</span>
      </div>

      <p className="mb-3 text-xl font-bold text-[#E4342F]">{formatPrice(product.price)}</p>

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={outOfStock}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#E4342F] py-2.5 text-sm font-semibold text-white transition hover:bg-[#c92923] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <ShoppingCart size={16} />
        {outOfStock ? 'Out of Stock' : justAdded ? 'Added!' : 'Add to Cart'}
      </button>
    </article>
  )
}
import { useState } from 'react'
import { Heart, ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { StarRating } from './StarRating'
import {
  formatPrice,
  resolveImageUrl,
  getCategoryFallbackImage,
} from '../../data/productsData'
import { addToCart } from '../../utils/cartStorage'

export function ProductCard({ product, isWishlisted, onToggleWishlist }) {
  const [justAdded, setJustAdded] = useState(false)
  const outOfStock = product.availability === 'Out of Stock'
  const productId = product.id || product._id
  const fallbackImage = getCategoryFallbackImage(product.category)
  const imageUrl = resolveImageUrl(product.image || product.images?.[0], product.category)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (outOfStock) return
    addToCart(product, 1)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  const handleHeartClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (onToggleWishlist) {
      onToggleWishlist(productId, product)
    }
  }

  return (
    <article className="group rounded-xl border-t-4 border-red-600 bg-white p-2.5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md">
      <div className="relative mb-2.5 aspect-[4/3.2] overflow-hidden rounded-lg bg-gray-50">
        <Link to={`/products/${productId}`} className="block h-full w-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(event) => {
              if (event.currentTarget.src !== fallbackImage) {
                event.currentTarget.src = fallbackImage
              }
            }}
          />
        </Link>
        <button
          type="button"
          onClick={handleHeartClick}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full border shadow-sm transition duration-150 active:scale-95 ${
            isWishlisted
              ? 'border-[#E4342F] bg-[#E4342F] text-white ring-2 ring-red-200'
              : 'border-[#E4342F]/40 bg-white text-[#E4342F] hover:border-[#E4342F] hover:bg-red-50'
          }`}
        >
          <Heart size={14} className={isWishlisted ? 'fill-current text-white' : 'text-[#E4342F]'} />
        </button>
      </div>

      <h3 className="mb-1 line-clamp-2 min-h-[2.4rem] text-xs font-semibold text-gray-900 transition-colors group-hover:text-[#E4342F]">
        <Link to={`/products/${productId}`}>{product.name}</Link>
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
        className={`flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold text-white transition ${
          justAdded
            ? 'bg-emerald-600'
            : 'bg-[#E4342F] hover:bg-[#c92923] disabled:cursor-not-allowed disabled:opacity-60'
        }`}
      >
        <ShoppingCart size={14} />
        {outOfStock ? 'Out of Stock' : justAdded ? 'Added!' : 'Add to Cart'}
      </button>
    </article>
  )
}
export default ProductCard

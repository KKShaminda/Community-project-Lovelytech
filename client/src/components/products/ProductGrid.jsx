import { ProductCard } from './ProductCard'

export function ProductGrid({ products, wishlistIds, onToggleWishlist }) {
  if (products.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-600">
        No products match your filter selections.
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.has(product.id)}
          onToggleWishlist={onToggleWishlist}
        />
      ))}
    </div>
  )
}
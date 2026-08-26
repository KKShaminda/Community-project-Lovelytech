const CART_STORAGE_KEY = 'lovelytech_cart_items'

export const getCartItems = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) {
      return []
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch {
    return []
  }
}

export const saveCartItems = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }))
  } catch (err) {
    console.error('Error saving cart items:', err)
  }
}

export const addToCart = (product, quantity = 1, options = {}) => {
  if (!product) return getCartItems()

  const productId = product.id || product._id
  const currentItems = getCartItems()
  const existingIndex = currentItems.findIndex(
    (item) => String(item.id) === String(productId)
  )

  let updatedItems

  if (existingIndex > -1) {
    // Increase quantity of existing item
    updatedItems = currentItems.map((item, idx) => {
      if (idx === existingIndex) {
        return {
          ...item,
          quantity: item.quantity + (Number(quantity) || 1),
        }
      }
      return item
    })
  } else {
    // Add new item to cart
    const newItem = {
      id: productId,
      name: product.name || 'Product',
      price: Number(product.price) || 0,
      originalPrice: Number(product.originalPrice) || Math.round((Number(product.price) || 0) * 1.15),
      category: product.category || 'Accessories',
      color: options.color || product.color || 'Standard',
      size: options.size || product.size || 'Standard',
      quantity: Math.max(1, Number(quantity) || 1),
      stock: product.stock !== undefined ? product.stock : 20,
      availability: product.availability || (product.stock > 0 ? 'In Stock' : 'In Stock'),
      image:
        options.image ||
        (Array.isArray(product.images) && product.images.length > 0
          ? typeof product.images[0] === 'string'
            ? product.images[0]
            : product.images[0].url || product.images[0].path
          : product.image || '/placeholder-product.svg'),
    }
    updatedItems = [newItem, ...currentItems]
  }

  saveCartItems(updatedItems)
  return updatedItems
}

export const updateCartQuantity = (productId, newQuantity) => {
  const currentItems = getCartItems()
  const qty = Number(newQuantity)

  if (qty <= 0) {
    return removeFromCart(productId)
  }

  const updatedItems = currentItems.map((item) => {
    if (String(item.id) === String(productId)) {
      return { ...item, quantity: qty }
    }
    return item
  })

  saveCartItems(updatedItems)
  return updatedItems
}

export const removeFromCart = (productId) => {
  const currentItems = getCartItems()
  const updatedItems = currentItems.filter(
    (item) => String(item.id) !== String(productId)
  )
  saveCartItems(updatedItems)
  return updatedItems
}

export const clearCart = () => {
  saveCartItems([])
  return []
}

export const getCartCount = () => {
  const items = getCartItems()
  return items.reduce((total, item) => total + (item.quantity || 1), 0)
}

import { productsData } from '../data/productsData'

const CART_STORAGE_KEY = 'lovelytech_cart_items'

// Default cart items matching the demo design
const DEFAULT_CART_ITEMS = [
  {
    id: 1,
    name: 'Premium Wireless Bluetooth Headphones',
    price: 2400,
    originalPrice: 8950,
    category: 'Speaker & Audios',
    color: 'Black',
    size: 'Standard',
    quantity: 1,
    stock: 19,
    availability: 'In Stock',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 5,
    name: 'RGB Mechanical Gaming Keyboard',
    price: 6650,
    originalPrice: 7800,
    category: 'Desktop & Accessories',
    color: 'Black',
    size: 'Standard',
    quantity: 1,
    stock: 18,
    availability: 'In Stock',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 3,
    name: '20,000mAh Portable Power Bank - Fast Charger',
    price: 12400,
    originalPrice: 14500,
    category: 'Speaker & Audios',
    color: 'Metallic',
    size: 'Standard',
    quantity: 2,
    stock: 25,
    availability: 'In Stock',
    image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80',
  },
]

export const getCartItems = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(DEFAULT_CART_ITEMS))
      return DEFAULT_CART_ITEMS
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return DEFAULT_CART_ITEMS
  } catch {
    return DEFAULT_CART_ITEMS
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
      originalPrice: Number(product.originalPrice) || Math.round((Number(product.price) || 0) * 1.2),
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

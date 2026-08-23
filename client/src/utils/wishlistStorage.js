import { productsData } from '../data/productsData'

const WISHLIST_STORAGE_KEY = 'lovelytech_wishlist_ids'
const DEFAULT_WISHLIST_IDS = [1, 3, 5, 6, 8, 11, 12, 13]

export const getWishlistIds = () => {
  try {
    const stored = localStorage.getItem(WISHLIST_STORAGE_KEY)
    if (!stored) {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(DEFAULT_WISHLIST_IDS))
      return new Set(DEFAULT_WISHLIST_IDS.map(String))
    }
    const parsed = JSON.parse(stored)
    if (Array.isArray(parsed)) {
      return new Set(parsed.map(String))
    }
    return new Set(DEFAULT_WISHLIST_IDS.map(String))
  } catch {
    return new Set(DEFAULT_WISHLIST_IDS.map(String))
  }
}

export const saveWishlistIds = (idSet) => {
  try {
    const arr = Array.from(idSet).map((id) => (isNaN(Number(id)) ? id : Number(id)))
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(arr))
    window.dispatchEvent(new CustomEvent('wishlist-updated', { detail: arr }))
  } catch (err) {
    console.error('Error saving wishlist:', err)
  }
}

export const isProductWishlisted = (productId) => {
  if (!productId) return false
  const ids = getWishlistIds()
  return ids.has(String(productId))
}

export const toggleWishlistProduct = (productId) => {
  if (!productId) return false
  const ids = getWishlistIds()
  const idStr = String(productId)
  let isAdded = false

  if (ids.has(idStr)) {
    ids.delete(idStr)
    isAdded = false
  } else {
    ids.add(idStr)
    isAdded = true
  }

  saveWishlistIds(ids)
  return isAdded
}

export const getWishlistProducts = () => {
  const ids = getWishlistIds()
  return productsData.filter((item) => ids.has(String(item.id)) || ids.has(String(item._id)))
}

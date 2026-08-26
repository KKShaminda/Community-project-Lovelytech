export const productsData = []

export const categories = [
  { label: 'Mobile Phones', count: 0 },
  { label: 'Laptops', count: 0 },
  { label: 'Desktops', count: 0 },
  { label: 'iPads & Tablets', count: 0 },
  { label: 'Speakers & Audios', count: 0 },
]

export const ratingOptions = [
  { value: 5, count: 0 },
  { value: 4, count: 0 },
  { value: 3, count: 0 },
]

export const sortOptions = [
  { label: 'None', value: 'none' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Best Selling', value: 'sold-desc' },
  { label: 'Top Rated', value: 'rating-desc' },
]

export const formatPrice = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`

const RAW_API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()
export const API_BASE_URL = RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/i, '')
export const FALLBACK_PRODUCT_IMAGE = '/placeholder-product.svg'

export const CATEGORY_FALLBACK_IMAGES = {
  'Mobile Phones': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=900&q=80',
  'Laptops': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80',
  'Desktops': 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
  'iPads & Tablets': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=900&q=80',
  'Speakers & Audios': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
}

export const getCategoryFallbackImage = (category) => {
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.default
}

export const resolveImageUrl = (img, category = '') => {
  if (!img) return getCategoryFallbackImage(category)
  const rawUrl = typeof img === 'string' ? img : (img?.url || img?.path || '')
  if (!rawUrl || typeof rawUrl !== 'string') return getCategoryFallbackImage(category)
  const trimmed = rawUrl.trim()
  if (!trimmed || trimmed === '/placeholder-product.png' || trimmed === '/placeholder-product.svg') {
    return getCategoryFallbackImage(category)
  }

  // External HTTPS or Data URLs
  if (trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed
  }

  // Local uploads path: route through configured API_BASE_URL
  if (trimmed.includes('/uploads/')) {
    const relativeUpload = trimmed.substring(trimmed.indexOf('/uploads/'))
    return `${API_BASE_URL}${relativeUpload}`
  }

  if (trimmed.startsWith('http://')) {
    return trimmed
  }

  if (trimmed.startsWith('/')) {
    if (trimmed.startsWith('/src/assets/')) {
      return trimmed
    }
    return `${API_BASE_URL}${trimmed}`
  }

  return `${API_BASE_URL}/${trimmed}`
}

export const getMockProductById = (id) => null

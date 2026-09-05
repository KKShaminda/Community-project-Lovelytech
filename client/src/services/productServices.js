const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : `/${value}`)

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''))
const API_URL = `${normalizedBaseUrl}/api/products`

const parseResponse = async (response) => {
  const text = await response.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || sessionStorage.getItem('token')) : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    credentials: 'include',
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return data
}

const requestFormData = async (url, formData, method) => {
  const response = await fetch(url, {
    method,
    headers: {
      ...getAuthHeaders(),
    },
    body: formData,
    credentials: 'include',
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return data
}

const productCache = new Map()
const FACETS_CACHE_KEY = '__PRODUCT_FACETS_CACHE__'

const getCacheKey = (endpoint, params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })
  const qs = query.toString()
  return `${endpoint}${qs ? `?${qs}` : ''}`
}

export const getCachedProducts = (params = {}) => {
  const key = getCacheKey('/api/products', params)
  if (productCache.has(key)) {
    return productCache.get(key)
  }
  try {
    const stored = sessionStorage.getItem(`cache_${key}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      productCache.set(key, parsed)
      return parsed
    }
  } catch {}
  return null
}

export const setCachedProducts = (params = {}, data) => {
  const key = getCacheKey('/api/products', params)
  productCache.set(key, data)
  try {
    sessionStorage.setItem(`cache_${key}`, JSON.stringify(data))
  } catch {}
}

export const getCachedFacets = () => {
  if (productCache.has(FACETS_CACHE_KEY)) {
    return productCache.get(FACETS_CACHE_KEY)
  }
  try {
    const stored = sessionStorage.getItem(`cache_${FACETS_CACHE_KEY}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      productCache.set(FACETS_CACHE_KEY, parsed)
      return parsed
    }
  } catch {}
  return null
}

export const setCachedFacets = (data) => {
  productCache.set(FACETS_CACHE_KEY, data)
  try {
    sessionStorage.setItem(`cache_${FACETS_CACHE_KEY}`, JSON.stringify(data))
  } catch {}
}

const singleProductCache = new Map()

export const getCachedProductById = (productId) => {
  if (!productId) return null
  const key = String(productId)
  if (singleProductCache.has(key)) {
    return singleProductCache.get(key)
  }
  try {
    const stored = sessionStorage.getItem(`cache_product_${key}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      singleProductCache.set(key, parsed)
      return parsed
    }
  } catch {}
  return null
}

export const setCachedProductById = (productId, data) => {
  if (!productId || !data) return
  const key = String(productId)
  singleProductCache.set(key, data)
  try {
    sessionStorage.setItem(`cache_product_${key}`, JSON.stringify(data))
  } catch {}
}

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })

  const queryString = query.toString()
  const endpoint = `${API_URL}${queryString ? `?${queryString}` : ''}`
  
  const data = await request(endpoint, { method: 'GET' })
  if (data && (Array.isArray(data.products) || Array.isArray(data))) {
    setCachedProducts(params, data)
    const list = Array.isArray(data.products) ? data.products : data
    list.forEach((prod) => {
      if (prod._id) setCachedProductById(prod._id, prod)
      if (prod.id) setCachedProductById(prod.id, prod)
    })
  }
  return data
}

export const getProductFacets = async (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })

  const queryString = query.toString()
  const endpoint = `${API_URL}/facets${queryString ? `?${queryString}` : ''}`
  
  const data = await request(endpoint, { method: 'GET' })
  if (data) {
    setCachedFacets(data)
  }
  return data
}

export const prefetchProducts = async (params = { page: 1, limit: 9 }) => {
  try {
    const cached = getCachedProducts(params)
    if (!cached) {
      getProducts(params).catch(() => {})
      getProductFacets().catch(() => {})
    }
  } catch {}
}

export const getProductById = async (productId) => {
  if (!productId) return null
  const cached = getCachedProductById(productId)
  if (cached) {
    // Return cached immediately and refresh in background
    request(`${API_URL}/${productId}`, { method: 'GET' })
      .then((data) => {
        if (data) setCachedProductById(productId, data)
      })
      .catch(() => {})
    return cached
  }

  const data = await request(`${API_URL}/${productId}`, { method: 'GET' })
  if (data) {
    setCachedProductById(productId, data)
    if (data._id) setCachedProductById(data._id, data)
    if (data.id) setCachedProductById(data.id, data)
  }
  return data
}

export const createProduct = async (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file))
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
      return
    }

    formData.append(key, value)
  })

  return requestFormData(API_URL, formData, 'POST')
}

export const updateProduct = async (productId, payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file))
      return
    }

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
      return
    }

    formData.append(key, value)
  })

  return requestFormData(`${API_URL}/${productId}`, formData, 'PUT')
}

export const deleteProduct = async (productId) => {
  return request(`${API_URL}/${productId}`, { method: 'DELETE' })
}

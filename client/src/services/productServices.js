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

const request = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

export const getProducts = async (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })

  const queryString = query.toString()
  return request(`${API_URL}${queryString ? `?${queryString}` : ''}`, { method: 'GET' })
}

export const getProductFacets = async (params = {}) => {
  const query = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    query.append(key, String(value))
  })

  const queryString = query.toString()
  return request(`${API_URL}/facets${queryString ? `?${queryString}` : ''}`, { method: 'GET' })
}

export const getProductById = async (productId) => {
  return request(`${API_URL}/${productId}`, { method: 'GET' })
}

export const createProduct = async (payload) => {
  const formData = new FormData()

  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return

    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file))
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

    formData.append(key, value)
  })

  return requestFormData(`${API_URL}/${productId}`, formData, 'PUT')
}

export const deleteProduct = async (productId) => {
  return request(`${API_URL}/${productId}`, { method: 'DELETE' })
}

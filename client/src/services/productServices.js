<<<<<<< HEAD
import { buildUrl, request, requestFormData } from './api.js'

const API_URL = buildUrl('/products')

const toQuery = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, String(value))
    }
  })
  return query.toString()
}

export const getProducts = async (params = {}) => {
  const qs = toQuery(params)
  return request(`${API_URL}${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export const getProductFacets = async (params = {}) => {
  const qs = toQuery(params)
  return request(`${API_URL}/facets${qs ? `?${qs}` : ''}`, { method: 'GET' })
}

export const getProductById = async (productId) =>
  request(`${API_URL}/${productId}`, { method: 'GET' })

const payloadToFormData = (payload) => {
  const formData = new FormData()
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file))
      return
    }
    formData.append(key, value)
  })
  return formData
}

export const createProduct = async (payload) =>
  requestFormData(API_URL, payloadToFormData(payload), 'POST')

export const updateProduct = async (productId, payload) =>
  requestFormData(`${API_URL}/${productId}`, payloadToFormData(payload), 'PUT')

export const deleteProduct = async (productId) =>
  request(`${API_URL}/${productId}`, { method: 'DELETE' })
=======
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
>>>>>>> 20501282b1f059e730b954eec24bf8e68882c0d0

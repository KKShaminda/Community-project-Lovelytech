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

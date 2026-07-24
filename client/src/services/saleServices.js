const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : `/${value}`)

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''))
const apiPrefix = ensureLeadingSlash((import.meta.env.VITE_API_PREFIX || '/api/sales').trim())
const API_URL = `${normalizedBaseUrl}${apiPrefix}`

const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

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

export const getSales = async () => request(API_URL, { method: 'GET' })

export const createSale = async (payload) =>
  request(API_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateSale = async (saleId, payload) =>
  request(`${API_URL}/${saleId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const deleteSale = async (saleId) => request(`${API_URL}/${saleId}`, { method: 'DELETE' })
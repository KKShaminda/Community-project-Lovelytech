const normalizeUrlPart = (value = '') => value.replace(/\/+$/, '')
const ensureLeadingSlash = (value = '') => (value.startsWith('/') ? value : `/${value}`)

const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()
const normalizedBaseUrl = normalizeUrlPart(rawBaseUrl.replace(/\/api$/i, ''))
const apiPrefix = ensureLeadingSlash((import.meta.env.VITE_API_PREFIX || '/api/users').trim())
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

export const getAllUsers = async () => request(API_URL, { method: 'GET' })

export const suspendUser = async (userId) => request(`${API_URL}/${userId}/suspend`, { method: 'PATCH' })

export const unsuspendUser = async (userId) => request(`${API_URL}/${userId}/unsuspend`, { method: 'PATCH' })
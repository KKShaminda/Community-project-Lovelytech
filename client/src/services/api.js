/**
 * Shared API utility for all service files.
 *
 * Single source of truth for:
 *  - Base URL construction (reads from VITE_API_BASE_URL env var)
 *  - Auth header generation (Bearer token from localStorage / sessionStorage)
 *  - Unified fetch wrappers: request() and requestFormData()
 */

// ── Base URL ────────────────────────────────────────────────────────────────────
// Env var should be just the host, e.g. http://localhost:5000
// The /api prefix is appended per-service via buildUrl()

const rawBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000').trim()
export const BASE_URL = rawBase.replace(/\/+$/, '') // strip trailing slashes

/**
 * Build a full API URL for a given resource path.
 * @param {string} path - e.g. '/users/login'  or  '/products'
 * @returns {string} Full URL, e.g. 'http://localhost:5000/api/users/login'
 */
export const buildUrl = (path) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${BASE_URL}/api${cleanPath}`
}

// ── Auth helpers ────────────────────────────────────────────────────────────────

export const getToken = () =>
  localStorage.getItem('token') || sessionStorage.getItem('token') || null

export const getAuthHeaders = () => {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

/** Only the Authorization header — use for FormData requests where Content-Type must not be set. */
export const getAuthOnlyHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Response parsing ────────────────────────────────────────────────────────────

export const parseResponse = async (response) => {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

// ── Fetch wrappers ──────────────────────────────────────────────────────────────

/**
 * JSON request wrapper — automatically attaches auth headers.
 */
export const request = async (url, options = {}) => {
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

/**
 * FormData request wrapper — omits Content-Type so browser sets multipart boundary.
 */
export const requestFormData = async (url, formData, method = 'POST') => {
  const response = await fetch(url, {
    method,
    body: formData,
    headers: { ...getAuthOnlyHeaders() },
    credentials: 'include',
  })

  const data = await parseResponse(response)

  if (!response.ok) {
    const message = data?.message || data?.error || response.statusText || 'Request failed'
    throw new Error(message)
  }

  return data
}
